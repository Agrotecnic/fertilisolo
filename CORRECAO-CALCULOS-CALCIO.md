# 🔧 CORREÇÃO CRÍTICA - Cálculos de Cálcio, Magnésio e Potássio

## 🚨 PROBLEMA IDENTIFICADO

Os usuários reportaram valores **extremamente altos** nos cálculos de Cálcio (Ca), Magnésio (Mg) e Potássio (K). O problema estava nos **fatores de conversão incorretos** no arquivo `src/types/units.ts`.

---

## 📊 ANÁLISE TÉCNICA

### Problema com CÁLCIO (Ca)

**ANTES (INCORRETO):**
```typescript
{ value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 20 }  // ❌ ERRADO!
```

**O que acontecia:**
- Usuário inseria: **200 mg/dm³** de Ca
- Sistema calculava: `200 × 20 = 4000 cmolc/dm³` ❌
- **Resultado:** Valor 4000x maior que o correto!

**DEPOIS (CORRETO):**
```typescript
{ value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 0.005 }  // ✅ CORRETO!
```

**Agora calcula corretamente:**
- Usuário insere: **200 mg/dm³** de Ca
- Sistema calcula: `200 × 0.005 = 1 cmolc/dm³` ✅
- **Base científica:** 1 cmolc/dm³ = 200 mg/dm³

---

### Problema com MAGNÉSIO (Mg)

**ANTES (INCORRETO):**
```typescript
{ value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 12 }  // ❌ ERRADO!
```

**O que acontecia:**
- Usuário inseria: **120 mg/dm³** de Mg
- Sistema calculava: `120 × 12 = 1440 cmolc/dm³` ❌
- **Resultado:** Valor 1440x maior que o correto!

**DEPOIS (CORRETO):**
```typescript
{ value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 0.00833 }  // ✅ CORRETO!
```

**Agora calcula corretamente:**
- Usuário insere: **120 mg/dm³** de Mg
- Sistema calcula: `120 × 0.00833 = 1 cmolc/dm³` ✅
- **Base científica:** 1 cmolc/dm³ = 120 mg/dm³

---

### Problema com POTÁSSIO (K)

**ANTES (INCORRETO):**
```typescript
{ value: 'cmolc_dm3', label: 'cmolc/dm³', conversionFactor: 0.02 }  // ❌ ERRADO!
{ value: 'meq_100g', label: 'meq/100g', conversionFactor: 0.04 }    // ❌ ERRADO!
```

**O que acontecia:**
- Usuário inseria: **1 cmolc/dm³** de K
- Sistema calculava: `1 × 0.02 = 0.02 mg/dm³` ❌
- **Resultado:** Valor 19500x menor que o correto!

**DEPOIS (CORRETO):**
```typescript
{ value: 'cmolc_dm3', label: 'cmolc/dm³', conversionFactor: 390 }  // ✅ CORRETO!
{ value: 'meq_100g', label: 'meq/100g', conversionFactor: 390 }    // ✅ CORRETO!
```

**Agora calcula corretamente:**
- Usuário insere: **1 cmolc/dm³** de K
- Sistema calcula: `1 × 390 = 390 mg/dm³` ✅
- **Base científica:** 1 cmolc/dm³ = 390 mg/dm³

---

## 📐 FÓRMULAS DE CONVERSÃO CORRETAS

### Cálcio (Ca)
- **Peso equivalente:** Ca²⁺ = 40/2 = 20 meq/g
- **Conversão:** 1 cmolc/dm³ = 1 meq/100cm³ = 200 mg/dm³
- **Fator de conversão:** mg/dm³ → cmolc/dm³ = `÷ 200` = `× 0.005`

### Magnésio (Mg)
- **Peso equivalente:** Mg²⁺ = 24/2 = 12 meq/g
- **Conversão:** 1 cmolc/dm³ = 1 meq/100cm³ = 120 mg/dm³
- **Fator de conversão:** mg/dm³ → cmolc/dm³ = `÷ 120` = `× 0.00833`

### Potássio (K)
- **Peso atômico:** K⁺ = 39 g/mol
- **Conversão:** 1 cmolc/dm³ = 1 meq/100cm³ = 390 mg/dm³
- **Fator de conversão:** cmolc/dm³ → mg/dm³ = `× 390`

---

## ✅ IMPACTO DA CORREÇÃO

### Cálcio
- **Antes:** Valores 4000x maiores (ex: 4000 ao invés de 1)
- **Depois:** Valores corretos ✅

### Magnésio
- **Antes:** Valores 1440x maiores (ex: 1440 ao invés de 1)
- **Depois:** Valores corretos ✅

### Potássio
- **Antes:** Valores 19500x menores (ex: 0.02 ao invés de 390)
- **Depois:** Valores corretos ✅

---

## 🔄 PRÓXIMOS PASSOS

1. ✅ **Correção aplicada** no arquivo `src/types/units.ts`
2. ⚠️ **Atenção:** Análises anteriores terão valores incorretos
3. 📊 **Recomendação:** Refazer análises que apresentaram valores anormais
4. 🧪 **Teste:** Verificar com dados conhecidos antes de usar em produção

---

## 📝 EXEMPLO DE TESTE

Para validar a correção, teste com valores conhecidos:

### Teste com Cálcio
- **Entrada:** 400 mg/dm³ (ou 2 cmolc/dm³)
- **Esperado:** 2 cmolc/dm³
- **CTC = 10:** Saturação de Ca deve ser 20%

### Teste com Magnésio
- **Entrada:** 120 mg/dm³ (ou 1 cmolc/dm³)
- **Esperado:** 1 cmolc/dm³
- **CTC = 10:** Saturação de Mg deve ser 10%

### Teste com Potássio
- **Entrada:** 195 mg/dm³ (ou 0.5 cmolc/dm³)
- **Esperado:** 0.5 cmolc/dm³
- **CTC = 10:** Saturação de K deve ser 5%

---

## 📚 REFERÊNCIAS CIENTÍFICAS

1. **RAIJ, B. van et al.** Recomendações de adubação e calagem para o Estado de São Paulo. 2ª edição. Campinas: Instituto Agronômico/Fundação IAC, 1997. (Boletim Técnico, 100).

2. **EMBRAPA.** Manual de análises químicas de solos, plantas e fertilizantes. 2ª edição revista e ampliada. Brasília: Embrapa Informação Tecnológica, 2009.

3. **SBCS - Sociedade Brasileira de Ciência do Solo.** Manual de adubação e calagem para os Estados do Rio Grande do Sul e de Santa Catarina. 10ª edição. Porto Alegre: Sociedade Brasileira de Ciência do Solo, 2004.

---

## 🎯 CONCLUSÃO

O problema estava nos **fatores de conversão incorretos** que multiplicavam/dividiam por valores errados ao converter entre unidades (mg/dm³ ↔ cmolc/dm³). 

A correção garante que:
- ✅ 200 mg/dm³ de Ca = 1 cmolc/dm³
- ✅ 120 mg/dm³ de Mg = 1 cmolc/dm³
- ✅ 390 mg/dm³ de K = 1 cmolc/dm³

**Data da correção:** 22 de outubro de 2025

