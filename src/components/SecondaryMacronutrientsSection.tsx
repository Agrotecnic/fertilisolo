
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormattedInput } from '@/components/FormattedInput';

interface SecondaryMacronutrientsSectionProps {
  S: number;
  organicMatter: number;
  onSChange: (value: number) => void;
  onOrganicMatterChange: (value: number) => void;
  errors: Record<string, string>;
}

export const SecondaryMacronutrientsSection: React.FC<SecondaryMacronutrientsSectionProps> = ({
  S, organicMatter, onSChange, onOrganicMatterChange, errors
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-gray-800 text-sm">Enxofre (S)</CardTitle>
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

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-gray-800 text-sm">Matéria Orgânica</CardTitle>
          <CardDescription className="text-xs">%</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <FormattedInput
            value={organicMatter}
            onChange={onOrganicMatterChange}
            placeholder="0,0"
            className={errors.organicMatter ? 'border-red-500' : ''}
          />
          {errors.organicMatter && <span className="text-red-500 text-xs">{errors.organicMatter}</span>}
        </CardContent>
      </Card>
    </div>
  );
};
