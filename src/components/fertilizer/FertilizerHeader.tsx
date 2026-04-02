import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Sprout } from 'lucide-react';
import { SoilData, CalculationResult } from '@/types/soilAnalysis';
import { generatePDFReport } from '@/utils/pdfGenerator';
import { toast } from '@/components/ui/use-toast';
import { useTheme } from '@/providers/ThemeProvider';
import { FertilizerSelectionDialog } from '@/components/FertilizerSelectionDialog';

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
  const { theme, logo, organizationName } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleGeneratePDF = async (selectedFertilizers: string[]) => {
    setIsGenerating(true);
    try {
      toast({
        title: "Gerando PDF...",
        description: "O arquivo PDF está sendo gerado, aguarde um momento.",
      });

      let logoBase64: string | undefined = undefined;
      if (logo) {
        try {
          logoBase64 = await convertImageToBase64(logo);
        } catch {
          // continua sem logo
        }
      }

      const themeOptions = {
        primaryColor: theme?.primary_color,
        secondaryColor: theme?.secondary_color,
        accentColor: theme?.accent_color,
        logo: logoBase64,
        organizationName: organizationName || 'Fertilisolo',
      };

      await generatePDFReport(soilData, results, cultureName, themeOptions, selectedFertilizers);

      setDialogOpen(false);
      toast({
        title: "Relatório exportado com sucesso!",
        description: "O arquivo PDF foi gerado e está sendo baixado.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao exportar relatório",
        description: "Não foi possível gerar o arquivo PDF. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 sm:p-6 rounded-lg border border-green-200">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-2 flex items-center gap-2">
            <Sprout className="h-5 w-5 sm:h-6 sm:w-6" />
            Recomendações de Fertilizantes
          </h3>
          <p className="text-sm sm:text-base text-gray-700">
            Opções alternativas para correção de nutrientes - escolha <strong>uma fonte</strong> para cada tipo de nutriente
          </p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Cálculos baseados no método de Saturação por Bases e resultados da análise de solo
          </p>
          {cultureName && (
            <p className="text-xs sm:text-sm text-green-700 mt-1 font-medium">
              Cultura: {cultureName}
            </p>
          )}
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-green-600 hover:bg-green-700 shadow-md w-full sm:w-auto flex-shrink-0"
        >
          <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="whitespace-nowrap">Exportar PDF</span>
        </Button>
      </div>

      <FertilizerSelectionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onGenerate={handleGeneratePDF}
        isGenerating={isGenerating}
      />
    </div>
  );
};
