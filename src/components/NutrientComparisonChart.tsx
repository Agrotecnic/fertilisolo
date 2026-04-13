import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalculationResult, SoilData } from '@/types/soilAnalysis';

// Usage example:
// import { NutrientComparisonChart } from '@/components/NutrientComparisonChart';
// <NutrientComparisonChart results={calculationResult} soilData={soilData} />

interface NutrientComparisonChartProps {
  results: CalculationResult;
  soilData: SoilData;
}

interface ChartDataEntry {
  nutrient: string;
  Atual: number;
  Ideal: number;
}

const IDEAL_VALUES: Record<string, number> = {
  Ca: 55,
  Mg: 17.5,
  K: 4,
};

const NUTRIENT_LABELS: Record<string, string> = {
  Ca: 'Cálcio (Ca)',
  Mg: 'Magnésio (Mg)',
  K: 'Potássio (K)',
};

const COLOR_ACTUAL = 'hsl(145, 65%, 24%)';
const COLOR_IDEAL = 'hsl(213, 86%, 42%)';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md text-sm text-popover-foreground">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name === 'Atual' ? 'Atual' : 'Ideal'}: {entry.value.toFixed(1)}%
        </p>
      ))}
    </div>
  );
};

export const NutrientComparisonChart: React.FC<NutrientComparisonChartProps> = ({
  results,
}) => {
  const chartData: ChartDataEntry[] = [
    {
      nutrient: NUTRIENT_LABELS['Ca'],
      Atual: results.saturations.Ca,
      Ideal: IDEAL_VALUES['Ca'],
    },
    {
      nutrient: NUTRIENT_LABELS['Mg'],
      Atual: results.saturations.Mg,
      Ideal: IDEAL_VALUES['Mg'],
    },
    {
      nutrient: NUTRIENT_LABELS['K'],
      Atual: results.saturations.K,
      Ideal: IDEAL_VALUES['K'],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary font-sans">
          Saturações: Atual vs. Ideal
        </CardTitle>
        <CardDescription>
          Comparativo visual das saturações de bases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          aria-label="Grafico comparativo de saturacoes atual versus ideal"
          role="img"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
              barCategoryGap="30%"
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                strokeOpacity={0.6}
              />
              <XAxis
                dataKey="nutrient"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                unit="%"
                domain={[0, 'auto']}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value: string) =>
                  value === 'Atual' ? 'Atual' : 'Ideal'
                }
                wrapperStyle={{ fontSize: 13 }}
              />
              <ReferenceLine y={0} stroke="#e5e7eb" />
              <Bar
                dataKey="Atual"
                name="Atual"
                fill={COLOR_ACTUAL}
                radius={[3, 3, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="Ideal"
                name="Ideal"
                fill={COLOR_IDEAL}
                radius={[3, 3, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
