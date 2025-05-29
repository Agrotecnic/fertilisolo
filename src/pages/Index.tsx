import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SoilAnalysisForm } from '@/components/SoilAnalysisForm';
import { AnalysisResults } from '@/components/AnalysisResults';
import { FertilizerRecommendations } from '@/components/FertilizerRecommendations';
import { AnalysisHistory } from '@/components/AnalysisHistory';
import { SoilInsights } from '@/components/SoilInsights';
import { Calculator, Leaf, FileText, History, Brain } from 'lucide-react';
import { Header } from '@/components/layout/Header';

export interface SoilData {
  id?: string;
  date?: string;
  location?: string;
  crop?: string;
  organicMatter?: number;
  T: number; // CTC
  Ca: number; // Cálcio atual em cmolc/dm³
  Mg: number; // Magnésio atual em cmolc/dm³
  K: number; // Potássio atual em mg/dm³
  P: number; // Fósforo em mg/dm³
  // Macronutrientes secundários
  S: number; // Enxofre em mg/dm³
  // Micronutrientes em mg/dm³
  B: number; // Boro
  Cu: number; // Cobre
  Fe: number; // Ferro
  Mn: number; // Manganês
  Zn: number; // Zinco
  Mo: number; // Molibdênio
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
    Mo: number;
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
    Mo: boolean;
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

  const titleStyle = { fontFamily: 'Inter, sans-serif' };

  return (
    <div className="min-h-screen bg-bg-light">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-white shadow-sm">
            <TabsTrigger value="input" className="flex items-center gap-2 text-gray-700 data-[state=active]:bg-primary-dark data-[state=active]:text-white">
              <Calculator className="h-4 w-4" />
              Nova Análise
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!results} className="flex items-center gap-2 text-gray-700 data-[state=active]:bg-primary-dark data-[state=active]:text-white">
              <FileText className="h-4 w-4" />
              Resultados
            </TabsTrigger>
            <TabsTrigger value="insights" disabled={!results} className="flex items-center gap-2 text-gray-700 data-[state=active]:bg-primary-dark data-[state=active]:text-white">
              <Brain className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="recommendations" disabled={!results} className="flex items-center gap-2 text-gray-700 data-[state=active]:bg-primary-dark data-[state=active]:text-white">
              <Leaf className="h-4 w-4" />
              Recomendações
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 text-gray-700 data-[state=active]:bg-primary-dark data-[state=active]:text-white">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input">
            <Card className="bg-white border-secondary-dark/10 shadow-sm">
              <CardHeader className="border-b border-secondary-dark/10">
                <CardTitle className="text-primary-dark flex items-center gap-2" style={titleStyle}>
                  <Calculator className="h-5 w-5 text-secondary-dark" />
                  Entrada de Dados da Análise do Solo
                </CardTitle>
                <CardDescription className="text-neutral-medium">
                  Insira os valores da análise química do solo para calcular as saturações e necessidades de adubação
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <SoilAnalysisForm onAnalysisComplete={handleAnalysisComplete} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            {soilData && results && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-primary-dark" style={titleStyle}>Resultados da Análise</h2>
                  <Button onClick={resetAnalysis} variant="outline" className="border-secondary-dark/20 text-secondary-dark hover:bg-secondary-dark/5">
                    Nova Análise
                  </Button>
                </div>
                <AnalysisResults soilData={soilData} results={results} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights">
            {soilData && results && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-primary-dark" style={titleStyle}>Insights da Análise</h2>
                <SoilInsights soilData={soilData} results={results} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations">
            {soilData && results && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-primary-dark" style={titleStyle}>Recomendações de Adubação</h2>
                <FertilizerRecommendations soilData={soilData} results={results} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-white border-secondary-dark/10 shadow-sm">
              <CardHeader className="border-b border-secondary-dark/10">
                <CardTitle className="text-primary-dark flex items-center gap-2" style={titleStyle}>
                  <History className="h-5 w-5 text-secondary-dark" />
                  Histórico de Análises
                </CardTitle>
                <CardDescription className="text-neutral-medium">
                  Visualize e compare análises anteriores
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
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
