
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SoilData, CalculatedResults } from '@/pages/Index';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Lightbulb, Zap } from 'lucide-react';

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
    totalChecks += 3; // Peso 3 para primários
    if (isAdequate[nutrient]) score += 3;
  });

  // Relação Ca/Mg (muito importante)
  totalChecks += 2.5;
  if (isAdequate.CaMgRatio) score += 2.5;

  // Macronutrientes secundários
  const secondaryNutrients = ['S'] as const;
  secondaryNutrients.forEach(nutrient => {
    totalChecks += 1.5;
    if (isAdequate[nutrient]) score += 1.5;
  });

  // Micronutrientes
  const microNutrients = ['B', 'Cu', 'Fe', 'Mn', 'Zn', 'Mo'] as const;
  microNutrients.forEach(nutrient => {
    totalChecks += 1;
    if (isAdequate[nutrient]) score += 1;
  });

  return Math.round((score / totalChecks) * 100);
};

const getScoreColor = (score: number): string => {
  if (score >= 90) return '#22c55e'; // Verde escuro
  if (score >= 80) return '#65a30d'; // Verde
  if (score >= 70) return '#84cc16'; // Verde claro
  if (score >= 60) return '#eab308'; // Amarelo
  if (score >= 45) return '#f97316'; // Laranja
  if (score >= 30) return '#ea580c'; // Laranja escuro
  return '#ef4444'; // Vermelho
};

const getScoreCategory = (score: number): { category: string; description: string; icon: React.ReactNode; priority: string } => {
  if (score >= 90) return {
    category: 'Excepcional',
    description: 'Solo com fertilidade excepcional - padrão de excelência agronômica',
    icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    priority: 'Manutenção'
  };
  if (score >= 80) return {
    category: 'Excelente',
    description: 'Solo com fertilidade excelente para alta produtividade sustentável',
    icon: <TrendingUp className="h-5 w-5 text-green-500" />,
    priority: 'Otimização'
  };
  if (score >= 70) return {
    category: 'Muito Bom',
    description: 'Solo com boa fertilidade, pequenos ajustes podem maximizar potencial',
    icon: <Target className="h-5 w-5 text-lime-500" />,
    priority: 'Ajuste Fino'
  };
  if (score >= 60) return {
    category: 'Bom',
    description: 'Solo adequado, mas com oportunidades claras de melhoria',
    icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
    priority: 'Melhorias'
  };
  if (score >= 45) return {
    category: 'Regular',
    description: 'Solo necessita correções estratégicas para otimizar produtividade',
    icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    priority: 'Correção'
  };
  if (score >= 30) return {
    category: 'Baixo',
    description: 'Solo com limitações importantes que comprometem o potencial produtivo',
    icon: <TrendingDown className="h-5 w-5 text-orange-600" />,
    priority: 'Intervenção'
  };
  return {
    category: 'Crítico',
    description: 'Solo com graves desequilíbrios - intervenção urgente obrigatória',
    icon: <Zap className="h-5 w-5 text-red-500" />,
    priority: 'Emergencial'
  };
};

const analyzeNutrientPatterns = (soilData: SoilData, results: CalculatedResults): string[] => {
  const patterns: string[] = [];
  const { saturations, caeMgRatio, isAdequate } = results;

  // Análise de padrões específicos
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

const generateStrategicInsights = (soilData: SoilData, results: CalculatedResults): string[] => {
  const insights: string[] = [];
  const { saturations, caeMgRatio, isAdequate, needs } = results;

  // Insights estratégicos baseados na análise completa
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

  // Insights sobre sinergia entre nutrientes
  const deficientCount = Object.values(isAdequate).filter(adequate => !adequate).length;
  if (deficientCount >= 5) {
    insights.push("ABORDAGEM SISTÊMICA: Múltiplas deficiências detectadas. Recomenda-se programa de correção sequencial: 1º pH/bases, 2º fósforo, 3º micronutrientes.");
  }

  if (soilData.organicMatter && soilData.organicMatter > 3.5 && Object.values(isAdequate).filter(Boolean).length >= 8) {
    insights.push("SOLO DE ALTA QUALIDADE: Excelente base de matéria orgânica com boa disponibilidade nutricional. Foque em manejo de precisão para máxima eficiência.");
  }

  return insights;
};

const calculateLimitingFactors = (results: CalculatedResults): { factor: string; impact: string; severity: number }[] => {
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

export const SoilInsights: React.FC<SoilInsightsProps> = ({ soilData, results }) => {
  const qualityScore = calculateSoilQualityScore(results);
  const scoreColor = getScoreColor(qualityScore);
  const { category, description, icon, priority } = getScoreCategory(qualityScore);
  const nutritionPatterns = analyzeNutrientPatterns(soilData, results);
  const strategicInsights = generateStrategicInsights(soilData, results);
  const limitingFactors = calculateLimitingFactors(results);

  const chartData = [
    { name: 'Qualidade', value: qualityScore, fill: scoreColor },
    { name: 'Potencial', value: 100 - qualityScore, fill: '#e5e7eb' }
  ];

  const chartConfig = {
    quality: { label: 'Qualidade do Solo' },
  };

  return (
    <div className="space-y-6">
      {/* Score Principal com Análise Detalhada */}
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            {icon}
            Diagnóstico Avançado da Fertilidade
          </CardTitle>
          <CardDescription>
            Análise multifatorial baseada em interações nutricionais e potencial agronômico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico de Qualidade */}
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40">
                <ChartContainer config={chartConfig} className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
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
                    <div className="text-2xl font-bold" style={{ color: scoreColor }}>
                      {qualityScore}
                    </div>
                    <div className="text-xs text-gray-600">Pontos</div>
                  </div>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className="mt-3 px-3 py-1"
                style={{ borderColor: scoreColor, color: scoreColor }}
              >
                {category}
              </Badge>
            </div>

            {/* Análise Qualitativa */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h4 className="font-semibold text-green-800 mb-2">Classificação Técnica</h4>
                <p className="text-gray-700 text-sm">{description}</p>
                <div className="mt-2">
                  <span className="text-xs font-medium text-gray-600">Prioridade de Manejo: </span>
                  <Badge variant="outline" className="text-xs">{priority}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Macronutrientes</span>
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

      {/* Fatores Limitantes */}
      {limitingFactors.length > 0 && (
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
                <div key={index} className="flex items-center gap-4 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-orange-800">{factor.factor}</h5>
                    <p className="text-sm text-gray-700">{factor.impact}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="text-orange-700 border-orange-300">
                      Prioridade {factor.severity}/10
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Padrões Nutricionais Críticos */}
      {nutritionPatterns.length > 0 && (
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
      )}

      {/* Insights Estratégicos */}
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

      {/* Plano de Ação Sequencial */}
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
    </div>
  );
};
