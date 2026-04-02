import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sprout, Info } from 'lucide-react';
import { calculateFertilizerRecommendations } from '@/utils/soilCalculations';
import { formatNumber, formatNumberOptional } from '@/utils/numberFormat';

interface MacronutrientCardProps {
  nutrient: 'Ca' | 'Mg' | 'K' | 'P';
  needValue: number;
  title: string;
  color: 'blue' | 'purple' | 'orange' | 'red';
}

// Mapa estático para que o Tailwind JIT gere todas as classes no build
const colorMap = {
  blue: {
    card: 'bg-white border-blue-200',
    title: 'text-blue-800',
    badgeOutline: 'text-blue-700 border-blue-300',
    item: 'bg-blue-50 border border-blue-100 hover:bg-blue-100',
    itemBadge: 'bg-blue-200 text-blue-800 border-blue-300',
  },
  purple: {
    card: 'bg-white border-purple-200',
    title: 'text-purple-800',
    badgeOutline: 'text-purple-700 border-purple-300',
    item: 'bg-purple-50 border border-purple-100 hover:bg-purple-100',
    itemBadge: 'bg-purple-200 text-purple-800 border-purple-300',
  },
  orange: {
    card: 'bg-white border-orange-200',
    title: 'text-orange-800',
    badgeOutline: 'text-orange-700 border-orange-300',
    item: 'bg-orange-50 border border-orange-100 hover:bg-orange-100',
    itemBadge: 'bg-orange-200 text-orange-800 border-orange-300',
  },
  red: {
    card: 'bg-white border-red-200',
    title: 'text-red-800',
    badgeOutline: 'text-red-700 border-red-300',
    item: 'bg-red-50 border border-red-100 hover:bg-red-100',
    itemBadge: 'bg-red-200 text-red-800 border-red-300',
  },
} as const;

export const MacronutrientCard: React.FC<MacronutrientCardProps> = ({
  nutrient,
  needValue,
  title,
  color
}) => {
  if (needValue <= 0.01) {
    return (
      <Card className="bg-green-50 border-green-200 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-green-800 flex items-center gap-2 text-base">
            <Sprout className="h-5 w-5" />
            {title}
            <Badge className="bg-green-100 text-green-800 text-xs">Adequado</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-green-700 text-sm">
            Os níveis de {title.toLowerCase()} estão adequados. Não é necessária correção.
          </p>
        </CardContent>
      </Card>
    );
  }

  const recommendations = calculateFertilizerRecommendations(nutrient, needValue);
  const c = colorMap[color];

  return (
    <Card className={`${c.card} hover:shadow-lg transition-shadow`}>
      <CardHeader className="pb-4">
        <CardTitle className={`${c.title} text-base flex items-center gap-2`}>
          <Sprout className="h-5 w-5" />
          {title}
          <Badge variant="outline" className={`${c.badgeOutline} text-xs`}>
            Correção Necessária
          </Badge>
        </CardTitle>
        <CardDescription className="text-sm">
          Necessário: {formatNumber(needValue)} {nutrient === 'P' ? 'kg/ha' : 'cmolc/dm³'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              As opções abaixo são <strong>alternativas</strong> para suprir a necessidade de {title}.{' '}
              <span className="block mt-1">Escolha <strong>uma opção</strong> com base na disponibilidade, custo e benefícios adicionais.</span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className={`p-4 rounded-lg transition-colors ${c.item}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{rec.source.name}</h4>
                  <p className="text-sm text-gray-600">{formatNumberOptional(rec.source.concentration)}{rec.source.unit}</p>
                </div>
                <Badge className={`${c.itemBadge} text-xs`}>
                  {formatNumber(rec.recommendation, 1)} kg/ha
                </Badge>
              </div>
              <p className="text-sm text-gray-700">{rec.source.benefits}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
