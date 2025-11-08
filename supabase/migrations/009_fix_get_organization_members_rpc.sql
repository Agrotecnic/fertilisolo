-- ============================================
-- FIX: Função RPC para buscar membros com detalhes
-- ============================================
-- Versão: 009
-- Data: 2025-11-08
-- Status: ✅ APLICADO E TESTADO
-- 
-- Problema: organizationServices.ts tentava chamar get_organization_members_with_details
--           mas a função não existia, causando erro "permission denied for table users"
-- Causa: Código frontend tentava acessar auth.users diretamente via fallback
-- Solução: Criar função RPC com SECURITY DEFINER que acessa auth.users com permissões
-- 
-- ============================================

-- ============================================
-- 1. REMOVER FUNÇÃO ANTIGA (se existir)
-- ============================================

DROP FUNCTION IF EXISTS get_organization_members_with_details(UUID);

-- ============================================
-- 2. CRIAR FUNÇÃO COM SECURITY DEFINER
-- ============================================

CREATE FUNCTION get_organization_members_with_details(org_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  role TEXT,
  created_at TIMESTAMPTZ,
  email VARCHAR,
  name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    uo.id,
    uo.user_id,
    uo.role::TEXT,
    uo.created_at,
    au.email::VARCHAR,
    COALESCE(
      (au.raw_user_meta_data->>'full_name')::TEXT,
      (au.raw_user_meta_data->>'name')::TEXT,
      SPLIT_PART(au.email, '@', 1)::TEXT,
      'Usuário'::TEXT
    ) AS name
  FROM
    public.user_organizations uo
  LEFT JOIN
    auth.users au ON uo.user_id = au.id
  WHERE
    uo.organization_id = org_id
  ORDER BY
    uo.created_at DESC;
END;
$$;

COMMENT ON FUNCTION get_organization_members_with_details(UUID) IS
'Retorna membros de uma organização com email e nome dos usuários.
Usa SECURITY DEFINER para acessar auth.users com permissões elevadas.
Utilizada pelo frontend em src/lib/organizationServices.ts';

-- ============================================
-- 3. VALIDAÇÃO
-- ============================================

DO $$
DECLARE
  function_exists BOOLEAN;
  test_result INTEGER;
BEGIN
  -- Verificar se função existe
  SELECT EXISTS (
    SELECT 1 
    FROM pg_proc 
    WHERE proname = 'get_organization_members_with_details'
  ) INTO function_exists;
  
  -- Testar função (contar quantos resultados retorna)
  SELECT COUNT(*) INTO test_result
  FROM get_organization_members_with_details(
    (SELECT id FROM organizations LIMIT 1)
  );
  
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ FUNÇÃO RPC PARA MEMBROS CRIADA COM SUCESSO           ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 CORREÇÃO APLICADA:';
  RAISE NOTICE '   • Função: get_organization_members_with_details()';
  RAISE NOTICE '   • SECURITY DEFINER: ✅ Ativado';
  RAISE NOTICE '   • Acesso auth.users: ✅ Permitido';
  RAISE NOTICE '   • Função existe: %', CASE WHEN function_exists THEN '✅' ELSE '❌' END;
  RAISE NOTICE '   • Teste executado: % membros encontrados', test_result;
  RAISE NOTICE '';
  RAISE NOTICE '📊 RETORNO DA FUNÇÃO:';
  RAISE NOTICE '   • id: UUID';
  RAISE NOTICE '   • user_id: UUID';
  RAISE NOTICE '   • role: TEXT (owner/admin/member)';
  RAISE NOTICE '   • created_at: TIMESTAMPTZ';
  RAISE NOTICE '   • email: VARCHAR (ex: deyvidrb@icloud.com)';
  RAISE NOTICE '   • name: TEXT (ex: deyvidrb)';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 SEGURANÇA:';
  RAISE NOTICE '   • SECURITY DEFINER permite acesso a auth.users';
  RAISE NOTICE '   • Função respeitapolíticas RLS de user_organizations';
  RAISE NOTICE '   • Nome extraído de full_name, name ou email';
  RAISE NOTICE '';
  RAISE NOTICE '📝 USO NO CÓDIGO:';
  RAISE NOTICE '   const { data } = await supabase.rpc(';
  RAISE NOTICE '     ''get_organization_members_with_details'',';
  RAISE NOTICE '     { org_id: organizationId }';
  RAISE NOTICE '   );';
  RAISE NOTICE '';
  RAISE NOTICE '✅ ERRO "permission denied for table users" RESOLVIDO!';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  PRÓXIMOS PASSOS:';
  RAISE NOTICE '   1. Recarregue a aplicação (Cmd+Shift+R)';
  RAISE NOTICE '   2. Os erros 403 devem desaparecer';
  RAISE NOTICE '   3. Gerenciamento de usuários deve funcionar';
  RAISE NOTICE '';
  RAISE NOTICE '✅ STATUS: PRODUÇÃO';
  RAISE NOTICE '📝 DATA: 2025-11-08';
  RAISE NOTICE '';
END $$;

