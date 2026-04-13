import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CalculationResult } from '@/types/soilAnalysis';
import { formatNumber } from '@/utils/numberFormat';
import { convertCaNeedToKgHa, convertMgNeedToKgHa, convertKNeedToKgHa } from '@/utils/soilCalculations';

interface NeedsCardProps {
  results: CalculationResult;
}

type UrgencyLevel = 'none' | 'low' | 'medium' | 'high';

const getUrgency = (value: number): UrgencyLevel => {
  if (value <= 0) return 'none';
  if (value <= 0.5) return 'low';
  if (value <= 1.5) return 'medium';
  return 'high';
};

const urgencyConfig: Record<UrgencyLevel, { border: string; bg: string; valueColor: string; Icon: React.ElementType | null; iconClass: string; label: string }> = {
  none:   { border: 'border-border',         bg: 'bg-bg-lighter',     valueColor: 'text-primary',       Icon: CheckCircle2,    iconClass: 'text-primary',       label: 'Adequado'  },
  low:    { border: 'border-primary/30',     bg: 'bg-primary/5',      valueColor: 'text-primary',       Icon: CheckCircle2,    iconClass: 'text-primary',       label: 'Baixo'     },
  medium: { border: 'border-amber-400/50',   bg: 'bg-amber-50',       valueColor: 'text-amber-700',     Icon: AlertCircle,     iconClass: 'text-amber-500',     label: 'Moderado'  },
  high:   { border: 'border-destructive/40', bg: 'bg-destructive/5',  valueColor: 'text-destructive',   Icon: AlertTriangle,   iconClass: 'text-destructive',   label: 'Alto'      },
};

interface NeedItemProps {
  nutrient: string;
  value: number;
  unit: string;
  secondary?: string;
  urgency: UrgencyLevel;
}

const NeedItem: React.FC<NeedItemProps> = ({ nutrient, value, unit, secondary, urgency }) => {
  const config = urgencyConfig[urgency];
  const { Icon } = config;
  return (
    <div
      className={`flex flex-col items-center text-center p-3 rounded-lg border shadow-sm transition-colors ${config.border} ${config.bg}`}
      role="group"
      aria-label={`Correção de ${nutrient}: ${formatNumber(value, 2)} ${unit}, urgência ${config.label}`}
    >
      {Icon && (
        <Icon className={`h-4 w-4 mb-1 ${config.iconClass}`} aria-hidden="true" />
      )}
      <span className={`text-xl font-bold mb-1 ${config.valueColor}`}>
        {formatNumber(value, 2)}
      </span>
      <span className="text-sm font-medium text-neutral-dark">{unit} de {nutrient}</span>
      {secondary && (
        <span className="text-xs text-neutral-medium mt-1">({secondary})</span>
      )}
      {urgency !== 'none' && (
        <span className={`mt-1.5 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${config.bg} ${config.valueColor} border ${config.border}`}>
          {config.label}
        </span>
      )}
    </div>
  );
};

export const NeedsCard: React.FC<NeedsCardProps> = ({ results }) => {
  const urgencyCa = getUrgency(results.needs.Ca);
  const urgencyMg = getUrgency(results.needs.Mg);
  const urgencyK  = getUrgency(results.needs.K);
  const urgencyP  = getUrgency(results.needs.P);

  return (
    <Card className="bg-white border-border shadow-sm">
      <CardHeader className="pb-2 border-b border-border">
        <CardTitle className="text-primary font-sans">Necessidades de Correção</CardTitle>
        <CardDescription className="text-neutral-medium">
          Quantidades necessárias para atingir os níveis ideais — urgência indicada por cor
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <NeedItem
            nutrient="Ca"
            value={results.needs.Ca}
            unit="cmolc/dm³"
            secondary={`${convertCaNeedToKgHa(results.needs.Ca)} kg/ha CaO`}
            urgency={urgencyCa}
          />
          <NeedItem
            nutrient="Mg"
            value={results.needs.Mg}
            unit="cmolc/dm³"
            secondary={`${convertMgNeedToKgHa(results.needs.Mg)} kg/ha MgO`}
            urgency={urgencyMg}
          />
          <NeedItem
            nutrient="K"
            value={results.needs.K}
            unit="cmolc/dm³"
            secondary={`${convertKNeedToKgHa(results.needs.K)} kg/ha K₂O`}
            urgency={urgencyK}
          />
          <NeedItem
            nutrient="P"
            value={results.needs.P}
            unit="kg/ha"
            urgency={urgencyP}
          />
        </div>
      </CardContent>
    </Card>
  );
};
