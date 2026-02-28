/**
 * Script para aplicar a migração de colunas faltantes
 * Aplica diretamente via SQL no Supabase
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

// Resolver __dirname para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: VITE_PUBLIC_SUPABASE_URL ou VITE_PUBLIC_SUPABASE_ANON_KEY não encontrados no .env');
  process.exit(1);
}

console.log('🔌 Conectando ao Supabase...');
console.log('   URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

// SQL para adicionar as colunas
const migrationSQL = `
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
`;

async function applyMigration() {
  try {
    console.log('\n📝 Aplicando migração...');
    console.log('   Adicionando colunas: cec, molybdenum, clay_content\n');
    
    // Aplicar o SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Erro ao aplicar migração:', error);
      console.error('\n⚠️  A função exec_sql não está disponível.');
      console.error('   Por favor, aplique a migração manualmente via Dashboard do Supabase.');
      console.error('   Consulte o arquivo CORRECAO-COLUNAS-FALTANTES.md para instruções.\n');
      process.exit(1);
    }
    
    console.log('✅ Migração aplicada com sucesso!');
    
    // Verificar se as colunas foram criadas
    console.log('\n🔍 Verificando colunas...');
    const { data: columns, error: checkError } = await supabase
      .from('soil_analyses')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.error('⚠️  Não foi possível verificar as colunas:', checkError.message);
    } else {
      console.log('✅ Colunas criadas com sucesso!\n');
      console.log('📋 Próximos passos:');
      console.log('   1. Teste o salvamento de uma análise de solo');
      console.log('   2. Verifique se os dados estão sendo salvos corretamente');
    }
    
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
    console.error('\n⚠️  Não foi possível aplicar a migração automaticamente.');
    console.error('   Por favor, aplique manualmente via Dashboard do Supabase.');
    console.error('   Consulte o arquivo CORRECAO-COLUNAS-FALTANTES.md para instruções.\n');
    process.exit(1);
  }
}

console.log('🚀 Iniciando aplicação da migração...\n');
applyMigration();

