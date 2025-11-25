import { supabase } from './supabase';

/**
 * Rota para verificar conectividade com o servidor
 * Utilizado pelo componente NetworkStatusChecker
 * 
 * Usa múltiplas estratégias para verificar conexão:
 * 1. Tenta fetch direto para o Supabase (mais confiável em mobile)
 * 2. Fallback para getSession() se fetch falhar
 */
export async function pingServer(signal?: AbortSignal) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  // Estratégia 1: Verificação simples via fetch (mais confiável em mobile)
  // Usa uma requisição leve que não depende de autenticação
  try {
    // Verificar se foi cancelado antes de começar
    if (signal?.aborted) {
      throw new Error('Requisição cancelada por timeout');
    }

    // Tentar fazer um fetch simples para verificar conectividade
    // Usamos uma URL pública do Supabase que sempre responde
    if (supabaseUrl) {
      // Usar a URL base do Supabase com um endpoint que sempre responde
      const healthUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/`;

      const fetchPromise = fetch(healthUrl, {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Content-Type': 'application/json',
        },
        signal: signal,
        cache: 'no-store',
      }).then(response => {
        // Qualquer resposta (mesmo erro 401/403) significa que há conectividade
        if (response.status >= 200 && response.status < 600) {
          return { ok: true };
        }
        throw new Error('Resposta inválida');
      });

      // Timeout mais longo e tolerante, especialmente para mobile
      const timeoutPromise = new Promise<never>((_, reject) => {
        // 30 segundos para mobile, 20 para desktop - muito mais tolerante
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const timeoutDuration = isMobile ? 30000 : 20000;

        const timeout = setTimeout(() => {
          if (!signal?.aborted) {
            reject(new Error('Timeout: Conexão muito lenta'));
          }
        }, timeoutDuration);

        // Limpar timeout se signal for abortado
        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timeout);
          });
        }
      });

      try {
        await Promise.race([fetchPromise, timeoutPromise]);

        // Se chegou aqui, a conexão está funcionando
        return {
          status: 'ok',
          message: 'Conexão com o servidor estabelecida',
          timestamp: new Date().toISOString(),
          connected: true
        };
      } catch (fetchError: any) {
        // Se foi timeout ou abort, não tentar fallback
        if (fetchError?.name === 'AbortError' || fetchError?.message?.includes('Timeout') || fetchError?.message?.includes('cancelada')) {
          throw fetchError;
        }
        // Se fetch falhou por outro motivo, tentar estratégia 2
        console.warn('Fetch falhou, tentando fallback:', fetchError);
      }
    }
  } catch (error: any) {
    // Se foi cancelado por timeout, retornar erro específico
    if (error?.name === 'AbortError' || error?.message?.includes('Timeout') || error?.message?.includes('cancelada')) {
      return {
        status: 'error',
        message: 'Timeout: Conexão muito lenta. Verifique sua internet.',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Estratégia 2: Fallback usando getSession (pode falhar em mobile com problemas de localStorage)
  try {
    // Verificar se foi cancelado
    if (signal?.aborted) {
      throw new Error('Requisição cancelada por timeout');
    }

    const { data, error } = await supabase.auth.getSession();
    
    // Verificar se foi cancelado após a chamada
    if (signal?.aborted) {
      throw new Error('Requisição cancelada por timeout');
    }
    
    if (error) {
      console.error('Erro ao fazer ping no servidor:', error);
      return { 
        status: 'error', 
        message: 'Falha na conexão com o servidor',
        timestamp: new Date().toISOString()
      };
    }
    
    return { 
      status: 'ok', 
      message: 'Conexão com o servidor estabelecida',
      timestamp: new Date().toISOString(),
      connected: true
    };
  } catch (error: any) {
    // Se foi cancelado por timeout, retornar erro específico
    if (error?.name === 'AbortError' || error?.message?.includes('Timeout') || error?.message?.includes('cancelada')) {
      return { 
        status: 'error', 
        message: 'Timeout: Conexão muito lenta. Verifique sua internet.',
        timestamp: new Date().toISOString()
      };
    }
    
    console.error('Erro inesperado ao fazer ping no servidor:', error);
    return { 
      status: 'error', 
      message: 'Erro inesperado na conexão. Verifique sua internet.',
      timestamp: new Date().toISOString()
    };
  }
}