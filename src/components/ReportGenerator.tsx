import React, { useState, useRef } from 'react';
import { getCrops, getFertilizerSources } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Printer, Download, Send } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Progress } from '@/components/ui/progress';
import * as pdfGenerator from '@/utils/pdfGenerator';
import { 
  interpretarFosforo, 
  calcularRecomendacaoP, 
  determinarClasseArgila, 
  getTexturaClasseArgila,
  calculateResultsWithArgilaInterpretation
} from '@/utils/soilCalculations';
import { SoilData, CalculationResult, PhosphorusAnalysis } from '@/types/soilAnalysis';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/providers/ThemeProvider';

// Estendendo o jsPDF com autotable
declare module 'jspdf' {
  interface jsPDF {
    autotable: (options: any) => jsPDF;
  }
}

interface SoilAnalysis {
  id?: string;
  farm_name?: string;
  location?: string;
  collection_date?: string;
  ph?: number;
  organic_matter?: number;
  phosphorus?: number;
  potassium?: number;
  calcium?: number;
  magnesium?: number;
  sulfur?: number;
  boron?: number;
  copper?: number;
  iron?: number;
  manganese?: number;
  zinc?: number;
  T?: number;
  argila?: number;
  P?: number;
  K?: number;
}

interface FertilizerRecommendation {
  id?: string;
  name: string;
  amount: number;
  unit: string;
  application_method?: string;
  stage?: string;
  notes?: string;
}

interface ReportData {
  soilAnalysis: SoilAnalysis;
  crop: {
    id?: string;
    name: string;
    scientific_name?: string;
  };
  recommendations: FertilizerRecommendation[];
}

// Dados de exemplo para o relatório
const sampleData: ReportData = {
  soilAnalysis: {
    farm_name: "Fazenda Modelo",
    location: "Área A1",
    collection_date: "2025-05-20",
    ph: 5.7,
    organic_matter: 2.8,
    phosphorus: 14.3,
    potassium: 0.15,
    calcium: 2.3,
    magnesium: 0.8,
    sulfur: 5.1,
    boron: 0.32,
    copper: 1.8,
    iron: 45.2,
    manganese: 28.6,
    zinc: 2.1,
    T: 0.5,
    argila: 20,
    P: 10,
    K: 0.2
  },
  crop: {
    name: "Soja",
    scientific_name: "Glycine max"
  },
  recommendations: [
    { name: "Calcário Dolomítico", amount: 2000, unit: "kg/ha", application_method: "A lanço", stage: "Pré-plantio" },
    { name: "Superfosfato Simples", amount: 350, unit: "kg/ha", application_method: "Sulco", stage: "Plantio" },
    { name: "Cloreto de Potássio", amount: 150, unit: "kg/ha", application_method: "Sulco", stage: "Plantio" },
    { name: "Ureia", amount: 80, unit: "kg/ha", application_method: "Cobertura", stage: "V4" },
    { name: "Sulfato de Zinco", amount: 4, unit: "kg/ha", application_method: "Foliar", stage: "V5" },
    { name: "Ácido Bórico", amount: 2, unit: "kg/ha", application_method: "Foliar", stage: "Pré-floração" },
    { name: "Sulfato de Manganês", amount: 3, unit: "kg/ha", application_method: "Foliar", stage: "R1" },
    { name: "Molibdato de Sódio", amount: 0.1, unit: "kg/ha", application_method: "Tratamento de sementes", stage: "Plantio" }
  ]
};

export default function ReportGenerator() {
  const { theme, logo, organizationName } = useTheme();
  const [reportData, setReportData] = useState<ReportData>(sampleData);
  const [loading, setLoading] = useState(false);
  const [calculationResults, setCalculationResults] = useState<CalculationResult | null>(null);
  const [phosphorusAnalysis, setPhosphorusAnalysis] = useState<PhosphorusAnalysis | null>(null);
  const [showReport, setShowReport] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      const reportElement = document.getElementById('report-container');
      if (!reportElement) return;

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false
      });

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
      pdf.text('Detalhes da Recomendação de Fertilizantes', 15, 15);
      
      // Tabela de recomendações detalhadas
      const tableColumn = ["Fertilizante", "Quantidade", "Unidade", "Método de Aplicação", "Estágio"];
      const tableRows: any[] = [];
      
      reportData.recommendations.forEach(rec => {
        const recData = [
          rec.name,
          rec.amount.toString(),
          rec.unit,
          rec.application_method || '-',
          rec.stage || '-'
        ];
        tableRows.push(recData);
      });
      
      pdf.autoTable({
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
      pdf.text('Análise Detalhada de Micronutrientes', 15, 15);
      
      // Tabela de micronutrientes
      const microColumn = ["Micronutriente", "Valor Encontrado", "Unidade", "Nível", "Recomendação"];
      const microRows = [
        ["Boro", reportData.soilAnalysis.boron?.toString() || "-", "mg/dm³", getNutrientLevel(reportData.soilAnalysis.boron, 0.2, 0.6), getMicroRecommendation("B", getNutrientLevel(reportData.soilAnalysis.boron, 0.2, 0.6))],
        ["Cobre", reportData.soilAnalysis.copper?.toString() || "-", "mg/dm³", getNutrientLevel(reportData.soilAnalysis.copper, 0.8, 1.8), getMicroRecommendation("Cu", getNutrientLevel(reportData.soilAnalysis.copper, 0.8, 1.8))],
        ["Ferro", reportData.soilAnalysis.iron?.toString() || "-", "mg/dm³", getNutrientLevel(reportData.soilAnalysis.iron, 15, 40), getMicroRecommendation("Fe", getNutrientLevel(reportData.soilAnalysis.iron, 15, 40))],
        ["Manganês", reportData.soilAnalysis.manganese?.toString() || "-", "mg/dm³", getNutrientLevel(reportData.soilAnalysis.manganese, 15, 30), getMicroRecommendation("Mn", getNutrientLevel(reportData.soilAnalysis.manganese, 15, 30))],
        ["Zinco", reportData.soilAnalysis.zinc?.toString() || "-", "mg/dm³", getNutrientLevel(reportData.soilAnalysis.zinc, 1.0, 2.2), getMicroRecommendation("Zn", getNutrientLevel(reportData.soilAnalysis.zinc, 1.0, 2.2))],
        ["Molibdênio", "-", "mg/dm³", "Não analisado", "Aplicação preventiva recomendada"],
      ];
      
      pdf.autoTable({
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
      
      // Adicionar observações sobre micronutrientes
      pdf.setFontSize(12);
      pdf.text('Observações importantes sobre micronutrientes:', 15, ((pdf as any).lastAutoTable?.finalY || 150) + 15);
      
      const observations = [
        "• Os micronutrientes são essenciais para o desenvolvimento completo das plantas",
        "• Mesmo em pequenas quantidades, sua deficiência pode comprometer significativamente a produtividade",
        "• A aplicação de micronutrientes deve considerar o tipo de solo, pH e cultura",
        "• Recomenda-se a aplicação combinada com macronutrientes quando possível",
        "• Análises foliares podem complementar as informações do solo para ajuste preciso"
      ];
      
      let yPos = ((pdf as any).lastAutoTable?.finalY || 150) + 20;
      observations.forEach(obs => {
        pdf.text(obs, 15, yPos);
        yPos += 7;
      });
      
      // Salvar o PDF
      pdf.save(`Recomendacao_${reportData.crop.name}_${reportData.soilAnalysis.farm_name}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (reportData) {
      // Converter SoilAnalysis para SoilData para compatibilidade
      const soilData: SoilData = {
        location: reportData.soilAnalysis.location || "",
        date: new Date().toISOString().split('T')[0],
        organicMatter: reportData.soilAnalysis.organic_matter || 0,
        T: reportData.soilAnalysis.T || 0,
        P: reportData.soilAnalysis.P || 0,
        argila: reportData.soilAnalysis.argila || 35, // valor padrão se não fornecido
        K: reportData.soilAnalysis.K || 0,
        Ca: reportData.soilAnalysis.calcium || 0,
        Mg: reportData.soilAnalysis.magnesium || 0,
        S: reportData.soilAnalysis.sulfur || 0,
        B: reportData.soilAnalysis.boron || 0,
        Cu: reportData.soilAnalysis.copper || 0,
        Fe: reportData.soilAnalysis.iron || 0,
        Mn: reportData.soilAnalysis.manganese || 0,
        Zn: reportData.soilAnalysis.zinc || 0
      };
      
      // Calcular resultados com a interpretação de fósforo baseada em argila
      const results = calculateResultsWithArgilaInterpretation(soilData);
      
      // Obter análise específica de fósforo baseada na argila
      const fosforoAnalise = calcularRecomendacaoP(
        soilData.P, 
        soilData.argila
      );
      
      setCalculationResults(results);
      setPhosphorusAnalysis(fosforoAnalise);
      setShowReport(true);
    }
  };

  // Função auxiliar para converter imagem URL para base64
  const convertImageToBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Erro ao converter imagem para base64:', error);
      throw error;
    }
  };

  const handleExportPDF = async () => {
    setLoading(true);
    
    if (reportData) {
      try {
        console.log('═══════════════════════════════════════════════════════');
        console.log('🎨 INICIANDO GERAÇÃO DE PDF COM PERSONALIZAÇÃO (ReportGenerator)');
        console.log('═══════════════════════════════════════════════════════');
        console.log('📊 Dados do tema:', {
          temTheme: !!theme,
          temLogo: !!logo,
          organizationName: organizationName,
          primaryColor: theme?.primary_color,
          secondaryColor: theme?.secondary_color
        });
        console.log('🖼️ URL do Logo:', logo);
        console.log('═══════════════════════════════════════════════════════');

        // Converter SoilAnalysis para SoilData para compatibilidade
        const soilData: SoilData = {
          location: reportData.soilAnalysis.location || "",
          date: new Date().toISOString().split('T')[0],
          organicMatter: reportData.soilAnalysis.organic_matter || 0,
          T: reportData.soilAnalysis.T || 0,
          P: reportData.soilAnalysis.P || 0,
          argila: reportData.soilAnalysis.argila || 35,
          K: reportData.soilAnalysis.K || 0,
          Ca: reportData.soilAnalysis.calcium || 0,
          Mg: reportData.soilAnalysis.magnesium || 0,
          S: reportData.soilAnalysis.sulfur || 0,
          B: reportData.soilAnalysis.boron || 0,
          Cu: reportData.soilAnalysis.copper || 0,
          Fe: reportData.soilAnalysis.iron || 0,
          Mn: reportData.soilAnalysis.manganese || 0,
          Zn: reportData.soilAnalysis.zinc || 0
        };
        
        // Converter logo para base64 se disponível
        let logoBase64: string | undefined = undefined;
        if (logo) {
          try {
            console.log('🖼️ Convertendo logo para base64...');
            logoBase64 = await convertImageToBase64(logo);
            console.log('✅ Logo convertido com sucesso');
          } catch (error) {
            console.warn('⚠️ Erro ao converter logo, PDF será gerado sem logo:', error);
          }
        }

        // Preparar opções de tema para o PDF
        const themeOptions = {
          primaryColor: theme?.primary_color,
          secondaryColor: theme?.secondary_color,
          accentColor: theme?.accent_color,
          logo: logoBase64,
          organizationName: organizationName || 'Fertilisolo'
        };

        console.log('📄 Opções de tema para PDF:', {
          primaryColor: themeOptions.primaryColor,
          secondaryColor: themeOptions.secondaryColor,
          hasLogo: !!themeOptions.logo,
          organizationName: themeOptions.organizationName
        });

        const { pdf, filename } = await pdfGenerator.generatePDF(
          soilData, 
          reportData.soilAnalysis.farm_name, 
          reportData.soilAnalysis.location,
          undefined,
          themeOptions
        );
        pdf.save(filename);
        
        console.log('✅ PDF gerado e salvo com sucesso');
      } catch (error) {
        console.error("❌ Erro ao gerar PDF:", error);
      }
    }
    
    setLoading(false);
  };

  // Função para determinar o nível de um nutriente
  function getNutrientLevel(value: number | undefined, lowThreshold: number, highThreshold: number): string {
    if (value === undefined) return "Não analisado";
    if (value < lowThreshold) return "Baixo";
    if (value > highThreshold) return "Alto";
    return "Adequado";
  }
  
  // Função para gerar recomendação de micronutrientes
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

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Relatório de Análise de Solo</h2>
        <div className="space-x-2">
          <Button onClick={handleGenerateReport} variant="outline" className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100">
            Analisar Solo
          </Button>
          <Button onClick={handleExportPDF} disabled={loading} className="bg-green-600 text-white hover:bg-green-700">
            {loading ? "Gerando..." : "Exportar PDF"}
          </Button>
        </div>
      </div>

      {/* Exibir relatório após clicar em Analisar Solo */}
      {showReport && phosphorusAnalysis && (
        <div className="bg-white shadow-md rounded-lg p-6 my-4">
          <h3 className="text-xl font-semibold text-green-800 mb-4">Análise de Solo - {reportData.soilAnalysis.location}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="p-3 bg-green-50 border-green-100">
              <h4 className="font-medium text-green-800 border-b border-green-200 pb-1 mb-2">Macronutrientes Primários</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">CTC (T):</span>
                  <span className="font-medium">{reportData.soilAnalysis.T} cmolc/dm³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fósforo (P):</span>
                  <span className="font-medium">{reportData.soilAnalysis.P} mg/dm³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Argila:</span>
                  <span className="font-medium">{reportData.soilAnalysis.argila}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Classe textural:</span>
                  <span className="font-medium">{phosphorusAnalysis && getTexturaClasseArgila(phosphorusAnalysis.classe)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interpretação de P:</span>
                  <Badge className={`${
                    phosphorusAnalysis?.interpretacao === "Muito Baixo" || phosphorusAnalysis?.interpretacao === "Baixo" 
                      ? "bg-red-100 text-red-800 hover:bg-red-100" 
                      : phosphorusAnalysis?.interpretacao === "Médio" 
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" 
                        : "bg-green-100 text-green-800 hover:bg-green-100"
                  }`}>
                    {phosphorusAnalysis?.interpretacao || "Não avaliado"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Potássio (K):</span>
                  <div>
                    <span className="font-medium">{(reportData.soilAnalysis.K / 390).toFixed(2)} cmolc/dm³</span>
                    <span className="text-xs text-gray-500 ml-1">({reportData.soilAnalysis.K} mg/dm³)</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Adicionar card com observações sobre o fósforo */}
            <Card className="p-3 bg-blue-50 border-blue-100">
              <h4 className="font-medium text-blue-800 border-b border-blue-200 pb-1 mb-2">Recomendação para Fósforo</h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Dose recomendada:</span> {phosphorusAnalysis.doseRecomendada} kg/ha de P₂O₅
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Nível crítico para esta classe de solo:</span> {phosphorusAnalysis.limiteCritico} mg/dm³
                </p>
                <div className="mt-1 pt-1 border-t border-blue-200">
                  <p className="text-sm italic text-gray-700">{phosphorusAnalysis.observacao}</p>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="text-right mt-4">
            <Button onClick={handleExportPDF} disabled={loading} className="bg-green-600 text-white hover:bg-green-700">
              {loading ? "Gerando..." : "Exportar PDF com Análise Completa"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 