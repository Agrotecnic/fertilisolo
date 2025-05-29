import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalculatedResults } from '@/pages/Index';
import { formatNumber } from '@/utils/numberFormat';

interface NeedsCardProps {
  results: CalculatedResults;
}

export const NeedsCard: React.FC<NeedsCardProps> = ({ results }) => {
  const titleStyle = { fontFamily: 'Inter, sans-serif' };
  
  return (
    <Card className="bg-white border-secondary-dark/10 shadow-sm">
      <CardHeader className="pb-2 border-b border-secondary-dark/10">
        <CardTitle className="text-primary-dark" style={titleStyle}>Necessidades de Correção</CardTitle>
        <CardDescription className="text-neutral-medium">Quantidades necessárias para atingir os níveis ideais</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-lg border border-secondary-dark/10 bg-bg-lighter shadow-sm">
            <div className="text-xl font-bold text-primary-dark mb-1">
              {formatNumber(results.needs.Ca)}
            </div>
            <div className="text-sm font-medium text-secondary-dark">
              cmolc/dm³ de Ca
            </div>
          </div>
          
          <div className="text-center p-3 rounded-lg border border-secondary-dark/10 bg-bg-lighter shadow-sm">
            <div className="text-xl font-bold text-primary-dark mb-1">
              {formatNumber(results.needs.Mg)}
            </div>
            <div className="text-sm font-medium text-secondary-dark">
              cmolc/dm³ de Mg
            </div>
          </div>
          
          <div className="text-center p-3 rounded-lg border border-secondary-dark/10 bg-bg-lighter shadow-sm">
            <div className="text-xl font-bold text-primary-dark mb-1">
              {formatNumber(results.needs.K)}
            </div>
            <div className="text-sm font-medium text-secondary-dark">
              mg/dm³ de K
            </div>
          </div>
          
          <div className="text-center p-3 rounded-lg border border-secondary-dark/10 bg-bg-lighter shadow-sm">
            <div className="text-xl font-bold text-primary-dark mb-1">
              {formatNumber(results.needs.P, 1)}
            </div>
            <div className="text-sm font-medium text-secondary-dark">
              kg/ha de P
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
