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
  console.log("Iniciando cálculo de nutrientes com dados:", soilData);
  
  // Garantir que todos os valores são números
  const validatedSoilData = {
    ...soilData,
    T: soilData.T || 0,
    P: soilData.P || 0,
    K: soilData.K || 0,
    Ca: soilData.Ca || 0,
    Mg: soilData.Mg || 0,
    S: soilData.S || 0,
    B: soilData.B || 0,
    Cu: soilData.Cu || 0,
    Fe: soilData.Fe || 0,
    Mn: soilData.Mn || 0,
    Zn: soilData.Zn || 0,
    organicMatter: soilData.organicMatter || 0,
    argila: soilData.argila || 0
  };

  // Calcula a extração total com base na produtividade esperada
  const totalExtraction = {
    N: (cropNeeds.extraction.N || 0) * targetYield,
    P: (cropNeeds.extraction.P || 0) * targetYield,
    K: (cropNeeds.extraction.K || 0) * targetYield
  };

  // Converte P do solo para P2O5 (fator 2.29)
  const pInSoil = validatedSoilData.P;
  const p2o5InSoil = pInSoil * 2.29;
  
  // Converte K do solo para K2O (fator 1.2)
  const kInSoil = validatedSoilData.K;
  const k2oInSoil = kInSoil * 1.2;
  
  // Calcular saturações
  const sumBases = validatedSoilData.Ca + validatedSoilData.Mg + (validatedSoilData.K / 390);
  const ctcTotal = validatedSoilData.T > 0 
    ? validatedSoilData.T 
    : sumBases + (validatedSoilData.organicMatter * 0.15); // Estimativa de H+Al

  const saturations = {
    Ca: ctcTotal > 0 ? (validatedSoilData.Ca / ctcTotal) * 100 : 0,
    Mg: ctcTotal > 0 ? (validatedSoilData.Mg / ctcTotal) * 100 : 0,
    K: ctcTotal > 0 ? ((validatedSoilData.K / 390) / ctcTotal) * 100 : 0
  };
  
  // Relação Ca/Mg
  const caeMgRatio = validatedSoilData.Mg > 0 
    ? validatedSoilData.Ca / validatedSoilData.Mg 
    : 0;
  
  // Calcula as recomendações
  const recommendationsCalc: NutrientRecommendations = {
    N: totalExtraction.N, // Assumindo que toda extração precisa ser reposta
    P2O5: Math.max(0, totalExtraction.P * 2.29 - (pInSoil > cropNeeds.threshold.P ? p2o5InSoil * 0.7 : 0)),
    K2O: Math.max(0, totalExtraction.K * 1.2 - (kInSoil > cropNeeds.threshold.K ? k2oInSoil * 0.5 : 0))
  };
  
  // Adiciona micronutrientes apenas se estiverem abaixo do limiar
  if (validatedSoilData.B < (cropNeeds.threshold.B || 0.5)) {
    recommendationsCalc.B = 2; // kg/ha padrão se abaixo do limiar
  } else {
    recommendationsCalc.B = 0;
  }
  
  if (validatedSoilData.Zn < (cropNeeds.threshold.Zn || 1.5)) {
    recommendationsCalc.Zn = 4; // kg/ha padrão se abaixo do limiar
  } else {
    recommendationsCalc.Zn = 0;
  }
  
  // Calcula sugestões de fertilizantes
  const fertilizersCalc: FertilizerSuggestions = {
    planting: {
      NPK: recommendationsCalc.P2O5 * 7.14, // Assumindo NPK 04-14-08
      borax: recommendationsCalc.B ? recommendationsCalc.B * 10 : 0, // 10% de B
      zincSulfate: recommendationsCalc.Zn ? recommendationsCalc.Zn * 5 : 0 // 20% de Zn
    },
    coverage: {
      urea: recommendationsCalc.N * 2.22, // 45% de N
      potassiumChloride: recommendationsCalc.K2O * 1.67 // 60% de K2O
    }
  };
  
  // Calcular necessidades baseadas na diferença entre o atual e o ideal
  const needs = {
    Ca: Math.max(0, (cropNeeds.threshold.Ca || 3) - validatedSoilData.Ca),
    Mg: Math.max(0, (cropNeeds.threshold.Mg || 1) - validatedSoilData.Mg),
    K: Math.max(0, cropNeeds.threshold.K - validatedSoilData.K),
    P: Math.max(0, cropNeeds.threshold.P - validatedSoilData.P),
    S: Math.max(0, (cropNeeds.threshold.S || 10) - validatedSoilData.S),
    B: Math.max(0, (cropNeeds.threshold.B || 0.5) - validatedSoilData.B),
    Cu: Math.max(0, (cropNeeds.threshold.Cu || 0.8) - validatedSoilData.Cu),
    Fe: Math.max(0, (cropNeeds.threshold.Fe || 30) - validatedSoilData.Fe),
    Mn: Math.max(0, (cropNeeds.threshold.Mn || 5) - validatedSoilData.Mn),
    Zn: Math.max(0, (cropNeeds.threshold.Zn || 1.5) - validatedSoilData.Zn),
    Mo: 0 // Assumimos que Mo é adequado se não for medido
  };
  
  // Verificações de adequação
  const isAdequate = {
    Ca: validatedSoilData.Ca >= (cropNeeds.threshold.Ca || 3),
    Mg: validatedSoilData.Mg >= (cropNeeds.threshold.Mg || 1),
    K: validatedSoilData.K >= cropNeeds.threshold.K,
    P: validatedSoilData.P >= cropNeeds.threshold.P,
    S: validatedSoilData.S >= (cropNeeds.threshold.S || 10),
    B: validatedSoilData.B >= (cropNeeds.threshold.B || 0.5),
    Cu: validatedSoilData.Cu >= (cropNeeds.threshold.Cu || 0.8),
    Fe: validatedSoilData.Fe >= (cropNeeds.threshold.Fe || 30),
    Mn: validatedSoilData.Mn >= (cropNeeds.threshold.Mn || 5),
    Zn: validatedSoilData.Zn >= (cropNeeds.threshold.Zn || 1.5),
    Mo: true // Valor padrão
  };
  
  // Formatar as recomendações para o formato esperado na interface
  const recommendations = {
    macronutrientes: {
      P: `${recommendationsCalc.P2O5.toFixed(1)} kg/ha de P₂O₅`,
      K: `${recommendationsCalc.K2O.toFixed(1)} kg/ha de K₂O`,
      Ca: `${needs.Ca.toFixed(1)} cmolc/dm³`,
      Mg: `${needs.Mg.toFixed(1)} cmolc/dm³`,
      S: `${needs.S.toFixed(1)} mg/dm³`
    },
    micronutrientes: {
      B: `${recommendationsCalc.B ? recommendationsCalc.B.toFixed(1) : "0"} kg/ha`,
      Cu: `${needs.Cu.toFixed(1)} mg/dm³`,
      Fe: `${needs.Fe.toFixed(1)} mg/dm³`,
      Mn: `${needs.Mn.toFixed(1)} mg/dm³`,
      Zn: `${recommendationsCalc.Zn ? recommendationsCalc.Zn.toFixed(1) : "0"} kg/ha`,
      Mo: "0 kg/ha" // Não calculamos Mo
    }
  };
  
  // Formatar as sugestões de fertilizantes para o formato esperado na interface
  const fertilizers = {
    macronutrientes: [
      {
        nome: "NPK 04-14-08",
        quantidade: Math.round(fertilizersCalc.planting.NPK),
        unidade: "kg/ha"
      },
      {
        nome: "Ureia",
        quantidade: Math.round(fertilizersCalc.coverage.urea),
        unidade: "kg/ha"
      },
      {
        nome: "Cloreto de Potássio",
        quantidade: Math.round(fertilizersCalc.coverage.potassiumChloride),
        unidade: "kg/ha"
      }
    ],
    micronutrientes: [
      {
        nome: "Bórax",
        quantidade: Math.round(fertilizersCalc.planting.borax),
        unidade: "kg/ha"
      },
      {
        nome: "Sulfato de Zinco",
        quantidade: Math.round(fertilizersCalc.planting.zincSulfate),
        unidade: "kg/ha"
      }
    ]
  };
  
  console.log("Resultados calculados:", {
    saturations,
    caeMgRatio,
    needs,
    isAdequate,
    recommendations,
    fertilizers
  });
  
  return {
    saturations,
    caeMgRatio,
    needs,
    isAdequate,
    recommendations,
    fertilizers
  };
}; 