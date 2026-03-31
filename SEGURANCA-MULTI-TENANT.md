# 🔒 Segurança Multi-Tenant - White Label

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura de Segurança](#arquitetura-de-segurança)
3. [Row Level Security (RLS)](#row-level-security-rls)
4. [Implementação no Código](#implementação-no-código)
5. [Validações e Testes](#validações-e-testes)
6. [Checklist de Segurança](#checklist-de-segurança)
7. [Procedimentos de Auditoria](#procedimentos-de-auditoria)

---

## 🎯 Visão Geral

Este documento descreve a arquitetura de segurança implementada para garantir **isolamento total de dados** entre organizações no sistema white-label FertiliSolo.

### Princípios Fundamentais

✅ **Isolamento Completo**: Cada organização acessa APENAS seus próprios dados  
✅ **Segurança em Camadas**: Proteção no banco de dados (RLS) + validação no código  
✅ **Auditoria**: Logs de tentativas de acesso não autorizado  
✅ **Fail-Safe**: Em caso de dúvida, negar acesso

---

## 🏗️ Arquitetura de Segurança

### 1. Camada de Banco de Dados

```
┌─────────────────────────────────────────┐
│    ROW LEVEL SECURITY (RLS)            │
│  ✓ Políticas em todas as tabelas       │
│  ✓ Filtragem automática por org_id     │
│  ✓ Validação em INSERT/UPDATE/DELETE   │
└─────────────────────────────────────────┘
```

### 2. Camada de Aplicação

```
┌─────────────────────────────────────────┐
│    SECURITY HELPERS                     │
│  ✓ Validação de contexto do usuário    │
│  ✓ Verificação de permissões           │
│  ✓ Injeção automática de org_id        │
└─────────────────────────────────────────┘
```

### 3. Camada de Interface

```
┌─────────────────────────────────────────┐
│    THEME PROVIDER                       │
│  ✓ Tema isolado por organização        │
│  ✓ Logo e cores personalizadas         │
│  ✓ Contexto de organização global      │
└─────────────────────────────────────────┘
```

---

## 🛡️ Row Level Security (RLS)

### Tabelas Protegidas

Todas as tabelas principais têm RLS habilitado:

- ✅ `organizations`
- ✅ `organization_themes`
- ✅ `user_organizations`
- ✅ `organization_invites`
- ✅ `farms`
- ✅ `plots`
- ✅ `soil_analyses`
- ✅ `fertilizer_recommendations`

### Como Funciona

```sql
-- Exemplo de política RLS para farms
CREATE POLICY "Users can view farms of their organization"
ON farms FOR SELECT
USING (organization_id = get_user_organization_id());
```

Isso significa que:
1. ✅ Usuário da Organização A vê APENAS farms da Organização A
2. ❌ Usuário da Organização A NÃO pode ver farms da Organização B
3. ✅ Mesmo que o código tente buscar todos os dados, o RLS filtra automaticamente

### Funções Auxiliares no Banco

```sql
-- Retorna o organization_id do usuário autenticado
get_user_organization_id() → UUID

-- Verifica se usuário pertence a uma organização
user_belongs_to_organization(org_id UUID) → BOOLEAN

-- Verifica se usuário é admin/owner
user_is_admin_of_organization(org_id UUID) → BOOLEAN
```

### Triggers de Segurança

Todas as tabelas principais têm triggers que:
1. ✅ Definem automaticamente `organization_id` ao inserir
2. ✅ Validam que o usuário pertence à organização
3. ✅ Impedem inserção com `organization_id` de outra organização

---

## 💻 Implementação no Código

### 1. Security Helpers

Sempre use as funções do `securityHelpers.ts`:

```typescript
import { getSecurityContext, validateAdminPermission } from '@/lib/securityHelpers';

// Obter contexto de segurança
const validation = await getSecurityContext();
if (!validation.isValid) {
  // Tratar erro
  return;
}

// Usar organization_id nas queries
const { organizationId } = validation.context;
```

### 2. Queries Seguras

❌ **NUNCA faça isso:**
```typescript
// ERRADO - Busca dados de TODAS as organizações
const { data } = await supabase
  .from('farms')
  .select('*');
```

✅ **SEMPRE faça isso:**
```typescript
// CORRETO - Busca apenas da organização do usuário
const validation = await getSecurityContext();
const { data } = await supabase
  .from('farms')
  .select('*')
  .eq('organization_id', validation.context.organizationId);
```

### 3. Inserção Segura

✅ **Use o helper:**
```typescript
import { addOrganizationIdToData } from '@/lib/securityHelpers';

// Adiciona automaticamente organization_id
const { data: secureData, error } = await addOrganizationIdToData({
  name: 'Fazenda Nova',
  location: 'São Paulo'
});

if (error) {
  // Tratar erro
  return;
}

// Inserir com dados seguros
await supabase.from('farms').insert(secureData);
```

### 4. Validação de Permissões

```typescript
import { validateAdminPermission } from '@/lib/securityHelpers';

async function updateOrganizationSettings() {
  // Validar permissão de admin
  const validation = await validateAdminPermission();
  
  if (!validation.isValid) {
    toast({
      variant: 'destructive',
      title: 'Permissão negada',
      description: validation.error
    });
    return;
  }

  // Prosseguir com a operação
  // ...
}
```

---

## ✅ Checklist de Segurança

### Para Desenvolvedores

Ao criar uma nova funcionalidade, verifique:

- [ ] A tabela tem coluna `organization_id`?
- [ ] RLS está habilitado na tabela?
- [ ] Políticas RLS foram criadas (SELECT, INSERT, UPDATE, DELETE)?
- [ ] Todas as queries filtram por `organization_id`?
- [ ] Inserções incluem `organization_id`?
- [ ] Funções validam contexto de segurança?
- [ ] Erros de permissão são tratados adequadamente?
- [ ] Logs de segurança são registrados?

### Para QA/Testes

- [ ] Criar 2 organizações de teste (Org A e Org B)
- [ ] Criar usuários em cada organização
- [ ] Tentar acessar dados da Org B logado como usuário da Org A
- [ ] Verificar que o acesso é negado
- [ ] Tentar inserir dados com `organization_id` de outra organização
- [ ] Verificar que é bloqueado pelo trigger
- [ ] Tentar atualizar `organization_id` de um registro existente
- [ ] Verificar que é bloqueado pelo trigger

---

## 🔍 Validações e Testes

### Teste Manual no SQL Editor

```sql
-- 1. Criar duas organizações de teste
INSERT INTO organizations (name, slug) VALUES 
  ('Org A', 'org-a'),
  ('Org B', 'org-b');

-- 2. Criar farms em cada organização
INSERT INTO farms (name, organization_id) VALUES
  ('Farm A1', (SELECT id FROM organizations WHERE slug = 'org-a')),
  ('Farm B1', (SELECT id FROM organizations WHERE slug = 'org-b'));

-- 3. Tentar buscar farms (como usuário da Org A)
-- Deve retornar APENAS farms da Org A
SELECT * FROM farms;

-- 4. Tentar inserir farm com organization_id errado
-- Deve FALHAR
INSERT INTO farms (name, organization_id) VALUES
  ('Farm Inválida', (SELECT id FROM organizations WHERE slug = 'org-b'));
```

### Script de Teste Automatizado

Ver arquivo: `scripts/test-security.ts`

---

## 📊 Procedimentos de Auditoria

### 1. Auditoria Mensal

Execute o seguinte script para verificar integridade:

```sql
-- Verificar registros sem organization_id
SELECT 'farms' as table_name, COUNT(*) as count_without_org_id
FROM farms WHERE organization_id IS NULL
UNION ALL
SELECT 'plots', COUNT(*)
FROM plots WHERE organization_id IS NULL
UNION ALL
SELECT 'soil_analyses', COUNT(*)
FROM soil_analyses WHERE organization_id IS NULL;

-- Resultado esperado: todas as contagens = 0
```

### 2. Verificar Políticas RLS

```sql
-- Listar todas as políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 3. Logs de Segurança

Verificar logs do console para:
- 🚨 Violações de segurança
- ⚠️ Tentativas de acesso negado
- ❌ Erros de permissão

---

## 🚨 Incidentes de Segurança

### Se detectar acesso não autorizado:

1. ✅ **Isolar**: Desativar a organização afetada temporariamente
2. ✅ **Investigar**: Verificar logs e rastrear origem
3. ✅ **Corrigir**: Aplicar fix na política RLS ou código
4. ✅ **Documentar**: Registrar incidente e ação tomada
5. ✅ **Notificar**: Informar stakeholders se necessário

### Comandos de Emergência

```sql
-- Desativar organização
UPDATE organizations 
SET is_active = false 
WHERE id = 'ORG_ID_SUSPEITA';

-- Revogar todas as sessões de um usuário
SELECT auth.uid(); -- copiar user_id
-- No Dashboard: Authentication > Users > [selecionar usuário] > Sign out
```

---

## 📞 Suporte

Em caso de dúvidas sobre segurança:
- 📧 Email: [seu-email-aqui]
- 📱 Telegram: [seu-telegram-aqui]
- 🔒 Para vulnerabilidades críticas: contato direto

---

## 📝 Histórico de Atualizações

| Data | Versão | Descrição |
|------|--------|-----------|
| 2025-01-08 | 1.0 | Implementação inicial completa de RLS e security helpers |

---

## ⚖️ Responsabilidades

- **Desenvolvedores**: Seguir práticas de segurança ao criar código
- **DevOps**: Monitorar logs e aplicar patches de segurança
- **QA**: Testar isolamento entre organizações
- **Product**: Revisar permissões e roles antes de release

---

**🔒 LEMBRE-SE: Segurança é responsabilidade de todos!**

