
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 pt-2 px-2">
          <CardTitle className="text-gray-800 text-xs">CTC (T)</CardTitle>
          <CardDescription className="text-[10px]">cmolc/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-2 pb-2">
          <FormattedInput
            value={T}
            onChange={onTChange}
            placeholder="0,00"
            className={`h-7 text-xs ${errors.T ? 'border-red-500' : ''}`}
          />
          {errors.T && <span className="text-red-500 text-[10px]">{errors.T}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 pt-2 px-2">
          <CardTitle className="text-gray-800 text-xs">Cálcio (Ca)</CardTitle>
          <CardDescription className="text-[10px]">cmolc/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-2 pb-2">
          <FormattedInput
            value={Ca}
            onChange={onCaChange}
            placeholder="0,00"
            className={`h-7 text-xs ${errors.Ca ? 'border-red-500' : ''}`}
          />
          {errors.Ca && <span className="text-red-500 text-[10px]">{errors.Ca}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 pt-2 px-2">
          <CardTitle className="text-gray-800 text-xs">Magnésio (Mg)</CardTitle>
          <CardDescription className="text-[10px]">cmolc/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-2 pb-2">
          <FormattedInput
            value={Mg}
            onChange={onMgChange}
            placeholder="0,00"
            className={`h-7 text-xs ${errors.Mg ? 'border-red-500' : ''}`}
          />
          {errors.Mg && <span className="text-red-500 text-[10px]">{errors.Mg}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 pt-2 px-2">
          <CardTitle className="text-gray-800 text-xs">Potássio (K)</CardTitle>
          <CardDescription className="text-[10px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-2 pb-2">
          <FormattedInput
            value={K}
            onChange={onKChange}
            placeholder="0,0"
            className={`h-7 text-xs ${errors.K ? 'border-red-500' : ''}`}
          />
          {errors.K && <span className="text-red-500 text-[10px]">{errors.K}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 pt-2 px-2">
          <CardTitle className="text-gray-800 text-xs">Fósforo (P)</CardTitle>
          <CardDescription className="text-[10px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-2 pb-2">
          <FormattedInput
            value={P}
            onChange={onPChange}
            placeholder="0,0"
            className={`h-7 text-xs ${errors.P ? 'border-red-500' : ''}`}
          />
          {errors.P && <span className="text-red-500 text-[10px]">{errors.P}</span>}
        </CardContent>
      </Card>
    </div>
  );
};
