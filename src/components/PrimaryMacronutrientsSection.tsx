
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1">
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-0 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[8px]">CTC (T)</CardTitle>
          <CardDescription className="text-[6px]">cmolc/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={T}
            onChange={onTChange}
            placeholder="0,00"
            className={`h-5 text-[8px] ${errors.T ? 'border-red-500' : ''}`}
          />
          {errors.T && <span className="text-red-500 text-[6px]">{errors.T}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-0 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[8px]">Cálcio (Ca)</CardTitle>
          <CardDescription className="text-[6px]">cmolc/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={Ca}
            onChange={onCaChange}
            placeholder="0,00"
            className={`h-5 text-[8px] ${errors.Ca ? 'border-red-500' : ''}`}
          />
          {errors.Ca && <span className="text-red-500 text-[6px]">{errors.Ca}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-0 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[8px]">Magnésio (Mg)</CardTitle>
          <CardDescription className="text-[6px]">cmolc/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={Mg}
            onChange={onMgChange}
            placeholder="0,00"
            className={`h-5 text-[8px] ${errors.Mg ? 'border-red-500' : ''}`}
          />
          {errors.Mg && <span className="text-red-500 text-[6px]">{errors.Mg}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-0 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[8px]">Potássio (K)</CardTitle>
          <CardDescription className="text-[6px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={K}
            onChange={onKChange}
            placeholder="0,0"
            className={`h-5 text-[8px] ${errors.K ? 'border-red-500' : ''}`}
          />
          {errors.K && <span className="text-red-500 text-[6px]">{errors.K}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-0 pt-1 px-1">
          <CardTitle className="text-gray-800 text-[8px]">Fósforo (P)</CardTitle>
          <CardDescription className="text-[6px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-1 pb-1">
          <FormattedInput
            value={P}
            onChange={onPChange}
            placeholder="0,0"
            className={`h-5 text-[8px] ${errors.P ? 'border-red-500' : ''}`}
          />
          {errors.P && <span className="text-red-500 text-[6px]">{errors.P}</span>}
        </CardContent>
      </Card>
    </div>
  );
};
