
import { SoilData, CalculationResult } from '@/types/soilAnalysis';
import {
  calculatePhosphorusNeed,
  calculateSulfurNeed,
  calculateBoronNeed,
  calculateCopperNeed,
  calculateIronNeed,
  calculateManganeseNeed,
  calculateZincNeed,
  calculateMolybdenumNeed,
} from './micronutrientCalculations';

export { fertilizerSources } from './fertilizerSources';
export { calculateFertilizerRecommendations } from './fertilizerCalculations';
export type { FertilizerSource } from '@/types/soil';

export const calculateSoilAnalysis = (data: Omit<SoilData, 'id' | 'date'>): CalculationResult => {
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
