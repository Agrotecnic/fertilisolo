import { SoilData, CalculatedResults } from '@/pages/Index';

export const calculateSoilAnalysis = (data: Omit<SoilData, 'id' | 'date'>): CalculatedResults => {
  const { T, Ca, Mg, K, P, S, B, Cu, Fe, Mn, Zn } = data;

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
    S: S >= 10, // S adequado acima de 10 ppm
    B: B >= 0.2 && B <= 0.6, // B adequado entre 0.2-0.6 ppm
    Cu: Cu >= 0.8 && Cu <= 1.2, // Cu adequado entre 0.8-1.2 ppm
    Fe: Fe >= 5, // Fe adequado acima de 5 ppm
    Mn: Mn >= 1.2, // Mn adequado acima de 1.2 ppm
    Zn: Zn >= 0.5 && Zn <= 1.2, // Zn adequado entre 0.5-1.2 ppm
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
    S: calculateSulfurNeed(S),
    B: calculateBoronNeed(B),
    Cu: calculateCopperNeed(Cu),
    Fe: calculateIronNeed(Fe),
    Mn: calculateManganeseNeed(Mn),
    Zn: calculateZincNeed(Zn),
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

const calculateSulfurNeed = (currentS: number): number => {
  const targetS = 10; // ppm mínimo para S
  if (currentS >= targetS) return 0;
  return (targetS - currentS) * 10; // kg/ha
};

const calculateBoronNeed = (currentB: number): number => {
  const targetB = 0.2; // ppm mínimo para B
  if (currentB >= targetB) return 0;
  return (targetB - currentB) * 2; // kg/ha
};

const calculateCopperNeed = (currentCu: number): number => {
  const targetCu = 0.8; // ppm mínimo para Cu
  if (currentCu >= targetCu) return 0;
  return (targetCu - currentCu) * 3; // kg/ha
};

const calculateIronNeed = (currentFe: number): number => {
  const targetFe = 5; // ppm mínimo para Fe
  if (currentFe >= targetFe) return 0;
  return (targetFe - currentFe) * 5; // kg/ha
};

const calculateManganeseNeed = (currentMn: number): number => {
  const targetMn = 1.2; // ppm mínimo para Mn
  if (currentMn >= targetMn) return 0;
  return (targetMn - currentMn) * 4; // kg/ha
};

const calculateZincNeed = (currentZn: number): number => {
  const targetZn = 0.5; // ppm mínimo para Zn
  if (currentZn >= targetZn) return 0;
  return (targetZn - currentZn) * 8; // kg/ha
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
  S: [
    { name: 'Gesso Agrícola', concentration: 18, unit: '% S', benefits: 'Fornece S e Ca, melhora subsuperfície' },
    { name: 'Sulfato de Amônio', concentration: 24, unit: '% S', benefits: 'Fornece S e nitrogênio' },
    { name: 'Enxofre Elementar', concentration: 90, unit: '% S', benefits: 'Alta concentração, liberação lenta' },
  ],
  B: [
    { name: 'Ácido Bórico', concentration: 17, unit: '% B', benefits: 'Alta solubilidade, ação rápida' },
    { name: 'Bórax', concentration: 11, unit: '% B', benefits: 'Solubilidade moderada' },
    { name: 'Ulexita', concentration: 8, unit: '% B', benefits: 'Liberação gradual, menor risco de toxidez' },
  ],
  Cu: [
    { name: 'Sulfato de Cobre', concentration: 25, unit: '% Cu', benefits: 'Alta solubilidade, pronta disponibilidade' },
    { name: 'Óxido de Cobre', concentration: 75, unit: '% Cu', benefits: 'Alta concentração, liberação gradual' },
    { name: 'Quelato de Cobre', concentration: 13, unit: '% Cu', benefits: 'Alta disponibilidade, baixa fixação' },
  ],
  Fe: [
    { name: 'Sulfato de Ferro', concentration: 20, unit: '% Fe', benefits: 'Solúvel, correção rápida' },
    { name: 'Quelato de Ferro', concentration: 6, unit: '% Fe', benefits: 'Alta disponibilidade em solos alcalinos' },
    { name: 'Óxido de Ferro', concentration: 60, unit: '% Fe', benefits: 'Liberação gradual' },
  ],
  Mn: [
    { name: 'Sulfato de Manganês', concentration: 26, unit: '% Mn', benefits: 'Alta solubilidade' },
    { name: 'Óxido de Manganês', concentration: 41, unit: '% Mn', benefits: 'Liberação gradual' },
    { name: 'Quelato de Manganês', concentration: 12, unit: '% Mn', benefits: 'Alta disponibilidade' },
  ],
  Zn: [
    { name: 'Sulfato de Zinco', concentration: 20, unit: '% Zn', benefits: 'Alta solubilidade' },
    { name: 'Óxido de Zinco', concentration: 50, unit: '% Zn', benefits: 'Alta concentração' },
    { name: 'Quelato de Zinco', concentration: 14, unit: '% Zn', benefits: 'Alta disponibilidade' },
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
