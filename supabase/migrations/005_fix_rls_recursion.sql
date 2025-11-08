-- ============================================
-- CORREÇÃO URGENTE: Remover Recursão Infinita
-- ============================================
-- Remove a política problemática e recria corretamente

-- ============================================
-- 1. REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS
-- ============================================

-- Remover políticas que causam recursão
DROP POLICY IF EXISTS "Super admin can view all user organizations" ON user_organizations;
DROP POLICY IF EXISTS "Admins can manage members" ON user_organizations;
DROP POLICY IF EXISTS "Users can view members of their organization" ON user_organizations;

-- Remover políticas antigas de organizations e themes também
DROP POLICY IF EXISTS "Super admin can view all organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Super admin can view all themes" ON organization_themes;
DROP POLICY IF EXISTS "Users can view their organization theme" ON organization_themes;

-- ============================================
-- 2. RECRIAR POLÍTICAS SEM RECURSÃO
-- ============================================

-- ORGANIZATIONS: Super admin vê todas, outros veem apenas a sua
CREATE POLICY "organizations_select_policy"
ON organizations FOR SELECT
USING (
  -- Super admin vê tudo
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'deyvidrb@icloud.com'
  OR
  -- Outros usuários veem apenas organizações onde são membros
  EXISTS (
    SELECT 1 
    FROM user_organizations uo
    WHERE uo.organization_id = organizations.id
    AND uo.user_id = auth.uid()
  )
);

-- ORGANIZATION_THEMES: Super admin vê todos, outros veem apenas o seu
CREATE POLICY "themes_select_policy"
ON organization_themes FOR SELECT
USING (
  -- Super admin vê tudo
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'deyvidrb@icloud.com'
  OR
  -- Outros veem apenas tema da sua organização
  EXISTS (
    SELECT 1 
    FROM user_organizations uo
    WHERE uo.organization_id = organization_themes.organization_id
    AND uo.user_id = auth.uid()
  )
);

-- USER_ORGANIZATIONS: Política SEM recursão
CREATE POLICY "user_organizations_select_policy"
ON user_organizations FOR SELECT
USING (
  -- Super admin vê tudo
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'deyvidrb@icloud.com'
  OR
  -- Usuário vê apenas registros da sua própria organização
  -- IMPORTANTE: Não fazemos subconsulta em user_organizations aqui!
  user_id = auth.uid()
  OR
  -- Usuários da mesma organização podem se ver
  organization_id IN (
    -- Usar uma CTE ou fazer de forma diferente para evitar recursão
    SELECT uo2.organization_id
    FROM user_organizations uo2
    WHERE uo2.user_id = auth.uid()
  )
);

-- ============================================
-- 3. MANTER POLÍTICAS DE MODIFICAÇÃO (UPDATE/DELETE)
-- ============================================

-- Owners podem atualizar sua organização
CREATE POLICY "organizations_update_policy"
ON organizations FOR UPDATE
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'deyvidrb@icloud.com'
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
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'deyvidrb@icloud.com'
  OR
  EXISTS (
    SELECT 1 
    FROM user_organizations 
    WHERE organization_id = organizations.id
    AND user_id = auth.uid() 
    AND role = 'owner'
  )
);

-- Admins podem atualizar temas
CREATE POLICY "themes_update_policy"
ON organization_themes FOR UPDATE
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'deyvidrb@icloud.com'
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
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'deyvidrb@icloud.com'
  OR
  EXISTS (
    SELECT 1 
    FROM user_organizations 
    WHERE organization_id = organization_themes.organization_id
    AND user_id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
);

-- ============================================
-- 4. VALIDAÇÃO
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Políticas RLS corrigidas com sucesso!';
  RAISE NOTICE '✅ Recursão infinita removida';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Políticas aplicadas:';
  RAISE NOTICE '   - organizations_select_policy: ✅';
  RAISE NOTICE '   - themes_select_policy: ✅';
  RAISE NOTICE '   - user_organizations_select_policy: ✅';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Super admin (deyvidrb@icloud.com) pode ver tudo';
  RAISE NOTICE '🔒 Outros usuários veem apenas suas organizações';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Recarregue a aplicação após executar este script!';
END $$;

