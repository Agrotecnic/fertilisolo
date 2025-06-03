import { SoilData, NutrientRecommendations, FertilizerSuggestions, CalculationResult } from '../types/soilAnalysis';

interface CropNeeds {
  extraction: {
    N: number;
    P: number;
    K: number;
    Ca?: number;
    Mg?: number;
    S?: number;
    B?: number;
    Cu?: number;
    Fe?: number;
    Mn?: number;
    Zn?: number;
  };
  threshold: {
    P: number;
    K: number;
    Ca?: number;
    Mg?: number;
    S?: number;
    B?: number;
    Cu?: number;
    Fe?: number;
    Mn?: number;
    Zn?: number;
  };
}

interface CalculationParams {
  soilData: SoilData;
  cropNeeds: CropNeeds;
  targetYield: number;
}

// Referência de necessidades das plantas
export const plantNeedsReference: Record<string, CropNeeds> = {
  soja: {
    extraction: {
      N: 83, // kg/ton
      P: 7.5, // kg/ton
      K: 33, // kg/ton
      Ca: 20,
      Mg: 9,
      S: 5,
      B: 0.1,
      Cu: 0.03,
      Fe: 0.3,
      Mn: 0.15,
      Zn: 0.06
    },
    threshold: {
      P: 12, // mg/dm³ (Nível crítico)
      K: 80, // mg/dm³ (Nível crítico)
      Ca: 3, // cmolc/dm³
      Mg: 1, // cmolc/dm³
      S: 10, // mg/dm³
      B: 0.5, // mg/dm³
      Cu: 0.8, // mg/dm³
      Fe: 30, // mg/dm³
      Mn: 5, // mg/dm³
      Zn: 1.6 // mg/dm³
    }
  },
  milho: {
    extraction: {
      N: 22, // kg/ton
      P: 4, // kg/ton
      K: 20, // kg/ton
      Ca: 3,
      Mg: 3,
      S: 4,
      B: 0.02,
      Cu: 0.015,
      Fe: 0.2,
      Mn: 0.07,
      Zn: 0.05
    },
    threshold: {
      P: 15, // mg/dm³
      K: 100, // mg/dm³
      Ca: 3, // cmolc/dm³
      Mg: 1, // cmolc/dm³
      S: 10, // mg/dm³
      B: 0.5, // mg/dm³
      Cu: 0.8, // mg/dm³
      Fe: 30, // mg/dm³
      Mn: 5, // mg/dm³
      Zn: 1.5 // mg/dm³
    }
  },
  algodao: {
    extraction: {
      N: 65, // kg/ton
      P: 13, // kg/ton
      K: 65, // kg/ton
      Ca: 15,
      Mg: 8,
      S: 10,
      B: 0.3,
      Cu: 0.05,
      Fe: 0.4,
      Mn: 0.2,
      Zn: 0.15
    },
    threshold: {
      P: 18, // mg/dm³
      K: 120, // mg/dm³
      Ca: 3.5, // cmolc/dm³
      Mg: 1.2, // cmolc/dm³
      S: 12, // mg/dm³
      B: 0.8, // mg/dm³
      Cu: 1, // mg/dm³
      Fe: 40, // mg/dm³
      Mn: 8, // mg/dm³
      Zn: 2 // mg/dm³
    }
  },
  cafe: {
    extraction: {
      N: 40, // kg/ton
      P: 3, // kg/ton
      K: 45, // kg/ton
      Ca: 15,
      Mg: 4,
      S: 3,
      B: 0.15,
      Cu: 0.02,
      Fe: 0.2,
      Mn: 0.1,
      Zn: 0.03
    },
    threshold: {
      P: 20, // mg/dm³
      K: 150, // mg/dm³
      Ca: 4, // cmolc/dm³
      Mg: 1.5, // cmolc/dm³
      S: 15, // mg/dm³
      B: 0.6, // mg/dm³
      Cu: 1, // mg/dm³
      Fe: 40, // mg/dm³
      Mn: 10, // mg/dm³
      Zn: 2 // mg/dm³
    }
  },
  cana: {
    extraction: {
      N: 1.2, // kg/ton
      P: 0.2, // kg/ton
      K: 1.5, // kg/ton
      Ca: 0.8,
      Mg: 0.3,
      S: 0.5,
      B: 0.003,
      Cu: 0.001,
      Fe: 0.08,
      Mn: 0.04,
      Zn: 0.002
    },
    threshold: {
      P: 15, // mg/dm³
      K: 120, // mg/dm³
      Ca: 3, // cmolc/dm³
      Mg: 1, // cmolc/dm³
      S: 10, // mg/dm³
      B: 0.5, // mg/dm³
      Cu: 0.8, // mg/dm³
      Fe: 30, // mg/dm³
      Mn: 6, // mg/dm³
      Zn: 1.5 // mg/dm³
    }
  }
};

// Função para calcular recomendações de nutrientes
export const calculateNutrientNeeds = ({
  soilData,
  cropNeeds,
  targetYield
}: CalculationParams): CalculationResult => {
  // Calcula a extração total com base na produtividade esperada
  const totalExtraction = {
    N: cropNeeds.extraction.N * targetYield,
    P: cropNeeds.extraction.P * targetYield,
    K: cropNeeds.extraction.K * targetYield
  };

  // Converte P do solo para P2O5 (fator 2.29)
  const pInSoil = soilData.P;
  const p2o5InSoil = pInSoil * 2.29;
  
  // Converte K do solo para K2O (fator 1.2)
  const kInSoil = soilData.K;
  const k2oInSoil = kInSoil * 1.2;
  
  // Calcula as recomendações (simplificado para exemplo)
  const recommendations: NutrientRecommendations = {
    N: totalExtraction.N, // Assumindo que toda extração precisa ser reposta
    P2O5: Math.max(0, totalExtraction.P * 2.29 - (pInSoil > cropNeeds.threshold.P ? p2o5InSoil * 0.7 : 0)),
    K2O: Math.max(0, totalExtraction.K * 1.2 - (kInSoil > cropNeeds.threshold.K ? k2oInSoil * 0.5 : 0))
  };
  
  // Adiciona micronutrientes apenas se estiverem abaixo do limiar
  if (soilData.B < (cropNeeds.threshold.B || 0.5)) {
    recommendations.B = 2; // kg/ha padrão se abaixo do limiar
  } else {
    recommendations.B = 0;
  }
  
  if (soilData.Zn < (cropNeeds.threshold.Zn || 1.5)) {
    recommendations.Zn = 4; // kg/ha padrão se abaixo do limiar
  } else {
    recommendations.Zn = 0;
  }
  
  // Calcula sugestões de fertilizantes (simplificado)
  const fertilizers: FertilizerSuggestions = {
    planting: {
      NPK: recommendations.P2O5 * 7.14, // Assumindo NPK 04-14-08
      borax: recommendations.B ? recommendations.B * 10 : 0, // 10% de B
      zincSulfate: recommendations.Zn ? recommendations.Zn * 5 : 0 // 20% de Zn
    },
    coverage: {
      urea: recommendations.N * 2.22, // 45% de N
      potassiumChloride: recommendations.K2O * 1.67 // 60% de K2O
    }
  };
  
  // Valores fictícios para satisfazer a interface CalculationResult
  const result: CalculationResult = {
    recommendations,
    fertilizers,
    saturations: {
      Ca: 65, // Valores fictícios para exemplo
      Mg: 15,
      K: 5
    },
    caeMgRatio: 3.5,
    needs: {
      Ca: recommendations.Ca || 0,
      Mg: recommendations.Mg || 0,
      K: recommendations.K2O / 1.2, // Convertendo K2O para K
      P: recommendations.P2O5 / 2.29, // Convertendo P2O5 para P
      S: recommendations.S || 0,
      B: recommendations.B || 0,
      Cu: 0,
      Fe: 0,
      Mn: 0,
      Zn: recommendations.Zn || 0,
      Mo: 0
    },
    isAdequate: {
      Ca: soilData.Ca >= (cropNeeds.threshold.Ca || 3),
      Mg: soilData.Mg >= (cropNeeds.threshold.Mg || 1),
      K: soilData.K >= cropNeeds.threshold.K,
      P: soilData.P >= cropNeeds.threshold.P,
      CaMgRatio: true, // Valor padrão
      S: soilData.S >= (cropNeeds.threshold.S || 10),
      B: soilData.B >= (cropNeeds.threshold.B || 0.5),
      Cu: soilData.Cu >= (cropNeeds.threshold.Cu || 0.8),
      Fe: soilData.Fe >= (cropNeeds.threshold.Fe || 30),
      Mn: soilData.Mn >= (cropNeeds.threshold.Mn || 5),
      Zn: soilData.Zn >= (cropNeeds.threshold.Zn || 1.5),
      Mo: true // Valor padrão
    }
  };
  
  return result;
}; 