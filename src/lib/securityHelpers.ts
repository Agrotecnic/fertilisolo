/**
 * HELPERS DE SEGURANÇA MULTI-TENANT
 * 
 * Este arquivo contém funções auxiliares para garantir isolamento de dados
 * entre organizações no sistema white-label.
 * 
 * IMPORTANTE: Sempre use estas funções ao fazer queries no banco de dados
 * para garantir que apenas dados da organização do usuário sejam acessados.
 */

import { supabase } from './supabase';
import type { Database } from './supabase';

// ============================================
// TIPOS
// ============================================

export interface SecurityContext {
  userId: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'member';
}

export interface SecurityValidation {
  isValid: boolean;
  error?: string;
  context?: SecurityContext;
}

// ============================================
// FUNÇÕES DE CONTEXTO DE SEGURANÇA
// ============================================

/**
 * Obtém o contexto de segurança do usuário atual
 * Retorna informações sobre o usuário e sua organização
 */
export async function getSecurityContext(): Promise<SecurityValidation> {
  try {
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        isValid: false,
        error: 'Usuário não autenticado'
      };
    }

    // Buscar a organização do usuário
    const { data: userOrg, error: orgError } = await supabase
      .from('user_organizations')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (orgError || !userOrg) {
      return {
        isValid: false,
        error: 'Usuário não pertence a nenhuma organização'
      };
    }

    return {
      isValid: true,
      context: {
        userId: user.id,
        organizationId: userOrg.organization_id,
        role: userOrg.role
      }
    };
  } catch (error: any) {
    console.error('Erro ao obter contexto de segurança:', error);
    return {
      isValid: false,
      error: error.message || 'Erro ao verificar permissões'
    };
  }
}

/**
 * Valida se o usuário tem permissão de administrador
 */
export async function validateAdminPermission(): Promise<SecurityValidation> {
  const validation = await getSecurityContext();
  
  if (!validation.isValid || !validation.context) {
    return validation;
  }

  if (validation.context.role !== 'admin' && validation.context.role !== 'owner') {
    return {
      isValid: false,
      error: 'Permissão negada. Requer função de administrador ou proprietário.'
    };
  }

  return validation;
}

/**
 * Valida se o usuário tem permissão de proprietário
 */
export async function validateOwnerPermission(): Promise<SecurityValidation> {
  const validation = await getSecurityContext();
  
  if (!validation.isValid || !validation.context) {
    return validation;
  }

  if (validation.context.role !== 'owner') {
    return {
      isValid: false,
      error: 'Permissão negada. Requer função de proprietário.'
    };
  }

  return validation;
}

// ============================================
// VALIDAÇÕES DE ACESSO A RECURSOS
// ============================================

/**
 * Valida se um recurso pertence à organização do usuário
 */
export async function validateResourceOwnership(
  resourceOrganizationId: string
): Promise<boolean> {
  const validation = await getSecurityContext();
  
  if (!validation.isValid || !validation.context) {
    return false;
  }

  return validation.context.organizationId === resourceOrganizationId;
}

/**
 * Valida se múltiplos recursos pertencem à organização do usuário
 */
export async function validateMultipleResourcesOwnership(
  resourceOrganizationIds: string[]
): Promise<boolean> {
  const validation = await getSecurityContext();
  
  if (!validation.isValid || !validation.context) {
    return false;
  }

  return resourceOrganizationIds.every(
    id => id === validation.context!.organizationId
  );
}

// ============================================
// QUERIES SEGURAS - EXEMPLOS
// ============================================

/**
 * Exemplo de query segura para farms
 * Sempre inclui o organization_id do usuário
 */
export async function getSecureFarms() {
  const validation = await getSecurityContext();
  
  if (!validation.isValid || !validation.context) {
    return { data: null, error: validation.error };
  }

  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .eq('organization_id', validation.context.organizationId);

  return { data, error };
}

/**
 * Exemplo de query segura para plots
 */
export async function getSecurePlots(farmId?: string) {
  const validation = await getSecurityContext();
  
  if (!validation.isValid || !validation.context) {
    return { data: null, error: validation.error };
  }

  let query = supabase
    .from('plots')
    .select('*')
    .eq('organization_id', validation.context.organizationId);

  if (farmId) {
    query = query.eq('farm_id', farmId);
  }

  const { data, error } = await query;

  return { data, error };
}

/**
 * Exemplo de query segura para soil analyses
 */
export async function getSecureSoilAnalyses(plotId?: string) {
  const validation = await getSecurityContext();
  
  if (!validation.isValid || !validation.context) {
    return { data: null, error: validation.error };
  }

  let query = supabase
    .from('soil_analyses')
    .select('*')
    .eq('organization_id', validation.context.organizationId);

  if (plotId) {
    query = query.eq('plot_id', plotId);
  }

  const { data, error } = await query;

  return { data, error };
}

// ============================================
// HELPERS PARA INSERÇÃO SEGURA
// ============================================

/**
 * Adiciona automaticamente organization_id aos dados a serem inseridos
 */
export async function addOrganizationIdToData<T extends Record<string, any>>(
  data: T
): Promise<{ data: T & { organization_id: string } | null; error?: string }> {
  const validation = await getSecurityContext();
  
  if (!validation.isValid || !validation.context) {
    return { data: null, error: validation.error };
  }

  return {
    data: {
      ...data,
      organization_id: validation.context.organizationId
    }
  };
}

/**
 * Valida e adiciona organization_id a múltiplos registros
 */
export async function addOrganizationIdToMultipleData<T extends Record<string, any>>(
  dataArray: T[]
): Promise<{ data: (T & { organization_id: string })[] | null; error?: string }> {
  const validation = await getSecurityContext();
  
  if (!validation.isValid || !validation.context) {
    return { data: null, error: validation.error };
  }

  return {
    data: dataArray.map(item => ({
      ...item,
      organization_id: validation.context!.organizationId
    }))
  };
}

// ============================================
// LOGGING DE SEGURANÇA
// ============================================

/**
 * Loga tentativas de acesso não autorizado
 */
export async function logSecurityViolation(
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: string
): Promise<void> {
  try {
    const validation = await getSecurityContext();
    
    console.error('🚨 VIOLAÇÃO DE SEGURANÇA DETECTADA', {
      timestamp: new Date().toISOString(),
      userId: validation.context?.userId || 'unknown',
      organizationId: validation.context?.organizationId || 'unknown',
      action,
      resourceType,
      resourceId,
      details,
      userAgent: navigator?.userAgent
    });

    // TODO: Implementar logging no banco de dados ou serviço externo
    // await supabase.from('security_logs').insert({...})
  } catch (error) {
    console.error('Erro ao logar violação de segurança:', error);
  }
}

/**
 * Valida e loga acesso a recurso
 */
export async function validateAndLogResourceAccess(
  resourceType: string,
  resourceOrganizationId: string,
  resourceId?: string
): Promise<boolean> {
  const isValid = await validateResourceOwnership(resourceOrganizationId);
  
  if (!isValid) {
    await logSecurityViolation(
      'access_denied',
      resourceType,
      resourceId,
      `Tentativa de acesso a recurso de outra organização`
    );
  }

  return isValid;
}

// ============================================
// CONSTANTES DE SEGURANÇA
// ============================================

export const SECURITY_ERRORS = {
  NOT_AUTHENTICATED: 'Usuário não autenticado',
  NO_ORGANIZATION: 'Usuário não pertence a nenhuma organização',
  PERMISSION_DENIED: 'Permissão negada',
  INVALID_RESOURCE: 'Recurso não pertence à sua organização',
  ADMIN_REQUIRED: 'Permissão de administrador necessária',
  OWNER_REQUIRED: 'Permissão de proprietário necessária',
} as const;

// ============================================
// TIPOS EXPORTADOS
// ============================================

export type SecurityError = typeof SECURITY_ERRORS[keyof typeof SECURITY_ERRORS];

