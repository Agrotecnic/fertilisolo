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

    // ======================= LAYOUT BASEADO EM Exemplo-relatorio.html =======================
    
    // Margens e dimensões
    const marginX = 16;
    const pageWidth = 210;
    const contentWidth = pageWidth - (marginX * 2);
    
    // ========== FUNÇÃO PARA DESENHAR HEADER EM TODAS AS PÁGINAS ==========
    const drawHeader = async () => {
      const headerHeight = 32;
      
      // Gradiente azul escuro (#1a2b4a → #2d4a73)
      pdf.setFillColor(26, 43, 74);
      pdf.rect(0, 0, pageWidth, headerHeight, 'F');
      
      for (let i = 0; i < 10; i++) {
        const alpha = i / 10;
        const r = 26 + (45 - 26) * alpha;
        const g = 43 + (74 - 43) * alpha;
        const b = 74 + (115 - 74) * alpha;
        
        pdf.setFillColor(r, g, b);
        pdf.rect(0, i * (headerHeight / 10), pageWidth, headerHeight / 10, 'F');
      }
      
      // Barra azul accent embaixo (gradiente #007bff → #00d4ff)
      pdf.setFillColor(0, 123, 255);
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
      
      // Subtítulo: Cultura e Amostra
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'normal');
      const culturaText = `Cultura: ${cultureName || 'Soja'}`;
      const amostraText = `Amostra: ${farmName || soilData.location || 'Não especificado'}`;
      pdf.text(`${culturaText}     ${amostraText}`, marginX, 28);
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
    
    // ========== ANÁLISE VISUAL DOS NUTRIENTES (BARRAS COLORIDAS) ==========
    
    // Função auxiliar para determinar o nível do nutriente (Baixo, Adequado, Alto)
    const getNutrientLevel = (value: number, min: number, max?: number): string => {
      if (value < min) return 'Baixo';
      if (max && value > max) return 'Alto';
      return 'Adequado';
    };
    
    // Função para desenhar barra visual de nível (OTIMIZADO)
    const drawNutrientBar = (
      label: string,
      value: number,
      nivel: string,
      yPos: number,
      isLeft: boolean = true,
      unit: string = ''
    ) => {
      const xStart = isLeft ? marginX + 6 : pageWidth / 2 + 2;
      const labelWidth = 10; // Reduzido de 35 para 10
      const valueWidth = 22; // Aumentado para acomodar unidade
      const nivelWidth = 18; // Espaço para o texto do nível
      const availableWidth = isLeft ? (pageWidth / 2 - marginX - 14) : (pageWidth / 2 - marginX - 8);
      const barAreaWidth = availableWidth - labelWidth - valueWidth - nivelWidth;
      
      // Label do nutriente (mais compacto)
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(55, 65, 81);
      pdf.text(label, xStart, yPos + 3);
      
      // Valor com unidade - garantir que é string (mais próximo)
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      const valueStr = `${value.toFixed(1)} ${unit}`;
      pdf.text(valueStr, xStart + labelWidth + 2, yPos + 3);
      
      // Determinar cor da barra baseado no nível
      let barColor: number[];
      let barPercent: number;
      
      if (nivel === 'Baixo') {
        barColor = [239, 68, 68]; // vermelho
        barPercent = 0.3;
      } else if (nivel === 'Alto') {
        barColor = [251, 146, 60]; // laranja (cor de alerta para excesso)
        barPercent = 1.0;
      } else {
        barColor = [34, 197, 94]; // verde (Adequado)
        barPercent = 0.7;
      }
      
      const barStartX = xStart + labelWidth + valueWidth + 2;
      
      // Fundo da barra (cinza claro)
      pdf.setFillColor(229, 231, 235);
      pdf.roundedRect(barStartX, yPos - 2, barAreaWidth, 5, 2, 2, 'F');
      
      // Barra colorida
      pdf.setFillColor(...barColor);
      const barFilledWidth = barAreaWidth * barPercent;
      if (barFilledWidth > 0) {
        pdf.roundedRect(
          barStartX,
          yPos - 2,
          barFilledWidth,
          5,
          2,
          2,
          'F'
        );
      }
      
      // Label do nível - garantir que é string (mais próximo)
      pdf.setFontSize(7);
      pdf.setTextColor(...barColor);
      pdf.setFont('helvetica', 'bold');
      const nivelStr = String(nivel);
      const nivelX = barStartX + barAreaWidth + 2;
      pdf.text(nivelStr, nivelX, yPos + 3);
    };
    
    // Card com análise visual (OTIMIZADO - mais compacto)
    pdf.setFillColor(252, 251, 245);
    pdf.roundedRect(marginX, currentY, contentWidth, 55, 8, 8, 'F');
    pdf.setDrawColor(94, 82, 64);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(marginX, currentY, contentWidth, 55, 8, 8, 'S');
    
    // Título
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(26, 43, 74);
    pdf.text('Analise Visual de Necessidades', marginX + 6, currentY + 7);
    
    let barY = currentY + 14;
    
    // Macronutrientes (coluna esquerda)
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(107, 114, 128);
    pdf.text('Macronutrientes', marginX + 6, barY);
    barY += 5;
    
    // P, K, Ca, Mg, S (espaçamento reduzido)
    // CORREÇÃO: Usar MAIÚSCULAS conforme interface SoilData
    console.log('📊 Dados do Solo na Análise Visual:', {
      P: soilData.P,
      K: soilData.K,
      Ca: soilData.Ca,
      Mg: soilData.Mg,
      S: soilData.S,
      B: soilData.B,
      Zn: soilData.Zn,
      Cu: soilData.Cu,
      Mn: soilData.Mn,
      Fe: soilData.Fe
    });
    
    // Fósforo - usar interpretarFosforo que retorna uma string diretamente
    const pNivel = interpretarFosforo(soilData.P || 0, soilData.argila || 0);
    // Mapear "Muito Baixo", "Baixo", "Médio", "Alto", "Muito Alto" para "Baixo", "Adequado", "Alto"
    let pNivelSimplificado = 'Adequado';
    if (pNivel === 'Muito Baixo' || pNivel === 'Baixo') {
      pNivelSimplificado = 'Baixo';
    } else if (pNivel === 'Muito Alto') {
      pNivelSimplificado = 'Alto';
    }
    drawNutrientBar('P', soilData.P || 0, pNivelSimplificado, barY, true, 'mg/dm³');
    barY += 6;
    
    drawNutrientBar('K', soilData.K || 0, soilData.K >= 0.15 ? 'Adequado' : 'Baixo', barY, true, 'cmolc/dm³');
    barY += 6;
    
    drawNutrientBar('Ca', soilData.Ca || 0, soilData.Ca >= 4.0 ? 'Adequado' : 'Baixo', barY, true, 'cmolc/dm³');
    barY += 6;
    
    drawNutrientBar('Mg', soilData.Mg || 0, soilData.Mg >= 1.0 ? 'Adequado' : 'Baixo', barY, true, 'cmolc/dm³');
    barY += 6;
    
    drawNutrientBar('S', soilData.S || 0, soilData.S >= 10 ? 'Adequado' : 'Baixo', barY, true, 'mg/dm³');
    
    // Micronutrientes (coluna direita)
    barY = currentY + 14;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(107, 114, 128);
    pdf.text('Micronutrientes', pageWidth / 2 + 2, barY);
    barY += 5;
    
    // Boro (B): Ideal 0,2-0,6 mg/dm³
    drawNutrientBar('B', soilData.B || 0, getNutrientLevel(soilData.B || 0, 0.2, 0.6), barY, false, 'mg/dm³');
    barY += 6;
    
    // Zinco (Zn): Ideal 0,5-1,2 mg/dm³
    drawNutrientBar('Zn', soilData.Zn || 0, getNutrientLevel(soilData.Zn || 0, 0.5, 1.2), barY, false, 'mg/dm³');
    barY += 6;
    
    // Cobre (Cu): Ideal 0,8-1,2 mg/dm³
    drawNutrientBar('Cu', soilData.Cu || 0, getNutrientLevel(soilData.Cu || 0, 0.8, 1.2), barY, false, 'mg/dm³');
    barY += 6;
    
    // Manganês (Mn): Ideal 5-12 mg/dm³
    drawNutrientBar('Mn', soilData.Mn || 0, getNutrientLevel(soilData.Mn || 0, 5, 12), barY, false, 'mg/dm³');
    barY += 6;
    
    // Ferro (Fe): Ideal 12-30 mg/dm³
    drawNutrientBar('Fe', soilData.Fe || 0, getNutrientLevel(soilData.Fe || 0, 12, 30), barY, false, 'mg/dm³');
    
    currentY += 63;
    
    // ========== FUNÇÃO HELPER: Desenhar Badge Colorido ==========
    const drawBadge = (text: string, x: number, y: number, type: string) => {
      const badgeColors: Record<string, { bg: number[], text: number[] }> = {
        foliar: { bg: [220, 252, 231], text: [21, 128, 61] },      // verde claro
        sulco: { bg: [254, 243, 199], text: [146, 64, 14] },       // amarelo/marrom
        lanco: { bg: [243, 232, 255], text: [107, 33, 168] },      // roxo claro
        incorporado: { bg: [243, 232, 255], text: [107, 33, 168] }, // roxo claro
        cobertura: { bg: [224, 242, 254], text: [3, 105, 161] },   // azul claro
        sementes: { bg: [224, 242, 254], text: [3, 105, 161] }     // azul claro
      };
      
      const colors = badgeColors[type] || { bg: [240, 240, 240], text: [0, 0, 0] };
      
      // Fundo do badge
      pdf.setFillColor(...colors.bg);
      pdf.roundedRect(x, y - 3, 20, 5, 2, 2, 'F');
      
      // Texto do badge
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text(text, x + 10, y, { align: 'center' });
    };
    
    // ========== CARD 1: CORREÇÃO DE SOLO ==========
    // Verificar se há espaço suficiente para o card (85 de altura + margem)
    if (currentY > 200) { 
      pdf.addPage(); 
      await drawHeader();
      currentY = 45;
    }
    
    // Card background (altura aumentada para mais linhas)
    pdf.setFillColor(252, 251, 245); // #fcfbf5 (creamSurface)
    pdf.roundedRect(marginX, currentY, contentWidth, 85, 8, 8, 'F');
    
    // Border
    pdf.setDrawColor(94, 82, 64); // brown-600
    pdf.setLineWidth(0.3);
    pdf.roundedRect(marginX, currentY, contentWidth, 85, 8, 8, 'S');
    
    // Título
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(26, 43, 74); // navyDark
    pdf.text('1. Correção de Solo (Pré-Plantio)', marginX + 6, currentY + 8);
    
    // Descrição
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128); // gray-500
    pdf.text('Correção da acidez do solo e fornecimento de Ca e Mg. Aplicar 60-90 dias antes do plantio.', marginX + 6, currentY + 14);
    
    // Tabela (MAIS FONTES DE Ca E Mg)
    autoTable(pdf, {
      startY: currentY + 18,
      head: [['Fonte de Fertilizante', 'Quantidade', 'Unidade', 'Método', 'Estágio']],
      body: [
        ['Calcário Dolomítico (Ca+Mg)', '2.000', 'kg/ha', '', 'Pré-plantio'],
        ['Calcário Calcítico (Ca)', '1.800', 'kg/ha', '', 'Pré-plantio'],
        ['Calcário Magnesiano (Ca+Mg)', '2.200', 'kg/ha', '', 'Pré-plantio'],
        ['Gesso Agrícola (Ca+S)', '1.000', 'kg/ha', '', 'Pré-plantio'],
        ['Sulfato de Magnésio (Mg+S)', '150', 'kg/ha', '', 'Pré-plantio'],
        ['Cal Virgem (Ca)', '1.200', 'kg/ha', '', 'Pré-plantio']
      ],
      theme: 'plain',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [55, 65, 81],
        lineColor: [94, 82, 64],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [248, 249, 250],
        textColor: [26, 43, 74],
        fontStyle: 'bold',
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 25, halign: 'right', textColor: [5, 150, 105], fontStyle: 'bold' },
        2: { cellWidth: 20 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 }
      },
      margin: { left: marginX + 6, right: marginX + 6 },
      tableWidth: contentWidth - 12,
      willDrawCell: (data: any) => {
        if (data.column.index === 3 && data.section === 'body') {
          data.cell.text = [''];
        }
      },
      didDrawCell: (data: any) => {
        if (data.column.index === 3 && data.section === 'body') {
          const cellX = data.cell.x + 5;
          const cellY = data.cell.y + data.cell.height / 2 + 1;
          drawBadge('A lanço', cellX, cellY, 'lanco');
        }
      }
    });
    
    currentY = (pdf as any).lastAutoTable.finalY + 8;
    
    // ========== CARD 2: ADUBAÇÃO DE BASE ==========
    if (currentY > 200) { 
      pdf.addPage(); 
      await drawHeader();
      currentY = 45;
    }
    
    // Card background
    pdf.setFillColor(252, 251, 245);
    pdf.roundedRect(marginX, currentY, contentWidth, 85, 8, 8, 'F');
    
    // Border
    pdf.setDrawColor(94, 82, 64);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(marginX, currentY, contentWidth, 85, 8, 8, 'S');
    
    // Título
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(26, 43, 74);
    pdf.text('2. Adubação de Base (Plantio)', marginX + 6, currentY + 8);
    
    // Descrição
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128);
    const desc2 = 'Fontes de Fósforo (P), Potássio (K) e Fórmulas NPK. Escolha uma opção de P e uma de K, ou uma formulação NPK completa.';
    const splitDesc2 = pdf.splitTextToSize(desc2, contentWidth - 12);
    pdf.text(splitDesc2, marginX + 6, currentY + 14);
    
    // Tabela
    autoTable(pdf, {
      startY: currentY + 22,
      head: [['Fonte de Fertilizante', 'Quantidade', 'Unidade', 'Método', 'Estágio']],
      body: [
        ['Superfosfato Simples', '400', 'kg/ha', '', 'Plantio'],
        ['Superfosfato Triplo', '180', 'kg/ha', '', 'Plantio'],
        ['MAP (Fosfato Monoamônico)', '150', 'kg/ha', '', 'Plantio'],
        ['Cloreto de Potássio (KCl)', '150', 'kg/ha', '', 'Plantio'],
        ['Sulfato de Potássio', '180', 'kg/ha', '', 'Plantio'],
        ['NPK 04-14-08', '350', 'kg/ha', '', 'Plantio'],
        ['NPK 10-10-10', '300', 'kg/ha', '', 'Plantio']
      ],
      theme: 'plain',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [55, 65, 81],
        lineColor: [94, 82, 64],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [248, 249, 250],
        textColor: [26, 43, 74],
        fontStyle: 'bold',
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 25, halign: 'right', textColor: [5, 150, 105], fontStyle: 'bold' },
        2: { cellWidth: 20 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 }
      },
      margin: { left: marginX + 6, right: marginX + 6 },
      tableWidth: contentWidth - 12,
      willDrawCell: (data: any) => {
        if (data.column.index === 3 && data.section === 'body') {
          data.cell.text = [''];
        }
      },
      didDrawCell: (data: any) => {
        if (data.column.index === 3 && data.section === 'body') {
          const cellX = data.cell.x + 5;
          const cellY = data.cell.y + data.cell.height / 2 + 1;
          drawBadge('Sulco', cellX, cellY, 'sulco');
        }
      }
    });
    
    currentY = (pdf as any).lastAutoTable.finalY + 8;
    
    // ========== CARD 3: ADUBAÇÃO DE COBERTURA ==========
    if (currentY > 190) { 
      pdf.addPage(); 
      await drawHeader();
      currentY = 45;
    }
    
    // Card background (altura aumentada para mais linhas)
    pdf.setFillColor(252, 251, 245);
    pdf.roundedRect(marginX, currentY, contentWidth, 68, 8, 8, 'F');
    
    // Border
    pdf.setDrawColor(94, 82, 64);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(marginX, currentY, contentWidth, 68, 8, 8, 'S');
    
    // Título
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(26, 43, 74);
    pdf.text('3. Adubação de Cobertura (Nitrogênio)', marginX + 6, currentY + 8);
    
    // Descrição
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128);
    pdf.text('Aplicação de nitrogênio em cobertura entre os estágios V4-V8 da soja.', marginX + 6, currentY + 14);
    
    // Tabela (MAIS FONTES DE NITROGÊNIO)
    autoTable(pdf, {
      startY: currentY + 18,
      head: [['Fonte de Fertilizante', 'Quantidade', 'Unidade', 'Método', 'Estágio']],
      body: [
        ['Ureia (45% N)', '100', 'kg/ha', '', 'V4-V6'],
        ['Sulfato de Amônio (21% N)', '200', 'kg/ha', '', 'V6-V8'],
        ['Nitrato de Amônio (33% N)', '140', 'kg/ha', '', 'V4-V6'],
        ['Ureia Revestida (44% N)', '105', 'kg/ha', '', 'V4-V6'],
        ['Nitrato de Cálcio (15% N)', '300', 'kg/ha', '', 'V4-V8']
      ],
      theme: 'plain',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [55, 65, 81],
        lineColor: [94, 82, 64],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [248, 249, 250],
        textColor: [26, 43, 74],
        fontStyle: 'bold',
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 25, halign: 'right', textColor: [5, 150, 105], fontStyle: 'bold' },
        2: { cellWidth: 20 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 }
      },
      margin: { left: marginX + 6, right: marginX + 6 },
      tableWidth: contentWidth - 12,
      willDrawCell: (data: any) => {
        if (data.column.index === 3 && data.section === 'body') {
          data.cell.text = [''];
        }
      },
      didDrawCell: (data: any) => {
        if (data.column.index === 3 && data.section === 'body') {
          const cellX = data.cell.x + 5;
          const cellY = data.cell.y + data.cell.height / 2 + 1;
          drawBadge('Cobertura', cellX, cellY, 'cobertura');
        }
      }
    });
    
    currentY = (pdf as any).lastAutoTable.finalY + 8;
    
    // ========== CARD 4: MICRONUTRIENTES ==========
    // Quebra de página inteligente (95 de altura + margem)
    if (currentY > 190) { 
      pdf.addPage(); 
      await drawHeader();
      currentY = 45;
    }
    
    // Card background
    pdf.setFillColor(252, 251, 245);
    pdf.roundedRect(marginX, currentY, contentWidth, 95, 8, 8, 'F');
    
    // Border
    pdf.setDrawColor(94, 82, 64);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(marginX, currentY, contentWidth, 95, 8, 8, 'S');
    
    // Título
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(26, 43, 74);
    pdf.text('4. Suplementação de Micronutrientes', marginX + 6, currentY + 8);
    
    // Descrição
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128);
    const desc4 = 'Correção de deficiências de B, Zn, Cu, Mn e Mo. Aplicação foliar ou tratamento de sementes conforme indicado.';
    const splitDesc4 = pdf.splitTextToSize(desc4, contentWidth - 12);
    pdf.text(splitDesc4, marginX + 6, currentY + 14);
    
    // Tabela
    autoTable(pdf, {
      startY: currentY + 22,
      head: [['Fonte de Fertilizante', 'Quantidade', 'Unidade', 'Método', 'Estágio']],
      body: [
        ['Ácido Bórico', '2.0', 'kg/ha', 'foliar', 'V3-V5'],
        ['Bórax', '3.0', 'kg/ha', 'foliar', 'V3-V5'],
        ['Sulfato de Zinco', '3.0', 'kg/ha', 'foliar', 'V4-V6'],
        ['Óxido de Zinco', '2.0', 'kg/ha', 'foliar', 'V4-V6'],
        ['Sulfato de Cobre', '1.5', 'kg/ha', 'foliar', 'V4-V6'],
        ['Óxido de Cobre', '4.0', 'kg/ha', 'foliar', 'V4-V6'],
        ['Sulfato de Manganês', '3.0', 'kg/ha', 'foliar', 'V4-V6'],
        ['Óxido de Manganês', '2.5', 'kg/ha', 'foliar', 'V4-V6'],
        ['Molibdato de Sódio', '0.1', 'kg/ha', 'sementes', 'Plantio']
      ],
      theme: 'plain',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [55, 65, 81],
        lineColor: [94, 82, 64],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [248, 249, 250],
        textColor: [26, 43, 74],
        fontStyle: 'bold',
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 25, halign: 'right', textColor: [5, 150, 105], fontStyle: 'bold' },
        2: { cellWidth: 20 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 }
      },
      margin: { left: marginX + 6, right: marginX + 6 },
      tableWidth: contentWidth - 12,
      willDrawCell: (data: any) => {
        // Limpar o texto da coluna Método antes de desenhar
        if (data.column.index === 3 && data.section === 'body') {
          data.cell.text = [''];
        }
      },
      didDrawCell: (data: any) => {
        if (data.column.index === 3 && data.section === 'body') {
          const cellX = data.cell.x + 5;
          const cellY = data.cell.y + data.cell.height / 2 + 1;
          const badgeType = data.cell.raw === 'sementes' ? 'sementes' : 'foliar';
          const badgeText = data.cell.raw === 'sementes' ? 'Trat. sementes' : 'Foliar';
          drawBadge(badgeText, cellX, cellY, badgeType);
        }
      }
    });
    
    currentY = (pdf as any).lastAutoTable.finalY + 8;
    
    // ========== CARD 5: MANEJO ORGÂNICO ==========
    if (currentY > 230) { 
      pdf.addPage(); 
      await drawHeader();
      currentY = 45;
    }
    
    // Card background
    pdf.setFillColor(252, 251, 245);
    pdf.roundedRect(marginX, currentY, contentWidth, 45, 8, 8, 'F');
    
    // Border
    pdf.setDrawColor(94, 82, 64);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(marginX, currentY, contentWidth, 45, 8, 8, 'S');
    
    // Título
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(26, 43, 74);
    pdf.text('5. Manejo Orgânico (Opcional)', marginX + 6, currentY + 8);
    
    // Descrição
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128);
    const desc5 = 'Melhoria da estrutura do solo e fornecimento gradual de nutrientes. Aplicar 30-45 dias antes do plantio.';
    const splitDesc5 = pdf.splitTextToSize(desc5, contentWidth - 12);
    pdf.text(splitDesc5, marginX + 6, currentY + 14);
    
    // Tabela
    autoTable(pdf, {
      startY: currentY + 22,
      head: [['Fonte de Fertilizante', 'Quantidade', 'Unidade', 'Método', 'Estágio']],
      body: [
        ['Esterco Bovino Curtido', '10.000', 'kg/ha', '', 'Pré-plantio'],
        ['Composto Orgânico', '5.000', 'kg/ha', '', 'Pré-plantio']
      ],
      theme: 'plain',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [55, 65, 81],
        lineColor: [94, 82, 64],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [248, 249, 250],
        textColor: [26, 43, 74],
        fontStyle: 'bold',
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 25, halign: 'right', textColor: [5, 150, 105], fontStyle: 'bold' },
        2: { cellWidth: 20 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 }
      },
      margin: { left: marginX + 6, right: marginX + 6 },
      tableWidth: contentWidth - 12,
      willDrawCell: (data: any) => {
        if (data.column.index === 3 && data.section === 'body') {
          data.cell.text = [''];
        }
      },
      didDrawCell: (data: any) => {
        if (data.column.index === 3 && data.section === 'body') {
          const cellX = data.cell.x + 5;
          const cellY = data.cell.y + data.cell.height / 2 + 1;
          drawBadge('Incorporado', cellX, cellY, 'incorporado');
        }
      }
    });
    
    currentY = (pdf as any).lastAutoTable.finalY + 8;
    
    // Footer simples
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(26, 43, 74);
    pdf.text('Fertilisolo - Sistema de Interpretação e Recomendação de Análise de Solos', marginX, 280);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    const dataCompleta = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
    pdf.text(`Gerado em: ${dataCompleta}`, marginX, 285);
    
    pdf.setFont('helvetica', 'italic');
    const disclaimer = 'Este relatório é uma recomendação técnica baseada na análise de solo. Consulte sempre um engenheiro agrônomo para ajustes específicos da sua propriedade.';
    const splitText = pdf.splitTextToSize(disclaimer, pageWidth - 30);
    pdf.text(splitText, marginX, 289);

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
