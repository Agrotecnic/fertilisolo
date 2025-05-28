
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { SoilData, CalculatedResults } from '@/pages/Index';
import { formatNumber, formatNumberOptional } from '@/utils/numberFormat';

interface RelationshipCardProps {
  soilData: SoilData;
  results: CalculatedResults;
}

export const RelationshipCard: React.FC<RelationshipCardProps> = ({ soilData, results }) => {
  const getStatusIcon = (isAdequate: boolean) => {
    if (isAdequate) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusColor = (isAdequate: boolean) => {
    return isAdequate ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Relação Ca/Mg */}
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-green-800 flex items-center gap-2">
            {getStatusIcon(results.isAdequate.CaMgRatio)}
            Relação Ca/Mg
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {formatNumber(results.caeMgRatio)}:1
            </div>
            <Badge className={getStatusColor(results.isAdequate.CaMgRatio)}>
              {results.isAdequate.CaMgRatio ? 'Adequada' : 'Inadequada'}
            </Badge>
            <p className="text-sm text-gray-600 mt-2">
              Relação ideal: 3:1 a 5:1
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fósforo */}
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-green-800 flex items-center gap-2">
            {getStatusIcon(results.isAdequate.P)}
            Fósforo (P)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {formatNumberOptional(soilData.P)} mg/dm³
            </div>
            <Badge className={getStatusColor(results.isAdequate.P)}>
              {results.isAdequate.P ? 'Adequado' : 'Baixo'}
            </Badge>
            <p className="text-sm text-gray-600 mt-2">
              Mínimo para cerrados: 15 mg/dm³
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
