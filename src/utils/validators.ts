/**
 * Validadores reutilizáveis para formulários
 */

import { FormErrors } from '@/types/common';

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

export const sanitizeSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

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
};

