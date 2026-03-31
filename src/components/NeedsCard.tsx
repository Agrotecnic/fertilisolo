import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalculationResult } from '@/types/soilAnalysis';
import { formatNumber } from '@/utils/numberFormat';
import { convertCaNeedToKgHa, convertMgNeedToKgHa, convertKNeedToKgHa } from '@/utils/soilCalculations';

interface NeedsCardProps {
  results: CalculationResult;
}

export const NeedsCard: React.FC<NeedsCardProps> = ({ results }) => {
  const titleStyle = { fontFamily: 'Inter, sans-serif' };
  
  return (
    <Card className="bg-white border-border shadow-sm">
      <CardHeader className="pb-2 border-b border-border">
        <CardTitle className="text-primary" style={titleStyle}>Necessidades de Correção</CardTitle>
        <CardDescription className="text-neutral-medium">Quantidades necessárias para atingir os níveis ideais</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-lg border border-border bg-bg-lighter shadow-sm">
            <div className="text-xl font-bold text-primary mb-1">
              {formatNumber(results.needs.Ca, 2)}
            </div>
            <div className="text-sm font-medium text-neutral-dark">
              cmolc/dm³ de Ca
            </div>
            <div className="text-xs text-neutral-medium mt-1">
              ({convertCaNeedToKgHa(results.needs.Ca)} kg/ha de CaO)
            </div>
          </div>
          
          <div className="text-center p-3 rounded-lg border border-border bg-bg-lighter shadow-sm">
            <div className="text-xl font-bold text-primary mb-1">
              {formatNumber(results.needs.Mg, 2)}
            </div>
            <div className="text-sm font-medium text-neutral-dark">
              cmolc/dm³ de Mg
            </div>
            <div className="text-xs text-neutral-medium mt-1">
              ({convertMgNeedToKgHa(results.needs.Mg)} kg/ha de MgO)
            </div>
          </div>
          
          <div className="text-center p-3 rounded-lg border border-border bg-bg-lighter shadow-sm">
            <div className="text-xl font-bold text-primary mb-1">
              {formatNumber(results.needs.K, 3)}
            </div>
            <div className="text-sm font-medium text-neutral-dark">
              cmolc/dm³ de K
            </div>
            <div className="text-xs text-neutral-medium mt-1">
              ({convertKNeedToKgHa(results.needs.K)} kg/ha de K₂O)
            </div>
          </div>
          
          <div className="text-center p-3 rounded-lg border border-border bg-bg-lighter shadow-sm">
            <div className="text-xl font-bold text-primary mb-1">
              {formatNumber(results.needs.P, 1)}
            </div>
            <div className="text-sm font-medium text-neutral-dark">
              kg/ha de P
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
