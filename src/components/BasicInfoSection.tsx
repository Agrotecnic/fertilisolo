
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormattedInput } from '@/components/FormattedInput';

interface BasicInfoSectionProps {
  location: string;
  crop: string;
  onLocationChange: (value: string) => void;
  onCropChange: (value: string) => void;
  errors: Record<string, string>;
}

const crops = [
  'Soja',
  'Milho',
  'Algodão',
  'Café',
  'Cana-de-açúcar',
  'Feijão',
  'Arroz',
  'Trigo',
  'Sorgo',
  'Girassol',
  'Pastagem',
  'Citros',
  'Eucalipto',
  'Outros'
];

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  location,
  crop,
  onLocationChange,
  onCropChange,
  errors
}) => {
  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-gray-800 text-base">Informações Básicas</CardTitle>
        <CardDescription className="text-xs">Dados gerais da análise</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="location" className="text-xs font-medium">Nome do Talhão *</Label>
            <FormattedInput
              type="text"
              value={location}
              onChange={onLocationChange}
              placeholder="Ex: Talhão 1A, Área Norte"
              className={`h-8 text-xs ${errors.location ? 'border-red-500' : ''}`}
            />
            {errors.location && <span className="text-red-500 text-xs">{errors.location}</span>}
          </div>
          
          <div>
            <Label htmlFor="crop" className="text-xs font-medium">Cultura *</Label>
            <Select value={crop} onValueChange={onCropChange}>
              <SelectTrigger className={`h-8 text-xs ${errors.crop ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Selecione a cultura" />
              </SelectTrigger>
              <SelectContent>
                {crops.map((cropOption) => (
                  <SelectItem key={cropOption} value={cropOption}>
                    {cropOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.crop && <span className="text-red-500 text-xs">{errors.crop}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
