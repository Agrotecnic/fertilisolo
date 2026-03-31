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

const THEME_STORAGE_KEY = 'org_theme_cache';

/** Aplica CSS variables a partir de um objeto de tema (pode ser chamado fora do React) */
function applyCachedTheme(themeData: OrganizationTheme) {
  const root = document.documentElement;
  try {
    if (themeData.primary_color) {
      const hsl = hexToHSL(themeData.primary_color);
      root.style.setProperty('--primary', hsl);
      root.style.setProperty('--sidebar-background', hsl);
      root.style.setProperty('--sidebar-border', hsl);
    }
    if (themeData.primary_foreground) {
      const hsl = hexToHSL(themeData.primary_foreground);
      root.style.setProperty('--primary-foreground', hsl);
      root.style.setProperty('--sidebar-foreground', hsl);
      root.style.setProperty('--sidebar-primary', hsl);
    }
    if (themeData.secondary_color) root.style.setProperty('--secondary', hexToHSL(themeData.secondary_color));
    if (themeData.secondary_foreground) root.style.setProperty('--secondary-foreground', hexToHSL(themeData.secondary_foreground));
    if (themeData.accent_color) {
      const hsl = hexToHSL(themeData.accent_color);
      root.style.setProperty('--accent', hsl);
      root.style.setProperty('--ring', hsl);
      root.style.setProperty('--sidebar-accent', hsl);
      root.style.setProperty('--sidebar-ring', hsl);
    }
    if (themeData.accent_foreground) {
      const hsl = hexToHSL(themeData.accent_foreground);
      root.style.setProperty('--accent-foreground', hsl);
      root.style.setProperty('--sidebar-accent-foreground', hsl);
      root.style.setProperty('--sidebar-primary-foreground', hsl);
    }
    if (themeData.background_color) root.style.setProperty('--background', hexToHSL(themeData.background_color));
    if (themeData.foreground_color) root.style.setProperty('--foreground', hexToHSL(themeData.foreground_color));
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
    if (themeData.border_color) root.style.setProperty('--border', hexToHSL(themeData.border_color));
    if (themeData.input_color) root.style.setProperty('--input', hexToHSL(themeData.input_color));
    if (themeData.muted_color) root.style.setProperty('--muted', hexToHSL(themeData.muted_color));
    if (themeData.muted_foreground) root.style.setProperty('--muted-foreground', hexToHSL(themeData.muted_foreground));
    if (themeData.border_radius) root.style.setProperty('--radius', themeData.border_radius);
    if (themeData.font_family && themeData.font_family !== 'Roboto') {
      document.body.style.fontFamily = `'${themeData.font_family}', sans-serif`;
    }
  } catch (_) { /* ignore */ }
}

// Aplica o tema do cache ANTES do primeiro render do React
try {
  const cached = localStorage.getItem(THEME_STORAGE_KEY);
  if (cached) {
    applyCachedTheme(JSON.parse(cached));
  }
} catch (_) { /* ignore */ }

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
        // Persiste no localStorage para aplicação imediata no próximo carregamento
        try { localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeData)); } catch (_) {}
        setTheme(themeData);
        applyCachedTheme(themeData);
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

