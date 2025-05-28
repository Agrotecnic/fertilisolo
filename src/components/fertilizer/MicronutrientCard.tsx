
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sprout } from 'lucide-react';
import { fertilizerSources } from '@/utils/soilCalculations';

interface MicronutrientCardProps {
  nutrient: 'S' | 'B' | 'Cu' | 'Fe' | 'Mn' | 'Zn';
  needValue: number;
  title: string;
}

export const MicronutrientCard: React.FC<MicronutrientCardProps> = ({
  nutrient,
  needValue,
  title
}) => {
  if (needValue <= 0.01) {
    return (
      <Card className="bg-green-50 border-green-200 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-green-800 flex items-center gap-2 text-sm">
            <Sprout className="h-4 w-4" />
            {title}
            <Badge className="bg-green-100 text-green-800 text-xs">Adequado</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-green-700 text-sm">
            Os níveis estão adequados. Não necessita correção.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sources = fertilizerSources[nutrient];

  return (
    <Card className="bg-white border-orange-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-orange-800 text-sm flex items-center gap-2">
          <Sprout className="h-4 w-4" />
          {title}
          <Badge variant="outline" className="text-orange-700 border-orange-300 text-xs">
            Correção Necessária
          </Badge>
        </CardTitle>
        <CardDescription className="text-xs">
          Necessário: {needValue.toFixed(2)} kg/ha
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {sources.map((source, index) => {
            const recommendation = needValue / (source.concentration / 100);
            return (
              <div key={index} className="p-3 bg-orange-50 rounded-md border border-orange-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{source.name}</h4>
                    <p className="text-xs text-gray-600">{source.concentration}{source.unit}</p>
                  </div>
                  <Badge variant="secondary" className="text-orange-700 bg-orange-100 text-xs">
                    {recommendation.toFixed(1)} kg/ha
                  </Badge>
                </div>
                <p className="text-xs text-gray-700">{source.benefits}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
