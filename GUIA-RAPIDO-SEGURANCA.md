# 🚀 Guia Rápido: Aplicar Segurança Multi-Tenant

## ⏱️ Tempo estimado: 10-15 minutos

Este guia passo a passo garante que sua instância do FertiliSolo está com **isolamento total** de dados entre organizações.

---

## 📋 Pré-requisitos

- ✅ Acesso ao Supabase Dashboard
- ✅ Projeto FertiliSolo configurado
- ✅ Pelo menos 1 organização criada

---

## 🔧 Passo 1: Aplicar Migração de Segurança

### Via Supabase Dashboard

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto FertiliSolo
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Copie TODO o conteúdo do arquivo:
   ```
   supabase/migrations/003_complete_rls_security.sql
   ```
6. Cole no editor
7. Clique em **Run** (ou pressione Cmd/Ctrl + Enter)
8. Aguarde a mensagem de sucesso ✅

**Tempo: ~2 minutos**

---

## 🧪 Passo 2: Executar Testes de Segurança

1. No **SQL Editor** do Supabase
2. Clique em **New Query**
3. Copie o conteúdo de:
   ```
   scripts/test-security.sql
   ```
4. Cole e execute
5. **IMPORTANTE**: Revise TODOS os resultados
6. Certifique-se de que todos os testes têm ✅

### ❌ Se algum teste falhou:

- **RLS não habilitado**: Execute novamente a migração 003
- **Políticas faltando**: Verifique erros na execução da migração
- **Registros sem org_id**: Execute script de correção (ver abaixo)

**Tempo: ~3 minutos**

---

## 🔄 Passo 3: Atualizar Dados Existentes (Se Necessário)

Se você já tem dados no sistema **SEM** `organization_id`:

```sql
-- ⚠️ ATENÇÃO: Execute apenas UMA VEZ após revisar!

-- 1. Identifique qual organização os dados pertencem
SELECT id, name, slug FROM organizations;

-- 2. Atualize farms (substitua ORG_ID_AQUI)
UPDATE farms 
SET organization_id = 'ORG_ID_AQUI'
WHERE organization_id IS NULL;

-- 3. Atualize plots (substitua ORG_ID_AQUI)
UPDATE plots 
SET organization_id = 'ORG_ID_AQUI'
WHERE organization_id IS NULL;

-- 4. Atualize soil_analyses (substitua ORG_ID_AQUI)
UPDATE soil_analyses 
SET organization_id = 'ORG_ID_AQUI'
WHERE organization_id IS NULL;

-- 5. Atualize fertilizer_recommendations (substitua ORG_ID_AQUI)
UPDATE fertilizer_recommendations 
SET organization_id = 'ORG_ID_AQUI'
WHERE organization_id IS NULL;
```

**Tempo: ~2 minutos**

---

## 🎨 Passo 4: Configurar Políticas de Storage (Logos)

1. No Supabase Dashboard, vá em **Storage**
2. Crie o bucket `organization-assets` (se não existir)
3. Marque como **Public bucket**
4. Vá em **Policies** do bucket
5. Adicione as políticas:

### Política 1: Visualização Pública

```sql
CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'organization-assets');
```

### Política 2: Upload por Admins

```sql
CREATE POLICY "Admins can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'organization-assets' 
  AND auth.uid() IN (
    SELECT user_id FROM user_organizations 
    WHERE role IN ('admin', 'owner')
  )
);
```

### Política 3: Delete por Admins

```sql
CREATE POLICY "Admins can delete logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'organization-assets' 
  AND auth.uid() IN (
    SELECT user_id FROM user_organizations 
    WHERE role IN ('admin', 'owner')
  )
);
```

**Tempo: ~3 minutos**

---

## ✅ Passo 5: Validação Final

Execute esta query para validar tudo:

```sql
-- Verificação rápida
SELECT 
  'organizations' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE is_active = true) as active_records
FROM organizations
UNION ALL
SELECT 'farms', COUNT(*), COUNT(*) 
FROM farms WHERE organization_id IS NOT NULL
UNION ALL
SELECT 'plots', COUNT(*), COUNT(*) 
FROM plots WHERE organization_id IS NOT NULL
UNION ALL
SELECT 'soil_analyses', COUNT(*), COUNT(*) 
FROM soil_analyses WHERE organization_id IS NOT NULL;
```

**Resultados esperados:**
- Todas as contagens devem ser iguais (total = active/with_org_id)
- Se houver diferença, há registros sem `organization_id`

**Tempo: ~1 minuto**

---

## 🧑‍💻 Passo 6: Atualizar Código da Aplicação

### 6.1. Usar Security Helpers

Em TODOS os arquivos que fazem queries ao banco, importe:

```typescript
import { getSecurityContext } from '@/lib/securityHelpers';
```

### 6.2. Exemplo de Uso

```typescript
// ANTES (inseguro)
const { data: farms } = await supabase
  .from('farms')
  .select('*');

// DEPOIS (seguro)
const validation = await getSecurityContext();
if (!validation.isValid) {
  console.error(validation.error);
  return;
}

const { data: farms } = await supabase
  .from('farms')
  .select('*')
  .eq('organization_id', validation.context.organizationId);
```

### 6.3. Arquivos Prioritários para Revisar

- `src/pages/*` - Todas as páginas
- `src/components/*` - Componentes que fazem queries
- `src/lib/*` - Serviços de API

**Tempo: ~5 minutos (revisão inicial)**

---

## 🎯 Checklist Final

Antes de ir para produção, confirme:

- [ ] Migração 003_complete_rls_security.sql aplicada com sucesso
- [ ] Todos os testes de segurança passaram (✅)
- [ ] Dados existentes atualizados com organization_id
- [ ] Políticas de Storage configuradas
- [ ] Código atualizado para usar securityHelpers
- [ ] Teste manual: Criar 2 organizações e verificar isolamento
- [ ] Backup do banco de dados criado

---

## 🧪 Teste Manual Completo

### 1. Criar Organização A

```sql
INSERT INTO organizations (name, slug) 
VALUES ('Empresa A', 'empresa-a')
RETURNING id;
```

### 2. Criar Organização B

```sql
INSERT INTO organizations (name, slug) 
VALUES ('Empresa B', 'empresa-b')
RETURNING id;
```

### 3. Criar Usuários

- Cadastre 2 usuários no sistema (um para cada org)
- Associe cada um à sua organização:

```sql
-- Buscar user_id
SELECT id, email FROM auth.users;

-- Associar User A à Org A
INSERT INTO user_organizations (user_id, organization_id, role)
VALUES ('USER_A_ID', 'ORG_A_ID', 'owner');

-- Associar User B à Org B
INSERT INTO user_organizations (user_id, organization_id, role)
VALUES ('USER_B_ID', 'ORG_B_ID', 'owner');
```

### 4. Criar Dados de Teste

Login como **User A** e crie:
- 1 Farm
- 1 Plot
- 1 Soil Analysis

Login como **User B** e crie:
- 1 Farm
- 1 Plot
- 1 Soil Analysis

### 5. Validar Isolamento

✅ **Teste passou se:**
- User A vê APENAS dados da Org A
- User B vê APENAS dados da Org B
- Tentativa de acessar dados da outra org resulta em erro

❌ **Teste falhou se:**
- User A consegue ver dados da Org B
- Queries retornam dados de ambas as organizações

---

## 🆘 Troubleshooting

### Problema: RLS não está funcionando

**Solução:**
```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Se rowsecurity = false, habilitar:
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
-- Repetir para todas as tabelas
```

### Problema: Trigger não está funcionando

**Solução:**
```sql
-- Verificar triggers
SELECT tgname, tgrelid::regclass, tgenabled 
FROM pg_trigger 
WHERE tgname LIKE 'ensure%';

-- Se tgenabled = 'D' (disabled), reexecutar migração 003
```

### Problema: Políticas RLS faltando

**Solução:**
```sql
-- Listar políticas existentes
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Se faltarem políticas, reexecutar migração 003
```

---

## 📞 Suporte

Se encontrar problemas:

1. ✅ Consulte `SEGURANCA-MULTI-TENANT.md` para detalhes
2. ✅ Execute `scripts/test-security.sql` novamente
3. ✅ Verifique logs do Supabase
4. ✅ Entre em contato com a equipe de desenvolvimento

---

## ✨ Conclusão

Após seguir todos os passos, seu sistema estará com:

✅ Isolamento total de dados entre organizações  
✅ Row Level Security habilitado em todas as tabelas  
✅ Políticas RLS configuradas corretamente  
✅ Triggers de validação ativos  
✅ Funções auxiliares de segurança disponíveis  

**🔒 Seu sistema está SEGURO para uso multi-tenant!**

---

## 📅 Manutenção

Execute mensalmente:
- `scripts/test-security.sql` - Verificar integridade
- Revisar logs de segurança
- Auditar acessos suspeitos
- Atualizar documentação se necessário

