
import React from 'react';
import { SoilData, CalculatedResults } from '@/pages/Index';
import { SoilQualityScore } from './insights/SoilQualityScore';
import { LimitingFactors } from './insights/LimitingFactors';
import { CriticalPatterns } from './insights/CriticalPatterns';
import { StrategicRecommendations } from './insights/StrategicRecommendations';
import { ImplementationPlan } from './insights/ImplementationPlan';

interface SoilInsightsProps {
  soilData: SoilData;
  results: CalculatedResults;
}

const calculateSoilQualityScore = (results: CalculatedResults): number => {
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
    <div className="space-y-6">
      <SoilQualityScore results={results} />
      <LimitingFactors results={results} />
      <CriticalPatterns soilData={soilData} results={results} />
      <StrategicRecommendations soilData={soilData} results={results} />
      <ImplementationPlan qualityScore={qualityScore} />
    </div>
  );
};
