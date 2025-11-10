
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { CalculationResult } from '@/types/soilAnalysis';

interface LimitingFactorsProps {
  results: CalculationResult;
}

const calculateLimitingFactors = (results: CalculationResult): { factor: string; impact: string; severity: number }[] => {
  const factors: { factor: string; impact: string; severity: number }[] = [];
  const { isAdequate, saturations } = results;

  if (!isAdequate.P) {
    factors.push({
      factor: "Fósforo",
      impact: "Limita desenvolvimento radicular e transferência energética",
      severity: 9
    });
  }

  if (!isAdequate.CaMgRatio) {
    factors.push({
      factor: "Relação Ca/Mg",
      impact: "Afeta estrutura do solo e absorção de nutrientes",
      severity: 8
    });
  }

  if (saturations.Ca < 40) {
    factors.push({
      factor: "Cálcio",
      impact: "Compromete estrutura, parede celular e ativação enzimática",
      severity: 7
    });
  }

  if (!isAdequate.K) {
    factors.push({
      factor: "Potássio",
      impact: "Reduz resistência a estresses e qualidade dos produtos",
      severity: 6
    });
  }

  return factors.sort((a, b) => b.severity - a.severity).slice(0, 3);
};

export const LimitingFactors: React.FC<LimitingFactorsProps> = ({ results }) => {
  const limitingFactors = calculateLimitingFactors(results);

  if (limitingFactors.length === 0) return null;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
      <CardHeader>
        <CardTitle className="text-orange-800 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Fatores Limitantes Identificados
        </CardTitle>
        <CardDescription>
          Elementos que mais restringem o potencial produtivo atual
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {limitingFactors.map((factor, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
              <div className="flex items-center gap-3 sm:gap-4 flex-1">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-orange-800">{factor.factor}</h5>
                  <p className="text-sm text-gray-700 break-words">{factor.impact}</p>
                </div>
              </div>
              <div className="flex-shrink-0 ml-11 sm:ml-0">
                <Badge variant="outline" className="text-orange-700 border-orange-300 whitespace-nowrap text-xs">
                  Prioridade {factor.severity}/10
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
