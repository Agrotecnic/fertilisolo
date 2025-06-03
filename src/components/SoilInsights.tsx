import React from 'react';
import { SoilData, CalculationResult } from '@/types/soilAnalysis';
import { SoilQualityScore } from './insights/SoilQualityScore';
import { LimitingFactors } from './insights/LimitingFactors';
import { CriticalPatterns } from './insights/CriticalPatterns';
import { StrategicRecommendations } from './insights/StrategicRecommendations';
import { ImplementationPlan } from './insights/ImplementationPlan';

interface SoilInsightsProps {
  soilData: SoilData;
  results: CalculationResult;
}

const calculateSoilQualityScore = (results: CalculationResult): number => {
  const { saturations, caeMgRatio, isAdequate } = results;
  
  let score = 0;
  let totalChecks = 0;

  // Macronutrientes primários (peso maior)
  const primaryNutrients = ['Ca', 'Mg', 'K', 'P'] as const;
  primaryNutrients.forEach(nutrient => {
    totalChecks += 3; // Peso 3 para primários
    if (isAdequate[nutrient]) score += 3;
  });

  // Relação Ca/Mg (muito importante)
  totalChecks += 2.5;
  if (isAdequate.CaMgRatio) score += 2.5;

  // Macronutrientes secundários
  const secondaryNutrients = ['S'] as const;
  secondaryNutrients.forEach(nutrient => {
    totalChecks += 1.5;
    if (isAdequate[nutrient]) score += 1.5;
  });

  // Micronutrientes
  const microNutrients = ['B', 'Cu', 'Fe', 'Mn', 'Zn', 'Mo'] as const;
  microNutrients.forEach(nutrient => {
    totalChecks += 1;
    if (isAdequate[nutrient]) score += 1;
  });

  return Math.round((score / totalChecks) * 100);
};

export const SoilInsights: React.FC<SoilInsightsProps> = ({ soilData, results }) => {
  const qualityScore = calculateSoilQualityScore(results);

  return (
    <div className="space-y-8">
      {/* Score principal - destaque no topo */}
      <div className="w-full">
        <SoilQualityScore results={results} />
      </div>
      
      {/* Grid principal com fatores limitantes e padrões críticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LimitingFactors results={results} />
        <CriticalPatterns soilData={soilData} results={results} />
      </div>
      
      {/* Recomendações estratégicas - largura total para melhor legibilidade */}
      <div className="w-full">
        <StrategicRecommendations soilData={soilData} results={results} />
      </div>
      
      {/* Cronograma de implementação - largura total */}
      <div className="w-full">
        <ImplementationPlan qualityScore={qualityScore} />
      </div>
    </div>
  );
};
