/**
 * Componente de label acessível
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AccessibleLabelProps {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  description?: string;
}

export const AccessibleLabel: React.FC<AccessibleLabelProps> = React.memo(
  ({ htmlFor, required, children, className, description }) => {
    return (
      <div className="space-y-1">
        <Label htmlFor={htmlFor} className={cn('text-sm font-medium', className)}>
          {children}
          {required && (
            <span className="text-destructive ml-1" aria-label="obrigatório">
              *
            </span>
          )}
        </Label>
        {description && (
          <p id={`${htmlFor}-description`} className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    );
  }
);

AccessibleLabel.displayName = 'AccessibleLabel';

