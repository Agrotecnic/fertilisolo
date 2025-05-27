
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 pt-2 px-2">
          <CardTitle className="text-gray-800 text-xs">Enxofre (S)</CardTitle>
          <CardDescription className="text-[10px]">mg/dm³</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-2 pb-2">
          <FormattedInput
            value={S}
            onChange={onSChange}
            placeholder="0,0"
            className={`h-7 text-xs ${errors.S ? 'border-red-500' : ''}`}
          />
          {errors.S && <span className="text-red-500 text-[10px]">{errors.S}</span>}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-1 pt-2 px-2">
          <CardTitle className="text-gray-800 text-xs">Matéria Orgânica</CardTitle>
          <CardDescription className="text-[10px]">%</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-2 pb-2">
          <FormattedInput
            value={organicMatter}
            onChange={onOrganicMatterChange}
            placeholder="0,0"
            className={`h-7 text-xs ${errors.organicMatter ? 'border-red-500' : ''}`}
          />
          {errors.organicMatter && <span className="text-red-500 text-[10px]">{errors.organicMatter}</span>}
        </CardContent>
      </Card>
    </div>
  );
};
