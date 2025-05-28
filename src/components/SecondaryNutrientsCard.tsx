
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { SoilData, CalculatedResults } from '@/pages/Index';
import { formatNumberOptional } from '@/utils/numberFormat';

interface SecondaryNutrientsCardProps {
  soilData: SoilData;
  results: CalculatedResults;
}

export const SecondaryNutrientsCard: React.FC<SecondaryNutrientsCardProps> = ({ soilData, results }) => {
  const getStatusIcon = (isAdequate: boolean) => {
    if (isAdequate) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusColor = (isAdequate: boolean) => {
    return isAdequate ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-green-800 flex items-center gap-2">
            {getStatusIcon(results.isAdequate.S)}
            Enxofre (S)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {formatNumberOptional(soilData.S)} mg/dm³
            </div>
            <Badge className={getStatusColor(results.isAdequate.S)}>
              {results.isAdequate.S ? 'Adequado' : 'Baixo'}
            </Badge>
            <p className="text-sm text-gray-600 mt-2">
              Mínimo recomendado: 10 mg/dm³
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-green-800">
            Matéria Orgânica
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {formatNumberOptional(soilData.organicMatter)}%
            </div>
            <Badge className={soilData.organicMatter && soilData.organicMatter >= 2.5 ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
              {soilData.organicMatter && soilData.organicMatter >= 2.5 ? 'Adequado' : 'Baixo'}
            </Badge>
            <p className="text-sm text-gray-600 mt-2">
              Ideal: acima de 2,5%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
