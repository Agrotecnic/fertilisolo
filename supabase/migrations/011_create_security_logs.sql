-- ============================================
-- TABELA DE LOGS DE SEGURANÇA
-- ============================================
-- Versão: 011
-- Data: 2025-01-08
-- Status: ✅ NOVA IMPLEMENTAÇÃO
-- 
-- Objetivo: Criar sistema de logging persistente para violações de segurança
-- e tentativas de acesso não autorizado
-- 
-- ============================================

-- ============================================
-- 1. CRIAR TABELA SECURITY_LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_organization_id ON security_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_action ON security_logs(action);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at DESC);

-- Comentários
COMMENT ON TABLE security_logs IS 'Registra violações de segurança e tentativas de acesso não autorizado';
COMMENT ON COLUMN security_logs.action IS 'Tipo de ação: access_denied, permission_denied, invalid_resource, etc.';
COMMENT ON COLUMN security_logs.resource_type IS 'Tipo de recurso acessado: farms, plots, soil_analyses, etc.';
COMMENT ON COLUMN security_logs.severity IS 'Nível de severidade: low, medium, high, critical';

-- ============================================
-- 2. HABILITAR RLS
-- ============================================

ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. POLÍTICAS RLS
-- ============================================

-- SELECT: Usuários podem ver apenas seus próprios logs OU super admin vê tudo
CREATE POLICY "security_logs_select"
ON security_logs FOR SELECT
USING (
  auth.uid() = '711faee6-56cf-40f9-bf5d-80fca271d6ed'::uuid
  OR
  user_id = auth.uid()
);

-- INSERT: Apenas via função RPC (SECURITY DEFINER)
-- Não permitir INSERT direto para garantir que logs sejam sempre registrados
CREATE POLICY "security_logs_insert"
ON security_logs FOR INSERT
WITH CHECK (false);

COMMENT ON POLICY "security_logs_insert" ON security_logs IS 
'INSERT bloqueado para usuários normais. Use a função RPC log_security_event()';

-- ============================================
-- 4. FUNÇÃO RPC PARA LOGGING SEGURO
-- ============================================

CREATE OR REPLACE FUNCTION log_security_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_details TEXT DEFAULT NULL,
  p_severity TEXT DEFAULT 'medium',
  p_user_id UUID DEFAULT NULL,
  p_organization_id UUID DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
  final_user_id UUID;
  final_organization_id UUID;
BEGIN
  -- Se user_id não foi fornecido, usar auth.uid()
  final_user_id := COALESCE(p_user_id, auth.uid());
  
  -- Se organization_id não foi fornecido e temos user_id, buscar da tabela user_organizations
  IF final_organization_id IS NULL AND final_user_id IS NOT NULL THEN
    SELECT organization_id INTO final_organization_id
    FROM user_organizations
    WHERE user_id = final_user_id
    LIMIT 1;
  ELSE
    final_organization_id := p_organization_id;
  END IF;
  
  -- Validar severity
  IF p_severity NOT IN ('low', 'medium', 'high', 'critical') THEN
    RAISE EXCEPTION 'Severity inválida: %. Use: low, medium, high, critical', p_severity;
  END IF;
  
  -- Inserir log
  INSERT INTO security_logs (
    user_id,
    organization_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent,
    severity
  ) VALUES (
    final_user_id,
    final_organization_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address,
    p_user_agent,
    p_severity
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

COMMENT ON FUNCTION log_security_event IS 
'Função segura para registrar eventos de segurança. 
Usa SECURITY DEFINER para garantir que logs sejam sempre registrados,
mesmo em caso de falha de autenticação ou problemas de RLS.';

-- ============================================
-- 5. FUNÇÃO HELPER PARA BUSCAR LOGS DO USUÁRIO
-- ============================================

CREATE OR REPLACE FUNCTION get_user_security_logs(
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0,
  p_severity TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  organization_id UUID,
  action TEXT,
  resource_type TEXT,
  resource_id UUID,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  severity TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sl.id,
    sl.user_id,
    sl.organization_id,
    sl.action,
    sl.resource_type,
    sl.resource_id,
    sl.details,
    sl.ip_address,
    sl.user_agent,
    sl.severity,
    sl.created_at
  FROM security_logs sl
  WHERE (
    -- Super admin vê tudo
    auth.uid() = '711faee6-56cf-40f9-bf5d-80fca271d6ed'::uuid
    OR
    -- Usuário vê apenas seus próprios logs
    sl.user_id = auth.uid()
  )
  AND (p_severity IS NULL OR sl.severity = p_severity)
  ORDER BY sl.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

COMMENT ON FUNCTION get_user_security_logs IS 
'Retorna logs de segurança do usuário autenticado ou todos os logs se for super admin.';

-- ============================================
-- 6. VALIDAÇÃO E MENSAGEM DE SUCESSO
-- ============================================

DO $$
DECLARE
  table_exists BOOLEAN;
  function_exists BOOLEAN;
  policy_count INTEGER;
BEGIN
  -- Verificar se tabela foi criada
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'security_logs'
  ) INTO table_exists;
  
  -- Verificar se função foi criada
  SELECT EXISTS (
    SELECT FROM pg_proc 
    WHERE proname = 'log_security_event'
  ) INTO function_exists;
  
  -- Contar políticas RLS
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'security_logs' AND schemaname = 'public';
  
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ TABELA DE LOGS DE SEGURANÇA CRIADA COM SUCESSO        ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '📊 VALIDAÇÃO:';
  RAISE NOTICE '   • Tabela security_logs criada: %', CASE WHEN table_exists THEN '✅ SIM' ELSE '❌ NÃO' END;
  RAISE NOTICE '   • Função log_security_event criada: %', CASE WHEN function_exists THEN '✅ SIM' ELSE '❌ NÃO' END;
  RAISE NOTICE '   • Políticas RLS criadas: %', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔒 SEGURANÇA:';
  RAISE NOTICE '   • RLS habilitado na tabela';
  RAISE NOTICE '   • Usuários veem apenas seus próprios logs';
  RAISE NOTICE '   • Super admin vê todos os logs';
  RAISE NOTICE '   • INSERT direto bloqueado (use função RPC)';
  RAISE NOTICE '';
  RAISE NOTICE '📝 PRÓXIMOS PASSOS:';
  RAISE NOTICE '   1. Atualizar securityHelpers.ts para usar log_security_event()';
  RAISE NOTICE '   2. Testar logging de violações de segurança';
  RAISE NOTICE '   3. Verificar logs no banco de dados';
  RAISE NOTICE '';
END $$;

