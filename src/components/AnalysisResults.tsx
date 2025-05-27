
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SoilData, CalculatedResults } from '@/pages/Index';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface AnalysisResultsProps {
  soilData: SoilData;
  results: CalculatedResults;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ soilData, results }) => {
  const getStatusIcon = (isAdequate: boolean) => {
    if (isAdequate) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusColor = (isAdequate: boolean) => {
    return isAdequate ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
  };

  const getProgressColor = (value: number, min: number, max: number) => {
    if (value >= min && value <= max) return 'bg-green-600';
    if (value < min) return 'bg-red-600';
    return 'bg-yellow-600';
  };

  return (
    <div className="space-y-6">
      {/* Informações da Análise */}
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Informações da Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Local:</span>
              <p className="text-lg font-semibold">{soilData.location}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Data:</span>
              <p className="text-lg font-semibold">{soilData.date}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">CTC:</span>
              <p className="text-lg font-semibold">{soilData.T} cmolc/dm³</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saturações Atuais */}
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Saturações Atuais por Bases</CardTitle>
          <CardDescription>Porcentagem de cada nutriente em relação à CTC</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cálcio */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(results.isAdequate.Ca)}
                  <span className="font-medium">Cálcio (Ca)</span>
                </div>
                <Badge className={getStatusColor(results.isAdequate.Ca)}>
                  {results.saturations.Ca.toFixed(1)}%
                </Badge>
              </div>
              <Progress 
                value={Math.min(results.saturations.Ca, 100)} 
                className="h-3"
              />
              <div className="text-xs text-gray-600">
                Ideal: 50-60% | Atual: {soilData.Ca} cmolc/dm³
              </div>
            </div>

            {/* Magnésio */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(results.isAdequate.Mg)}
                  <span className="font-medium">Magnésio (Mg)</span>
                </div>
                <Badge className={getStatusColor(results.isAdequate.Mg)}>
                  {results.saturations.Mg.toFixed(1)}%
                </Badge>
              </div>
              <Progress 
                value={Math.min(results.saturations.Mg, 100)} 
                className="h-3"
              />
              <div className="text-xs text-gray-600">
                Ideal: 15-20% | Atual: {soilData.Mg} cmolc/dm³
              </div>
            </div>

            {/* Potássio */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(results.isAdequate.K)}
                  <span className="font-medium">Potássio (K)</span>
                </div>
                <Badge className={getStatusColor(results.isAdequate.K)}>
                  {results.saturations.K.toFixed(1)}%
                </Badge>
              </div>
              <Progress 
                value={Math.min(results.saturations.K, 100)} 
                className="h-3"
              />
              <div className="text-xs text-gray-600">
                Ideal: 3-5% | Atual: {soilData.K} cmolc/dm³
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relação Ca/Mg e Fósforo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Relação Ca/Mg */}
        <Card className="bg-white/80 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              {getStatusIcon(results.isAdequate.CaMgRatio)}
              Relação Ca/Mg
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {results.caeMgRatio.toFixed(2)}:1
              </div>
              <Badge className={getStatusColor(results.isAdequate.CaMgRatio)}>
                {results.isAdequate.CaMgRatio ? 'Adequada' : 'Inadequada'}
              </Badge>
              <p className="text-sm text-gray-600 mt-2">
                Relação ideal: 3:1 a 5:1
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Fósforo */}
        <Card className="bg-white/80 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              {getStatusIcon(results.isAdequate.P)}
              Fósforo (P)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {soilData.P} ppm
              </div>
              <Badge className={getStatusColor(results.isAdequate.P)}>
                {results.isAdequate.P ? 'Adequado' : 'Baixo'}
              </Badge>
              <p className="text-sm text-gray-600 mt-2">
                Mínimo para cerrados: 15 ppm
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Necessidades de Correção */}
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Necessidades de Correção</CardTitle>
          <CardDescription>Quantidades necessárias para atingir os níveis ideais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-800 mb-1">
                {results.needs.Ca.toFixed(2)}
              </div>
              <div className="text-sm font-medium text-blue-600">
                cmolc/dm³ de Ca
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-800 mb-1">
                {results.needs.Mg.toFixed(2)}
              </div>
              <div className="text-sm font-medium text-purple-600">
                cmolc/dm³ de Mg
              </div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-800 mb-1">
                {results.needs.K.toFixed(2)}
              </div>
              <div className="text-sm font-medium text-orange-600">
                cmolc/dm³ de K
              </div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-800 mb-1">
                {results.needs.P.toFixed(1)}
              </div>
              <div className="text-sm font-medium text-red-600">
                kg/ha de P
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas e Recomendações Gerais */}
      {!results.isAdequate.CaMgRatio && (
        <Alert className="border-yellow-300 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <strong>Atenção:</strong> A relação Ca/Mg está fora do ideal (3:1 a 5:1). 
            Isso pode afetar a absorção de nutrientes pelas plantas. 
            Verifique as recomendações de correção.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
