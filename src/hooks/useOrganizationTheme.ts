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
      
      // Aplicar cores primárias
      if (themeData.primary_color) {
        const hsl = hexToHSL(themeData.primary_color);
        root.style.setProperty('--primary', hsl);
        console.log('✅ Primary:', themeData.primary_color, '→', hsl);
      }
      if (themeData.primary_foreground) {
        root.style.setProperty('--primary-foreground', hexToHSL(themeData.primary_foreground));
      }

      // Aplicar cores secundárias
      if (themeData.secondary_color) {
        const hsl = hexToHSL(themeData.secondary_color);
        root.style.setProperty('--secondary', hsl);
        console.log('✅ Secondary:', themeData.secondary_color, '→', hsl);
      }
      if (themeData.secondary_foreground) {
        root.style.setProperty('--secondary-foreground', hexToHSL(themeData.secondary_foreground));
      }

      // Aplicar cores de destaque (accent)
      if (themeData.accent_color) {
        const hsl = hexToHSL(themeData.accent_color);
        root.style.setProperty('--accent', hsl);
        console.log('✅ Accent:', themeData.accent_color, '→', hsl);
      }
      if (themeData.accent_foreground) {
        root.style.setProperty('--accent-foreground', hexToHSL(themeData.accent_foreground));
      }

      // Aplicar cores de background
      if (themeData.background_color) {
        root.style.setProperty('--background', hexToHSL(themeData.background_color));
      }
      if (themeData.foreground_color) {
        root.style.setProperty('--foreground', hexToHSL(themeData.foreground_color));
      }

      // Aplicar cores de card
      if (themeData.card_color) {
        root.style.setProperty('--card', hexToHSL(themeData.card_color));
      }
      if (themeData.card_foreground) {
        root.style.setProperty('--card-foreground', hexToHSL(themeData.card_foreground));
      }

      // Aplicar cores de borda e input
      if (themeData.border_color) {
        root.style.setProperty('--border', hexToHSL(themeData.border_color));
      }
      if (themeData.input_color) {
        root.style.setProperty('--input', hexToHSL(themeData.input_color));
      }

      // Aplicar cores muted
      if (themeData.muted_color) {
        root.style.setProperty('--muted', hexToHSL(themeData.muted_color));
      }
      if (themeData.muted_foreground) {
        root.style.setProperty('--muted-foreground', hexToHSL(themeData.muted_foreground));
      }

      // Aplicar configurações de estilo
      if (themeData.border_radius) {
        root.style.setProperty('--radius', themeData.border_radius);
      }

      // Aplicar fonte personalizada (se especificada)
      if (themeData.font_family && themeData.font_family !== 'Roboto') {
        document.body.style.fontFamily = `'${themeData.font_family}', sans-serif`;
      }

      console.log('✅ Tema aplicado com sucesso! Variáveis CSS atualizadas.');
      console.log('📊 Verifique com: getComputedStyle(document.documentElement).getPropertyValue("--primary")');
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

