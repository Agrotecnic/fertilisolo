/**
 * Componente de Logo Dinâmico
 * Exibe o logo personalizado da organização ou o logo padrão
 */

import React from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { cn } from '@/lib/utils';

interface DynamicLogoProps {
  className?: string;
  fallbackSrc?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-8 w-auto',
  md: 'h-12 w-auto',
  lg: 'h-16 w-auto',
  xl: 'h-24 w-auto',
};

export function DynamicLogo({ 
  className, 
  fallbackSrc = '/logo-fertilisolo.png',
  alt,
  size = 'md'
}: DynamicLogoProps) {
  const { logo, organizationName } = useTheme();

  const logoSrc = logo || fallbackSrc;
  const logoAlt = alt || organizationName || 'FertiliSolo';

  return (
    <img
      src={logoSrc}
      alt={logoAlt}
      className={cn(sizeClasses[size], className)}
      onError={(e) => {
        // Se houver erro ao carregar o logo, usa o fallback
        const target = e.target as HTMLImageElement;
        if (target.src !== fallbackSrc) {
          target.src = fallbackSrc;
        }
      }}
    />
  );
}

/**
 * Variante do logo com texto
 */
interface DynamicLogoWithTextProps extends DynamicLogoProps {
  showText?: boolean;
  textClassName?: string;
}

export function DynamicLogoWithText({ 
  showText = true,
  textClassName,
  ...logoProps 
}: DynamicLogoWithTextProps) {
  const { organizationName } = useTheme();

  return (
    <div className="flex items-center gap-3">
      <DynamicLogo {...logoProps} />
      {showText && organizationName && (
        <span className={cn('font-bold text-lg', textClassName)}>
          {organizationName}
        </span>
      )}
    </div>
  );
}

