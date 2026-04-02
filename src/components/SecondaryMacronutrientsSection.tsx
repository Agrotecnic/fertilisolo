import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormattedInput } from '@/components/FormattedInput';
import { UnitSelector } from '@/components/UnitSelector';
import { getUnitLabel } from '@/utils/unitConversions';

interface SecondaryMacronutrientsSectionProps {
  S: number | string;
  organicMatter: number | string;
  argila: number | string;
  onSChange: (value: number | string) => void;
  onOrganicMatterChange: (value: number | string) => void;
  onArgilaChange: (value: number | string) => void;
  errors: Record<string, string>;
  selectedUnits: Record<string, string>;
  onUnitChange: (nutrient: string, unit: string) => void;
}

export const SecondaryMacronutrientsSection: React.FC<SecondaryMacronutrientsSectionProps> = ({
  S, organicMatter, argila, onSChange, onOrganicMatterChange, onArgilaChange, errors, selectedUnits, onUnitChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

      {/* Enxofre (S) */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-gray-800 text-xs md:text-sm font-semibold">Enxofre (S)</CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-1">
            <CardDescription className="text-gray-500 text-[10px] md:text-xs">
              {getUnitLabel('S', selectedUnits.S)}
            </CardDescription>
            <UnitSelector
              nutrient="S"
              selectedUnit={selectedUnits.S}
              onUnitChange={(unit) => onUnitChange('S', unit)}
              className="w-full sm:w-14 h-7 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-3">
          <FormattedInput
            value={S}
            onChange={onSChange}
            placeholder="0,0"
            className={`h-9 text-sm text-gray-800 border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 ${errors.S ? 'border-red-500' : ''}`}
          />
          {errors.S && <span className="text-red-500 text-[10px] md:text-xs mt-1 block">{errors.S}</span>}
        </CardContent>
      </Card>

      {/* Matéria Orgânica */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-gray-800 text-xs md:text-sm font-semibold">Matéria Orgânica</CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-1">
            <CardDescription className="text-gray-500 text-[10px] md:text-xs">
              {getUnitLabel('organicMatter', selectedUnits.organicMatter)}
            </CardDescription>
            <UnitSelector
              nutrient="organicMatter"
              selectedUnit={selectedUnits.organicMatter}
              onUnitChange={(unit) => onUnitChange('organicMatter', unit)}
              className="w-full sm:w-14 h-7 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-3">
          <FormattedInput
            value={organicMatter}
            onChange={onOrganicMatterChange}
            placeholder="0,0"
            className={`h-9 text-sm text-gray-800 border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 ${errors.organicMatter ? 'border-red-500' : ''}`}
          />
          {errors.organicMatter && <span className="text-red-500 text-[10px] md:text-xs mt-1 block">{errors.organicMatter}</span>}
        </CardContent>
      </Card>

      {/* Argila (%) */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-gray-800 text-xs md:text-sm font-semibold">Argila (%)</CardTitle>
          <CardDescription className="text-gray-500 text-[10px] md:text-xs mt-1">
            % de argila no solo
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-3">
          <FormattedInput
            value={argila}
            onChange={onArgilaChange}
            placeholder="35"
            className={`h-9 text-sm text-gray-800 border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 ${errors.argila ? 'border-red-500' : ''}`}
          />
          {errors.argila && <span className="text-red-500 text-[10px] md:text-xs mt-1 block">{errors.argila}</span>}
        </CardContent>
      </Card>

    </div>
  );
};
