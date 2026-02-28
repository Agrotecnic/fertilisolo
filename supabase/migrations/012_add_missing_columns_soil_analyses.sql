-- ============================================
-- ADICIONAR COLUNAS FALTANTES EM SOIL_ANALYSES
-- ============================================
-- Versão: 012
-- Data: 2025-11-14
-- Status: ✅ NOVA IMPLEMENTAÇÃO
-- 
-- Objetivo: Adicionar colunas que estavam sendo salvas no código
-- mas não existiam no banco de dados:
-- - cec (Capacidade de Troca Catiônica / CTC)
-- - molybdenum (Molibdênio)
-- - clay_content (Percentual de argila)
-- 
-- ============================================

-- ============================================
-- 1. ADICIONAR COLUNAS
-- ============================================

-- Adicionar coluna cec (Capacidade de Troca Catiônica)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'soil_analyses' AND column_name = 'cec'
  ) THEN
    ALTER TABLE soil_analyses ADD COLUMN cec NUMERIC(10, 2);
    COMMENT ON COLUMN soil_analyses.cec IS 'Capacidade de Troca Catiônica (CTC) em cmolc/dm³';
    RAISE NOTICE '✅ Coluna cec adicionada';
  ELSE
    RAISE NOTICE '⚠️  Coluna cec já existe';
  END IF;
END $$;

-- Adicionar coluna molybdenum (Molibdênio)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'soil_analyses' AND column_name = 'molybdenum'
  ) THEN
    ALTER TABLE soil_analyses ADD COLUMN molybdenum NUMERIC(10, 2);
    COMMENT ON COLUMN soil_analyses.molybdenum IS 'Molibdênio (Mo) em mg/dm³';
    RAISE NOTICE '✅ Coluna molybdenum adicionada';
  ELSE
    RAISE NOTICE '⚠️  Coluna molybdenum já existe';
  END IF;
END $$;

-- Adicionar coluna clay_content (Percentual de argila)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'soil_analyses' AND column_name = 'clay_content'
  ) THEN
    ALTER TABLE soil_analyses ADD COLUMN clay_content NUMERIC(5, 2);
    COMMENT ON COLUMN soil_analyses.clay_content IS 'Percentual de argila no solo (%)';
    RAISE NOTICE '✅ Coluna clay_content adicionada';
  ELSE
    RAISE NOTICE '⚠️  Coluna clay_content já existe';
  END IF;
END $$;

-- ============================================
-- 2. VALIDAÇÃO FINAL
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Migração 012 concluída com sucesso!';
  RAISE NOTICE '✅ Colunas adicionadas: cec, molybdenum, clay_content';
  RAISE NOTICE '';
  RAISE NOTICE '📋 PRÓXIMOS PASSOS:';
  RAISE NOTICE '1. Execute esta migração no Supabase Dashboard ou via CLI';
  RAISE NOTICE '2. Teste o salvamento de análises de solo';
  RAISE NOTICE '3. Verifique se os valores estão sendo salvos corretamente';
END $$;

