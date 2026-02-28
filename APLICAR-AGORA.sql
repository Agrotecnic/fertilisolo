-- ============================================
-- CORREÇÃO URGENTE: Adicionar Colunas Faltantes
-- ============================================
-- Data: 14 de novembro de 2025
-- 
-- INSTRUÇÕES:
-- 1. Copie TODO este arquivo (Ctrl+A ou Cmd+A)
-- 2. Acesse: https://app.supabase.com
-- 3. Selecione seu projeto: crtdfzqejhkccglatcmc
-- 4. Clique em "SQL Editor" na barra lateral esquerda
-- 5. Cole este SQL e clique em "RUN" (ou Ctrl+Enter)
-- 
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
    RAISE NOTICE '✅ Coluna cec adicionada com sucesso';
  ELSE
    RAISE NOTICE '⚠️  Coluna cec já existe - OK';
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
    RAISE NOTICE '✅ Coluna molybdenum adicionada com sucesso';
  ELSE
    RAISE NOTICE '⚠️  Coluna molybdenum já existe - OK';
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
    RAISE NOTICE '✅ Coluna clay_content adicionada com sucesso';
  ELSE
    RAISE NOTICE '⚠️  Coluna clay_content já existe - OK';
  END IF;
END $$;

-- Verificar se as colunas foram criadas
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_name = 'soil_analyses' 
    AND column_name IN ('cec', 'molybdenum', 'clay_content');
  
  IF col_count = 3 THEN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SUCESSO! Todas as 3 colunas foram criadas!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ cec';
    RAISE NOTICE '✅ molybdenum';
    RAISE NOTICE '✅ clay_content';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Próximos passos:';
    RAISE NOTICE '   1. Feche esta janela';
    RAISE NOTICE '   2. Volte para a aplicação';
    RAISE NOTICE '   3. Tente salvar uma análise de solo novamente';
    RAISE NOTICE '   4. O erro deve ter sido corrigido!';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '⚠️  Atenção: Apenas % de 3 colunas foram criadas', col_count;
    RAISE NOTICE '   Execute novamente se necessário';
  END IF;
END $$;

