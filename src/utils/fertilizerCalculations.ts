
import { FertilizerRecommendation } from '@/types/soil';
import { fertilizerSources } from './fertilizerSources';

export const calculateFertilizerRecommendations = (
  nutrient: keyof typeof fertilizerSources,
  needCmolc: number
): FertilizerRecommendation[] => {
  const sources = fertilizerSources[nutrient];
  
  return sources.map(source => {
    let recommendation = 0;
    
    if (nutrient === 'Ca') {
      // Ca: 1 cmolc/dm³ = 560 kg/ha de CaO (considerando 0-20cm)
      recommendation = (needCmolc * 560) / (source.concentration / 100);
    } else if (nutrient === 'Mg') {
      // Mg: 1 cmolc/dm³ = 400 kg/ha de MgO (considerando 0-20cm)
      recommendation = (needCmolc * 400) / (source.concentration / 100);
    } else if (nutrient === 'K') {
      // K: 1 cmolc/dm³ = 950 kg/ha de K2O (considerando 0-20cm)
      // Nota: needCmolc para K está em cmolc/dm³
      recommendation = (needCmolc * 950) / (source.concentration / 100);
    } else if (nutrient === 'P') {
      // P: needCmolc já está em kg/ha de P2O5
      recommendation = needCmolc / (source.concentration / 100);
    } else {
      // Para micronutrientes: needCmolc já está em kg/ha
      recommendation = needCmolc / (source.concentration / 100);
    }
    
    return {
      source,
      recommendation: Math.round(recommendation * 100) / 100,
    };
  });
};
