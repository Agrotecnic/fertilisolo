export interface FertilizerItem {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

export interface FertilizerSection {
  id: string;
  title: string;
  description: string;
  items: FertilizerItem[];
}

export const FERTILIZER_SECTIONS: FertilizerSection[] = [
  {
    id: 'correcao_solo',
    title: 'Correção de Solo (Pré-Plantio)',
    description: 'Fontes de Ca e Mg para correção da acidez. Aplicar 60-90 dias antes do plantio.',
    items: [
      { id: 'calc_dolomitico', name: 'Calcário Dolomítico (Ca+Mg)', amount: '2.000', unit: 'kg/ha' },
      { id: 'calc_calcitico', name: 'Calcário Calcítico (Ca)', amount: '1.800', unit: 'kg/ha' },
      { id: 'calc_magnesiano', name: 'Calcário Magnesiano (Ca+Mg)', amount: '2.200', unit: 'kg/ha' },
      { id: 'gesso_agricola', name: 'Gesso Agrícola (Ca+S)', amount: '1.000', unit: 'kg/ha' },
      { id: 'sulfato_mg', name: 'Sulfato de Magnésio (Mg+S)', amount: '150', unit: 'kg/ha' },
      { id: 'cal_virgem', name: 'Cal Virgem (Ca)', amount: '1.200', unit: 'kg/ha' },
    ],
  },
  {
    id: 'adubacao_base',
    title: 'Adubação de Base (Plantio)',
    description: 'Fontes de Fósforo (P), Potássio (K) e fórmulas NPK para o sulco de plantio.',
    items: [
      { id: 'superf_simples', name: 'Superfosfato Simples', amount: '400', unit: 'kg/ha' },
      { id: 'superf_triplo', name: 'Superfosfato Triplo', amount: '180', unit: 'kg/ha' },
      { id: 'map', name: 'MAP (Fosfato Monoamônico)', amount: '150', unit: 'kg/ha' },
      { id: 'kcl', name: 'Cloreto de Potássio (KCl)', amount: '150', unit: 'kg/ha' },
      { id: 'sulfato_k', name: 'Sulfato de Potássio', amount: '180', unit: 'kg/ha' },
      { id: 'npk_04_14_08', name: 'NPK 04-14-08', amount: '350', unit: 'kg/ha' },
      { id: 'npk_10_10_10', name: 'NPK 10-10-10', amount: '300', unit: 'kg/ha' },
    ],
  },
  {
    id: 'cobertura_n',
    title: 'Adubação de Cobertura (Nitrogênio)',
    description: 'Fontes nitrogenadas para cobertura conforme estágio fenológico da cultura.',
    items: [
      { id: 'ureia', name: 'Ureia (45% N)', amount: '100', unit: 'kg/ha' },
      { id: 'sulfato_amonio', name: 'Sulfato de Amônio (21% N)', amount: '200', unit: 'kg/ha' },
      { id: 'nitrato_amonio', name: 'Nitrato de Amônio (33% N)', amount: '140', unit: 'kg/ha' },
      { id: 'ureia_revestida', name: 'Ureia Revestida (44% N)', amount: '105', unit: 'kg/ha' },
      { id: 'nitrato_calcio_n', name: 'Nitrato de Cálcio (15% N)', amount: '300', unit: 'kg/ha' },
    ],
  },
  {
    id: 'micronutrientes',
    title: 'Suplementação de Micronutrientes',
    description: 'Correção de B, Zn, Cu, Mn e Mo via foliar ou tratamento de sementes.',
    items: [
      { id: 'acido_borico', name: 'Ácido Bórico', amount: '2,0', unit: 'kg/ha' },
      { id: 'borax', name: 'Bórax', amount: '3,0', unit: 'kg/ha' },
      { id: 'sulfato_zinco', name: 'Sulfato de Zinco', amount: '3,0', unit: 'kg/ha' },
      { id: 'oxido_zinco', name: 'Óxido de Zinco', amount: '2,0', unit: 'kg/ha' },
      { id: 'sulfato_cobre', name: 'Sulfato de Cobre', amount: '1,5', unit: 'kg/ha' },
      { id: 'oxido_cobre', name: 'Óxido de Cobre', amount: '4,0', unit: 'kg/ha' },
      { id: 'sulfato_manganes', name: 'Sulfato de Manganês', amount: '3,0', unit: 'kg/ha' },
      { id: 'oxido_manganes', name: 'Óxido de Manganês', amount: '2,5', unit: 'kg/ha' },
      { id: 'molibdato_sodio', name: 'Molibdato de Sódio', amount: '0,1', unit: 'kg/ha' },
    ],
  },
  {
    id: 'organico',
    title: 'Manejo Orgânico (Opcional)',
    description: 'Melhoria da estrutura do solo. Aplicar 30-45 dias antes do plantio.',
    items: [
      { id: 'esterco_bovino', name: 'Esterco Bovino Curtido', amount: '10.000', unit: 'kg/ha' },
      { id: 'composto_organico', name: 'Composto Orgânico', amount: '5.000', unit: 'kg/ha' },
    ],
  },
];

export const ALL_FERTILIZER_IDS: string[] = FERTILIZER_SECTIONS.flatMap((s) =>
  s.items.map((i) => i.id),
);
