import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SoilAnalysisForm } from '@/components/SoilAnalysisForm';
import { AnalysisResults } from '@/components/AnalysisResults';
import { FertilizerRecommendations } from '@/components/FertilizerRecommendations';
import { UserAnalysisHistory } from '@/components/UserAnalysisHistory';
import { SoilInsights } from '@/components/SoilInsights';
import { Calculator, Leaf, FileText, History, Brain, LogOut, PlusCircleIcon, SearchIcon, ClipboardListIcon, SettingsIcon, FileTextIcon, AreaChartIcon, Database } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { calculateNutrientNeeds, plantNeedsReference } from '../utils/fertilizer';
import { SoilData, CalculationResult } from '../types/soilAnalysis';
import { FarmManagement } from '@/components/farm/FarmManagement';
import { saveSoilAnalysis, getFarmPlots, getUserFarms, Farm, Plot } from '@/lib/services';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { FarmManagementButton } from '@/components/farm/FarmManagementButton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AdminAccessButton } from '@/components/AdminAccessButton';

const schema = z.object({
  location: z.string().min(1, "Localização é obrigatória"),
  date: z.string().min(1, "Data é obrigatória"),
  organicMatter: z.number().min(0, "Valor deve ser positivo").optional(),
  T: z.number().min(0, "Valor deve ser positivo").optional(),
  P: z.number().min(0, "Valor deve ser positivo").optional(),
  argila: z.number().min(0, "Valor deve ser positivo").max(100, "Valor máximo é 100%").optional(),
  K: z.number().min(0, "Valor deve ser positivo").optional(),
  Ca: z.number().min(0, "Valor deve ser positivo").optional(),
  Mg: z.number().min(0, "Valor deve ser positivo").optional(),
  S: z.number().min(0, "Valor deve ser positivo").optional(),
  B: z.number().min(0, "Valor deve ser positivo").optional(),
  Cu: z.number().min(0, "Valor deve ser positivo").optional(),
  Fe: z.number().min(0, "Valor deve ser positivo").optional(),
  Mn: z.number().min(0, "Valor deve ser positivo").optional(),
  Zn: z.number().min(0, "Valor deve ser positivo").optional(),
  selectedPlotId: z.string().optional()
});

type FormData = z.infer<typeof schema>;

const Index = () => {
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>('input');
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedCrop, setSelectedCrop] = useState<string>("soja");
  const [targetYield, setTargetYield] = useState<number>(4);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, control } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      location: '',
      date: new Date().toISOString().split('T')[0],
      organicMatter: 0,
      T: 0,
      P: 0,
      argila: 35,
      K: 0,
      Ca: 0,
      Mg: 0,
      S: 0,
      B: 0,
      Cu: 0,
      Fe: 0,
      Mn: 0,
      Zn: 0,
      selectedPlotId: '',
    }
  });

  const handleAnalysisComplete = async (data: SoilData, calculatedResults: CalculationResult) => {
    console.log('🎯 [ANALYSIS] handleAnalysisComplete chamado!');
    console.log('🎯 [ANALYSIS] Dados recebidos:', data);
    
    setSoilData(data);
    setResults(calculatedResults);
    setActiveTab('results');
    
    // Salvar no Supabase
    try {
      console.log('🎯 [ANALYSIS] Iniciando salvamento no Supabase...');
      setIsLoading(true);
      
      const { data: savedAnalysis, error } = await saveSoilAnalysis(data, null);
      
      if (error) {
        console.error('🎯 [ANALYSIS] Erro ao salvar:', error);
        throw error;
      }
      
      console.log('🎯 [ANALYSIS] Análise salva com sucesso!', savedAnalysis);
      toast({
        title: "Análise salva com sucesso!",
        description: "Os dados foram salvos no banco de dados.",
      });
    } catch (error: any) {
      console.error('🎯 [ANALYSIS] Erro no processo de salvamento:', error);
      toast({
        variant: 'destructive',
        title: "Erro ao salvar análise",
        description: error.message || "Ocorreu um erro ao salvar os dados."
      });
    } finally {
      setIsLoading(false);
    }
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

  const onSelectPlot = async (plotId: string) => {
    // Se o valor for 'none', limpe o campo selectedPlotId
    if (plotId === 'none') {
      setValue('selectedPlotId', '');
      return;
    }
    
    setValue('selectedPlotId', plotId);
    
    // Se houver talhão selecionado, busque os dados da fazenda correspondente
    if (plotId) {
      const selectedPlot = plots.find(plot => plot.id === plotId);
      if (selectedPlot) {
        // Se o talhão tem uma fazenda associada, preencha o nome da fazenda no campo de localização
        const farmName = farms.find(farm => farm.id === selectedPlot.farm_id)?.name;
        if (farmName) {
          setValue('location', `${farmName} - ${selectedPlot.name}`);
        } else {
          setValue('location', selectedPlot.name);
        }
      }
    }
  };

  const loadFarmsAndPlots = async () => {
    try {
      // Carregar fazendas
      const { data: farmsData, error: farmsError } = await getUserFarms();
      if (farmsError) throw farmsError;
      setFarms(farmsData);

      if (farmsData.length > 0) {
        // Carregar talhões da primeira fazenda ou de todas as fazendas
        let allPlots: Plot[] = [];
        for (const farm of farmsData) {
          const { data: plotsData, error: plotsError } = await getFarmPlots(farm.id || '');
          if (plotsError) throw plotsError;
          if (plotsData) {
            allPlots = [...allPlots, ...plotsData];
          }
        }
        setPlots(allPlots);
      }
    } catch (error) {
      console.error('Erro ao carregar fazendas e talhões:', error);
    }
  };

  // Carregar fazendas e talhões quando o componente montar
  useEffect(() => {
    loadFarmsAndPlots();
  }, []);

  const onSubmit = async (data: FormData) => {
    // Cálculos para a recomendação de fertilizantes
    const crop = plantNeedsReference[selectedCrop];
    
    if (!crop) {
      alert('Cultura não encontrada');
      return;
    }
    
    const soilData: SoilData = {
      location: data.location,
      date: data.date,
      organicMatter: data.organicMatter,
      T: data.T,
      P: data.P,
      argila: data.argila,
      K: data.K,
      Ca: data.Ca,
      Mg: data.Mg,
      S: data.S,
      B: data.B,
      Cu: data.Cu,
      Fe: data.Fe,
      Mn: data.Mn,
      Zn: data.Zn,
    };
    
    // Calcular necessidades
    const results = calculateNutrientNeeds({
      soilData,
      cropNeeds: crop,
      targetYield
    });
    
    // DEBUG: Verificar se os dados estão sendo gerados corretamente
    console.log("DEBUG - Dados do solo:", soilData);
    console.log("DEBUG - Resultados do cálculo:", results);
    console.log("DEBUG - Cultura selecionada:", selectedCrop);
    console.log("DEBUG - Produtividade alvo:", targetYield);
    
    // Atualizar o estado para que os componentes tenham acesso aos dados
    setSoilData(soilData);
    setResults(results);
    setActiveTab('results');
    
    console.log('🚀 [INDEX] Iniciando processo de salvamento da análise...');
    console.log('🚀 [INDEX] soilData a ser salvo:', soilData);
    
    // Salvar a análise no Supabase
    try {
      console.log('🚀 [INDEX] Dentro do try block de salvamento');
      setIsLoading(true);
      // Verificar se o plotId é válido (não é vazio e não é 'none')
      const validPlotId = data.selectedPlotId && 
                          data.selectedPlotId.trim() !== '' && 
                          data.selectedPlotId !== 'none' 
                          ? data.selectedPlotId 
                          : null;
      
      console.log('🚀 [INDEX] Chamando saveSoilAnalysis com plotId:', validPlotId);
      const { data: savedAnalysis, error } = await saveSoilAnalysis(soilData, validPlotId);
      
      if (error) throw error;
      
      toast({
        title: "Análise salva com sucesso!",
        description: "Os dados da análise foram salvos no banco de dados.",
      });
    } catch (error: any) {
      console.error('Erro ao salvar análise:', error);
      toast({
        variant: 'destructive',
        title: "Erro ao salvar análise",
        description: error.message || "Ocorreu um erro ao salvar os dados."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFarmDataUpdated = (farmPlots: Plot[]) => {
    setPlots(farmPlots);
  };

  const formatNumber = (value: number): string => {
    return value.toFixed(2);
  };

  useEffect(() => {
    if (activeTab === 'results') {
      console.log("DEBUG - Renderizando aba results. soilData:", soilData, "results:", results);
    } else if (activeTab === 'insights') {
      console.log("DEBUG - Renderizando aba insights. soilData:", soilData, "results:", results);
    } else if (activeTab === 'recommendations') {
      console.log("DEBUG - Renderizando aba recommendations. soilData:", soilData, "results:", results);
    }
  }, [activeTab, soilData, results]);

  return (
    <div className="min-h-screen bg-bg-light">
      <Header />
      
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        {/* Botões de ação */}
        <div className="flex justify-between mb-4">
          <Link to="/relatorio" className="hidden md:block">
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary/10 shadow-md flex items-center gap-2 text-sm md:text-base py-1 px-2 md:py-2 md:px-4"
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
            <TabsTrigger value="input" className="flex items-center gap-2 text-gray-700 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calculator className="h-4 w-4" />
              Nova Análise
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!results} className="flex items-center gap-2 text-gray-700 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4" />
              Resultados
            </TabsTrigger>
            <TabsTrigger value="insights" disabled={!results} className="flex items-center gap-2 text-gray-700 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Brain className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="recommendations" disabled={!results} className="flex items-center gap-2 text-gray-700 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Leaf className="h-4 w-4" />
              Recomendações
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 text-gray-700 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Database className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>
          
          {/* Versão para dispositivos móveis - layout em duas linhas */}
          <div className="md:hidden mb-4">
            <TabsList className="grid w-full grid-cols-3 mb-2 bg-white shadow-sm text-xs">
              <TabsTrigger value="input" className="flex flex-col items-center gap-1 py-2 text-gray-700 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Calculator className="h-4 w-4" />
                <span>Nova</span>
              </TabsTrigger>
              <TabsTrigger value="results" disabled={!results} className="flex flex-col items-center gap-1 py-2 text-gray-700 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="h-4 w-4" />
                <span>Resultados</span>
              </TabsTrigger>
              <TabsTrigger value="insights" disabled={!results} className="flex flex-col items-center gap-1 py-2 text-gray-700 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Brain className="h-4 w-4" />
                <span>Insights</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm text-xs">
              <TabsTrigger value="recommendations" disabled={!results} className="flex flex-col items-center gap-1 py-2 text-gray-700 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Leaf className="h-4 w-4" />
                <span>Recomendações</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex flex-col items-center gap-1 py-2 text-gray-700 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Database className="h-4 w-4" />
                <span>Histórico</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="input">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg md:text-xl text-primary flex items-center gap-2" style={titleStyle}>
                  <Calculator className="h-4 w-4 md:h-5 md:w-5 text-primary" />
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
                      className="border-primary text-primary hover:bg-primary/10 w-full flex items-center justify-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Ver Modelo de Relatório
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {/* Informações básicas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="plot">Talhão (opcional)</Label>
                        <FarmManagementButton onDataUpdated={loadFarmsAndPlots} />
                      </div>
                      <Select 
                        onValueChange={(value) => {
                          if (value && value !== 'none') {
                            onSelectPlot(value);
                          } else {
                            setValue('selectedPlotId', '');
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um talhão (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum talhão selecionado</SelectItem>
                          {plots.map((plot) => (
                            <SelectItem key={plot.id} value={plot.id || ''}>
                              {plot.name} 
                              {farms.find(farm => farm.id === plot.farm_id)?.name && 
                                ` (${farms.find(farm => farm.id === plot.farm_id)?.name})`
                              }
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="crop">Cultura</Label>
                      <Select 
                        value={selectedCrop}
                        onValueChange={setSelectedCrop}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a cultura" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="soja">Soja</SelectItem>
                          <SelectItem value="milho">Milho</SelectItem>
                          <SelectItem value="algodao">Algodão</SelectItem>
                          <SelectItem value="cafe">Café</SelectItem>
                          <SelectItem value="cana">Cana-de-açúcar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="targetYield">Produtividade Esperada (ton/ha)</Label>
                      <Input 
                        id="targetYield" 
                        type="number" 
                        step="0.1"
                        min="0"
                        value={targetYield}
                        onChange={(e) => setTargetYield(Number(e.target.value))}
                        placeholder="Ex: 4.0"
                      />
                      <p className="text-xs text-gray-500">Produtividade esperada em toneladas por hectare</p>
                    </div>
                  </div>
                  
                  {/* Formulário de análise do solo */}
                  <SoilAnalysisForm onAnalysisComplete={handleAnalysisComplete} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            {soilData && results ? (
              <div className="space-y-4 md:space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl md:text-2xl font-bold text-primary" style={titleStyle}>Resultados da Análise</h2>
                  <Button onClick={resetAnalysis} variant="outline" className="border-primary text-primary hover:bg-primary/10 text-xs md:text-sm py-1 px-2 md:py-2 md:px-4">
                    Nova Análise
                  </Button>
                </div>
                <AnalysisResults soilData={soilData} results={results} />
              </div>
            ) : (
              <div className="p-4 text-center">
                <p>Nenhum dado de análise disponível. Por favor, preencha o formulário na aba "Nova Análise".</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights">
            {soilData && results ? (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold text-primary" style={titleStyle}>Insights da Análise</h2>
                <SoilInsights soilData={soilData} results={results} />
              </div>
            ) : (
              <div className="p-4 text-center">
                <p>Nenhum dado de análise disponível. Por favor, preencha o formulário na aba "Nova Análise".</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations">
            {soilData && results ? (
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold text-primary" style={titleStyle}>Recomendações de Adubação</h2>
                <FertilizerRecommendations soilData={soilData} results={results} cultureName={selectedCrop} />
              </div>
            ) : (
              <div className="p-4 text-center">
                <p>Nenhum dado de análise disponível. Por favor, preencha o formulário na aba "Nova Análise".</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg md:text-xl text-primary flex items-center gap-2" style={titleStyle}>
                  <Database className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Histórico de Análises
                </CardTitle>
                <CardDescription className="text-xs md:text-sm text-neutral-medium">
                  Visualize e gerencie suas análises salvas no banco de dados
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 md:pt-6">
                <UserAnalysisHistory />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Botão flutuante de acesso ao painel admin */}
      <AdminAccessButton />
    </div>
  );
};

export default Index;
