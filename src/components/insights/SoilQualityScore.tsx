
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Lightbulb, Zap } from 'lucide-react';
import { CalculationResult } from '@/types/soilAnalysis';

interface SoilQualityScoreProps {
  results: CalculationResult;
}

const calculateSoilQualityScore = (results: CalculationResult): number => {
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
  if (score >= 90) return '#22c55e';
  if (score >= 80) return '#65a30d';
  if (score >= 70) return '#84cc16';
  if (score >= 60) return '#eab308';
  if (score >= 45) return '#f97316';
  if (score >= 30) return '#ea580c';
  return '#ef4444';
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

export const SoilQualityScore: React.FC<SoilQualityScoreProps> = ({ results }) => {
  const qualityScore = calculateSoilQualityScore(results);
  const scoreColor = getScoreColor(qualityScore);
  const { category, description, icon, priority } = getScoreCategory(qualityScore);

  const chartData = [
    { name: 'Qualidade', value: qualityScore, fill: scoreColor },
    { name: 'Potencial', value: 100 - qualityScore, fill: '#e5e7eb' }
  ];

  const chartConfig = {
    quality: { label: 'Qualidade do Solo' },
  };

  return (
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
  );
};
