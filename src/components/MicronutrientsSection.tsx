
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <Card className="bg-indigo-50 border-indigo-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-indigo-800 text-sm">Boro (B)</CardTitle>
          <CardDescription className="text-xs">ppm</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <FormattedInput
            value={B}
            onChange={onBChange}
            placeholder="0,0"
            className={errors.B ? 'border-red-500' : ''}
          />
          {errors.B && <span className="text-red-500 text-xs">{errors.B}</span>}
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-800 text-sm">Cobre (Cu)</CardTitle>
          <CardDescription className="text-xs">ppm</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <FormattedInput
            value={Cu}
            onChange={onCuChange}
            placeholder="0,0"
            className={errors.Cu ? 'border-red-500' : ''}
          />
          {errors.Cu && <span className="text-red-500 text-xs">{errors.Cu}</span>}
        </CardContent>
      </Card>

      <Card className="bg-slate-50 border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-800 text-sm">Ferro (Fe)</CardTitle>
          <CardDescription className="text-xs">ppm</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <FormattedInput
            value={Fe}
            onChange={onFeChange}
            placeholder="0,0"
            className={errors.Fe ? 'border-red-500' : ''}
          />
          {errors.Fe && <span className="text-red-500 text-xs">{errors.Fe}</span>}
        </CardContent>
      </Card>

      <Card className="bg-pink-50 border-pink-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-pink-800 text-sm">Manganês (Mn)</CardTitle>
          <CardDescription className="text-xs">ppm</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <FormattedInput
            value={Mn}
            onChange={onMnChange}
            placeholder="0,0"
            className={errors.Mn ? 'border-red-500' : ''}
          />
          {errors.Mn && <span className="text-red-500 text-xs">{errors.Mn}</span>}
        </CardContent>
      </Card>

      <Card className="bg-cyan-50 border-cyan-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-cyan-800 text-sm">Zinco (Zn)</CardTitle>
          <CardDescription className="text-xs">ppm</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <FormattedInput
            value={Zn}
            onChange={onZnChange}
            placeholder="0,0"
            className={errors.Zn ? 'border-red-500' : ''}
          />
          {errors.Zn && <span className="text-red-500 text-xs">{errors.Zn}</span>}
        </CardContent>
      </Card>
    </div>
  );
};
