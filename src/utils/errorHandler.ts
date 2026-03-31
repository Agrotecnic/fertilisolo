/**
 * Utilitário centralizado para tratamento de erros
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message);
  }

  if (typeof error === 'string') {
    return new AppError(error);
  }

  return new AppError('Erro desconhecido');
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Ocorreu um erro inesperado';
};

export const logError = (error: unknown, context?: string): void => {
  const errorMessage = getErrorMessage(error);
  const contextMessage = context ? `[${context}]` : '';
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`❌ ${contextMessage} ${errorMessage}`, error);
  }
};

export const logWarning = (message: string, context?: string): void => {
  const contextMessage = context ? `[${context}]` : '';
  
  if (process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ ${contextMessage} ${message}`);
  }
};

export const logInfo = (message: string, context?: string): void => {
  const contextMessage = context ? `[${context}]` : '';
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`ℹ️ ${contextMessage} ${message}`);
  }
};

export const logSuccess = (message: string, context?: string): void => {
  const contextMessage = context ? `[${context}]` : '';
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ ${contextMessage} ${message}`);
  }
};

