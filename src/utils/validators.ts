/**
 * Validadores reutilizáveis para formulários
 * Inclui sanitização de entrada para prevenir XSS e outros ataques
 */

import { FormErrors } from '@/types/common';

// ============================================
// VALIDAÇÕES
// ============================================

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (value: string | number | undefined): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== undefined && value !== null;
};

export const validateNumericPositive = (value: number): boolean => {
  return !isNaN(value) && value >= 0;
};

export const validateNumericRange = (
  value: number,
  min: number,
  max: number
): boolean => {
  return !isNaN(value) && value >= min && value <= max;
};

export const validateSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

export const validateURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // Permitir apenas http e https
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// ============================================
// SANITIZAÇÃO DE ENTRADA
// ============================================

/**
 * Remove todas as tags HTML de uma string
 * Previne ataques XSS básicos
 */
export const sanitizeHTML = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Criar elemento temporário para usar textContent (remove HTML automaticamente)
  const div = document.createElement('div');
  div.textContent = input;
  return div.textContent || '';
};

/**
 * Sanitiza texto removendo caracteres perigosos e tags HTML
 */
export const sanitizeText = (text: string, maxLength?: number): string => {
  if (typeof text !== 'string') return '';
  
  let sanitized = text
    // Remove tags HTML
    .replace(/<[^>]*>/g, '')
    // Remove caracteres de controle (exceto quebras de linha e tabs)
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    // Normaliza espaços em branco múltiplos
    .replace(/\s+/g, ' ')
    .trim();
  
  // Limitar comprimento se especificado
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

/**
 * Sanitiza slug removendo caracteres inválidos
 */
export const sanitizeSlug = (text: string): string => {
  if (typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * Sanitiza URL removendo caracteres perigosos e validando formato
 */
export const sanitizeURL = (url: string): string | null => {
  if (typeof url !== 'string') return null;
  
  try {
    // Remover espaços e caracteres de controle
    const cleaned = url.trim().replace(/[\x00-\x1F\x7F]/g, '');
    
    // Se não começa com http:// ou https://, adicionar https://
    let finalUrl = cleaned;
    if (!cleaned.match(/^https?:\/\//i)) {
      finalUrl = `https://${cleaned}`;
    }
    
    // Validar URL
    const urlObj = new URL(finalUrl);
    
    // Permitir apenas http e https
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return null;
    }
    
    return urlObj.toString();
  } catch {
    return null;
  }
};

/**
 * Sanitiza email removendo caracteres perigosos
 */
export const sanitizeEmail = (email: string): string => {
  if (typeof email !== 'string') return '';
  
  return email
    .toLowerCase()
    .trim()
    // Remove caracteres de controle
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Remove espaços
    .replace(/\s/g, '');
};

/**
 * Sanitiza número removendo caracteres não numéricos
 */
export const sanitizeNumber = (value: string | number): number | null => {
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }
  
  if (typeof value !== 'string') return null;
  
  // Remove tudo exceto números, ponto e sinal de menos
  const cleaned = value.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? null : parsed;
};

/**
 * Sanitiza nome de arquivo removendo caracteres perigosos
 */
export const sanitizeFilename = (filename: string): string => {
  if (typeof filename !== 'string') return '';
  
  return filename
    // Remove caracteres perigosos para nomes de arquivo
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    // Remove espaços múltiplos
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Sanitiza entrada de formulário genérica
 * Remove HTML, caracteres de controle e limita comprimento
 */
export const sanitizeInput = (
  input: string, 
  options: {
    maxLength?: number;
    allowHTML?: boolean;
    allowNewlines?: boolean;
  } = {}
): string => {
  if (typeof input !== 'string') return '';
  
  const { maxLength = 10000, allowHTML = false, allowNewlines = false } = options;
  
  let sanitized = input;
  
  // Remover HTML se não permitido
  if (!allowHTML) {
    sanitized = sanitizeHTML(sanitized);
  }
  
  // Remover quebras de linha se não permitidas
  if (!allowNewlines) {
    sanitized = sanitized.replace(/[\r\n]/g, ' ');
  }
  
  // Remover caracteres de controle
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Normalizar espaços
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Limitar comprimento
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

// ============================================
// INTERFACES E HELPERS
// ============================================

export interface ValidationRule {
  validator: (value: unknown) => boolean;
  message: string;
}

export const createValidator = (rules: Record<string, ValidationRule[]>) => {
  return (data: Record<string, unknown>): FormErrors => {
    const errors: FormErrors = {};

    Object.entries(rules).forEach(([field, fieldRules]) => {
      const value = data[field];
      
      for (const rule of fieldRules) {
        if (!rule.validator(value)) {
          errors[field] = rule.message;
          break; // Para no primeiro erro encontrado
        }
      }
    });

    return errors;
  };
};

// Validadores pré-configurados comuns
export const commonValidators = {
  required: (fieldName: string): ValidationRule => ({
    validator: (value) => validateRequired(value as string),
    message: `${fieldName} é obrigatório`,
  }),

  email: (): ValidationRule => ({
    validator: (value) => validateEmail(value as string),
    message: 'E-mail inválido',
  }),

  positiveNumber: (fieldName: string): ValidationRule => ({
    validator: (value) => validateNumericPositive(value as number),
    message: `${fieldName} deve ser um número positivo`,
  }),

  range: (fieldName: string, min: number, max: number): ValidationRule => ({
    validator: (value) => validateNumericRange(value as number, min, max),
    message: `${fieldName} deve estar entre ${min} e ${max}`,
  }),

  slug: (): ValidationRule => ({
    validator: (value) => validateSlug(value as string),
    message: 'Slug inválido. Use apenas letras minúsculas, números e hífens',
  }),

  url: (): ValidationRule => ({
    validator: (value) => validateURL(value as string),
    message: 'URL inválida. Use formato http:// ou https://',
  }),
};

