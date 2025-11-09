import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormattedInput } from '@/components/FormattedInput';
import { UnitSelector } from '@/components/UnitSelector';
import { getUnitLabel } from '@/utils/unitConversions';

interface PrimaryMacronutrientsSectionProps {
  T: number | string;
  Ca: number | string;
  Mg: number | string;
  K: number | string;
  P: number | string;
  onTChange: (value: number | string) => void;
  onCaChange: (value: number | string) => void;
  onMgChange: (value: number | string) => void;
  onKChange: (value: number | string) => void;
  onPChange: (value: number | string) => void;
  errors: Record<string, string>;
  selectedUnits: Record<string, string>;
  onUnitChange: (nutrient: string, unit: string) => void;
}

export const PrimaryMacronutrientsSection: React.FC<PrimaryMacronutrientsSectionProps> = ({
  T, Ca, Mg, K, P,
  onTChange, onCaChange, onMgChange, onKChange, onPChange,
  errors,
  selectedUnits,
  onUnitChange
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2 pt-3 px-2 md:px-3">
          <CardTitle className="text-gray-800 text-xs md:text-sm font-semibold">CTC (T)</CardTitle>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-0 mt-1">
            <CardDescription className="text-gray-600 text-[10px] md:text-xs">
              {getUnitLabel('T', selectedUnits.T)}
            </CardDescription>
            <UnitSelector
              nutrient="T"
              selectedUnit={selectedUnits.T}
              onUnitChange={(unit) => onUnitChange('T', unit)}
              className="w-full md:w-16 h-7 md:h-8 text-[10px] md:text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-2 md:px-3 pb-3">
          <FormattedInput
            value={T}
            onChange={onTChange}
            placeholder="0,00"
            className={`h-9 md:h-10 text-xs md:text-sm text-gray-800 border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 ${errors.T ? 'border-red-500' : ''}`}
          />
          {errors.T && <span className="text-red-500 text-[10px] md:text-xs mt-1">{errors.T}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 md:pb-0 pt-2 md:pt-1 px-2 md:px-1">
          <CardTitle className="text-gray-800 text-[10px] md:text-[8px] font-semibold">Cálcio (Ca)</CardTitle>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 mt-1">
            <CardDescription className="text-gray-600 text-[9px] md:text-[6px]">
              {getUnitLabel('Ca', selectedUnits.Ca)}
            </CardDescription>
            <UnitSelector
              nutrient="Ca"
              selectedUnit={selectedUnits.Ca}
              onUnitChange={(unit) => onUnitChange('Ca', unit)}
              className="w-full md:w-16 h-7 md:h-6 text-[9px] md:text-[8px]"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-2 md:px-1 pb-2 md:pb-1">
          <FormattedInput
            value={Ca}
            onChange={onCaChange}
            placeholder="0,00"
            className={`h-8 md:h-5 text-[10px] md:text-[8px] text-gray-800 ${errors.Ca ? 'border-red-500' : ''}`}
          />
          {errors.Ca && <span className="text-red-500 text-[9px] md:text-[6px]">{errors.Ca}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 md:pb-0 pt-2 md:pt-1 px-2 md:px-1">
          <CardTitle className="text-gray-800 text-[10px] md:text-[8px] font-semibold">Magnésio (Mg)</CardTitle>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 mt-1">
            <CardDescription className="text-gray-600 text-[9px] md:text-[6px]">
              {getUnitLabel('Mg', selectedUnits.Mg)}
            </CardDescription>
            <UnitSelector
              nutrient="Mg"
              selectedUnit={selectedUnits.Mg}
              onUnitChange={(unit) => onUnitChange('Mg', unit)}
              className="w-full md:w-12 h-7 md:h-6 text-[9px] md:text-[8px]"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-2 md:px-1 pb-2 md:pb-1">
          <FormattedInput
            value={Mg}
            onChange={onMgChange}
            placeholder="0,00"
            className={`h-8 md:h-5 text-[10px] md:text-[8px] text-gray-800 ${errors.Mg ? 'border-red-500' : ''}`}
          />
          {errors.Mg && <span className="text-red-500 text-[9px] md:text-[6px]">{errors.Mg}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 md:pb-0 pt-2 md:pt-1 px-2 md:px-1">
          <CardTitle className="text-gray-800 text-[10px] md:text-[8px] font-semibold">Potássio (K)</CardTitle>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 mt-1">
            <CardDescription className="text-gray-600 text-[9px] md:text-[6px]">
              {getUnitLabel('K', selectedUnits.K)}
            </CardDescription>
            <UnitSelector
              nutrient="K"
              selectedUnit={selectedUnits.K}
              onUnitChange={(unit) => onUnitChange('K', unit)}
              className="w-full md:w-12 h-7 md:h-6 text-[9px] md:text-[8px]"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-2 md:px-1 pb-2 md:pb-1">
          <FormattedInput
            value={K}
            onChange={onKChange}
            placeholder="0,0"
            className={`h-8 md:h-5 text-[10px] md:text-[8px] text-gray-800 ${errors.K ? 'border-red-500' : ''}`}
          />
          {errors.K && <span className="text-red-500 text-[9px] md:text-[6px]">{errors.K}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 md:pb-0 pt-2 md:pt-1 px-2 md:px-1">
          <CardTitle className="text-gray-800 text-[10px] md:text-[8px] font-semibold">Fósforo (P-resina)</CardTitle>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 mt-1">
            <CardDescription className="text-gray-600 text-[9px] md:text-[6px]">
              {getUnitLabel('P', selectedUnits.P)}
            </CardDescription>
            <UnitSelector
              nutrient="P"
              selectedUnit={selectedUnits.P}
              onUnitChange={(unit) => onUnitChange('P', unit)}
              className="w-full md:w-12 h-7 md:h-6 text-[9px] md:text-[8px]"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-2 md:px-1 pb-2 md:pb-1">
          <FormattedInput
            value={P}
            onChange={onPChange}
            placeholder="0,0"
            className={`h-8 md:h-5 text-[10px] md:text-[8px] text-gray-800 ${errors.P ? 'border-red-500' : ''}`}
          />
          {errors.P && <span className="text-red-500 text-[9px] md:text-[6px]">{errors.P}</span>}
        </CardContent>
      </Card>
    </div>
  );
};
