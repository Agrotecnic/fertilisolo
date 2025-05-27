
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormattedInput } from '@/components/FormattedInput';

interface SecondaryMacronutrientsSectionProps {
  S: number;
  onSChange: (value: number) => void;
  errors: Record<string, string>;
}

export const SecondaryMacronutrientsSection: React.FC<SecondaryMacronutrientsSectionProps> = ({
  S, onSChange, errors
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-yellow-800 text-sm">Enxofre (S)</CardTitle>
          <CardDescription className="text-xs">ppm</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <FormattedInput
            value={S}
            onChange={onSChange}
            placeholder="0,0"
            className={errors.S ? 'border-red-500' : ''}
          />
          {errors.S && <span className="text-red-500 text-xs">{errors.S}</span>}
        </CardContent>
      </Card>
    </div>
  );
};
