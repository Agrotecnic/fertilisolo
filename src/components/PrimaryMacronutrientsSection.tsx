
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FormattedInput } from '@/components/FormattedInput';

interface PrimaryMacronutrientsSectionProps {
  T: number;
  Ca: number;
  Mg: number;
  K: number;
  P: number;
  onTChange: (value: number) => void;
  onCaChange: (value: number) => void;
  onMgChange: (value: number) => void;
  onKChange: (value: number) => void;
  onPChange: (value: number) => void;
  errors: Record<string, string>;
}

export const PrimaryMacronutrientsSection: React.FC<PrimaryMacronutrientsSectionProps> = ({
  T, Ca, Mg, K, P,
  onTChange, onCaChange, onMgChange, onKChange, onPChange,
  errors
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-800 text-sm">CTC (T)</CardTitle>
          <CardDescription className="text-xs">cmolc/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <FormattedInput
            value={T}
            onChange={onTChange}
            placeholder="0,00"
            className={errors.T ? 'border-red-500' : ''}
          />
          {errors.T && <span className="text-red-500 text-xs">{errors.T}</span>}
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-green-800 text-sm">Cálcio (Ca)</CardTitle>
          <CardDescription className="text-xs">cmolc/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <FormattedInput
            value={Ca}
            onChange={onCaChange}
            placeholder="0,00"
            className={errors.Ca ? 'border-red-500' : ''}
          />
          {errors.Ca && <span className="text-red-500 text-xs">{errors.Ca}</span>}
        </CardContent>
      </Card>

      <Card className="bg-purple-50 border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-purple-800 text-sm">Magnésio (Mg)</CardTitle>
          <CardDescription className="text-xs">cmolc/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <FormattedInput
            value={Mg}
            onChange={onMgChange}
            placeholder="0,00"
            className={errors.Mg ? 'border-red-500' : ''}
          />
          {errors.Mg && <span className="text-red-500 text-xs">{errors.Mg}</span>}
        </CardContent>
      </Card>

      <Card className="bg-orange-50 border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-orange-800 text-sm">Potássio (K)</CardTitle>
          <CardDescription className="text-xs">cmolc/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <FormattedInput
            value={K}
            onChange={onKChange}
            placeholder="0,00"
            className={errors.K ? 'border-red-500' : ''}
          />
          {errors.K && <span className="text-red-500 text-xs">{errors.K}</span>}
        </CardContent>
      </Card>

      <Card className="bg-red-50 border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-red-800 text-sm">Fósforo (P)</CardTitle>
          <CardDescription className="text-xs">ppm</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <FormattedInput
            value={P}
            onChange={onPChange}
            placeholder="0,0"
            className={errors.P ? 'border-red-500' : ''}
          />
          {errors.P && <span className="text-red-500 text-xs">{errors.P}</span>}
        </CardContent>
      </Card>
    </div>
  );
};
