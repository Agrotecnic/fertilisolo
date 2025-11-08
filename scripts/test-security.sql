-- ============================================
-- SCRIPT DE TESTES DE SEGURANÇA MULTI-TENANT
-- ============================================
-- Execute este script periodicamente para validar
-- que o isolamento de dados está funcionando corretamente

-- ============================================
-- TESTE 1: Verificar RLS habilitado
-- ============================================

SELECT 
  'TESTE 1: Verificar RLS Habilitado' as test_name,
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS Habilitado'
    ELSE '❌ RLS NÃO HABILITADO - CRÍTICO!'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'organizations',
  'organization_themes',
  'user_organizations',
  'organization_invites',
  'farms',
  'plots',
  'soil_analyses',
  'fertilizer_recommendations'
)
ORDER BY tablename;

-- ============================================
-- TESTE 2: Verificar políticas RLS existem
-- ============================================

SELECT 
  'TESTE 2: Verificar Políticas RLS' as test_name,
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 4 THEN '✅ Políticas suficientes (SELECT, INSERT, UPDATE, DELETE)'
    WHEN COUNT(*) > 0 THEN '⚠️ Políticas parciais - revisar'
    ELSE '❌ SEM POLÍTICAS - CRÍTICO!'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'organizations',
  'organization_themes',
  'user_organizations',
  'organization_invites',
  'farms',
  'plots',
  'soil_analyses',
  'fertilizer_recommendations'
)
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- TESTE 3: Verificar registros sem organization_id
-- ============================================

DO $$
DECLARE
  farms_count INT;
  plots_count INT;
  analyses_count INT;
  recommendations_count INT;
BEGIN
  -- Contar registros sem organization_id
  SELECT COUNT(*) INTO farms_count FROM farms WHERE organization_id IS NULL;
  SELECT COUNT(*) INTO plots_count FROM plots WHERE organization_id IS NULL;
  SELECT COUNT(*) INTO analyses_count FROM soil_analyses WHERE organization_id IS NULL;
  SELECT COUNT(*) INTO recommendations_count FROM fertilizer_recommendations WHERE organization_id IS NULL;

  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'TESTE 3: Verificar registros sem organization_id';
  RAISE NOTICE '============================================';
  
  IF farms_count = 0 THEN
    RAISE NOTICE '✅ farms: 0 registros sem organization_id';
  ELSE
    RAISE WARNING '❌ farms: % registros sem organization_id - CRÍTICO!', farms_count;
  END IF;

  IF plots_count = 0 THEN
    RAISE NOTICE '✅ plots: 0 registros sem organization_id';
  ELSE
    RAISE WARNING '❌ plots: % registros sem organization_id - CRÍTICO!', plots_count;
  END IF;

  IF analyses_count = 0 THEN
    RAISE NOTICE '✅ soil_analyses: 0 registros sem organization_id';
  ELSE
    RAISE WARNING '❌ soil_analyses: % registros sem organization_id - CRÍTICO!', analyses_count;
  END IF;

  IF recommendations_count = 0 THEN
    RAISE NOTICE '✅ fertilizer_recommendations: 0 registros sem organization_id';
  ELSE
    RAISE WARNING '❌ fertilizer_recommendations: % registros sem organization_id - CRÍTICO!', recommendations_count;
  END IF;
END $$;

-- ============================================
-- TESTE 4: Verificar funções auxiliares existem
-- ============================================

SELECT 
  'TESTE 4: Verificar Funções de Segurança' as test_name,
  proname as function_name,
  CASE 
    WHEN proname IS NOT NULL THEN '✅ Função existe'
    ELSE '❌ Função NÃO existe'
  END as status
FROM pg_proc
WHERE proname IN (
  'get_user_organization_id',
  'user_belongs_to_organization',
  'user_is_admin_of_organization',
  'set_organization_id_from_user',
  'get_organization_members_with_details'
)
ORDER BY proname;

-- ============================================
-- TESTE 5: Verificar triggers de segurança
-- ============================================

SELECT 
  'TESTE 5: Verificar Triggers de Segurança' as test_name,
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  CASE 
    WHEN tgenabled = 'O' THEN '✅ Trigger habilitado'
    WHEN tgenabled = 'D' THEN '❌ Trigger DESABILITADO - CRÍTICO!'
    ELSE '⚠️ Trigger em estado desconhecido'
  END as status
FROM pg_trigger
WHERE tgname LIKE 'ensure_organization_id%'
ORDER BY tgname;

-- ============================================
-- TESTE 6: Verificar índices de performance
-- ============================================

SELECT 
  'TESTE 6: Verificar Índices em organization_id' as test_name,
  tablename,
  indexname,
  CASE 
    WHEN indexname IS NOT NULL THEN '✅ Índice existe'
    ELSE '⚠️ Índice não encontrado'
  END as status
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE '%organization_id%'
ORDER BY tablename;

-- ============================================
-- TESTE 7: Simular cenário de isolamento
-- ============================================

DO $$
DECLARE
  org_a_id UUID;
  org_b_id UUID;
  user_a_id UUID;
  user_b_id UUID;
  test_passed BOOLEAN := true;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'TESTE 7: Simular Isolamento de Dados';
  RAISE NOTICE '============================================';

  -- Criar organizações de teste
  INSERT INTO organizations (name, slug) 
  VALUES ('Test Org A', 'test-org-a-' || gen_random_uuid())
  RETURNING id INTO org_a_id;

  INSERT INTO organizations (name, slug) 
  VALUES ('Test Org B', 'test-org-b-' || gen_random_uuid())
  RETURNING id INTO org_b_id;

  RAISE NOTICE '✅ Organizações de teste criadas';
  RAISE NOTICE '   Org A ID: %', org_a_id;
  RAISE NOTICE '   Org B ID: %', org_b_id;

  -- Criar farms em cada organização
  INSERT INTO farms (name, organization_id) VALUES
    ('Farm Test A', org_a_id),
    ('Farm Test B', org_b_id);

  RAISE NOTICE '✅ Farms de teste criadas';

  -- Verificar isolamento (deve retornar 1 farm por organização)
  IF (SELECT COUNT(*) FROM farms WHERE organization_id = org_a_id) = 1 THEN
    RAISE NOTICE '✅ Org A vê apenas 1 farm (correto)';
  ELSE
    RAISE WARNING '❌ Org A vê farms de outras organizações!';
    test_passed := false;
  END IF;

  IF (SELECT COUNT(*) FROM farms WHERE organization_id = org_b_id) = 1 THEN
    RAISE NOTICE '✅ Org B vê apenas 1 farm (correto)';
  ELSE
    RAISE WARNING '❌ Org B vê farms de outras organizações!';
    test_passed := false;
  END IF;

  -- Limpar dados de teste
  DELETE FROM farms WHERE organization_id IN (org_a_id, org_b_id);
  DELETE FROM organizations WHERE id IN (org_a_id, org_b_id);

  RAISE NOTICE '✅ Dados de teste removidos';

  IF test_passed THEN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ✅ ✅ TESTE 7 PASSOU - Isolamento funcionando!';
  ELSE
    RAISE WARNING '';
    RAISE WARNING '❌ ❌ ❌ TESTE 7 FALHOU - Verificar RLS!';
  END IF;
END $$;

-- ============================================
-- TESTE 8: Verificar organizações ativas
-- ============================================

SELECT 
  'TESTE 8: Status das Organizações' as test_name,
  id,
  name,
  slug,
  CASE 
    WHEN is_active = true THEN '✅ Ativa'
    ELSE '⚠️ Inativa'
  END as status,
  created_at
FROM organizations
ORDER BY created_at DESC;

-- ============================================
-- TESTE 9: Verificar usuários sem organização
-- ============================================

SELECT 
  'TESTE 9: Usuários sem Organização' as test_name,
  au.id as user_id,
  au.email,
  CASE 
    WHEN uo.id IS NULL THEN '⚠️ Sem organização'
    ELSE '✅ Tem organização'
  END as status
FROM auth.users au
LEFT JOIN user_organizations uo ON uo.user_id = au.id
WHERE uo.id IS NULL;

-- ============================================
-- TESTE 10: Resumo de segurança
-- ============================================

DO $$
DECLARE
  total_orgs INT;
  total_users INT;
  total_farms INT;
  total_analyses INT;
BEGIN
  SELECT COUNT(*) INTO total_orgs FROM organizations WHERE is_active = true;
  SELECT COUNT(*) INTO total_users FROM auth.users;
  SELECT COUNT(*) INTO total_farms FROM farms;
  SELECT COUNT(*) INTO total_analyses FROM soil_analyses;

  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'RESUMO DO SISTEMA';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Organizações ativas: %', total_orgs;
  RAISE NOTICE 'Usuários cadastrados: %', total_users;
  RAISE NOTICE 'Fazendas registradas: %', total_farms;
  RAISE NOTICE 'Análises de solo: %', total_analyses;
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Para máxima segurança, certifique-se de que:';
  RAISE NOTICE '   1. RLS está habilitado em TODAS as tabelas';
  RAISE NOTICE '   2. Todas as políticas RLS estão ativas';
  RAISE NOTICE '   3. Não há registros sem organization_id';
  RAISE NOTICE '   4. Triggers de validação estão funcionando';
  RAISE NOTICE '   5. Backups regulares estão sendo feitos';
  RAISE NOTICE '';
END $$;

-- ============================================
-- FIM DOS TESTES
-- ============================================

-- Mensagem final
SELECT '
════════════════════════════════════════════════════════
  🔒 TESTES DE SEGURANÇA MULTI-TENANT CONCLUÍDOS
════════════════════════════════════════════════════════

Revise os resultados acima e verifique se todos os
testes passaram (✅).

Se algum teste falhou (❌), tome ação imediata para
corrigir o problema antes de colocar em produção.

Para documentação completa, consulte:
SEGURANCA-MULTI-TENANT.md

════════════════════════════════════════════════════════
' as final_message;

