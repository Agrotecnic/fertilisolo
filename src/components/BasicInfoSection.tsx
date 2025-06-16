import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

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
  'Café Robusta',
  'Café Arábica',
  'Arroz',
  'Trigo',
  'Pastagem',
  'Cana-de-açúcar',
  'Feijão',
  'Sorgo',
  'Girassol',
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
      <CardHeader className="pb-1 pt-3 px-3">
        <CardTitle className="text-gray-800 text-sm">Informações Básicas</CardTitle>
        <CardDescription className="text-gray-600 text-xs">Dados gerais da análise</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 px-3 pb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <Label htmlFor="location" className="text-gray-700 text-xs font-medium">Nome do Talhão *</Label>
            <Input
              type="text"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="Ex: Talhão 1A, Área Norte"
              className={`h-7 text-xs text-gray-800 ${errors.location ? 'border-red-500' : ''}`}
            />
            {errors.location && <span className="text-red-500 text-xs">{errors.location}</span>}
          </div>
          
          <div>
            <Label htmlFor="crop" className="text-gray-700 text-xs font-medium">Cultura *</Label>
            <Select value={crop} onValueChange={onCropChange}>
              <SelectTrigger className={`h-7 text-xs text-gray-800 ${errors.crop ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Selecione a cultura" className="text-gray-800" />
              </SelectTrigger>
              <SelectContent>
                {crops.map((cropOption) => (
                  <SelectItem key={cropOption} value={cropOption} className="text-gray-800">
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
