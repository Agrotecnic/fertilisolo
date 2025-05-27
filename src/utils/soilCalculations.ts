import { SoilData, CalculatedResults } from '@/pages/Index';

export const calculateSoilAnalysis = (data: Omit<SoilData, 'id' | 'date'>): CalculatedResults => {
  const { T, Ca, Mg, K, P, S, B, Cu, Fe, Mn, Zn, Mo } = data;

  // Converter K de mg/dm³ para cmolc/dm³ (K mg/dm³ ÷ 390 = cmolc/dm³)
  const KCmolc = K / 390;

  // Calcular saturações atuais (%)
  const saturations = {
    Ca: (Ca / T) * 100,
    Mg: (Mg / T) * 100,
    K: (KCmolc / T) * 100,
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
    S: S >= 10,
    B: B >= 0.2 && B <= 0.6,
    Cu: Cu >= 0.8 && Cu <= 1.2,
    Fe: Fe >= 5,
    Mn: Mn >= 1.2,
    Zn: Zn >= 0.5 && Zn <= 1.2,
    Mo: Mo >= 0.1 && Mo <= 0.2,
  };

  // Calcular necessidades de nutrientes
  const targetCa = 0.55 * T; // 55% da CTC para Ca
  const targetMg = 0.175 * T; // 17.5% da CTC para Mg
  const targetK = 0.04 * T; // 4% da CTC para K (em cmolc/dm³)

  const needs = {
    Ca: Math.max(0, targetCa - Ca),
    Mg: Math.max(0, targetMg - Mg),
    K: Math.max(0, (targetK - KCmolc) * 390), // Converter de volta para mg/dm³
    P: calculatePhosphorusNeed(P),
    S: calculateSulfurNeed(S),
    B: calculateBoronNeed(B),
    Cu: calculateCopperNeed(Cu),
    Fe: calculateIronNeed(Fe),
    Mn: calculateManganeseNeed(Mn),
    Zn: calculateZincNeed(Zn),
    Mo: calculateMolybdenumNeed(Mo),
  };

  return {
    saturations,
    caeMgRatio,
    needs,
    isAdequate,
  };
};

const calculatePhosphorusNeed = (currentP: number): number => {
  const targetP = 15;
  
  if (currentP >= targetP) return 0;

  const pNeeded = targetP - currentP;
  
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

  return pNeeded * factor / 100;
};

const calculateSulfurNeed = (currentS: number): number => {
  const targetS = 10;
  if (currentS >= targetS) return 0;
  return (targetS - currentS) * 10;
};

const calculateBoronNeed = (currentB: number): number => {
  const targetB = 0.2;
  if (currentB >= targetB) return 0;
  return (targetB - currentB) * 2;
};

const calculateCopperNeed = (currentCu: number): number => {
  const targetCu = 0.8;
  if (currentCu >= targetCu) return 0;
  return (targetCu - currentCu) * 3;
};

const calculateIronNeed = (currentFe: number): number => {
  const targetFe = 5;
  if (currentFe >= targetFe) return 0;
  return (targetFe - currentFe) * 5;
};

const calculateManganeseNeed = (currentMn: number): number => {
  const targetMn = 1.2;
  if (currentMn >= targetMn) return 0;
  return (targetMn - currentMn) * 4;
};

const calculateZincNeed = (currentZn: number): number => {
  const targetZn = 0.5;
  if (currentZn >= targetZn) return 0;
  return (targetZn - currentZn) * 8;
};

const calculateMolybdenumNeed = (currentMo: number): number => {
  const targetMo = 0.1;
  if (currentMo >= targetMo) return 0;
  return (targetMo - currentMo) * 15;
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
  Mo: [
    { name: 'Molibdato de Sódio', concentration: 39, unit: '% Mo', benefits: 'Alta solubilidade' },
    { name: 'Molibdato de Amônio', concentration: 54, unit: '% Mo', benefits: 'Fornece Mo e nitrogênio' },
    { name: 'Trióxido de Molibdênio', concentration: 66, unit: '% Mo', benefits: 'Alta concentração' },
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
      recommendation = (needCmolc * 560) / (source.concentration / 100);
    } else if (nutrient === 'Mg') {
      recommendation = (needCmolc * 400) / (source.concentration / 100);
    } else if (nutrient === 'K') {
      // K já está em mg/dm³, então converter para kg/ha usando fator 2
      recommendation = (needCmolc * 2) / (source.concentration / 100);
    } else if (nutrient === 'P') {
      recommendation = needCmolc / (source.concentration / 100);
    } else {
      // Para micronutrientes (Mo, Cl, Ni)
      recommendation = needCmolc / (source.concentration / 100);
    }
    
    return {
      source,
      recommendation: Math.round(recommendation * 100) / 100,
    };
  });
};
