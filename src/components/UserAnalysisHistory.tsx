import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SoilData, CalculationResult } from '@/types/soilAnalysis';
import { getUserSoilAnalyses, deleteSoilAnalysis } from '@/lib/services';
import { calculateSoilAnalysis } from '@/utils/soilCalculations';
import { Trash2, Eye, MapPin, Calendar, AlertTriangle, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
// Import removido para fazer dynamic import sob demanda
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useTheme } from '@/providers/ThemeProvider';
import { Skeleton } from '@/components/ui/skeleton';

export const UserAnalysisHistory: React.FC = () => {
  const { theme, logo, organizationName } = useTheme();
  const [history, setHistory] = useState<SoilData[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SoilData | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await getUserSoilAnalyses();
      if (error) throw error;

      setHistory(data || []);
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao carregar histórico de análises:', err);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar análises',
        description: err.message || 'Não foi possível carregar as análises do servidor.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (analysis: SoilData) => {
    setSelectedAnalysis(analysis);
  };

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

  const handleExportPDF = async (analysis: SoilData) => {
    try {
      console.log('═══════════════════════════════════════════════════════');
      console.log('🎨 INICIANDO GERAÇÃO DE PDF COM PERSONALIZAÇÃO (Histórico)');
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

      // Calcular resultados da análise para incluir no PDF
      const results = calculateSoilAnalysis(analysis);

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

      // Import dinâmico para não carregar a biblioteca de PDF no bundle principal
      const pdfGenerator = await import('@/utils/pdfGenerator');

      // Gerar PDF com personalização
      await pdfGenerator.generatePDFReport(
        analysis,
        results,
        undefined,
        themeOptions
      );

      console.log('✅ PDF gerado e salvo com sucesso');

      toast({
        title: "PDF Gerado",
        description: "O relatório foi gerado com sucesso.",
      });
    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar PDF',
        description: 'Não foi possível gerar o relatório.'
      });
    }
  };

  const handleDelete = async (analysis: SoilData) => {
    console.log("Tentando excluir análise:", analysis);

    if (!analysis.id) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: 'ID da análise não encontrado.'
      });
      return;
    }

    setDeleting(true);
    try {
      const { success, error } = await deleteSoilAnalysis(analysis.id);

      if (error) throw error;

      if (success) {
        // Se a análise excluída for a selecionada, limpe a seleção
        if (selectedAnalysis && selectedAnalysis.id === analysis.id) {
          setSelectedAnalysis(null);
        }

        // Recarregar a lista de análises
        await loadHistory();

        toast({
          title: "Análise excluída",
          description: "A análise foi excluída com sucesso."
        });
      }
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao excluir análise:', err);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir análise',
        description: err.message || 'Não foi possível excluir a análise.'
      });
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (analysis: SoilData) => {
    try {
      const results = calculateSoilAnalysis(analysis);
      const adequateCount = Object.values(results.isAdequate).filter(Boolean).length;
      const totalChecks = Object.keys(results.isAdequate).length;

      if (adequateCount === totalChecks) {
        return <Badge className="bg-green-100 text-green-800 text-xs px-2 py-0.5">Adequado</Badge>;
      } else if (adequateCount >= totalChecks / 2) {
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5">Parcial</Badge>;
      } else {
        return <Badge className="bg-red-100 text-red-800 text-xs px-2 py-0.5">Deficiente</Badge>;
      }
    } catch (error) {
      return <Badge className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5">Indeterminado</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-4 animate-in fade-in duration-500">
        <div className="md:col-span-2 space-y-3 md:space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white/80 border">
              <CardHeader className="pb-2 px-3 md:px-6 pt-3 md:pt-6">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
                <div className="grid grid-cols-3 gap-1.5 md:gap-2 mb-2 md:mb-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex gap-1.5 md:gap-2 mt-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="hidden md:block">
          <Card className="bg-white/80">
            <CardHeader className="px-3 md:px-6 pt-3 md:pt-6 pb-2">
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Nenhuma análise encontrada no servidor. Realize uma análise para começar a construir seu histórico.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <div className="space-y-3 md:space-y-4">
          {history.map((analysis, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2 px-3 md:px-6 pt-3 md:pt-6">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-primary text-sm md:text-base truncate">{analysis.location}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{analysis.date}</span>
                    </CardDescription>
                  </div>
                  <div className="flex-shrink-0">{getStatusBadge(analysis)}</div>
                </div>
              </CardHeader>
              <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
                <div className="grid grid-cols-3 gap-1.5 md:gap-2 text-xs mb-2 md:mb-3">
                  <div className="bg-gray-50 p-1.5 md:p-2 rounded text-center">
                    <span className="text-gray-500 block">P:</span> <span className="font-medium">{analysis.P}</span>
                  </div>
                  <div className="bg-gray-50 p-1.5 md:p-2 rounded text-center">
                    <span className="text-gray-500 block">K:</span> <span className="font-medium">{analysis.K}</span>
                  </div>
                  <div className="bg-gray-50 p-1.5 md:p-2 rounded text-center">
                    <span className="text-gray-500 block">Ca:</span> <span className="font-medium">{analysis.Ca}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-9 px-3 flex-1 min-w-0"
                    onClick={() => handleViewDetails(analysis)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span className="hidden sm:inline">Ver detalhes</span>
                    <span className="sm:hidden">Detalhes</span>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-9 px-3 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 flex-1 min-w-0"
                        disabled={deleting}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                        <span>Excluir</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir análise</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir esta análise? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDelete(analysis)}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-9 px-3 border-green-600 text-green-700 hover:bg-green-50 flex-1 min-w-0"
                    onClick={() => handleExportPDF(analysis)}
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span className="hidden sm:inline">Exportar PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="md:sticky md:top-4 h-fit">
        {selectedAnalysis ? (
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader className="px-3 md:px-6 pt-3 md:pt-6 pb-2">
              <CardTitle className="text-green-800 text-sm md:text-base">Detalhes da Análise</CardTitle>
              <CardDescription className="text-xs">{selectedAnalysis.location} - {selectedAnalysis.date}</CardDescription>
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              <div className="space-y-4">
                {/* Dados Básicos */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Dados da Análise</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-blue-50 p-2 rounded border border-blue-200">
                      <span className="font-medium text-blue-800">CTC (T):</span>
                      <div className="text-blue-700">{selectedAnalysis.T} cmolc/dm³</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded border border-green-200">
                      <span className="font-medium text-green-800">Cálcio:</span>
                      <div className="text-green-700">{selectedAnalysis.Ca} cmolc/dm³</div>
                    </div>
                    <div className="bg-purple-50 p-2 rounded border border-purple-200">
                      <span className="font-medium text-purple-800">Magnésio:</span>
                      <div className="text-purple-700">{selectedAnalysis.Mg} cmolc/dm³</div>
                    </div>
                    <div className="bg-orange-50 p-2 rounded border border-orange-200">
                      <span className="font-medium text-orange-800">Potássio:</span>
                      <div className="text-orange-700">{selectedAnalysis.K} mg/dm³</div>
                    </div>
                    <div className="bg-red-50 p-2 rounded border border-red-200 col-span-2">
                      <span className="font-medium text-red-800">Fósforo:</span>
                      <div className="text-red-700">{selectedAnalysis.P} mg/dm³</div>
                    </div>
                    <div className="bg-amber-50 p-2 rounded border border-amber-200 col-span-2">
                      <span className="font-medium text-amber-800">Argila:</span>
                      <div className="text-amber-700">{selectedAnalysis.argila}%</div>
                    </div>
                  </div>
                </div>

                {/* Saturações Calculadas */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Saturações Calculadas</h4>
                  {(() => {
                    try {
                      const results = calculateSoilAnalysis(selectedAnalysis);
                      return (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Ca:</span>
                            <span className={results.isAdequate.Ca ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {results.saturations.Ca.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Mg:</span>
                            <span className={results.isAdequate.Mg ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {results.saturations.Mg.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>K:</span>
                            <span className={results.isAdequate.K ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {results.saturations.K.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ca/Mg:</span>
                            <span className={results.caeMgRatio >= 3 && results.caeMgRatio <= 5 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {results.caeMgRatio.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      );
                    } catch (error) {
                      return (
                        <p className="text-sm text-red-500">
                          Não foi possível calcular as saturações para esta análise.
                        </p>
                      );
                    }
                  })()}
                </div>

                <div className="mt-4 space-y-3">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleExportPDF(selectedAnalysis)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar como PDF
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full border-red-300 text-red-600 hover:bg-red-50"
                        disabled={deleting}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir análise
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir análise</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir esta análise? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDelete(selectedAnalysis)}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <p>Selecione uma análise para ver os detalhes</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}; 