/**
 * Sistema de Rate Limiting para prevenir abuso
 * Usa localStorage para rastrear tentativas no frontend
 * 
 * IMPORTANTE: Este é um rate limiting básico no frontend.
 * Para produção, implemente rate limiting no backend também.
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Janela de tempo em milissegundos
  keyPrefix: string; // Prefixo para a chave no localStorage
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Timestamp quando o limite será resetado
  retryAfter?: number; // Segundos até poder tentar novamente
}

// Configurações padrão para diferentes ações
const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    keyPrefix: 'rate_limit_login',
  },
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
    keyPrefix: 'rate_limit_password_reset',
  },
  inviteCreation: {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 hora
    keyPrefix: 'rate_limit_invite',
  },
};

/**
 * Verifica se uma ação está dentro do limite de taxa
 */
export function checkRateLimit(
  action: string,
  identifier?: string // Email, IP, ou outro identificador único
): RateLimitResult {
  const config = RATE_LIMIT_CONFIGS[action];
  
  if (!config) {
    // Se não há configuração, permitir
    return {
      allowed: true,
      remaining: Infinity,
      resetAt: Date.now() + 60000,
    };
  }

  // Criar chave única baseada na ação e identificador
  const key = identifier 
    ? `${config.keyPrefix}_${identifier}` 
    : `${config.keyPrefix}_global`;
  
  try {
    const stored = localStorage.getItem(key);
    const now = Date.now();
    
    if (!stored) {
      // Primeira tentativa
      const data = {
        attempts: 1,
        firstAttempt: now,
        resetAt: now + config.windowMs,
      };
      localStorage.setItem(key, JSON.stringify(data));
      
      return {
        allowed: true,
        remaining: config.maxAttempts - 1,
        resetAt: data.resetAt,
      };
    }
    
    const data = JSON.parse(stored);
    
    // Verificar se a janela de tempo expirou
    if (now > data.resetAt) {
      // Resetar contador
      const newData = {
        attempts: 1,
        firstAttempt: now,
        resetAt: now + config.windowMs,
      };
      localStorage.setItem(key, JSON.stringify(newData));
      
      return {
        allowed: true,
        remaining: config.maxAttempts - 1,
        resetAt: newData.resetAt,
      };
    }
    
    // Verificar se excedeu o limite
    if (data.attempts >= config.maxAttempts) {
      const retryAfter = Math.ceil((data.resetAt - now) / 1000);
      
      return {
        allowed: false,
        remaining: 0,
        resetAt: data.resetAt,
        retryAfter,
      };
    }
    
    // Incrementar contador
    data.attempts += 1;
    localStorage.setItem(key, JSON.stringify(data));
    
    return {
      allowed: true,
      remaining: config.maxAttempts - data.attempts,
      resetAt: data.resetAt,
    };
  } catch (error) {
    // Se houver erro (ex: localStorage desabilitado), permitir mas logar
    console.warn('Erro ao verificar rate limit:', error);
    return {
      allowed: true,
      remaining: config.maxAttempts,
      resetAt: Date.now() + config.windowMs,
    };
  }
}

/**
 * Registra uma tentativa de ação
 */
export function recordAttempt(action: string, identifier?: string): RateLimitResult {
  return checkRateLimit(action, identifier);
}

/**
 * Limpa o rate limit para uma ação específica
 * Útil para testes ou quando o usuário é autenticado com sucesso
 */
export function clearRateLimit(action: string, identifier?: string): void {
  const config = RATE_LIMIT_CONFIGS[action];
  if (!config) return;
  
  const key = identifier 
    ? `${config.keyPrefix}_${identifier}` 
    : `${config.keyPrefix}_global`;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Erro ao limpar rate limit:', error);
  }
}

/**
 * Obtém informações sobre o rate limit atual sem incrementar
 */
export function getRateLimitInfo(action: string, identifier?: string): RateLimitResult {
  const config = RATE_LIMIT_CONFIGS[action];
  
  if (!config) {
    return {
      allowed: true,
      remaining: Infinity,
      resetAt: Date.now() + 60000,
    };
  }

  const key = identifier 
    ? `${config.keyPrefix}_${identifier}` 
    : `${config.keyPrefix}_global`;
  
  try {
    const stored = localStorage.getItem(key);
    const now = Date.now();
    
    if (!stored) {
      return {
        allowed: true,
        remaining: config.maxAttempts,
        resetAt: now + config.windowMs,
      };
    }
    
    const data = JSON.parse(stored);
    
    // Verificar se a janela de tempo expirou
    if (now > data.resetAt) {
      return {
        allowed: true,
        remaining: config.maxAttempts,
        resetAt: now + config.windowMs,
      };
    }
    
    const remaining = Math.max(0, config.maxAttempts - data.attempts);
    const retryAfter = remaining === 0 ? Math.ceil((data.resetAt - now) / 1000) : undefined;
    
    return {
      allowed: remaining > 0,
      remaining,
      resetAt: data.resetAt,
      retryAfter,
    };
  } catch (error) {
    return {
      allowed: true,
      remaining: config.maxAttempts,
      resetAt: Date.now() + config.windowMs,
    };
  }
}

/**
 * Formata mensagem de erro de rate limit
 */
export function formatRateLimitError(result: RateLimitResult): string {
  if (result.allowed) {
    return '';
  }
  
  if (result.retryAfter) {
    const minutes = Math.ceil(result.retryAfter / 60);
    return `Muitas tentativas. Tente novamente em ${minutes} minuto${minutes > 1 ? 's' : ''}.`;
  }
  
  return 'Muitas tentativas. Tente novamente mais tarde.';
}

/**
 * Hook helper para usar rate limiting em componentes React
 */
export function useRateLimit(action: string, identifier?: string) {
  const check = () => checkRateLimit(action, identifier);
  const clear = () => clearRateLimit(action, identifier);
  const getInfo = () => getRateLimitInfo(action, identifier);
  
  return {
    check,
    clear,
    getInfo,
    formatError: formatRateLimitError,
  };
}

