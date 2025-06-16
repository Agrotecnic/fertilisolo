import React from 'react';
import { Button } from "@/components/ui/button";
import { SoilData, CalculationResult } from '@/types/soilAnalysis';
import { generateFertilisoloReport } from '@/utils/fertilisoloReportGenerator';
import { calculateResultsWithArgilaInterpretation } from '@/utils/soilCalculations';

interface ReportButtonProps {
  soilData: SoilData;
  cultureName?: string;
  farmName?: string;
  plotName?: string;
  className?: string;
}

/**
 * Botão para gerar e baixar relatório profissional no formato Fertilisolo
 */
export function ReportButton({ soilData, cultureName, farmName, plotName, className }: ReportButtonProps) {
  const handleGenerateReport = async () => {
    try {
      // Calcular os resultados com base nos dados do solo
      const results = calculateResultsWithArgilaInterpretation(soilData);
      
      // Gerar o relatório PDF
      const { pdf, filename } = generateFertilisoloReport(soilData, results, cultureName, farmName, plotName);
      
      // Salvar o relatório
      pdf.save(filename);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Ocorreu um erro ao gerar o relatório. Por favor, tente novamente.');
    }
  };

  return (
    <Button 
      onClick={handleGenerateReport}
      className={`bg-green-600 hover:bg-green-700 text-white ${className}`}
    >
      Gerar Relatório Profissional
    </Button>
  );
}

export default ReportButton; 