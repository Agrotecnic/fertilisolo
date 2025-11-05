import { SoilData, CalculationResult, PhosphorusAnalysis } from '@/types/soilAnalysis';
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
    Fe: Fe >= 12 && Fe <= 200, // Limites: mínimo 12, máximo 200 (acima disso pode causar toxicidade)
    Mn: Mn >= 5 && Mn <= 50, // Limites: mínimo 5, máximo 50 (acima disso pode causar toxicidade)
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
    K: Math.max(0, targetK - KCmolc), // Mantém em cmolc/dm³ para uso correto em calculateFertilizerRecommendations
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

/**
 * Determina a classe de argila com base no percentual
 * @param argilaPercent Percentual de argila no solo (0-100%)
 * @returns Classe de argila (1-4)
 */
export const determinarClasseArgila = (argilaPercent: number): number => {
  if (argilaPercent <= 15) return 1; // Arenoso
  if (argilaPercent <= 35) return 2; // Textura média
  if (argilaPercent <= 60) return 3; // Argiloso
  return 4; // Muito argiloso
};

/**
 * Retorna a descrição textual da classe de argila
 * @param classe Classe de argila (1-4)
 * @returns Descrição da textura do solo
 */
export const getTexturaClasseArgila = (classe: number): string => {
  switch (classe) {
    case 1: return "Arenoso (0-15% argila)";
    case 2: return "Textura Média (16-35% argila)";
    case 3: return "Argiloso (36-60% argila)";
    case 4: return "Muito Argiloso (>60% argila)";
    default: return "Textura não definida";
  }
};

/**
 * Interpreta o nível de fósforo com base no teor de argila
 * @param pResina Valor de P em mg/dm³
 * @param argila Percentual de argila no solo (0-100%)
 * @returns Interpretação do nível de fósforo
 */
export const interpretarFosforo = (pResina: number, argila: number): string => {
  const classe = determinarClasseArgila(argila);
  
  const tabelaP = {
    1: { // 0-15% argila
      muitoBaixo: 6,
      baixo: 12,
      medio: 20,
      alto: 30
    },
    2: { // 16-35% argila  
      muitoBaixo: 8,
      baixo: 16,
      medio: 25,
      alto: 40
    },
    3: { // 36-60% argila
      muitoBaixo: 10,
      baixo: 20,
      medio: 30,
      alto: 50
    },
    4: { // >60% argila
      muitoBaixo: 12,
      baixo: 24,
      medio: 35,
      alto: 60
    }
  };
  
  const limites = tabelaP[classe as keyof typeof tabelaP];
  
  if (pResina <= limites.muitoBaixo) return "Muito Baixo";
  if (pResina <= limites.baixo) return "Baixo";
  if (pResina <= limites.medio) return "Médio";
  if (pResina <= limites.alto) return "Alto";
  return "Muito Alto";
};

/**
 * Calcula a recomendação de fósforo com base na interpretação e teor de argila
 * @param pResina Valor de P em mg/dm³
 * @param argila Percentual de argila no solo (0-100%)
 * @param cultura Cultura alvo (opcional)
 * @returns Objeto com detalhes da análise e recomendação
 */
export const calcularRecomendacaoP = (pResina: number, argila: number, cultura: string = "soja") => {
  const interpretacao = interpretarFosforo(pResina, argila);
  const classe = determinarClasseArgila(argila);
  
  // Doses de P2O5 recomendadas por interpretação e classe (kg/ha)
  const dosesP = {
    "Muito Baixo": { 1: 120, 2: 100, 3: 80, 4: 70 },
    "Baixo": { 1: 80, 2: 70, 3: 60, 4: 50 },
    "Médio": { 1: 40, 2: 35, 3: 30, 4: 25 },
    "Alto": { 1: 20, 2: 15, 3: 10, 4: 10 },
    "Muito Alto": { 1: 0, 2: 0, 3: 0, 4: 0 }
  };
  
  // Obter a dose com tratamento para evitar erros de tipo
  const doseRecomendada = dosesP[interpretacao as keyof typeof dosesP]?.[classe as keyof typeof dosesP["Muito Baixo"]] || 0;
  
  // Observações específicas para cada classe textural
  const observacoes = {
    1: "Em solos arenosos, o fósforo tem maior mobilidade. Considere parcelamento e uso de fontes de liberação gradual.",
    2: "Solos de textura média têm capacidade moderada de fixação de P. Siga a recomendação padrão.",
    3: "Solos argilosos apresentam maior fixação de P. Priorize aplicação localizada para maior eficiência.",
    4: "Solos muito argilosos têm alta capacidade de fixação de P. Considere técnicas que reduzam adsorção."
  };
  
  // Limite crítico de P para cada classe
  const limiteCritico = {
    1: 12, // mg/dm³ para solos arenosos
    2: 16, // mg/dm³ para solos médios
    3: 20, // mg/dm³ para solos argilosos
    4: 24  // mg/dm³ para solos muito argilosos
  };
  
  return {
    interpretacao,
    classe,
    doseRecomendada,
    texturaSolo: getTexturaClasseArgila(classe),
    limiteCritico: limiteCritico[classe as keyof typeof limiteCritico],
    observacao: observacoes[classe as keyof typeof observacoes],
    statusAdequacao: pResina >= limiteCritico[classe as keyof typeof limiteCritico]
  };
};

/**
 * Retorna os limites de fósforo para cada nível de interpretação com base na classe de argila
 * @param classe Classe de argila (1-4)
 * @returns Objeto com os limites para cada nível
 */
export const getLimitesFosforoPorClasse = (classe: number) => {
  const tabelaP = {
    1: { // 0-15% argila
      muitoBaixo: 6,
      baixo: 12,
      medio: 20,
      alto: 30
    },
    2: { // 16-35% argila  
      muitoBaixo: 8,
      baixo: 16,
      medio: 25,
      alto: 40
    },
    3: { // 36-60% argila
      muitoBaixo: 10,
      baixo: 20,
      medio: 30,
      alto: 50
    },
    4: { // >60% argila
      muitoBaixo: 12,
      baixo: 24,
      medio: 35,
      alto: 60
    }
  };
  
  if (classe < 1 || classe > 4) {
    return tabelaP[2]; // Retorna classe 2 como padrão para valores inválidos
  }
  
  return tabelaP[classe as keyof typeof tabelaP];
};

// Função para calcular o potencial de acidez (H+Al) em cmolc/dm³
export const calculateHAl = (organicMatter: number): number => {
  // Fórmula simplificada baseada no teor de matéria orgânica
  return Math.max(0.5, organicMatter * 0.15);
};

// Funções auxiliares para cálculo de necessidades
export const calculateCalciumNeed = (Ca: number): number => {
  const ideal = 3.0; // Valor ideal de Ca em cmolc/dm³
  // Retorna a necessidade em cmolc/dm³
  return Ca < ideal ? Math.round((ideal - Ca) * 10) / 10 : 0;
};

export const calculateMagnesiumNeed = (Mg: number): number => {
  const ideal = 1.0; // Valor ideal de Mg em cmolc/dm³
  // Retorna a necessidade em cmolc/dm³
  return Mg < ideal ? Math.round((ideal - Mg) * 10) / 10 : 0;
};

export const calculatePotassiumNeed = (K: number): number => {
  const ideal = 0.15; // Valor ideal de K em cmolc/dm³
  // Retorna a necessidade em cmolc/dm³
  return K < ideal ? Math.round((ideal - K) * 1000) / 1000 : 0;
};

export const calculatePhosphorusNeedWithArgila = (P: number, argila: number): number => {
  // Usamos a nova função que considera o teor de argila
  const analise = calcularRecomendacaoP(P, argila);
  return analise.doseRecomendada;
};

export const calculateSulfurNeedFromValue = (S: number): number => {
  const ideal = 10; // Valor ideal de S em mg/dm³
  return S < ideal ? Math.round((ideal - S) * 2) / 10 : 0;
};

export const calculateBoronNeedFromValue = (B: number): number => {
  const ideal = 0.3; // Valor ideal de B em mg/dm³
  return B < ideal ? Math.round((ideal - B) * 2) / 10 : 0;
};

export const calculateCopperNeedFromValue = (Cu: number): number => {
  const ideal = 0.8; // Valor ideal de Cu em mg/dm³
  return Cu < ideal ? Math.round((ideal - Cu) * 2) / 10 : 0;
};

export const calculateIronNeedFromValue = (Fe: number): number => {
  const ideal = 12; // Valor ideal de Fe em mg/dm³
  return Fe < ideal ? Math.round((ideal - Fe) * 0.5) / 10 : 0;
};

export const calculateManganeseNeedFromValue = (Mn: number): number => {
  const ideal = 5; // Valor ideal de Mn em mg/dm³
  return Mn < ideal ? Math.round((ideal - Mn) * 1.5) / 10 : 0;
};

export const calculateZincNeedFromValue = (Zn: number): number => {
  const ideal = 1.5; // Valor ideal de Zn em mg/dm³
  return Zn < ideal ? Math.round((ideal - Zn) * 2) / 10 : 0;
};

export const calculateMolybdenumNeedFromValue = (Mo: number = 0): number => {
  // Valor padrão para Mo, raramente testado
  return 0;
};

/**
 * Converte necessidade de Ca de cmolc/dm³ para kg/ha de CaO
 * Considera camada de 0-20cm e densidade do solo de 1,2 g/cm³
 */
export const convertCaNeedToKgHa = (needCmolc: number): number => {
  // 1 cmolc/dm³ = 400 kg/ha de Ca metálico (considerando 0-20cm)
  // Ca metálico → CaO: multiplicar por 1.4
  // 1 cmolc/dm³ ≈ 560 kg/ha de CaO
  return Math.round(needCmolc * 560);
};

/**
 * Converte necessidade de Mg de cmolc/dm³ para kg/ha de MgO
 * Considera camada de 0-20cm e densidade do solo de 1,2 g/cm³
 */
export const convertMgNeedToKgHa = (needCmolc: number): number => {
  // 1 cmolc/dm³ = 240 kg/ha de Mg metálico (considerando 0-20cm)
  // Mg metálico → MgO: multiplicar por 1.67
  // 1 cmolc/dm³ ≈ 400 kg/ha de MgO
  return Math.round(needCmolc * 400);
};

/**
 * Converte necessidade de K de cmolc/dm³ para kg/ha de K2O
 * Considera camada de 0-20cm e densidade do solo de 1,2 g/cm³
 */
export const convertKNeedToKgHa = (needCmolc: number): number => {
  // 1 cmolc/dm³ de K = 780 kg/ha de K metálico (considerando 0-20cm)
  // K metálico → K2O: multiplicar por 1.2
  // 1 cmolc/dm³ ≈ 936 kg/ha de K2O (arredondado para 950 por segurança)
  return Math.round(needCmolc * 950);
};

// Função para calcular resultados completos
export const calculateResultsWithArgilaInterpretation = (soil: SoilData): CalculationResult => {
  // Convertendo K de mg/dm³ para cmolc/dm³
  const kCmolc = soil.K / 390;
  
  // Cálculo das saturações
  const sumBases = soil.Ca + soil.Mg + kCmolc;
  const T = soil.T || sumBases + calculateHAl(soil.organicMatter);
  
  // Saturações
  const saturations = {
    Ca: soil.Ca / T * 100,
    Mg: soil.Mg / T * 100,
    K: kCmolc / T * 100
  };
  
  // Relação Ca/Mg
  const caeMgRatio = soil.Ca / soil.Mg;
  
  // Análise de fósforo baseada em argila
  const fosforoAnalise = calcularRecomendacaoP(soil.P, soil.argila);
  
  // Cálculo de necessidades
  const needs = {
    Ca: calculateCalciumNeed(soil.Ca),
    Mg: calculateMagnesiumNeed(soil.Mg),
    K: calculatePotassiumNeed(kCmolc),
    P: fosforoAnalise.doseRecomendada,
    S: calculateSulfurNeedFromValue(soil.S),
    B: calculateBoronNeedFromValue(soil.B),
    Cu: calculateCopperNeedFromValue(soil.Cu),
    Fe: calculateIronNeedFromValue(soil.Fe),
    Mn: calculateManganeseNeedFromValue(soil.Mn),
    Zn: calculateZincNeedFromValue(soil.Zn),
    Mo: calculateMolybdenumNeedFromValue(soil.Mo)
  };
  
  // Verificações de adequação
  const isAdequate = {
    Ca: soil.Ca >= 3,
    Mg: soil.Mg >= 1,
    K: kCmolc >= 0.15,
    P: fosforoAnalise.statusAdequacao, // Usa a análise baseada em argila
    S: soil.S >= 10,
    B: soil.B >= 0.3,
    Cu: soil.Cu >= 0.8,
    Fe: soil.Fe >= 12 && soil.Fe <= 200, // Limites: mínimo 12, máximo 200 (acima disso pode causar toxicidade)
    Mn: soil.Mn >= 5 && soil.Mn <= 50, // Limites: mínimo 5, máximo 50 (acima disso pode causar toxicidade)
    Zn: soil.Zn >= 1.5,
    Mo: true // Padrão para Molibdênio
  };
  
  // Adicionar recomendações específicas  
  const recommendations = {
    macronutrientes: {
      P: `Aplicar ${needs.P} kg/ha de P2O5. ${fosforoAnalise.observacao}`,
      K: `Aplicar ${convertKNeedToKgHa(needs.K)} kg/ha de K2O`,
      Ca: `Aplicar ${convertCaNeedToKgHa(needs.Ca)} kg/ha de CaO`,
      Mg: `Aplicar ${convertMgNeedToKgHa(needs.Mg)} kg/ha de MgO`,
      S: `Aplicar ${needs.S} kg/ha de enxofre`
    },
    micronutrientes: {
      B: `Aplicar ${needs.B} kg/ha de boro`,
      Cu: `Aplicar ${needs.Cu} kg/ha de cobre`,
      Fe: `Aplicar ${needs.Fe} kg/ha de ferro`,
      Mn: `Aplicar ${needs.Mn} kg/ha de manganês`,
      Zn: `Aplicar ${needs.Zn} kg/ha de zinco`,
      Mo: `Nenhuma aplicação necessária`
    }
  };
  
  // Adicionar fertilizantes recomendados
  const fertilizers = {
    macronutrientes: [
      { nome: "Superfosfato Simples", quantidade: Math.round(needs.P * 5.56), unidade: "kg/ha" }, // 18% P2O5
      { nome: "Cloreto de Potássio", quantidade: Math.round(convertKNeedToKgHa(needs.K) / 0.6), unidade: "kg/ha" }, // 60% K2O
      { nome: "Calcário Dolomítico", quantidade: Math.round((convertCaNeedToKgHa(needs.Ca) + convertMgNeedToKgHa(needs.Mg)) / 1000), unidade: "t/ha" }, // Fornece Ca e Mg
      { nome: "Sulfato de Amônio", quantidade: Math.round(needs.S * 4.8), unidade: "kg/ha" } // ~21% S
    ],
    micronutrientes: [
      { nome: "Bórax", quantidade: needs.B * 9, unidade: "kg/ha" },
      { nome: "Sulfato de Cobre", quantidade: needs.Cu * 4, unidade: "kg/ha" },
      { nome: "Sulfato de Zinco", quantidade: needs.Zn * 5, unidade: "kg/ha" },
      { nome: "Sulfato de Manganês", quantidade: needs.Mn * 4, unidade: "kg/ha" }
    ]
  };
  
  return {
    saturations,
    caeMgRatio,
    needs,
    isAdequate,
    recommendations,
    fertilizers
  };
};
