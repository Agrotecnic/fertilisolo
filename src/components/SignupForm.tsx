import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Loader2, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserType } from '@/lib/supabase';
import { DynamicLogo } from '@/components/DynamicLogo';
import { validateInvite, acceptInvite } from '@/lib/organizationServices';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteInfo, setInviteInfo] = useState<any>(null);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userType: 'farmer',
    }
  });

  const selectedUserType = watch('userType');

  // Detectar token de convite na URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invite');
    
    if (token) {
      setInviteToken(token);
      setLoadingInvite(true);
      
      // Validar convite
      validateInvite(token).then(({ data, error }) => {
        setLoadingInvite(false);
        if (data) {
          setInviteInfo(data);
          toast({
            title: `Convite para ${data.organization.name}! 🎉`,
            description: `Você foi convidado como ${data.role === 'admin' ? 'Administrador' : 'Membro'}. Complete seu cadastro abaixo.`,
          });
        } else if (error) {
          toast({
            variant: 'destructive',
            title: 'Convite inválido',
            description: error.message || 'Este convite expirou ou já foi utilizado.',
          });
        }
      });
    }
  }, []);

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

      // Se houver convite, aceitar automaticamente
      if (inviteToken && authData?.user) {
        console.log('Aceitando convite automático...');
        const { error: inviteError } = await acceptInvite(inviteToken, authData.user.id);
        
        if (inviteError) {
          console.error('Erro ao aceitar convite:', inviteError);
          toast({
            variant: 'destructive',
            title: 'Aviso',
            description: 'Conta criada, mas houve um problema ao aceitar o convite. Entre em contato com o administrador.',
          });
        } else {
          toast({
            title: 'Bem-vindo(a) à organização! 🎉',
            description: `Conta criada e você foi adicionado à ${inviteInfo?.organization?.name || 'organização'}!`,
          });
        }
      } else {
        toast({
          title: 'Conta criada com sucesso!',
          description: 'Você já está logado no sistema.',
        });
      }
      
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
        <div className="flex items-center justify-center gap-3 mb-2">
          <DynamicLogo size="md" className="h-12" />
          <CardTitle className="text-2xl font-bold text-center text-primary">FertiliSolo</CardTitle>
        </div>
        <CardTitle className="text-xl font-bold text-center text-primary">Criar Conta</CardTitle>
        <CardDescription className="text-center">
          Crie uma nova conta para acessar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Alert de Convite */}
        {loadingInvite && (
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Validando convite...
            </AlertDescription>
          </Alert>
        )}
        {inviteInfo && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <UserPlus className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              <strong>Convite para {inviteInfo.organization.name}</strong>
              <br />
              Você será adicionado como {inviteInfo.role === 'admin' ? 'Administrador' : 'Membro'}
            </AlertDescription>
          </Alert>
        )}
        
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
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
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