
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormattedInput } from '@/components/FormattedInput';

interface MicronutrientsSectionProps {
  B: number;
  Cu: number;
  Fe: number;
  Mn: number;
  Zn: number;
  onBChange: (value: number) => void;
  onCuChange: (value: number) => void;
  onFeChange: (value: number) => void;
  onMnChange: (value: number) => void;
  onZnChange: (value: number) => void;
  errors: Record<string, string>;
}

export const MicronutrientsSection: React.FC<MicronutrientsSectionProps> = ({
  B, Cu, Fe, Mn, Zn,
  onBChange, onCuChange, onFeChange, onMnChange, onZnChange,
  errors
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 pt-2 px-2">
          <CardTitle className="text-gray-800 text-xs">Boro (B)</CardTitle>
          <CardDescription className="text-[10px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-2 pb-2">
          <FormattedInput
            value={B}
            onChange={onBChange}
            placeholder="0,0"
            className={`h-7 text-xs ${errors.B ? 'border-red-500' : ''}`}
          />
          {errors.B && <span className="text-red-500 text-[10px]">{errors.B}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 pt-2 px-2">
          <CardTitle className="text-gray-800 text-xs">Cobre (Cu)</CardTitle>
          <CardDescription className="text-[10px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-2 pb-2">
          <FormattedInput
            value={Cu}
            onChange={onCuChange}
            placeholder="0,0"
            className={`h-7 text-xs ${errors.Cu ? 'border-red-500' : ''}`}
          />
          {errors.Cu && <span className="text-red-500 text-[10px]">{errors.Cu}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 pt-2 px-2">
          <CardTitle className="text-gray-800 text-xs">Ferro (Fe)</CardTitle>
          <CardDescription className="text-[10px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-2 pb-2">
          <FormattedInput
            value={Fe}
            onChange={onFeChange}
            placeholder="0,0"
            className={`h-7 text-xs ${errors.Fe ? 'border-red-500' : ''}`}
          />
          {errors.Fe && <span className="text-red-500 text-[10px]">{errors.Fe}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 pt-2 px-2">
          <CardTitle className="text-gray-800 text-xs">Manganês (Mn)</CardTitle>
          <CardDescription className="text-[10px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-2 pb-2">
          <FormattedInput
            value={Mn}
            onChange={onMnChange}
            placeholder="0,0"
            className={`h-7 text-xs ${errors.Mn ? 'border-red-500' : ''}`}
          />
          {errors.Mn && <span className="text-red-500 text-[10px]">{errors.Mn}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 pt-2 px-2">
          <CardTitle className="text-gray-800 text-xs">Zinco (Zn)</CardTitle>
          <CardDescription className="text-[10px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-2 pb-2">
          <FormattedInput
            value={Zn}
            onChange={onZnChange}
            placeholder="0,0"
            className={`h-7 text-xs ${errors.Zn ? 'border-red-500' : ''}`}
          />
          {errors.Zn && <span className="text-red-500 text-[10px]">{errors.Zn}</span>}
        </CardContent>
      </Card>
    </div>
  );
};
