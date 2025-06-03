import { SoilData, CalculationResult } from '@/types/soilAnalysis';
import { calculateFertilizerRecommendations } from './soilCalculations';
import { formatNumber, formatNumberOptional } from './numberFormat';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

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
  container.className = 'bg-white p-6 rounded-lg shadow-md space-y-6';
  container.style.width = '800px';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  
  // Cabeçalho
  const header = document.createElement('div');
  header.className = 'flex justify-between items-center border-b border-green-200 pb-4';
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
  
  // Informações da cultura
  const cropInfo = document.createElement('div');
  cropInfo.innerHTML = `
    <h3 class="text-lg font-semibold text-green-700 mb-3">Informações da Cultura</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-green-50 p-3 rounded-md">
        <h4 class="font-medium text-green-800 border-b border-green-200 pb-1 mb-2">Detalhes</h4>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">Cultura:</span>
            <span class="font-medium">${soilData.crop || "Não especificada"}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">pH do Solo:</span>
            <span class="font-medium">5.7</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Matéria Orgânica:</span>
            <span class="font-medium">${soilData.organicMatter || 0}%</span>
          </div>
        </div>
      </div>
      
      <div class="bg-green-50 p-3 rounded-md">
        <h4 class="font-medium text-green-800 border-b border-green-200 pb-1 mb-2">Macronutrientes Primários</h4>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">Fósforo (P):</span>
            <span class="font-medium">${soilData.P || 0} mg/dm³</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Potássio (K):</span>
            <span class="font-medium">${soilData.K || 0} cmolc/dm³</span>
          </div>
        </div>
      </div>
      
      <div class="bg-green-50 p-3 rounded-md">
        <h4 class="font-medium text-green-800 border-b border-green-200 pb-1 mb-2">Macronutrientes Secundários</h4>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">Cálcio (Ca):</span>
            <span class="font-medium">${soilData.Ca || 0} cmolc/dm³</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Magnésio (Mg):</span>
            <span class="font-medium">${soilData.Mg || 0} cmolc/dm³</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Enxofre (S):</span>
            <span class="font-medium">${soilData.S || 0} mg/dm³</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Micronutrientes - destaque especial -->
    <div class="mt-4">
      <div class="bg-green-100 p-3 rounded-md border-green-200">
        <h4 class="font-medium text-green-800 border-b border-green-300 pb-1 mb-2">Micronutrientes</h4>
        <div class="grid grid-cols-5 gap-4">
          <div class="space-y-1">
            <div class="text-gray-700 font-medium">Boro (B)</div>
            <div class="text-lg font-semibold">${soilData.B || 0} mg/dm³</div>
            <div class="text-xs px-2 py-0.5 rounded-full inline-block ${getNutrientLevel(soilData.B, 0.2, 0.6) === 'Baixo' ? 'bg-red-100 text-red-800' : getNutrientLevel(soilData.B, 0.2, 0.6) === 'Alto' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}">
              ${getNutrientLevel(soilData.B, 0.2, 0.6)}
            </div>
          </div>
          <div class="space-y-1">
            <div class="text-gray-700 font-medium">Cobre (Cu)</div>
            <div class="text-lg font-semibold">${soilData.Cu || 0} mg/dm³</div>
            <div class="text-xs px-2 py-0.5 rounded-full inline-block ${getNutrientLevel(soilData.Cu, 0.8, 1.8) === 'Baixo' ? 'bg-red-100 text-red-800' : getNutrientLevel(soilData.Cu, 0.8, 1.8) === 'Alto' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}">
              ${getNutrientLevel(soilData.Cu, 0.8, 1.8)}
            </div>
          </div>
          <div class="space-y-1">
            <div class="text-gray-700 font-medium">Ferro (Fe)</div>
            <div class="text-lg font-semibold">${soilData.Fe || 0} mg/dm³</div>
            <div class="text-xs px-2 py-0.5 rounded-full inline-block ${getNutrientLevel(soilData.Fe, 15, 40) === 'Baixo' ? 'bg-red-100 text-red-800' : getNutrientLevel(soilData.Fe, 15, 40) === 'Alto' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}">
              ${getNutrientLevel(soilData.Fe, 15, 40)}
            </div>
          </div>
          <div class="space-y-1">
            <div class="text-gray-700 font-medium">Manganês (Mn)</div>
            <div class="text-lg font-semibold">${soilData.Mn || 0} mg/dm³</div>
            <div class="text-xs px-2 py-0.5 rounded-full inline-block ${getNutrientLevel(soilData.Mn, 15, 30) === 'Baixo' ? 'bg-red-100 text-red-800' : getNutrientLevel(soilData.Mn, 15, 30) === 'Alto' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}">
              ${getNutrientLevel(soilData.Mn, 15, 30)}
            </div>
          </div>
          <div class="space-y-1">
            <div class="text-gray-700 font-medium">Zinco (Zn)</div>
            <div class="text-lg font-semibold">${soilData.Zn || 0} mg/dm³</div>
            <div class="text-xs px-2 py-0.5 rounded-full inline-block ${getNutrientLevel(soilData.Zn, 1.0, 2.2) === 'Baixo' ? 'bg-red-100 text-red-800' : getNutrientLevel(soilData.Zn, 1.0, 2.2) === 'Alto' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}">
              ${getNutrientLevel(soilData.Zn, 1.0, 2.2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Recomendações de fertilizantes
  const recommendations = document.createElement('div');
  recommendations.innerHTML = `
    <h3 class="text-lg font-semibold text-green-700 mb-3">Recomendações de Fertilizantes</h3>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-green-200">
        <thead class="bg-green-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Fertilizante</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Quantidade</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Método</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Estágio</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-green-100">
          ${results.needs.Ca > 0 ? `
          <tr class="bg-green-50 bg-opacity-30">
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Calcário Dolomítico</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${results.needs.Ca * 1000} kg/ha</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">A lanço</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Pré-plantio</td>
          </tr>` : ''}
          ${results.needs.Mg > 0 ? `
          <tr class="bg-white">
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Calcário Calcítico</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${results.needs.Mg * 500} kg/ha</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">A lanço</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Pré-plantio</td>
          </tr>` : ''}
          ${results.needs.K > 0 ? `
          <tr class="bg-green-50 bg-opacity-30">
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Cloreto de Potássio</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${results.needs.K * 2} kg/ha</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Sulco</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Plantio</td>
          </tr>` : ''}
          ${results.needs.P > 0 ? `
          <tr class="bg-white">
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Superfosfato Simples</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${results.needs.P * 5} kg/ha</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Sulco</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Plantio</td>
          </tr>` : ''}
          ${soilData.B < 0.2 ? `
          <tr class="bg-green-50 bg-opacity-30">
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Ácido Bórico</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">2 kg/ha</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Foliar</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Desenvolvimento inicial</td>
          </tr>` : ''}
          ${soilData.Zn < 1.0 ? `
          <tr class="bg-white">
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Sulfato de Zinco</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">4 kg/ha</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Foliar</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Desenvolvimento inicial</td>
          </tr>` : ''}
          ${soilData.Cu < 0.8 ? `
          <tr class="bg-green-50 bg-opacity-30">
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Sulfato de Cobre</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">2 kg/ha</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Foliar</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Desenvolvimento inicial</td>
          </tr>` : ''}
          ${soilData.Mn < 15 ? `
          <tr class="bg-white">
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Sulfato de Manganês</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">3 kg/ha</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Foliar</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Desenvolvimento inicial</td>
          </tr>` : ''}
          <tr class="bg-green-50 bg-opacity-30">
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Ureia</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">80 kg/ha</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Cobertura</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">V4</td>
          </tr>
          <tr class="bg-white">
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Molibdato de Sódio</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">0.1 kg/ha</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Tratamento de sementes</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Plantio</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  // Gráfico visual de necessidades
  const visualAnalysis = document.createElement('div');
  visualAnalysis.innerHTML = `
    <h3 class="text-lg font-semibold text-green-700 mb-3">Análise Visual de Necessidades</h3>
    
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-green-50 p-3 rounded-md">
        <h4 class="font-medium text-green-800 mb-2">Macronutrientes</h4>
        <div class="space-y-3">
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
      
      <div class="bg-green-50 p-3 rounded-md">
        <h4 class="font-medium text-green-800 mb-2">Micronutrientes</h4>
        <div class="space-y-3">
          <!-- Barra de Boro -->
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-xs font-medium text-gray-700">Boro (B)</span>
              <span class="text-xs font-medium text-gray-700">
                ${getNutrientLevel(soilData.B, 0.2, 0.6)}
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
                ${getNutrientLevel(soilData.Zn, 1.0, 2.2)}
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
                ${getNutrientLevel(soilData.Cu, 0.8, 1.8)}
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
                ${getNutrientLevel(soilData.Mn, 15, 30)}
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
  
  // Notas e recomendações especiais
  const notes = document.createElement('div');
  notes.className = 'bg-green-50 p-4 rounded-md';
  notes.innerHTML = `
    <h3 class="text-md font-semibold text-green-700 mb-2">Notas e Recomendações Especiais</h3>
    <ul class="list-disc pl-5 space-y-1 text-sm text-gray-700">
      <li>Aplicar os micronutrientes em deficiência via foliar nos estágios iniciais de desenvolvimento.</li>
      <li>Considerar o parcelamento da adubação potássica em solos arenosos.</li>
      <li>Monitorar os níveis de pH após a calagem para verificar a efetividade.</li>
      <li>Para essa cultura, atenção especial aos níveis de ${soilData.Zn && soilData.Zn < 1.0 ? 'zinco' : soilData.B && soilData.B < 0.2 ? 'boro' : 'micronutrientes em geral'}.</li>
      <li>As recomendações são baseadas no método de Saturação por Bases.</li>
      <li>Consulte um engenheiro agrônomo para validação das recomendações.</li>
    </ul>
  `;
  
  // Rodapé
  const footer = document.createElement('div');
  footer.className = 'border-t border-green-100 pt-4 text-sm text-gray-500 flex justify-between';
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
  container.appendChild(cropInfo);
  container.appendChild(recommendations);
  container.appendChild(visualAnalysis);
  container.appendChild(notes);
  container.appendChild(footer);
  
  document.body.appendChild(container);
  
  return container;
};

export const generatePDFReport = async (soilData: SoilData, results: CalculationResult) => {
  try {
    console.log("Iniciando geração do PDF usando método de captura do modelo de relatório...");
    
    // Gerar elemento HTML para capturar como imagem
    const reportElement = renderReportTemplate(soilData, results);
    
    if (!reportElement) {
      throw new Error("Não foi possível criar o elemento de relatório");
    }
    
    // Capturar o relatório como imagem
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    // Remover o elemento temporário
    if (reportElement.parentNode) {
      reportElement.parentNode.removeChild(reportElement);
    }
    
    const imgData = canvas.toDataURL('image/png');
    
    // Configurar o PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Calcular dimensões para ajustar a imagem à página
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    // Adicionar a captura de tela como imagem
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Adicionar página para detalhes adicionais
    pdf.addPage();
    
    // Título da segunda página
    pdf.setFontSize(16);
    pdf.setTextColor(56, 142, 60); // cor verde para o título
    pdf.text('Detalhes da Recomendação de Fertilizantes', 15, 15);
    
    // Tabela de recomendações detalhadas
    const tableColumn = ["Fertilizante", "Quantidade", "Unidade", "Método de Aplicação", "Estágio"];
    
    // Lista completa de todas as possíveis recomendações de fertilizantes
    const tableRows: any[] = [];
    
    // Adicionar recomendações com base nos resultados - SEÇÃO CORRETIVOS
    if (results.needs.Ca > 0) {
      tableRows.push([
        "Calcário Dolomítico",
        (results.needs.Ca * 1000).toString(),
        "kg/ha",
        "A lanço",
        "Pré-plantio"
      ]);
    }
    
    if (results.needs.Mg > 0) {
      tableRows.push([
        "Calcário Calcítico",
        (results.needs.Mg * 500).toString(),
        "kg/ha",
        "A lanço",
        "Pré-plantio"
      ]);
    }
    
    // SEÇÃO MACRONUTRIENTES PRIMÁRIOS (N, P, K)
    // Fontes de Nitrogênio
    tableRows.push([
      "Ureia (45% N)",
      "80",
      "kg/ha",
      "Cobertura",
      "V4-V6"
    ]);
    
    tableRows.push([
      "Sulfato de Amônio (21% N)",
      "120",
      "kg/ha",
      "Cobertura",
      "V6-V8"
    ]);
    
    // Fontes de Fósforo
    if (results.needs.P > 0) {
      tableRows.push([
        "Superfosfato Simples (18% P2O5)",
        (results.needs.P * 5).toString(),
        "kg/ha",
        "Sulco",
        "Plantio"
      ]);
      
      tableRows.push([
        "Superfosfato Triplo (46% P2O5)",
        (results.needs.P * 2).toString(),
        "kg/ha",
        "Sulco",
        "Plantio"
      ]);
      
      tableRows.push([
        "MAP (52% P2O5)",
        (results.needs.P * 1.8).toString(),
        "kg/ha",
        "Sulco",
        "Plantio"
      ]);
    }
    
    // Fontes de Potássio
    if (results.needs.K > 0) {
      tableRows.push([
        "Cloreto de Potássio (60% K2O)",
        (results.needs.K * 2).toString(),
        "kg/ha",
        "Sulco",
        "Plantio"
      ]);
      
      tableRows.push([
        "Sulfato de Potássio (50% K2O)",
        (results.needs.K * 2.4).toString(),
        "kg/ha",
        "Sulco",
        "Plantio"
      ]);
    }
    
    // SEÇÃO FORMULADOS NPK
    tableRows.push([
      "NPK 04-14-08",
      "300",
      "kg/ha",
      "Sulco",
      "Plantio"
    ]);
    
    tableRows.push([
      "NPK 10-10-10",
      "250",
      "kg/ha",
      "Sulco",
      "Plantio"
    ]);
    
    // SEÇÃO MICRONUTRIENTES
    if (soilData.B < 0.2) {
      tableRows.push([
        "Ácido Bórico (17% B)",
        "2",
        "kg/ha",
        "Foliar",
        "Desenvolvimento inicial"
      ]);
      
      tableRows.push([
        "Borax (11% B)",
        "3",
        "kg/ha",
        "Foliar",
        "Desenvolvimento inicial"
      ]);
    }
    
    if (soilData.Zn < 1.0) {
      tableRows.push([
        "Sulfato de Zinco (22% Zn)",
        "4",
        "kg/ha",
        "Foliar",
        "Desenvolvimento inicial"
      ]);
      
      tableRows.push([
        "Óxido de Zinco (80% Zn)",
        "1",
        "kg/ha",
        "Foliar",
        "Desenvolvimento inicial"
      ]);
    }
    
    if (soilData.Cu < 0.8) {
      tableRows.push([
        "Sulfato de Cobre (25% Cu)",
        "2",
        "kg/ha",
        "Foliar",
        "Desenvolvimento inicial"
      ]);
      
      tableRows.push([
        "Óxido de Cobre (75% Cu)",
        "0.7",
        "kg/ha",
        "Foliar",
        "Desenvolvimento inicial"
      ]);
    }
    
    if (soilData.Mn < 15) {
      tableRows.push([
        "Sulfato de Manganês (26% Mn)",
        "3",
        "kg/ha",
        "Foliar",
        "Desenvolvimento inicial"
      ]);
      
      tableRows.push([
        "Óxido de Manganês (60% Mn)",
        "1.3",
        "kg/ha",
        "Foliar",
        "Desenvolvimento inicial"
      ]);
    }
    
    // Adicionar fertilizante para Molibdênio
    tableRows.push([
      "Molibdato de Sódio (39% Mo)",
      "0.1",
      "kg/ha",
      "Tratamento de sementes",
      "Plantio"
    ]);
    
    // Fertilizantes orgânicos
    tableRows.push([
      "Esterco Bovino Curtido",
      "10000",
      "kg/ha",
      "Incorporado",
      "Pré-plantio"
    ]);
    
    tableRows.push([
      "Composto Orgânico",
      "5000",
      "kg/ha",
      "Incorporado",
      "Pré-plantio"
    ]);
    
    // Usar autoTable como função direta
    autoTable(pdf, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      theme: 'grid',
      styles: {
        fontSize: 10,
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
      margin: { top: 25 }
    });
    
    // Adicionar página para micronutrientes
    pdf.addPage();
    
    // Título da terceira página
    pdf.setFontSize(16);
    pdf.setTextColor(56, 142, 60); // cor verde para o título
    pdf.text('Análise Detalhada de Nutrientes', 15, 15);
    
    // Tabela de micronutrientes
    const microColumn = ["Nutriente", "Valor Encontrado", "Unidade", "Nível", "Recomendação"];
    const microRows = [
      // Macronutrientes Primários
      ["Fósforo (P)", soilData.P?.toString() || "-", "mg/dm³", getNutrientLevel(soilData.P, 10, 20), 
       soilData.P && soilData.P < 10 ? "Aplicação de fontes de fósforo" : 
       soilData.P && soilData.P > 20 ? "Reduzir aplicação" : "Manutenção"],
      
      ["Potássio (K)", soilData.K?.toString() || "-", "cmolc/dm³", getNutrientLevel(soilData.K, 0.15, 0.3), 
       soilData.K && soilData.K < 0.15 ? "Aplicação de fontes de potássio" : 
       soilData.K && soilData.K > 0.3 ? "Reduzir aplicação" : "Manutenção"],
      
      // Macronutrientes Secundários
      ["Cálcio (Ca)", soilData.Ca?.toString() || "-", "cmolc/dm³", getNutrientLevel(soilData.Ca, 2.0, 4.0), 
       soilData.Ca && soilData.Ca < 2.0 ? "Aplicação de calcário" : 
       soilData.Ca && soilData.Ca > 4.0 ? "Adequado" : "Manutenção"],
      
      ["Magnésio (Mg)", soilData.Mg?.toString() || "-", "cmolc/dm³", getNutrientLevel(soilData.Mg, 0.8, 1.5), 
       soilData.Mg && soilData.Mg < 0.8 ? "Aplicação de calcário dolomítico" : 
       soilData.Mg && soilData.Mg > 1.5 ? "Adequado" : "Manutenção"],
      
      ["Enxofre (S)", soilData.S?.toString() || "-", "mg/dm³", getNutrientLevel(soilData.S, 5, 10), 
       soilData.S && soilData.S < 5 ? "Aplicação de gesso ou sulfato" : 
       soilData.S && soilData.S > 10 ? "Adequado" : "Manutenção"],
      
      // Micronutrientes
      ["Boro (B)", soilData.B?.toString() || "-", "mg/dm³", getNutrientLevel(soilData.B, 0.2, 0.6), 
       getMicroRecommendation("B", getNutrientLevel(soilData.B, 0.2, 0.6))],
      
      ["Cobre (Cu)", soilData.Cu?.toString() || "-", "mg/dm³", getNutrientLevel(soilData.Cu, 0.8, 1.8), 
       getMicroRecommendation("Cu", getNutrientLevel(soilData.Cu, 0.8, 1.8))],
      
      ["Ferro (Fe)", soilData.Fe?.toString() || "-", "mg/dm³", getNutrientLevel(soilData.Fe, 15, 40), 
       getMicroRecommendation("Fe", getNutrientLevel(soilData.Fe, 15, 40))],
      
      ["Manganês (Mn)", soilData.Mn?.toString() || "-", "mg/dm³", getNutrientLevel(soilData.Mn, 15, 30), 
       getMicroRecommendation("Mn", getNutrientLevel(soilData.Mn, 15, 30))],
      
      ["Zinco (Zn)", soilData.Zn?.toString() || "-", "mg/dm³", getNutrientLevel(soilData.Zn, 1.0, 2.2), 
       getMicroRecommendation("Zn", getNutrientLevel(soilData.Zn, 1.0, 2.2))],
      
      ["Molibdênio (Mo)", "-", "mg/dm³", "Não analisado", "Aplicação preventiva recomendada"],
    ];
    
    autoTable(pdf, {
      head: [microColumn],
      body: microRows,
      startY: 25,
      theme: 'grid',
      styles: {
        fontSize: 10,
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
      margin: { top: 25 }
    });
    
    // Adicionar observações sobre nutrientes
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0); // cor preta para o texto
    
    // Usar a propriedade lastAutoTable
    const finalY = (pdf as any).lastAutoTable.finalY || 150;
    pdf.text('Observações importantes sobre manejo de nutrientes:', 15, finalY + 15);
    
    const observations = [
      "• Aplicar calcário de 60 a 90 dias antes do plantio para correção do solo",
      "• Os micronutrientes são essenciais para o desenvolvimento completo das plantas",
      "• Parcelar a adubação nitrogenada em 2-3 aplicações para maior eficiência",
      "• Realizar análise foliar no florescimento para ajustes na adubação",
      "• Considerar o uso de inoculantes para leguminosas",
      "• Monitorar a acidez do solo a cada 2 anos para ajuste no manejo",
      "• Para culturas perenes, parcelar as adubações ao longo do ciclo"
    ];
    
    let yPos = finalY + 25;
    observations.forEach(obs => {
      pdf.text(obs, 15, yPos);
      yPos += 7;
    });
    
    // Rodapé em todas as páginas
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Fertilisolo - Análise e recomendação de fertilizantes - Página ${i}/${pageCount}`, 15, 287);
      pdf.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pdf.internal.pageSize.getWidth() - 60, 287);
    }
    
    // Salvar o PDF com tratamento assíncrono adequado
    const filename = `Recomendacao_${soilData.crop || "Cultura"}_${soilData.location || "Local"}.pdf`;
    
    // Verificar se estamos em ambiente de browser
    if (typeof window !== 'undefined') {
      console.log('Salvando PDF no navegador...');
      return pdf.save(filename);
    } else {
      throw new Error('Ambiente de execução não suportado para salvar PDF');
    }
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error; // Re-lançar o erro para ser tratado pelo chamador
  }
};
