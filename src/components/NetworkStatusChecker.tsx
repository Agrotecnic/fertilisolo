import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { pingServer } from '@/lib/api';

export function NetworkStatusChecker() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [hasConnectivityIssues, setHasConnectivityIssues] = useState<boolean>(false);

  // Verificar status de conexão inicial e configurar ouvintes
  useEffect(() => {
    // Verificar se estamos na página de login/auth/signup - não mostrar toasts nessas páginas
    const isAuthPage = window.location.pathname === '/' ||
                        window.location.pathname === '/login' ||
                        window.location.pathname === '/auth' ||
                        window.location.pathname === '/signup';

    const handleOnline = () => {
      setIsOnline(true);
      // Não mostrar toast na página de login/auth para evitar confusão
      if (!isAuthPage) {
        toast({
          title: "Conexão restaurada",
          description: "Sua conexão com a internet foi restabelecida.",
          variant: "default",
        });
      }
      // Resetar o flag de problemas de conectividade quando online
      setHasConnectivityIssues(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      // Não mostrar toast na página de login/auth para evitar confusão
      if (!isAuthPage) {
        toast({
          title: "Sem conexão",
          description: "Você está offline. Algumas funcionalidades podem não estar disponíveis.",
          variant: "destructive",
          duration: 5000,
        });
      }
    };

    // Ouvintes de eventos para conexão
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar conexão com o servidor periodicamente
    const checkConnectivity = async () => {
      // Verificar se estamos na página de login/auth - não fazer verificações nessas páginas
      const isAuthPage = window.location.pathname === '/' ||
                          window.location.pathname === '/login' ||
                          window.location.pathname === '/auth';

      // Pular verificação na página de auth para não interferir no login
      if (isAuthPage) {
        return;
      }

      try {
        // Apenas verificar se estamos online
        if (navigator.onLine) {
          const controller = new AbortController();
          // Timeout muito mais longo e tolerante para mobile
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          const timeoutDuration = isMobile ? 30000 : 20000; // 30s mobile, 20s desktop
          const timeoutId = setTimeout(() => {
            controller.abort();
          }, timeoutDuration);

          try {
            // Verificar conexão com o Supabase passando o signal
            const result = await pingServer(controller.signal);
            clearTimeout(timeoutId);

            if (result.status === 'error') {
              // Não mostrar erro se for apenas um problema temporário
              // Só mostrar se for timeout ou erro persistente
              if (result.message?.includes('Timeout') || result.message?.includes('lenta')) {
                throw new Error(result.message);
              }
              // Para outros erros, não considerar como problema crítico
              // Pode ser apenas um problema temporário
              return;
            }

            // Se chegamos aqui, a conexão está boa
            if (hasConnectivityIssues) {
              setHasConnectivityIssues(false);
              toast({
                title: "Conexão restaurada",
                description: "A conexão com o servidor foi reestabelecida.",
                variant: "default",
                duration: 3000,
              });
            }
          } catch (error: any) {
            clearTimeout(timeoutId);
            // Se foi timeout, tratar como problema de conectividade
            if (error?.name === 'AbortError' || error?.message?.includes('Timeout') || error?.message?.includes('lenta')) {
              throw new Error('Timeout: Verifique sua conexão com a internet');
            }
            // Para outros erros, não propagar - pode ser temporário
            console.warn('Erro ao verificar conectividade (pode ser temporário):', error);
            return;
          }
        }
      } catch (error: any) {
        // Se estamos "online" mas a requisição falhou, temos problemas de conectividade
        // Mas só mostrar se for realmente um problema (timeout)
        if (navigator.onLine && !hasConnectivityIssues) {
          const isTimeout = error?.message?.includes('Timeout') || error?.message?.includes('lenta');

          if (isTimeout) {
            setHasConnectivityIssues(true);
            console.warn('Problemas de conectividade detectados (timeout):', error);
            toast({
              title: "Conexão lenta",
              description: "Sua conexão está muito lenta. Verifique sua internet ou tente novamente em alguns instantes.",
              variant: "destructive",
              duration: 8000, // Mostrar por mais tempo
            });
          }
        }
      }
    };

    // Verificar a cada 60 segundos (reduzido para ser menos agressivo)
    const intervalId = setInterval(checkConnectivity, 60000);

    // Verificar após 5 segundos do carregamento (aumentado para evitar falsos positivos)
    setTimeout(checkConnectivity, 5000);

    // Limpar ouvintes e intervalos
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [hasConnectivityIssues]);

  // Não renderizar nada se online e sem problemas
  if (isOnline && !hasConnectivityIssues) {
    return null;
  }

  // Renderizar banner de aviso quando offline ou com problemas
  return (
    <div className={`fixed bottom-4 right-4 z-50 p-3 rounded-lg shadow-lg ${
      isOnline ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
    }`}>
      <div className="flex items-center space-x-2">
        {isOnline ? (
          <>
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">Conexão instável</span>
          </>
        ) : (
          <>
            <WifiOff className="h-5 w-5" />
            <span className="text-sm font-medium">Sem conexão</span>
          </>
        )}
      </div>
    </div>
  );
} 