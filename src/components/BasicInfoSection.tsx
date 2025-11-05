import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface BasicInfoSectionProps {
  location: string;
  crop: string;
  date?: string;
  targetYield?: number;
  isAutoFilled?: boolean;
  onLocationChange: (value: string) => void;
  onCropChange: (value: string) => void;
  onDateChange?: (value: string) => void;
  onTargetYieldChange?: (value: number) => void;
  errors: Record<string, string>;
}

// Mapeamento de nomes de culturas para identificadores usados nos cálculos
export const cropIdentifierMap: Record<string, string> = {
  'Soja': 'soja',
  'Milho': 'milho',
  'Algodão': 'algodao',
  'Café Robusta': 'cafe',
  'Café Arábica': 'cafe',
  'Arroz': 'soja', // Usando soja como padrão para culturas sem dados específicos
  'Trigo': 'milho',
  'Pastagem': 'milho',
  'Cana-de-açúcar': 'cana',
  'Feijão': 'soja',
  'Sorgo': 'milho',
  'Girassol': 'milho',
  'Citros': 'cafe',
  'Eucalipto': 'cafe',
  'Outros': 'soja'
};

// Função para obter o identificador da cultura
export const getCropIdentifier = (cropName: string): string => {
  return cropIdentifierMap[cropName] || 'soja';
};

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
  date,
  targetYield,
  isAutoFilled,
  onLocationChange,
  onCropChange,
  onDateChange,
  onTargetYieldChange,
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
            <Label htmlFor="location" className="text-gray-700 text-xs font-medium">
              Nome do Talhão *
              {isAutoFilled && (
                <span className="ml-2 text-green-600 text-xs">✓ Preenchido automaticamente</span>
              )}
            </Label>
            <Input
              type="text"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="Ex: Talhão 1A, Área Norte"
              className={`h-7 text-xs text-gray-800 ${errors.location ? 'border-red-500' : isAutoFilled ? 'border-green-500 bg-green-50' : ''}`}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {onDateChange && (
            <div>
              <Label htmlFor="date" className="text-gray-700 text-xs font-medium">Data da Coleta</Label>
              <Input
                id="date"
                type="date"
                value={date || new Date().toISOString().split('T')[0]}
                onChange={(e) => onDateChange(e.target.value)}
                className="h-7 text-xs text-gray-800"
              />
              {errors.date && <span className="text-red-500 text-xs">{errors.date}</span>}
            </div>
          )}

          {onTargetYieldChange && (
            <div>
              <Label htmlFor="targetYield" className="text-gray-700 text-xs font-medium">Produtividade Esperada (ton/ha)</Label>
              <Input
                id="targetYield"
                type="number"
                step="0.1"
                min="0"
                value={targetYield || 4}
                onChange={(e) => onTargetYieldChange(Number(e.target.value))}
                placeholder="Ex: 4.0"
                className="h-7 text-xs text-gray-800"
              />
              <p className="text-xs text-gray-500 mt-1">Produtividade esperada em toneladas por hectare</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
