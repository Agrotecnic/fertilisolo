# 🔍 AUDITORIA COMPLETA DOS CÁLCULOS - FERTILISOLO

**Data:** 22 de outubro de 2025  
**Status:** EM PROGRESSO  
**Criticidade:** 🚨 ALTA

---

## 📋 SUMÁRIO EXECUTIVO

Esta auditoria revisa TODOS os cálculos matemáticos e agronômicos do sistema Fertilisolo para garantir a precisão e confiabilidade dos resultados fornecidos aos usuários.

---

## ✅ 1. FATORES DE CONVERSÃO DE UNIDADES (units.ts)

### STATUS: ✅ CORRIGIDO

| Nutriente | Unidade Origem | Unidade Destino | Fator | Status | Fórmula Base |
|-----------|---------------|-----------------|-------|--------|--------------|
| Ca | mg/dm³ | cmolc/dm³ | 0.005 | ✅ CORRETO | 1 cmolc = 200 mg (Ca²⁺ = 40/2) |
| Mg | mg/dm³ | cmolc/dm³ | 0.00833 | ✅ CORRETO | 1 cmolc = 120 mg (Mg²⁺ = 24/2) |
| K | cmolc/dm³ | mg/dm³ | 390 | ✅ CORRETO | 1 cmolc = 390 mg (K⁺ = 39) |
| T (CTC) | cmolc/dm³ | meq/100g | 1 | ✅ CORRETO | Equivalência direta |

**Observação:** Conversões corrigidas em 22/10/2025.

---

## 🔬 2. CÁLCULOS DE SATURAÇÃO DE NUTRIENTES

### Arquivo: `soilCalculations.ts` (linhas 23-28)

```typescript
const saturations = {
  Ca: (Ca / T) * 100,
  Mg: (Mg / T) * 100,
  K: (KCmolc / T) * 100,
};
```

### ❓ ANÁLISE CRÍTICA:

**Fórmula atual:**
- Saturação % = (Nutriente em cmolc/dm³ / CTC) × 100

**Validação científica:**
- ✅ **CORRETO** - Fórmula padrão de acordo com:
  - Raij et al. (1997) - IAC
  - SBCS (2004)
  - Embrapa (2009)

**Valores ideais de saturação:**
- Ca: 50-60% da CTC ✅
- Mg: 15-20% da CTC ✅
- K: 3-5% da CTC ✅

**Verificação com exemplo:**
- Solo: CTC = 10, Ca = 5, Mg = 2, K = 195 mg/dm³
- K em cmolc = 195/390 = 0.5
- Saturação Ca = (5/10) × 100 = 50% ✅
- Saturação Mg = (2/10) × 100 = 20% ✅
- Saturação K = (0.5/10) × 100 = 5% ✅

**Conclusão:** ✅ CORRETO

---

## ⚡ 3. CÁLCULO DE CTC (Capacidade de Troca Catiônica)

### Arquivo: `soilCalculations.ts` (linha 239-242)

```typescript
export const calculateHAl = (organicMatter: number): number => {
  return Math.max(0.5, organicMatter * 0.15);
};
```

### ❓ ANÁLISE CRÍTICA:

**Fórmula atual:**
- H+Al = Matéria Orgânica × 0.15

**Validação científica:**
- ⚠️ **APROXIMAÇÃO SIMPLIFICADA**
- Fórmula mais precisa: H+Al = f(pH, MO, tipo de solo)
- A fórmula usada é uma aproximação comum, mas pode variar

**Recomendação:**
- Para maior precisão, seria ideal usar tabelas baseadas em pH
- A fórmula atual é **aceitável** para estimativas gerais
- ✅ **ACEITÁVEL** com ressalva de que é uma aproximação

**Cálculo de CTC total (linha 308):**
```typescript
const T = soil.T || sumBases + calculateHAl(soil.organicMatter);
```

- ✅ **CORRETO** - CTC = Soma de Bases + H+Al

---

## 💊 4. CÁLCULOS DE NECESSIDADES DE NUTRIENTES

### 4.1 Cálcio (linha 245-248)

```typescript
export const calculateCalciumNeed = (Ca: number): number => {
  const ideal = 3.0;
  return Ca < ideal ? Math.round((ideal - Ca) * 20) / 10 : 0;
};
```

### ❌ PROBLEMA IDENTIFICADO!

**Fórmula atual:**
- Necessidade = (3.0 - Ca) × 20 ÷ 10 = (3.0 - Ca) × 2

**O que isso significa:**
- Para Ca = 1 cmolc/dm³:
  - Necessidade = (3 - 1) × 2 = 4 unidades
  - MAS 4 unidades de quê? kg/ha? cmolc/dm³?

**PROBLEMA:** A unidade de saída não está clara!

**Análise técnica:**
- Se a necessidade é em cmolc/dm³: multiplicar por 2 não faz sentido
- Se é em kg/ha de CaO: o fator de conversão está ERRADO

**Fator correto para converter necessidade de Ca:**
- 1 cmolc/dm³ de Ca = 400 kg/ha de CaO (considerando camada de 0-20cm)
- OU 1 cmolc/dm³ de Ca = 560 kg/ha de Ca metálico

### 🔴 **CRÍTICO - PRECISA CORREÇÃO!**

---

### 4.2 Magnésio (linha 250-253)

```typescript
export const calculateMagnesiumNeed = (Mg: number): number => {
  const ideal = 1.0;
  return Mg < ideal ? Math.round((ideal - Mg) * 15) / 10 : 0;
};
```

### ❌ PROBLEMA IDENTIFICADO!

**Mesmo problema do Cálcio:**
- Necessidade = (1.0 - Mg) × 1.5

**Fator correto para converter necessidade de Mg:**
- 1 cmolc/dm³ de Mg = 240 kg/ha de MgO (considerando camada de 0-20cm)
- OU 1 cmolc/dm³ de Mg = 400 kg/ha de Mg metálico

### 🔴 **CRÍTICO - PRECISA CORREÇÃO!**

---

### 4.3 Potássio (linha 255-258)

```typescript
export const calculatePotassiumNeed = (K: number): number => {
  const ideal = 0.15;
  return K < ideal ? Math.round((ideal - K) * 100) / 10 : 0;
};
```

### ❌ PROBLEMA IDENTIFICADO!

**Fórmula atual:**
- Necessidade = (0.15 - K) × 10
- Para K = 0.05: Necessidade = (0.15 - 0.05) × 10 = 1

**O problema:**
- K está em cmolc/dm³
- A necessidade deveria ser em kg/ha de K2O

**Fator correto:**
- 1 cmolc/dm³ de K = 780 kg/ha de K2O (considerando camada de 0-20cm)

### 🔴 **CRÍTICO - PRECISA CORREÇÃO!**

---

## 💉 5. RECOMENDAÇÕES DE FERTILIZANTES

### Arquivo: `fertilizerCalculations.ts` (linhas 14-26)

```typescript
if (nutrient === 'Ca') {
  recommendation = (needCmolc * 560) / (source.concentration / 100);
} else if (nutrient === 'Mg') {
  recommendation = (needCmolc * 400) / (source.concentration / 100);
} else if (nutrient === 'K') {
  recommendation = (needCmolc * 2) / (source.concentration / 100);
}
```

### ⚠️ ANÁLISE CRÍTICA:

**Cálcio:**
- Fator 560: Referente a Ca metálico
- ⚠️ **VERIFICAR** se deveria usar CaO (fator 400) dependendo do fertilizante

**Magnésio:**
- Fator 400: Referente a Mg metálico  
- ⚠️ **VERIFICAR** se deveria usar MgO (fator 240) dependendo do fertilizante

**Potássio:**
- Fator 2: ❌ **ERRADO!**
- Deveria ser muito maior (390 para mg/dm³ ou 780 para kg/ha)

### 🔴 **CRÍTICO - PRECISA CORREÇÃO!**

---

## 🌾 6. CÁLCULOS NO fertilizer.ts

### Linha 209-211: Conversão P para P2O5

```typescript
const pInSoil = validatedSoilData.P;
const p2o5InSoil = pInSoil * 2.29;
```

### ✅ VALIDAÇÃO:

**Fórmula:**
- P2O5 = P × 2.29

**Base científica:**
- Peso molecular P2O5 = 142
- Peso molecular 2P = 62
- Fator de conversão = 142/62 = 2.29

**Conclusão:** ✅ **CORRETO**

---

### Linha 213-215: Conversão K para K2O

```typescript
const kInSoil = validatedSoilData.K;
const k2oInSoil = kInSoil * 1.2;
```

### ❌ PROBLEMA IDENTIFICADO!

**Fórmula atual:**
- K2O = K(mg/dm³) × 1.2

**Análise:**
- Esta conversão está assumindo uma correlação direta
- MAS: K em mg/dm³ não é a mesma coisa que K elementar

**Conversão correta:**
- Se K está em mg/dm³, primeiro converter para cmolc/dm³: K ÷ 390
- Depois para kg/ha: cmolc × 780 (para K2O)
- OU manter em mg/dm³ e usar fator apropriado

**Base científica:**
- Peso molecular K2O = 94
- Peso molecular 2K = 78  
- Fator de conversão K para K2O = 94/78 = 1.205

**Conclusão:** ⚠️ **VERIFICAR CONTEXTO** - O fator 1.2 está próximo, mas a aplicação pode estar incorreta

---

### Linha 218: Cálculo de K em cmolc

```typescript
const sumBases = validatedSoilData.Ca + validatedSoilData.Mg + (validatedSoilData.K / 390);
```

### ✅ VALIDAÇÃO:

**Fórmula:**
- K(cmolc) = K(mg/dm³) / 390

**Conclusão:** ✅ **CORRETO**

---

## 🧪 7. MICRONUTRIENTES

### Arquivo: `micronutrientCalculations.ts`

#### 7.1 Fósforo (linhas 1-21)

```typescript
export const calculatePhosphorusNeed = (currentP: number): number => {
  const targetP = 15;
  if (currentP >= targetP) return 0;
  const pNeeded = targetP - currentP;
  
  let factor = 0;
  if (currentP <= 5) factor = 503.80;
  else if (currentP <= 10) factor = 412.20;
  else if (currentP <= 20) factor = 320.60;
  else factor = 229.00;

  return pNeeded * factor / 100;
};
```

### ⚠️ ANÁLISE:

**Fatores usados:**
- P ≤ 5: 503.80
- P ≤ 10: 412.20
- P ≤ 20: 320.60
- P > 20: 229.00

**Questões:**
1. De onde vêm esses fatores específicos?
2. Não considera o tipo de solo (argila)
3. Já existe função mais completa: `calcularRecomendacaoP` que considera argila

**Recomendação:** ⚠️ **CONSOLIDAR** - Usar apenas `calcularRecomendacaoP` que é mais completo

---

#### 7.2 Outros Micronutrientes (linhas 23-63)

| Nutriente | Alvo | Fator | Status |
|-----------|------|-------|--------|
| S | 10 mg/dm³ | ×10 | ⚠️ Verificar |
| B | 0.3 mg/dm³ | ×2 | ⚠️ Verificar |
| Cu | 0.8 mg/dm³ | ×3 | ⚠️ Verificar |
| Fe | 12 mg/dm³ | ×5 | ⚠️ Verificar |
| Mn | 5 mg/dm³ | ×4 | ⚠️ Verificar |
| Zn | 1.5 mg/dm³ | ×8 | ⚠️ Verificar |
| Mo | 0.1 mg/dm³ | ×15 | ⚠️ Verificar |

**Problema geral:** Os fatores multiplicadores não têm base científica clara documentada

---

## 🎯 8. RESUMO DE PROBLEMAS CRÍTICOS

### 🔴 CRÍTICO - Correção Imediata

1. **calculateCalciumNeed** - Fator de conversão incorreto
2. **calculateMagnesiumNeed** - Fator de conversão incorreto  
3. **calculatePotassiumNeed** - Fator de conversão incorreto
4. **fertilizerCalculations (K)** - Fator 2 está errado

### ⚠️ IMPORTANTE - Revisar

5. **K para K2O** - Verificar contexto da conversão
6. **Micronutrientes** - Validar todos os fatores multiplicadores
7. **Funções duplicadas** - Consolidar cálculo de P

### ℹ️ OBSERVAÇÕES

8. **H+Al** - Fórmula simplificada, aceitável mas não ideal
9. **Documentação** - Adicionar referências científicas para todos os fatores

---

## 📊 PRÓXIMAS AÇÕES

1. ✅ Corrigir conversões de unidades (units.ts) - **CONCLUÍDO**
2. 🔴 Corrigir calculateCalciumNeed
3. 🔴 Corrigir calculateMagnesiumNeed
4. 🔴 Corrigir calculatePotassiumNeed
5. 🔴 Corrigir fertilizerCalculations para K
6. ⚠️ Revisar e validar todos os fatores de micronutrientes
7. ⚠️ Consolidar funções de cálculo de P
8. 📝 Adicionar testes unitários para validação

---

## 📚 REFERÊNCIAS TÉCNICAS

1. **RAIJ, B. van et al.** Recomendações de adubação e calagem para o Estado de São Paulo. 2ª ed. Campinas: IAC, 1997.
2. **EMBRAPA.** Manual de análises químicas de solos, plantas e fertilizantes. 2ª ed. Brasília, 2009.
3. **SBCS.** Manual de adubação e calagem. 10ª ed. Porto Alegre, 2004.
4. **CFSEMG.** Recomendações para o uso de corretivos e fertilizantes em Minas Gerais - 5ª Aproximação. Viçosa, 1999.

---

**Status do documento:** 🚧 EM PROGRESSO  
**Última atualização:** 22/10/2025  
**Próxima revisão:** Após implementação das correções

