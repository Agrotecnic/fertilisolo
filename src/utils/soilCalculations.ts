
import { SoilData, CalculatedResults } from '@/pages/Index';

export const calculateSoilAnalysis = (data: Omit<SoilData, 'id' | 'date'>): CalculatedResults => {
  const { T, Ca, Mg, K, P } = data;

  // Calcular saturações atuais (%)
  const saturations = {
    Ca: (Ca / T) * 100,
    Mg: (Mg / T) * 100,
    K: (K / T) * 100,
  };

  // Calcular relação Ca/Mg
  const caeMgRatio = Mg > 0 ? Ca / Mg : 0;

  // Verificar se os níveis estão adequados
  const isAdequate = {
    Ca: saturations.Ca >= 50 && saturations.Ca <= 60,
    Mg: saturations.Mg >= 15 && saturations.Mg <= 20,
    K: saturations.K >= 3 && saturations.K <= 5,
    P: P >= 15,
    CaMgRatio: caeMgRatio >= 3 && caeMgRatio <= 5,
  };

  // Calcular necessidades de nutrientes
  const targetCa = 0.55 * T; // 55% da CTC para Ca
  const targetMg = 0.175 * T; // 17.5% da CTC para Mg
  const targetK = 0.04 * T; // 4% da CTC para K

  const needs = {
    Ca: Math.max(0, targetCa - Ca),
    Mg: Math.max(0, targetMg - Mg),
    K: Math.max(0, targetK - K),
    P: calculatePhosphorusNeed(P),
  };

  return {
    saturations,
    caeMgRatio,
    needs,
    isAdequate,
  };
};

const calculatePhosphorusNeed = (currentP: number): number => {
  const targetP = 15; // ppm mínimo para cerrados
  
  if (currentP >= targetP) return 0;

  const pNeeded = targetP - currentP;
  
  // Aplicar fatores por faixa usando regra de três
  let factor = 0;
  
  if (currentP <= 5) {
    factor = 503.80;
  } else if (currentP <= 10) {
    factor = 412.20;
  } else if (currentP <= 20) {
    factor = 320.60;
  } else {
    factor = 229.00;
  }

  return pNeeded * factor / 100; // kg/ha
};

export interface FertilizerSource {
  name: string;
  concentration: number;
  unit: string;
  benefits: string;
}

export const fertilizerSources = {
  Ca: [
    { name: 'Calcário Calcítico', concentration: 40, unit: '% CaO', benefits: 'Correção de acidez e fornecimento de Ca' },
    { name: 'Gesso Agrícola', concentration: 26, unit: '% CaO', benefits: 'Melhora subsuperfície e mobilidade de Ca' },
    { name: 'Óxido de Cálcio', concentration: 70, unit: '% CaO', benefits: 'Alta concentração, ação rápida' },
  ],
  Mg: [
    { name: 'Calcário Dolomítico', concentration: 12, unit: '% MgO', benefits: 'Correção de acidez e fornecimento de Mg' },
    { name: 'Óxido de Magnésio', concentration: 52, unit: '% MgO', benefits: 'Alta concentração de Mg disponível' },
    { name: 'Sulfato de Magnésio', concentration: 16, unit: '% MgO', benefits: 'Fornece Mg e enxofre solúvel' },
  ],
  K: [
    { name: 'Cloreto de Potássio', concentration: 60, unit: '% K₂O', benefits: 'Alta solubilidade, pronta disponibilidade' },
    { name: 'Sulfato de Potássio', concentration: 50, unit: '% K₂O', benefits: 'Fornece K e enxofre, sem cloro' },
    { name: 'Nitrato de Potássio', concentration: 44, unit: '% K₂O', benefits: 'Fornece K e nitrogênio solúvel' },
  ],
  P: [
    { name: 'Superfosfato Simples', concentration: 18, unit: '% P₂O₅', benefits: 'Fornece P, Ca e enxofre' },
    { name: 'Superfosfato Triplo', concentration: 45, unit: '% P₂O₅', benefits: 'Alta concentração de P solúvel' },
    { name: 'Fosfato Natural Reativo', concentration: 28, unit: '% P₂O₅', benefits: 'Liberação gradual, efeito residual' },
  ],
};

export const calculateFertilizerRecommendations = (
  nutrient: keyof typeof fertilizerSources,
  needCmolc: number
): Array<{ source: FertilizerSource; recommendation: number }> => {
  const sources = fertilizerSources[nutrient];
  
  return sources.map(source => {
    let recommendation = 0;
    
    if (nutrient === 'Ca') {
      // Ca: cmolc/dm³ × 560 (fator de conversão) ÷ concentração da fonte
      recommendation = (needCmolc * 560) / (source.concentration / 100);
    } else if (nutrient === 'Mg') {
      // Mg: cmolc/dm³ × 400 (fator de conversão) ÷ concentração da fonte
      recommendation = (needCmolc * 400) / (source.concentration / 100);
    } else if (nutrient === 'K') {
      // K: cmolc/dm³ × 940 (fator de conversão) ÷ concentração da fonte
      recommendation = (needCmolc * 940) / (source.concentration / 100);
    } else if (nutrient === 'P') {
      // P: kg/ha ÷ concentração da fonte
      recommendation = needCmolc / (source.concentration / 100);
    }
    
    return {
      source,
      recommendation: Math.round(recommendation * 100) / 100, // Round to 2 decimal places
    };
  });
};
