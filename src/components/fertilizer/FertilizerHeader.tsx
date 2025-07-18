import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Sprout } from 'lucide-react';
import { SoilData, CalculationResult } from '@/types/soilAnalysis';
import { generatePDFReport } from '@/utils/pdfGenerator';
import { toast } from '@/components/ui/use-toast';

interface FertilizerHeaderProps {
  soilData: SoilData;
  results: CalculationResult;
  cultureName?: string;
}

export const FertilizerHeader: React.FC<FertilizerHeaderProps> = ({ 
  soilData, 
  results,
  cultureName
}) => {
  const handleExportPDF = async () => {
    try {
      toast({
        title: "Gerando PDF...",
        description: "O arquivo PDF está sendo gerado, aguarde um momento.",
      });
      
      // Usando await para garantir que a promessa seja resolvida
      await generatePDFReport(soilData, results, cultureName);
      
      toast({
        title: "Relatório exportado com sucesso!",
        description: "O arquivo PDF foi gerado e está sendo baixado.",
      });
    } catch (error) {
      console.error("Erro detalhado ao gerar PDF:", error);
      
      toast({
        title: "Erro ao exportar relatório",
        description: "Não foi possível gerar o arquivo PDF. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-green-800 mb-2 flex items-center gap-2">
            <Sprout className="h-6 w-6" />
            Recomendações de Fertilizantes
          </h3>
          <p className="text-gray-700">
            Opções alternativas para correção de nutrientes - escolha <strong>uma fonte</strong> para cada tipo de nutriente
          </p>
          <p className="text-gray-600 text-sm mt-1">
            Cálculos baseados no método de Saturação por Bases e resultados da análise de solo
          </p>
          {cultureName && (
            <p className="text-green-700 text-sm mt-1 font-medium">
              Cultura: {cultureName}
            </p>
          )}
        </div>
        <Button onClick={handleExportPDF} className="bg-green-600 hover:bg-green-700 shadow-md">
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>
    </div>
  );
};
