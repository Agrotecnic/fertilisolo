import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Loader2, AlertTriangle, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SUPABASE_URL } from '@/lib/env';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { DynamicLogo } from '@/components/DynamicLogo';
import { checkRateLimit, clearRateLimit, formatRateLimitError } from '@/utils/rateLimiting';
import { sanitizeEmail } from '@/utils/validators';

const formSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type FormData = z.infer<typeof formSchema>;

interface LoginFormProps {
  onLoginSuccess: () => void;
  onCreateAccountClick?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onCreateAccountClick }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    try {
      // Verifica se a URL do Supabase é válida
      new URL(SUPABASE_URL);
      // Verifica se a URL contém "example.supabase.co" que é o valor padrão
      if (SUPABASE_URL.includes('example.supabase.co')) {
        setIsSupabaseConfigured(false);
      }
    } catch (e) {
      setIsSupabaseConfigured(false);
    }
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!isSupabaseConfigured) {
      toast({
        variant: 'destructive',
        title: 'Configuração inválida',
        description: 'Supabase não está configurado corretamente.',
      });
      return;
    }

    // Sanitizar email
    const sanitizedEmail = sanitizeEmail(data.email);
    
    // Verificar rate limiting
    const rateLimitResult = checkRateLimit('login', sanitizedEmail);
    if (!rateLimitResult.allowed) {
      toast({
        variant: 'destructive',
        title: 'Muitas tentativas',
        description: formatRateLimitError(rateLimitResult),
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: data.password,
      });

      if (error) {
        // Se erro de autenticação, já foi registrado no rate limit acima
        throw error;
      }
      
      // Limpar rate limit em caso de sucesso
      clearRateLimit('login', sanitizedEmail);
      
      onLoginSuccess();
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Você está autenticado.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Falha no login',
        description: error.message || 'Ocorreu um erro ao fazer login.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white/90 shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center gap-3 mb-2">
          <DynamicLogo size="md" className="h-12" />
          <CardTitle className="text-2xl font-bold text-center text-primary">FertiliSolo</CardTitle>
        </div>
        <CardTitle className="text-xl font-bold text-center text-primary">Login</CardTitle>
        <CardDescription className="text-center">
          Entre com seu email e senha para acessar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isSupabaseConfigured && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Configuração necessária</AlertTitle>
            <AlertDescription>
              As credenciais do Supabase não foram configuradas. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
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
            <div className="text-right">
              <button 
                type="button" 
                onClick={() => setShowForgotPassword(true)}
                className="text-xs text-primary hover:text-primary/80 hover:underline"
              >
                Esqueceu sua senha?
              </button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
            disabled={isLoading || !isSupabaseConfigured}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-4">
        <p className="text-sm text-gray-500">
          Não tem uma conta ainda?
        </p>
        <Button 
          variant="outline" 
          className="w-full border-primary text-primary hover:bg-primary/10 font-medium"
          onClick={onCreateAccountClick}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Criar Nova Conta
        </Button>
      </CardFooter>
    </Card>
  );
}; 