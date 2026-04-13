import React from 'react';
import { SoilData, CalculationResult } from '@/types/soilAnalysis';
import { AnalysisInfo } from './AnalysisInfo';
import { SaturationsCard } from './SaturationsCard';
import { RelationshipCard } from './RelationshipCard';
import { MicronutrientsCard } from './MicronutrientsCard';
import { SecondaryNutrientsCard } from './SecondaryNutrientsCard';
import { NeedsCard } from './NeedsCard';
import { AlertsSection } from './AlertsSection';
import { NutrientComparisonChart } from './NutrientComparisonChart';

interface AnalysisResultsProps {
  soilData: SoilData;
  results: CalculationResult;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ soilData, results }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Informações básicas - largura total */}
      <AnalysisInfo soilData={soilData} />

      {/* Gráfico comparativo Atual vs. Ideal */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both [animation-delay:50ms]">
        <NutrientComparisonChart results={results} soilData={soilData} />
      </div>

      {/* Cards principais em grid responsivo: 1 col → 2 col em md → 2 col em lg */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both [animation-delay:100ms]">
          <SaturationsCard soilData={soilData} results={results} />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both [animation-delay:200ms]">
          <RelationshipCard soilData={soilData} results={results} />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both [animation-delay:300ms]">
          <MicronutrientsCard soilData={soilData} results={results} />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both [animation-delay:400ms]">
          <SecondaryNutrientsCard soilData={soilData} results={results} />
        </div>
      </div>

      {/* Cards de necessidades e alertas - largura total para melhor legibilidade */}
      <div className="space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both [animation-delay:500ms]">
          <NeedsCard results={results} />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both [animation-delay:600ms]">
          <AlertsSection results={results} />
        </div>
      </div>
    </div>
  );
};
