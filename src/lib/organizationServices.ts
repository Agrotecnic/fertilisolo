/**
 * Serviços de API para gerenciamento de organizações
 * Sistema multi-tenant com temas personalizados
 */

import { supabase, Database } from './supabase';
import { checkRateLimit, formatRateLimitError } from '@/utils/rateLimiting';

// Tipos auxiliares
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert'];
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update'];

export type OrganizationTheme = Database['public']['Tables']['organization_themes']['Row'];
export type OrganizationThemeInsert = Database['public']['Tables']['organization_themes']['Insert'];
export type OrganizationThemeUpdate = Database['public']['Tables']['organization_themes']['Update'];

export type UserOrganization = Database['public']['Tables']['user_organizations']['Row'];
export type UserRole = 'owner' | 'admin' | 'member';

// ============================================
// Serviços de Organização
// ============================================

/**
 * Busca a organização do usuário atual
 */
export async function getUserOrganization() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('Usuário não autenticado') };
    }

    const { data, error } = await supabase
      .from('user_organizations')
      .select(`
        id,
        role,
        organization_id,
        organizations (
          id,
          name,
          slug,
          logo_url,
          is_active,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar user_organization:', error);
      throw error;
    }

    if (!data) {
      console.warn('Usuário não pertence a nenhuma organização');
      return { data: null, error: new Error('Usuário não pertence a nenhuma organização') };
    }
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Erro ao buscar organização do usuário:', error);
    return { data: null, error };
  }
}

/**
 * Busca todas as organizações do usuário (caso pertença a múltiplas)
 */
export async function getUserOrganizations() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('Usuário não autenticado') };
    }

    const { data, error } = await supabase
      .from('user_organizations')
      .select(`
        id,
        role,
        created_at,
        organizations (
          id,
          name,
          slug,
          logo_url,
          is_active,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id);

    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Erro ao buscar organizações do usuário:', error);
    return { data: null, error };
  }
}

/**
 * Cria uma nova organização
 */
export async function createOrganization(name: string, slug: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('Usuário não autenticado') };
    }

    // Criar a organização
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name, slug })
      .select()
      .single();

    if (orgError) throw orgError;

    // Adicionar o usuário como owner
    const { error: userOrgError } = await supabase
      .from('user_organizations')
      .insert({
        user_id: user.id,
        organization_id: org.id,
        role: 'owner'
      });

    if (userOrgError) throw userOrgError;

    // Criar tema padrão
    const { error: themeError } = await supabase
      .from('organization_themes')
      .insert({
        organization_id: org.id
      });

    if (themeError) throw themeError;

    return { data: org, error: null };
  } catch (error: any) {
    console.error('Erro ao criar organização:', error);
    return { data: null, error };
  }
}

/**
 * Atualiza uma organização
 */
export async function updateOrganization(organizationId: string, updates: OrganizationUpdate) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', organizationId)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Erro ao atualizar organização:', error);
    return { data: null, error };
  }
}

/**
 * Deleta uma organização (apenas owners)
 */
export async function deleteOrganization(organizationId: string) {
  try {
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', organizationId);

    if (error) throw error;
    
    return { data: true, error: null };
  } catch (error: any) {
    console.error('Erro ao deletar organização:', error);
    return { data: false, error };
  }
}

// ============================================
// Serviços de Tema
// ============================================

/**
 * Busca o tema da organização do usuário
 */
export async function getUserOrganizationTheme() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('Usuário não autenticado') };
    }

    // Buscar organização do usuário (maybeSingle para evitar erro se não houver)
    const { data: userOrg, error: userOrgError } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (userOrgError) {
      console.error('Erro ao buscar user_organization:', userOrgError);
      throw userOrgError;
    }

    if (!userOrg) {
      return { data: null, error: new Error('Usuário não pertence a nenhuma organização') };
    }

    // Buscar tema da organização
    const { data: theme, error: themeError } = await supabase
      .from('organization_themes')
      .select('*')
      .eq('organization_id', userOrg.organization_id)
      .maybeSingle();

    if (themeError) {
      console.error('Erro ao buscar theme:', themeError);
      throw themeError;
    }

    if (!theme) {
      console.warn('Tema não encontrado para organização:', userOrg.organization_id);
      return { data: null, error: new Error('Tema não encontrado') };
    }
    
    return { data: theme, error: null };
  } catch (error: any) {
    console.error('Erro ao buscar tema da organização:', error);
    return { data: null, error };
  }
}

/**
 * Busca o tema de uma organização específica
 */
export async function getOrganizationTheme(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from('organization_themes')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Erro ao buscar tema:', error);
    return { data: null, error };
  }
}

/**
 * Atualiza o tema de uma organização
 */
export async function updateOrganizationTheme(
  organizationId: string,
  themeUpdates: OrganizationThemeUpdate
) {
  try {
    const { data, error } = await supabase
      .from('organization_themes')
      .update(themeUpdates)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Erro ao atualizar tema:', error);
    return { data: null, error };
  }
}

/**
 * Cria um tema para uma organização (se não existir)
 */
export async function createOrganizationTheme(
  organizationId: string,
  theme?: Partial<OrganizationThemeInsert>
) {
  try {
    const { data, error } = await supabase
      .from('organization_themes')
      .insert({
        organization_id: organizationId,
        ...theme
      })
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Erro ao criar tema:', error);
    return { data: null, error };
  }
}

// ============================================
// Serviços de Membros
// ============================================

/**
 * Busca todos os membros de uma organização com informações do usuário
 * Nota: Como não temos acesso direto ao auth.users no client-side,
 * vamos usar uma função RPC ou buscar informações de uma tabela auxiliar
 */
export async function getOrganizationMembers(organizationId: string) {
  try {
    // Primeiro, tentar usar uma RPC function se existir
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_organization_members_with_details', { 
        org_id: organizationId 
      });
    
    // Se a RPC existir e funcionar, retornar os dados
    if (!rpcError && rpcData) {
      return { data: rpcData, error: null };
    }
    
    // Fallback: buscar dados básicos e usar o user_id como identificador
    const { data, error } = await supabase
      .from('user_organizations')
      .select(`
        id,
        role,
        created_at,
        user_id
      `)
      .eq('organization_id', organizationId);

    if (error) throw error;
    
    // Para cada membro, tentar buscar email do usuário atual se for ele mesmo
    if (data && data.length > 0) {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const membersWithInfo = data.map((member) => {
        // Se for o usuário atual, podemos pegar o email dele
        if (currentUser && member.user_id === currentUser.id) {
          return {
            ...member,
            email: currentUser.email || 'Email não disponível',
            name: currentUser.user_metadata?.full_name || 
                  currentUser.user_metadata?.name || 
                  currentUser.email?.split('@')[0] || 
                  'Usuário'
          };
        }
        
        // Para outros usuários, retornar com ID parcial como fallback
        return {
          ...member,
          email: `ID: ${member.user_id.substring(0, 8)}...`,
          name: `Usuário ${member.user_id.substring(0, 8)}`
        };
      });
      
      return { data: membersWithInfo, error: null };
    }
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Erro ao buscar membros:', error);
    return { data: null, error };
  }
}

/**
 * Adiciona um membro a uma organização
 */
export async function addOrganizationMember(
  organizationId: string,
  userId: string,
  role: UserRole = 'member'
) {
  try {
    const { data, error } = await supabase
      .from('user_organizations')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        role
      })
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Erro ao adicionar membro:', error);
    return { data: null, error };
  }
}

/**
 * Remove um membro de uma organização
 */
export async function removeOrganizationMember(userOrganizationId: string) {
  try {
    const { error } = await supabase
      .from('user_organizations')
      .delete()
      .eq('id', userOrganizationId);

    if (error) throw error;
    
    return { data: true, error: null };
  } catch (error: any) {
    console.error('Erro ao remover membro:', error);
    return { data: false, error };
  }
}

/**
 * Atualiza a função de um membro
 */
export async function updateMemberRole(
  userOrganizationId: string,
  newRole: UserRole
) {
  try {
    const { data, error } = await supabase
      .from('user_organizations')
      .update({ role: newRole })
      .eq('id', userOrganizationId)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Erro ao atualizar função do membro:', error);
    return { data: null, error };
  }
}

/**
 * Verifica se o usuário tem permissão de admin ou owner
 */
export async function checkUserPermission(organizationId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_organizations')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single();

    if (error) return false;
    
    return data.role === 'owner' || data.role === 'admin';
  } catch (error) {
    console.error('Erro ao verificar permissão:', error);
    return false;
  }
}

// ============================================
// Serviços de Upload de Logo
// ============================================

/**
 * Faz upload do logo da organização para o Supabase Storage
 */
export async function uploadOrganizationLogo(
  organizationId: string,
  file: File
): Promise<{ data: string | null; error: any }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${organizationId}-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    // Upload do arquivo
    const { error: uploadError } = await supabase.storage
      .from('organization-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('organization-assets')
      .getPublicUrl(filePath);

    // Atualizar organização com a URL do logo
    const { error: updateError } = await supabase
      .from('organizations')
      .update({ logo_url: publicUrl })
      .eq('id', organizationId);

    if (updateError) throw updateError;

    return { data: publicUrl, error: null };
  } catch (error: any) {
    console.error('Erro ao fazer upload do logo:', error);
    return { data: null, error };
  }
}

/**
 * Remove o logo da organização
 */
export async function removeOrganizationLogo(organizationId: string, logoUrl: string) {
  try {
    // Extrair o path do arquivo da URL
    const urlParts = logoUrl.split('/');
    const filePath = `logos/${urlParts[urlParts.length - 1]}`;

    // Deletar arquivo do storage
    const { error: deleteError } = await supabase.storage
      .from('organization-assets')
      .remove([filePath]);

    if (deleteError) throw deleteError;

    // Atualizar organização removendo a URL do logo
    const { error: updateError } = await supabase
      .from('organizations')
      .update({ logo_url: null })
      .eq('id', organizationId);

    if (updateError) throw updateError;

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Erro ao remover logo:', error);
    return { data: false, error };
  }
}

// ============================================
// Serviços de Convites (Invite Links)
// ============================================

/**
 * Gera um novo link de convite para a organização
 * Inclui rate limiting para prevenir abuso
 */
export async function createInviteLink(
  organizationId: string,
  role: 'admin' | 'member',
  expiresInDays: number = 7,
  maxUses?: number
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    // Verificar rate limiting (usar user.id como identificador)
    const rateLimitResult = checkRateLimit('inviteCreation', user.id);
    if (!rateLimitResult.allowed) {
      return { 
        data: null, 
        inviteUrl: null, 
        error: new Error(formatRateLimitError(rateLimitResult))
      };
    }

    // Gerar token único usando crypto.randomUUID()
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const { data, error } = await supabase
      .from('organization_invites')
      .insert({
        organization_id: organizationId,
        token,
        role,
        created_by: user.id,
        expires_at: expiresAt.toISOString(),
        uses_remaining: maxUses,
      })
      .select()
      .single();

    if (error) throw error;

    // Retornar URL completa
    const inviteUrl = `${window.location.origin}/signup?invite=${token}`;
    return { data, inviteUrl, error: null };
  } catch (error: any) {
    console.error('Erro ao criar link de convite:', error);
    return { data: null, inviteUrl: null, error };
  }
}

/**
 * Valida um convite pelo token
 */
export async function validateInvite(token: string) {
  try {
    const { data, error } = await supabase
      .from('organization_invites')
      .select(`
        *,
        organization:organizations(id, name, logo_url)
      `)
      .eq('token', token)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) throw error;
    if (!data) return { data: null, error: new Error('Convite inválido ou expirado') };

    // Verificar usos restantes
    if (data.uses_remaining !== null && data.uses_remaining <= 0) {
      return { data: null, error: new Error('Convite já foi utilizado o máximo de vezes') };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Erro ao validar convite:', error);
    return { data: null, error };
  }
}

/**
 * Aceita um convite e associa o usuário à organização
 */
export async function acceptInvite(token: string, userId: string) {
  try {
    // Usar função do banco de dados que faz tudo atomicamente
    const { data, error } = await supabase.rpc('use_invite', {
      invite_token: token,
      user_id: userId,
    });

    if (error) throw error;
    if (!data) throw new Error('Não foi possível aceitar o convite');

    return { data: true, error: null };
  } catch (error: any) {
    console.error('Erro ao aceitar convite:', error);
    return { data: false, error };
  }
}

/**
 * Lista todos os convites ativos da organização
 */
export async function getOrganizationInvites(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from('organization_invites')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Erro ao listar convites:', error);
    return { data: null, error };
  }
}

/**
 * Desativa um convite
 */
export async function deactivateInvite(inviteId: string) {
  try {
    const { error } = await supabase
      .from('organization_invites')
      .update({ is_active: false })
      .eq('id', inviteId);

    if (error) throw error;
    return { data: true, error: null };
  } catch (error: any) {
    console.error('Erro ao desativar convite:', error);
    return { data: false, error };
  }
}

