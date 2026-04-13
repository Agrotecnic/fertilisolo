import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { SoilData, CalculationResult } from '@/types/soilAnalysis';
import { formatNumber, formatNumberOptional } from '@/utils/numberFormat';

interface SaturationsCardProps {
  soilData: SoilData;
  results: CalculationResult;
}

// Ideal ranges for each nutrient saturation (%)
const IDEAL_RANGES = {
  Ca: { min: 50, max: 60, label: '50–60%' },
  Mg: { min: 15, max: 20, label: '15–20%' },
  K:  { min: 3,  max: 5,  label: '3–5%'   },
};

interface NutrientRowProps {
  label: string;
  value: number;
  isAdequate: boolean;
  isCritical: boolean;
  currentRaw: number | undefined;
  unit: string;
  idealLabel: string;
  idealMin: number;
  idealMax: number;
}

const NutrientRow: React.FC<NutrientRowProps> = ({
  label,
  value,
  isAdequate,
  isCritical,
  currentRaw,
  unit,
  idealLabel,
  idealMin,
  idealMax,
}) => {
  const clampedValue = Math.max(Math.min(value, 100), value > 0 ? 2 : 0);
  // Position of ideal range markers as % of the bar width (capped at 100%)
  const idealMinPct = Math.min(idealMin, 100);
  const idealMaxPct = Math.min(idealMax, 100);

  const statusLabel = isAdequate ? 'Adequado' : 'Corrigir';
  const badgeClass = isAdequate
    ? 'bg-primary/10 text-primary border-primary/20'
    : 'bg-accent/10 text-accent border-accent/20';

  return (
    <div className="space-y-2">
      {/* Label + status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAdequate
            ? <CheckCircle className="h-4 w-4 text-primary" aria-hidden="true" />
            : <XCircle className="h-4 w-4 text-accent" aria-hidden="true" />
          }
          <span className="font-medium text-neutral-dark">{label}</span>
        </div>
        <Badge className={badgeClass} aria-label={`${label}: ${statusLabel}, ${formatNumber(value, 1)}%`}>
          <span className="sr-only">{statusLabel} – </span>
          {formatNumber(value, 1)}%
        </Badge>
      </div>

      {/* Progress bar with ideal range markers */}
      <div className="relative" role="img" aria-label={`Barra de saturação de ${label}: atual ${formatNumber(value, 1)}%, faixa ideal ${idealLabel}`}>
        <Progress value={clampedValue} className="h-2 bg-bg-lighter" />
        {/* Ideal range overlay */}
        <span
          className="absolute top-0 h-2 rounded-full bg-primary/20 pointer-events-none"
          style={{ left: `${idealMinPct}%`, width: `${idealMaxPct - idealMinPct}%` }}
          aria-hidden="true"
        />
        {/* Min marker */}
        <span
          className="absolute top-[-2px] h-[calc(100%+4px)] w-[2px] bg-primary/60 rounded pointer-events-none"
          style={{ left: `${idealMinPct}%` }}
          aria-hidden="true"
        />
        {/* Max marker */}
        <span
          className="absolute top-[-2px] h-[calc(100%+4px)] w-[2px] bg-primary/60 rounded pointer-events-none"
          style={{ left: `${idealMaxPct}%` }}
          aria-hidden="true"
        />
      </div>

      {/* Meta text */}
      <div className="text-xs text-neutral-medium">
        <span>Ideal: {idealLabel}</span>
        <span className="mx-1">|</span>
        <span>Atual: {formatNumberOptional(currentRaw)} {unit}</span>
      </div>

      {/* Critical alert – accessible, no emoji */}
      {isCritical && (
        <div role="alert" className="flex items-center gap-1 text-orange-600 font-medium text-xs mt-1">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          <span>Nível crítico — Saturação muito baixa</span>
        </div>
      )}
    </div>
  );
};

export const SaturationsCard: React.FC<SaturationsCardProps> = ({ soilData, results }) => {
  return (
    <Card className="bg-white border-border shadow-sm">
      <CardHeader className="pb-2 border-b border-border">
        <CardTitle className="text-primary font-sans">Saturações Atuais por Bases</CardTitle>
        <CardDescription className="text-neutral-medium">
          Porcentagem de cada nutriente em relação à CTC — linha verde = faixa ideal
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NutrientRow
            label="Cálcio (Ca)"
            value={results.saturations.Ca}
            isAdequate={results.isAdequate.Ca}
            isCritical={results.saturations.Ca > 0 && results.saturations.Ca < 5}
            currentRaw={soilData.Ca}
            unit="cmolc/dm³"
            idealLabel={IDEAL_RANGES.Ca.label}
            idealMin={IDEAL_RANGES.Ca.min}
            idealMax={IDEAL_RANGES.Ca.max}
          />
          <NutrientRow
            label="Magnésio (Mg)"
            value={results.saturations.Mg}
            isAdequate={results.isAdequate.Mg}
            isCritical={results.saturations.Mg > 0 && results.saturations.Mg < 3}
            currentRaw={soilData.Mg}
            unit="cmolc/dm³"
            idealLabel={IDEAL_RANGES.Mg.label}
            idealMin={IDEAL_RANGES.Mg.min}
            idealMax={IDEAL_RANGES.Mg.max}
          />
          <NutrientRow
            label="Potássio (K)"
            value={results.saturations.K}
            isAdequate={results.isAdequate.K}
            isCritical={results.saturations.K > 0 && results.saturations.K < 0.5}
            currentRaw={soilData.K}
            unit="mg/dm³"
            idealLabel={IDEAL_RANGES.K.label}
            idealMin={IDEAL_RANGES.K.min}
            idealMax={IDEAL_RANGES.K.max}
          />
        </div>
      </CardContent>
    </Card>
  );
};
