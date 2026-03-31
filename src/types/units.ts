// Tipos para sistema de unidades de medida
export interface UnitConfig {
  value: string;
  label: string;
  conversionFactor: number;
}

export interface NutrientUnits {
  [nutrient: string]: {
    default: string;
    options: UnitConfig[];
  };
}

// Configuração completa para todos os nutrientes
export const NUTRIENT_UNITS: NutrientUnits = {
  T: {
    default: 'cmolc_dm3',
    options: [
      { value: 'cmolc_dm3', label: 'cmolc/dm³', conversionFactor: 1 },
      { value: 'meq_100g', label: 'meq/100g', conversionFactor: 1 }
    ]
  },
  Ca: {
    default: 'cmolc_dm3',
    options: [
      { value: 'cmolc_dm3', label: 'cmolc/dm³', conversionFactor: 1 },
      { value: 'meq_100g', label: 'meq/100g', conversionFactor: 1 },
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 0.005 } // 1 cmolc/dm³ = 200 mg/dm³
    ]
  },
  Mg: {
    default: 'cmolc_dm3',
    options: [
      { value: 'cmolc_dm3', label: 'cmolc/dm³', conversionFactor: 1 },
      { value: 'meq_100g', label: 'meq/100g', conversionFactor: 1 },
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 0.00833 } // 1 cmolc/dm³ = 120 mg/dm³
    ]
  },
  K: {
    default: 'mg_dm3',
    options: [
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 1 },
      { value: 'cmolc_dm3', label: 'cmolc/dm³', conversionFactor: 390 }, // 1 cmolc/dm³ = 390 mg/dm³
      { value: 'meq_100g', label: 'meq/100g', conversionFactor: 390 } // meq/100g = cmolc/dm³
    ]
  },
  P: {
    default: 'mg_dm3',
    options: [
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 1 },
      { value: 'ppm', label: 'ppm', conversionFactor: 1 }
    ]
  },
  S: {
    default: 'mg_dm3',
    options: [
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 1 },
      { value: 'ppm', label: 'ppm', conversionFactor: 1 }
    ]
  },
  organicMatter: {
    default: 'percent',
    options: [
      { value: 'percent', label: '%', conversionFactor: 1 },
      { value: 'g_kg', label: 'g/kg', conversionFactor: 0.1 }
    ]
  },
  B: {
    default: 'mg_dm3',
    options: [
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 1 },
      { value: 'ppm', label: 'ppm', conversionFactor: 1 }
    ]
  },
  Cu: {
    default: 'mg_dm3',
    options: [
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 1 },
      { value: 'ppm', label: 'ppm', conversionFactor: 1 }
    ]
  },
  Fe: {
    default: 'mg_dm3',
    options: [
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 1 },
      { value: 'ppm', label: 'ppm', conversionFactor: 1 }
    ]
  },
  Mn: {
    default: 'mg_dm3',
    options: [
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 1 },
      { value: 'ppm', label: 'ppm', conversionFactor: 1 }
    ]
  },
  Zn: {
    default: 'mg_dm3',
    options: [
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 1 },
      { value: 'ppm', label: 'ppm', conversionFactor: 1 }
    ]
  },
  Mo: {
    default: 'mg_dm3',
    options: [
      { value: 'mg_dm3', label: 'mg/dm³', conversionFactor: 1 },
      { value: 'ppm', label: 'ppm', conversionFactor: 1 }
    ]
  }
};

export interface SelectedUnits {
  [nutrient: string]: string;
}
