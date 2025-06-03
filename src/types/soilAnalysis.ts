// Tipos compartilhados para análise de solo
export interface SoilData {
  location: string;
  date: string;
  organicMatter: number;
  P: number;
  K: number;
  Ca: number;
  Mg: number;
  S: number;
  B: number;
  Cu: number;
  Fe: number;
  Mn: number;
  Zn: number;
}

export interface NutrientRecommendations {
  N: number;
  P2O5: number;
  K2O: number;
  Ca?: number;
  Mg?: number;
  S?: number;
  B?: number;
  Cu?: number;
  Fe?: number;
  Mn?: number;
  Zn?: number;
}

export interface FertilizerSuggestions {
  planting: {
    NPK: number;
    borax: number;
    zincSulfate: number;
  };
  coverage: {
    urea: number;
    potassiumChloride: number;
  };
}

export interface CalculationResult {
  recommendations: NutrientRecommendations;
  fertilizers: FertilizerSuggestions;
  saturations: {
    Ca: number;
    Mg: number;
    K: number;
  };
  caeMgRatio: number;
  needs: {
    Ca: number;
    Mg: number;
    K: number;
    P: number;
    S: number;
    B: number;
    Cu: number;
    Fe: number;
    Mn: number;
    Zn: number;
    Mo: number;
  };
  isAdequate: {
    Ca: boolean;
    Mg: boolean;
    K: boolean;
    P: boolean;
    CaMgRatio: boolean;
    S: boolean;
    B: boolean;
    Cu: boolean;
    Fe: boolean;
    Mn: boolean;
    Zn: boolean;
    Mo: boolean;
  };
} 