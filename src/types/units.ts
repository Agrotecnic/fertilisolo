// Tipos para sistema de unidades de medida
export interface UnitConfig {
  value: string;
  label: string;
  conversionFactor: number; // Fator para converter para a unidade padrão
}

export interface NutrientUnits {
  [nutrient: string]: {
    default: string; // Unidade padrão usada nos cálculos
    options: UnitConfig[];
  };
}

// Configuração de unidades disponíveis por nutriente
export const NUTRIENT_UNITS: NutrientUnits = {
  Ca: {
    default: 'cmolc_dm3',
    options: [
      { value: 'cmolc_dm3', label: 'cmolc/dm³', conversionFactor: 1 },
      { value: 'meq_100g', label: 'meq/100g', conversionFactor: 1 }, // Equivalente
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 0.04991 }, // Ca: 1 cmolc/dm³ = 400.8 mg/dm³
    ]
  },
  Mg: {
    default: 'cmolc_dm3',
    options: [
      { value: 'cmolc_dm3', label: 'cmolc/dm³', conversionFactor: 1 },
      { value: 'meq_100g', label: 'meq/100g', conversionFactor: 1 },
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 0.08229 }, // Mg: 1 cmolc/dm³ = 121.5 mg/dm³
    ]
  },
  K: {
    default: 'mg_dm3',
    options: [
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 1 },
      { value: 'cmolc_dm3', label: 'cmolc/dm³', conversionFactor: 390 }, // K: 1 cmolc/dm³ = 390 mg/dm³
      { value: 'meq_100g', label: 'meq/100g', conversionFactor: 390 },
      { value: 'ppm', label: 'ppm', conversionFactor: 1 },
    ]
  },
  P: {
    default: 'mg_dm3',
    options: [
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 1 },
      { value: 'ppm', label: 'ppm', conversionFactor: 1 },
      { value: 'mg_kg', label: 'mg/kg', conversionFactor: 1 },
    ]
  },
  S: {
    default: 'mg_dm3',
    options: [
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 1 },
      { value: 'ppm', label: 'ppm', conversionFactor: 1 },
      { value: 'mg_kg', label: 'mg/kg', conversionFactor: 1 },
    ]
  },
  B: {
    default: 'mg_dm3',
    options: [
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 1 },
      { value: 'ppm', label: 'ppm', conversionFactor: 1 },
      { value: 'mg_kg', label: 'mg/kg', conversionFactor: 1 },
    ]
  },
  Cu: {
    default: 'mg_dm3',
    options: [
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 1 },
      { value: 'ppm', label: 'ppm', conversionFactor: 1 },
      { value: 'mg_kg', label: 'mg/kg', conversionFactor: 1 },
    ]
  },
  Fe: {
    default: 'mg_dm3',
    options: [
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 1 },
      { value: 'ppm', label: 'ppm', conversionFactor: 1 },
      { value: 'mg_kg', label: 'mg/kg', conversionFactor: 1 },
    ]
  },
  Mn: {
    default: 'mg_dm3',
    options: [
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 1 },
      { value: 'ppm', label: 'ppm', conversionFactor: 1 },
      { value: 'mg_kg', label: 'mg/kg', conversionFactor: 1 },
    ]
  },
  Zn: {
    default: 'mg_dm3',
    options: [
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 1 },
      { value: 'ppm', label: 'ppm', conversionFactor: 1 },
      { value: 'mg_kg', label: 'mg/kg', conversionFactor: 1 },
    ]
  },
  Mo: {
    default: 'mg_dm3',
    options: [
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 1 },
      { value: 'ppm', label: 'ppm', conversionFactor: 1 },
      { value: 'mg_kg', label: 'mg/kg', conversionFactor: 1 },
    ]
  },
  T: {
    default: 'cmolc_dm3',
    options: [
      { value: 'cmolc_dm3', label: 'cmolc/dm³', conversionFactor: 1 },
      { value: 'meq_100g', label: 'meq/100g', conversionFactor: 1 },
    ]
  }
};

export interface SelectedUnits {
  [nutrient: string]: string;
}
