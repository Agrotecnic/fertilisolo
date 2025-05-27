
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FormattedInput } from '@/components/FormattedInput';

interface BasicInfoSectionProps {
  location: string;
  organicMatter: number;
  crop: string;
  onLocationChange: (value: string) => void;
  onOrganicMatterChange: (value: number) => void;
  onCropChange: (value: string) => void;
  errors: Record<string, string>;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  location,
  organicMatter,
  crop,
  onLocationChange,
  onOrganicMatterChange,
  onCropChange,
  errors
}) => {
  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-slate-800 text-lg">Informações Básicas</CardTitle>
        <CardDescription>Dados gerais da análise</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="location">Localização da Análise *</Label>
          <FormattedInput
            type="text"
            value={location}
            onChange={onLocationChange}
            placeholder="Ex: Fazenda São José, Talhão 3"
            className={errors.location ? 'border-red-500' : ''}
          />
          {errors.location && <span className="text-red-500 text-sm">{errors.location}</span>}
        </div>
        
        <div>
          <Label htmlFor="crop">Cultura *</Label>
          <FormattedInput
            type="text"
            value={crop}
            onChange={onCropChange}
            placeholder="Ex: Soja, Milho, Café"
            className={errors.crop ? 'border-red-500' : ''}
          />
          {errors.crop && <span className="text-red-500 text-sm">{errors.crop}</span>}
        </div>
        
        <div>
          <Label htmlFor="organicMatter">Matéria Orgânica (%)</Label>
          <FormattedInput
            value={organicMatter}
            onChange={onOrganicMatterChange}
            placeholder="0,0"
            className={errors.organicMatter ? 'border-red-500' : ''}
          />
          {errors.organicMatter && <span className="text-red-500 text-sm">{errors.organicMatter}</span>}
        </div>
      </CardContent>
    </Card>
  );
};
