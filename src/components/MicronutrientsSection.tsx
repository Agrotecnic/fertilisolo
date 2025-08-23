import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormattedInput } from '@/components/FormattedInput';
import { UnitSelector } from '@/components/UnitSelector';
import { getUnitLabel } from '@/utils/unitConversions';

interface MicronutrientsSectionProps {
  B: number | string;
  Cu: number | string;
  Fe: number | string;
  Mn: number | string;
  Zn: number | string;
  Mo: number | string;
  onBChange: (value: number | string) => void;
  onCuChange: (value: number | string) => void;
  onFeChange: (value: number | string) => void;
  onMnChange: (value: number | string) => void;
  onZnChange: (value: number | string) => void;
  onMoChange: (value: number | string) => void;
  errors: Record<string, string>;
  selectedUnits: Record<string, string>;
  onUnitChange: (nutrient: string, unit: string) => void;
}

export const MicronutrientsSection: React.FC<MicronutrientsSectionProps> = ({
  B, Cu, Fe, Mn, Zn, Mo,
  onBChange, onCuChange, onFeChange, onMnChange, onZnChange, onMoChange,
  errors,
  selectedUnits,
  onUnitChange
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-0 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[8px]">Boro (B)</CardTitle>
          <div className="flex items-center justify-between">
            <CardDescription className="text-gray-600 text-[6px]">
              {getUnitLabel('B', selectedUnits.B)}
            </CardDescription>
            <UnitSelector
              nutrient="B"
              selectedUnit={selectedUnits.B}
              onUnitChange={(unit) => onUnitChange('B', unit)}
              className="w-12"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={B}
            onChange={onBChange}
            placeholder="0,0"
            className={`h-5 text-[8px] text-gray-800 ${errors.B ? 'border-red-500' : ''}`}
          />
          {errors.B && <span className="text-red-500 text-[6px]">{errors.B}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-0 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[8px]">Cobre (Cu)</CardTitle>
          <div className="flex items-center justify-between">
            <CardDescription className="text-gray-600 text-[6px]">
              {getUnitLabel('Cu', selectedUnits.Cu)}
            </CardDescription>
            <UnitSelector
              nutrient="Cu"
              selectedUnit={selectedUnits.Cu}
              onUnitChange={(unit) => onUnitChange('Cu', unit)}
              className="w-12"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={Cu}
            onChange={onCuChange}
            placeholder="0,0"
            className={`h-5 text-[8px] text-gray-800 ${errors.Cu ? 'border-red-500' : ''}`}
          />
          {errors.Cu && <span className="text-red-500 text-[6px]">{errors.Cu}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-0 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[8px]">Ferro (Fe)</CardTitle>
          <div className="flex items-center justify-between">
            <CardDescription className="text-gray-600 text-[6px]">
              {getUnitLabel('Fe', selectedUnits.Fe)}
            </CardDescription>
            <UnitSelector
              nutrient="Fe"
              selectedUnit={selectedUnits.Fe}
              onUnitChange={(unit) => onUnitChange('Fe', unit)}
              className="w-12"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={Fe}
            onChange={onFeChange}
            placeholder="0,0"
            className={`h-5 text-[8px] text-gray-800 ${errors.Fe ? 'border-red-500' : ''}`}
          />
          {errors.Fe && <span className="text-red-500 text-[6px]">{errors.Fe}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-0 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[8px]">Manganês (Mn)</CardTitle>
          <div className="flex items-center justify-between">
            <CardDescription className="text-gray-600 text-[6px]">
              {getUnitLabel('Mn', selectedUnits.Mn)}
            </CardDescription>
            <UnitSelector
              nutrient="Mn"
              selectedUnit={selectedUnits.Mn}
              onUnitChange={(unit) => onUnitChange('Mn', unit)}
              className="w-12"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={Mn}
            onChange={onMnChange}
            placeholder="0,0"
            className={`h-5 text-[8px] text-gray-800 ${errors.Mn ? 'border-red-500' : ''}`}
          />
          {errors.Mn && <span className="text-red-500 text-[6px]">{errors.Mn}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-0 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[8px]">Zinco (Zn)</CardTitle>
          <div className="flex items-center justify-between">
            <CardDescription className="text-gray-600 text-[6px]">
              {getUnitLabel('Zn', selectedUnits.Zn)}
            </CardDescription>
            <UnitSelector
              nutrient="Zn"
              selectedUnit={selectedUnits.Zn}
              onUnitChange={(unit) => onUnitChange('Zn', unit)}
              className="w-12"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={Zn}
            onChange={onZnChange}
            placeholder="0,0"
            className={`h-5 text-[8px] text-gray-800 ${errors.Zn ? 'border-red-500' : ''}`}
          />
          {errors.Zn && <span className="text-red-500 text-[6px]">{errors.Zn}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-0 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[8px]">Molibdênio (Mo)</CardTitle>
          <div className="flex items-center justify-between">
            <CardDescription className="text-gray-600 text-[6px]">
              {getUnitLabel('Mo', selectedUnits.Mo)}
            </CardDescription>
            <UnitSelector
              nutrient="Mo"
              selectedUnit={selectedUnits.Mo}
              onUnitChange={(unit) => onUnitChange('Mo', unit)}
              className="w-12"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={Mo}
            onChange={onMoChange}
            placeholder="0,0"
            className={`h-5 text-[8px] text-gray-800 ${errors.Mo ? 'border-red-500' : ''}`}
          />
          {errors.Mo && <span className="text-red-500 text-[6px]">{errors.Mo}</span>}
        </CardContent>
      </Card>
    </div>
  );
};
