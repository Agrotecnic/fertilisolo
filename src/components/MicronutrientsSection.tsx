import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormattedInput } from '@/components/FormattedInput';

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
}

export const MicronutrientsSection: React.FC<MicronutrientsSectionProps> = ({
  B, Cu, Fe, Mn, Zn, Mo,
  onBChange, onCuChange, onFeChange, onMnChange, onZnChange, onMoChange,
  errors
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-0 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[8px]">Boro (B)</CardTitle>
          <CardDescription className="text-[6px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={B}
            onChange={onBChange}
            placeholder="0,0"
            className={`h-5 text-[8px] ${errors.B ? 'border-red-500' : ''}`}
          />
          {errors.B && <span className="text-red-500 text-[6px]">{errors.B}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-0 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[8px]">Cobre (Cu)</CardTitle>
          <CardDescription className="text-[6px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={Cu}
            onChange={onCuChange}
            placeholder="0,0"
            className={`h-5 text-[8px] ${errors.Cu ? 'border-red-500' : ''}`}
          />
          {errors.Cu && <span className="text-red-500 text-[6px]">{errors.Cu}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-0 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[8px]">Ferro (Fe)</CardTitle>
          <CardDescription className="text-[6px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={Fe}
            onChange={onFeChange}
            placeholder="0,0"
            className={`h-5 text-[8px] ${errors.Fe ? 'border-red-500' : ''}`}
          />
          {errors.Fe && <span className="text-red-500 text-[6px]">{errors.Fe}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-0 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[8px]">Manganês (Mn)</CardTitle>
          <CardDescription className="text-[6px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={Mn}
            onChange={onMnChange}
            placeholder="0,0"
            className={`h-5 text-[8px] ${errors.Mn ? 'border-red-500' : ''}`}
          />
          {errors.Mn && <span className="text-red-500 text-[6px]">{errors.Mn}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-0 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[8px]">Zinco (Zn)</CardTitle>
          <CardDescription className="text-[6px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={Zn}
            onChange={onZnChange}
            placeholder="0,0"
            className={`h-5 text-[8px] ${errors.Zn ? 'border-red-500' : ''}`}
          />
          {errors.Zn && <span className="text-red-500 text-[6px]">{errors.Zn}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-0 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[8px]">Molibdênio (Mo)</CardTitle>
          <CardDescription className="text-[6px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={Mo}
            onChange={onMoChange}
            placeholder="0,0"
            className={`h-5 text-[8px] ${errors.Mo ? 'border-red-500' : ''}`}
          />
          {errors.Mo && <span className="text-red-500 text-[6px]">{errors.Mo}</span>}
        </CardContent>
      </Card>
    </div>
  );
};
