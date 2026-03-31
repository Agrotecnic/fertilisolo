/**
 * Hook para carregar e aplicar temas personalizados de organizações
 */

import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { 
  getUserOrganization, 
  getOrganizationTheme,
  OrganizationTheme 
} from '@/lib/organizationServices';
import { hexToHSL } from '@/utils/colorConversions';

interface UseOrganizationThemeReturn {
  theme: OrganizationTheme | null;
  logo: string | null;
  organizationId: string | null;
  organizationName: string | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useOrganizationTheme(): UseOrganizationThemeReturn {
  const { user } = useAuth();
  const [theme, setTheme] = useState<OrganizationTheme | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTheme = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar organização do usuário
      const { data: userOrg, error: userOrgError } = await getUserOrganization();

      if (userOrgError) {
        console.warn('⚠️ Erro ao buscar organização:', userOrgError.message);
        setLoading(false);
        return;
      }

      if (!userOrg || !userOrg.organizations) {
        // Usuário não pertence a nenhuma organização - isso é normal
        console.log('ℹ️ Usuário não vinculado a nenhuma organização (usando tema padrão)');
        setLoading(false);
        return;
      }

      const org = userOrg.organizations as any;
      setOrganizationId(org.id);
      setOrganizationName(org.name);
      setLogo(org.logo_url);

      // Buscar tema da organização
      const { data: themeData, error: themeError } = await getOrganizationTheme(org.id);

      if (themeError) {
        throw themeError;
      }

      if (themeData) {
        console.log('🎨 Tema carregado:', themeData);
        setTheme(themeData);
        applyTheme(themeData);
      }
    } catch (err: any) {
      console.error('Erro ao carregar tema da organização:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTheme();
  }, [user]);
  
  // Re-aplicar tema sempre que mudar
  useEffect(() => {
    if (theme) {
      console.log('🔄 Re-aplicando tema...');
      applyTheme(theme);
    }
  }, [theme]);

  /**
   * Aplica o tema customizado ao documento
   */
  const applyTheme = (themeData: OrganizationTheme) => {
    const root = document.documentElement;

    try {
      console.log('🎨 Aplicando tema nas variáveis CSS...');

      // Cores primárias
      if (themeData.primary_color) {
        const hsl = hexToHSL(themeData.primary_color);
        root.style.setProperty('--primary', hsl);
        // Sidebar usa a cor primária como fundo
        root.style.setProperty('--sidebar-background', hsl);
        root.style.setProperty('--sidebar-border', hsl);
      }
      if (themeData.primary_foreground) {
        const hsl = hexToHSL(themeData.primary_foreground);
        root.style.setProperty('--primary-foreground', hsl);
        root.style.setProperty('--sidebar-foreground', hsl);
        root.style.setProperty('--sidebar-primary', hsl);
      }

      // Cores secundárias
      if (themeData.secondary_color) {
        root.style.setProperty('--secondary', hexToHSL(themeData.secondary_color));
      }
      if (themeData.secondary_foreground) {
        root.style.setProperty('--secondary-foreground', hexToHSL(themeData.secondary_foreground));
      }

      // Accent (dourado) — também usado no ring de foco e sidebar accent
      if (themeData.accent_color) {
        const hsl = hexToHSL(themeData.accent_color);
        root.style.setProperty('--accent', hsl);
        root.style.setProperty('--ring', hsl);           // Focus ring dourado
        root.style.setProperty('--sidebar-accent', hsl);
        root.style.setProperty('--sidebar-ring', hsl);
      }
      if (themeData.accent_foreground) {
        const hsl = hexToHSL(themeData.accent_foreground);
        root.style.setProperty('--accent-foreground', hsl);
        root.style.setProperty('--sidebar-accent-foreground', hsl);
        root.style.setProperty('--sidebar-primary-foreground', hsl);
      }

      // Background e foreground
      if (themeData.background_color) {
        root.style.setProperty('--background', hexToHSL(themeData.background_color));
      }
      if (themeData.foreground_color) {
        root.style.setProperty('--foreground', hexToHSL(themeData.foreground_color));
      }

      // Card — também usado para popovers e dropdowns
      if (themeData.card_color) {
        const hsl = hexToHSL(themeData.card_color);
        root.style.setProperty('--card', hsl);
        root.style.setProperty('--popover', hsl);
      }
      if (themeData.card_foreground) {
        const hsl = hexToHSL(themeData.card_foreground);
        root.style.setProperty('--card-foreground', hsl);
        root.style.setProperty('--popover-foreground', hsl);
      }

      // Bordas e inputs
      if (themeData.border_color) {
        root.style.setProperty('--border', hexToHSL(themeData.border_color));
      }
      if (themeData.input_color) {
        root.style.setProperty('--input', hexToHSL(themeData.input_color));
      }

      // Muted
      if (themeData.muted_color) {
        root.style.setProperty('--muted', hexToHSL(themeData.muted_color));
      }
      if (themeData.muted_foreground) {
        root.style.setProperty('--muted-foreground', hexToHSL(themeData.muted_foreground));
      }

      // Border radius e fonte
      if (themeData.border_radius) {
        root.style.setProperty('--radius', themeData.border_radius);
      }
      if (themeData.font_family && themeData.font_family !== 'Roboto') {
        document.body.style.fontFamily = `'${themeData.font_family}', sans-serif`;
      }

      console.log('✅ Tema premium aplicado com sucesso!');
    } catch (err) {
      console.error('❌ Erro ao aplicar tema:', err);
    }
  };

  /**
   * Função para recarregar o tema manualmente
   */
  const refetch = async () => {
    console.log('🔄 Recarregando tema...');
    await loadTheme();
    console.log('✅ Tema recarregado!');
  };

  return {
    theme,
    logo,
    organizationId,
    organizationName,
    loading,
    error,
    refetch
  };
}

