
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SoilAnalysisForm } from '@/components/SoilAnalysisForm';
import { AnalysisResults } from '@/components/AnalysisResults';
import { FertilizerRecommendations } from '@/components/FertilizerRecommendations';
import { AnalysisHistory } from '@/components/AnalysisHistory';
import { Calculator, Leaf, FileText, History } from 'lucide-react';

export interface SoilData {
  id?: string;
  date?: string;
  location?: string;
  T: number; // CTC
  Ca: number; // Cálcio atual
  Mg: number; // Magnésio atual
  K: number; // Potássio atual
  P: number; // Fósforo em ppm
  // Macronutrientes secundários
  S: number; // Enxofre em ppm
  // Micronutrientes
  B: number; // Boro em ppm
  Cu: number; // Cobre em ppm
  Fe: number; // Ferro em ppm
  Mn: number; // Manganês em ppm
  Zn: number; // Zinco em ppm
}

export interface CalculatedResults {
  saturations: {
    Ca: number;
    Mg: number;
    K: number;
  };
  caeMgRatio: number;
  needs: {
    Ca: number;
    Mg: number;
    K: number;
    P: number;
    S: number;
    B: number;
    Cu: number;
    Fe: number;
    Mn: number;
    Zn: number;
  };
  isAdequate: {
    Ca: boolean;
    Mg: boolean;
    K: boolean;
    P: boolean;
    CaMgRatio: boolean;
    S: boolean;
    B: boolean;
    Cu: boolean;
    Fe: boolean;
    Mn: boolean;
    Zn: boolean;
  };
}

const Index = () => {
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [results, setResults] = useState<CalculatedResults | null>(null);
  const [activeTab, setActiveTab] = useState('input');

  const handleAnalysisComplete = (data: SoilData, calculatedResults: CalculatedResults) => {
    setSoilData(data);
    setResults(calculatedResults);
    setActiveTab('results');
  };

  const resetAnalysis = () => {
    setSoilData(null);
    setResults(null);
    setActiveTab('input');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Leaf className="h-12 w-12 text-green-600 mr-3" />
            <h1 className="text-4xl font-bold text-green-800">SoloAnalyzer Pro</h1>
          </div>
          <p className="text-xl text-green-700 max-w-3xl mx-auto">
            Análise de Solo e Recomendação de Adubação - Método de Saturações por Bases
          </p>
          <p className="text-sm text-green-600 mt-2">
            Ferramenta profissional para agrônomos, técnicos agrícolas e produtores rurais
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="input" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Análise
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!results} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resultados
            </TabsTrigger>
            <TabsTrigger value="recommendations" disabled={!results} className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Recomendações
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input">
            <Card className="bg-white/80 backdrop-blur-sm border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Entrada de Dados da Análise do Solo
                </CardTitle>
                <CardDescription>
                  Insira os valores da análise química do solo para calcular as saturações e necessidades de adubação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SoilAnalysisForm onAnalysisComplete={handleAnalysisComplete} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            {soilData && results && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-green-800">Resultados da Análise</h2>
                  <Button onClick={resetAnalysis} variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                    Nova Análise
                  </Button>
                </div>
                <AnalysisResults soilData={soilData} results={results} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations">
            {soilData && results && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-green-800">Recomendações de Adubação</h2>
                <FertilizerRecommendations soilData={soilData} results={results} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-white/80 backdrop-blur-sm border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Histórico de Análises
                </CardTitle>
                <CardDescription>
                  Visualize e compare análises anteriores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalysisHistory />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
