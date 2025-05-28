import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserType } from '@/lib/supabase';

const formSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  userType: z.enum(['admin', 'agronomist', 'technician', 'farmer'] as const),
});

type FormData = z.infer<typeof formSchema>;

interface SignupFormProps {
  onSignupSuccess: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSignupSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userType: 'farmer',
    }
  });

  const selectedUserType = watch('userType');

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      console.log('Iniciando cadastro com:', { email: data.email, userType: data.userType });
      
      // Cadastrar usuário sem exigir confirmação de email
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            userType: data.userType,
          },
        }
      });

      if (error) throw error;
      
      console.log('Resposta do cadastro:', authData);
      
      // Fazer login automático
      if (authData?.user) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        
        if (loginError) {
          console.error('Erro ao fazer login automático:', loginError);
        }
      }
      
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Você já está logado no sistema.',
      });
      
      onSignupSuccess();
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast({
        variant: 'destructive',
        title: 'Falha ao criar conta',
        description: error.message || 'Ocorreu um erro ao criar sua conta.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserTypeChange = (value: string) => {
    setValue('userType', value as UserType);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/90 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-green-800">Criar Conta</CardTitle>
        <CardDescription className="text-center">
          Crie uma nova conta para acessar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="******"
              {...register('password')}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="userType">Tipo de Usuário</Label>
            <Select
              value={selectedUserType}
              onValueChange={handleUserTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="farmer">Produtor Rural</SelectItem>
                <SelectItem value="technician">Técnico Agrícola</SelectItem>
                <SelectItem value="agronomist">Agrônomo</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
            {errors.userType && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.userType.message}
              </p>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          Já tem uma conta? Faça login.
        </p>
      </CardFooter>
    </Card>
  );
}; 