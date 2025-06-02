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

// Interface para o Navigator com standalone para iOS
interface IOSNavigator extends Navigator {
  standalone?: boolean;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const { toast } = useToast();

  // Função para verificar se o app já está instalado
  const checkIfInstalled = () => {
    // No iOS
    const isIOSInstalled = 
      (window.navigator as IOSNavigator).standalone || 
      window.matchMedia('(display-mode: standalone)').matches;
    
    // No Android/Chrome
    const isAndroidInstalled = 
      window.matchMedia('(display-mode: standalone)').matches;
    
    return isIOSInstalled || isAndroidInstalled;
  };

  // Verificar status de instalação na inicialização
  useEffect(() => {
    setIsInstalled(checkIfInstalled());
    
    // Se for um dispositivo móvel, mostrar banner após 3 segundos
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile && !checkIfInstalled()) {
      // Em dispositivos iOS, não temos o evento beforeinstallprompt
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isIOS) {
        // Em iOS, sempre mostrar o banner após 3 segundos
        setTimeout(() => {
          setShowInstallBanner(true);
          toast({
            title: 'Instalar aplicativo',
            description: 'Para instalar o FertiliSolo no iOS, toque em "Compartilhar" e depois em "Adicionar à Tela de Início".',
            duration: 10000,
          });
        }, 3000);
      }
    }
  }, [toast]);

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
      
      // Mostrar o banner de instalação automaticamente após 1 segundo
      setTimeout(() => {
        toast({
          title: 'Instalar aplicativo',
          description: 'O FertiliSolo pode ser instalado para uso offline.',
          action: (
            <ToastAction altText="Instalar" onClick={handleInstallClick}>
              Instalar
            </ToastAction>
          ),
          duration: 10000,
        });
      }, 1000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar quando o app já está instalado
    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsInstalled(true);
      
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
    if (deferredPrompt) {
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
    } else {
      // Instruções para iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        toast({
          title: 'Instalar no iOS',
          description: 'Para instalar o FertiliSolo, toque no botão "Compartilhar" e depois em "Adicionar à Tela de Início".',
          duration: 10000,
        });
      }
    }
  };

  // Se o app já estiver instalado, não mostre nada
  if (isInstalled) return null;

  // Mostrar o banner para iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS && showInstallBanner) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-green-600 text-white p-4 shadow-lg z-50">
        <h3 className="text-lg font-bold mb-2">Instale o FertiliSolo</h3>
        <p className="text-sm mb-2">Para instalar o app no seu dispositivo iOS:</p>
        <ol className="text-sm mb-4 list-decimal pl-5">
          <li>Toque no botão <span className="font-bold">Compartilhar</span> abaixo</li>
          <li>Role e toque em <span className="font-bold">Adicionar à Tela de Início</span></li>
        </ol>
        <Button 
          onClick={() => setShowInstallBanner(false)}
          variant="secondary"
          className="w-full"
        >
          Entendi
        </Button>
      </div>
    );
  }

  // Se for instalável ou dispositivo móvel, mostre o botão
  if (isInstallable || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return (
      <Button 
        onClick={handleInstallClick}
        className="fixed bottom-4 right-4 z-50 bg-green-600 hover:bg-green-700 shadow-lg flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Instalar App
      </Button>
    );
  }

  return null;
}; 