
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, CheckCircle } from 'lucide-react';
import { SoilData, CalculatedResults } from '@/pages/Index';

interface StrategicRecommendationsProps {
  soilData: SoilData;
  results: CalculatedResults;
}

const generateStrategicInsights = (soilData: SoilData, results: CalculatedResults): string[] => {
  const insights: string[] = [];
  const { saturations, caeMgRatio, isAdequate, needs } = results;

  if (!isAdequate.Ca && needs.Ca > 2) {
    const strategy = saturations.Ca < 45 ? "calcário calcítico" : "gesso agrícola para melhorar perfil";
    insights.push(`ESTRATÉGIA Ca: Deficiência de ${needs.Ca.toFixed(1)} cmolc/dm³. Recomenda-se ${strategy}. Aplicação parcelada otimiza eficiência e reduz perdas.`);
  }

  if (!isAdequate.Mg && caeMgRatio > 5) {
    insights.push(`ESTRATÉGIA Mg: Relação Ca/Mg desequilibrada (${caeMgRatio.toFixed(1)}:1). Priorize calcário dolomítico ou sulfato de magnésio para correção rápida sem alterar pH.`);
  }

  if (!isAdequate.K && soilData.T > 0) {
    const kPercent = (needs.K / 390 / soilData.T * 100);
    insights.push(`ESTRATÉGIA K: Necessário elevar saturação em ${kPercent.toFixed(1)}%. Em solos argilosos, prefira sulfato de K. Em arenosos, monitore lixiviação.`);
  }

  if (!isAdequate.P) {
    const method = soilData.P < 8 ? "aplicação a lanço + incorporação" : "aplicação localizada no sulco";
    insights.push(`ESTRATÉGIA P: Nível atual de ${soilData.P} mg/dm³ requer ${method}. Considere inoculação com micorrizas para otimizar absorção.`);
  }

  const deficientCount = Object.values(isAdequate).filter(adequate => !adequate).length;
  if (deficientCount >= 5) {
    insights.push("ABORDAGEM SISTÊMICA: Múltiplas deficiências detectadas. Recomenda-se programa de correção sequencial: 1º pH/bases, 2º fósforo, 3º micronutrientes.");
  }

  if (soilData.organicMatter && soilData.organicMatter > 3.5 && Object.values(isAdequate).filter(Boolean).length >= 8) {
    insights.push("SOLO DE ALTA QUALIDADE: Excelente base de matéria orgânica com boa disponibilidade nutricional. Foque em manejo de precisão para máxima eficiência.");
  }

  return insights;
};

export const StrategicRecommendations: React.FC<StrategicRecommendationsProps> = ({ soilData, results }) => {
  const strategicInsights = generateStrategicInsights(soilData, results);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Estratégias de Manejo Recomendadas
        </CardTitle>
        <CardDescription>
          Plano de ação baseado em princípios agronômicos avançados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {strategicInsights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700 text-sm leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>

        {strategicInsights.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-green-700 font-medium">Solo em excelente equilíbrio nutricional!</p>
            <p className="text-gray-600 text-sm mt-1">Continue o manejo atual e monitore sazonalmente.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
