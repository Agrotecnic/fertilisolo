import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Sprout } from 'lucide-react';
import { SoilData, CalculationResult } from '@/types/soilAnalysis';
import { generatePDFReport } from '@/utils/pdfGenerator';
import { toast } from '@/components/ui/use-toast';
import { useTheme } from '@/providers/ThemeProvider';

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
    try {
      console.log('═══════════════════════════════════════════════════════');
      console.log('🎨 INICIANDO GERAÇÃO DE PDF COM PERSONALIZAÇÃO');
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

      toast({
        title: "Gerando PDF...",
        description: "O arquivo PDF está sendo gerado, aguarde um momento.",
      });
      
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

      // Gerar PDF com personalização
      await generatePDFReport(soilData, results, cultureName, themeOptions);
      
      console.log('✅ PDF gerado e salvo com sucesso');

      toast({
        title: "Relatório exportado com sucesso!",
        description: "O arquivo PDF foi gerado e está sendo baixado.",
      });
    } catch (error) {
      console.error("❌ Erro ao gerar PDF:", error);
      
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
