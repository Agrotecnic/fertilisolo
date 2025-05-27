
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
      recommendation = (needCmolc * 560) / (source.concentration / 100);
    } else if (nutrient === 'Mg') {
      recommendation = (needCmolc * 400) / (source.concentration / 100);
    } else if (nutrient === 'K') {
      // K já está em mg/dm³, então converter para kg/ha usando fator 2
      recommendation = (needCmolc * 2) / (source.concentration / 100);
    } else if (nutrient === 'P') {
      recommendation = needCmolc / (source.concentration / 100);
    } else {
      // Para micronutrientes
      recommendation = needCmolc / (source.concentration / 100);
    }
    
    return {
      source,
      recommendation: Math.round(recommendation * 100) / 100,
    };
  });
};
