import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateUserPassword, getCurrentSession } from '@/lib/custom-email-handler';
import { DynamicLogo } from '@/components/DynamicLogo';

const formSchema = z.object({
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof formSchema>;

export const ResetPasswordForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSessionValid, setIsSessionValid] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    async function checkSession() {
      const session = await getCurrentSession();
      setIsSessionValid(!!session);
      setIsCheckingSession(false);
    }
    
    checkSession();
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const result = await updateUserPassword(data.password);

      if (!result.success) throw new Error(result.error);
      
      setIsSuccess(true);
      toast({
        title: 'Senha atualizada!',
        description: 'Sua senha foi atualizada com sucesso.',
      });
      
      // Redireciona para a tela de login após 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Falha ao redefinir senha',
        description: error.message || 'Ocorreu um erro ao redefinir sua senha.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white/90 shadow-lg">
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!isSessionValid) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white/90 shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center gap-3 mb-2">
            <DynamicLogo size="md" className="h-12" />
            <CardTitle className="text-2xl font-bold text-center text-primary">FertiliSolo</CardTitle>
          </div>
          <CardTitle className="text-xl font-bold text-center text-primary">
            Link Inválido
          </CardTitle>
          <CardDescription className="text-center">
            O link de redefinição de senha é inválido ou expirou.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button 
            variant="outline" 
            className="text-sm"
            onClick={() => navigate('/login')}
          >
            Voltar para o Login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white/90 shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center gap-3 mb-2">
          <DynamicLogo size="md" className="h-12" />
          <CardTitle className="text-2xl font-bold text-center text-primary">FertiliSolo</CardTitle>
        </div>
        <CardTitle className="text-xl font-bold text-center text-primary">
          {isSuccess ? 'Senha Redefinida' : 'Redefinir Senha'}
        </CardTitle>
        <CardDescription className="text-center">
          {isSuccess
            ? 'Sua senha foi atualizada com sucesso!'
            : 'Crie uma nova senha para sua conta.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isSuccess ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
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
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="******"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.confirmPassword.message}
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
                  Redefinindo...
                </>
              ) : (
                'Redefinir Senha'
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-gray-600">
              Sua senha foi atualizada com sucesso.
            </p>
            <p className="text-center text-gray-600">
              Você será redirecionado para a tela de login.
            </p>
          </div>
        )}
      </CardContent>
      {isSuccess && (
        <CardFooter className="flex justify-center">
          <Button 
            variant="outline" 
            className="text-sm"
            onClick={() => navigate('/login')}
          >
            Ir para o Login
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}; 