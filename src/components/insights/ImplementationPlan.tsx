
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalculationResult } from '@/types/soilAnalysis';

interface ImplementationPlanProps {
  qualityScore: number;
}

export const ImplementationPlan: React.FC<ImplementationPlanProps> = ({ qualityScore }) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-green-200">
      <CardHeader>
        <CardTitle className="text-green-800">Cronograma de Implementação</CardTitle>
        <CardDescription>
          Sequência otimizada de intervenções para máxima eficiência
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {qualityScore < 60 && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">1ª Fase - Emergencial</h4>
              <p className="text-sm text-gray-700">
                Correção de pH e saturação de bases. Aplicação de calcário e fósforo corretivo.
              </p>
              <div className="mt-2 text-xs text-red-600 font-medium">0-30 dias</div>
            </div>
          )}
          
          {qualityScore < 80 && (
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">2ª Fase - Balanceamento</h4>
              <p className="text-sm text-gray-700">
                Ajuste de K e Mg, correção de micronutrientes deficientes.
              </p>
              <div className="mt-2 text-xs text-orange-600 font-medium">30-90 dias</div>
            </div>
          )}

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">3ª Fase - Otimização</h4>
            <p className="text-sm text-gray-700">
              Ajustes finos e aplicação de micronutrientes específicos.
            </p>
            <div className="mt-2 text-xs text-blue-600 font-medium">90-120 dias</div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">4ª Fase - Monitoramento</h4>
            <p className="text-sm text-gray-700">
              Nova análise e ajustes baseados na resposta da cultura.
            </p>
            <div className="mt-2 text-xs text-green-600 font-medium">4-6 meses</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
