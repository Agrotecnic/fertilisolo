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

  const handleAnalysisComplete = (data: SoilData, calculatedResults: CalculationResult) => {
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
    
    // Salvar a análise no Supabase
    try {
      setIsLoading(true);
      // Verificar se o plotId é válido (não é vazio e não é 'none')
      const validPlotId = data.selectedPlotId && 
                          data.selectedPlotId.trim() !== '' && 
                          data.selectedPlotId !== 'none' 
                          ? data.selectedPlotId 
                          : null;
      
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
              <Database className="h-4 w-4" />
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
                <Database className="h-4 w-4" />
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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Localização</Label>
                      <Input 
                        id="location" 
                        {...register('location')} 
                        placeholder="Ex: Fazenda São João"
                      />
                      {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date">Data da Coleta</Label>
                      <Input 
                        id="date" 
                        type="date" 
                        {...register('date')} 
                      />
                      {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
                    </div>
                  </div>
                  
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
                    <Label htmlFor="organicMatter">Matéria Orgânica (%)</Label>
                    <Input 
                      id="organicMatter" 
                      type="number" 
                      step="0.01"
                      min="0"
                      {...register('organicMatter', { valueAsNumber: true })} 
                    />
                    {errors.organicMatter && <p className="text-sm text-red-500">{errors.organicMatter.message}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="P">Fósforo (P) mg/dm³</Label>
                      <Input 
                        id="P" 
                        type="number" 
                        step="0.01"
                        min="0"
                        {...register('P', { valueAsNumber: true })} 
                      />
                      {errors.P && <p className="text-sm text-red-500">{errors.P.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label htmlFor="argila">Argila (%)</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="ml-1 text-blue-500 cursor-help text-xs">ⓘ</span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p>Porcentagem de argila na análise granulométrica. Necessário para interpretação precisa do fósforo.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input 
                        id="argila" 
                        type="number" 
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="Ex: 35"
                        {...register('argila', { 
                          required: "Argila é obrigatória para interpretação de fósforo",
                          valueAsNumber: true,
                          min: { value: 0, message: "Valor mínimo é 0%" },
                          max: { value: 100, message: "Valor máximo é 100%" }
                        })} 
                      />
                      {errors.argila && <p className="text-sm text-red-500">{errors.argila.message}</p>}
                      <p className="text-xs text-gray-500">% de argila no solo</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="K">Potássio (K) mg/dm³</Label>
                      <Input 
                        id="K" 
                        type="number" 
                        step="0.01"
                        min="0"
                        {...register('K', { valueAsNumber: true })} 
                      />
                      {errors.K && <p className="text-sm text-red-500">{errors.K.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="Ca">Cálcio (Ca) cmolc/dm³</Label>
                      <Input 
                        id="Ca" 
                        type="number" 
                        step="0.01"
                        min="0"
                        {...register('Ca', { valueAsNumber: true })} 
                      />
                      {errors.Ca && <p className="text-sm text-red-500">{errors.Ca.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="Mg">Magnésio (Mg) cmolc/dm³</Label>
                      <Input 
                        id="Mg" 
                        type="number" 
                        step="0.01"
                        min="0"
                        {...register('Mg', { valueAsNumber: true })} 
                      />
                      {errors.Mg && <p className="text-sm text-red-500">{errors.Mg.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="S">Enxofre (S) mg/dm³</Label>
                      <Input 
                        id="S" 
                        type="number" 
                        step="0.01"
                        min="0"
                        {...register('S', { valueAsNumber: true })} 
                      />
                      {errors.S && <p className="text-sm text-red-500">{errors.S.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="B">Boro (B) mg/dm³</Label>
                      <Input 
                        id="B" 
                        type="number" 
                        step="0.01"
                        min="0"
                        {...register('B', { valueAsNumber: true })} 
                      />
                      {errors.B && <p className="text-sm text-red-500">{errors.B.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="Cu">Cobre (Cu) mg/dm³</Label>
                      <Input 
                        id="Cu" 
                        type="number" 
                        step="0.01"
                        min="0"
                        {...register('Cu', { valueAsNumber: true })} 
                      />
                      {errors.Cu && <p className="text-sm text-red-500">{errors.Cu.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="Fe">Ferro (Fe) mg/dm³</Label>
                      <Input 
                        id="Fe" 
                        type="number" 
                        step="0.01"
                        min="0"
                        {...register('Fe', { valueAsNumber: true })} 
                      />
                      {errors.Fe && <p className="text-sm text-red-500">{errors.Fe.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="Mn">Manganês (Mn) mg/dm³</Label>
                      <Input 
                        id="Mn" 
                        type="number" 
                        step="0.01"
                        min="0"
                        {...register('Mn', { valueAsNumber: true })} 
                      />
                      {errors.Mn && <p className="text-sm text-red-500">{errors.Mn.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="Zn">Zinco (Zn) mg/dm³</Label>
                      <Input 
                        id="Zn" 
                        type="number" 
                        step="0.01"
                        min="0"
                        {...register('Zn', { valueAsNumber: true })} 
                      />
                      {errors.Zn && <p className="text-sm text-red-500">{errors.Zn.message}</p>}
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                    {isLoading ? 'Processando...' : 'Calcular Recomendações'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            {soilData && results ? (
              <div className="space-y-4 md:space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl md:text-2xl font-bold text-primary-dark" style={titleStyle}>Resultados da Análise</h2>
                  <Button onClick={resetAnalysis} variant="outline" className="border-secondary-dark/20 text-secondary-dark hover:bg-secondary-dark/5 text-xs md:text-sm py-1 px-2 md:py-2 md:px-4">
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
                <h2 className="text-xl md:text-2xl font-bold text-primary-dark" style={titleStyle}>Insights da Análise</h2>
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
                <h2 className="text-xl md:text-2xl font-bold text-primary-dark" style={titleStyle}>Recomendações de Adubação</h2>
                <FertilizerRecommendations soilData={soilData} results={results} />
              </div>
            ) : (
              <div className="p-4 text-center">
                <p>Nenhum dado de análise disponível. Por favor, preencha o formulário na aba "Nova Análise".</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-white border-secondary-dark/10 shadow-sm">
              <CardHeader className="border-b border-secondary-dark/10">
                <CardTitle className="text-lg md:text-xl text-primary-dark flex items-center gap-2" style={titleStyle}>
                  <Database className="h-4 w-4 md:h-5 md:w-5 text-secondary-dark" />
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
    </div>
  );
};

export default Index;
