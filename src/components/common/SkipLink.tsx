/**
 * Skip link para navegação por teclado
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = React.memo(
  ({ href, children }) => {
    return (
      <a
        href={href}
        className={cn(
          'sr-only focus:not-sr-only',
          'focus:absolute focus:z-50 focus:top-4 focus:left-4',
          'focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground',
          'focus:rounded-md focus:shadow-lg',
          'transition-all duration-200'
        )}
      >
        {children}
      </a>
    );
  }
);

SkipLink.displayName = 'SkipLink';

