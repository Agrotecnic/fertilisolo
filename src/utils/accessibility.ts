/**
 * Utilitários para melhorar acessibilidade
 */

/**
 * Gera um ID único para associação de labels e inputs
 */
export function generateInputId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Props de acessibilidade para botões
 */
export interface AccessibleButtonProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-pressed'?: boolean;
  'aria-expanded'?: boolean;
}

/**
 * Props de acessibilidade para inputs
 */
export interface AccessibleInputProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
}

/**
 * Adiciona atributos ARIA para formulários
 */
export function getFormAriaProps(
  hasError: boolean,
  isRequired: boolean = false,
  errorId?: string
): AccessibleInputProps {
  return {
    'aria-invalid': hasError,
    'aria-required': isRequired,
    'aria-describedby': hasError ? errorId : undefined,
  };
}

/**
 * Cria mensagem de live region para screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Verifica se o elemento está visível para screen readers
 */
export function isVisuallyHidden(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0' ||
    element.hasAttribute('aria-hidden')
  );
}

/**
 * Props padrão para tornar elementos clicáveis acessíveis
 */
export function getClickableProps(
  onClick: () => void,
  label: string
): {
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  role: string;
  tabIndex: number;
  'aria-label': string;
} {
  return {
    onClick,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    },
    role: 'button',
    tabIndex: 0,
    'aria-label': label,
  };
}

/**
 * Classe CSS para ocultar visualmente mas manter acessível
 */
export const srOnlyClass =
  'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0';

