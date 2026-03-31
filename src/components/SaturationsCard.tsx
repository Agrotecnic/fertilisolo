import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle } from 'lucide-react';
import { SoilData, CalculationResult } from '@/types/soilAnalysis';
import { formatNumber, formatNumberOptional } from '@/utils/numberFormat';

interface SaturationsCardProps {
  soilData: SoilData;
  results: CalculationResult;
}

export const SaturationsCard: React.FC<SaturationsCardProps> = ({ soilData, results }) => {
  const titleStyle = { fontFamily: 'Inter, sans-serif' };
  
  
  const getStatusIcon = (isAdequate: boolean) => {
    if (isAdequate) return <CheckCircle className="h-4 w-4 text-primary" />;
    return <XCircle className="h-4 w-4 text-accent" />;
  };

  const getStatusColor = (isAdequate: boolean) => {
    return isAdequate ? 
      'bg-primary/10 text-primary border-primary/20' : 
      'bg-accent/10 text-accent border-accent/20';
  };

  return (
    <Card className="bg-white border-border shadow-sm">
      <CardHeader className="pb-2 border-b border-border">
        <CardTitle className="text-primary" style={titleStyle}>Saturações Atuais por Bases</CardTitle>
        <CardDescription className="text-neutral-medium">Porcentagem de cada nutriente em relação à CTC</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4">
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
              value={Math.max(Math.min(results.saturations.Ca, 100), results.saturations.Ca > 0 ? 2 : 0)} 
              className="h-2 bg-bg-lighter"
            />
            <div className="text-xs text-neutral-medium">
              Ideal: 50-60% | Atual: {formatNumberOptional(soilData.Ca)} cmolc/dm³
              {results.saturations.Ca > 0 && results.saturations.Ca < 5 && (
                <span className="block text-orange-600 font-medium mt-1">
                  ⚠️ Nível crítico - Saturação muito baixa
                </span>
              )}
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
              value={Math.max(Math.min(results.saturations.Mg, 100), results.saturations.Mg > 0 ? 2 : 0)} 
              className="h-2 bg-bg-lighter"
            />
            <div className="text-xs text-neutral-medium">
              Ideal: 15-20% | Atual: {formatNumberOptional(soilData.Mg)} cmolc/dm³
              {results.saturations.Mg > 0 && results.saturations.Mg < 3 && (
                <span className="block text-orange-600 font-medium mt-1">
                  ⚠️ Nível crítico - Saturação muito baixa
                </span>
              )}
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
              value={Math.max(Math.min(results.saturations.K, 100), results.saturations.K > 0 ? 2 : 0)} 
              className="h-2 bg-bg-lighter"
            />
            <div className="text-xs text-neutral-medium">
              Ideal: 3-5% | Atual: {formatNumberOptional(soilData.K)} mg/dm³
              {results.saturations.K > 0 && results.saturations.K < 0.5 && (
                <span className="block text-orange-600 font-medium mt-1">
                  ⚠️ Nível crítico - Saturação muito baixa
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
