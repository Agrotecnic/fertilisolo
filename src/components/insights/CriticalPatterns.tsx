
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { SoilData, CalculatedResults } from '@/pages/Index';

interface CriticalPatternsProps {
  soilData: SoilData;
  results: CalculatedResults;
}

const analyzeNutrientPatterns = (soilData: SoilData, results: CalculatedResults): string[] => {
  const patterns: string[] = [];
  const { saturations, caeMgRatio, isAdequate } = results;

  if (saturations.Ca > 70 && saturations.Mg < 10) {
    patterns.push("PADRÃO CRÍTICO: Excesso de cálcio com deficiência severa de magnésio. Este desequilíbrio pode causar compactação do solo e deficiência induzida de K e Mg, limitando severamente a absorção de nutrientes.");
  }

  if (saturations.K > 6 && saturations.Mg < 12) {
    patterns.push("ANTAGONISMO K-Mg: Relação desfavorável entre K e Mg. O excesso de K pode induzir deficiência de Mg, afetando a fotossíntese e qualidade dos produtos agrícolas.");
  }

  if (caeMgRatio < 2) {
    patterns.push("RISCO DE COMPACTAÇÃO: Relação Ca/Mg muito baixa indica risco elevado de compactação e estrutura inadequada do solo. Priorize correção com calcário calcítico.");
  }

  if (caeMgRatio > 8) {
    patterns.push("DEFICIÊNCIA RELATIVA DE Mg: Relação Ca/Mg excessiva pode induzir deficiência de magnésio mesmo com níveis aparentemente adequados.");
  }

  if (soilData.P < 5 && saturations.Ca > 60) {
    patterns.push("FIXAÇÃO DE FÓSFORO: Excesso de cálcio pode estar fixando o fósforo, reduzindo sua disponibilidade. Considere fontes de P mais solúveis e manejo localizado.");
  }

  if (soilData.organicMatter && soilData.organicMatter < 2 && soilData.T < 8) {
    patterns.push("SOLO DEGRADADO: Baixa CTC e matéria orgânica indicam perda de qualidade física e química. Programa intensivo de recuperação é necessário.");
  }

  return patterns;
};

export const CriticalPatterns: React.FC<CriticalPatternsProps> = ({ soilData, results }) => {
  const nutritionPatterns = analyzeNutrientPatterns(soilData, results);

  if (nutritionPatterns.length === 0) return null;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-red-200">
      <CardHeader>
        <CardTitle className="text-red-800 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Padrões Críticos Detectados
        </CardTitle>
        <CardDescription>
          Desequilíbrios que requerem atenção especializada imediata
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {nutritionPatterns.map((pattern, index) => (
            <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-gray-800 leading-relaxed">{pattern}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
