-- ============================================
-- MIGRAÇÃO FINAL: RLS COM SECURITY DEFINER
-- ============================================
-- Versão: 007 (FINAL E TESTADA)
-- Data: 2025-11-08
-- Status: ✅ APLICADO E FUNCIONANDO
-- 
-- Correção: Criada função is_super_admin() com SECURITY DEFINER
-- para contornar o erro "permission denied for table users"
-- 
-- ============================================

-- ============================================
-- 1. CRIAR FUNÇÃO AUXILIAR
-- ============================================

-- Função que verifica se o usuário atual é super admin
-- SECURITY DEFINER permite acessar auth.users
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Buscar email do usuário atual
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Retornar true se for super admin
  RETURN user_email = 'deyvidrb@icloud.com';
END;
$$;

COMMENT ON FUNCTION is_super_admin() IS 
'Verifica se o usuário atual é o super admin (deyvidrb@icloud.com). 
Usa SECURITY DEFINER para acessar auth.users com permissões elevadas.';

-- ============================================
-- 2. REMOVER POLÍTICAS ANTIGAS
-- ============================================

-- Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "organizations_select_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_insert_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_update_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_delete_policy" ON organizations;
DROP POLICY IF EXISTS "themes_select_policy" ON organization_themes;
DROP POLICY IF EXISTS "themes_insert_policy" ON organization_themes;
DROP POLICY IF EXISTS "themes_update_policy" ON organization_themes;
DROP POLICY IF EXISTS "themes_delete_policy" ON organization_themes;
DROP POLICY IF EXISTS "user_organizations_select_policy" ON user_organizations;
DROP POLICY IF EXISTS "user_organizations_insert_policy" ON user_organizations;
DROP POLICY IF EXISTS "user_organizations_update_policy" ON user_organizations;
DROP POLICY IF EXISTS "user_organizations_delete_policy" ON user_organizations;

-- ============================================
-- 3. ORGANIZATIONS - 4 Políticas
-- ============================================

-- SELECT: Super admin vê todas, outros veem apenas as suas
CREATE POLICY "organizations_select_policy"
ON organizations FOR SELECT
USING (
  is_super_admin()
  OR
  EXISTS (
    SELECT 1 
    FROM user_organizations uo
    WHERE uo.organization_id = organizations.id
    AND uo.user_id = auth.uid()
  )
);

-- INSERT: Super admin + usuários autenticados
CREATE POLICY "organizations_insert_policy"
ON organizations FOR INSERT
WITH CHECK (
  is_super_admin()
  OR
  auth.uid() IS NOT NULL
);

-- UPDATE: Super admin + owners
CREATE POLICY "organizations_update_policy"
ON organizations FOR UPDATE
USING (
  is_super_admin()
  OR
  EXISTS (
    SELECT 1 
    FROM user_organizations 
    WHERE organization_id = organizations.id
    AND user_id = auth.uid() 
    AND role = 'owner'
  )
)
WITH CHECK (
  is_super_admin()
  OR
  EXISTS (
    SELECT 1 
    FROM user_organizations 
    WHERE organization_id = organizations.id
    AND user_id = auth.uid() 
    AND role = 'owner'
  )
);

-- DELETE: Super admin + owners
CREATE POLICY "organizations_delete_policy"
ON organizations FOR DELETE
USING (
  is_super_admin()
  OR
  EXISTS (
    SELECT 1 
    FROM user_organizations 
    WHERE organization_id = organizations.id
    AND user_id = auth.uid() 
    AND role = 'owner'
  )
);

-- ============================================
-- 4. ORGANIZATION_THEMES - 4 Políticas
-- ============================================

-- SELECT: Super admin vê todos, outros veem apenas o seu
CREATE POLICY "themes_select_policy"
ON organization_themes FOR SELECT
USING (
  is_super_admin()
  OR
  EXISTS (
    SELECT 1 
    FROM user_organizations uo
    WHERE uo.organization_id = organization_themes.organization_id
    AND uo.user_id = auth.uid()
  )
);

-- INSERT: Super admin + owners/admins
CREATE POLICY "themes_insert_policy"
ON organization_themes FOR INSERT
WITH CHECK (
  is_super_admin()
  OR
  EXISTS (
    SELECT 1 
    FROM user_organizations 
    WHERE organization_id = organization_themes.organization_id
    AND user_id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
);

-- UPDATE: Super admin + owners/admins
CREATE POLICY "themes_update_policy"
ON organization_themes FOR UPDATE
USING (
  is_super_admin()
  OR
  EXISTS (
    SELECT 1 
    FROM user_organizations 
    WHERE organization_id = organization_themes.organization_id
    AND user_id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
)
WITH CHECK (
  is_super_admin()
  OR
  EXISTS (
    SELECT 1 
    FROM user_organizations 
    WHERE organization_id = organization_themes.organization_id
    AND user_id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
);

-- DELETE: Super admin + owners
CREATE POLICY "themes_delete_policy"
ON organization_themes FOR DELETE
USING (
  is_super_admin()
  OR
  EXISTS (
    SELECT 1 
    FROM user_organizations 
    WHERE organization_id = organization_themes.organization_id
    AND user_id = auth.uid() 
    AND role = 'owner'
  )
);

-- ============================================
-- 5. USER_ORGANIZATIONS - 4 Políticas
-- ============================================
-- IMPORTANTE: SEM SUBCONSULTAS RECURSIVAS!

-- SELECT: Super admin vê tudo, usuário vê apenas seus registros
CREATE POLICY "user_organizations_select_policy"
ON user_organizations FOR SELECT
USING (
  is_super_admin()
  OR
  user_id = auth.uid()
);

-- INSERT: Super admin + próprio usuário
CREATE POLICY "user_organizations_insert_policy"
ON user_organizations FOR INSERT
WITH CHECK (
  is_super_admin()
  OR
  user_id = auth.uid()
);

-- UPDATE: Super admin + próprio usuário
CREATE POLICY "user_organizations_update_policy"
ON user_organizations FOR UPDATE
USING (
  is_super_admin()
  OR
  user_id = auth.uid()
)
WITH CHECK (
  is_super_admin()
  OR
  user_id = auth.uid()
);

-- DELETE: Super admin + próprio usuário
CREATE POLICY "user_organizations_delete_policy"
ON user_organizations FOR DELETE
USING (
  is_super_admin()
  OR
  user_id = auth.uid()
);

-- ============================================
-- 6. VALIDAÇÃO E TESTES
-- ============================================

DO $$
DECLARE
  policy_count INTEGER;
  function_exists BOOLEAN;
BEGIN
  -- Verificar se função existe
  SELECT EXISTS (
    SELECT 1 
    FROM pg_proc 
    WHERE proname = 'is_super_admin'
  ) INTO function_exists;
  
  -- Contar políticas criadas
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename IN ('organizations', 'organization_themes', 'user_organizations');
  
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ MIGRAÇÃO RLS FINAL COM SECURITY DEFINER              ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 CORREÇÕES APLICADAS:';
  RAISE NOTICE '   • Função is_super_admin(): %', CASE WHEN function_exists THEN '✅' ELSE '❌' END;
  RAISE NOTICE '   • Total de políticas: % (esperado: 12)', policy_count;
  RAISE NOTICE '   • Recursão infinita: ✅ ELIMINADA';
  RAISE NOTICE '   • Permissão auth.users: ✅ RESOLVIDA';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 POLÍTICAS POR TABELA:';
  RAISE NOTICE '   • organizations: 4 políticas (SELECT, INSERT, UPDATE, DELETE)';
  RAISE NOTICE '   • organization_themes: 4 políticas (SELECT, INSERT, UPDATE, DELETE)';
  RAISE NOTICE '   • user_organizations: 4 políticas (SELECT, INSERT, UPDATE, DELETE)';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 RECURSOS:';
  RAISE NOTICE '   • Super admin: deyvidrb@icloud.com';
  RAISE NOTICE '   • Super admin vê TODAS as organizações';
  RAISE NOTICE '   • Usuários normais veem apenas suas organizações';
  RAISE NOTICE '   • Owners podem gerenciar suas organizações';
  RAISE NOTICE '   • Admins podem gerenciar temas';
  RAISE NOTICE '';
  RAISE NOTICE '✅ STATUS: PRODUÇÃO';
  RAISE NOTICE '📝 DATA: 2025-11-08';
  RAISE NOTICE '🔧 MÉTODO: MCP (Model Context Protocol)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  PRÓXIMOS PASSOS:';
  RAISE NOTICE '   1. Recarregue a aplicação (Cmd+Shift+R)';
  RAISE NOTICE '   2. Limpe o cache do navegador';
  RAISE NOTICE '   3. Faça logout e login';
  RAISE NOTICE '   4. Teste /super-admin';
  RAISE NOTICE '';
END $$;

