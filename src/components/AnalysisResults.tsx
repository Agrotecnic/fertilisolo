import React, { useEffect } from 'react';
import { SoilData, CalculationResult } from '@/types/soilAnalysis';
import { AnalysisInfo } from './AnalysisInfo';
import { SaturationsCard } from './SaturationsCard';
import { RelationshipCard } from './RelationshipCard';
import { MicronutrientsCard } from './MicronutrientsCard';
import { SecondaryNutrientsCard } from './SecondaryNutrientsCard';
import { NeedsCard } from './NeedsCard';
import { AlertsSection } from './AlertsSection';

interface AnalysisResultsProps {
  soilData: SoilData;
  results: CalculationResult;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ soilData, results }) => {
  useEffect(() => {
    console.log("DEBUG - AnalysisResults recebeu:", { soilData, results });
  }, [soilData, results]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Informações básicas - largura total */}
      <AnalysisInfo soilData={soilData} />

      {/* Cards principais em grid 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '100ms' }}>
          <SaturationsCard soilData={soilData} results={results} />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '200ms' }}>
          <RelationshipCard soilData={soilData} results={results} />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '300ms' }}>
          <MicronutrientsCard soilData={soilData} results={results} />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '400ms' }}>
          <SecondaryNutrientsCard soilData={soilData} results={results} />
        </div>
      </div>

      {/* Cards de necessidades e alertas - largura total para melhor legibilidade */}
      <div className="space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '500ms' }}>
          <NeedsCard results={results} />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '600ms' }}>
          <AlertsSection results={results} />
        </div>
      </div>
    </div>
  );
};
