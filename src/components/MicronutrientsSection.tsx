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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">

      {/* Boro (B) */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-gray-800 text-xs md:text-sm font-semibold">Boro (B)</CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-1">
            <CardDescription className="text-gray-500 text-[10px] md:text-xs">
              {getUnitLabel('B', selectedUnits.B)}
            </CardDescription>
            <UnitSelector
              nutrient="B"
              selectedUnit={selectedUnits.B}
              onUnitChange={(unit) => onUnitChange('B', unit)}
              className="w-full sm:w-14 h-7 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-3">
          <FormattedInput
            value={B}
            onChange={onBChange}
            placeholder="0,0"
            className={`h-9 text-sm text-gray-800 border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 ${errors.B ? 'border-red-500' : ''}`}
          />
          {errors.B && <span className="text-red-500 text-[10px] md:text-xs mt-1 block">{errors.B}</span>}
        </CardContent>
      </Card>

      {/* Cobre (Cu) */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-gray-800 text-xs md:text-sm font-semibold">Cobre (Cu)</CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-1">
            <CardDescription className="text-gray-500 text-[10px] md:text-xs">
              {getUnitLabel('Cu', selectedUnits.Cu)}
            </CardDescription>
            <UnitSelector
              nutrient="Cu"
              selectedUnit={selectedUnits.Cu}
              onUnitChange={(unit) => onUnitChange('Cu', unit)}
              className="w-full sm:w-14 h-7 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-3">
          <FormattedInput
            value={Cu}
            onChange={onCuChange}
            placeholder="0,0"
            className={`h-9 text-sm text-gray-800 border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 ${errors.Cu ? 'border-red-500' : ''}`}
          />
          {errors.Cu && <span className="text-red-500 text-[10px] md:text-xs mt-1 block">{errors.Cu}</span>}
        </CardContent>
      </Card>

      {/* Ferro (Fe) */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-gray-800 text-xs md:text-sm font-semibold">Ferro (Fe)</CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-1">
            <CardDescription className="text-gray-500 text-[10px] md:text-xs">
              {getUnitLabel('Fe', selectedUnits.Fe)}
            </CardDescription>
            <UnitSelector
              nutrient="Fe"
              selectedUnit={selectedUnits.Fe}
              onUnitChange={(unit) => onUnitChange('Fe', unit)}
              className="w-full sm:w-14 h-7 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-3">
          <FormattedInput
            value={Fe}
            onChange={onFeChange}
            placeholder="0,0"
            className={`h-9 text-sm text-gray-800 border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 ${errors.Fe ? 'border-red-500' : ''}`}
          />
          {errors.Fe && <span className="text-red-500 text-[10px] md:text-xs mt-1 block">{errors.Fe}</span>}
        </CardContent>
      </Card>

      {/* Manganês (Mn) */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-gray-800 text-xs md:text-sm font-semibold">Manganês (Mn)</CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-1">
            <CardDescription className="text-gray-500 text-[10px] md:text-xs">
              {getUnitLabel('Mn', selectedUnits.Mn)}
            </CardDescription>
            <UnitSelector
              nutrient="Mn"
              selectedUnit={selectedUnits.Mn}
              onUnitChange={(unit) => onUnitChange('Mn', unit)}
              className="w-full sm:w-14 h-7 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-3">
          <FormattedInput
            value={Mn}
            onChange={onMnChange}
            placeholder="0,0"
            className={`h-9 text-sm text-gray-800 border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 ${errors.Mn ? 'border-red-500' : ''}`}
          />
          {errors.Mn && <span className="text-red-500 text-[10px] md:text-xs mt-1 block">{errors.Mn}</span>}
        </CardContent>
      </Card>

      {/* Zinco (Zn) */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-gray-800 text-xs md:text-sm font-semibold">Zinco (Zn)</CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-1">
            <CardDescription className="text-gray-500 text-[10px] md:text-xs">
              {getUnitLabel('Zn', selectedUnits.Zn)}
            </CardDescription>
            <UnitSelector
              nutrient="Zn"
              selectedUnit={selectedUnits.Zn}
              onUnitChange={(unit) => onUnitChange('Zn', unit)}
              className="w-full sm:w-14 h-7 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-3">
          <FormattedInput
            value={Zn}
            onChange={onZnChange}
            placeholder="0,0"
            className={`h-9 text-sm text-gray-800 border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 ${errors.Zn ? 'border-red-500' : ''}`}
          />
          {errors.Zn && <span className="text-red-500 text-[10px] md:text-xs mt-1 block">{errors.Zn}</span>}
        </CardContent>
      </Card>

      {/* Molibdênio (Mo) — opcional */}
      <Card className="bg-gray-50 border-gray-200 border-dashed">
        <CardHeader className="pb-2 pt-3 px-3">
          <div className="flex items-center gap-1.5">
            <CardTitle className="text-gray-800 text-xs md:text-sm font-semibold">Molibdênio (Mo)</CardTitle>
            <span className="text-[10px] text-gray-400 italic">(opcional)</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-1">
            <CardDescription className="text-gray-500 text-[10px] md:text-xs">
              {getUnitLabel('Mo', selectedUnits.Mo)}
            </CardDescription>
            <UnitSelector
              nutrient="Mo"
              selectedUnit={selectedUnits.Mo}
              onUnitChange={(unit) => onUnitChange('Mo', unit)}
              className="w-full sm:w-14 h-7 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-3">
          <FormattedInput
            value={Mo}
            onChange={onMoChange}
            placeholder="0,0"
            className={`h-9 text-sm text-gray-800 border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 ${errors.Mo ? 'border-red-500' : ''}`}
          />
          {errors.Mo && <span className="text-red-500 text-[10px] md:text-xs mt-1 block">{errors.Mo}</span>}
        </CardContent>
      </Card>

    </div>
  );
};
