
import { FertilizerSource } from '@/types/soil';

export const fertilizerSources = {
  Ca: [
    { name: 'Calcário Calcítico', concentration: 40, unit: '% CaO', benefits: 'Correção de acidez e fornecimento de Ca' },
    { name: 'Gesso Agrícola', concentration: 26, unit: '% CaO', benefits: 'Melhora subsuperfície e mobilidade de Ca' },
    { name: 'Óxido de Cálcio', concentration: 70, unit: '% CaO', benefits: 'Alta concentração, ação rápida' },
  ],
  Mg: [
    { name: 'Calcário Dolomítico', concentration: 12, unit: '% MgO', benefits: 'Correção de acidez e fornecimento de Mg' },
    { name: 'Óxido de Magnésio', concentration: 52, unit: '% MgO', benefits: 'Alta concentração de Mg disponível' },
    { name: 'Sulfato de Magnésio', concentration: 16, unit: '% MgO', benefits: 'Fornece Mg e enxofre solúvel' },
  ],
  K: [
    { name: 'Cloreto de Potássio', concentration: 60, unit: '% K₂O', benefits: 'Alta solubilidade, pronta disponibilidade' },
    { name: 'Sulfato de Potássio', concentration: 50, unit: '% K₂O', benefits: 'Fornece K e enxofre, sem cloro' },
    { name: 'Nitrato de Potássio', concentration: 44, unit: '% K₂O', benefits: 'Fornece K e nitrogênio solúvel' },
  ],
  P: [
    { name: 'Superfosfato Simples', concentration: 18, unit: '% P₂O₅', benefits: 'Fornece P, Ca e enxofre' },
    { name: 'Superfosfato Triplo', concentration: 45, unit: '% P₂O₅', benefits: 'Alta concentração de P solúvel' },
    { name: 'MAP (Fosfato Monoamônico)', concentration: 52, unit: '% P₂O₅', benefits: 'Alta concentração P + N, alta solubilidade' },
  ],
  S: [
    { name: 'Gesso Agrícola', concentration: 18, unit: '% S', benefits: 'Fornece S e Ca, melhora subsuperfície' },
    { name: 'Sulfato de Amônio', concentration: 24, unit: '% S', benefits: 'Fornece S e nitrogênio' },
    { name: 'Enxofre Elementar', concentration: 90, unit: '% S', benefits: 'Alta concentração, liberação lenta' },
  ],
  B: [
    { name: 'Ácido Bórico', concentration: 17, unit: '% B', benefits: 'Alta solubilidade, ação rápida' },
    { name: 'Bórax', concentration: 11, unit: '% B', benefits: 'Solubilidade moderada' },
    { name: 'Ulexita', concentration: 8, unit: '% B', benefits: 'Liberação gradual, menor risco de toxidez' },
  ],
  Cu: [
    { name: 'Sulfato de Cobre', concentration: 25, unit: '% Cu', benefits: 'Alta solubilidade, pronta disponibilidade' },
    { name: 'Óxido de Cobre', concentration: 75, unit: '% Cu', benefits: 'Alta concentração, liberação gradual' },
    { name: 'Quelato de Cobre', concentration: 13, unit: '% Cu', benefits: 'Alta disponibilidade, baixa fixação' },
  ],
  Fe: [
    { name: 'Sulfato de Ferro', concentration: 20, unit: '% Fe', benefits: 'Solúvel, correção rápida' },
    { name: 'Quelato de Ferro', concentration: 6, unit: '% Fe', benefits: 'Alta disponibilidade em solos alcalinos' },
    { name: 'Óxido de Ferro', concentration: 60, unit: '% Fe', benefits: 'Liberação gradual' },
  ],
  Mn: [
    { name: 'Sulfato de Manganês', concentration: 26, unit: '% Mn', benefits: 'Alta solubilidade' },
    { name: 'Óxido de Manganês', concentration: 41, unit: '% Mn', benefits: 'Liberação gradual' },
    { name: 'Quelato de Manganês', concentration: 12, unit: '% Mn', benefits: 'Alta disponibilidade' },
  ],
  Zn: [
    { name: 'Sulfato de Zinco', concentration: 20, unit: '% Zn', benefits: 'Alta solubilidade' },
    { name: 'Óxido de Zinco', concentration: 50, unit: '% Zn', benefits: 'Alta concentração' },
    { name: 'Quelato de Zinco', concentration: 14, unit: '% Zn', benefits: 'Alta disponibilidade' },
  ],
  Mo: [
    { name: 'Molibdato de Sódio', concentration: 39, unit: '% Mo', benefits: 'Alta solubilidade' },
    { name: 'Molibdato de Amônio', concentration: 54, unit: '% Mo', benefits: 'Fornece Mo e nitrogênio' },
    { name: 'Trióxido de Molibdênio', concentration: 66, unit: '% Mo', benefits: 'Alta concentração' },
  ],
} as const;
