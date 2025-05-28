
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle } from 'lucide-react';
import { SoilData, CalculatedResults } from '@/pages/Index';
import { formatNumber, formatNumberOptional } from '@/utils/numberFormat';

interface SaturationsCardProps {
  soilData: SoilData;
  results: CalculatedResults;
}

export const SaturationsCard: React.FC<SaturationsCardProps> = ({ soilData, results }) => {
  const getStatusIcon = (isAdequate: boolean) => {
    if (isAdequate) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusColor = (isAdequate: boolean) => {
    return isAdequate ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-green-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-green-800">Saturações Atuais por Bases</CardTitle>
        <CardDescription>Porcentagem de cada nutriente em relação à CTC</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cálcio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(results.isAdequate.Ca)}
                <span className="font-medium">Cálcio (Ca)</span>
              </div>
              <Badge className={getStatusColor(results.isAdequate.Ca)}>
                {formatNumber(results.saturations.Ca, 1)}%
              </Badge>
            </div>
            <Progress 
              value={Math.min(results.saturations.Ca, 100)} 
              className="h-2"
            />
            <div className="text-xs text-gray-600">
              Ideal: 50-60% | Atual: {formatNumberOptional(soilData.Ca)} cmolc/dm³
            </div>
          </div>

          {/* Magnésio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(results.isAdequate.Mg)}
                <span className="font-medium">Magnésio (Mg)</span>
              </div>
              <Badge className={getStatusColor(results.isAdequate.Mg)}>
                {formatNumber(results.saturations.Mg, 1)}%
              </Badge>
            </div>
            <Progress 
              value={Math.min(results.saturations.Mg, 100)} 
              className="h-2"
            />
            <div className="text-xs text-gray-600">
              Ideal: 15-20% | Atual: {formatNumberOptional(soilData.Mg)} cmolc/dm³
            </div>
          </div>

          {/* Potássio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(results.isAdequate.K)}
                <span className="font-medium">Potássio (K)</span>
              </div>
              <Badge className={getStatusColor(results.isAdequate.K)}>
                {formatNumber(results.saturations.K, 1)}%
              </Badge>
            </div>
            <Progress 
              value={Math.min(results.saturations.K, 100)} 
              className="h-2"
            />
            <div className="text-xs text-gray-600">
              Ideal: 3-5% | Atual: {formatNumberOptional(soilData.K)} mg/dm³
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
