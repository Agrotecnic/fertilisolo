import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SoilAnalysisForm } from '@/components/SoilAnalysisForm';
import { AnalysisResults } from '@/components/AnalysisResults';
import { FertilizerRecommendations } from '@/components/FertilizerRecommendations';
import { AnalysisHistory } from '@/components/AnalysisHistory';
import { SoilInsights } from '@/components/SoilInsights';
import { Calculator, Leaf, FileText, History, Brain, LogOut, PlusCircleIcon, SearchIcon, ClipboardListIcon, SettingsIcon, FileTextIcon, AreaChartIcon } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

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
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.',
      });
      navigate('/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao sair',
        description: 'Ocorreu um erro ao fazer logout.',
      });
    }
  };

  const titleStyle = { fontFamily: 'Inter, sans-serif' };

  return (
    <div className="min-h-screen bg-bg-light">
      <Header />
      
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        {/* Botões de ação */}
        <div className="flex justify-between mb-4">
          <Link to="/relatorio" className="hidden md:block">
            <Button 
              variant="outline" 
              className="border-green-600 text-green-700 hover:bg-green-50 shadow-md flex items-center gap-2 text-sm md:text-base py-1 px-2 md:py-2 md:px-4"
            >
              <FileText className="h-4 w-4 md:h-5 md:w-5" />
              Ver Modelo de Relatório
            </Button>
          </Link>
          <Button 
            variant="destructive" 
            className="bg-red-600 hover:bg-red-700 shadow-md flex items-center gap-1 md:gap-2 text-sm md:text-base py-1 px-2 md:py-2 md:px-4 ml-auto"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden xs:inline">Sair da Conta</span>
            <span className="xs:hidden">Sair</span>
          </Button>
        </div>
        
        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Versão para telas médias e grandes */}
          <TabsList className="hidden md:grid w-full grid-cols-5 mb-8 bg-white shadow-sm">
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
          
          {/* Versão para dispositivos móveis - layout em duas linhas */}
          <div className="md:hidden mb-4">
            <TabsList className="grid w-full grid-cols-3 mb-2 bg-white shadow-sm text-xs">
              <TabsTrigger value="input" className="flex flex-col items-center gap-1 py-2 text-gray-700 data-[state=active]:bg-primary-dark data-[state=active]:text-white">
                <Calculator className="h-4 w-4" />
                <span>Nova</span>
              </TabsTrigger>
              <TabsTrigger value="results" disabled={!results} className="flex flex-col items-center gap-1 py-2 text-gray-700 data-[state=active]:bg-primary-dark data-[state=active]:text-white">
                <FileText className="h-4 w-4" />
                <span>Resultados</span>
              </TabsTrigger>
              <TabsTrigger value="insights" disabled={!results} className="flex flex-col items-center gap-1 py-2 text-gray-700 data-[state=active]:bg-primary-dark data-[state=active]:text-white">
                <Brain className="h-4 w-4" />
                <span>Insights</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm text-xs">
              <TabsTrigger value="recommendations" disabled={!results} className="flex flex-col items-center gap-1 py-2 text-gray-700 data-[state=active]:bg-primary-dark data-[state=active]:text-white">
                <Leaf className="h-4 w-4" />
                <span>Recomendações</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex flex-col items-center gap-1 py-2 text-gray-700 data-[state=active]:bg-primary-dark data-[state=active]:text-white">
                <History className="h-4 w-4" />
                <span>Histórico</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="input">
            <Card className="bg-white border-secondary-dark/10 shadow-sm">
              <CardHeader className="border-b border-secondary-dark/10">
                <CardTitle className="text-lg md:text-xl text-primary-dark flex items-center gap-2" style={titleStyle}>
                  <Calculator className="h-4 w-4 md:h-5 md:w-5 text-secondary-dark" />
                  Entrada de Dados da Análise do Solo
                </CardTitle>
                <CardDescription className="text-xs md:text-sm text-neutral-medium">
                  Insira os valores da análise química do solo para calcular as saturações e necessidades de adubação
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 md:pt-6">
                <div className="mb-4 md:hidden">
                  <Link to="/relatorio" className="w-full">
                    <Button 
                      variant="outline" 
                      className="border-green-600 text-green-700 hover:bg-green-50 w-full flex items-center justify-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Ver Modelo de Relatório
                    </Button>
                  </Link>
                </div>
                <SoilAnalysisForm onAnalysisComplete={handleAnalysisComplete} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            {soilData && results && (
              <div className="space-y-4 md:space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl md:text-2xl font-bold text-primary-dark" style={titleStyle}>Resultados da Análise</h2>
                  <Button onClick={resetAnalysis} variant="outline" className="border-secondary-dark/20 text-secondary-dark hover:bg-secondary-dark/5 text-xs md:text-sm py-1 px-2 md:py-2 md:px-4">
                    Nova Análise
                  </Button>
                </div>
                <AnalysisResults soilData={soilData} results={results} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights">
            {soilData && results && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold text-primary-dark" style={titleStyle}>Insights da Análise</h2>
                <SoilInsights soilData={soilData} results={results} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations">
            {soilData && results && (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold text-primary-dark" style={titleStyle}>Recomendações de Adubação</h2>
                <FertilizerRecommendations soilData={soilData} results={results} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-white border-secondary-dark/10 shadow-sm">
              <CardHeader className="border-b border-secondary-dark/10">
                <CardTitle className="text-lg md:text-xl text-primary-dark flex items-center gap-2" style={titleStyle}>
                  <History className="h-4 w-4 md:h-5 md:w-5 text-secondary-dark" />
                  Histórico de Análises
                </CardTitle>
                <CardDescription className="text-xs md:text-sm text-neutral-medium">
                  Visualize e compare análises anteriores
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 md:pt-6">
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
