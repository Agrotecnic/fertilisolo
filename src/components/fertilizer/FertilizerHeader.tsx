
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Sprout } from 'lucide-react';
import { SoilData, CalculatedResults } from '@/pages/Index';
import { generatePDFReport } from '@/utils/pdfGenerator';
import { toast } from '@/hooks/use-toast';

interface FertilizerHeaderProps {
  soilData: SoilData;
  results: CalculatedResults;
}

export const FertilizerHeader: React.FC<FertilizerHeaderProps> = ({ 
  soilData, 
  results 
}) => {
  const handleExportPDF = () => {
    try {
      generatePDFReport(soilData, results);
      toast({
        title: "Relatório exportado com sucesso!",
        description: "O arquivo PDF foi gerado e está sendo baixado.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar relatório",
        description: "Não foi possível gerar o arquivo PDF.",
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
            Quantidades recomendadas por fonte comercial, baseadas no método de Saturação por Bases
          </p>
        </div>
        <Button onClick={handleExportPDF} className="bg-green-600 hover:bg-green-700 shadow-md">
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>
    </div>
  );
};
