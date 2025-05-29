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
  const titleStyle = { fontFamily: 'Inter, sans-serif' };
  
  const getStatusIcon = (isAdequate: boolean) => {
    if (isAdequate) return <CheckCircle className="h-4 w-4 text-primary-dark" />;
    return <XCircle className="h-4 w-4 text-accent-dark" />;
  };

  const getStatusColor = (isAdequate: boolean) => {
    return isAdequate ? 
      'bg-primary-light/10 text-primary-dark border-primary-light/20' : 
      'bg-accent-dark/10 text-accent-dark border-accent-dark/20';
  };

  return (
    <Card className="bg-white border-secondary-dark/10 shadow-sm">
      <CardHeader className="pb-2 border-b border-secondary-dark/10">
        <CardTitle className="text-primary-dark" style={titleStyle}>Saturações Atuais por Bases</CardTitle>
        <CardDescription className="text-neutral-medium">Porcentagem de cada nutriente em relação à CTC</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cálcio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(results.isAdequate.Ca)}
                <span className="font-medium text-neutral-dark">Cálcio (Ca)</span>
              </div>
              <Badge className={getStatusColor(results.isAdequate.Ca)}>
                {formatNumber(results.saturations.Ca, 1)}%
              </Badge>
            </div>
            <Progress 
              value={Math.min(results.saturations.Ca, 100)} 
              className="h-2 bg-bg-lighter"
            />
            <div className="text-xs text-neutral-medium">
              Ideal: 50-60% | Atual: {formatNumberOptional(soilData.Ca)} cmolc/dm³
            </div>
          </div>

          {/* Magnésio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(results.isAdequate.Mg)}
                <span className="font-medium text-neutral-dark">Magnésio (Mg)</span>
              </div>
              <Badge className={getStatusColor(results.isAdequate.Mg)}>
                {formatNumber(results.saturations.Mg, 1)}%
              </Badge>
            </div>
            <Progress 
              value={Math.min(results.saturations.Mg, 100)} 
              className="h-2 bg-bg-lighter"
            />
            <div className="text-xs text-neutral-medium">
              Ideal: 15-20% | Atual: {formatNumberOptional(soilData.Mg)} cmolc/dm³
            </div>
          </div>

          {/* Potássio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(results.isAdequate.K)}
                <span className="font-medium text-neutral-dark">Potássio (K)</span>
              </div>
              <Badge className={getStatusColor(results.isAdequate.K)}>
                {formatNumber(results.saturations.K, 1)}%
              </Badge>
            </div>
            <Progress 
              value={Math.min(results.saturations.K, 100)} 
              className="h-2 bg-bg-lighter"
            />
            <div className="text-xs text-neutral-medium">
              Ideal: 3-5% | Atual: {formatNumberOptional(soilData.K)} mg/dm³
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
