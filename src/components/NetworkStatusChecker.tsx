import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { pingServer } from '@/lib/api';

export function NetworkStatusChecker() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [hasConnectivityIssues, setHasConnectivityIssues] = useState<boolean>(false);

  // Verificar status de conexão inicial e configurar ouvintes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Conexão restaurada",
        description: "Sua conexão com a internet foi restabelecida.",
        variant: "default",
      });
      // Resetar o flag de problemas de conectividade quando online
      setHasConnectivityIssues(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Sem conexão",
        description: "Você está offline. Algumas funcionalidades podem não estar disponíveis.",
        variant: "destructive",
        duration: 5000,
      });
    };

    // Ouvintes de eventos para conexão
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar conexão com o servidor periodicamente
    const checkConnectivity = async () => {
      try {
        // Apenas verificar se estamos online
        if (navigator.onLine) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          // Verificar conexão com o Supabase
          const result = await pingServer();
          clearTimeout(timeoutId);
          
          if (result.status === 'error') {
            throw new Error('Falha ao conectar com o servidor');
          }
          
          // Se chegamos aqui, a conexão está boa
          if (hasConnectivityIssues) {
            setHasConnectivityIssues(false);
            toast({
              title: "Conexão estável",
              description: "A conexão com o servidor foi reestabelecida.",
              variant: "default",
            });
          }
        }
      } catch (error) {
        // Se estamos "online" mas a requisição falhou, temos problemas de conectividade
        if (navigator.onLine && !hasConnectivityIssues) {
          setHasConnectivityIssues(true);
          console.warn('Problemas de conectividade detectados:', error);
          toast({
            title: "Problemas de conectividade",
            description: "Sua conexão com o servidor está instável.",
            variant: "destructive",
            duration: 5000,
          });
        }
      }
    };

    // Verificar a cada 30 segundos
    const intervalId = setInterval(checkConnectivity, 30000);
    
    // Verificar imediatamente no carregamento
    checkConnectivity();

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