import { useState } from 'react';
import { getCrops, getFertilizerSources } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Printer, Download, Send } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

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
    zinc: 2.1
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
  const [reportData, setReportData] = useState<ReportData>(sampleData);
  const [loading, setLoading] = useState(false);

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
      pdf.text('Observações importantes sobre micronutrientes:', 15, pdf.autoTable.previous.finalY + 15);
      
      const observations = [
        "• Os micronutrientes são essenciais para o desenvolvimento completo das plantas",
        "• Mesmo em pequenas quantidades, sua deficiência pode comprometer significativamente a produtividade",
        "• A aplicação de micronutrientes deve considerar o tipo de solo, pH e cultura",
        "• Recomenda-se a aplicação combinada com macronutrientes quando possível",
        "• Análises foliares podem complementar as informações do solo para ajuste preciso"
      ];
      
      let yPos = pdf.autoTable.previous.finalY + 20;
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
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Relatório de Recomendação de Fertilizantes</h1>
        <div className="flex space-x-2">
          <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
            <Printer size={16} />
            Imprimir
          </Button>
          <Button onClick={handleDownloadPDF} disabled={loading} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
            <Download size={16} />
            {loading ? 'Gerando PDF...' : 'Download PDF'}
          </Button>
        </div>
      </div>

      {/* Container do relatório que será capturado para PDF */}
      <div id="report-container" className="bg-white p-6 rounded-lg shadow-md space-y-6 print:shadow-none print:p-0">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center border-b border-green-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-green-700">Fertilisolo</h2>
            <p className="text-sm text-gray-500">Relatório gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          <div className="text-right">
            <h3 className="font-medium">{reportData.soilAnalysis.farm_name}</h3>
            <p className="text-sm text-gray-600">{reportData.soilAnalysis.location}</p>
            <p className="text-sm text-gray-600">Data da coleta: {reportData.soilAnalysis.collection_date && new Date(reportData.soilAnalysis.collection_date).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* Informações da cultura */}
        <div className="bg-green-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold text-green-700 mb-2">Cultura: {reportData.crop.name}</h3>
          {reportData.crop.scientific_name && (
            <p className="text-sm text-gray-600 italic">Nome científico: {reportData.crop.scientific_name}</p>
          )}
        </div>

        {/* Análise do solo em grid */}
        <div>
          <h3 className="text-lg font-semibold text-green-700 mb-3">Análise do Solo</h3>
          
          <div className="grid grid-cols-3 gap-4">
            {/* Macronutrientes */}
            <Card className="p-3 bg-green-50 border-green-100">
              <h4 className="font-medium text-green-800 border-b border-green-200 pb-1 mb-2">pH e Matéria Orgânica</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">pH:</span>
                  <span className="font-medium">{reportData.soilAnalysis.ph}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Matéria Orgânica:</span>
                  <span className="font-medium">{reportData.soilAnalysis.organic_matter} %</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-3 bg-green-50 border-green-100">
              <h4 className="font-medium text-green-800 border-b border-green-200 pb-1 mb-2">Macronutrientes Primários</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fósforo (P):</span>
                  <span className="font-medium">{reportData.soilAnalysis.phosphorus} mg/dm³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Potássio (K):</span>
                  <span className="font-medium">{reportData.soilAnalysis.potassium} cmolc/dm³</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-3 bg-green-50 border-green-100">
              <h4 className="font-medium text-green-800 border-b border-green-200 pb-1 mb-2">Macronutrientes Secundários</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cálcio (Ca):</span>
                  <span className="font-medium">{reportData.soilAnalysis.calcium} cmolc/dm³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Magnésio (Mg):</span>
                  <span className="font-medium">{reportData.soilAnalysis.magnesium} cmolc/dm³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Enxofre (S):</span>
                  <span className="font-medium">{reportData.soilAnalysis.sulfur} mg/dm³</span>
                </div>
              </div>
            </Card>
            
            {/* Micronutrientes - destaque especial */}
            <Card className="p-3 bg-green-100 border-green-200 col-span-3">
              <h4 className="font-medium text-green-800 border-b border-green-300 pb-1 mb-2">Micronutrientes</h4>
              <div className="grid grid-cols-5 gap-4">
                <div className="space-y-1">
                  <div className="text-gray-700 font-medium">Boro (B)</div>
                  <div className="text-lg font-semibold">{reportData.soilAnalysis.boron} mg/dm³</div>
                  <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${getNutrientLevel(reportData.soilAnalysis.boron, 0.2, 0.6) === 'Baixo' ? 'bg-red-100 text-red-800' : getNutrientLevel(reportData.soilAnalysis.boron, 0.2, 0.6) === 'Alto' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {getNutrientLevel(reportData.soilAnalysis.boron, 0.2, 0.6)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-700 font-medium">Cobre (Cu)</div>
                  <div className="text-lg font-semibold">{reportData.soilAnalysis.copper} mg/dm³</div>
                  <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${getNutrientLevel(reportData.soilAnalysis.copper, 0.8, 1.8) === 'Baixo' ? 'bg-red-100 text-red-800' : getNutrientLevel(reportData.soilAnalysis.copper, 0.8, 1.8) === 'Alto' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {getNutrientLevel(reportData.soilAnalysis.copper, 0.8, 1.8)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-700 font-medium">Ferro (Fe)</div>
                  <div className="text-lg font-semibold">{reportData.soilAnalysis.iron} mg/dm³</div>
                  <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${getNutrientLevel(reportData.soilAnalysis.iron, 15, 40) === 'Baixo' ? 'bg-red-100 text-red-800' : getNutrientLevel(reportData.soilAnalysis.iron, 15, 40) === 'Alto' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {getNutrientLevel(reportData.soilAnalysis.iron, 15, 40)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-700 font-medium">Manganês (Mn)</div>
                  <div className="text-lg font-semibold">{reportData.soilAnalysis.manganese} mg/dm³</div>
                  <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${getNutrientLevel(reportData.soilAnalysis.manganese, 15, 30) === 'Baixo' ? 'bg-red-100 text-red-800' : getNutrientLevel(reportData.soilAnalysis.manganese, 15, 30) === 'Alto' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {getNutrientLevel(reportData.soilAnalysis.manganese, 15, 30)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-700 font-medium">Zinco (Zn)</div>
                  <div className="text-lg font-semibold">{reportData.soilAnalysis.zinc} mg/dm³</div>
                  <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${getNutrientLevel(reportData.soilAnalysis.zinc, 1.0, 2.2) === 'Baixo' ? 'bg-red-100 text-red-800' : getNutrientLevel(reportData.soilAnalysis.zinc, 1.0, 2.2) === 'Alto' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {getNutrientLevel(reportData.soilAnalysis.zinc, 1.0, 2.2)}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Recomendações de fertilizantes */}
        <div>
          <h3 className="text-lg font-semibold text-green-700 mb-3">Recomendações de Fertilizantes</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-green-200">
              <thead className="bg-green-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Fertilizante</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Quantidade</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Método</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Estágio</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-green-100">
                {reportData.recommendations.map((rec, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-green-50 bg-opacity-30' : 'bg-white'}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{rec.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{rec.amount} {rec.unit}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{rec.application_method || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{rec.stage || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gráfico visual de necessidades */}
        <div>
          <h3 className="text-lg font-semibold text-green-700 mb-3">Análise Visual de Necessidades</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-md">
              <h4 className="font-medium text-green-800 mb-2">Macronutrientes</h4>
              <div className="space-y-3">
                {/* Barra de Fósforo */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Fósforo (P)</span>
                    <span className="text-xs font-medium text-gray-700">
                      {getNutrientLevel(reportData.soilAnalysis.phosphorus, 10, 20)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (reportData.soilAnalysis.phosphorus || 0) / 30 * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
                {/* Barra de Potássio */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Potássio (K)</span>
                    <span className="text-xs font-medium text-gray-700">
                      {getNutrientLevel(reportData.soilAnalysis.potassium, 0.1, 0.3)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (reportData.soilAnalysis.potassium || 0) / 0.5 * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
                {/* Barra de Cálcio */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Cálcio (Ca)</span>
                    <span className="text-xs font-medium text-gray-700">
                      {getNutrientLevel(reportData.soilAnalysis.calcium, 2.0, 4.0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (reportData.soilAnalysis.calcium || 0) / 6 * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-md">
              <h4 className="font-medium text-green-800 mb-2">Micronutrientes</h4>
              <div className="space-y-3">
                {/* Barra de Boro */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Boro (B)</span>
                    <span className="text-xs font-medium text-gray-700">
                      {getNutrientLevel(reportData.soilAnalysis.boron, 0.2, 0.6)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (reportData.soilAnalysis.boron || 0) / 1 * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
                {/* Barra de Zinco */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Zinco (Zn)</span>
                    <span className="text-xs font-medium text-gray-700">
                      {getNutrientLevel(reportData.soilAnalysis.zinc, 1.0, 2.2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (reportData.soilAnalysis.zinc || 0) / 3 * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
                {/* Barra de Manganês */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Manganês (Mn)</span>
                    <span className="text-xs font-medium text-gray-700">
                      {getNutrientLevel(reportData.soilAnalysis.manganese, 15, 30)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (reportData.soilAnalysis.manganese || 0) / 50 * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notas e recomendações especiais */}
        <div className="bg-green-50 p-4 rounded-md">
          <h3 className="text-md font-semibold text-green-700 mb-2">Notas e Recomendações Especiais</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            <li>Aplicar os micronutrientes em deficiência via foliar nos estágios iniciais de desenvolvimento.</li>
            <li>Considerar o parcelamento da adubação potássica em solos arenosos.</li>
            <li>Monitorar os níveis de pH após a calagem para verificar a efetividade.</li>
            <li>Para essa cultura, atenção especial aos níveis de {reportData.soilAnalysis.zinc && reportData.soilAnalysis.zinc < 1.0 ? 'zinco' : reportData.soilAnalysis.boron && reportData.soilAnalysis.boron < 0.2 ? 'boro' : 'micronutrientes em geral'}.</li>
          </ul>
        </div>
        
        {/* Rodapé */}
        <div className="border-t border-green-100 pt-4 text-sm text-gray-500 flex justify-between">
          <div>
            <p>Fertilisolo - Análise e recomendação de fertilizantes</p>
            <p>Relatório gerado por sistema especialista</p>
          </div>
          <div className="text-right">
            <p>Página 1/3</p>
            <p>Contato: suporte@fertilisolo.com.br</p>
          </div>
        </div>
      </div>
    </div>
  );
} 