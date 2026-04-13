import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CheckCircle2 } from 'lucide-react';

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
      <CardHeader className="pb-1 pt-2 md:pt-3 px-2 md:px-3">
        <CardTitle className="text-gray-800 text-xs md:text-sm">Informações Básicas</CardTitle>
        <CardDescription className="text-gray-600 text-[10px] md:text-xs">Dados gerais da análise</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 px-2 md:px-3 pb-2 md:pb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <Label htmlFor="location" className="text-gray-700 text-xs font-medium flex items-center gap-1">
              Nome do Talhão <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(obrigatório)</span>
              {isAutoFilled && (
                <span className="ml-1 inline-flex items-center gap-0.5 text-green-600 text-[10px] md:text-xs">
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  Preenchido automaticamente
                </span>
              )}
            </Label>
            <Input
              id="location"
              type="text"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="Ex: Talhão 1A, Área Norte"
              aria-required="true"
              aria-describedby={errors.location ? 'location-error' : undefined}
              aria-invalid={Boolean(errors.location)}
              className={`h-8 md:h-7 text-xs text-gray-800 ${errors.location ? 'border-red-500' : isAutoFilled ? 'border-green-500 bg-green-50' : ''}`}
            />
            {errors.location && (
              <span id="location-error" role="alert" className="text-red-500 text-[10px] md:text-xs flex items-center gap-1 mt-0.5">
                {errors.location}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="crop" className="text-gray-700 text-xs font-medium">
              Cultura <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(obrigatório)</span>
            </Label>
            <Select value={crop} onValueChange={onCropChange}>
              <SelectTrigger
                id="crop"
                aria-required="true"
                aria-invalid={Boolean(errors.crop)}
                aria-describedby={errors.crop ? 'crop-error' : undefined}
                className={`h-8 md:h-7 text-xs text-gray-800 ${errors.crop ? 'border-red-500' : ''}`}
              >
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
            {errors.crop && (
              <span id="crop-error" role="alert" className="text-red-500 text-[10px] md:text-xs flex items-center gap-1 mt-0.5">
                {errors.crop}
              </span>
            )}
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
                className="h-8 md:h-7 text-xs text-gray-800"
              />
              {errors.date && <span className="text-red-500 text-[10px] md:text-xs">{errors.date}</span>}
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
                value={targetYield !== undefined && targetYield !== null && targetYield !== '' ? targetYield : ''}
                onChange={(e) => onTargetYieldChange(e.target.value === '' ? undefined : Number(e.target.value))}
                placeholder="4.0"
                className="h-8 md:h-7 text-xs text-gray-800"
                onFocus={(e) => e.target.select()}
              />
              <p className="text-[10px] md:text-xs text-gray-500 mt-1">Produtividade esperada em toneladas por hectare</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
