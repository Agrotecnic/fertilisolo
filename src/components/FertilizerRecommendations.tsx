
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SoilData, CalculatedResults } from '@/pages/Index';
import { fertilizerSources, calculateFertilizerRecommendations } from '@/utils/soilCalculations';
import { generatePDFReport } from '@/utils/pdfGenerator';
import { FileText, Sprout } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FertilizerRecommendationsProps {
  soilData: SoilData;
  results: CalculatedResults;
}

export const FertilizerRecommendations: React.FC<FertilizerRecommendationsProps> = ({ 
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

  const renderMicronutrientRecommendations = (
    nutrient: 'S' | 'B' | 'Cu' | 'Fe' | 'Mn' | 'Zn',
    needValue: number,
    title: string
  ) => {
    if (needValue <= 0.01) {
      return (
        <Card key={nutrient} className="bg-green-50 border-green-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-800 flex items-center gap-2 text-sm">
              <Sprout className="h-4 w-4" />
              {title}
              <Badge className="bg-green-100 text-green-800 text-xs">Adequado</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-green-700 text-sm">
              Os níveis estão adequados. Não necessita correção.
            </p>
          </CardContent>
        </Card>
      );
    }

    const sources = fertilizerSources[nutrient];

    return (
      <Card key={nutrient} className="bg-white border-orange-200 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-orange-800 text-sm flex items-center gap-2">
            <Sprout className="h-4 w-4" />
            {title}
            <Badge variant="outline" className="text-orange-700 border-orange-300 text-xs">
              Correção Necessária
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            Necessário: {needValue.toFixed(2)} kg/ha
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {sources.map((source, index) => {
              const recommendation = needValue / (source.concentration / 100);
              return (
                <div key={index} className="p-3 bg-orange-50 rounded-md border border-orange-100">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{source.name}</h4>
                      <p className="text-xs text-gray-600">{source.concentration}{source.unit}</p>
                    </div>
                    <Badge variant="secondary" className="text-orange-700 bg-orange-100 text-xs">
                      {recommendation.toFixed(1)} kg/ha
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-700">{source.benefits}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderNutrientRecommendations = (
    nutrient: 'Ca' | 'Mg' | 'K' | 'P',
    needValue: number,
    title: string,
    color: string
  ) => {
    if (needValue <= 0.01) {
      return (
        <Card key={nutrient} className="bg-green-50 border-green-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-800 flex items-center gap-2 text-base">
              <Sprout className="h-5 w-5" />
              {title}
              <Badge className="bg-green-100 text-green-800 text-xs">Adequado</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-green-700">
              Os níveis de {title.toLowerCase()} estão adequados. Não é necessária correção.
            </p>
          </CardContent>
        </Card>
      );
    }

    const recommendations = calculateFertilizerRecommendations(nutrient, needValue);

    return (
      <Card key={nutrient} className={`bg-white border-${color}-200 hover:shadow-lg transition-shadow`}>
        <CardHeader className="pb-4">
          <CardTitle className={`text-${color}-800 text-base flex items-center gap-2`}>
            <Sprout className="h-5 w-5" />
            {title}
            <Badge variant="outline" className={`text-${color}-700 border-${color}-300 text-xs`}>
              Correção Necessária
            </Badge>
          </CardTitle>
          <CardDescription className="text-sm">
            Necessário: {needValue.toFixed(2)} {nutrient === 'P' ? 'kg/ha' : 'cmolc/dm³'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className={`p-4 bg-${color}-50 rounded-lg border border-${color}-100 hover:bg-${color}-100 transition-colors`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{rec.source.name}</h4>
                    <p className="text-sm text-gray-600">{rec.source.concentration}{rec.source.unit}</p>
                  </div>
                  <Badge className={`bg-${color}-200 text-${color}-800 border-${color}-300`}>
                    {rec.recommendation.toFixed(1)} kg/ha
                  </Badge>
                </div>
                <p className="text-sm text-gray-700">{rec.source.benefits}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header melhorado */}
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

      {/* Macronutrientes Primários - Grid 2x2 */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
          Macronutrientes Primários
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderNutrientRecommendations('Ca', results.needs.Ca, 'Cálcio (Ca)', 'blue')}
          {renderNutrientRecommendations('Mg', results.needs.Mg, 'Magnésio (Mg)', 'purple')}
          {renderNutrientRecommendations('K', results.needs.K, 'Potássio (K)', 'orange')}
          {renderNutrientRecommendations('P', results.needs.P, 'Fósforo (P)', 'red')}
        </div>
      </div>

      {/* Macronutrientes Secundários e Micronutrientes - Grid mais compacto */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
          Macronutrientes Secundários e Micronutrientes
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderMicronutrientRecommendations('S', results.needs.S, 'Enxofre (S)')}
          {renderMicronutrientRecommendations('B', results.needs.B, 'Boro (B)')}
          {renderMicronutrientRecommendations('Cu', results.needs.Cu, 'Cobre (Cu)')}
          {renderMicronutrientRecommendations('Fe', results.needs.Fe, 'Ferro (Fe)')}
          {renderMicronutrientRecommendations('Mn', results.needs.Mn, 'Manganês (Mn)')}
          {renderMicronutrientRecommendations('Zn', results.needs.Zn, 'Zinco (Zn)')}
        </div>
      </div>

      {/* Informações de Aplicação - Layout melhorado */}
      <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 text-lg">Informações Importantes sobre Aplicação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-gray-900 mb-3 text-blue-800">Saturações Ideais</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Cálcio (Ca):</span>
                    <span className="font-medium">50-60% da CTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Magnésio (Mg):</span>
                    <span className="font-medium">15-20% da CTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Potássio (K):</span>
                    <span className="font-medium">3-5% da CTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Relação Ca/Mg:</span>
                    <span className="font-medium">3:1 a 5:1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Fósforo (P):</span>
                    <span className="font-medium">≥ 15 ppm</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-green-100">
                <h4 className="font-semibold text-gray-900 mb-3 text-green-800">Práticas de Aplicação</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    Aplicar calcário 60-90 dias antes do plantio
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    Incorporar uniformemente até 20 cm
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    Dividir doses altas em duas aplicações
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    Aplicar fósforo no sulco de plantio
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    Parcelar potássio em culturas anuais
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">Observações Importantes</h4>
                <p className="text-sm text-yellow-700 leading-relaxed">
                  Estas recomendações são baseadas no método de Saturação por Bases e nos valores informados 
                  na análise de solo. Recomenda-se consultar um engenheiro agrônomo para validação das 
                  recomendações e adequação às condições específicas da propriedade e da cultura a ser implantada.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
