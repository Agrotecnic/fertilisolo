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
import * as pdfGenerator from '@/utils/pdfGenerator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export const UserAnalysisHistory: React.FC = () => {
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
    } catch (error: any) {
      console.error('Erro ao carregar histórico de análises:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar análises',
        description: error.message || 'Não foi possível carregar as análises do servidor.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (analysis: SoilData) => {
    setSelectedAnalysis(analysis);
  };

  const handleExportPDF = async (analysis: SoilData) => {
    try {
      // Calcular resultados da análise para incluir no PDF
      const results = calculateSoilAnalysis(analysis);
      
      // Usar a função generatePDFReport em vez de generatePDF para incluir os resultados calculados
      await pdfGenerator.generatePDFReport(
        analysis, 
        results
      );
      
      toast({
        title: "PDF Gerado",
        description: "O relatório foi gerado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
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
    } catch (error: any) {
      console.error('Erro ao excluir análise:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir análise',
        description: error.message || 'Não foi possível excluir a análise.'
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
        return <Badge className="bg-green-100 text-green-800">Adequado</Badge>;
      } else if (adequateCount >= totalChecks / 2) {
        return <Badge className="bg-yellow-100 text-yellow-800">Parcial</Badge>;
      } else {
        return <Badge className="bg-red-100 text-red-800">Deficiente</Badge>;
      }
    } catch (error) {
      return <Badge className="bg-gray-100 text-gray-800">Indeterminado</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-pulse text-center">
          <p>Carregando análises...</p>
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
        <div className="space-y-4">
          {history.map((analysis, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border hover:border-primary-dark/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-primary-dark">{analysis.location}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {analysis.date}
                    </CardDescription>
                  </div>
                  <div>{getStatusBadge(analysis)}</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div className="bg-gray-50 p-1 rounded">
                    <span className="text-gray-500">P:</span> <span className="font-medium">{analysis.P}</span>
                  </div>
                  <div className="bg-gray-50 p-1 rounded">
                    <span className="text-gray-500">K:</span> <span className="font-medium">{analysis.K}</span>
                  </div>
                  <div className="bg-gray-50 p-1 rounded">
                    <span className="text-gray-500">Ca:</span> <span className="font-medium">{analysis.Ca}</span>
                  </div>
                </div>

                <div className="flex justify-between mt-2">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-8"
                      onClick={() => handleViewDetails(analysis)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver detalhes
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          disabled={deleting}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Excluir
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
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8 border-green-600 text-green-700 hover:bg-green-50"
                    onClick={() => handleExportPDF(analysis)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Exportar PDF
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
            <CardHeader>
              <CardTitle className="text-green-800">Detalhes da Análise</CardTitle>
              <CardDescription>{selectedAnalysis.location} - {selectedAnalysis.date}</CardDescription>
            </CardHeader>
            <CardContent>
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