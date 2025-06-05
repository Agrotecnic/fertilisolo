// Tipos compartilhados para análise de solo
export interface SoilData {
  id?: string;
  location: string;
  date: string;
  organicMatter: number;
  T: number; // CTC total (cmolc/dm³)
  P: number;
  argila: number; // Percentual de argila (%)
  K: number;
  Ca: number;
  Mg: number;
  S: number;
  B: number;
  Cu: number;
  Fe: number;
  Mn: number;
  Zn: number;
  Mo?: number; // Molibdênio (opcional)
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
    S: boolean;
    B: boolean;
    Cu: boolean;
    Fe: boolean;
    Mn: boolean;
    Zn: boolean;
    Mo: boolean;
  };
  recommendations: {
    macronutrientes: {
      P: string;
      K: string;
      Ca: string;
      Mg: string;
      S: string;
    };
    micronutrientes: {
      B: string;
      Cu: string;
      Fe: string;
      Mn: string;
      Zn: string;
      Mo: string;
    };
  };
  fertilizers: {
    macronutrientes: Array<{
      nome: string;
      quantidade: number;
      unidade: string;
    }>;
    micronutrientes: Array<{
      nome: string;
      quantidade: number;
      unidade: string;
    }>;
  };
}

// Interface para armazenar a interpretação de fósforo baseada em argila
export interface PhosphorusAnalysis {
  interpretacao: string;        // Nível de P (Muito Baixo, Baixo, etc.)
  classe: number;               // Classe de argila (1-4)
  doseRecomendada: number;      // Dose recomendada de P2O5 (kg/ha)
  texturaSolo: string;          // Descrição da textura do solo
  limiteCritico: number;        // Limite crítico de P para a classe
  observacao: string;           // Observação específica para a classe
  statusAdequacao: boolean;     // Se está acima do limite crítico
} 