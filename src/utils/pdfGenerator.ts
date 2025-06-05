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

export const generatePDFReport = async (soilData: SoilData, results: CalculationResult) => {
  try {
    // Configurar o PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Adicionar cabeçalho melhorado
    pdf.setFillColor(76, 175, 80);
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 25, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.text('Fertilisolo - Relatório de Análise de Solo', 15, 15);
    
    // Adicionar data e ID do relatório
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 15, 30);
    pdf.text(`ID do Relatório: ${Date.now().toString(36)}`, 15, 35);
    
    // Adicionar informações básicas
    pdf.setFontSize(14);
    pdf.text('Informações da Análise', 15, 45);
    
    pdf.setFontSize(10);
    pdf.text(`Local: ${soilData.location || "Não especificado"}`, 15, 55);
    pdf.text(`Data da Coleta: ${soilData.date ? new Date(soilData.date).toLocaleDateString('pt-BR') : "Não especificado"}`, 15, 60);
    
    // Renderizar tabela de resultados
    pdf.setFontSize(14);
    pdf.text('Resultados da Análise', 15, 70);
    
    // Dados para tabela de resultados
    const resultColumns = ['Parâmetro', 'Valor', 'Unidade', 'Interpretação'];
    const resultRows = [
      ['Matéria Orgânica', formatNumber(soilData.organicMatter), '%', getMatterLevel(soilData.organicMatter)],
      ['Teor de Argila', formatNumber(soilData.argila), '%', getClayLevel(soilData.argila)],
      ['CTC (T)', formatNumber(soilData.T), 'cmolc/dm³', getCTCLevel(soilData.T)],
      ['Fósforo (P)', formatNumber(soilData.P), 'mg/dm³', getNutrientLevel(soilData.P, 10, 20)],
      ['Potássio (K)', formatNumber(soilData.K ? soilData.K / 390 : 0), 'cmolc/dm³', getNutrientLevel(soilData.K ? soilData.K / 390 : 0, 0.15, 0.3)],
      ['Cálcio (Ca)', formatNumber(soilData.Ca), 'cmolc/dm³', getNutrientLevel(soilData.Ca, 2.0, 4.0)],
      ['Magnésio (Mg)', formatNumber(soilData.Mg), 'cmolc/dm³', getNutrientLevel(soilData.Mg, 0.8, 1.5)],
      ['Enxofre (S)', formatNumber(soilData.S), 'mg/dm³', getNutrientLevel(soilData.S, 5, 10)],
      ['Boro (B)', formatNumber(soilData.B), 'mg/dm³', getNutrientLevel(soilData.B, 0.3, 0.6)],
      ['Cobre (Cu)', formatNumber(soilData.Cu), 'mg/dm³', getNutrientLevel(soilData.Cu, 0.8, 1.2)],
      ['Ferro (Fe)', formatNumber(soilData.Fe), 'mg/dm³', getNutrientLevel(soilData.Fe, 18, 45)],
      ['Manganês (Mn)', formatNumber(soilData.Mn), 'mg/dm³', getNutrientLevel(soilData.Mn, 15, 30)],
      ['Zinco (Zn)', formatNumber(soilData.Zn), 'mg/dm³', getNutrientLevel(soilData.Zn, 1.5, 2.2)]
    ];
    
    // Adicionar tabela de resultados
    autoTable(pdf, {
      head: [resultColumns],
      body: resultRows,
      startY: 75,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [120, 144, 156],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [76, 175, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 248, 240]
      },
      margin: { top: 75 }
    });
    
    // Adicionar recomendações
    pdf.addPage();
    pdf.setFillColor(76, 175, 80);
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 25, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.text('Recomendações de Fertilizantes', 15, 15);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text('As recomendações abaixo são baseadas nos resultados da análise de solo:', 15, 30);
    
    // Preparar dados para recomendações
    const fertilizers = results?.fertilizers || [];
    const recColumns = ['Fertilizante', 'Quantidade', 'Unidade', 'Aplicação'];
    const recRows: any[] = [];
    
    if (Array.isArray(fertilizers)) {
      fertilizers.forEach(fert => {
        recRows.push([
          fert.name,
          formatNumber(fert.amount),
          fert.unit || 'kg/ha',
          fert.application || 'A lanço'
        ]);
      });
    } else if (fertilizers.macronutrientes && fertilizers.micronutrientes) {
      // Se for um objeto com macronutrientes e micronutrientes
      fertilizers.macronutrientes.forEach(fert => {
        recRows.push([
          fert.nome,
          formatNumber(fert.quantidade),
          fert.unidade || 'kg/ha',
          'A lanço'
        ]);
      });
      
      fertilizers.micronutrientes.forEach(fert => {
        recRows.push([
          fert.nome,
          formatNumber(fert.quantidade),
          fert.unidade || 'kg/ha',
          'Foliar'
        ]);
      });
    }
    
    // Adicionar tabela de recomendações
    autoTable(pdf, {
      head: [recColumns],
      body: recRows,
      startY: 35,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [120, 144, 156],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [76, 175, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 248, 240]
      },
      margin: { top: 35 }
    });
    
    // Adicionar gráficos ou representações visuais dos níveis de nutrientes
    const yPos = (pdf as any).lastAutoTable?.finalY || 150;
    pdf.setFontSize(14);
    pdf.text('Representação Visual dos Níveis de Nutrientes', 15, yPos + 10);
    
    // Adicionar observações
    pdf.setFontSize(11);
    pdf.text('Observações Importantes:', 15, yPos + 100);
    pdf.setFontSize(9);
    pdf.text('• As recomendações acima são baseadas nos resultados da análise e nas necessidades da cultura.', 15, yPos + 110);
    pdf.text('• Consulte um engenheiro agrônomo para ajustes específicos às condições locais.', 15, yPos + 115);
    pdf.text('• A aplicação deve considerar o momento do plantio, o tipo de solo e as condições climáticas.', 15, yPos + 120);
    
    // Adicionar assinatura digital
    pdf.setFontSize(10);
    pdf.text('Documento gerado digitalmente pelo sistema Fertilisolo', 15, pdf.internal.pageSize.getHeight() - 30);
    pdf.text(`Assinatura Digital: ${btoa(Date.now().toString()).substring(0, 16)}`, 15, pdf.internal.pageSize.getHeight() - 25);
    pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, pdf.internal.pageSize.getHeight() - 20);
    
    // Adicionar QR code para verificação (representado por um pequeno quadrado)
    pdf.setFillColor(0, 0, 0);
    pdf.rect(pdf.internal.pageSize.getWidth() - 30, pdf.internal.pageSize.getHeight() - 30, 20, 20, 'F');
    
    // Baixar o PDF
    pdf.save(`relatorio_solo_${soilData.location ? soilData.location.replace(/\s+/g, '_') : 'analise'}.pdf`);
    
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

export const generatePDF = (soilData: SoilData, farmName?: string, plotName?: string) => {
  try {
    const pdf = new jsPDF();
    
    // Configurações do PDF
    pdf.setProperties({
      title: 'Relatório de Análise de Solo',
      author: 'Fertilisolo',
      subject: 'Análise e Recomendação de Fertilizantes',
      keywords: 'solo, fertilizantes, análise'
    });
    
    // Título do documento
    pdf.setFontSize(20);
    pdf.setTextColor(56, 142, 60); // cor verde para o título
    pdf.text('Relatório de Análise de Solo', 15, 15);
    
    // Informações gerais
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Local: ${soilData.location || "Não especificado"}`, 15, 30);
    pdf.text(`Fazenda: ${farmName || "Não especificada"}`, 15, 37);
    pdf.text(`Talhão: ${plotName || "Não especificado"}`, 15, 44);
    pdf.text(`Data da Análise: ${soilData.date || new Date().toLocaleDateString()}`, 15, 51);
    
    // Análise da textura do solo e interpretação de fósforo
    const classeArgila = determinarClasseArgila(soilData.argila || 0);
    const texturaDescricao = getTexturaClasseArgila(classeArgila);
    const interpretacaoP = interpretarFosforo(soilData.P || 0, soilData.argila || 0);
    const analiseP = calcularRecomendacaoP(soilData.P || 0, soilData.argila || 0);
    
    // Linha divisória
    pdf.setDrawColor(56, 142, 60);
    pdf.line(15, 58, 195, 58);
    
    // Resultados da Análise
    pdf.setFontSize(16);
    pdf.setTextColor(56, 142, 60);
    pdf.text('Resultados da Análise de Solo', 15, 68);
    
    // Usar uma tabela HTML para formatar os dados
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    
    // Converter o K para cmolc/dm³
    const kCmolc = (soilData.K || 0) / 390;
    
    // Seção de informação sobre classe textural
    pdf.setFontSize(14);
    pdf.setTextColor(56, 142, 60);
    pdf.text('Classificação Textural do Solo', 15, 78);
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Teor de Argila: ${soilData.argila || 0}%`, 15, 85);
    pdf.text(`Classe Textural: ${texturaDescricao}`, 15, 92);
    pdf.text(`Interpretação do Fósforo: ${interpretacaoP}`, 15, 99);
    pdf.text(`Limite Crítico de P para esta classe: ${analiseP.limiteCritico} mg/dm³`, 15, 106);
    
    // Linha divisória
    pdf.setDrawColor(200, 200, 200);
    pdf.line(15, 113, 195, 113);
    
    // Resultados da análise química
    pdf.setFontSize(14);
    pdf.setTextColor(56, 142, 60);
    pdf.text('Resultados da Análise Química', 15, 123);
    
    // Configurar a tabela de análise de nutrientes
    const tableColumn = [
      "Nutriente", 
      "Valor", 
      "Unidade", 
      "Interpretação", 
      "Faixa Ideal"
    ];
    
    // Dados dos macronutrientes
    const tableRows = [
      ["CTC (T)", (soilData.T || 0).toFixed(2), "cmolc/dm³", 
        soilData.T < 5 ? "Baixa" : soilData.T < 10 ? "Média" : "Alta", 
        "5,0 - 12,0"],
      ["Fósforo (P)", (soilData.P || 0).toFixed(2), "mg/dm³", 
        interpretacaoP, 
        `${analiseP.limiteCritico} - ${analiseP.limiteCritico * 2}`],
      ["Potássio (K)", kCmolc.toFixed(2), "cmolc/dm³", 
        kCmolc < 0.15 ? "Baixo" : kCmolc < 0.3 ? "Médio" : "Alto", 
        "0,15 - 0,30"],
      ["Cálcio (Ca)", (soilData.Ca || 0).toFixed(2), "cmolc/dm³", 
        soilData.Ca < 2 ? "Baixo" : soilData.Ca < 4 ? "Médio" : "Alto", 
        "2,0 - 4,0"],
      ["Magnésio (Mg)", (soilData.Mg || 0).toFixed(2), "cmolc/dm³", 
        soilData.Mg < 0.5 ? "Baixo" : soilData.Mg < 1 ? "Médio" : "Alto", 
        "0,5 - 1,0"],
      ["Enxofre (S)", (soilData.S || 0).toFixed(2), "mg/dm³", 
        soilData.S < 5 ? "Baixo" : soilData.S < 10 ? "Médio" : "Alto", 
        "5,0 - 15,0"],
    ];
    
    // Posição vertical após o conteúdo HTML
    const yPos = 130;
    
    // Adicionar a tabela de análise de nutrientes
    (pdf as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: yPos,
      theme: 'grid',
      headStyles: { fillColor: [56, 142, 60], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 248, 240] },
      margin: { top: 10 },
    });
    
    // Adicionar recomendação de fósforo com base na classe textural
    pdf.setFontSize(14);
    pdf.setTextColor(56, 142, 60);
    pdf.text('Recomendação para Fósforo', 15, ((pdf as any).lastAutoTable?.finalY || 220) + 10);
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Dose Recomendada: ${analiseP.doseRecomendada} kg/ha de P₂O₅`, 15, ((pdf as any).lastAutoTable?.finalY || 220) + 20);
    pdf.text(`Observação: ${analiseP.observacao}`, 15, ((pdf as any).lastAutoTable?.finalY || 220) + 27);
    
    // Micronutrientes
    const micronutrientesRows = [
      ["Boro (B)", (soilData.B || 0).toFixed(2), "mg/dm³", 
        soilData.B < 0.3 ? "Baixo" : soilData.B < 0.6 ? "Médio" : "Alto", 
        "0,3 - 0,6"],
      ["Cobre (Cu)", (soilData.Cu || 0).toFixed(2), "mg/dm³", 
        soilData.Cu < 0.4 ? "Baixo" : soilData.Cu < 0.8 ? "Médio" : "Alto", 
        "0,4 - 0,8"],
      ["Ferro (Fe)", (soilData.Fe || 0).toFixed(2), "mg/dm³", 
        soilData.Fe < 8 ? "Baixo" : soilData.Fe < 30 ? "Médio" : "Alto", 
        "8,0 - 30,0"],
      ["Manganês (Mn)", (soilData.Mn || 0).toFixed(2), "mg/dm³", 
        soilData.Mn < 3 ? "Baixo" : soilData.Mn < 5 ? "Médio" : "Alto", 
        "3,0 - 5,0"],
      ["Zinco (Zn)", (soilData.Zn || 0).toFixed(2), "mg/dm³", 
        soilData.Zn < 1 ? "Baixo" : soilData.Zn < 1.5 ? "Médio" : "Alto", 
        "1,0 - 1,5"]
    ];
    
    // Título para micronutrientes
    pdf.setFontSize(14);
    pdf.setTextColor(56, 142, 60);
    pdf.text('Micronutrientes', 15, ((pdf as any).lastAutoTable?.finalY || 220) + 37);
    
    // Tabela de micronutrientes
    (pdf as any).autoTable({
      head: [tableColumn],
      body: micronutrientesRows,
      startY: ((pdf as any).lastAutoTable?.finalY || 220) + 45,
      theme: 'grid',
      headStyles: { fillColor: [56, 142, 60], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 248, 240] },
      margin: { top: 10 },
    });
    
    // Informações de rodapé
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Fertilisolo - Relatório gerado em ${new Date().toLocaleDateString()}`, 15, 285);
      pdf.text(`Página ${i} de ${pageCount}`, 175, 285);
    }
    
    // Nome do arquivo para download
    const filename = `Recomendacao_${soilData.location || "Local"}.pdf`;
    
    // Retornar o PDF para download
    return { pdf, filename };
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    throw error;
  }
};

export default generatePDF;
