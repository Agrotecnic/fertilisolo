
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SoilData, CalculatedResults } from '@/pages/Index';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface SoilInsightsProps {
  soilData: SoilData;
  results: CalculatedResults;
}

const calculateSoilQualityScore = (results: CalculatedResults): number => {
  const { saturations, caeMgRatio, isAdequate } = results;
  
  let score = 0;
  let totalChecks = 0;

  // Macronutrientes primários (peso maior)
  const primaryNutrients = ['Ca', 'Mg', 'K', 'P'] as const;
  primaryNutrients.forEach(nutrient => {
    totalChecks += 2; // Peso 2 para primários
    if (isAdequate[nutrient]) score += 2;
  });

  // Relação Ca/Mg
  totalChecks += 2;
  if (isAdequate.CaMgRatio) score += 2;

  // Macronutrientes secundários
  const secondaryNutrients = ['S'] as const;
  secondaryNutrients.forEach(nutrient => {
    totalChecks += 1.5; // Peso 1.5 para secundários
    if (isAdequate[nutrient]) score += 1.5;
  });

  // Micronutrientes
  const microNutrients = ['B', 'Cu', 'Fe', 'Mn', 'Zn', 'Mo'] as const;
  microNutrients.forEach(nutrient => {
    totalChecks += 1; // Peso 1 para micronutrientes
    if (isAdequate[nutrient]) score += 1;
  });

  return Math.round((score / totalChecks) * 100);
};

const getScoreColor = (score: number): string => {
  if (score >= 85) return '#22c55e'; // Verde
  if (score >= 70) return '#84cc16'; // Verde claro
  if (score >= 55) return '#eab308'; // Amarelo
  if (score >= 40) return '#f97316'; // Laranja
  return '#ef4444'; // Vermelho
};

const getScoreCategory = (score: number): { category: string; description: string; icon: React.ReactNode } => {
  if (score >= 85) return {
    category: 'Excelente',
    description: 'Solo com fertilidade ideal para alta produtividade',
    icon: <CheckCircle className="h-5 w-5 text-green-600" />
  };
  if (score >= 70) return {
    category: 'Bom',
    description: 'Solo com boa fertilidade, pequenos ajustes podem otimizar',
    icon: <TrendingUp className="h-5 w-5 text-green-500" />
  };
  if (score >= 55) return {
    category: 'Regular',
    description: 'Solo necessita correções para melhor produtividade',
    icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />
  };
  if (score >= 40) return {
    category: 'Baixo',
    description: 'Solo com deficiências importantes que limitam produção',
    icon: <TrendingDown className="h-5 w-5 text-orange-500" />
  };
  return {
    category: 'Crítico',
    description: 'Solo com graves deficiências, correção urgente necessária',
    icon: <AlertTriangle className="h-5 w-5 text-red-500" />
  };
};

const generateInsights = (soilData: SoilData, results: CalculatedResults): string[] => {
  const insights: string[] = [];
  const { saturations, caeMgRatio, isAdequate } = results;

  // Insights sobre macronutrientes primários
  if (!isAdequate.Ca) {
    if (saturations.Ca < 50) {
      insights.push(`Saturação de cálcio baixa (${saturations.Ca.toFixed(1)}%). Considere aplicação de calcário calcítico ou gesso.`);
    } else {
      insights.push(`Saturação de cálcio alta (${saturations.Ca.toFixed(1)}%). Verifique necessidade de correção.`);
    }
  }

  if (!isAdequate.Mg) {
    if (saturations.Mg < 15) {
      insights.push(`Saturação de magnésio baixa (${saturations.Mg.toFixed(1)}%). Recomenda-se calcário dolomítico.`);
    } else {
      insights.push(`Saturação de magnésio alta (${saturations.Mg.toFixed(1)}%). Pode limitar absorção de outros nutrientes.`);
    }
  }

  if (!isAdequate.K) {
    insights.push(`Saturação de potássio inadequada (${saturations.K.toFixed(1)}%). Ajuste conforme necessidade da cultura.`);
  }

  if (!isAdequate.P) {
    insights.push(`Nível de fósforo baixo (${soilData.P} mg/dm³). Fundamental para desenvolvimento radicular e energético.`);
  }

  // Insights sobre relação Ca/Mg
  if (!isAdequate.CaMgRatio) {
    if (caeMgRatio < 3) {
      insights.push(`Relação Ca/Mg baixa (${caeMgRatio.toFixed(1)}). Excesso de Mg pode causar compactação.`);
    } else {
      insights.push(`Relação Ca/Mg alta (${caeMgRatio.toFixed(1)}). Deficiência relativa de Mg.`);
    }
  }

  // Insights sobre micronutrientes
  const deficientMicros = ['B', 'Cu', 'Fe', 'Mn', 'Zn', 'Mo'].filter(micro => 
    !isAdequate[micro as keyof typeof isAdequate]
  );
  
  if (deficientMicros.length > 0) {
    insights.push(`Deficiências em micronutrientes: ${deficientMicros.join(', ')}. Considere aplicação foliar ou via solo.`);
  }

  // Insights sobre matéria orgânica
  if (soilData.organicMatter && soilData.organicMatter < 2.5) {
    insights.push(`Matéria orgânica baixa (${soilData.organicMatter}%). Fundamental para CTC e retenção de água.`);
  } else if (soilData.organicMatter && soilData.organicMatter > 5) {
    insights.push(`Excelente teor de matéria orgânica (${soilData.organicMatter}%). Mantém boa estrutura do solo.`);
  }

  return insights;
};

export const SoilInsights: React.FC<SoilInsightsProps> = ({ soilData, results }) => {
  const qualityScore = calculateSoilQualityScore(results);
  const scoreColor = getScoreColor(qualityScore);
  const { category, description, icon } = getScoreCategory(qualityScore);
  const insights = generateInsights(soilData, results);

  const chartData = [
    { name: 'Qualidade', value: qualityScore, fill: scoreColor },
    { name: 'Restante', value: 100 - qualityScore, fill: '#e5e7eb' }
  ];

  const chartConfig = {
    quality: {
      label: 'Qualidade do Solo',
    },
  };

  return (
    <div className="space-y-6">
      {/* Score Card com Gráfico */}
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            {icon}
            Avaliação Geral da Qualidade do Solo
          </CardTitle>
          <CardDescription>
            Índice baseado na proximidade dos valores ideais de fertilidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gráfico Circular */}
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48">
                <ChartContainer config={chartConfig} className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        startAngle={90}
                        endAngle={450}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: scoreColor }}>
                      {qualityScore}
                    </div>
                    <div className="text-sm text-gray-600">de 100</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações da Avaliação */}
            <div className="space-y-4">
              <div>
                <Badge 
                  variant="outline" 
                  className="text-lg px-4 py-2"
                  style={{ borderColor: scoreColor, color: scoreColor }}
                >
                  {category}
                </Badge>
                <p className="text-gray-700 mt-2">{description}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-green-800">Distribuição por Categoria:</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Macronutrientes Primários</span>
                    <span>{Object.keys(results.isAdequate).filter(k => ['Ca', 'Mg', 'K', 'P'].includes(k) && results.isAdequate[k as keyof typeof results.isAdequate]).length}/4</span>
                  </div>
                  <Progress 
                    value={(Object.keys(results.isAdequate).filter(k => ['Ca', 'Mg', 'K', 'P'].includes(k) && results.isAdequate[k as keyof typeof results.isAdequate]).length / 4) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Micronutrientes</span>
                    <span>{Object.keys(results.isAdequate).filter(k => ['B', 'Cu', 'Fe', 'Mn', 'Zn', 'Mo'].includes(k) && results.isAdequate[k as keyof typeof results.isAdequate]).length}/6</span>
                  </div>
                  <Progress 
                    value={(Object.keys(results.isAdequate).filter(k => ['B', 'Cu', 'Fe', 'Mn', 'Zn', 'Mo'].includes(k) && results.isAdequate[k as keyof typeof results.isAdequate]).length / 6) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights Detalhados */}
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Insights e Recomendações Técnicas</CardTitle>
          <CardDescription>
            Análise detalhada dos resultados e orientações para manejo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 text-sm leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>

          {insights.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-green-700 font-medium">Parabéns! Seu solo apresenta excelente qualidade.</p>
              <p className="text-gray-600 text-sm mt-1">Continue com o manejo atual para manter a produtividade.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recomendações Prioritárias */}
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Próximos Passos Recomendados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {qualityScore < 70 && (
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">1. Correção Prioritária</h4>
                <p className="text-sm text-gray-700">
                  Foque primeiro na correção de pH e saturação de bases através da calagem.
                </p>
              </div>
            )}
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">2. Monitoramento</h4>
              <p className="text-sm text-gray-700">
                Realize nova análise em 6 meses para acompanhar evolução.
              </p>
            </div>

            {soilData.organicMatter && soilData.organicMatter < 3 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">3. Matéria Orgânica</h4>
                <p className="text-sm text-gray-700">
                  Invista em adubação orgânica para melhorar estrutura e CTC do solo.
                </p>
              </div>
            )}

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">4. Manejo Específico</h4>
              <p className="text-sm text-gray-700">
                Consulte as recomendações detalhadas na aba específica para sua cultura.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
