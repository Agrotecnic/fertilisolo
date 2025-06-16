import { SoilData, CalculationResult } from '@/types/soilAnalysis';
import { calculateFertilizerRecommendations } from './soilCalculations';
import { formatNumber, formatNumberOptional } from './numberFormat';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { 
  interpretarFosforo, 
  calcularRecomendacaoP, 
  determinarClasseArgila, 
  getTexturaClasseArgila 
} from './soilCalculations';

// Estendendo o jsPDF com autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Função para determinar o nível de um nutriente
 */
function getNutrientLevel(value: number | undefined, lowThreshold: number, highThreshold: number): string {
  if (value === undefined) return "Não analisado";
  if (value < lowThreshold) return "Baixo";
  if (value > highThreshold) return "Alto";
  return "Adequado";
}

/**
 * Função para gerar recomendação de micronutrientes
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

// Interface para recomendações de fertilizantes
interface FertilizerRec {
  name: string;
  amount: number;
  unit: string;
  application_method?: string;
  stage?: string;
}

// Renderizar modelo de relatório em elemento HTML para capturar com html2canvas
const renderReportTemplate = (soilData: SoilData, results: CalculationResult) => {
  // Criar um container temporário
  const container = document.createElement('div');
  container.id = 'temp-report-container';
  container.className = 'bg-white p-6 rounded-lg shadow-md space-y-4';
  container.style.width = '800px';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  
  // Cabeçalho
  const header = document.createElement('div');
  header.className = 'flex justify-between items-center border-b border-green-200 pb-3';
  header.innerHTML = `
    <div>
      <h2 class="text-xl font-bold text-green-700">Fertilisolo</h2>
      <p class="text-sm text-gray-500">Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
    </div>
    <div class="text-right">
      <h3 class="font-medium">${soilData.location || "Não especificado"}</h3>
      <p class="text-sm text-gray-600">${soilData.location || "Não especificado"}</p>
      <p class="text-sm text-gray-600">Data da coleta: ${soilData.date ? new Date(soilData.date).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}</p>
    </div>
  `;
  
  // Informações da cultura e aviso sobre opções (layout melhorado em duas colunas)
  const topSection = document.createElement('div');
  topSection.className = 'grid grid-cols-1 md:grid-cols-3 gap-3 mt-3';
  
  // Coluna 1: Detalhes básicos
  topSection.innerHTML = `
    <div class="bg-green-50 p-3 rounded-md">
      <h4 class="font-medium text-green-800 border-b border-green-200 pb-1 mb-2">Detalhes</h4>
      <div class="space-y-2">
        <div class="flex justify-between">
          <span class="text-gray-600">Cultura:</span>
          <span class="font-medium">${"Não especificada"}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Matéria Orgânica:</span>
          <span class="font-medium">${soilData.organicMatter || 0}%</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Argila:</span>
          <span class="font-medium">${soilData.argila || 0}%</span>
        </div>
      </div>
    </div>
    
    <!-- Macronutrientes primários -->
    <div class="bg-green-50 p-3 rounded-md">
      <h4 class="font-medium text-green-800 border-b border-green-200 pb-1 mb-2">Macronutrientes</h4>
      <div class="space-y-2">
        <div class="flex justify-between">
          <span class="text-gray-600">CTC (T):</span>
          <span class="font-medium">${soilData.T || 0} cmolc/dm³</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Fósforo (P):</span>
          <span class="font-medium">${soilData.P || 0} mg/dm³</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Potássio (K):</span>
          <span class="font-medium">${(soilData.K ? (soilData.K / 390).toFixed(3) : 0)} cmolc/dm³</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Cálcio (Ca):</span>
          <span class="font-medium">${soilData.Ca || 0} cmolc/dm³</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Magnésio (Mg):</span>
          <span class="font-medium">${soilData.Mg || 0} cmolc/dm³</span>
        </div>
      </div>
    </div>
    
    <!-- Aviso sobre as opções - mais compacto -->
    <div class="bg-blue-50 p-3 rounded-md border border-blue-200">
      <h4 class="font-medium text-blue-800 border-b border-blue-100 pb-1 mb-2">Informação Importante</h4>
      <div class="text-sm text-blue-700">
        <p class="mb-1"><strong>Opções de Correção:</strong> As fontes de nutrientes listadas são <strong>alternativas</strong>.</p>
        <p>Escolha <strong>apenas uma fonte</strong> para cada tipo de nutriente com base na disponibilidade, custo e benefícios adicionais.</p>
      </div>
    </div>
  `;
  
  // Seção de análise visual de necessidades - redesenhada para ser mais compacta
  const visualAnalysis = document.createElement('div');
  visualAnalysis.className = 'bg-white p-3 rounded-md border border-gray-200 mt-3';
  visualAnalysis.innerHTML = `
    <h3 class="text-lg font-semibold text-green-700 mb-3">Análise Visual de Necessidades</h3>
    
    <div class="grid grid-cols-2 gap-3">
      <!-- Coluna Macronutrientes -->
      <div>
        <h4 class="font-medium text-green-800 mb-2">Macronutrientes</h4>
        <div class="space-y-2">
          <!-- Barra de Fósforo -->
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-xs font-medium text-gray-700">Fósforo (P)</span>
              <span class="text-xs font-medium text-gray-700">
                ${getNutrientLevel(soilData.P, 10, 20)}
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-600 h-2 rounded-full" style="width: ${Math.min(100, ((soilData.P || 0) / 30) * 100)}%"></div>
            </div>
          </div>
          
          <!-- Barra de Potássio -->
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-xs font-medium text-gray-700">Potássio (K)</span>
              <span class="text-xs font-medium text-gray-700">
                ${getNutrientLevel(soilData.K, 0.15, 0.3)}
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-600 h-2 rounded-full" style="width: ${Math.min(100, ((soilData.K || 0) / 0.5) * 100)}%"></div>
            </div>
          </div>
          
          <!-- Barra de Cálcio -->
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-xs font-medium text-gray-700">Cálcio (Ca)</span>
              <span class="text-xs font-medium text-gray-700">
                ${getNutrientLevel(soilData.Ca, 2.0, 4.0)}
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-600 h-2 rounded-full" style="width: ${Math.min(100, ((soilData.Ca || 0) / 6) * 100)}%"></div>
            </div>
          </div>

          <!-- Barra de Magnésio -->
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-xs font-medium text-gray-700">Magnésio (Mg)</span>
              <span class="text-xs font-medium text-gray-700">
                ${getNutrientLevel(soilData.Mg, 0.8, 1.5)}
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-600 h-2 rounded-full" style="width: ${Math.min(100, ((soilData.Mg || 0) / 2) * 100)}%"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Coluna Micronutrientes -->
      <div>
        <h4 class="font-medium text-green-800 mb-2">Micronutrientes</h4>
        <div class="space-y-2">
          <!-- Barra de Boro -->
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-xs font-medium text-gray-700">Boro (B)</span>
              <span class="text-xs font-medium text-gray-700">
                ${getNutrientLevel(soilData.B, 0.3, 0.6)}
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-600 h-2 rounded-full" style="width: ${Math.min(100, ((soilData.B || 0) / 1) * 100)}%"></div>
            </div>
          </div>
          
          <!-- Barra de Zinco -->
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-xs font-medium text-gray-700">Zinco (Zn)</span>
              <span class="text-xs font-medium text-gray-700">
                ${getNutrientLevel(soilData.Zn, 1.5, 2.2)}
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-600 h-2 rounded-full" style="width: ${Math.min(100, ((soilData.Zn || 0) / 3) * 100)}%"></div>
            </div>
          </div>

          <!-- Barra de Cobre -->
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-xs font-medium text-gray-700">Cobre (Cu)</span>
              <span class="text-xs font-medium text-gray-700">
                ${getNutrientLevel(soilData.Cu, 0.8, 1.2)}
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-600 h-2 rounded-full" style="width: ${Math.min(100, ((soilData.Cu || 0) / 2.5) * 100)}%"></div>
            </div>
          </div>
          
          <!-- Barra de Manganês -->
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-xs font-medium text-gray-700">Manganês (Mn)</span>
              <span class="text-xs font-medium text-gray-700">
                ${getNutrientLevel(soilData.Mn, 5, 30)}
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-600 h-2 rounded-full" style="width: ${Math.min(100, ((soilData.Mn || 0) / 50) * 100)}%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Seção de recomendações de fertilizantes - mais compacta
  const recommendations = document.createElement('div');
  recommendations.className = 'mt-3';
  recommendations.innerHTML = `
    <h3 class="text-lg font-semibold text-green-700 mb-2">Recomendações de Fertilizantes</h3>
    
    <table class="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
      <thead class="bg-green-50">
        <tr>
          <th scope="col" class="px-3 py-2 text-left text-sm font-medium text-gray-700">Fonte de Fertilizante</th>
          <th scope="col" class="px-3 py-2 text-left text-sm font-medium text-gray-700">Quantidade</th>
          <th scope="col" class="px-3 py-2 text-left text-sm font-medium text-gray-700">Método</th>
          <th scope="col" class="px-3 py-2 text-left text-sm font-medium text-gray-700">Época</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200 text-sm">
        ${soilData.Ca < 3 ? `
        <tr class="bg-blue-50 bg-opacity-30">
          <td class="px-3 py-2 whitespace-nowrap font-medium text-gray-900">Calcário Dolomítico</td>
          <td class="px-3 py-2 whitespace-nowrap text-gray-700">2.5 t/ha</td>
          <td class="px-3 py-2 whitespace-nowrap text-gray-700">A lanço</td>
          <td class="px-3 py-2 whitespace-nowrap text-gray-700">60-90 dias antes do plantio</td>
        </tr>` : ''}
        ${soilData.P < 12 ? `
        <tr class="bg-white">
          <td class="px-3 py-2 whitespace-nowrap font-medium text-gray-900">Superfosfato Simples</td>
          <td class="px-3 py-2 whitespace-nowrap text-gray-700">400 kg/ha</td>
          <td class="px-3 py-2 whitespace-nowrap text-gray-700">Sulco</td>
          <td class="px-3 py-2 whitespace-nowrap text-gray-700">Plantio</td>
        </tr>` : ''}
        ${soilData.K < 80 ? `
        <tr class="bg-blue-50 bg-opacity-30">
          <td class="px-3 py-2 whitespace-nowrap font-medium text-gray-900">Cloreto de Potássio</td>
          <td class="px-3 py-2 whitespace-nowrap text-gray-700">150 kg/ha</td>
          <td class="px-3 py-2 whitespace-nowrap text-gray-700">Incorporado</td>
          <td class="px-3 py-2 whitespace-nowrap text-gray-700">Plantio/Cobertura</td>
        </tr>` : ''}
        ${soilData.Mg < 1 ? `
        <tr class="bg-white">
          <td class="px-3 py-2 whitespace-nowrap font-medium text-gray-900">Sulfato de Magnésio</td>
          <td class="px-3 py-2 whitespace-nowrap text-gray-700">200 kg/ha</td>
          <td class="px-3 py-2 whitespace-nowrap text-gray-700">A lanço</td>
          <td class="px-3 py-2 whitespace-nowrap text-gray-700">Pré-plantio</td>
        </tr>` : ''}
      </tbody>
    </table>
  `;
  
  // Notas e recomendações especiais - mais compacta
  const notes = document.createElement('div');
  notes.className = 'bg-green-50 p-3 rounded-md mt-3';
  notes.innerHTML = `
    <h3 class="text-md font-semibold text-green-700 mb-2">Notas e Recomendações Especiais</h3>
    <div class="grid grid-cols-2 gap-2">
      <div>
        <ul class="list-disc pl-5 space-y-1 text-xs text-gray-700">
          <li>Aplicar os micronutrientes em deficiência via foliar nos estágios iniciais</li>
          <li>Considerar o parcelamento da adubação potássica em solos arenosos</li>
          <li>Monitorar os níveis de pH após a calagem para verificar a efetividade</li>
        </ul>
      </div>
      <div>
        <ul class="list-disc pl-5 space-y-1 text-xs text-gray-700">
          <li>Para essa cultura, atenção especial aos níveis de ${soilData.Zn && soilData.Zn < 1.5 ? 'zinco' : soilData.B && soilData.B < 0.3 ? 'boro' : 'micronutrientes'}</li>
          <li>As recomendações são baseadas no método de Saturação por Bases</li>
          <li>Consulte um engenheiro agrônomo para validação das recomendações</li>
        </ul>
      </div>
    </div>
  `;
  
  // Rodapé
  const footer = document.createElement('div');
  footer.className = 'border-t border-green-100 pt-2 mt-3 text-xs text-gray-500 flex justify-between';
  footer.innerHTML = `
    <div>
      <p>Fertilisolo - Análise e recomendação de fertilizantes</p>
      <p>Relatório gerado por sistema especialista</p>
    </div>
    <div class="text-right">
      <p>Página 1/3</p>
      <p>Contato: suporte@fertilisolo.com.br</p>
    </div>
  `;
  
  // Montar o template
  container.appendChild(header);
  container.appendChild(topSection);
  container.appendChild(visualAnalysis);
  container.appendChild(recommendations);
  container.appendChild(notes);
  container.appendChild(footer);
  
  document.body.appendChild(container);
  
  return container;
};

export const generatePDFReport = async (soilData: SoilData, results: CalculationResult, cultureName?: string) => {
  try {
    // Usar a função generatePDF que já tem todas as páginas incluindo a primeira
    const { pdf, filename } = generatePDF(soilData, undefined, undefined, cultureName);
    pdf.save(filename);
    
    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return false;
  }
};

// Funções auxiliares para interpretação dos resultados
function getMatterLevel(value: number | undefined): string {
  if (value === undefined) return "Não analisado";
  if (value < 1.5) return "Muito Baixo";
  if (value < 3.0) return "Baixo";
  if (value < 6.0) return "Médio";
  return "Alto";
}

function getClayLevel(value: number | undefined): string {
  if (value === undefined) return "Não analisado";
  if (value < 15) return "Arenoso";
  if (value < 35) return "Médio";
  if (value < 60) return "Argiloso";
  return "Muito Argiloso";
}

function getCTCLevel(value: number | undefined): string {
  if (value === undefined) return "Não analisado";
  if (value < 5) return "Muito Baixa";
  if (value < 10) return "Baixa";
  if (value < 15) return "Média";
  return "Alta";
}

export const generatePDF = (soilData: SoilData, farmName?: string, plotName?: string, cultureName?: string) => {
  try {
    const pdf = new jsPDF();
    
    // Configurações do PDF
    pdf.setProperties({
      title: 'Relatório de Análise de Solo - Fertilisolo',
      author: 'Fertilisolo',
      subject: 'Análise e Recomendação de Fertilizantes',
      keywords: 'solo, fertilizantes, análise, agricultura'
    });

    // ======================= PÁGINA 1 - ANÁLISE PRINCIPAL - MODELO FERTILISOLO =======================
    
    // Margens e dimensões da página
    const marginX = 15;
    const marginY = 15;
    const pageWidth = 210; // A4 width in mm
    const contentWidth = pageWidth - (marginX * 2);
    
    // Marca d'água "FERTILISOLO" no canto superior direito
    pdf.setTextColor(200, 200, 200); // Cinza claro
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FERTILISOLO', pageWidth - marginX - 35, marginY + 8);

    // Header Superior conforme modelo Fertilisolo
    pdf.setTextColor(51, 51, 51); // #333333
    pdf.setFontSize(18); // 18pt negrito
    pdf.setFont('helvetica', 'bold');
    pdf.text('Fertilisolo', marginX, marginY + 10);
    
    // Subtítulo (cinza)
    pdf.setTextColor(102, 102, 102); // #666666
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`, marginX, marginY + 18);
    
    // Canto superior direito - ajustado para não estrapolar
    pdf.setTextColor(51, 51, 51);
    pdf.setFontSize(10);
    const locationText = `${farmName || soilData.location || "Não especificado"}`;
    const dateText = `Data da coleta: ${soilData.date ? new Date(soilData.date).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}`;
    
    // Centralizar texto no espaço disponível (até onde começa o logo)
    const rightSectionX = 120;
    pdf.text(locationText, rightSectionX, marginY + 10);
    pdf.text(dateText, rightSectionX, marginY + 18);

    // Seção 1: Layout de 3 Colunas (Y = 40) - larguras ajustadas
    const colY = 40;
    const colHeight = 50;
    const col1Width = 52;
    const col2Width = 58;
    const col3Width = 52;
    const gap = 3;
    
    // Coluna 1 - Detalhes (Verde claro #E8F5E8)
    pdf.setFillColor(232, 245, 232);
    pdf.rect(marginX, colY, col1Width, colHeight, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(marginX, colY, col1Width, colHeight, 'S');
    
    // Título da coluna 1
    pdf.setTextColor(51, 51, 51);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detalhes', marginX + 3, colY + 10);
    
    // Conteúdo da coluna 1 - ajustado para não ultrapassar limites
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    
    // Cultura com quebra de linha se necessário
    pdf.text('Cultura:', marginX + 2, colY + 16);
    const culturaText = cultureName || "Não especificada";
    if (culturaText.length > 15) {
      // Quebra texto longo em duas linhas
      const palavras = culturaText.split(' ');
      const linha1 = palavras.slice(0, Math.ceil(palavras.length / 2)).join(' ');
      const linha2 = palavras.slice(Math.ceil(palavras.length / 2)).join(' ');
      pdf.text(linha1, marginX + 2, colY + 23);
      pdf.text(linha2, marginX + 2, colY + 29);
    } else {
      pdf.text(culturaText, marginX + 2, colY + 23);
    }
    
    // Matéria Orgânica
    pdf.text('Mat. Orgânica:', marginX + 2, colY + 36);
    pdf.text(`${(soilData.organicMatter || 0).toFixed(1)}%`, marginX + 2, colY + 42);
    
    // Argila
    pdf.text('Argila:', marginX + 2, colY + 48);
    pdf.text(`${(soilData.argila || 0).toFixed(0)}%`, marginX + 2, colY + 54);
    
    // Coluna 2 - Macronutrientes (Verde claro #E8F5E8)
    const col2X = marginX + col1Width + gap;
    pdf.setFillColor(232, 245, 232);
    pdf.rect(col2X, colY, col2Width, colHeight, 'F');
    pdf.rect(col2X, colY, col2Width, colHeight, 'S');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Macronutrientes', col2X + 3, colY + 10);
    
    pdf.setFontSize(8); // Reduzido para caber
    pdf.setFont('helvetica', 'normal');
    // Texto mais compacto para caber na coluna
    pdf.text(`CTC: ${formatNumber(soilData.T)}`, col2X + 2, colY + 18);
    pdf.text(`cmolc/dm³`, col2X + 2, colY + 23);
    pdf.text(`P: ${formatNumber(soilData.P)} mg/dm³`, col2X + 2, colY + 30);
    pdf.text(`K: ${formatNumber((soilData.K || 0) / 390)}`, col2X + 2, colY + 37);
    pdf.text(`cmolc/dm³`, col2X + 2, colY + 42);
    pdf.text(`Ca: ${formatNumber(soilData.Ca)}`, col2X + 2, colY + 49);
    pdf.text(`Mg: ${formatNumber(soilData.Mg)}`, col2X + 2, colY + 55);

    // Coluna 3 - Informação Importante (Azul claro #E3F2FD)
    const col3X = col2X + col2Width + gap;
    pdf.setFillColor(227, 242, 253);
    pdf.rect(col3X, colY, col3Width, colHeight, 'F');
    pdf.rect(col3X, colY, col3Width, colHeight, 'S');
    
    pdf.setFontSize(10); // Reduzido
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(51, 51, 51);
    pdf.text('Informação Importante', col3X + 3, colY + 10);
    
    pdf.setFontSize(8); // Reduzido para caber
    pdf.setFont('helvetica', 'normal');
    // Texto mais conciso para caber na coluna
    pdf.text('Opções de Correção:', col3X + 2, colY + 18);
    pdf.text('As fontes listadas são', col3X + 2, colY + 24);
    pdf.text('alternativas.', col3X + 2, colY + 30);
    pdf.text('Escolha APENAS UMA', col3X + 2, colY + 36);
    pdf.text('fonte para cada tipo', col3X + 2, colY + 42);
    pdf.text('de nutriente.', col3X + 2, colY + 48);

    // Seção 2: Análise Visual de Necessidades (Y = 100) - espaçamento corrigido
    let visualY = 100;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(51, 51, 51);
    pdf.text('Análise Visual de Necessidades', marginX, visualY);
    
    visualY += 15;
    
    // Função para desenhar barra - corrigida com cores sempre visíveis
    const drawProgressBar = (label: string, value: number, status: string, posX: number, posY: number) => {
      const barWidth = 40; // Reduzido para caber na página
      const barHeight = 4; // Altura adequada
      
      // Background cinza sempre visível
      pdf.setFillColor(189, 189, 189); // #BDBDBD
      pdf.rect(posX + 35, posY - 2, barWidth, barHeight, 'F');
      
      // Determinar cor e comprimento da barra - sempre com cor
      let fillColor, fillWidth;
      if (status === "Adequado" || status === "Alto") {
        fillColor = [76, 175, 80]; // Verde #4CAF50
        fillWidth = barWidth * 0.85; // 80-100%
      } else if (status === "Médio") {
        fillColor = [255, 193, 7]; // Amarelo
        fillWidth = barWidth * 0.6; // 50-70%
      } else if (status === "Baixo") {
        fillColor = [255, 152, 0]; // Laranja para baixo
        fillWidth = barWidth * 0.3; // 20-40%
      } else { // Muito Baixo
        fillColor = [244, 67, 54]; // Vermelho
        fillWidth = barWidth * 0.15; // 10-20%
      }
      
      // Sempre desenhar barra colorida, mesmo que pequena
      if (fillWidth < 2) fillWidth = 2; // Mínimo visível
      pdf.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
      pdf.rect(posX + 35, posY - 2, fillWidth, barHeight, 'F');
      
      // Label
      pdf.setFontSize(9); // Reduzido
      pdf.setTextColor(51, 51, 51);
      pdf.text(label, posX, posY);
      
      // Status - posicionado corretamente
      pdf.setTextColor(102, 102, 102);
      pdf.text(status, posX + 78, posY);
    };

    // Sub-seção Macronutrientes (lado esquerdo) - espaçamento corrigido
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Macronutrientes', marginX, visualY);
    
    let macroY = visualY + 10;
    drawProgressBar('Fósforo (P)', soilData.P || 0, getNutrientLevel(soilData.P, 10, 20), marginX, macroY);
    macroY += 12;
    drawProgressBar('Potássio (K)', (soilData.K || 0) / 390, getNutrientLevel((soilData.K || 0) / 390, 0.15, 0.3), marginX, macroY);
    macroY += 12;
    drawProgressBar('Cálcio (Ca)', soilData.Ca || 0, getNutrientLevel(soilData.Ca, 2.0, 4.0), marginX, macroY);
    macroY += 12;
    drawProgressBar('Magnésio (Mg)', soilData.Mg || 0, getNutrientLevel(soilData.Mg, 0.8, 1.5), marginX, macroY);

    // Sub-seção Micronutrientes (lado direito) - posicionado corretamente
    const microX = 110; // Posição ajustada para não estrapolar
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Micronutrientes', microX, visualY);
    
    let microY = visualY + 10;
    drawProgressBar('Boro (B)', soilData.B || 0, getNutrientLevel(soilData.B, 0.3, 0.6), microX, microY);
    microY += 12;
    drawProgressBar('Zinco (Zn)', soilData.Zn || 0, getNutrientLevel(soilData.Zn, 1.5, 2.2), microX, microY);
    microY += 12;
    drawProgressBar('Cobre (Cu)', soilData.Cu || 0, getNutrientLevel(soilData.Cu, 0.8, 1.2), microX, microY);
    microY += 12;
    drawProgressBar('Manganês (Mn)', soilData.Mn || 0, getNutrientLevel(soilData.Mn, 15, 30), microX, microY);

    // Seção 3: Recomendações de Fertilizantes (Y = 180)
    let recY = 180;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(51, 51, 51);
    pdf.text('Recomendações de Fertilizantes', marginX, recY);

    const fertilizerColumns = ['Fonte de Fertilizante', 'Quantidade', 'Método', 'Época'];
    const fertilizerRows = [];

    if ((soilData.Ca || 0) < 3) {
      fertilizerRows.push(['Calcário Dolomítico', '2.5 t/ha', 'A lanço', '60-90 dias antes do plantio']);
    }
    if ((soilData.P || 0) < 12) {
      fertilizerRows.push(['Superfosfato Simples', '400 kg/ha', 'Sulco', 'Plantio']);
    }
    if ((soilData.K || 0) < 80) {
      fertilizerRows.push(['Cloreto de Potássio', '150 kg/ha', 'Incorporado', 'Plantio/Cobertura']);
    }

    let tableEndY = recY + 5;
    if (fertilizerRows.length > 0) {
      autoTable(pdf, {
        head: [fertilizerColumns],
        body: fertilizerRows,
        startY: recY + 5,
        theme: 'grid',
        headStyles: { 
          fillColor: [128, 128, 128], // Header cinza
          textColor: [255, 255, 255], 
          fontSize: 10 
        },
        alternateRowStyles: { fillColor: [245, 245, 245] }, // Cinza claro
        styles: { 
          fontSize: 10, 
          cellPadding: 3,
          textColor: [51, 51, 51]
        },
        margin: { left: marginX, right: marginX }
      });
      tableEndY = (pdf as any).lastAutoTable?.finalY + 10;
    }

    // Seção 4: Notas e Recomendações Especiais
    let notesY = Math.max(tableEndY, 220);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(51, 51, 51);
    pdf.text('Notas e Recomendações Especiais', marginX, notesY);

    const specialNotes = [
      '• Aplicar os micronutrientes em deficiência via foliar nos estágios iniciais',
      '• Considerar o parcelamento da adubação potássica em solos arenosos',
      '• Monitorar os níveis de pH após a calagem para verificar a efetividade',
      '• Para essa cultura, atenção especial aos níveis de zinco',
      '• As recomendações são baseadas no método de Saturação por Bases',
      '• Consulte um engenheiro agrônomo para validação das recomendações'
    ];

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(51, 51, 51);
    
    let noteItemY = notesY + 12;
    specialNotes.forEach(note => {
      if (noteItemY < 270) { // Espaço para footer
        pdf.text(note, marginX, noteItemY);
        noteItemY += 6;
      }
    });

    // Footer da Página conforme modelo
    pdf.setFontSize(8);
    pdf.setTextColor(102, 102, 102); // #666666
    
    // Linha superior do footer
    pdf.text('Fertilisolo - Análise e recomendação de fertilizantes', marginX, 280);
    pdf.text('Página 1/3', 95, 280);
    pdf.text('Contato: suporte@fertilisolo.com.br', 140, 280);
    
    // Linha inferior do footer  
    pdf.text('Relatório gerado por sistema especialista', marginX, 285);
    pdf.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 140, 285);

    // ======================= PÁGINA 2 - DETALHES DA RECOMENDAÇÃO =======================
    
    pdf.addPage();
    
    // Header da Página 2
    pdf.setFillColor(76, 175, 80);
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 20, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text('Detalhes da Recomendação de Fertilizantes', 15, 13);

    // Tabela Completa de Fertilizantes
    const allFertilizerColumns = ['Fertilizante', 'Quantidade', 'Unidade', 'Método', 'Estágio'];
    const allFertilizerRows = [
      // Calcários
      ['Calcário Dolomítico', '2000', 'kg/ha', 'A lanço', 'Pré-plantio'],
      ['Calcário Calcítico', '1800', 'kg/ha', 'A lanço', 'Pré-plantio'],
      
      // Fontes de Nitrogênio
      ['Ureia (45% N)', '100', 'kg/ha', 'Cobertura', 'V4-V6'],
      ['Sulfato de Amônio (21% N)', '200', 'kg/ha', 'Cobertura', 'V6-V8'],
      
      // Fontes de Fósforo
      ['Superfosfato Simples', '400', 'kg/ha', 'Sulco', 'Plantio'],
      ['Superfosfato Triplo', '180', 'kg/ha', 'Sulco', 'Plantio'],
      ['MAP', '150', 'kg/ha', 'Sulco', 'Plantio'],
      
      // Fontes de Potássio
      ['Cloreto de Potássio', '150', 'kg/ha', 'Sulco', 'Plantio'],
      ['Sulfato de Potássio', '180', 'kg/ha', 'Sulco', 'Plantio'],
      
      // NPKs
      ['NPK 04-14-08', '350', 'kg/ha', 'Sulco', 'Plantio'],
      ['NPK 10-10-10', '300', 'kg/ha', 'Sulco', 'Plantio'],
      
      // Micronutrientes
      ['Ácido Bórico', '2', 'kg/ha', 'Foliar', 'Desenvolvimento inicial'],
      ['Borax', '3', 'kg/ha', 'Foliar', 'Desenvolvimento inicial'],
      ['Sulfato de Zinco', '4', 'kg/ha', 'Foliar', 'Desenvolvimento inicial'],
      ['Óxido de Zinco', '3', 'kg/ha', 'Foliar', 'Desenvolvimento inicial'],
      ['Sulfato de Cobre', '2', 'kg/ha', 'Foliar', 'Desenvolvimento inicial'],
      ['Óxido de Cobre', '1.5', 'kg/ha', 'Foliar', 'Desenvolvimento inicial'],
      ['Sulfato de Manganês', '3', 'kg/ha', 'Foliar', 'Desenvolvimento inicial'],
      ['Óxido de Manganês', '2.5', 'kg/ha', 'Foliar', 'Desenvolvimento inicial'],
      ['Molibdato de Sódio', '0.1', 'kg/ha', 'Tratamento de sementes', 'Plantio'],
      
      // Orgânicos
      ['Esterco Bovino Curtido', '10000', 'kg/ha', 'Incorporado', 'Pré-plantio'],
      ['Composto Orgânico', '5000', 'kg/ha', 'Incorporado', 'Pré-plantio']
    ];

    autoTable(pdf, {
      head: [allFertilizerColumns],
      body: allFertilizerRows,
      startY: 25,
      theme: 'grid',
      headStyles: { fillColor: [76, 175, 80], textColor: [255, 255, 255], fontSize: 10 },
      alternateRowStyles: { fillColor: [240, 248, 240] },
      styles: { fontSize: 9, cellPadding: 2 },
      margin: { left: 15, right: 15 }
    });

    // Footer da Página 2
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Fertilisolo - Análise e recomendação de fertilizantes - Página 2/3', 15, 285);
    pdf.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 140, 285);

    // ======================= PÁGINA 3 - ANÁLISE DETALHADA =======================
    
    pdf.addPage();
    
    // Header da Página 3
    pdf.setFillColor(76, 175, 80);
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 20, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text('Análise Detalhada de Nutrientes', 15, 13);

    // Tabela de Análise Completa
    const detailedColumns = ['Nutriente', 'Valor Encontrado', 'Unidade', 'Nível', 'Recomendação'];
    const detailedRows = [
      ['CTC (T)', formatNumber(soilData.T), 'cmolc/dm³', getCTCLevel(soilData.T), 'CTC ideal: 8-12 cmolc/dm³'],
      ['Fósforo (P)', formatNumber(soilData.P), 'mg/dm³', getNutrientLevel(soilData.P, 10, 20), 'Aplicação de fontes de fósforo'],
      ['Potássio (K)', formatNumber((soilData.K || 0) / 390), 'cmolc/dm³', getNutrientLevel((soilData.K || 0) / 390, 0.15, 0.3), 'Aplicação de fontes de potássio'],
      ['Cálcio (Ca)', formatNumber(soilData.Ca), 'cmolc/dm³', getNutrientLevel(soilData.Ca, 2.0, 4.0), 'Aplicação de calcário'],
      ['Magnésio (Mg)', formatNumber(soilData.Mg), 'cmolc/dm³', getNutrientLevel(soilData.Mg, 0.8, 1.5), 'Manutenção'],
      ['Enxofre (S)', formatNumber(soilData.S), 'mg/dm³', getNutrientLevel(soilData.S, 5, 10), 'Adequado'],
      ['Boro (B)', formatNumber(soilData.B), 'mg/dm³', getNutrientLevel(soilData.B, 0.3, 0.6), getMicroRecommendation('B', getNutrientLevel(soilData.B, 0.3, 0.6))],
      ['Cobre (Cu)', formatNumber(soilData.Cu), 'mg/dm³', getNutrientLevel(soilData.Cu, 0.8, 1.2), getMicroRecommendation('Cu', getNutrientLevel(soilData.Cu, 0.8, 1.2))],
      ['Ferro (Fe)', formatNumber(soilData.Fe), 'mg/dm³', getNutrientLevel(soilData.Fe, 18, 45), getMicroRecommendation('Fe', getNutrientLevel(soilData.Fe, 18, 45))],
      ['Manganês (Mn)', formatNumber(soilData.Mn), 'mg/dm³', getNutrientLevel(soilData.Mn, 15, 30), getMicroRecommendation('Mn', getNutrientLevel(soilData.Mn, 15, 30))],
      ['Zinco (Zn)', formatNumber(soilData.Zn), 'mg/dm³', getNutrientLevel(soilData.Zn, 1.5, 2.2), getMicroRecommendation('Zn', getNutrientLevel(soilData.Zn, 1.5, 2.2))],
      ['Molibdênio (Mo)', '-', 'mg/dm³', 'Não analisado', 'Aplicação preventiva recomendada']
    ];

    autoTable(pdf, {
      head: [detailedColumns],
      body: detailedRows,
      startY: 25,
      theme: 'grid',
      headStyles: { fillColor: [76, 175, 80], textColor: [255, 255, 255], fontSize: 10 },
      alternateRowStyles: { fillColor: [240, 248, 240] },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: 15, right: 15 }
    });

    // Observações Importantes sobre Manejo de Nutrientes
    const finalY = (pdf as any).lastAutoTable?.finalY + 10;
    
    pdf.setFillColor(240, 248, 240);
    pdf.rect(15, finalY, 180, 45, 'F');
    pdf.setDrawColor(76, 175, 80);
    pdf.rect(15, finalY, 180, 45, 'S');

    pdf.setFontSize(12);
    pdf.setTextColor(76, 175, 80);
    pdf.text('Observações Importantes sobre Manejo de Nutrientes', 17, finalY + 8);

    const managementNotes = [
      '• Aplicar calcário de 60 a 90 dias antes do plantio para correção do solo',
      '• Os micronutrientes são essenciais para o desenvolvimento completo das plantas',
      '• Parcelar a adubação nitrogenada em 2-3 aplicações para maior eficiência',
      '• Realizar análise foliar no florescimento para ajustes na adubação',
      '• Considerar o uso de inoculantes para leguminosas',
      '• Monitorar a acidez do solo a cada 2 anos para ajuste no manejo',
      '• Para culturas perenes, parcelar as adubações ao longo do ciclo'
    ];

    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    let managementY = finalY + 15;
    managementNotes.forEach(note => {
      pdf.text(note, 17, managementY);
      managementY += 5;
    });

    // Footer da Página 3
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Fertilisolo - Análise e recomendação de fertilizantes - Página 3/3', 15, 285);
    pdf.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 140, 285);

    // Nome do arquivo para download
    const filename = `Fertilisolo_Relatorio_${soilData.location || farmName || "Analise"}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
    
    // Retornar o PDF para download
    return { pdf, filename };
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    throw error;
  }
};

export default generatePDF;
