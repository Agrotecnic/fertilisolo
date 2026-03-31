/**
 * Componente de Logo Dinâmico
 * Exibe o logo personalizado da organização ou o logo SVG padrão do FertiliSolo
 */

import React, { useState } from 'react';
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

/** Logo SVG padrão do FertiliSolo — usado quando não há logo de organização */
function FertilisoloDefaultLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="FertiliSolo"
      role="img"
    >
      {/* Folha principal */}
      <path
        d="M24 6C24 6 10 14 10 26C10 33.18 16.27 39 24 39C31.73 39 38 33.18 38 26C38 14 24 6 24 6Z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M24 6C24 6 10 14 10 26C10 33.18 16.27 39 24 39"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M24 6C24 6 38 14 38 26C38 33.18 31.73 39 24 39"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Nervura central */}
      <path
        d="M24 39V16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Nervuras laterais */}
      <path
        d="M24 28L18 22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M24 28L30 22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M24 34L19 29"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M24 34L29 29"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* Raíz / caule base */}
      <path
        d="M24 39C24 39 20 41 18 44"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M24 39C24 39 28 41 30 44"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export function DynamicLogo({ 
  className, 
  fallbackSrc,
  alt,
  size = 'md'
}: DynamicLogoProps) {
  const { logo, organizationName } = useTheme();
  const [imgError, setImgError] = useState(false);

  const logoAlt = alt || organizationName || 'FertiliSolo';
  const sizeClass = sizeClasses[size];

  // Se há logo de organização e não deu erro ao carregar, mostra como <img>
  if (logo && !imgError) {
    return (
      <img
        src={logo}
        alt={logoAlt}
        className={cn(sizeClass, className)}
        onError={() => setImgError(true)}
      />
    );
  }

  // Fallback: logo SVG padrão do FertiliSolo (nunca falha)
  return (
    <FertilisoloDefaultLogo
      className={cn(sizeClass, 'text-[#1B5E20]', className)}
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

