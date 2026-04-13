import { SoilData, CalculationResult } from '@/types/soilAnalysis';
import { calculateFertilizerRecommendations, calculateSoilAnalysis, convertCaNeedToKgHa, convertMgNeedToKgHa, convertKNeedToKgHa } from './soilCalculations';
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
import { getCropIdentifier } from '@/components/BasicInfoSection';

// Estendendo o jsPDF com autotable
declare module 'jspdf' {
  interface jsPDF {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Interface para opções de tema do PDF
 */
interface PDFThemeOptions {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logo?: string; // Base64 string
  organizationName?: string;
}

/**
 * Converte cor hexadecimal para RGB
 */
function hexToRgb(hex: string): [number, number, number] {
  hex = hex.replace(/^#/, '');
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

/**
 * Adiciona logo no canto superior direito com proporção correta
 * @param insideHeader - Se true, posiciona dentro da faixa colorida (páginas 2 e 3)
 */
function addLogoToPage(pdf: jsPDF, logo: string, pageWidth: number, marginY: number, insideHeader: boolean = false) {
  return new Promise<void>((resolve) => {
    try {
      console.log('🖼️ Adicionando logo ao PDF (canto superior direito)...');
      
      // Detectar tipo de imagem
      let imageType: 'PNG' | 'JPEG' | 'JPG' = 'PNG';
      if (logo.includes('data:image/jpeg') || logo.includes('data:image/jpg')) {
        imageType = 'JPEG';
      }
      
      // Criar uma imagem para obter dimensões reais
      const img = new Image();
      img.onload = () => {
        try {
          // Dimensões máximas dependendo do contexto
          const maxLogoHeight = insideHeader ? 12 : 15; // Menor se dentro do header
          
          // Calcular proporção mantendo aspect ratio original
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          
          let logoWidth: number;
          let logoHeight: number;
          
          // Sempre manter a altura máxima e calcular largura proporcionalmente
          logoHeight = maxLogoHeight;
          logoWidth = maxLogoHeight * aspectRatio;
          
          // Limitar largura máxima
          const maxLogoWidth = insideHeader ? 30 : 25;
          if (logoWidth > maxLogoWidth) {
            logoWidth = maxLogoWidth;
            logoHeight = maxLogoWidth / aspectRatio;
          }
          
          console.log(`📐 Dimensões do logo: ${img.naturalWidth}x${img.naturalHeight}px (ratio: ${aspectRatio.toFixed(2)})`);
          console.log(`📏 Logo no PDF: ${logoWidth.toFixed(1)}x${logoHeight.toFixed(1)}mm`);
          
          // Posição no canto superior direito
          const logoX = pageWidth - logoWidth - 10; // 10mm de margem da direita
          
          // Posição Y depende se está dentro do header ou não
          let logoY: number;
          if (insideHeader) {
            // Centralizar verticalmente dentro da faixa de 20mm
            logoY = (20 - logoHeight) / 2;
          } else {
            logoY = marginY;
          }
          
          // Se estiver dentro do header (páginas 2 e 3), adicionar fundo branco para destaque
          if (insideHeader) {
            const padding = 2; // 2mm de padding ao redor do logo
            const bgX = logoX - padding;
            const bgY = logoY - padding;
            const bgWidth = logoWidth + (padding * 2);
            const bgHeight = logoHeight + (padding * 2);
            
            // Desenhar retângulo branco com bordas arredondadas
            pdf.setFillColor(255, 255, 255); // Branco
            pdf.roundedRect(bgX, bgY, bgWidth, bgHeight, 1, 1, 'F'); // Bordas de 1mm de raio
            
            console.log(`🎨 Fundo branco adicionado: ${bgWidth.toFixed(1)}x${bgHeight.toFixed(1)}mm`);
          }
          
          // Adicionar logo
          pdf.addImage(logo, imageType, logoX, logoY, logoWidth, logoHeight);
          console.log(`✅ Logo adicionado: X=${logoX.toFixed(1)}mm, Y=${logoY.toFixed(1)}mm, W=${logoWidth.toFixed(1)}mm, H=${logoHeight.toFixed(1)}mm`);
          resolve();
        } catch (error) {
          console.error('❌ Erro ao processar logo:', error);
          resolve();
        }
      };
      
      img.onerror = () => {
        console.error('❌ Erro ao carregar imagem do logo');
        resolve();
      };
      
      img.src = logo;
    } catch (error) {
      console.error('❌ Erro ao adicionar logo:', error);
      resolve();
    }
  });
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
const renderReportTemplate = (soilData: SoilData, results: CalculationResult, cultureName?: string) => {
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
          <span class="font-medium">${cultureName || "Não especificada"}</span>
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
                ${getNutrientLevel(soilData.Mn, 5, 12)}
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

export const generatePDFReport = async (
  soilData: SoilData, 
  results: CalculationResult, 
  cultureName?: string,
  themeOptions?: PDFThemeOptions,
  selectedFertilizers?: string[]
) => {
  try {
    const { pdf, filename } = await generatePDF(soilData, undefined, undefined, cultureName, themeOptions, selectedFertilizers);
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

function getPhLevel(value: number | undefined): string {
  if (value === undefined) return "Não analisado";
  if (value < 5.0) return "Muito Ácido";
  if (value < 5.5) return "Ácido";
  if (value < 6.5) return "Adequado";
  if (value < 7.0) return "Levemente Alcalino";
  return "Alcalino";
}

function getOrganicMatterLevel(value: number | undefined): string {
  if (value === undefined) return "Não analisado";
  if (value < 1.5) return "Baixo";
  if (value < 2.5) return "Médio";
  if (value < 5.0) return "Alto";
  return "Muito Alto";
}

function getTextureClass(value: number | undefined): string {
  if (value === undefined) return "Não analisado";
  if (value < 15) return "Arenoso";
  if (value < 35) return "Médio";
  if (value < 60) return "Argiloso";
  return "Muito Argiloso";
}

/**
 * Retorna informações sobre estágios fenológicos e descrições baseado na cultura
 */
function getCropStageInfo(cultureName?: string): {
  description: string;
  nitrogenStages: string[];
  microStages: string[];
} {
  const cropId = cultureName ? getCropIdentifier(cultureName) : 'soja';
  
  // Usar o nome original da cultura ou normalizar se necessário
  let cultureDisplayName = cultureName || 'soja';
  // Garantir primeira letra maiúscula e resto minúsculo para exibição consistente
  cultureDisplayName = cultureDisplayName.charAt(0).toUpperCase() + cultureDisplayName.slice(1).toLowerCase();
  
  switch (cropId) {
    case 'milho':
      return {
        description: `Aplicação de nitrogênio em cobertura entre os estágios V4-V8 do ${cultureDisplayName}.`,
        nitrogenStages: ['V4-V6', 'V6-V8', 'V4-V6', 'V4-V6', 'V4-V8'],
        microStages: ['V3-V5', 'V3-V5', 'V4-V6', 'V4-V6', 'V4-V6', 'V4-V6', 'V4-V6', 'V4-V6', 'Plantio']
      };
    case 'algodao':
      return {
        description: `Aplicação de nitrogênio em cobertura entre os estágios de crescimento inicial do ${cultureDisplayName}.`,
        nitrogenStages: ['Início floração', 'Pós-floração', 'Início floração', 'Início floração', 'Início floração'],
        microStages: ['Pré-floração', 'Pré-floração', 'Pré-floração', 'Pré-floração', 'Pré-floração', 'Pré-floração', 'Pré-floração', 'Pré-floração', 'Plantio']
      };
    case 'cafe':
      return {
        description: `Aplicação de nitrogênio em cobertura durante o período vegetativo do ${cultureDisplayName}.`,
        nitrogenStages: ['Pós-florada', 'Crescimento', 'Pós-florada', 'Pós-florada', 'Crescimento'],
        microStages: ['Crescimento', 'Crescimento', 'Crescimento', 'Crescimento', 'Crescimento', 'Crescimento', 'Crescimento', 'Crescimento', 'Plantio']
      };
    case 'cana':
      return {
        description: `Aplicação de nitrogênio em cobertura durante o perfilhamento do ${cultureDisplayName}.`,
        nitrogenStages: ['Perfilhamento', 'Crescimento', 'Perfilhamento', 'Perfilhamento', 'Crescimento'],
        microStages: ['Inicial', 'Inicial', 'Inicial', 'Inicial', 'Inicial', 'Inicial', 'Inicial', 'Inicial', 'Plantio']
      };
    case 'soja':
    default:
      return {
        description: `Aplicação de nitrogênio em cobertura entre os estágios V4-V8 da ${cultureDisplayName}.`,
        nitrogenStages: ['V4-V6', 'V6-V8', 'V4-V6', 'V4-V6', 'V4-V8'],
        microStages: ['V3-V5', 'V3-V5', 'V4-V6', 'V4-V6', 'V4-V6', 'V4-V6', 'V4-V6', 'V4-V6', 'Plantio']
      };
  }
}

export const generatePDF = async (
  soilData: SoilData,
  farmName?: string,
  plotName?: string,
  cultureName?: string,
  themeOptions?: PDFThemeOptions,
  selectedFertilizers?: string[]
) => {
  try {
    const isSelected = (id: string) => !selectedFertilizers || selectedFertilizers.includes(id);

    // Calcular results para usar na classificação de nutrientes com saturação
    const results = calculateSoilAnalysis(soilData);
    
    const pdf = new jsPDF();
    
    // Paleta teal — identidade agronômica do Fertilisolo
    const primaryColor: [number, number, number] = themeOptions?.primaryColor
      ? hexToRgb(themeOptions.primaryColor)
      : [26, 104, 115]; // teal-700 #1a6873

    const primaryColorLight: [number, number, number] = themeOptions?.primaryColor
      ? (hexToRgb(themeOptions.primaryColor).map((v) => Math.min(255, v + 22)) as [number, number, number])
      : [33, 128, 141]; // teal-500 #21808d

    const accentColor: [number, number, number] = themeOptions?.secondaryColor
      ? hexToRgb(themeOptions.secondaryColor)
      : [50, 184, 198]; // teal-300 #32b8c6
    
    // Configurações do PDF
    pdf.setProperties({
      title: `Relatório de Análise de Solo - ${themeOptions?.organizationName || 'Fertilisolo'}`,
      author: themeOptions?.organizationName || 'Fertilisolo',
      subject: 'Análise e Recomendação de Fertilizantes',
      keywords: 'solo, fertilizantes, análise, agricultura'
    });

    // ======================= LAYOUT BASEADO EM Exemplo-relatorio.html =======================
    
    // Margens e dimensões
    const marginX = 16;
    const pageWidth = 210;
    const contentWidth = pageWidth - (marginX * 2);
    
    // ========== FUNÇÃO PARA DESENHAR HEADER EM TODAS AS PÁGINAS ==========
    const drawHeader = async () => {
      const headerHeight = 32;

      // Gradiente teal (cor do tema)
      for (let i = 0; i < 10; i++) {
        const alpha = i / 10;
        const r = primaryColor[0] + (primaryColorLight[0] - primaryColor[0]) * alpha;
        const g = primaryColor[1] + (primaryColorLight[1] - primaryColor[1]) * alpha;
        const b = primaryColor[2] + (primaryColorLight[2] - primaryColor[2]) * alpha;
        pdf.setFillColor(r, g, b);
        pdf.rect(0, i * (headerHeight / 10), pageWidth, headerHeight / 10, 'F');
      }

      // Barra de acento teal claro
      pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      pdf.rect(0, headerHeight, pageWidth, 4, 'F');
      
      // Logo no header
      if (themeOptions?.logo) {
        await addLogoToPage(pdf, themeOptions.logo, pageWidth, 8, true);
      }
      
      // Título do Header
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Plano de Ação de Fertilização', marginX, 18);
      
      // Subtítulo: Cultura e Talhão
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const culturaText = `Cultura: ${cultureName || soilData.crop || 'Não especificado'}`;
      const amostraText = `Talhão: ${farmName || soilData.location || 'Não especificado'}`;
      pdf.text(`${culturaText}     ${amostraText}`, marginX, 27);
    };
    
    // Desenhar header na primeira página
    await drawHeader();

    // ========== ALERT BOX AMARELO (igual ao HTML) ==========
    let currentY = 45;
    
    // Fundo amarelo com gradiente
    pdf.setFillColor(255, 249, 230); // #fff9e6
    pdf.roundedRect(marginX, currentY, contentWidth, 16, 8, 8, 'F');
    
    // Borda esquerda laranja grossa (4px)
    pdf.setFillColor(245, 158, 11); // #f59e0b
    pdf.roundedRect(marginX, currentY, 4, 16, 8, 8, 'F');
    
    // Ícone e texto do alert
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(146, 64, 14); // #92400e
    pdf.text('Importante', marginX + 8, currentY + 6);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const alertText = 'As fontes listadas em cada tabela são alternativas. Escolha APENAS UMA fonte para cada tipo de nutriente, de acordo com disponibilidade e custo no mercado local.';
    const splitAlert = pdf.splitTextToSize(alertText, contentWidth - 12);
    pdf.text(splitAlert, marginX + 8, currentY + 11);
    
    currentY += 24;

    // ========== TABELA DE DADOS DA ANÁLISE DE SOLO ==========
    const vPercent = results.saturations.Ca + results.saturations.Mg + results.saturations.K;

    const getVPercentLevel = (v: number): string => {
      if (v < 50) return 'Baixo — elevar para 60-70%';
      if (v < 60) return 'Médio';
      if (v <= 80) return 'Adequado';
      return 'Alto';
    };

    const getSatLevel = (v: number, min: number, max: number): string => {
      if (v < min) return 'Baixo';
      if (v > max) return 'Alto';
      return 'Adequado';
    };

    const pNivelDesc = interpretarFosforo(soilData.P || 0, soilData.argila || 0);

    const soilTableRows: string[][] = [
      ['CTC Total (T)',           `${(soilData.T || 0).toFixed(2)} cmolc/dm³`,   getCTCLevel(soilData.T)],
      ['Fósforo (P-resina)',      `${(soilData.P || 0).toFixed(1)} mg/dm³`,       pNivelDesc],
      ['Potássio (K)',            `${(soilData.K || 0).toFixed(1)} mg/dm³`,       getSatLevel(results.saturations.K, 2, 5)],
      ['Cálcio (Ca)',             `${(soilData.Ca || 0).toFixed(2)} cmolc/dm³`,   getSatLevel(results.saturations.Ca, 40, 60)],
      ['Magnésio (Mg)',           `${(soilData.Mg || 0).toFixed(2)} cmolc/dm³`,   getSatLevel(results.saturations.Mg, 10, 20)],
      ['Enxofre (S)',             `${(soilData.S || 0).toFixed(1)} mg/dm³`,       (soilData.S || 0) >= 10 ? 'Adequado' : 'Baixo'],
      ['Matéria Orgânica (MO)',   `${(soilData.organicMatter || 0).toFixed(1)} %`, getOrganicMatterLevel(soilData.organicMatter)],
      ['Argila',                  `${(soilData.argila || 0).toFixed(0)} %`,        getTextureClass(soilData.argila)],
      ['Saturação por Bases (V%)',`${vPercent.toFixed(1)} %`,                      getVPercentLevel(vPercent)],
      ['Saturação de Ca',         `${results.saturations.Ca.toFixed(1)} %`,        getSatLevel(results.saturations.Ca, 40, 60)],
      ['Saturação de Mg',         `${results.saturations.Mg.toFixed(1)} %`,        getSatLevel(results.saturations.Mg, 10, 20)],
      ['Saturação de K',          `${results.saturations.K.toFixed(1)} %`,         getSatLevel(results.saturations.K, 2, 5)],
      ['Relação Ca/Mg',           `${results.caeMgRatio.toFixed(1)}`,              results.caeMgRatio >= 3 && results.caeMgRatio <= 5 ? 'Adequado (3–5)' : 'Fora da faixa ideal'],
    ];

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('Dados da Análise de Solo', marginX, currentY + 5);

    autoTable(pdf, {
      startY: currentY + 8,
      head: [['Parâmetro', 'Valor', 'Interpretação']],
      body: soilTableRows,
      theme: 'plain',
      styles: { fontSize: 8.5, cellPadding: 2.5, textColor: [31, 41, 41], lineColor: [200, 215, 215], lineWidth: 0.15 },
      headStyles: {
        fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
        fontSize: 8.5,
      },
      alternateRowStyles: { fillColor: [242, 250, 250] },
      columnStyles: {
        0: { cellWidth: 65, fontStyle: 'bold' },
        1: { cellWidth: 50, halign: 'right' },
        2: { cellWidth: 'auto' },
      },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 2) {
          const v = String(data.cell.raw);
          if (v.startsWith('Baixo') || v.startsWith('Fora')) {
            data.cell.styles.textColor = [185, 28, 28];
          } else if (v === 'Alto') {
            data.cell.styles.textColor = [146, 64, 14];
          } else if (v.startsWith('Adequado') || v.startsWith('Médio') || v.startsWith('Alta') || v.startsWith('Média')) {
            data.cell.styles.textColor = [21, 128, 61];
          } else if (v.startsWith('Muito')) {
            data.cell.styles.textColor = [146, 64, 14];
          }
        }
      },
      margin: { left: marginX, right: marginX },
      tableWidth: contentWidth,
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentY = (pdf as any).lastAutoTable.finalY + 8;

    // ========== DIAGNÓSTICO DE FERTILIDADE ==========
    // Lógica extraída de SoilQualityScore.tsx e insights/ — sem React, pura lógica de negócio

    const calcQualityScore = (): number => {
      let s = 0, t = 0;
      (['Ca', 'Mg', 'K', 'P'] as const).forEach((n) => { t += 3; if (results.isAdequate[n]) s += 3; });
      t += 2.5; if (results.caeMgRatio >= 2 && results.caeMgRatio <= 5) s += 2.5;
      t += 1.5; if (results.isAdequate.S) s += 1.5;
      (['B', 'Cu', 'Fe', 'Mn', 'Zn', 'Mo'] as const).forEach((n) => { t += 1; if (results.isAdequate[n]) s += 1; });
      return Math.round((s / t) * 100);
    };

    type ScoreInfo = { category: string; description: string; priority: string; bg: [number,number,number]; fg: [number,number,number] };
    const getScoreInfo = (sc: number): ScoreInfo => {
      if (sc >= 90) return { category: 'Excepcional', description: 'Fertilidade excepcional — padrão de excelência agronômica',         priority: 'Manutenção', bg: [220, 252, 231], fg: [21, 128, 61]  };
      if (sc >= 80) return { category: 'Excelente',   description: 'Fertilidade excelente para alta produtividade sustentável',         priority: 'Otimização', bg: [220, 252, 231], fg: [21, 128, 61]  };
      if (sc >= 70) return { category: 'Muito Bom',   description: 'Boa fertilidade — pequenos ajustes podem maximizar o potencial',    priority: 'Ajuste Fino', bg: [254, 249, 195], fg: [133, 77, 14] };
      if (sc >= 60) return { category: 'Bom',         description: 'Solo adequado com oportunidades claras de melhoria',               priority: 'Melhorias', bg: [254, 249, 195], fg: [133, 77, 14]   };
      if (sc >= 45) return { category: 'Regular',     description: 'Correções estratégicas necessárias para otimizar a produtividade', priority: 'Correção', bg: [255, 237, 213], fg: [154, 52, 18]    };
      if (sc >= 30) return { category: 'Baixo',       description: 'Limitações que comprometem o potencial produtivo',                 priority: 'Intervenção', bg: [255, 237, 213], fg: [154, 52, 18] };
      return              { category: 'Crítico',      description: 'Graves desequilíbrios — intervenção urgente obrigatória',          priority: 'Emergencial', bg: [254, 226, 226], fg: [185, 28, 28] };
    };

    const qualityScore = calcQualityScore();
    const si = getScoreInfo(qualityScore);

    if (currentY > 195) { pdf.addPage(); await drawHeader(); currentY = 45; }

    // Banner de score
    pdf.setFillColor(si.bg[0], si.bg[1], si.bg[2]);
    pdf.roundedRect(marginX, currentY, contentWidth, 14, 4, 4, 'F');
    pdf.setDrawColor(si.fg[0], si.fg[1], si.fg[2]); pdf.setLineWidth(0.2);
    pdf.roundedRect(marginX, currentY, contentWidth, 14, 4, 4, 'S');

    // Círculo com pontuação
    pdf.setFillColor(si.fg[0], si.fg[1], si.fg[2]);
    pdf.circle(marginX + 9, currentY + 7, 5.5, 'F');
    pdf.setTextColor(255, 255, 255); pdf.setFontSize(8.5); pdf.setFont('helvetica', 'bold');
    pdf.text(String(qualityScore), marginX + 9, currentY + 8.5, { align: 'center' });

    // Título e descrição
    pdf.setFontSize(11); pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(si.fg[0], si.fg[1], si.fg[2]);
    pdf.text(`Diagnóstico de Fertilidade: ${si.category}`, marginX + 18, currentY + 6);
    pdf.setFontSize(8); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(75, 85, 99);
    pdf.text(si.description, marginX + 18, currentY + 11);

    // Prioridade à direita
    pdf.setFontSize(7.5); pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(si.fg[0], si.fg[1], si.fg[2]);
    pdf.text(`Prioridade: ${si.priority}`, pageWidth - marginX - 2, currentY + 8.5, { align: 'right' });

    currentY += 18;

    // Barras de progresso macros / micros
    const macroKeys = ['Ca', 'Mg', 'K', 'P', 'S'] as const;
    const microKeys = ['B', 'Cu', 'Fe', 'Mn', 'Zn', 'Mo'] as const;
    const macroOk = macroKeys.filter((k) => results.isAdequate[k]).length;
    const microOk = microKeys.filter((k) => results.isAdequate[k]).length;
    const halfW = contentWidth / 2 - 4;

    pdf.setFontSize(7.5); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(55, 65, 81);
    pdf.text(`Macronutrientes: ${macroOk}/${macroKeys.length} adequados`, marginX, currentY + 3);
    pdf.text(`Micronutrientes: ${microOk}/${microKeys.length} adequados`, marginX + halfW + 8, currentY + 3);

    const barColor = (ok: number, total: number): [number, number, number] =>
      ok === total ? [34, 197, 94] : ok >= total / 2 ? [234, 179, 8] : [239, 68, 68];

    [
      { x: marginX,            ok: macroOk, total: macroKeys.length, w: halfW },
      { x: marginX + halfW + 8, ok: microOk, total: microKeys.length, w: halfW - 4 },
    ].forEach(({ x, ok, total, w }) => {
      const bc = barColor(ok, total);
      pdf.setFillColor(229, 231, 235); pdf.roundedRect(x, currentY + 5, w, 3.5, 1, 1, 'F');
      pdf.setFillColor(bc[0], bc[1], bc[2]); pdf.roundedRect(x, currentY + 5, w * (ok / total), 3.5, 1, 1, 'F');
    });
    currentY += 14;

    // Fatores limitantes — autoTable (LimitingFactors.tsx logic)
    const limitingRows: string[][] = [];
    if (!results.isAdequate.P)             limitingRows.push(['Fósforo (P)',    'Limita desenvolvimento radicular e transferência energética', '9/10']);
    if (results.caeMgRatio < 2 || results.caeMgRatio > 5) limitingRows.push(['Relação Ca/Mg', 'Afeta estrutura do solo e absorção de nutrientes',          '8/10']);
    if (results.saturations.Ca < 40)       limitingRows.push(['Cálcio (Ca)',    'Compromete estrutura, parede celular e ativação enzimática',  '7/10']);
    if (!results.isAdequate.K)             limitingRows.push(['Potássio (K)',   'Reduz resistência a estresses e qualidade dos produtos',      '6/10']);
    const topFactors = limitingRows.sort((a, b) => Number(b[2].split('/')[0]) - Number(a[2].split('/')[0])).slice(0, 3);

    if (topFactors.length > 0) {
      if (currentY > 225) { pdf.addPage(); await drawHeader(); currentY = 45; }
      pdf.setFontSize(9); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(154, 52, 18);
      pdf.text('Fatores Limitantes Identificados', marginX, currentY + 4);
      autoTable(pdf, {
        startY: currentY + 6,
        head: [['Nutriente / Fator', 'Impacto no Potencial Produtivo', 'Prior.']],
        body: topFactors,
        theme: 'plain',
        styles: { fontSize: 8, cellPadding: 2, textColor: [55, 65, 81], lineColor: [252, 211, 77], lineWidth: 0.1 },
        headStyles: { fillColor: [255, 237, 213], textColor: [154, 52, 18], fontStyle: 'bold', halign: 'left', fontSize: 8 },
        alternateRowStyles: { fillColor: [255, 251, 235] },
        columnStyles: {
          0: { cellWidth: 38, fontStyle: 'bold' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 16, halign: 'center', fontStyle: 'bold', textColor: [154, 52, 18] as [number,number,number] },
        },
        margin: { left: marginX, right: marginX },
        tableWidth: contentWidth,
      });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentY = (pdf as any).lastAutoTable.finalY + 6;
    }

    // Padrões críticos (CriticalPatterns.tsx logic)
    const patterns: string[] = [];
    if (results.saturations.Ca > 70 && results.saturations.Mg < 10)          patterns.push('Excesso de cálcio + deficiência severa de Mg — pode causar compactação e antagonismo.');
    if (results.saturations.K  > 6  && results.saturations.Mg < 12)          patterns.push('Antagonismo K-Mg: excesso de K pode induzir deficiência de Mg, afetando a fotossíntese.');
    if (results.caeMgRatio < 2)                                               patterns.push('Relação Ca/Mg muito baixa — risco de compactação. Priorize calcário calcítico.');
    if (results.caeMgRatio > 8)                                               patterns.push('Relação Ca/Mg excessiva — pode induzir deficiência relativa de magnésio.');
    if ((soilData.P || 0) < 5 && results.saturations.Ca > 60)                patterns.push('Possível fixação de fósforo por excesso de cálcio. Use fontes de P mais solúveis.');
    if ((soilData.organicMatter || 0) < 2 && (soilData.T || 0) < 8)         patterns.push('Solo degradado: baixa CTC e MO indicam perda de qualidade físico-química.');

    if (patterns.length > 0) {
      if (currentY > 220) { pdf.addPage(); await drawHeader(); currentY = 45; }
      pdf.setFontSize(9); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(185, 28, 28);
      pdf.text('Padrões Críticos Detectados', marginX, currentY + 4);
      currentY += 7;
      for (const p of patterns) {
        const lines = pdf.splitTextToSize(`• ${p}`, contentWidth - 6);
        const rh = Array.isArray(lines) ? lines.length * 4.2 + 4 : 8;
        if (currentY + rh > 270) { pdf.addPage(); await drawHeader(); currentY = 45; }
        pdf.setFillColor(254, 242, 242);
        pdf.roundedRect(marginX, currentY, contentWidth, rh, 2, 2, 'F');
        pdf.setFontSize(8); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(75, 85, 99);
        pdf.text(lines, marginX + 4, currentY + 3.5);
        currentY += rh + 2;
      }
      currentY += 2;
    }

    // Estratégias de manejo (StrategicRecommendations.tsx logic)
    const insights: string[] = [];
    if (!results.isAdequate.Ca && results.needs.Ca > 2) {
      const st = results.saturations.Ca < 45 ? 'calcário calcítico' : 'gesso agrícola para melhorar o perfil';
      insights.push(`Ca: deficiência de ${results.needs.Ca.toFixed(1)} cmolc/dm³ — recomenda-se ${st}.`);
    }
    if (!results.isAdequate.Mg && results.caeMgRatio > 5)
      insights.push(`Mg: relação Ca/Mg desequilibrada (${results.caeMgRatio.toFixed(1)}:1) — prefira calcário dolomítico ou sulfato de Mg.`);
    if (!results.isAdequate.K && (soilData.T || 0) > 0)
      insights.push(`K: elevar saturação em ${((results.needs.K / (soilData.T || 1)) * 100).toFixed(1)}% — em solos argilosos, prefira sulfato de K.`);
    if (!results.isAdequate.P)
      insights.push(`P: nível atual ${soilData.P} mg/dm³ — ${(soilData.P || 0) < 8 ? 'aplicação a lanço + incorporação' : 'aplicação localizada no sulco'}.`);
    if (Object.values(results.isAdequate).filter((v) => !v).length >= 5)
      insights.push('Múltiplas deficiências detectadas — correção sequencial: 1º pH/bases, 2º fósforo, 3º micronutrientes.');

    if (insights.length > 0) {
      if (currentY > 220) { pdf.addPage(); await drawHeader(); currentY = 45; }
      pdf.setFontSize(9); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(29, 78, 216);
      pdf.text('Estratégias de Manejo Recomendadas', marginX, currentY + 4);
      currentY += 7;
      for (const ins of insights) {
        const lines = pdf.splitTextToSize(`• ${ins}`, contentWidth - 6);
        const rh = Array.isArray(lines) ? lines.length * 4.2 + 4 : 8;
        if (currentY + rh > 270) { pdf.addPage(); await drawHeader(); currentY = 45; }
        pdf.setFillColor(239, 246, 255);
        pdf.roundedRect(marginX, currentY, contentWidth, rh, 2, 2, 'F');
        pdf.setFontSize(8); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(75, 85, 99);
        pdf.text(lines, marginX + 4, currentY + 3.5);
        currentY += rh + 2;
      }
      currentY += 3;
    }

    // ========== ANÁLISE VISUAL DOS NUTRIENTES (BARRAS PROPORCIONAIS) ==========

    const getNutrientLevel = (value: number, min: number, max?: number): string => {
      if (value < min) return 'Baixo';
      if (max && value > max) return 'Alto';
      return 'Adequado';
    };

    const getNutrientLevelWithSaturation = (nutrient: string): string => {
      switch (nutrient) {
        case 'K':  return results.isAdequate.K  ? 'Adequado' : (results.saturations.K  > 5    ? 'Alto' : 'Baixo');
        case 'Ca': return results.isAdequate.Ca ? 'Adequado' : (results.saturations.Ca > 60   ? 'Alto' : 'Baixo');
        case 'Mg': return results.isAdequate.Mg ? 'Adequado' : (results.saturations.Mg > 20.5 ? 'Alto' : 'Baixo');
        default:   return 'Adequado';
      }
    };

    // Intervalos de referência para barras proporcionais ao valor real
    const nutrientRanges: Record<string, number> = {
      P: 40, K: 250, Ca: 8, Mg: 3, S: 40,
      B: 1.0, Zn: 3, Cu: 2.5, Mn: 50, Fe: 60, Mo: 0.3,
    };

    const drawNutrientBar = (
      label: string,
      value: number,
      nivel: string,
      yPos: number,
      isLeft: boolean = true,
      unit: string = '',
      nutrientKey: string = ''
    ) => {
      const xStart = isLeft ? marginX + 6 : pageWidth / 2 + 2;
      const labelWidth = 10;
      const valueWidth = 22;
      const nivelWidth = 18;
      const availableWidth = isLeft ? (pageWidth / 2 - marginX - 14) : (pageWidth / 2 - marginX - 8);
      const barAreaWidth = availableWidth - labelWidth - valueWidth - nivelWidth;

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(55, 65, 81);
      pdf.text(label, xStart, yPos + 3);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.text(`${value.toFixed(1)} ${unit}`, xStart + labelWidth + 2, yPos + 3);

      let barColor: number[];
      if (nivel === 'Baixo') barColor = [239, 68, 68];
      else if (nivel === 'Alto') barColor = [251, 146, 60];
      else barColor = [34, 197, 94];

      // Barra proporcional ao valor real (não mais fixo 30/70/100%)
      const maxRef = nutrientRanges[nutrientKey];
      const barPercent = maxRef ? Math.min(value / maxRef, 1.0) : (nivel === 'Baixo' ? 0.3 : nivel === 'Alto' ? 1.0 : 0.7);

      const barStartX = xStart + labelWidth + valueWidth + 2;
      pdf.setFillColor(229, 231, 235);
      pdf.roundedRect(barStartX, yPos - 2, barAreaWidth, 5, 2, 2, 'F');
      pdf.setFillColor(barColor[0], barColor[1], barColor[2]);
      pdf.roundedRect(barStartX, yPos - 2, barAreaWidth * Math.max(barPercent, 0.04), 5, 2, 2, 'F');

      pdf.setFontSize(7);
      pdf.setTextColor(barColor[0], barColor[1], barColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text(String(nivel), barStartX + barAreaWidth + 2, yPos + 3);
    };

    // Verificar quebra de página antes da análise visual
    if (currentY > 190) { pdf.addPage(); await drawHeader(); currentY = 45; }

    pdf.setFillColor(252, 251, 245);
    pdf.roundedRect(marginX, currentY, contentWidth, 55, 8, 8, 'F');
    pdf.setDrawColor(94, 82, 64);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(marginX, currentY, contentWidth, 55, 8, 8, 'S');

    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('Análise Visual de Necessidades', marginX + 6, currentY + 7);

    let barY = currentY + 14;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(107, 114, 128);
    pdf.text('Macronutrientes', marginX + 6, barY);
    barY += 5;

    const pNivel = interpretarFosforo(soilData.P || 0, soilData.argila || 0);
    let pNivelSimplificado = 'Adequado';
    if (pNivel === 'Muito Baixo' || pNivel === 'Baixo') pNivelSimplificado = 'Baixo';
    else if (pNivel === 'Muito Alto') pNivelSimplificado = 'Alto';

    drawNutrientBar('P',  soilData.P  || 0, pNivelSimplificado,                         barY, true,  'mg/dm³',    'P');  barY += 6;
    drawNutrientBar('K',  soilData.K  || 0, getNutrientLevelWithSaturation('K'),         barY, true,  'mg/dm³',    'K');  barY += 6;
    drawNutrientBar('Ca', soilData.Ca || 0, getNutrientLevelWithSaturation('Ca'),        barY, true,  'cmolc/dm³', 'Ca'); barY += 6;
    drawNutrientBar('Mg', soilData.Mg || 0, getNutrientLevelWithSaturation('Mg'),        barY, true,  'cmolc/dm³', 'Mg'); barY += 6;
    drawNutrientBar('S',  soilData.S  || 0, (soilData.S || 0) >= 10 ? 'Adequado' : 'Baixo', barY, true, 'mg/dm³', 'S');

    barY = currentY + 14;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(107, 114, 128);
    pdf.text('Micronutrientes', pageWidth / 2 + 2, barY);
    barY += 5;

    drawNutrientBar('B',  soilData.B  || 0, getNutrientLevel(soilData.B  || 0, 0.2, 0.6),  barY, false, 'mg/dm³', 'B');  barY += 6;
    drawNutrientBar('Zn', soilData.Zn || 0, getNutrientLevel(soilData.Zn || 0, 0.5, 1.2),  barY, false, 'mg/dm³', 'Zn'); barY += 6;
    drawNutrientBar('Cu', soilData.Cu || 0, getNutrientLevel(soilData.Cu || 0, 0.8, 1.2),  barY, false, 'mg/dm³', 'Cu'); barY += 6;
    drawNutrientBar('Mn', soilData.Mn || 0, getNutrientLevel(soilData.Mn || 0, 5,   12),   barY, false, 'mg/dm³', 'Mn'); barY += 6;
    drawNutrientBar('Fe', soilData.Fe || 0, getNutrientLevel(soilData.Fe || 0, 12,  30),   barY, false, 'mg/dm³', 'Fe'); barY += 6;
    if (soilData.Mo !== undefined && soilData.Mo > 0) {
      drawNutrientBar('Mo', soilData.Mo, getNutrientLevel(soilData.Mo, 0.1, 0.2), barY, false, 'mg/dm³', 'Mo');
    }

    currentY += 63;

    // ========== NECESSIDADES DE CORREÇÃO ==========
    // (NeedsCard.tsx logic — exibe quantidades para atingir os níveis ideais)
    if (currentY > 215) { pdf.addPage(); await drawHeader(); currentY = 45; }

    pdf.setFontSize(11); pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('Necessidades de Correção', marginX, currentY + 5);

    const needsRows: string[][] = [
      ['Cálcio (Ca)',   `${results.needs.Ca.toFixed(2)} cmolc/dm³`, results.needs.Ca > 0 ? `${convertCaNeedToKgHa(results.needs.Ca)} kg/ha de CaO`  : '—', results.needs.Ca > 0 ? 'Deficiente' : 'Adequado'],
      ['Magnésio (Mg)', `${results.needs.Mg.toFixed(2)} cmolc/dm³`, results.needs.Mg > 0 ? `${convertMgNeedToKgHa(results.needs.Mg)} kg/ha de MgO` : '—', results.needs.Mg > 0 ? 'Deficiente' : 'Adequado'],
      ['Potássio (K)',  `${results.needs.K.toFixed(3)} cmolc/dm³`,  results.needs.K  > 0 ? `${convertKNeedToKgHa(results.needs.K)} kg/ha de K₂O`   : '—', results.needs.K  > 0 ? 'Deficiente' : 'Adequado'],
      ['Fósforo (P)',   `${results.needs.P.toFixed(1)} kg/ha`,      '—',                                                                                  results.needs.P  > 0 ? 'Deficiente' : 'Adequado'],
    ];

    autoTable(pdf, {
      startY: currentY + 8,
      head: [['Nutriente', 'Necessidade (cmolc ou kg/ha)', 'Equivalente Corretivo', 'Status']],
      body: needsRows,
      theme: 'plain',
      styles: { fontSize: 8.5, cellPadding: 2.5, textColor: [31, 41, 41], lineColor: [200, 215, 215], lineWidth: 0.15 },
      headStyles: { fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'left', fontSize: 8.5 },
      alternateRowStyles: { fillColor: [242, 250, 250] },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold' },
        1: { cellWidth: 50, halign: 'right' },
        2: { cellWidth: 65 },
        3: { cellWidth: 'auto' },
      },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 3) {
          const v = String(data.cell.raw);
          data.cell.styles.textColor = v === 'Adequado' ? [21, 128, 61] : [185, 28, 28];
          data.cell.styles.fontStyle = 'bold';
        }
      },
      margin: { left: marginX, right: marginX },
      tableWidth: contentWidth,
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentY = (pdf as any).lastAutoTable.finalY + 10;

    // ========== FUNÇÃO HELPER: Desenhar Badge Colorido ==========
    const drawBadge = (text: string, x: number, y: number, type: string) => {
      const badgeColors: Record<string, { bg: number[]; text: number[] }> = {
        foliar:      { bg: [220, 252, 231], text: [21, 128, 61] },
        sulco:       { bg: [254, 243, 199], text: [146, 64, 14] },
        lanco:       { bg: [243, 232, 255], text: [107, 33, 168] },
        incorporado: { bg: [243, 232, 255], text: [107, 33, 168] },
        cobertura:   { bg: [224, 242, 254], text: [3, 105, 161] },
        sementes:    { bg: [224, 242, 254], text: [3, 105, 161] },
      };
      const c = badgeColors[type] || { bg: [240, 240, 240], text: [0, 0, 0] };
      pdf.setFillColor(c.bg[0], c.bg[1], c.bg[2]);
      pdf.roundedRect(x, y - 3, 24, 5.5, 2, 2, 'F');
      pdf.setTextColor(c.text[0], c.text[1], c.text[2]);
      pdf.setFontSize(9); // era 7 — aumentado para legibilidade
      pdf.setFont('helvetica', 'normal');
      pdf.text(text, x + 12, y, { align: 'center' });
    };

    // ========== HELPER: Altura dinâmica de card ==========
    // Cada linha de tabela ≈ 8 mm (fontSize 8.5 + cellPadding 2.5×2)
    const ROW_H = 8;
    const HEAD_H = 9;
    const CARD_TOP = 20; // título + descrição
    const CARD_PAD = 8;  // padding inferior

    const calcCardHeight = (rowCount: number) =>
      CARD_TOP + HEAD_H + rowCount * ROW_H + CARD_PAD;

    const drawCardBg = (y: number, h: number) => {
      pdf.setFillColor(252, 251, 245);
      pdf.roundedRect(marginX, y, contentWidth, h, 8, 8, 'F');
      pdf.setDrawColor(94, 82, 64);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(marginX, y, contentWidth, h, 8, 8, 'S');
    };

    // Estilos compartilhados das tabelas de seção
    const sectionTableStyles = {
      theme: 'plain' as const,
      styles: { fontSize: 8.5, cellPadding: 2.5, textColor: [55, 65, 81] as [number,number,number], lineColor: [94, 82, 64] as [number,number,number], lineWidth: 0.1 },
      headStyles: { fillColor: [248, 249, 250] as [number,number,number], textColor: [primaryColor[0], primaryColor[1], primaryColor[2]] as [number,number,number], fontStyle: 'bold' as const, halign: 'left' as const, fontSize: 8.5 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 25, halign: 'right' as const, textColor: [5, 150, 105] as [number,number,number], fontStyle: 'bold' as const },
        2: { cellWidth: 20 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 },
      },
      margin: { left: marginX + 6, right: marginX + 6 },
      tableWidth: contentWidth - 12,
    };

    // ========== CARD 1: CORREÇÃO DE SOLO ==========
    const section1Rows = ([
      ['calc_dolomitico',  ['Calcário Dolomítico (Ca+Mg)', '2.000', 'kg/ha', '', 'Pré-plantio']],
      ['calc_calcitico',   ['Calcário Calcítico (Ca)',      '1.800', 'kg/ha', '', 'Pré-plantio']],
      ['calc_magnesiano',  ['Calcário Magnesiano (Ca+Mg)', '2.200', 'kg/ha', '', 'Pré-plantio']],
      ['gesso_agricola',   ['Gesso Agrícola (Ca+S)',        '1.000', 'kg/ha', '', 'Pré-plantio']],
      ['sulfato_mg',       ['Sulfato de Magnésio (Mg+S)',   '150',   'kg/ha', '', 'Pré-plantio']],
      ['cal_virgem',       ['Cal Virgem (Ca)',               '1.200', 'kg/ha', '', 'Pré-plantio']],
    ] as [string, string[]][]).filter(([id]) => isSelected(id)).map(([, row]) => row);

    if (section1Rows.length > 0) {
      if (currentY > 200) { pdf.addPage(); await drawHeader(); currentY = 45; }
      drawCardBg(currentY, calcCardHeight(section1Rows.length));
      pdf.setFontSize(15); pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text('1. Correção de Solo (Pré-Plantio)', marginX + 6, currentY + 8);
      pdf.setFontSize(9); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(107, 114, 128);
      pdf.text('Correção da acidez do solo e fornecimento de Ca e Mg. Aplicar 60-90 dias antes do plantio.', marginX + 6, currentY + 14);
      autoTable(pdf, {
        startY: currentY + 18,
        head: [['Fonte de Fertilizante', 'Quantidade', 'Unidade', 'Método', 'Estágio']],
        body: section1Rows,
        ...sectionTableStyles,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
        willDrawCell: (data: any) => { if (data.column.index === 3 && data.section === 'body') data.cell.text = ['']; },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
        didDrawCell: (data: any) => {
          if (data.column.index === 3 && data.section === 'body')
            drawBadge('A lanço', data.cell.x + 5, data.cell.y + data.cell.height / 2 + 1, 'lanco');
        },
      });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentY = (pdf as any).lastAutoTable.finalY + 10;
    }
    
    // ========== CARD 2: ADUBAÇÃO DE BASE ==========
    const section2Rows = ([
      ['superf_simples', ['Superfosfato Simples',        '400', 'kg/ha', '', 'Plantio']],
      ['superf_triplo',  ['Superfosfato Triplo',          '180', 'kg/ha', '', 'Plantio']],
      ['map',            ['MAP (Fosfato Monoamônico)',    '150', 'kg/ha', '', 'Plantio']],
      ['kcl',            ['Cloreto de Potássio (KCl)',   '150', 'kg/ha', '', 'Plantio']],
      ['sulfato_k',      ['Sulfato de Potássio',          '180', 'kg/ha', '', 'Plantio']],
      ['npk_04_14_08',   ['NPK 04-14-08',                '350', 'kg/ha', '', 'Plantio']],
      ['npk_10_10_10',   ['NPK 10-10-10',                '300', 'kg/ha', '', 'Plantio']],
    ] as [string, string[]][]).filter(([id]) => isSelected(id)).map(([, row]) => row);

    if (section2Rows.length > 0) {
      if (currentY > 200) { pdf.addPage(); await drawHeader(); currentY = 45; }
      drawCardBg(currentY, calcCardHeight(section2Rows.length));
      pdf.setFontSize(15); pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text('2. Adubação de Base (Plantio)', marginX + 6, currentY + 8);
      pdf.setFontSize(9); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(107, 114, 128);
      pdf.text(
        pdf.splitTextToSize('Fontes de Fósforo (P), Potássio (K) e Fórmulas NPK. Escolha uma opção de P e uma de K, ou uma formulação NPK completa.', contentWidth - 12),
        marginX + 6, currentY + 14
      );
      autoTable(pdf, {
        startY: currentY + 22,
        head: [['Fonte de Fertilizante', 'Quantidade', 'Unidade', 'Método', 'Estágio']],
        body: section2Rows,
        ...sectionTableStyles,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
        willDrawCell: (data: any) => { if (data.column.index === 3 && data.section === 'body') data.cell.text = ['']; },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
        didDrawCell: (data: any) => {
          if (data.column.index === 3 && data.section === 'body')
            drawBadge('Sulco', data.cell.x + 5, data.cell.y + data.cell.height / 2 + 1, 'sulco');
        },
      });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentY = (pdf as any).lastAutoTable.finalY + 10;
    }

    // ========== CARD 3: ADUBAÇÃO DE COBERTURA (NITROGÊNIO) ==========
    const stageInfo = getCropStageInfo(cultureName);
    const section3Rows = ([
      ['ureia',            ['Ureia (45% N)',              '100', 'kg/ha', '', stageInfo.nitrogenStages[0]]],
      ['sulfato_amonio',   ['Sulfato de Amônio (21% N)', '200', 'kg/ha', '', stageInfo.nitrogenStages[1]]],
      ['nitrato_amonio',   ['Nitrato de Amônio (33% N)', '140', 'kg/ha', '', stageInfo.nitrogenStages[2]]],
      ['ureia_revestida',  ['Ureia Revestida (44% N)',   '105', 'kg/ha', '', stageInfo.nitrogenStages[3]]],
      ['nitrato_calcio_n', ['Nitrato de Cálcio (15% N)', '300', 'kg/ha', '', stageInfo.nitrogenStages[4]]],
    ] as [string, string[]][]).filter(([id]) => isSelected(id)).map(([, row]) => row);

    if (section3Rows.length > 0) {
      if (currentY > 190) { pdf.addPage(); await drawHeader(); currentY = 45; }
      const descText3 = pdf.splitTextToSize(stageInfo.description, contentWidth - 12);
      const descH3 = Array.isArray(descText3) ? descText3.length * 4.5 : 4.5;
      const cardH3 = CARD_TOP + descH3 + HEAD_H + section3Rows.length * ROW_H + CARD_PAD;
      drawCardBg(currentY, cardH3);
      pdf.setFontSize(15); pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text('3. Adubação de Cobertura (Nitrogênio)', marginX + 6, currentY + 8);
      pdf.setFontSize(9); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(107, 114, 128);
      pdf.text(descText3, marginX + 6, currentY + 14);
      autoTable(pdf, {
        startY: currentY + 14 + descH3 + 4,
        head: [['Fonte de Fertilizante', 'Quantidade', 'Unidade', 'Método', 'Estágio']],
        body: section3Rows,
        ...sectionTableStyles,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
        willDrawCell: (data: any) => { if (data.column.index === 3 && data.section === 'body') data.cell.text = ['']; },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
        didDrawCell: (data: any) => {
          if (data.column.index === 3 && data.section === 'body')
            drawBadge('Cobertura', data.cell.x + 5, data.cell.y + data.cell.height / 2 + 1, 'cobertura');
        },
      });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentY = (pdf as any).lastAutoTable.finalY + 10;
    }

    // ========== CARD 4: MICRONUTRIENTES ==========
    const microStageInfo = getCropStageInfo(cultureName);
    const section4Rows = ([
      ['acido_borico',     ['Ácido Bórico',         '2.0', 'kg/ha', 'foliar',   microStageInfo.microStages[0]]],
      ['borax',            ['Bórax',                 '3.0', 'kg/ha', 'foliar',   microStageInfo.microStages[1]]],
      ['sulfato_zinco',    ['Sulfato de Zinco',      '3.0', 'kg/ha', 'foliar',   microStageInfo.microStages[2]]],
      ['oxido_zinco',      ['Óxido de Zinco',        '2.0', 'kg/ha', 'foliar',   microStageInfo.microStages[3]]],
      ['sulfato_cobre',    ['Sulfato de Cobre',      '1.5', 'kg/ha', 'foliar',   microStageInfo.microStages[4]]],
      ['oxido_cobre',      ['Óxido de Cobre',        '4.0', 'kg/ha', 'foliar',   microStageInfo.microStages[5]]],
      ['sulfato_manganes', ['Sulfato de Manganês',   '3.0', 'kg/ha', 'foliar',   microStageInfo.microStages[6]]],
      ['oxido_manganes',   ['Óxido de Manganês',     '2.5', 'kg/ha', 'foliar',   microStageInfo.microStages[7]]],
      ['molibdato_sodio',  ['Molibdato de Sódio',    '0.1', 'kg/ha', 'sementes', microStageInfo.microStages[8]]],
    ] as [string, string[]][]).filter(([id]) => isSelected(id)).map(([, row]) => row);

    if (section4Rows.length > 0) {
      if (currentY > 190) { pdf.addPage(); await drawHeader(); currentY = 45; }
      drawCardBg(currentY, calcCardHeight(section4Rows.length));
      pdf.setFontSize(15); pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text('4. Suplementação de Micronutrientes', marginX + 6, currentY + 8);
      pdf.setFontSize(9); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(107, 114, 128);
      pdf.text('Correção de deficiências de B, Zn, Cu, Mn e Mo. Aplicação foliar ou tratamento de sementes.', marginX + 6, currentY + 14);
      autoTable(pdf, {
        startY: currentY + 22,
        head: [['Fonte de Fertilizante', 'Quantidade', 'Unidade', 'Método', 'Estágio']],
        body: section4Rows,
        ...sectionTableStyles,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
        willDrawCell: (data: any) => { if (data.column.index === 3 && data.section === 'body') data.cell.text = ['']; },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
        didDrawCell: (data: any) => {
          if (data.column.index === 3 && data.section === 'body') {
            const isSem = data.cell.raw === 'sementes';
            drawBadge(isSem ? 'Sementes' : 'Foliar', data.cell.x + 5, data.cell.y + data.cell.height / 2 + 1, isSem ? 'sementes' : 'foliar');
          }
        },
      });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentY = (pdf as any).lastAutoTable.finalY + 10;
    }

    // ========== CARD 5: MANEJO ORGÂNICO ==========
    const section5Rows = ([
      ['esterco_bovino',    ['Esterco Bovino Curtido', '10.000', 'kg/ha', '', 'Pré-plantio']],
      ['composto_organico', ['Composto Orgânico',       '5.000', 'kg/ha', '', 'Pré-plantio']],
    ] as [string, string[]][]).filter(([id]) => isSelected(id)).map(([, row]) => row);

    if (section5Rows.length > 0) {
      if (currentY > 225) { pdf.addPage(); await drawHeader(); currentY = 45; }
      drawCardBg(currentY, calcCardHeight(section5Rows.length));
      pdf.setFontSize(15); pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text('5. Manejo Orgânico (Opcional)', marginX + 6, currentY + 8);
      pdf.setFontSize(9); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(107, 114, 128);
      pdf.text('Melhoria da estrutura do solo e fornecimento gradual de nutrientes. Aplicar 30-45 dias antes do plantio.', marginX + 6, currentY + 14);
      autoTable(pdf, {
        startY: currentY + 22,
        head: [['Fonte de Fertilizante', 'Quantidade', 'Unidade', 'Método', 'Estágio']],
        body: section5Rows,
        ...sectionTableStyles,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
        willDrawCell: (data: any) => { if (data.column.index === 3 && data.section === 'body') data.cell.text = ['']; },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
        didDrawCell: (data: any) => {
          if (data.column.index === 3 && data.section === 'body')
            drawBadge('Incorporado', data.cell.x + 5, data.cell.y + data.cell.height / 2 + 1, 'incorporado');
        },
      });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentY = (pdf as any).lastAutoTable.finalY + 10;
    }

    // ========== BLOCO CONCLUSÃO / PRIORIDADES ==========
    const nutrientNames: Record<string, string> = {
      Ca: 'Cálcio', Mg: 'Magnésio', K: 'Potássio', P: 'Fósforo',
      S: 'Enxofre', B: 'Boro', Cu: 'Cobre', Fe: 'Ferro', Mn: 'Manganês', Zn: 'Zinco', Mo: 'Molibdênio',
    };
    const deficientes = Object.entries(results.isAdequate)
      .filter(([, ok]) => !ok)
      .map(([k]) => k);

    if (currentY > 230) { pdf.addPage(); await drawHeader(); currentY = 45; }

    const conclusionH = 14 + (deficientes.length === 0 ? 12 : Math.min(deficientes.length, 3) * 6 + 12);
    pdf.setFillColor(237, 247, 237);
    pdf.roundedRect(marginX, currentY, contentWidth, conclusionH, 6, 6, 'F');
    pdf.setDrawColor(21, 128, 61); pdf.setLineWidth(0.4);
    pdf.roundedRect(marginX, currentY, contentWidth, conclusionH, 6, 6, 'S');
    pdf.setFillColor(21, 128, 61);
    pdf.rect(marginX, currentY, 4, conclusionH, 'F');

    pdf.setFontSize(12); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(21, 128, 61);
    pdf.text('Conclusão e Prioridades', marginX + 8, currentY + 7);
    pdf.setFontSize(8.5); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(31, 41, 41);

    if (deficientes.length === 0) {
      pdf.text('Todos os nutrientes estão em níveis adequados. Recomenda-se adubação de manutenção conforme produtividade esperada.', marginX + 8, currentY + 14);
    } else {
      const defNames = deficientes.map((k) => nutrientNames[k] || k).join(', ');
      pdf.text(`Nutrientes em deficiência: ${defNames}.`, marginX + 8, currentY + 14);
      const priorities: string[] = [];
      if (deficientes.some((d) => ['Ca', 'Mg'].includes(d))) priorities.push('1ª Prioridade: Calagem (Ca/Mg) — aplicar 60-90 dias antes do plantio');
      if (deficientes.some((d) => ['P', 'K'].includes(d))) priorities.push(`${priorities.length + 1}ª Prioridade: Adubação de base com P e/ou K no sulco de plantio`);
      if (deficientes.some((d) => ['B', 'Cu', 'Fe', 'Mn', 'Zn', 'Mo'].includes(d))) priorities.push(`${priorities.length + 1}ª Prioridade: Micronutrientes via foliar nos estágios iniciais`);
      let prioY = currentY + 21;
      priorities.forEach((p) => { pdf.text(p, marginX + 8, prioY); prioY += 6; });
    }
    currentY += conclusionH + 10;

    // ========== CRONOGRAMA DE IMPLEMENTAÇÃO ==========
    // (ImplementationPlan.tsx logic — fases baseadas no qualityScore)
    if (currentY > 230) { pdf.addPage(); await drawHeader(); currentY = 45; }

    type Phase = { title: string; desc: string; period: string; bg: [number,number,number]; fg: [number,number,number] };
    const phases: Phase[] = [];
    if (qualityScore < 60) phases.push({ title: '1ª Fase — Emergencial',   desc: 'Correção de pH e saturação de bases. Aplicação de calcário e fósforo corretivo.',                 period: '0–30 dias',  bg: [254, 226, 226], fg: [185, 28, 28]  });
    if (qualityScore < 80) phases.push({ title: '2ª Fase — Balanceamento', desc: 'Ajuste de K e Mg, correção de micronutrientes deficientes.',                                        period: '30–90 dias', bg: [255, 237, 213], fg: [154, 52, 18]  });
    phases.push(                         { title: '3ª Fase — Otimização',   desc: 'Ajustes finos e aplicação de micronutrientes específicos conforme resposta da cultura.',            period: '90–120 dias',bg: [219, 234, 254], fg: [29, 78, 216]   });
    phases.push(                         { title: '4ª Fase — Monitoramento',desc: 'Nova análise de solo e ajustes baseados na produtividade e resposta da cultura plantada.',         period: '4–6 meses',  bg: [220, 252, 231], fg: [21, 128, 61]   });

    pdf.setFontSize(11); pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('Cronograma de Implementação', marginX, currentY + 5);
    currentY += 9;

    const phaseW = (contentWidth - (phases.length - 1) * 3) / phases.length;
    const phaseH = 22;

    phases.forEach((ph, i) => {
      const px = marginX + i * (phaseW + 3);
      pdf.setFillColor(ph.bg[0], ph.bg[1], ph.bg[2]);
      pdf.roundedRect(px, currentY, phaseW, phaseH, 4, 4, 'F');
      pdf.setDrawColor(ph.fg[0], ph.fg[1], ph.fg[2]); pdf.setLineWidth(0.2);
      pdf.roundedRect(px, currentY, phaseW, phaseH, 4, 4, 'S');

      pdf.setFontSize(7.5); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(ph.fg[0], ph.fg[1], ph.fg[2]);
      const titleLines = pdf.splitTextToSize(ph.title, phaseW - 4);
      pdf.text(titleLines, px + 3, currentY + 5);

      pdf.setFontSize(7); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(75, 85, 99);
      const descLines = pdf.splitTextToSize(ph.desc, phaseW - 4);
      pdf.text(descLines, px + 3, currentY + 9);

      pdf.setFontSize(7); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(ph.fg[0], ph.fg[1], ph.fg[2]);
      pdf.text(ph.period, px + 3, currentY + phaseH - 2);
    });

    currentY += phaseH + 10;

    // ========== BLOCO RESPONSÁVEL TÉCNICO ==========
    if (currentY > 248) { pdf.addPage(); await drawHeader(); currentY = 45; }

    pdf.setFillColor(252, 252, 249);
    pdf.roundedRect(marginX, currentY, contentWidth, 30, 6, 6, 'F');
    pdf.setDrawColor(180, 190, 190); pdf.setLineWidth(0.3);
    pdf.roundedRect(marginX, currentY, contentWidth, 30, 6, 6, 'S');
    pdf.setFontSize(9); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(98, 108, 113);
    pdf.text('Responsável Técnico', marginX + 4, currentY + 7);

    const col1X = marginX + 4;
    const col2X = marginX + contentWidth / 2 + 4;
    const lineLen = contentWidth / 2 - 16;
    const lineY1 = currentY + 16;
    const lineY2 = currentY + 26;

    pdf.setDrawColor(160, 168, 168); pdf.setLineWidth(0.3);
    [[col1X, lineY1], [col2X, lineY1], [col1X, lineY2], [col2X, lineY2]].forEach(([x, y]) =>
      pdf.line(x, y, x + lineLen, y)
    );
    pdf.setFontSize(7.5); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(140, 148, 148);
    pdf.text('Nome / Engenheiro Agrônomo', col1X, lineY1 + 4);
    pdf.text('CREA / Registro Profissional',  col2X, lineY1 + 4);
    pdf.text('Data e Local',                  col1X, lineY2 + 4);
    pdf.text('Assinatura',                    col2X, lineY2 + 4);

    currentY += 38;

    // ========== FOOTER ==========
    if (currentY > 272) { pdf.addPage(); await drawHeader(); currentY = 45; }

    pdf.setFontSize(9); pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text(
      themeOptions?.organizationName || 'Fertilisolo — Sistema de Interpretação e Recomendação de Análise de Solos',
      marginX, currentY + 6
    );
    pdf.setFontSize(7.5); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(130, 140, 140);
    const dataCompleta = new Date().toLocaleDateString('pt-BR', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    pdf.text(`Gerado em: ${dataCompleta}`, marginX, currentY + 11);
    pdf.setFont('helvetica', 'italic');
    pdf.text(
      pdf.splitTextToSize('Este relatório é uma recomendação técnica baseada na análise de solo. Consulte sempre um engenheiro agrônomo para ajustes específicos da sua propriedade.', pageWidth - 30),
      marginX, currentY + 16
    );

    // ========== NUMERAÇÃO DE PÁGINAS ==========
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalPages = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(160, 168, 168);
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - marginX, 291, { align: 'right' });
    }

    const filename = `Fertilisolo_Relatorio_${soilData.location || farmName || 'Analise'}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
    return { pdf, filename };
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};

export default generatePDF;
