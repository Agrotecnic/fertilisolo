-- ============================================
-- POLÍTICAS RLS PARA SUPER ADMIN
-- ============================================
-- Permite que deyvidrb@icloud.com veja TODAS as organizações
-- Necessário para o painel Super Admin funcionar

-- ============================================
-- 1. Política para ver TODAS as organizações
-- ============================================

-- Criar política que permite super admin ver tudo
CREATE POLICY "Super admin can view all organizations"
ON organizations FOR SELECT
USING (
  -- Usuários normais veem apenas sua organização
  id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
  OR
  -- Super admin vê todas
  EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'deyvidrb@icloud.com'
  )
);

-- Remover política antiga (se existir)
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;

-- ============================================
-- 2. Política para themes (super admin)
-- ============================================

CREATE POLICY "Super admin can view all themes"
ON organization_themes FOR SELECT
USING (
  -- Usuários normais veem apenas tema da sua organização
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
  OR
  -- Super admin vê todos
  EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'deyvidrb@icloud.com'
  )
);

-- Remover política antiga
DROP POLICY IF EXISTS "Users can view their organization theme" ON organization_themes;

-- ============================================
-- 3. Política para user_organizations (super admin)
-- ============================================

CREATE POLICY "Super admin can view all user organizations"
ON user_organizations FOR SELECT
USING (
  -- Usuários normais veem apenas membros da sua organização
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
  OR
  -- Super admin vê todos
  EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'deyvidrb@icloud.com'
  )
);

-- Remover política antiga
DROP POLICY IF EXISTS "Users can view members of their organization" ON user_organizations;

-- ============================================
-- 4. Comentários e validação
-- ============================================

COMMENT ON POLICY "Super admin can view all organizations" ON organizations IS 
'Permite que usuários vejam sua organização OU que o super admin (deyvidrb@icloud.com) veja todas';

COMMENT ON POLICY "Super admin can view all themes" ON organization_themes IS 
'Permite que usuários vejam tema da sua organização OU que o super admin veja todos';

COMMENT ON POLICY "Super admin can view all user organizations" ON user_organizations IS 
'Permite que usuários vejam membros da sua organização OU que o super admin veja todos';

-- Log de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Políticas de Super Admin criadas com sucesso!';
  RAISE NOTICE '✅ Super admin (deyvidrb@icloud.com) pode ver todas as organizações';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Políticas atualizadas:';
  RAISE NOTICE '   - organizations: Super admin pode ver todas';
  RAISE NOTICE '   - organization_themes: Super admin pode ver todos';
  RAISE NOTICE '   - user_organizations: Super admin pode ver todos';
END $$;

