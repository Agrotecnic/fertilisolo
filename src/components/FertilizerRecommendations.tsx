
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SoilData, CalculatedResults } from '@/pages/Index';
import { fertilizerSources, calculateFertilizerRecommendations } from '@/utils/soilCalculations';
import { generatePDFReport } from '@/utils/pdfGenerator';
import { FileText } from 'lucide-react';
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
        <Card key={nutrient} className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              {title}
              <Badge className="bg-green-100 text-green-800">Adequado</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              Os níveis de {title.toLowerCase()} estão adequados. Não é necessária correção.
            </p>
          </CardContent>
        </Card>
      );
    }

    const sources = fertilizerSources[nutrient];

    return (
      <Card key={nutrient} className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-800">
            {title} - Necessita Correção
          </CardTitle>
          <CardDescription>
            Necessário: {needValue.toFixed(2)} kg/ha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sources.map((source, index) => {
              const recommendation = needValue / (source.concentration / 100);
              return (
                <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{source.name}</h4>
                      <p className="text-sm text-gray-600">{source.concentration}{source.unit}</p>
                    </div>
                    <Badge variant="outline" className="text-gray-700 border-gray-300">
                      {recommendation.toFixed(1)} kg/ha
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{source.benefits}</p>
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
        <Card key={nutrient} className={`bg-green-50 border-green-200`}>
          <CardHeader>
            <CardTitle className={`text-green-800 flex items-center gap-2`}>
              {title}
              <Badge className="bg-green-100 text-green-800">Adequado</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              Os níveis de {title.toLowerCase()} estão adequados. Não é necessária correção.
            </p>
          </CardContent>
        </Card>
      );
    }

    const recommendations = calculateFertilizerRecommendations(nutrient, needValue);

    return (
      <Card key={nutrient} className={`bg-${color}-50 border-${color}-200`}>
        <CardHeader>
          <CardTitle className={`text-${color}-800`}>
            {title} - Necessita Correção
          </CardTitle>
          <CardDescription>
            Necessário: {needValue.toFixed(2)} {nutrient === 'P' ? 'kg/ha' : 'cmolc/dm³'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{rec.source.name}</h4>
                    <p className="text-sm text-gray-600">{rec.source.concentration}{rec.source.unit}</p>
                  </div>
                  <Badge variant="outline" className={`text-${color}-700 border-${color}-300`}>
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
    <div className="space-y-6">
      {/* Header com botão de exportação */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Recomendações por Fonte de Nutriente
          </h3>
          <p className="text-gray-600">
            Quantidades recomendadas em kg/ha para diferentes fontes comerciais
          </p>
        </div>
        <Button onClick={handleExportPDF} className="bg-green-600 hover:bg-green-700">
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Recomendações por nutriente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Macronutrientes primários */}
        {renderNutrientRecommendations('Ca', results.needs.Ca, 'Cálcio (Ca)', 'blue')}
        {renderNutrientRecommendations('Mg', results.needs.Mg, 'Magnésio (Mg)', 'purple')}
        {renderNutrientRecommendations('K', results.needs.K, 'Potássio (K)', 'orange')}
        {renderNutrientRecommendations('P', results.needs.P, 'Fósforo (P)', 'red')}
        
        {/* Macronutrientes secundários e micronutrientes */}
        {renderMicronutrientRecommendations('S', results.needs.S, 'Enxofre (S)')}
        {renderMicronutrientRecommendations('B', results.needs.B, 'Boro (B)')}
        {renderMicronutrientRecommendations('Cu', results.needs.Cu, 'Cobre (Cu)')}
        {renderMicronutrientRecommendations('Fe', results.needs.Fe, 'Ferro (Fe)')}
        {renderMicronutrientRecommendations('Mn', results.needs.Mn, 'Manganês (Mn)')}
        {renderMicronutrientRecommendations('Zn', results.needs.Zn, 'Zinco (Zn)')}
      </div>

      {/* Informações Adicionais */}
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Informações Importantes sobre Aplicação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Método de Saturação por Bases</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Saturação ideal de Ca: 50-60% da CTC</li>
                <li>• Saturação ideal de Mg: 15-20% da CTC</li>
                <li>• Saturação ideal de K: 3-5% da CTC</li>
                <li>• Relação Ca/Mg ideal: 3:1 a 5:1</li>
                <li>• P mínimo para cerrados: 15 ppm</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Recomendações de Aplicação</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Aplicar calcário 60-90 dias antes do plantio</li>
                <li>• Incorporar uniformemente até 20 cm de profundidade</li>
                <li>• Dividir doses altas em duas aplicações</li>
                <li>• Aplicar fósforo no sulco de plantio</li>
                <li>• Parcelar potássio em culturas anuais</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Observações Importantes</h4>
            <p className="text-sm text-yellow-700">
              Estas recomendações são baseadas no método de Saturação por Bases e nos valores informados 
              na análise de solo. Recomenda-se consultar um engenheiro agrônomo para validação das 
              recomendações e adequação às condições específicas da propriedade e da cultura a ser implantada.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
