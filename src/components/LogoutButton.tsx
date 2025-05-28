import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export const LogoutButton: React.FC = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.',
      });
      // Navegar para a página de login após o logout bem-sucedido
      navigate('/login');
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
      variant="outline" 
      size="sm" 
      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sair
    </Button>
  );
}; 