
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalculatedResults } from '@/pages/Index';
import { formatNumber } from '@/utils/numberFormat';

interface NeedsCardProps {
  results: CalculatedResults;
}

export const NeedsCard: React.FC<NeedsCardProps> = ({ results }) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-green-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-green-800">Necessidades de Correção</CardTitle>
        <CardDescription>Quantidades necessárias para atingir os níveis ideais</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xl font-bold text-blue-800 mb-1">
              {formatNumber(results.needs.Ca)}
            </div>
            <div className="text-sm font-medium text-blue-600">
              cmolc/dm³ de Ca
            </div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-xl font-bold text-purple-800 mb-1">
              {formatNumber(results.needs.Mg)}
            </div>
            <div className="text-sm font-medium text-purple-600">
              cmolc/dm³ de Mg
            </div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-xl font-bold text-orange-800 mb-1">
              {formatNumber(results.needs.K)}
            </div>
            <div className="text-sm font-medium text-orange-600">
              mg/dm³ de K
            </div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-xl font-bold text-red-800 mb-1">
              {formatNumber(results.needs.P, 1)}
            </div>
            <div className="text-sm font-medium text-red-600">
              kg/ha de P
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
