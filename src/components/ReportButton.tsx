import React from 'react';
import { Button } from "@/components/ui/button";
import { SoilData, CalculationResult } from '@/types/soilAnalysis';
import { generateFertilisoloReport } from '@/utils/fertilisoloReportGenerator';
import { calculateResultsWithArgilaInterpretation } from '@/utils/soilCalculations';
import { useTheme } from '@/providers/ThemeProvider';

interface ReportButtonProps {
  soilData: SoilData;
  cultureName?: string;
  farmName?: string;
  plotName?: string;
  className?: string;
}

/**
 * Converte imagem URL para Base64
 */
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

/**
 * Botão para gerar e baixar relatório profissional no formato Fertilisolo
 */
export function ReportButton({ soilData, cultureName, farmName, plotName, className }: ReportButtonProps) {
  const { theme, logo, organizationName } = useTheme();
  
  const handleGenerateReport = async () => {
    try {
      // Log grande e visível para confirmar que o código está rodando
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
      
      // Calcular os resultados com base nos dados do solo
      const results = calculateResultsWithArgilaInterpretation(soilData);
      
      // Converter logo para base64 se existir
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
      
      // Gerar o relatório PDF com tema personalizado
      const { pdf, filename } = generateFertilisoloReport(
        soilData, 
        results, 
        cultureName, 
        farmName, 
        plotName,
        themeOptions
      );
      
      // Salvar o relatório
      pdf.save(filename);
      console.log('✅ PDF gerado e salvo com sucesso:', filename);
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      alert('Ocorreu um erro ao gerar o relatório. Por favor, tente novamente.');
    }
  };

  return (
    <Button 
      onClick={handleGenerateReport}
      className={`bg-primary hover:bg-primary/90 text-primary-foreground ${className}`}
    >
      Gerar Relatório Profissional
    </Button>
  );
}

export default ReportButton; 