import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { sendPasswordResetEmail } from '@/lib/custom-email-handler';
import { DynamicLogo } from '@/components/DynamicLogo';
import { checkRateLimit, formatRateLimitError } from '@/utils/rateLimiting';
import { sanitizeEmail } from '@/utils/validators';

const formSchema = z.object({
  email: z.string().email('Email inválido'),
});

type FormData = z.infer<typeof formSchema>;

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    // Sanitizar email
    const sanitizedEmail = sanitizeEmail(data.email);
    
    // Verificar rate limiting
    const rateLimitResult = checkRateLimit('passwordReset', sanitizedEmail);
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
      const result = await sendPasswordResetEmail(sanitizedEmail);

      if (!result.success) throw new Error(result.error);
      
      setEmailSent(true);
      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Falha ao enviar email',
        description: error.message || 'Ocorreu um erro ao enviar o email de recuperação.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/90 shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center gap-3 mb-2">
          <DynamicLogo size="md" className="h-12" />
          <CardTitle className="text-2xl font-bold text-center text-primary">FertiliSolo</CardTitle>
        </div>
        <CardTitle className="text-xl font-bold text-center text-primary">
          {emailSent ? 'Email Enviado' : 'Recuperar Senha'}
        </CardTitle>
        <CardDescription className="text-center">
          {emailSent 
            ? 'Verifique sua caixa de entrada para instruções de recuperação de senha.' 
            : 'Digite seu email para receber instruções de recuperação de senha.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!emailSent ? (
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
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Instruções'
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-gray-600">
              Um email com instruções para recuperar sua senha foi enviado para o endereço fornecido.
            </p>
            <p className="text-center text-gray-600">
              Se não receber o email em alguns minutos, verifique sua pasta de spam.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          variant="outline" 
          className="text-sm flex items-center gap-1"
          onClick={onBackToLogin}
        >
          <ArrowLeft className="h-3 w-3" />
          Voltar para o login
        </Button>
      </CardFooter>
    </Card>
  );
}; 