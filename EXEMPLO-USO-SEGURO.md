# 💡 Exemplos de Uso Seguro - Security Helpers

Este documento contém exemplos práticos de como implementar segurança multi-tenant no código.

---

## 📝 Índice

1. [Buscar Dados (SELECT)](#buscar-dados)
2. [Inserir Dados (INSERT)](#inserir-dados)
3. [Atualizar Dados (UPDATE)](#atualizar-dados)
4. [Deletar Dados (DELETE)](#deletar-dados)
5. [Validar Permissões](#validar-permissões)
6. [Componentes React](#componentes-react)
7. [Hooks Personalizados](#hooks-personalizados)

---

## 🔍 Buscar Dados (SELECT)

### ❌ ERRADO - Sem filtro de organização

```typescript
// NUNCA faça isso!
async function getFarms() {
  const { data, error } = await supabase
    .from('farms')
    .select('*');
  
  return { data, error };
}
```

### ✅ CORRETO - Com filtro de organização

```typescript
import { getSecurityContext } from '@/lib/securityHelpers';

async function getFarms() {
  // Obter contexto de segurança
  const validation = await getSecurityContext();
  
  if (!validation.isValid || !validation.context) {
    return { 
      data: null, 
      error: validation.error || 'Erro de autenticação' 
    };
  }

  // Query com filtro por organization_id
  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .eq('organization_id', validation.context.organizationId);
  
  return { data, error };
}
```

### ✅ MELHOR - Com tratamento de erro

```typescript
import { getSecurityContext } from '@/lib/securityHelpers';
import { useToast } from '@/hooks/use-toast';

async function getFarmsWithErrorHandling() {
  const { toast } = useToast();
  
  const validation = await getSecurityContext();
  
  if (!validation.isValid) {
    toast({
      variant: 'destructive',
      title: 'Erro de Segurança',
      description: validation.error
    });
    return { data: null, error: validation.error };
  }

  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .eq('organization_id', validation.context!.organizationId)
    .order('created_at', { ascending: false });
  
  if (error) {
    toast({
      variant: 'destructive',
      title: 'Erro ao buscar fazendas',
      description: error.message
    });
  }
  
  return { data, error };
}
```

---

## ➕ Inserir Dados (INSERT)

### ❌ ERRADO - Sem organization_id

```typescript
// NUNCA faça isso!
async function createFarm(name: string, location: string) {
  const { data, error } = await supabase
    .from('farms')
    .insert({ name, location })
    .select()
    .single();
  
  return { data, error };
}
```

### ✅ CORRETO - Com organization_id

```typescript
import { getSecurityContext } from '@/lib/securityHelpers';

async function createFarm(name: string, location: string) {
  const validation = await getSecurityContext();
  
  if (!validation.isValid || !validation.context) {
    return { data: null, error: validation.error };
  }

  const { data, error } = await supabase
    .from('farms')
    .insert({
      name,
      location,
      organization_id: validation.context.organizationId,
      user_id: validation.context.userId
    })
    .select()
    .single();
  
  return { data, error };
}
```

### ✅ MELHOR - Usando helper

```typescript
import { getSecurityContext, addOrganizationIdToData } from '@/lib/securityHelpers';

async function createFarmWithHelper(name: string, location: string, userId: string) {
  // Adiciona organization_id automaticamente
  const { data: secureData, error: securityError } = await addOrganizationIdToData({
    name,
    location,
    user_id: userId
  });

  if (securityError) {
    return { data: null, error: securityError };
  }

  const { data, error } = await supabase
    .from('farms')
    .insert(secureData!)
    .select()
    .single();
  
  return { data, error };
}
```

---

## ✏️ Atualizar Dados (UPDATE)

### ❌ ERRADO - Sem validação de ownership

```typescript
// NUNCA faça isso!
async function updateFarm(farmId: string, updates: any) {
  const { data, error } = await supabase
    .from('farms')
    .update(updates)
    .eq('id', farmId)
    .select()
    .single();
  
  return { data, error };
}
```

### ✅ CORRETO - Com validação

```typescript
import { getSecurityContext } from '@/lib/securityHelpers';

async function updateFarm(farmId: string, updates: any) {
  const validation = await getSecurityContext();
  
  if (!validation.isValid || !validation.context) {
    return { data: null, error: validation.error };
  }

  // Primeiro verificar se o farm pertence à organização
  const { data: existingFarm, error: fetchError } = await supabase
    .from('farms')
    .select('id, organization_id')
    .eq('id', farmId)
    .single();

  if (fetchError || !existingFarm) {
    return { data: null, error: 'Fazenda não encontrada' };
  }

  if (existingFarm.organization_id !== validation.context.organizationId) {
    return { 
      data: null, 
      error: 'Você não tem permissão para atualizar esta fazenda' 
    };
  }

  // Atualizar
  const { data, error } = await supabase
    .from('farms')
    .update(updates)
    .eq('id', farmId)
    .eq('organization_id', validation.context.organizationId) // Dupla segurança
    .select()
    .single();
  
  return { data, error };
}
```

### ✅ MELHOR - Com validação usando helper

```typescript
import { getSecurityContext, validateResourceOwnership, logSecurityViolation } from '@/lib/securityHelpers';

async function updateFarmSecure(farmId: string, updates: any) {
  const validation = await getSecurityContext();
  
  if (!validation.isValid || !validation.context) {
    return { data: null, error: validation.error };
  }

  // Buscar farm existente
  const { data: existingFarm } = await supabase
    .from('farms')
    .select('id, organization_id')
    .eq('id', farmId)
    .single();

  if (!existingFarm) {
    return { data: null, error: 'Fazenda não encontrada' };
  }

  // Validar ownership com logging
  const isOwner = await validateResourceOwnership(existingFarm.organization_id);
  
  if (!isOwner) {
    await logSecurityViolation(
      'unauthorized_update',
      'farms',
      farmId,
      'Tentativa de atualizar farm de outra organização'
    );
    
    return { 
      data: null, 
      error: 'Você não tem permissão para atualizar esta fazenda' 
    };
  }

  // Atualizar
  const { data, error } = await supabase
    .from('farms')
    .update(updates)
    .eq('id', farmId)
    .eq('organization_id', validation.context.organizationId)
    .select()
    .single();
  
  return { data, error };
}
```

---

## 🗑️ Deletar Dados (DELETE)

### ❌ ERRADO - Sem validação

```typescript
// NUNCA faça isso!
async function deleteFarm(farmId: string) {
  const { error } = await supabase
    .from('farms')
    .delete()
    .eq('id', farmId);
  
  return { success: !error, error };
}
```

### ✅ CORRETO - Com validação completa

```typescript
import { getSecurityContext, validateResourceOwnership, logSecurityViolation } from '@/lib/securityHelpers';

async function deleteFarm(farmId: string) {
  const validation = await getSecurityContext();
  
  if (!validation.isValid || !validation.context) {
    return { success: false, error: validation.error };
  }

  // Buscar farm para validar
  const { data: existingFarm } = await supabase
    .from('farms')
    .select('id, name, organization_id')
    .eq('id', farmId)
    .single();

  if (!existingFarm) {
    return { success: false, error: 'Fazenda não encontrada' };
  }

  // Validar ownership
  const isOwner = await validateResourceOwnership(existingFarm.organization_id);
  
  if (!isOwner) {
    await logSecurityViolation(
      'unauthorized_delete',
      'farms',
      farmId,
      `Tentativa de deletar farm "${existingFarm.name}" de outra organização`
    );
    
    return { 
      success: false, 
      error: 'Você não tem permissão para deletar esta fazenda' 
    };
  }

  // Deletar com dupla validação
  const { error } = await supabase
    .from('farms')
    .delete()
    .eq('id', farmId)
    .eq('organization_id', validation.context.organizationId);
  
  return { success: !error, error: error?.message };
}
```

---

## 🔐 Validar Permissões

### Verificar Permissão de Admin

```typescript
import { validateAdminPermission } from '@/lib/securityHelpers';
import { useToast } from '@/hooks/use-toast';

async function updateOrganizationSettings(settings: any) {
  const { toast } = useToast();
  
  // Validar permissão de admin
  const validation = await validateAdminPermission();
  
  if (!validation.isValid) {
    toast({
      variant: 'destructive',
      title: 'Acesso Negado',
      description: validation.error
    });
    return { success: false, error: validation.error };
  }

  // Prosseguir com operação de admin
  // ...
}
```

### Verificar Permissão de Owner

```typescript
import { validateOwnerPermission } from '@/lib/securityHelpers';

async function deleteOrganization(orgId: string) {
  // Apenas owners podem deletar organização
  const validation = await validateOwnerPermission();
  
  if (!validation.isValid) {
    return { 
      success: false, 
      error: 'Apenas o proprietário pode deletar a organização' 
    };
  }

  // Prosseguir com deleção
  // ...
}
```

---

## ⚛️ Componentes React

### Hook Personalizado para Dados Seguros

```typescript
// hooks/useSecureFarms.ts
import { useState, useEffect } from 'react';
import { getSecurityContext } from '@/lib/securityHelpers';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export function useSecureFarms() {
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    setLoading(true);
    setError(null);

    const validation = await getSecurityContext();
    
    if (!validation.isValid || !validation.context) {
      setError(validation.error || 'Erro de autenticação');
      setLoading(false);
      
      toast({
        variant: 'destructive',
        title: 'Erro de Segurança',
        description: validation.error
      });
      
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('farms')
      .select('*')
      .eq('organization_id', validation.context.organizationId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar fazendas',
        description: fetchError.message
      });
    } else {
      setFarms(data || []);
    }

    setLoading(false);
  };

  return { farms, loading, error, reload: loadFarms };
}
```

### Componente com Validação de Permissão

```typescript
// components/OrganizationSettings.tsx
import { useState, useEffect } from 'react';
import { validateAdminPermission } from '@/lib/securityHelpers';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export function OrganizationSettings() {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const validation = await validateAdminPermission();
    setHasPermission(validation.isValid);
    setLoading(false);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!hasPermission) {
    return (
      <Alert variant="destructive">
        Você não tem permissão para acessar esta página.
        Apenas administradores e proprietários podem ver configurações da organização.
      </Alert>
    );
  }

  return (
    <div>
      {/* Conteúdo das configurações */}
      <h1>Configurações da Organização</h1>
      {/* ... */}
    </div>
  );
}
```

---

## 🎣 Hooks Personalizados

### Hook useSecurityContext

```typescript
// hooks/useSecurityContext.ts
import { useState, useEffect } from 'react';
import { getSecurityContext, SecurityContext } from '@/lib/securityHelpers';

export function useSecurityContext() {
  const [context, setContext] = useState<SecurityContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContext();
  }, []);

  const loadContext = async () => {
    const validation = await getSecurityContext();
    
    if (validation.isValid && validation.context) {
      setContext(validation.context);
    } else {
      setError(validation.error || 'Erro ao carregar contexto');
    }
    
    setLoading(false);
  };

  return { context, loading, error, reload: loadContext };
}
```

### Hook useOrganizationData

```typescript
// hooks/useOrganizationData.ts
import { useState, useEffect } from 'react';
import { useSecurityContext } from './useSecurityContext';
import { supabase } from '@/lib/supabase';

export function useOrganizationData<T>(
  table: string,
  options?: { orderBy?: string; ascending?: boolean }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { context } = useSecurityContext();

  useEffect(() => {
    if (context) {
      loadData();
    }
  }, [context]);

  const loadData = async () => {
    if (!context) return;

    setLoading(true);

    let query = supabase
      .from(table)
      .select('*')
      .eq('organization_id', context.organizationId);

    if (options?.orderBy) {
      query = query.order(options.orderBy, { 
        ascending: options.ascending ?? true 
      });
    }

    const { data: fetchedData, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setData((fetchedData as T[]) || []);
    }

    setLoading(false);
  };

  return { data, loading, error, reload: loadData };
}

// Uso:
// const { data: farms, loading } = useOrganizationData<Farm>('farms', { 
//   orderBy: 'created_at', 
//   ascending: false 
// });
```

---

## 📚 Resumo de Boas Práticas

✅ **SEMPRE:**
- Use `getSecurityContext()` antes de queries
- Filtre por `organization_id`
- Valide ownership antes de UPDATE/DELETE
- Trate erros de segurança adequadamente
- Use helpers sempre que possível
- Logue tentativas de acesso não autorizado

❌ **NUNCA:**
- Faça queries sem filtro de organização
- Confie apenas no RLS (use validação no código também)
- Ignore erros de validação de segurança
- Exponha organization_id na URL ou UI
- Permita usuário escolher organization_id manualmente

---

## 🔗 Links Úteis

- [Documentação Completa](SEGURANCA-MULTI-TENANT.md)
- [Guia Rápido](GUIA-RAPIDO-SEGURANCA.md)
- [Security Helpers](src/lib/securityHelpers.ts)
- [Migração RLS](supabase/migrations/003_complete_rls_security.sql)

