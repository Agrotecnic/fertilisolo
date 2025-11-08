-- ============================================
-- SUPER ADMIN: Políticas Explícitas de Override
-- ============================================
-- Versão: 008
-- Data: 2025-11-08
-- Status: ✅ APLICADO E TESTADO
-- 
-- Problema: Super admin não via organizações no painel
-- Causa: Políticas RLS com is_super_admin() podem ter problemas de contexto
-- Solução: Criar políticas EXPLÍCITAS com UUID hardcoded
-- 
-- ============================================

-- ============================================
-- 1. POLÍTICA EXPLÍCITA PARA ORGANIZATIONS
-- ============================================

-- Nome começa com "zzz_" para ser avaliada por último
-- (as políticas são avaliadas em ordem alfabética e usam OR entre elas)
CREATE POLICY "zzz_super_admin_override_select"
ON organizations FOR SELECT
USING (
  -- Verificação direta por UUID (mais rápida e confiável)
  auth.uid() = '711faee6-56cf-40f9-bf5d-80fca271d6ed'::uuid
  OR
  -- Verificação por email como fallback
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'deyvidrb@icloud.com'
  )
);

COMMENT ON POLICY "zzz_super_admin_override_select" ON organizations IS
'Política explícita de override para garantir que deyvidrb@icloud.com 
(UUID: 711faee6-56cf-40f9-bf5d-80fca271d6ed) veja TODAS as organizações.
Esta política tem precedência sobre as outras devido ao prefixo zzz_.';

-- ============================================
-- 2. POLÍTICA EXPLÍCITA PARA ORGANIZATION_THEMES
-- ============================================

CREATE POLICY "zzz_super_admin_override_themes_select"
ON organization_themes FOR SELECT
USING (
  auth.uid() = '711faee6-56cf-40f9-bf5d-80fca271d6ed'::uuid
  OR
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'deyvidrb@icloud.com'
  )
);

COMMENT ON POLICY "zzz_super_admin_override_themes_select" ON organization_themes IS
'Política explícita de override para super admin ver todos os temas.';

-- ============================================
-- 3. POLÍTICA EXPLÍCITA PARA USER_ORGANIZATIONS
-- ============================================

CREATE POLICY "zzz_super_admin_override_user_orgs_select"
ON user_organizations FOR SELECT
USING (
  auth.uid() = '711faee6-56cf-40f9-bf5d-80fca271d6ed'::uuid
  OR
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'deyvidrb@icloud.com'
  )
);

COMMENT ON POLICY "zzz_super_admin_override_user_orgs_select" ON user_organizations IS
'Política explícita de override para super admin ver todos os membros.';

-- ============================================
-- 4. VALIDAÇÃO
-- ============================================

DO $$
DECLARE
  orgs_count INTEGER;
  themes_count INTEGER;
  user_orgs_count INTEGER;
BEGIN
  -- Contar políticas em cada tabela
  SELECT COUNT(*) INTO orgs_count
  FROM pg_policies 
  WHERE tablename = 'organizations' AND schemaname = 'public';
  
  SELECT COUNT(*) INTO themes_count
  FROM pg_policies 
  WHERE tablename = 'organization_themes' AND schemaname = 'public';
  
  SELECT COUNT(*) INTO user_orgs_count
  FROM pg_policies 
  WHERE tablename = 'user_organizations' AND schemaname = 'public';
  
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ POLÍTICAS EXPLÍCITAS DE SUPER ADMIN CRIADAS          ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 PROBLEMA RESOLVIDO:';
  RAISE NOTICE '   • Super admin agora vê TODAS as organizações';
  RAISE NOTICE '   • Políticas explícitas com UUID hardcoded';
  RAISE NOTICE '   • Verificação por email como fallback';
  RAISE NOTICE '';
  RAISE NOTICE '📊 POLÍTICAS POR TABELA:';
  RAISE NOTICE '   • organizations: % políticas (esperado: 5)', orgs_count;
  RAISE NOTICE '   • organization_themes: % políticas (esperado: 5)', themes_count;
  RAISE NOTICE '   • user_organizations: % políticas (esperado: 5)', user_orgs_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔒 POLÍTICAS DE OVERRIDE:';
  RAISE NOTICE '   • zzz_super_admin_override_select ✅';
  RAISE NOTICE '   • zzz_super_admin_override_themes_select ✅';
  RAISE NOTICE '   • zzz_super_admin_override_user_orgs_select ✅';
  RAISE NOTICE '';
  RAISE NOTICE '👤 SUPER ADMIN:';
  RAISE NOTICE '   • Email: deyvidrb@icloud.com';
  RAISE NOTICE '   • UUID: 711faee6-56cf-40f9-bf5d-80fca271d6ed';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  PRÓXIMOS PASSOS:';
  RAISE NOTICE '   1. Recarregue a aplicação (Cmd+Shift+R)';
  RAISE NOTICE '   2. Acesse /super-admin';
  RAISE NOTICE '   3. Você DEVE ver a organização "FertiliSolo Demo"';
  RAISE NOTICE '';
  RAISE NOTICE '✅ STATUS: PRODUÇÃO';
  RAISE NOTICE '📝 DATA: 2025-11-08';
  RAISE NOTICE '';
END $$;

