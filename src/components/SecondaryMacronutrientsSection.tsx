import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormattedInput } from '@/components/FormattedInput';
import { UnitSelector } from '@/components/UnitSelector';
import { getUnitLabel } from '@/utils/unitConversions';

interface SecondaryMacronutrientsSectionProps {
  S: number | string;
  organicMatter: number | string;
  onSChange: (value: number | string) => void;
  onOrganicMatterChange: (value: number | string) => void;
  errors: Record<string, string>;
  selectedUnits: Record<string, string>;
  onUnitChange: (nutrient: string, unit: string) => void;
}

export const SecondaryMacronutrientsSection: React.FC<SecondaryMacronutrientsSectionProps> = ({
  S, organicMatter, onSChange, onOrganicMatterChange, errors, selectedUnits, onUnitChange
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1">
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-0 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[8px]">Enxofre (S)</CardTitle>
          <div className="flex items-center justify-between">
            <CardDescription className="text-gray-600 text-[6px]">
              {getUnitLabel('S', selectedUnits.S)}
            </CardDescription>
            <UnitSelector
              nutrient="S"
              selectedUnit={selectedUnits.S}
              onUnitChange={(unit) => onUnitChange('S', unit)}
              className="w-12"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={S}
            onChange={onSChange}
            placeholder="0,0"
            className={`h-5 text-[8px] text-gray-800 ${errors.S ? 'border-red-500' : ''}`}
          />
          {errors.S && <span className="text-red-500 text-[6px]">{errors.S}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-0 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[8px]">Matéria Orgânica</CardTitle>
          <CardDescription className="text-gray-600 text-[6px]">%</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={organicMatter}
            onChange={onOrganicMatterChange}
            placeholder="0,0"
            className={`h-5 text-[8px] text-gray-800 ${errors.organicMatter ? 'border-red-500' : ''}`}
          />
          {errors.organicMatter && <span className="text-red-500 text-[6px]">{errors.organicMatter}</span>}
        </CardContent>
      </Card>

      {/* Placeholders para manter alinhamento visual */}
      <div className="hidden md:block lg:block"></div>
      <div className="hidden lg:block"></div>
      <div className="hidden lg:block"></div>
    </div>
  );
};
