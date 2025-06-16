import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SoilData, CalculationResult } from '@/types/soilAnalysis';
import { formatNumber, formatNumberOptional } from './numberFormat';
import { 
  interpretarFosforo, 
  calcularRecomendacaoP, 
  determinarClasseArgila, 
  getTexturaClasseArgila 
} from './soilCalculations';
import { fertilizerSources } from './fertilizerSources';

// Estendendo o jsPDF com autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Interface para recomendações de fertilizantes no formato do relatório
 */
interface FertilizerRecommendation {
  fertilizer: string;
  amount: number;
  unit: string;
  method: string;
  stage: string;
}

/**
 * Determina o nível de um nutriente com base em limiares
 */
function getNutrientLevel(value: number | undefined, lowThreshold: number, highThreshold: number): string {
  if (value === undefined) return "Não analisado";
  if (value < lowThreshold) return "Baixo";
  if (value > highThreshold) return "Alto";
  return "Adequado";
}

/**
 * Gera recomendação para micronutrientes com base no nível
 */
function getMicroRecommendation(nutrient: string, level: string): string {
  if (level === "Não analisado") return "Realizar análise";
  if (level === "Baixo") {
    switch (nutrient) {
      case "B": return "Aplicar 2-3 kg/ha de Boro";
      case "Cu": return "Aplicar 1-2 kg/ha de Cobre";
      case "Fe": return "Aplicar 4-6 kg/ha de Ferro";
      case "Mn": return "Aplicar 3-5 kg/ha de Manganês";
      case "Zn": return "Aplicar 3-6 kg/ha de Zinco";
      default: return "Aplicação recomendada";
    }
  }
  if (level === "Alto") return "Não necessita aplicação";
  return "Aplicação de manutenção";
}

/**
 * Gera o relatório profissional em PDF seguindo o estilo Fertilisolo
 */
export const generateFertilisoloReport = (soilData: SoilData, results: CalculationResult, cultureName?: string, farmName?: string, plotName?: string) => {
  try {
    // Criar um novo documento PDF
    const pdf = new jsPDF();

    // Configurações do PDF
    pdf.setProperties({
      title: 'Relatório de Análise de Solo - Fertilisolo',
      author: 'Fertilisolo',
      subject: 'Análise e Recomendação de Fertilizantes',
      keywords: 'solo, fertilizantes, análise, agricultura'
    });

    // Gerar as 3 páginas do relatório
    generatePage1(pdf, soilData, results, cultureName, farmName, plotName);
    generatePage2(pdf, soilData, results, cultureName);
    generatePage3(pdf, soilData, results);

    // Adicionar rodapés a todas as páginas
    addFooters(pdf);

    // Nome do arquivo para download
    const filename = `Fertilisolo_${soilData.location || "Local"}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Retornar o PDF para download
    return { pdf, filename };
  } catch (error) {
    console.error("Erro ao gerar relatório Fertilisolo:", error);
    throw error;
  }
};

/**
 * Gera a primeira página do relatório
 */
function generatePage1(pdf: jsPDF, soilData: SoilData, results: CalculationResult, cultureName?: string, farmName?: string, plotName?: string) {
  // Cores principais
  const greenColor: [number, number, number] = [76, 175, 80]; // #4CAF50
  const blueColor: [number, number, number] = [33, 150, 243]; // #2196F3
  const grayLight: [number, number, number] = [245, 245, 245]; // #F5F5F5
  const grayBorder: [number, number, number] = [224, 224, 224]; // #E0E0E0
  
  // Header Superior
  pdf.setFillColor(greenColor[0], greenColor[1], greenColor[2]);
  pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 20, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text('Fertilisolo', 15, 13);
  
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  pdf.setFontSize(10);
  pdf.text(`Relatório gerado em: ${dataAtual}`, 15, 18);
  
  // Nome da fazenda/local no canto superior direito
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  const location = `${farmName || soilData.location || "Não especificado"}`;
  pdf.text(location, 195 - pdf.getTextWidth(location), 13);
  
  // Data da coleta
  const dataColeta = soilData.date ? new Date(soilData.date).toLocaleDateString('pt-BR') : dataAtual;
  const textDataColeta = `Data da coleta: ${dataColeta}`;
  pdf.setFontSize(10);
  pdf.text(textDataColeta, 195 - pdf.getTextWidth(textDataColeta), 18);

  // Linha divisória
  pdf.setDrawColor(greenColor[0], greenColor[1], greenColor[2]);
  pdf.setLineWidth(0.5);
  pdf.line(15, 25, 195, 25);
  
  // SEÇÃO 1: Detalhes da Análise (Lado Esquerdo)
  pdf.setFillColor(grayLight[0], grayLight[1], grayLight[2]);
  pdf.roundedRect(15, 30, 55, 40, 3, 3, 'F');
  
  pdf.setFontSize(11);
  pdf.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
  pdf.text('Detalhes', 17, 38);
  
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Cultura:', 17, 46);
  pdf.text(cultureName || "Não especificada", 45, 46);
  pdf.text('Matéria Orgânica:', 17, 53);
  pdf.text(`${formatNumber(soilData.organicMatter)}%`, 45, 53);
  pdf.text('Argila:', 17, 60);
  pdf.text(`${formatNumber(soilData.argila)}%`, 45, 60);
  
  // SEÇÃO 2: Macronutrientes (Centro)
  pdf.setFillColor(grayLight[0], grayLight[1], grayLight[2]);
  pdf.roundedRect(75, 30, 55, 40, 3, 3, 'F');
  
  pdf.setFontSize(11);
  pdf.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
  pdf.text('Macronutrientes', 77, 38);
  
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  pdf.text('CTC (T):', 77, 46);
  pdf.text(`${formatNumber(soilData.T)} cmolc/dm³`, 115, 46);
  pdf.text('Fósforo (P):', 77, 53);
  pdf.text(`${formatNumber(soilData.P)} mg/dm³`, 115, 53);
  pdf.text('Potássio (K):', 77, 60);
  const kCmolc = (soilData.K || 0) / 390;
  pdf.text(`${formatNumber(kCmolc)} cmolc/dm³`, 115, 60);
  pdf.text('Cálcio (Ca):', 77, 67);
  pdf.text(`${formatNumber(soilData.Ca)} cmolc/dm³`, 115, 67);
  pdf.text('Magnésio (Mg):', 77, 74);
  pdf.text(`${formatNumber(soilData.Mg)} cmolc/dm³`, 115, 74);
  
  // SEÇÃO 3: Informação Importante (Lado Direito - Box Azul)
  pdf.setFillColor(blueColor[0], blueColor[1], blueColor[2], 0.1); // Azul com opacidade
  pdf.setDrawColor(blueColor[0], blueColor[1], blueColor[2]);
  pdf.roundedRect(135, 30, 55, 40, 3, 3, 'FD');
  
  pdf.setFontSize(11);
  pdf.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
  pdf.text('Informação Importante', 137, 38);
  
  pdf.setFontSize(8);
  pdf.text('Opções de Correção:', 137, 46);
  pdf.text('As fontes de nutrientes listadas', 137, 53);
  pdf.text('são alternativas.', 137, 58);
  pdf.setFontSize(7);
  pdf.text('Escolha apenas uma fonte para cada', 137, 65);
  pdf.text('tipo de nutriente com base na', 137, 70);
  pdf.text('disponibilidade, custo e benefícios.', 137, 75);
  
  // SEÇÃO 4: Análise Visual de Necessidades
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(14);
  pdf.text('Análise Visual de Necessidades', 15, 85);
  
  // Título Macronutrientes
  pdf.setFontSize(11);
  pdf.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
  pdf.text('Macronutrientes', 15, 95);
  
  // Barras de Progresso para Macronutrientes
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  
  // Fósforo
  const pLevel = getNutrientLevel(soilData.P, 10, 20);
  const pAdequate = pLevel !== "Baixo";
  pdf.text('Fósforo (P):', 15, 105);
  pdf.text(pLevel, 180, 105);
  drawNutrientBar(pdf, 70, 105, soilData.P || 0, 30, pAdequate);
  
  // Potássio
  const kLevel = getNutrientLevel(kCmolc, 0.15, 0.30);
  const kAdequate = kLevel !== "Baixo";
  pdf.text('Potássio (K):', 15, 115);
  pdf.text(kLevel, 180, 115);
  drawNutrientBar(pdf, 70, 115, kCmolc, 0.5, kAdequate);
  
  // Cálcio
  const caLevel = getNutrientLevel(soilData.Ca, 2.0, 4.0);
  const caAdequate = caLevel !== "Baixo";
  pdf.text('Cálcio (Ca):', 15, 125);
  pdf.text(caLevel, 180, 125);
  drawNutrientBar(pdf, 70, 125, soilData.Ca || 0, 6.0, caAdequate);
  
  // Magnésio
  const mgLevel = getNutrientLevel(soilData.Mg, 0.8, 1.5);
  const mgAdequate = mgLevel !== "Baixo";
  pdf.text('Magnésio (Mg):', 15, 135);
  pdf.text(mgLevel, 180, 135);
  drawNutrientBar(pdf, 70, 135, soilData.Mg || 0, 2.0, mgAdequate);
  
  // Título Micronutrientes
  pdf.setFontSize(11);
  pdf.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
  pdf.text('Micronutrientes', 15, 150);
  
  // Barras de Progresso para Micronutrientes
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  
  // Boro
  const bLevel = getNutrientLevel(soilData.B, 0.3, 0.6);
  const bAdequate = bLevel !== "Baixo";
  pdf.text('Boro (B):', 15, 160);
  pdf.text(bLevel, 180, 160);
  drawNutrientBar(pdf, 70, 160, soilData.B || 0, 1.0, bAdequate);
  
  // Zinco
  const znLevel = getNutrientLevel(soilData.Zn, 1.5, 2.2);
  const znAdequate = znLevel !== "Baixo";
  pdf.text('Zinco (Zn):', 15, 170);
  pdf.text(znLevel, 180, 170);
  drawNutrientBar(pdf, 70, 170, soilData.Zn || 0, 3.0, znAdequate);
  
  // Cobre
  const cuLevel = getNutrientLevel(soilData.Cu, 0.8, 1.2);
  const cuAdequate = cuLevel !== "Baixo";
  pdf.text('Cobre (Cu):', 15, 180);
  pdf.text(cuLevel, 180, 180);
  drawNutrientBar(pdf, 70, 180, soilData.Cu || 0, 2.0, cuAdequate);
  
  // Manganês
  const mnLevel = getNutrientLevel(soilData.Mn, 5, 30);
  const mnAdequate = mnLevel !== "Baixo";
  pdf.text('Manganês (Mn):', 15, 190);
  pdf.text(mnLevel, 180, 190);
  drawNutrientBar(pdf, 70, 190, soilData.Mn || 0, 50, mnAdequate);
  
  // SEÇÃO 5: Recomendações de Fertilizantes (Tabela)
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Recomendações de Fertilizantes', 15, 205);
  
  // Preparar as recomendações de fertilizantes
  const recommendedFertilizers: any[] = [];
  
  // Adicionar recomendações baseadas nas análises
  if (caLevel === "Baixo") {
    recommendedFertilizers.push([
      'Calcário Dolomítico', 
      `${formatNumber((soilData.Ca ? (3.0 - soilData.Ca) * 2000 : 2000) / 10)} t/ha`, 
      'A lanço', 
      '60-90 dias antes do plantio'
    ]);
  }
  
  if (pLevel === "Baixo") {
    recommendedFertilizers.push([
      'Superfosfato Simples', 
      `${formatNumber((soilData.P ? (15 - soilData.P) * 30 : 400))} kg/ha`, 
      'Sulco', 
      'Plantio'
    ]);
  }
  
  if (kLevel === "Baixo") {
    recommendedFertilizers.push([
      'Cloreto de Potássio', 
      `${formatNumber((kCmolc ? (0.15 - kCmolc) * 1000 : 150))} kg/ha`, 
      'Incorporado', 
      'Plantio/Cobertura'
    ]);
  }
  
  if (mgLevel === "Baixo") {
    recommendedFertilizers.push([
      'Sulfato de Magnésio', 
      `${formatNumber((soilData.Mg ? (0.8 - soilData.Mg) * 500 : 200))} kg/ha`, 
      'A lanço', 
      'Pré-plantio'
    ]);
  }
  
  // Se houver deficiências de micronutrientes, adicionar recomendações
  if (bLevel === "Baixo" || znLevel === "Baixo" || cuLevel === "Baixo" || mnLevel === "Baixo") {
    recommendedFertilizers.push([
      'Mix de Micronutrientes', 
      '20 kg/ha', 
      'Foliar', 
      'Desenvolvimento inicial'
    ]);
  }
  
  // Se não houver recomendações, adicionar uma mensagem
  if (recommendedFertilizers.length === 0) {
    recommendedFertilizers.push([
      'Níveis adequados', 
      'Manutenção', 
      'Conforme necessário', 
      'Conforme manejo'
    ]);
  }
  
  // Gerar a tabela de recomendações
  autoTable(pdf, {
    head: [['Fonte de Fertilizante', 'Quantidade', 'Método', 'Época']],
    body: recommendedFertilizers,
    startY: 210,
    theme: 'grid',
    headStyles: { 
      fillColor: greenColor, 
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: { 
      fillColor: [240, 248, 240] 
    },
    styles: {
      fontSize: 9
    },
    margin: { left: 15, right: 15 }
  });
  
  // SEÇÃO 6: Notas e Recomendações Especiais
  const finalY = (pdf as any).lastAutoTable.finalY + 10;
  
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Notas e Recomendações Especiais', 15, finalY);
  
  // Lista de recomendações personalizadas
  const notes = [
    '• Aplicar os micronutrientes em deficiência via foliar nos estágios iniciais',
    '• Considerar o parcelamento da adubação potássica em solos arenosos',
    '• Monitorar os níveis de pH após a calagem para verificar a efetividade',
    `• Para essa cultura, atenção especial aos níveis de ${znLevel === "Baixo" ? 'zinco' : bLevel === "Baixo" ? 'boro' : 'micronutrientes'}`,
    '• As recomendações são baseadas no método de Saturação por Bases',
    '• Consulte um engenheiro agrônomo para validação das recomendações'
  ];
  
  // Exibir as notas em duas colunas
  pdf.setFontSize(9);
  let yPos = finalY + 10;
  const middleIndex = Math.ceil(notes.length / 2);
  
  // Primeira coluna
  for (let i = 0; i < middleIndex; i++) {
    pdf.text(notes[i], 15, yPos);
    yPos += 7;
  }
  
  // Segunda coluna
  yPos = finalY + 10;
  for (let i = middleIndex; i < notes.length; i++) {
    pdf.text(notes[i], 105, yPos);
    yPos += 7;
  }
}

/**
 * Gera a segunda página do relatório
 */
function generatePage2(pdf: jsPDF, soilData: SoilData, results: CalculationResult, cultureName?: string) {
  // Adicionar nova página
  pdf.addPage();
  
  // Cores principais
  const greenColor: [number, number, number] = [76, 175, 80]; // #4CAF50 - corrigido para o tipo [number, number, number]
  
  // Título da página
  pdf.setFillColor(greenColor[0], greenColor[1], greenColor[2]);
  pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 20, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text('Detalhes da Recomendação de Fertilizantes', 15, 13);
  
  // Tabela Completa de Fertilizantes
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Tabela Completa de Fertilizantes', 15, 30);
  
  // Preparar dados para a tabela completa de fertilizantes
  const fertilizerRows: any[] = [];
  
  // CALCÁRIOS
  // Calcário Dolomítico
  const necessidadeCa = soilData.Ca < 3.0 ? (3.0 - soilData.Ca) * 2000 / 10 : 0;
  if (necessidadeCa > 0) {
    fertilizerRows.push([
      'Calcário Dolomítico', 
      formatNumber(necessidadeCa * 1000), 
      'kg/ha', 
      'A lanço', 
      'Pré-plantio'
    ]);
  }
  
  // Calcário Calcítico
  const necessidadeCaCalcitico = soilData.Ca < 3.0 ? (3.0 - soilData.Ca) * 1500 / 10 : 0;
  if (necessidadeCaCalcitico > 0) {
    fertilizerRows.push([
      'Calcário Calcítico', 
      formatNumber(necessidadeCaCalcitico * 1000), 
      'kg/ha', 
      'A lanço', 
      'Pré-plantio'
    ]);
  }
  
  // NITROGÊNIO
  // Ureia (45% N)
  fertilizerRows.push([
    'Ureia (45% N)', 
    formatNumber(150), 
    'kg/ha', 
    'Cobertura', 
    'V4-V6'
  ]);
  
  // Sulfato de Amônio (21% N)
  fertilizerRows.push([
    'Sulfato de Amônio (21% N)', 
    formatNumber(200), 
    'kg/ha', 
    'Cobertura', 
    'V6-V8'
  ]);
  
  // FÓSFORO
  // Superfosfato Simples
  const necessidadeP = soilData.P < 15 ? (15 - soilData.P) * 30 : 0;
  if (necessidadeP > 0) {
    fertilizerRows.push([
      'Superfosfato Simples', 
      formatNumber(necessidadeP), 
      'kg/ha', 
      'Sulco', 
      'Plantio'
    ]);
  }
  
  // Superfosfato Triplo
  const necessidadePST = soilData.P < 15 ? (15 - soilData.P) * 15 : 0;
  if (necessidadePST > 0) {
    fertilizerRows.push([
      'Superfosfato Triplo', 
      formatNumber(necessidadePST), 
      'kg/ha', 
      'Sulco', 
      'Plantio'
    ]);
  }
  
  // MAP
  const necessidadePMAP = soilData.P < 15 ? (15 - soilData.P) * 12 : 0;
  if (necessidadePMAP > 0) {
    fertilizerRows.push([
      'MAP', 
      formatNumber(necessidadePMAP), 
      'kg/ha', 
      'Sulco', 
      'Plantio'
    ]);
  }
  
  // POTÁSSIO
  // Cloreto de Potássio
  const kCmolc = (soilData.K || 0) / 390;
  const necessidadeK = kCmolc < 0.15 ? (0.15 - kCmolc) * 1000 : 0;
  if (necessidadeK > 0) {
    fertilizerRows.push([
      'Cloreto de Potássio', 
      formatNumber(necessidadeK), 
      'kg/ha', 
      'Sulco', 
      'Plantio'
    ]);
  }
  
  // Sulfato de Potássio
  const necessidadeKSO4 = kCmolc < 0.15 ? (0.15 - kCmolc) * 1200 : 0;
  if (necessidadeKSO4 > 0) {
    fertilizerRows.push([
      'Sulfato de Potássio', 
      formatNumber(necessidadeKSO4), 
      'kg/ha', 
      'Sulco', 
      'Plantio'
    ]);
  }
  
  // NPK
  // 04-14-08
  fertilizerRows.push([
    'NPK 04-14-08', 
    formatNumber(300), 
    'kg/ha', 
    'Sulco', 
    'Plantio'
  ]);
  
  // 10-10-10
  fertilizerRows.push([
    'NPK 10-10-10', 
    formatNumber(300), 
    'kg/ha', 
    'Sulco', 
    'Plantio'
  ]);
  
  // MICRONUTRIENTES
  // Boro
  const bLevel = getNutrientLevel(soilData.B, 0.3, 0.6);
  if (bLevel === "Baixo") {
    fertilizerRows.push([
      'Ácido Bórico', 
      formatNumber(15), 
      'kg/ha', 
      'Foliar', 
      'Desenvolvimento inicial'
    ]);
    
    fertilizerRows.push([
      'Borax', 
      formatNumber(20), 
      'kg/ha', 
      'Foliar', 
      'Desenvolvimento inicial'
    ]);
  }
  
  // Zinco
  const znLevel = getNutrientLevel(soilData.Zn, 1.5, 2.2);
  if (znLevel === "Baixo") {
    fertilizerRows.push([
      'Sulfato de Zinco', 
      formatNumber(15), 
      'kg/ha', 
      'Foliar', 
      'Desenvolvimento inicial'
    ]);
    
    fertilizerRows.push([
      'Óxido de Zinco', 
      formatNumber(8), 
      'kg/ha', 
      'Foliar', 
      'Desenvolvimento inicial'
    ]);
  }
  
  // Cobre
  const cuLevel = getNutrientLevel(soilData.Cu, 0.8, 1.2);
  if (cuLevel === "Baixo") {
    fertilizerRows.push([
      'Sulfato de Cobre', 
      formatNumber(10), 
      'kg/ha', 
      'Foliar', 
      'Desenvolvimento inicial'
    ]);
    
    fertilizerRows.push([
      'Óxido de Cobre', 
      formatNumber(5), 
      'kg/ha', 
      'Foliar', 
      'Desenvolvimento inicial'
    ]);
  }
  
  // Manganês
  const mnLevel = getNutrientLevel(soilData.Mn, 5, 30);
  if (mnLevel === "Baixo") {
    fertilizerRows.push([
      'Sulfato de Manganês', 
      formatNumber(12), 
      'kg/ha', 
      'Foliar', 
      'Desenvolvimento inicial'
    ]);
    
    fertilizerRows.push([
      'Óxido de Manganês', 
      formatNumber(8), 
      'kg/ha', 
      'Foliar', 
      'Desenvolvimento inicial'
    ]);
  }
  
  // Molibdênio
  fertilizerRows.push([
    'Molibdato de Sódio', 
    formatNumber(0.5), 
    'kg/ha', 
    'Tratamento de sementes', 
    'Plantio'
  ]);
  
  // MATÉRIA ORGÂNICA
  fertilizerRows.push([
    'Esterco Bovino Curtido', 
    formatNumber(5000), 
    'kg/ha', 
    'Incorporado', 
    'Pré-plantio'
  ]);
  
  fertilizerRows.push([
    'Composto Orgânico', 
    formatNumber(3000), 
    'kg/ha', 
    'Incorporado', 
    'Pré-plantio'
  ]);
  
  // Adicionar tabela ao PDF
  autoTable(pdf, {
    head: [['Fertilizante', 'Quantidade', 'Unidade', 'Método', 'Estágio']],
    body: fertilizerRows,
    startY: 35,
    theme: 'grid',
    headStyles: { 
      fillColor: greenColor, 
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: { 
      fillColor: [240, 248, 240] 
    },
    styles: {
      fontSize: 9
    },
    margin: { left: 15, right: 15 }
  });
}

/**
 * Gera a terceira página do relatório
 */
function generatePage3(pdf: jsPDF, soilData: SoilData, results: CalculationResult) {
  // Adicionar nova página
  pdf.addPage();
  
  // Cores principais
  const greenColor: [number, number, number] = [76, 175, 80]; // #4CAF50
  
  // Título da página
  pdf.setFillColor(greenColor[0], greenColor[1], greenColor[2]);
  pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 20, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text('Análise Detalhada de Nutrientes', 15, 13);
  
  // Título da tabela
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Tabela de Análise Completa', 15, 30);
  
  // Converter valores e preparar interpretações
  const kCmolc = (soilData.K || 0) / 390;
  
  // Interpretações e recomendações
  const CTCLevel = soilData.T < 5 ? "Baixa" : soilData.T < 10 ? "Adequada" : "Alta";
  const CTCRec = "CTC ideal: 8-12 cmolc/dm³";
  
  const PLevel = soilData.P < 10 ? "Baixo" : soilData.P < 20 ? "Adequado" : "Alto";
  const PRec = PLevel === "Baixo" ? "Aplicação de fontes de fósforo" : "Manutenção";
  
  const KLevel = kCmolc < 0.15 ? "Baixo" : kCmolc < 0.3 ? "Adequado" : "Alto";
  const KRec = KLevel === "Baixo" ? "Aplicação de fontes de potássio" : "Manutenção";
  
  const CaLevel = soilData.Ca < 2 ? "Baixo" : soilData.Ca < 4 ? "Adequado" : "Alto";
  const CaRec = CaLevel === "Baixo" ? "Aplicação de calcário" : "Manutenção";
  
  const MgLevel = soilData.Mg < 0.5 ? "Baixo" : soilData.Mg < 1 ? "Adequado" : "Alto";
  const MgRec = MgLevel === "Baixo" ? "Aplicação de fontes de magnésio" : "Manutenção";
  
  const SLevel = soilData.S < 5 ? "Baixo" : soilData.S < 10 ? "Adequado" : "Alto";
  const SRec = SLevel === "Alto" ? "Adequado" : "Aplicação de fontes de enxofre";
  
  const BLevel = soilData.B < 0.3 ? "Baixo" : soilData.B < 0.6 ? "Adequado" : "Alto";
  const BRec = BLevel === "Baixo" ? "Aplicar 2-3 kg/ha de Boro" : "Manutenção";
  
  const CuLevel = soilData.Cu < 0.8 ? "Baixo" : soilData.Cu < 1.2 ? "Adequado" : "Alto";
  const CuRec = CuLevel === "Baixo" ? "Aplicar 1-2 kg/ha de Cobre" : "Manutenção";
  
  const FeLevel = soilData.Fe < 5 ? "Baixo" : soilData.Fe < 30 ? "Adequado" : "Alto";
  const FeRec = FeLevel === "Baixo" ? "Aplicar 4-6 kg/ha de Ferro" : "Manutenção";
  
  const MnLevel = soilData.Mn < 5 ? "Baixo" : soilData.Mn < 30 ? "Adequado" : "Alto";
  const MnRec = MnLevel === "Baixo" ? "Aplicar 3-5 kg/ha de Manganês" : "Manutenção";
  
  const ZnLevel = soilData.Zn < 1.5 ? "Baixo" : soilData.Zn < 2.2 ? "Adequado" : "Alto";
  const ZnRec = ZnLevel === "Baixo" ? "Aplicar 3-6 kg/ha de Zinco" : "Manutenção";
  
  // Dados para a tabela completa de análise
  const tableRows = [
    ["CTC (T)", formatNumber(soilData.T), "cmolc/dm³", CTCLevel, CTCRec],
    ["Fósforo (P)", formatNumber(soilData.P), "mg/dm³", PLevel, PRec],
    ["Potássio (K)", formatNumber(kCmolc), "cmolc/dm³", KLevel, KRec],
    ["Cálcio (Ca)", formatNumber(soilData.Ca), "cmolc/dm³", CaLevel, CaRec],
    ["Magnésio (Mg)", formatNumber(soilData.Mg), "cmolc/dm³", MgLevel, MgRec],
    ["Enxofre (S)", formatNumber(soilData.S), "mg/dm³", SLevel, SRec],
    ["Boro (B)", formatNumber(soilData.B), "mg/dm³", BLevel, BRec],
    ["Cobre (Cu)", formatNumber(soilData.Cu), "mg/dm³", CuLevel, CuRec],
    ["Ferro (Fe)", formatNumber(soilData.Fe), "mg/dm³", FeLevel, FeRec],
    ["Manganês (Mn)", formatNumber(soilData.Mn), "mg/dm³", MnLevel, MnRec],
    ["Zinco (Zn)", formatNumber(soilData.Zn), "mg/dm³", ZnLevel, ZnRec],
    ["Molibdênio (Mo)", "-", "mg/dm³", "Não analisado", "Aplicação preventiva recomendada"]
  ];
  
  // Gerar a tabela de análise completa
  autoTable(pdf, {
    head: [["Nutriente", "Valor Encontrado", "Unidade", "Nível", "Recomendação"]],
    body: tableRows,
    startY: 35,
    theme: 'grid',
    headStyles: { 
      fillColor: greenColor, 
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: { 
      fillColor: [240, 248, 240] 
    },
    styles: {
      fontSize: 9
    },
    margin: { left: 15, right: 15 }
  });
  
  // Observações Importantes sobre Manejo de Nutrientes
  const finalY = (pdf as any).lastAutoTable.finalY + 10;
  
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Observações Importantes sobre Manejo de Nutrientes', 15, finalY);
  
  // Lista de observações importantes
  const observations = [
    '• Aplicar calcário de 60 a 90 dias antes do plantio para correção do solo',
    '• Os micronutrientes são essenciais para o desenvolvimento completo das plantas',
    '• Parcelar a adubação nitrogenada em 2-3 aplicações para maior eficiência',
    '• Realizar análise foliar no florescimento para ajustes na adubação',
    '• Considerar o uso de inoculantes para leguminosas',
    '• Monitorar a acidez do solo a cada 2 anos para ajuste no manejo',
    '• Para culturas perenes, parcelar as adubações ao longo do ciclo'
  ];
  
  // Exibir as observações
  pdf.setFontSize(9);
  let yPos = finalY + 10;
  
  observations.forEach(obs => {
    pdf.text(obs, 15, yPos);
    yPos += 7;
  });
}

/**
 * Adiciona rodapés a todas as páginas do relatório
 */
function addFooters(pdf: jsPDF) {
  const pageCount = pdf.getNumberOfPages();
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Fertilisolo - Análise e recomendação de fertilizantes        Página ${i}/${pageCount}`, 15, 285);
    pdf.text(`Relatório gerado por sistema especialista    Contato: suporte@fertilisolo.com.br`, 15, 290);
  }
}

/**
 * Desenha uma barra de progresso visual para representar o nível de um nutriente
 */
function drawProgressBar(pdf: jsPDF, label: string, value: number | undefined, max: number, posY: number, isAdequate: boolean = false) {
  if (value === undefined) value = 0;
  
  // Valores para cores
  const greenColor = [76, 175, 80]; // #4CAF50
  const grayColor = [224, 224, 224]; // #E0E0E0
  
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(grayColor[0], grayColor[1], grayColor[2]);
  pdf.roundedRect(80, posY - 3, 80, 6, 2, 2, 'F');
  
  const color = isAdequate ? greenColor : grayColor;
  pdf.setFillColor(color[0], color[1], color[2]);
  const width = Math.min(80, (value / max) * 80);
  if (width > 0) {
    pdf.roundedRect(80, posY - 3, width, 6, 2, 2, 'F');
  }
  
  pdf.setTextColor(0, 0, 0);
  pdf.text(label, 15, posY);
  pdf.text(`${formatNumber(value)}`, 170, posY);
}

/**
 * Desenha uma barra de progresso para um nutriente
 */
function drawNutrientBar(pdf: jsPDF, x: number, y: number, value: number, max: number, isAdequate: boolean) {
  // Cores
  const greenColor: [number, number, number] = [76, 175, 80]; // #4CAF50
  const grayColor: [number, number, number] = [224, 224, 224]; // #E0E0E0
  
  // Desenhar o fundo da barra
  pdf.setFillColor(grayColor[0], grayColor[1], grayColor[2]);
  pdf.roundedRect(x, y - 4, 100, 5, 1, 1, 'F');
  
  // Desenhar a barra de progresso
  const width = Math.min(100, (value / max) * 100);
  if (width > 0) {
    pdf.setFillColor(isAdequate ? greenColor[0] : grayColor[0], isAdequate ? greenColor[1] : grayColor[1], isAdequate ? greenColor[2] : grayColor[2]);
    pdf.roundedRect(x, y - 4, width, 5, 1, 1, 'F');
  }
}

export default generateFertilisoloReport; 