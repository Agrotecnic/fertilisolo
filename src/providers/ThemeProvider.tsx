/**
 * Provider de Tema para Sistema Multi-Tenant
 * Gerencia e aplica temas personalizados por organização
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useOrganizationTheme } from '@/hooks/useOrganizationTheme';
import { OrganizationTheme } from '@/lib/organizationServices';
import { Loader2 } from 'lucide-react';

interface ThemeContextType {
  theme: OrganizationTheme | null;
  logo: string | null;
  organizationId: string | null;
  organizationName: string | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  showLoader?: boolean; // Mostrar loader enquanto carrega o tema
}

export function ThemeProvider({ children, showLoader = true }: ThemeProviderProps) {
  const themeData = useOrganizationTheme();

  // Se estiver carregando e showLoader for true, mostra um loader
  if (themeData.loading && showLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando tema...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={themeData}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de tema
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  
  return context;
}

/**
 * HOC para componentes que precisam de tema
 */
export function withTheme<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function ThemedComponent(props: P) {
    const themeContext = useTheme();
    
    return <Component {...props} themeContext={themeContext} />;
  };
}

