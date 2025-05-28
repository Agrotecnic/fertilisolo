
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sprout } from 'lucide-react';
import { calculateFertilizerRecommendations } from '@/utils/soilCalculations';
import { formatNumber, formatNumberOptional } from '@/utils/numberFormat';

interface MacronutrientCardProps {
  nutrient: 'Ca' | 'Mg' | 'K' | 'P';
  needValue: number;
  title: string;
  color: string;
}

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
          <p className="text-green-700">
            Os níveis de {title.toLowerCase()} estão adequados. Não é necessária correção.
          </p>
        </CardContent>
      </Card>
    );
  }

  const recommendations = calculateFertilizerRecommendations(nutrient, needValue);

  return (
    <Card className={`bg-white border-${color}-200 hover:shadow-lg transition-shadow`}>
      <CardHeader className="pb-4">
        <CardTitle className={`text-${color}-800 text-base flex items-center gap-2`}>
          <Sprout className="h-5 w-5" />
          {title}
          <Badge variant="outline" className={`text-${color}-700 border-${color}-300 text-xs`}>
            Correção Necessária
          </Badge>
        </CardTitle>
        <CardDescription className="text-sm">
          Necessário: {formatNumber(needValue)} {nutrient === 'P' ? 'kg/ha' : 'cmolc/dm³'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className={`p-4 bg-${color}-50 rounded-lg border border-${color}-100 hover:bg-${color}-100 transition-colors`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{rec.source.name}</h4>
                  <p className="text-sm text-gray-600">{formatNumberOptional(rec.source.concentration)}{rec.source.unit}</p>
                </div>
                <Badge className={`bg-${color}-200 text-${color}-800 border-${color}-300`}>
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
