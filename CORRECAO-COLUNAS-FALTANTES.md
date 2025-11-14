# Correção: Colunas Faltantes em soil_analyses

**Data:** 14 de novembro de 2025  
**Status:** 🔧 AGUARDANDO APLICAÇÃO

## Problema Identificado

Ao tentar salvar uma análise de solo, o seguinte erro ocorreu:

```
PGRST204: Could not find the 'cec' column of 'soil_analyses' in the schema cache
```

### Causa Raiz

O código TypeScript estava tentando salvar três colunas que não existiam no banco de dados:

1. **`cec`** - Capacidade de Troca Catiônica (CTC) em cmolc/dm³
2. **`molybdenum`** - Molibdênio (Mo) em mg/dm³  
3. **`clay_content`** - Percentual de argila no solo (%)

## Solução Implementada

### 1. Migração Criada ✅

Arquivo: `supabase/migrations/20251114161415_add_missing_columns_soil_analyses.sql`

Esta migração adiciona as três colunas faltantes na tabela `soil_analyses`.

### 2. Tipos TypeScript Atualizados ✅

Arquivo: `src/lib/supabase.ts`

Os tipos `Row`, `Insert` e `Update` da tabela `soil_analyses` foram atualizados para incluir:
- `molybdenum: number | null`
- `clay_content: number | null`
- `cec: number | null`

## Como Aplicar a Migração

### Opção 1: Via Dashboard do Supabase (RECOMENDADO)

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** (ícone de banco de dados na barra lateral)
4. Clique em **New Query**
5. Cole o seguinte SQL:

```sql
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
```

6. Clique em **RUN** ou pressione `Ctrl+Enter` (Windows/Linux) ou `Cmd+Enter` (Mac)
7. Verifique se as mensagens de sucesso aparecem

### Opção 2: Via Supabase CLI (se o ambiente estiver configurado)

```bash
# Na raiz do projeto
npx supabase db push
```

Se houver conflitos de migração, pode ser necessário marcar as migrações anteriores como aplicadas.

### Opção 3: Via psql (Linha de Comando)

Se você tiver acesso direto ao banco via `psql`:

```bash
psql "postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJETO].supabase.co:5432/postgres" < supabase/migrations/20251114161415_add_missing_columns_soil_analyses.sql
```

## Validação

Após aplicar a migração, teste o salvamento de uma análise de solo:

1. Acesse a aplicação
2. Vá em **Nova Análise** ou tente salvar uma análise existente
3. Preencha os dados e clique em **Salvar**
4. Verifique se não há mais o erro `PGRST204`

### Verificar as Colunas no Banco

Execute no SQL Editor:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'soil_analyses'
  AND column_name IN ('cec', 'molybdenum', 'clay_content')
ORDER BY column_name;
```

Resultado esperado:

| column_name   | data_type | is_nullable |
|---------------|-----------|-------------|
| cec           | numeric   | YES         |
| clay_content  | numeric   | YES         |
| molybdenum    | numeric   | YES         |

## Impacto

### Antes da Correção ❌
- Análises de solo **não podiam ser salvas**
- Erro `PGRST204` sempre que tentava salvar
- Dados de CTC, Mo e argila eram perdidos

### Depois da Correção ✅
- Análises de solo podem ser salvas normalmente
- Todos os nutrientes são armazenados corretamente
- CTC, Molibdênio e percentual de argila são preservados

## Arquivos Modificados

1. ✅ `supabase/migrations/20251114161415_add_missing_columns_soil_analyses.sql` - CRIADO
2. ✅ `src/lib/supabase.ts` - ATUALIZADO (tipos TypeScript)

## Próximos Passos

1. ✅ Migração criada
2. ✅ Tipos TypeScript atualizados
3. ⏳ **APLICAR A MIGRAÇÃO NO BANCO DE DADOS** (aguardando)
4. ⏳ Testar salvamento de análises
5. ⏳ Validar que os dados estão sendo salvos corretamente

---

**Nota:** Este problema foi identificado em 14/11/2025 e a solução está pronta para ser aplicada. Após aplicar a migração, o sistema voltará a funcionar normalmente.

