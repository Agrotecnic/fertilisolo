import React from 'react';
import { SoilData, CalculationResult } from '@/types/soilAnalysis';
import { FertilizerHeader } from './fertilizer/FertilizerHeader';
import { MacronutrientCard } from './fertilizer/MacronutrientCard';
import { MicronutrientCard } from './fertilizer/MicronutrientCard';
import { ApplicationInfo } from './fertilizer/ApplicationInfo';

interface FertilizerRecommendationsProps {
  soilData: SoilData;
  results: CalculationResult;
  cultureName?: string;
}

export const FertilizerRecommendations: React.FC<FertilizerRecommendationsProps> = ({
  soilData,
  results,
  cultureName
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="animate-in fade-in zoom-in-95 duration-500 fill-mode-both" style={{ animationDelay: '100ms' }}>
        <FertilizerHeader soilData={soilData} results={results} cultureName={cultureName} />
      </div>

      {/* Macronutrientes Primários - Grid 2x2 */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '200ms' }}>
        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
          Macronutrientes Primários
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '250ms' }}>
            <MacronutrientCard nutrient="Ca" needValue={results.needs.Ca} title="Cálcio (Ca)" color="blue" />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '300ms' }}>
            <MacronutrientCard nutrient="Mg" needValue={results.needs.Mg} title="Magnésio (Mg)" color="purple" />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '350ms' }}>
            <MacronutrientCard nutrient="K" needValue={results.needs.K} title="Potássio (K)" color="orange" />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '400ms' }}>
            <MacronutrientCard nutrient="P" needValue={results.needs.P} title="Fósforo (P)" color="red" />
          </div>
        </div>
      </div>

      {/* Macronutrientes Secundários e Micronutrientes - Grid mais compacto */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '500ms' }}>
        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
          Macronutrientes Secundários e Micronutrientes
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="animate-in fade-in zoom-in-95 duration-500 fill-mode-both" style={{ animationDelay: '550ms' }}><MicronutrientCard nutrient="S" needValue={results.needs.S} title="Enxofre (S)" /></div>
          <div className="animate-in fade-in zoom-in-95 duration-500 fill-mode-both" style={{ animationDelay: '600ms' }}><MicronutrientCard nutrient="B" needValue={results.needs.B} title="Boro (B)" /></div>
          <div className="animate-in fade-in zoom-in-95 duration-500 fill-mode-both" style={{ animationDelay: '650ms' }}><MicronutrientCard nutrient="Cu" needValue={results.needs.Cu} title="Cobre (Cu)" /></div>
          <div className="animate-in fade-in zoom-in-95 duration-500 fill-mode-both" style={{ animationDelay: '700ms' }}><MicronutrientCard nutrient="Fe" needValue={results.needs.Fe} title="Ferro (Fe)" /></div>
          <div className="animate-in fade-in zoom-in-95 duration-500 fill-mode-both" style={{ animationDelay: '750ms' }}><MicronutrientCard nutrient="Mn" needValue={results.needs.Mn} title="Manganês (Mn)" /></div>
          <div className="animate-in fade-in zoom-in-95 duration-500 fill-mode-both" style={{ animationDelay: '800ms' }}><MicronutrientCard nutrient="Zn" needValue={results.needs.Zn} title="Zinco (Zn)" /></div>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '900ms' }}>
        <ApplicationInfo />
      </div>
    </div>
  );
};
