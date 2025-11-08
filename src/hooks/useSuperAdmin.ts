/**
 * Hook personalizado para lógica do Super Admin
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Organization, ThemeColors } from '@/types/common';
import { logError, logInfo, logSuccess, logWarning } from '@/utils/errorHandler';

const SUPER_ADMIN_EMAIL = 'deyvidrb@icloud.com';

interface CreateOrganizationData {
  name: string;
  slug: string;
  adminEmail: string;
  colors: ThemeColors;
}

export function useSuperAdmin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  // Verificar acesso
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.email !== SUPER_ADMIN_EMAIL) {
      toast({
        variant: 'destructive',
        title: 'Acesso Negado',
        description: 'Você não tem permissão para acessar esta página.',
      });
      navigate('/');
      return;
    }

    setHasAccess(true);
    setLoading(false);
    loadOrganizations();
  }, [user, authLoading, navigate, toast]);

  const loadOrganizations = useCallback(async () => {
    try {
      logInfo('Carregando organizações', 'SuperAdmin');

      const { data: orgs, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logError(error, 'SuperAdmin');
        throw error;
      }

      if (!orgs || orgs.length === 0) {
        logWarning('Nenhuma organização encontrada', 'SuperAdmin');
        setOrganizations([]);
        return;
      }

      // Buscar contagem de usuários para cada org
      const orgsWithCount = await Promise.all(
        orgs.map(async (org) => {
          const { count } = await supabase
            .from('user_organizations')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id);

          return { ...org, user_count: count || 0 };
        })
      );

      logSuccess(`${orgsWithCount.length} organizações carregadas`, 'SuperAdmin');
      setOrganizations(orgsWithCount);
    } catch (error) {
      logError(error, 'SuperAdmin.loadOrganizations');
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar organizações',
        description: 'Não foi possível carregar a lista de organizações.',
      });
    }
  }, [toast]);

  const createOrganization = useCallback(
    async (data: CreateOrganizationData) => {
      try {
        // 1. Verificar se slug já existe
        const { data: existingOrg } = await supabase
          .from('organizations')
          .select('id')
          .eq('slug', data.slug)
          .single();

        if (existingOrg) {
          toast({
            variant: 'destructive',
            title: 'Slug já existe',
            description: 'Escolha outro identificador (slug) para a organização.',
          });
          return;
        }

        // 2. Criar organização
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: data.name,
            slug: data.slug,
            is_active: true,
          })
          .select()
          .single();

        if (orgError) throw orgError;

        // 3. Criar tema
        const { error: themeError } = await supabase
          .from('organization_themes')
          .insert({
            organization_id: org.id,
            primary_color: data.colors.primary,
            primary_foreground: '#FFFFFF',
            secondary_color: data.colors.secondary,
            secondary_foreground: '#FFFFFF',
            accent_color: data.colors.accent,
            accent_foreground: '#FFFFFF',
          });

        if (themeError) throw themeError;

        // 4. Se admin email fornecido, mostrar instruções
        if (data.adminEmail) {
          toast({
            title: '⚠️ Associação Manual Necessária',
            description: `Organização criada! Execute este SQL para associar o admin:\n\nINSERT INTO user_organizations (user_id, organization_id, role)\nSELECT id, '${org.id}', 'owner'\nFROM auth.users WHERE email = '${data.adminEmail}';`,
            duration: 10000,
          });
        }

        toast({
          title: '✅ Organização criada!',
          description: data.adminEmail
            ? `${data.name} foi criada. Verifique as instruções para associar o admin.`
            : `${data.name} foi criada com sucesso.`,
        });

        logSuccess(`Organização "${data.name}" criada`, 'SuperAdmin');
        loadOrganizations();
      } catch (error) {
        logError(error, 'SuperAdmin.createOrganization');
        toast({
          variant: 'destructive',
          title: 'Erro ao criar organização',
          description: 'Não foi possível criar a organização.',
        });
        throw error;
      }
    },
    [toast, loadOrganizations]
  );

  const toggleOrganizationActive = useCallback(
    async (orgId: string, currentStatus: boolean) => {
      try {
        const { error } = await supabase
          .from('organizations')
          .update({ is_active: !currentStatus })
          .eq('id', orgId);

        if (error) throw error;

        toast({
          title: currentStatus
            ? 'Organização desativada'
            : 'Organização ativada',
        });

        logSuccess(
          `Organização ${currentStatus ? 'desativada' : 'ativada'}`,
          'SuperAdmin'
        );
        loadOrganizations();
      } catch (error) {
        logError(error, 'SuperAdmin.toggleOrganizationActive');
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível alterar o status da organização.',
        });
      }
    },
    [toast, loadOrganizations]
  );

  return {
    loading: authLoading || loading,
    hasAccess,
    organizations,
    createOrganization,
    toggleOrganizationActive,
    loadOrganizations,
  };
}

