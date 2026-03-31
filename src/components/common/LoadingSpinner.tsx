/**
 * Componente reutilizável de loading spinner
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(
  ({ size = 'md', message, className, fullScreen = false }) => {
    const content = (
      <div className={cn('flex flex-col items-center gap-3', className)}>
        <Loader2
          className={cn('animate-spin text-primary', sizeClasses[size])}
        />
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </div>
    );

    if (fullScreen) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          {content}
        </div>
      );
    }

    return content;
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

