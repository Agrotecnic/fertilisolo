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
  themeOptions?: PDFThemeOptions
) => {
  try {
    console.log('📄 generatePDFReport - Opções de tema recebidas:', {
      hasPrimaryColor: !!themeOptions?.primaryColor,
      primaryColor: themeOptions?.primaryColor,
      hasLogo: !!themeOptions?.logo,
      organizationName: themeOptions?.organizationName
    });
    
    // Usar a função generatePDF que já tem todas as páginas incluindo a primeira
    const { pdf, filename } = await generatePDF(soilData, undefined, undefined, cultureName, themeOptions);
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

export const generatePDF = async (
  soilData: SoilData, 
  farmName?: string, 
  plotName?: string, 
  cultureName?: string,
  themeOptions?: PDFThemeOptions
) => {
  try {
    console.log('📄 generatePDF - Opções de tema recebidas:', {
      hasPrimaryColor: !!themeOptions?.primaryColor,
      primaryColor: themeOptions?.primaryColor,
      hasLogo: !!themeOptions?.logo,
      organizationName: themeOptions?.organizationName
    });
    
    const pdf = new jsPDF();
    
    // Paleta de cores moderna EXATAMENTE DO MODELO HTML
    const colors = {
      // Header gradient
      navyDark: [26, 43, 74] as [number, number, number],    // #1a2b4a
      navyMedium: [45, 74, 115] as [number, number, number], // #2d4a73
      
      // Accent bar
      blueAccent: [0, 123, 255] as [number, number, number], // #007bff
      blueLight: [0, 212, 255] as [number, number, number],  // #00d4ff
      
      // Surface/Cards (cream/bege suave)
      creamBg: [252, 252, 249] as [number, number, number],  // #fcfcf9
      creamSurface: [255, 255, 253] as [number, number, number], // #fffffd
      
      // Table header (cinza gradiente)
      grayTableStart: [248, 249, 250] as [number, number, number], // #f8f9fa
      grayTableEnd: [233, 236, 239] as [number, number, number],   // #e9ecef
      
      // Borders & text
      grayBorder: [94, 82, 64] as [number, number, number],  // brown-600 com opacity
      grayText: [98, 108, 113] as [number, number, number],  // slate-500
      textPrimary: [19, 52, 59] as [number, number, number], // slate-900
      
      // Status colors
      success: [5, 150, 105] as [number, number, number],    // #059669
      warning: [245, 158, 11] as [number, number, number],   // #f59e0b
      warningBg: [255, 249, 230] as [number, number, number], // #fff9e6
      warningText: [146, 64, 14] as [number, number, number], // #92400e
    };
    
    // Cor primária do tema ou padrão azul navy
    const primaryColor: [number, number, number] = themeOptions?.primaryColor
      ? hexToRgb(themeOptions.primaryColor)
      : colors.navyDark;
    
    const secondaryColor: [number, number, number] = themeOptions?.secondaryColor
      ? hexToRgb(themeOptions.secondaryColor)
      : colors.blueAccent;
    
    console.log('🎨 Cores do PDF:', { primary: primaryColor, secondary: secondaryColor });
    
    // Configurações do PDF
    pdf.setProperties({
      title: `Relatório de Análise de Solo - ${themeOptions?.organizationName || 'Fertilisolo'}`,
      author: themeOptions?.organizationName || 'Fertilisolo',
      subject: 'Análise e Recomendação de Fertilizantes',
      keywords: 'solo, fertilizantes, análise, agricultura'
    });

    // ======================= PÁGINA 1 - ANÁLISE PRINCIPAL - MODELO FERTILISOLO =======================
    
    // Margens e dimensões da página
    const marginX = 15;
    const marginY = 15;
    const pageWidth = 210; // A4 width in mm
    const contentWidth = pageWidth - (marginX * 2);
    
    // Logo personalizado no canto superior direito (PÁGINA 1)
    if (themeOptions?.logo) {
      await addLogoToPage(pdf, themeOptions.logo, pageWidth, marginY, false);
    } else {
      console.log('⚠️ Nenhum logo fornecido para o PDF');
    }

    // Header com gradiente (simulando gradient com retângulos sobrepostos)
    const headerHeight = 25;
    
    // Base do gradiente
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pageWidth, headerHeight, 'F');
    
    // Overlay para simular gradiente
    for (let i = 0; i < 10; i++) {
      const alpha = i / 10;
      const r = primaryColor[0] + (colors.navyMedium[0] - primaryColor[0]) * alpha;
      const g = primaryColor[1] + (colors.navyMedium[1] - primaryColor[1]) * alpha;
      const b = primaryColor[2] + (colors.navyMedium[2] - primaryColor[2]) * alpha;
      
      pdf.setFillColor(r, g, b);
      const sliceHeight = headerHeight / 10;
      pdf.rect(0, i * sliceHeight, pageWidth, sliceHeight, 'F');
    }
    
    // Barra azul clara na base do header (como no modelo HTML)
    pdf.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    pdf.rect(0, headerHeight, pageWidth, 4, 'F');
    
    // Texto do header
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(themeOptions?.organizationName || 'Fertilisolo', marginX, 15);
    
    // Subtítulo
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`, marginX, 21);
    
    // Canto superior direito
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    const locationText = `${farmName || soilData.location || "Não especificado"}`;
    pdf.text(locationText, pageWidth - pdf.getTextWidth(locationText) - marginX, 15);
    
    const dateText = `Data da coleta: ${soilData.date ? new Date(soilData.date).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}`;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(dateText, pageWidth - pdf.getTextWidth(dateText) - marginX, 21);

    // Função auxiliar para desenhar card com sombra estilo modelo HTML
    const drawCard = (x: number, y: number, width: number, height: number, withShadow: boolean = true) => {
      if (withShadow) {
        // Sombra suave (simulada com múltiplas camadas)
        pdf.setFillColor(230, 230, 230);
        pdf.roundedRect(x + 0.5, y + 0.5, width, height, 3, 3, 'F');
        pdf.setFillColor(235, 235, 235);
        pdf.roundedRect(x + 0.3, y + 0.3, width, height, 3, 3, 'F');
      }
      
      // Card com fundo cream suave (como no modelo HTML)
      pdf.setFillColor(colors.creamSurface[0], colors.creamSurface[1], colors.creamSurface[2]);
      pdf.setDrawColor(94, 82, 64); // brown-600 com opacity
      pdf.setLineWidth(0.3);
      pdf.roundedRect(x, y, width, height, 3, 3, 'FD');
    };
    
    // Seção 1: Layout de 3 Colunas (Y = 34) - larguras ajustadas
    const colY = 34;
    const colHeight = 50;
    const col1Width = 52;
    const col2Width = 58;
    const col3Width = 52;
    const gap = 3;
    
    // Coluna 1 - Detalhes da Análise (Card cream)
    drawCard(marginX, colY, col1Width, colHeight);
    
    // Título da coluna 1 - Navy dark como no modelo HTML
    pdf.setTextColor(colors.navyDark[0], colors.navyDark[1], colors.navyDark[2]);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detalhes da Análise', marginX + 3, colY + 8);
    
    // Conteúdo da coluna 1
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(colors.grayText[0], colors.grayText[1], colors.grayText[2]);
    
    // Cultura
    const culturaText = cultureName || "Não especificada";
    pdf.text('Cultura:', marginX + 2, colY + 17);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(culturaText, marginX + 2, colY + 22);
    
    // Matéria Orgânica
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(colors.grayText[0], colors.grayText[1], colors.grayText[2]);
    pdf.text('Matéria Orgânica:', marginX + 2, colY + 30);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
    pdf.text(`${(soilData.organicMatter || 0).toFixed(1)}%`, marginX + 2, colY + 35);
    
    // Argila
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(colors.grayText[0], colors.grayText[1], colors.grayText[2]);
    pdf.text('Argila:', marginX + 2, colY + 43);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${(soilData.argila || 0).toFixed(0)}%`, marginX + 2, colY + 48);
    
    // Coluna 2 - Macronutrientes (Card cream)
    const col2X = marginX + col1Width + gap;
    drawCard(col2X, colY, col2Width, colHeight);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(colors.navyDark[0], colors.navyDark[1], colors.navyDark[2]);
    pdf.text('Macronutrientes', col2X + 3, colY + 8);
    
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(colors.grayText[0], colors.grayText[1], colors.grayText[2]);
    
    const kCmolc = (soilData.K || 0) / 390;
    
    pdf.text('CTC (T):', col2X + 2, colY + 17);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${formatNumber(soilData.T)} cmolc/dm³`, col2X + 32, colY + 17);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(colors.grayText[0], colors.grayText[1], colors.grayText[2]);
    pdf.text('Fósforo (P):', col2X + 2, colY + 24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${formatNumber(soilData.P)} mg/dm³`, col2X + 32, colY + 24);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(colors.grayText[0], colors.grayText[1], colors.grayText[2]);
    pdf.text('Potássio (K):', col2X + 2, colY + 31);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${formatNumber(kCmolc)} cmolc/dm³`, col2X + 32, colY + 31);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(colors.grayText[0], colors.grayText[1], colors.grayText[2]);
    pdf.text('Cálcio (Ca):', col2X + 2, colY + 38);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${formatNumber(soilData.Ca)} cmolc/dm³`, col2X + 32, colY + 38);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(colors.grayText[0], colors.grayText[1], colors.grayText[2]);
    pdf.text('Magnésio (Mg):', col2X + 2, colY + 45);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${formatNumber(soilData.Mg)} cmolc/dm³`, col2X + 32, colY + 45);

    // Coluna 3 - Informação Importante (Box amarelo ESTILO MODELO HTML)
    const col3X = col2X + col2Width + gap;
    
    // Fundo amarelo claro com gradiente simulado
    pdf.setFillColor(colors.warningBg[0], colors.warningBg[1], colors.warningBg[2]);
    pdf.roundedRect(col3X, colY, col3Width, colHeight, 3, 3, 'F');
    
    // Borda esquerda grossa (4px) laranja - característica do modelo HTML
    pdf.setFillColor(colors.warning[0], colors.warning[1], colors.warning[2]);
    pdf.roundedRect(col3X, colY, 1.5, colHeight, 3, 3, 'F');
    
    // Título do alert
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(colors.warningText[0], colors.warningText[1], colors.warningText[2]);
    pdf.text('⚠️ Importante', col3X + 4, colY + 9);
    
    // Conteúdo do alert - exatamente como no modelo HTML
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(colors.warningText[0], colors.warningText[1], colors.warningText[2]); // #92400e
    pdf.text('As fontes listadas em cada', col3X + 3, colY + 18);
    pdf.text('tabela são alternativas.', col3X + 3, colY + 24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Escolha APENAS UMA fonte', col3X + 3, colY + 32);
    pdf.setFont('helvetica', 'normal');
    pdf.text('para cada tipo de nutriente,', col3X + 3, colY + 38);
    pdf.text('de acordo com disponibilidade', col3X + 3, colY + 44);
    pdf.text('e custo no mercado local.', col3X + 3, colY + 50);

    // ============ PÁGINA 1: RESUMO EXECUTIVO ============
    
    // SEÇÃO 1: AÇÕES PRIORITÁRIAS (NOVO - topo da página)
    let currentY = 90;
    
    // Card de Ações Prioritárias
    pdf.setFillColor(colors.warningBg[0], colors.warningBg[1], colors.warningBg[2]);
    pdf.roundedRect(marginX, currentY, contentWidth, 35, 3, 3, 'F');
    pdf.setFillColor(colors.warning[0], colors.warning[1], colors.warning[2]);
    pdf.roundedRect(marginX, currentY, 2, 35, 3, 3, 'F'); // Borda esquerda
    
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(colors.navyDark[0], colors.navyDark[1], colors.navyDark[2]);
    pdf.text('🎯 Ações Prioritárias', marginX + 4, currentY + 8);
    
    // Determinar ações prioritárias baseadas nos dados
    const actions: string[] = [];
    if ((soilData.Ca || 0) < 3) actions.push('1. Corrigir acidez com Calcário (Pré-plantio)');
    if ((soilData.P || 0) < 12 || (soilData.K || 0) < 80) actions.push('2. Aplicar Fósforo e Potássio (Base no plantio)');
    if ((soilData.Zn || 0) < 1.5 || (soilData.Mn || 0) < 5) actions.push('3. Suplementar Zinco e Manganês (Via foliar)');
    if (actions.length === 0) actions.push('✓ Solo em boas condições - manter adubação de manutenção');
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(colors.warningText[0], colors.warningText[1], colors.warningText[2]);
    let actionY = currentY + 15;
    actions.forEach(action => {
      pdf.text(action, marginX + 4, actionY);
      actionY += 6;
    });
    
    currentY += 45;
    
    // SEÇÃO 2: ANÁLISE COMPLETA (combinar visual + dados detalhados)
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(colors.navyDark[0], colors.navyDark[1], colors.navyDark[2]);
    pdf.text('📊 Análise Completa de Nutrientes', marginX, currentY);
    
    currentY += 8;
    
    // Criar tabela consolidada combinando TODOS os dados
    const kCmolcValue = (soilData.K || 0) / 390;
    const nutrientData = [
      // Macronutrientes
      ['🟢 Macronutrientes', '', '', '', ''],
      ['Fósforo (P)', `${formatNumber(soilData.P)} mg/dm³`, getNutrientLevel(soilData.P, 10, 20), getStatusIcon(getNutrientLevel(soilData.P, 10, 20)), calcularRecomendacaoP(soilData.argila || 0, soilData.P || 0)],
      ['Potássio (K)', `${formatNumber(kCmolcValue)} cmolc/dm³`, getNutrientLevel(kCmolcValue, 0.15, 0.3), getStatusIcon(getNutrientLevel(kCmolcValue, 0.15, 0.3)), 'Aplicação de fontes de potássio'],
      ['Cálcio (Ca)', `${formatNumber(soilData.Ca)} cmolc/dm³`, getNutrientLevel(soilData.Ca, 2.0, 4.0), getStatusIcon(getNutrientLevel(soilData.Ca, 2.0, 4.0)), 'Aplicação de calcário'],
      ['Magnésio (Mg)', `${formatNumber(soilData.Mg)} cmolc/dm³`, getNutrientLevel(soilData.Mg, 0.8, 1.5), getStatusIcon(getNutrientLevel(soilData.Mg, 0.8, 1.5)), 'Calcário dolomítico'],
      
      // Micronutrientes
      ['🔵 Micronutrientes', '', '', '', ''],
      ['Zinco (Zn)', `${formatNumber(soilData.Zn)} mg/dm³`, getNutrientLevel(soilData.Zn, 1.5, 2.2), getStatusIcon(getNutrientLevel(soilData.Zn, 1.5, 2.2)), getMicroRecommendation('Zn', getNutrientLevel(soilData.Zn, 1.5, 2.2))],
      ['Boro (B)', `${formatNumber(soilData.B)} mg/dm³`, getNutrientLevel(soilData.B, 0.3, 0.6), getStatusIcon(getNutrientLevel(soilData.B, 0.3, 0.6)), getMicroRecommendation('B', getNutrientLevel(soilData.B, 0.3, 0.6))],
      ['Cobre (Cu)', `${formatNumber(soilData.Cu)} mg/dm³`, getNutrientLevel(soilData.Cu, 0.8, 1.2), getStatusIcon(getNutrientLevel(soilData.Cu, 0.8, 1.2)), getMicroRecommendation('Cu', getNutrientLevel(soilData.Cu, 0.8, 1.2))],
      ['Manganês (Mn)', `${formatNumber(soilData.Mn)} mg/dm³`, getNutrientLevel(soilData.Mn, 5, 12), getStatusIcon(getNutrientLevel(soilData.Mn, 5, 12)), getMicroRecommendation('Mn', getNutrientLevel(soilData.Mn, 5, 12))],
    ];
    
    // Função auxiliar para ícones de status
    function getStatusIcon(status: string): string {
      if (status === 'Baixo' || status === 'Muito Baixo') return '⚠️ ' + status;
      if (status === 'Adequado' || status === 'Alto') return '✓ ' + status;
      return status;
    }
    
    autoTable(pdf, {
      head: [['Nutriente', 'Valor Encontrado', 'Status', '', 'Recomendação']],
      body: nutrientData,
      startY: currentY,
      theme: 'grid',
      headStyles: { 
        fillColor: colors.grayTableStart,
        textColor: colors.textPrimary,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left'
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 4,
        textColor: colors.textPrimary,
        lineColor: [94, 82, 64],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35 },
        1: { halign: 'right', fontStyle: 'bold', cellWidth: 35 },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'center', cellWidth: 15 },
        4: { fontSize: 8, cellWidth: 70 }
      },
      didParseCell: function(data) {
        // Destacar linhas de cabeçalho de seção
        if (data.cell.raw && typeof data.cell.raw === 'string' && 
            (data.cell.raw.includes('Macronutrientes') || data.cell.raw.includes('Micronutrientes'))) {
          data.cell.styles.fillColor = colors.grayTableEnd;
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 10;
        }
        // Colorir células de status
        if (data.column.index === 2 && data.cell.raw) {
          const status = data.cell.raw.toString();
          if (status.includes('Baixo')) {
            data.cell.styles.textColor = [244, 67, 54]; // Vermelho
            data.cell.styles.fontStyle = 'bold';
          } else if (status.includes('Adequado') || status.includes('Alto')) {
            data.cell.styles.textColor = colors.success;
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      margin: { left: marginX, right: marginX }
    });
    
    // ============ PÁGINA 1 COMPLETA - RESUMO EXECUTIVO ============

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
    
    // Header da Página 2 com cor primária (ANTES do logo para ficar atrás)
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 20, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text('Detalhes da Recomendação de Fertilizantes', 15, 13);
    
    // Logo personalizado DENTRO da faixa do topo (PÁGINA 2) - adicionado DEPOIS para ficar na frente
    if (themeOptions?.logo) {
      await addLogoToPage(pdf, themeOptions.logo, pageWidth, marginY, true);
    }

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
      headStyles: { 
        fillColor: colors.grayTableStart, // Cinza claro como no modelo HTML
        textColor: colors.textPrimary,    // Texto escuro
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left'
      },
      alternateRowStyles: { fillColor: [255, 255, 255] }, // Branco puro
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        textColor: colors.textPrimary,
        lineColor: [94, 82, 64],
        lineWidth: 0.1
      },
      columnStyles: {
        1: { halign: 'right', fontStyle: 'bold', textColor: colors.success }
      },
      margin: { left: 15, right: 15 }
    });

    // Footer da Página 2
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Fertilisolo - Análise e recomendação de fertilizantes - Página 2/3', 15, 285);
    pdf.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 140, 285);

    // ======================= PÁGINA 3 - ANÁLISE DETALHADA =======================
    
    pdf.addPage();
    
    // Header da Página 3 com cor primária (ANTES do logo para ficar atrás)
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 20, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text('Análise Detalhada de Nutrientes', 15, 13);
    
    // Logo personalizado DENTRO da faixa do topo (PÁGINA 3) - adicionado DEPOIS para ficar na frente
    if (themeOptions?.logo) {
      await addLogoToPage(pdf, themeOptions.logo, pageWidth, marginY, true);
    }

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
      ['Ferro (Fe)', formatNumber(soilData.Fe), 'mg/dm³', getNutrientLevel(soilData.Fe, 12, 30), getMicroRecommendation('Fe', getNutrientLevel(soilData.Fe, 12, 30))],
      ['Manganês (Mn)', formatNumber(soilData.Mn), 'mg/dm³', getNutrientLevel(soilData.Mn, 5, 12), getMicroRecommendation('Mn', getNutrientLevel(soilData.Mn, 5, 12))],
      ['Zinco (Zn)', formatNumber(soilData.Zn), 'mg/dm³', getNutrientLevel(soilData.Zn, 1.5, 2.2), getMicroRecommendation('Zn', getNutrientLevel(soilData.Zn, 1.5, 2.2))],
      ['Molibdênio (Mo)', '-', 'mg/dm³', 'Não analisado', 'Aplicação preventiva recomendada']
    ];

    autoTable(pdf, {
      head: [detailedColumns],
      body: detailedRows,
      startY: 25,
      theme: 'grid',
      headStyles: { 
        fillColor: colors.grayTableStart, // Cinza claro como no modelo HTML
        textColor: colors.textPrimary,    // Texto escuro
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left'
      },
      alternateRowStyles: { fillColor: [255, 255, 255] }, // Branco puro
      styles: { 
        fontSize: 8, 
        cellPadding: 3,
        textColor: colors.textPrimary,
        lineColor: [94, 82, 64],
        lineWidth: 0.1
      },
      columnStyles: {
        1: { halign: 'right', fontStyle: 'bold' }
      },
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
