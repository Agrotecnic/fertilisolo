
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormattedInput } from '@/components/FormattedInput';

interface MicronutrientsSectionProps {
  B: number;
  Cu: number;
  Fe: number;
  Mn: number;
  Zn: number;
  Mo: number;
  Cl: number;
  Ni: number;
  onBChange: (value: number) => void;
  onCuChange: (value: number) => void;
  onFeChange: (value: number) => void;
  onMnChange: (value: number) => void;
  onZnChange: (value: number) => void;
  onMoChange: (value: number) => void;
  onClChange: (value: number) => void;
  onNiChange: (value: number) => void;
  errors: Record<string, string>;
}

export const MicronutrientsSection: React.FC<MicronutrientsSectionProps> = ({
  B, Cu, Fe, Mn, Zn, Mo, Cl, Ni,
  onBChange, onCuChange, onFeChange, onMnChange, onZnChange, onMoChange, onClChange, onNiChange,
  errors
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[10px]">Boro (B)</CardTitle>
          <CardDescription className="text-[8px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={B}
            onChange={onBChange}
            placeholder="0,0"
            className={`h-6 text-[10px] ${errors.B ? 'border-red-500' : ''}`}
          />
          {errors.B && <span className="text-red-500 text-[8px]">{errors.B}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[10px]">Cobre (Cu)</CardTitle>
          <CardDescription className="text-[8px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={Cu}
            onChange={onCuChange}
            placeholder="0,0"
            className={`h-6 text-[10px] ${errors.Cu ? 'border-red-500' : ''}`}
          />
          {errors.Cu && <span className="text-red-500 text-[8px]">{errors.Cu}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[10px]">Ferro (Fe)</CardTitle>
          <CardDescription className="text-[8px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={Fe}
            onChange={onFeChange}
            placeholder="0,0"
            className={`h-6 text-[10px] ${errors.Fe ? 'border-red-500' : ''}`}
          />
          {errors.Fe && <span className="text-red-500 text-[8px]">{errors.Fe}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[10px]">Manganês (Mn)</CardTitle>
          <CardDescription className="text-[8px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={Mn}
            onChange={onMnChange}
            placeholder="0,0"
            className={`h-6 text-[10px] ${errors.Mn ? 'border-red-500' : ''}`}
          />
          {errors.Mn && <span className="text-red-500 text-[8px]">{errors.Mn}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[10px]">Zinco (Zn)</CardTitle>
          <CardDescription className="text-[8px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={Zn}
            onChange={onZnChange}
            placeholder="0,0"
            className={`h-6 text-[10px] ${errors.Zn ? 'border-red-500' : ''}`}
          />
          {errors.Zn && <span className="text-red-500 text-[8px]">{errors.Zn}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[10px]">Molibdênio (Mo)</CardTitle>
          <CardDescription className="text-[8px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={Mo}
            onChange={onMoChange}
            placeholder="0,0"
            className={`h-6 text-[10px] ${errors.Mo ? 'border-red-500' : ''}`}
          />
          {errors.Mo && <span className="text-red-500 text-[8px]">{errors.Mo}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[10px]">Cloro (Cl)</CardTitle>
          <CardDescription className="text-[8px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={Cl}
            onChange={onClChange}
            placeholder="0,0"
            className={`h-6 text-[10px] ${errors.Cl ? 'border-red-500' : ''}`}
          />
          {errors.Cl && <span className="text-red-500 text-[8px]">{errors.Cl}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[10px]">Níquel (Ni)</CardTitle>
          <CardDescription className="text-[8px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={Ni}
            onChange={onNiChange}
            placeholder="0,0"
            className={`h-6 text-[10px] ${errors.Ni ? 'border-red-500' : ''}`}
          />
          {errors.Ni && <span className="text-red-500 text-[8px]">{errors.Ni}</span>}
        </CardContent>
      </Card>
    </div>
  );
};
