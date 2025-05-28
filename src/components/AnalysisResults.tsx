
import React from 'react';
import { SoilData, CalculatedResults } from '@/pages/Index';
import { AnalysisInfo } from './AnalysisInfo';
import { SaturationsCard } from './SaturationsCard';
import { RelationshipCard } from './RelationshipCard';
import { MicronutrientsCard } from './MicronutrientsCard';
import { SecondaryNutrientsCard } from './SecondaryNutrientsCard';
import { NeedsCard } from './NeedsCard';
import { AlertsSection } from './AlertsSection';

interface AnalysisResultsProps {
  soilData: SoilData;
  results: CalculatedResults;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ soilData, results }) => {
  return (
    <div className="space-y-6">
      {/* Informações básicas - largura total */}
      <AnalysisInfo soilData={soilData} />
      
      {/* Cards principais em grid 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SaturationsCard soilData={soilData} results={results} />
        <RelationshipCard soilData={soilData} results={results} />
        <MicronutrientsCard soilData={soilData} results={results} />
        <SecondaryNutrientsCard soilData={soilData} results={results} />
      </div>
      
      {/* Cards de necessidades e alertas - largura total para melhor legibilidade */}
      <div className="space-y-6">
        <NeedsCard results={results} />
        <AlertsSection results={results} />
      </div>
    </div>
  );
};
