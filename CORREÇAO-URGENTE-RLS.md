# 🚨 CORREÇÃO URGENTE: Recursão Infinita RLS

## ⚠️ PROBLEMA CRÍTICO

As políticas RLS criadas no arquivo `004_super_admin_rls_policy.sql` causaram **recursão infinita** que está impedindo o funcionamento da aplicação.

### Erro:
```
infinite recursion detected in policy for relation "user_organizations"
```

### Causa:
A política fazia referência à própria tabela `user_organizations` dentro de sua condição, criando um loop infinito.

---

## ✅ SOLUÇÃO IMEDIATA

### 1️⃣ Acesse o Supabase SQL Editor

Vá para: https://supabase.com/dashboard/project/SEU_PROJECT_ID/sql/new

### 2️⃣ Execute o Script de Correção

Copie **TODO o conteúdo** do arquivo:
```
supabase/migrations/005_fix_rls_recursion.sql
```

E execute no SQL Editor.

### 3️⃣ Aguarde a Confirmação

Você verá mensagens como:
```
✅ Políticas RLS corrigidas com sucesso!
✅ Recursão infinita removida
```

### 4️⃣ Recarregue a Aplicação

Após executar o script:
- Feche completamente o navegador
- Limpe o cache (Cmd+Shift+R no Mac)
- Abra novamente

---

## 🔍 O QUE FOI CORRIGIDO

### ❌ ANTES (Com Recursão):
```sql
CREATE POLICY "..." ON user_organizations
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations  -- ← Loop infinito! 💥
    WHERE user_id = auth.uid()
  )
);
```

### ✅ DEPOIS (Sem Recursão):
```sql
CREATE POLICY "user_organizations_select_policy"
ON user_organizations FOR SELECT
USING (
  -- Super admin vê tudo (SEM subconsulta!)
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'deyvidrb@icloud.com'
  OR
  -- Usuário vê seus próprios registros
  user_id = auth.uid()
);
```

---

## 🎯 VALIDAÇÃO

### Teste 1: Login Normal
1. Acesse como usuário normal
2. Deve ver apenas sua organização
3. ✅ Se funcionar, está correto!

### Teste 2: Super Admin
1. Acesse com `deyvidrb@icloud.com`
2. Vá para `/super-admin`
3. Deve ver todas as organizações (incluindo DND)
4. ✅ Se aparecer a organização DND, está correto!

### Teste 3: Console do Navegador
1. Abra o Console (F12)
2. Não deve mais aparecer erros de recursão
3. ✅ Se não houver erros 500, está correto!

---

## 📋 CRONOGRAMA DE APLICAÇÃO

| Etapa | Ação | Status |
|-------|------|--------|
| 1 | Ler este guia | ⏳ |
| 2 | Acessar Supabase SQL Editor | ⏳ |
| 3 | Executar `005_fix_rls_recursion.sql` | ⏳ |
| 4 | Ver mensagem de sucesso | ⏳ |
| 5 | Recarregar aplicação | ⏳ |
| 6 | Testar login normal | ⏳ |
| 7 | Testar super admin | ⏳ |
| 8 | Confirmar sem erros | ⏳ |

---

## 🆘 SE AINDA HOUVER PROBLEMAS

### Problema 1: Ainda vejo erro de recursão
**Solução:**
1. Execute novamente o script `005_fix_rls_recursion.sql`
2. Certifique-se de copiar TODO o conteúdo
3. Limpe o cache do navegador completamente

### Problema 2: Não vejo nenhuma organização
**Solução:**
1. Verifique se está logado
2. Verifique se o usuário tem uma organização associada
3. Execute a query de diagnóstico:
```sql
-- Ver suas organizações
SELECT * FROM user_organizations WHERE user_id = auth.uid();
```

### Problema 3: Super admin não vê todas organizações
**Solução:**
1. Confirme que está logado com `deyvidrb@icloud.com`
2. Verifique a política com:
```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'user_organizations';
```

---

## 📞 SUPORTE

Se após seguir todos os passos o problema persistir:

1. **Capture logs completos:**
   - Abra Console do navegador (F12)
   - Vá para aba "Network"
   - Reproduza o erro
   - Tire screenshot dos erros

2. **Verifique políticas RLS:**
```sql
-- Ver todas as políticas de user_organizations
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename IN ('user_organizations', 'organizations', 'organization_themes');
```

3. **Teste conexão direta:**
```sql
-- Testar se você é super admin
SELECT 
  id,
  email,
  CASE 
    WHEN email = 'deyvidrb@icloud.com' THEN '✅ SUPER ADMIN'
    ELSE '❌ Normal User'
  END as status
FROM auth.users 
WHERE id = auth.uid();
```

---

## ✅ CONFIRMAÇÃO FINAL

Após aplicar a correção, você deve ver:

- ✅ Aplicação carrega sem erros 500
- ✅ Usuários normais veem apenas sua organização
- ✅ Super admin vê TODAS as organizações
- ✅ Console sem erros de recursão
- ✅ Todas as funcionalidades normais funcionando

**Tempo estimado para correção:** 5 minutos

**Prioridade:** 🔴 **MÁXIMA - APLICAR IMEDIATAMENTE**

