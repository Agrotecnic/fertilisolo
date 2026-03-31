# Sistema de Unidades de Medida - Fertilisolo

## Visão Geral

O Fertilisolo agora suporta múltiplas unidades de medida para cada nutriente, permitindo que os usuários insiram dados de acordo com as metodologias dos seus laboratórios. O sistema converte automaticamente todas as unidades para os padrões internos antes de realizar os cálculos.

## Unidades Suportadas

### Macronutrientes Primários

| Nutriente | Unidades Disponíveis | Unidade Padrão |
|-----------|---------------------|----------------|
| **CTC (T)** | cmolc/dm³, meq/100g | cmolc/dm³ |
| **Cálcio (Ca)** | cmolc/dm³, meq/100g, mg/dm³ | cmolc/dm³ |
| **Magnésio (Mg)** | cmolc/dm³, meq/100g, mg/dm³ | cmolc/dm³ |
| **Potássio (K)** | mg/dm³, cmolc/dm³, meq/100g, ppm | mg/dm³ |
| **Fósforo (P)** | mg/dm³, ppm, mg/kg | mg/dm³ |

### Macronutrientes Secundários

| Nutriente | Unidades Disponíveis | Unidade Padrão |
|-----------|---------------------|----------------|
| **Enxofre (S)** | mg/dm³, ppm, mg/kg | mg/dm³ |
| **Matéria Orgânica** | % | % |

### Micronutrientes

| Nutriente | Unidades Disponíveis | Unidade Padrão |
|-----------|---------------------|----------------|
| **Boro (B)** | mg/dm³, ppm, mg/kg | mg/dm³ |
| **Cobre (Cu)** | mg/dm³, ppm, mg/kg | mg/dm³ |
| **Ferro (Fe)** | mg/dm³, ppm, mg/kg | mg/dm³ |
| **Manganês (Mn)** | mg/dm³, ppm, mg/kg | mg/dm³ |
| **Zinco (Zn)** | mg/dm³, ppm, mg/kg | mg/dm³ |
| **Molibdênio (Mo)** | mg/dm³, ppm, mg/kg | mg/dm³ |

## Como Usar

### 1. Seleção de Unidades
- Cada campo de nutriente agora possui um seletor de unidade
- Clique no seletor para escolher a unidade desejada
- A unidade selecionada é exibida abaixo do nome do nutriente

### 2. Entrada de Dados
- Digite o valor na unidade selecionada
- O sistema aceita valores com vírgula ou ponto decimal
- Exemplo: Para Ca em mg/dm³, digite "400" se o valor for 400 mg/dm³

### 3. Conversão Automática
- Todos os valores são automaticamente convertidos para unidades padrão
- Os cálculos são realizados com as unidades padrão
- As recomendações são geradas corretamente independente da unidade de entrada

## Fatores de Conversão

### Cálcio (Ca)
- 1 cmolc/dm³ = 400.8 mg/dm³
- 1 meq/100g = 1 cmolc/dm³

### Magnésio (Mg)
- 1 cmolc/dm³ = 121.5 mg/dm³
- 1 meq/100g = 1 cmolc/dm³

### Potássio (K)
- 1 cmolc/dm³ = 390 mg/dm³
- 1 meq/100g = 1 cmolc/dm³

### Outros Nutrientes
- mg/dm³, ppm e mg/kg são equivalentes para P, S e micronutrientes

## Benefícios

1. **Flexibilidade**: Suporte a múltiplas unidades por nutriente
2. **Compatibilidade**: Funciona com diferentes metodologias laboratoriais
3. **Precisão**: Conversões automáticas garantem cálculos corretos
4. **Usabilidade**: Interface intuitiva com seletores compactos
5. **Consistência**: Histórico sempre armazena valores em unidades padrão

## Exemplo de Uso

### Cenário 1: Laboratório que usa mg/dm³ para Ca
1. Selecione "mg/dm³" para o campo Cálcio
2. Digite "400" (representando 400 mg/dm³)
3. O sistema converte automaticamente para 0.998 cmolc/dm³
4. Os cálculos são realizados com o valor convertido

### Cenário 2: Laboratório que usa meq/100g para K
1. Selecione "meq/100g" para o campo Potássio
2. Digite "0.15" (representando 0.15 meq/100g)
3. O sistema converte automaticamente para 58.5 mg/dm³
4. Os cálculos são realizados com o valor convertido

## Arquivos Modificados

- `src/types/units.ts` - Definições de tipos e configurações de unidades
- `src/utils/unitConversions.ts` - Funções de conversão
- `src/components/UnitSelector.tsx` - Componente seletor de unidades
- `src/components/PrimaryMacronutrientsSection.tsx` - Seção atualizada
- `src/components/SecondaryMacronutrientsSection.tsx` - Seção atualizada
- `src/components/MicronutrientsSection.tsx` - Seção atualizada
- `src/components/SoilAnalysisForm.tsx` - Formulário principal atualizado

## Considerações Técnicas

- Todas as conversões são feitas em tempo real
- Os dados são sempre salvos em unidades padrão no histórico
- O sistema mantém compatibilidade com análises existentes
- As conversões são precisas e baseadas em fatores científicos reconhecidos

## Suporte

Para dúvidas sobre o sistema de unidades ou sugestões de novas unidades, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.
