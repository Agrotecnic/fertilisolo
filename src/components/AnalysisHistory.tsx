
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SoilData } from '@/pages/Index';
import { getAnalysisHistory, deleteAnalysisFromHistory, clearAnalysisHistory } from '@/utils/analysisStorage';
import { calculateSoilAnalysis } from '@/utils/soilCalculations';
import { Trash2, Eye, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const AnalysisHistory: React.FC = () => {
  const [history, setHistory] = useState<SoilData[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SoilData | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const data = getAnalysisHistory();
    setHistory(data);
  };

  const handleDelete = (id: string) => {
    deleteAnalysisFromHistory(id);
    loadHistory();
    toast({
      title: "Análise removida",
      description: "A análise foi removida do histórico.",
    });
  };

  const handleClearAll = () => {
    clearAnalysisHistory();
    loadHistory();
    setSelectedAnalysis(null);
    toast({
      title: "Histórico limpo",
      description: "Todas as análises foram removidas do histórico.",
    });
  };

  const handleViewDetails = (analysis: SoilData) => {
    setSelectedAnalysis(analysis);
  };

  const getStatusBadge = (analysis: SoilData) => {
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
  };

  if (history.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Nenhuma análise encontrada no histórico. Realize uma análise para começar a construir seu histórico.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-green-800">
            Histórico de Análises ({history.length})
          </h3>
          <p className="text-gray-600">Visualize e compare análises anteriores</p>
        </div>
        <Button 
          onClick={handleClearAll} 
          variant="outline" 
          size="sm"
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Limpar Histórico
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Análises */}
        <div className="space-y-4">
          {history.map((analysis) => (
            <Card key={analysis.id} className="bg-white/80 backdrop-blur-sm border-green-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-green-800 text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {analysis.location}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      {analysis.date}
                    </CardDescription>
                  </div>
                  {getStatusBadge(analysis)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div>CTC: {analysis.T} cmolc/dm³</div>
                  <div>P: {analysis.P} ppm</div>
                  <div>Ca: {analysis.Ca} cmolc/dm³</div>
                  <div>Mg: {analysis.Mg} cmolc/dm³</div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleViewDetails(analysis)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver Detalhes
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDelete(analysis.id!)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detalhes da Análise Selecionada */}
        <div className="lg:sticky lg:top-4">
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
                        <div className="text-orange-700">{selectedAnalysis.K} cmolc/dm³</div>
                      </div>
                      <div className="bg-red-50 p-2 rounded border border-red-200 col-span-2">
                        <span className="font-medium text-red-800">Fósforo:</span>
                        <div className="text-red-700">{selectedAnalysis.P} ppm</div>
                      </div>
                    </div>
                  </div>

                  {/* Saturações Calculadas */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Saturações Calculadas</h4>
                    {(() => {
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
                            <span>Relação Ca/Mg:</span>
                            <span className={results.isAdequate.CaMgRatio ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {results.caeMgRatio.toFixed(1)}:1
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Selecione uma análise para ver os detalhes</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
