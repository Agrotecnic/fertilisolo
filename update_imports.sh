#!/bin/bash

# Lista de arquivos a serem atualizados
FILES=(
  "src/components/MicronutrientsCard.tsx"
  "src/components/SoilAnalysisForm.tsx"
  "src/components/NeedsCard.tsx"
  "src/components/AlertsSection.tsx"
  "src/components/fertilizer/FertilizerHeader.tsx"
  "src/components/RelationshipCard.tsx"
  "src/components/SecondaryNutrientsCard.tsx"
  "src/components/insights/CriticalPatterns.tsx"
  "src/components/SaturationsCard.tsx"
  "src/components/insights/LimitingFactors.tsx"
  "src/components/insights/ImplementationPlan.tsx"
  "src/components/insights/StrategicRecommendations.tsx"
  "src/components/insights/SoilQualityScore.tsx"
  "src/utils/soilCalculations.ts"
  "src/utils/pdfGenerator.ts"
)

for file in "${FILES[@]}"; do
  echo "Atualizando $file..."
  
  # Substituir a importação
  sed -i '' 's/import { SoilData, CalculatedResults } from '"'"'@\/pages\/Index'"'"';/import { SoilData, CalculationResult } from '"'"'@\/types\/soilAnalysis'"'"';/g' "$file"
  sed -i '' 's/import { CalculatedResults } from '"'"'@\/pages\/Index'"'"';/import { CalculationResult } from '"'"'@\/types\/soilAnalysis'"'"';/g' "$file"
  
  # Substituir as referências ao tipo
  sed -i '' 's/CalculatedResults/CalculationResult/g' "$file"
done

echo "Atualização concluída!" 