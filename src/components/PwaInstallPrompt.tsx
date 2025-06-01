import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Toast, ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';

// Interface para o evento BeforeInstallPrompt
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar status online/offline
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      
      if (navigator.onLine) {
        toast({
          title: 'Você está online',
          description: 'A conexão com a internet foi restabelecida.',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Você está offline',
          description: 'O aplicativo continuará funcionando com recursos limitados.',
          variant: 'destructive'
        });
      }
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Detectar quando o aplicativo pode ser instalado
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir o comportamento padrão do navegador
      e.preventDefault();
      // Armazenar o evento para usar mais tarde
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Mostrar que o app é instalável
      setIsInstallable(true);
      
      toast({
        title: 'Instalar aplicativo',
        description: 'O FertiliSolo pode ser instalado para uso offline.',
        action: (
          <ToastAction altText="Instalar" onClick={handleInstallClick}>
            Instalar
          </ToastAction>
        ),
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar quando o app já está instalado
    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      
      toast({
        title: 'Aplicativo instalado',
        description: 'O FertiliSolo foi instalado com sucesso!',
        variant: 'default'
      });
    });

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [toast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Mostrar o prompt de instalação
    await deferredPrompt.prompt();
    
    // Esperar pela escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast({
        title: 'Obrigado!',
        description: 'O aplicativo está sendo instalado.',
        variant: 'default'
      });
    }
    
    // Limpar o prompt salvo
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // Se o app já estiver instalado ou não for instalável, não mostre nada
  if (!isInstallable) return null;

  return (
    <Button 
      onClick={handleInstallClick}
      className="fixed bottom-4 right-4 z-50 bg-green-600 hover:bg-green-700 shadow-lg flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Instalar App
    </Button>
  );
}; 