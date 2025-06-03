import React from 'react';
import { SoilData, CalculationResult } from '@/types/soilAnalysis';
import { FertilizerHeader } from './fertilizer/FertilizerHeader';
import { MacronutrientCard } from './fertilizer/MacronutrientCard';
import { MicronutrientCard } from './fertilizer/MicronutrientCard';
import { ApplicationInfo } from './fertilizer/ApplicationInfo';

interface FertilizerRecommendationsProps {
  soilData: SoilData;
  results: CalculationResult;
}

export const FertilizerRecommendations: React.FC<FertilizerRecommendationsProps> = ({ 
  soilData, 
  results 
}) => {
  return (
    <div className="space-y-8">
      <FertilizerHeader soilData={soilData} results={results} />

      {/* Macronutrientes Primários - Grid 2x2 */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
          Macronutrientes Primários
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MacronutrientCard 
            nutrient="Ca" 
            needValue={results.needs.Ca} 
            title="Cálcio (Ca)" 
            color="blue" 
          />
          <MacronutrientCard 
            nutrient="Mg" 
            needValue={results.needs.Mg} 
            title="Magnésio (Mg)" 
            color="purple" 
          />
          <MacronutrientCard 
            nutrient="K" 
            needValue={results.needs.K} 
            title="Potássio (K)" 
            color="orange" 
          />
          <MacronutrientCard 
            nutrient="P" 
            needValue={results.needs.P} 
            title="Fósforo (P)" 
            color="red" 
          />
        </div>
      </div>

      {/* Macronutrientes Secundários e Micronutrientes - Grid mais compacto */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
          Macronutrientes Secundários e Micronutrientes
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MicronutrientCard nutrient="S" needValue={results.needs.S} title="Enxofre (S)" />
          <MicronutrientCard nutrient="B" needValue={results.needs.B} title="Boro (B)" />
          <MicronutrientCard nutrient="Cu" needValue={results.needs.Cu} title="Cobre (Cu)" />
          <MicronutrientCard nutrient="Fe" needValue={results.needs.Fe} title="Ferro (Fe)" />
          <MicronutrientCard nutrient="Mn" needValue={results.needs.Mn} title="Manganês (Mn)" />
          <MicronutrientCard nutrient="Zn" needValue={results.needs.Zn} title="Zinco (Zn)" />
        </div>
      </div>

      <ApplicationInfo />
    </div>
  );
};
