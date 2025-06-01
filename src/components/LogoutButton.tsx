import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface LogoutButtonProps {
  customHandler?: () => Promise<void>;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ customHandler }) => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (customHandler) {
        // Se um manipulador personalizado foi fornecido, use-o
        await customHandler();
      } else {
        // Caso contrário, use o comportamento padrão
        await signOut();
        toast({
          title: 'Logout realizado',
          description: 'Você foi desconectado com sucesso.',
        });
        // Navegar para a página inicial após o logout bem-sucedido
        navigate('/');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao sair',
        description: 'Ocorreu um erro ao fazer logout.',
      });
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="default" 
      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium shadow-md"
      onClick={handleLogout}
    >
      <LogOut className="h-5 w-5 mr-2" />
      Sair da Conta
    </Button>
  );
}; 