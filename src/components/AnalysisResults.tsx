
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
    <div className="space-y-4">
      <AnalysisInfo soilData={soilData} />
      <SaturationsCard soilData={soilData} results={results} />
      <RelationshipCard soilData={soilData} results={results} />
      <MicronutrientsCard soilData={soilData} results={results} />
      <SecondaryNutrientsCard soilData={soilData} results={results} />
      <NeedsCard results={results} />
      <AlertsSection results={results} />
    </div>
  );
};
