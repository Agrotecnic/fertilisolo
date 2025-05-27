
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SoilData, CalculatedResults } from '@/pages/Index';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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

  return (
    <div className="space-y-4">
      {/* Informações da Análise */}
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-green-800">Informações da Análise</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
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
        <CardHeader className="pb-2">
          <CardTitle className="text-green-800">Saturações Atuais por Bases</CardTitle>
          <CardDescription>Porcentagem de cada nutriente em relação à CTC</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cálcio */}
            <div className="space-y-2">
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
                className="h-2"
              />
              <div className="text-xs text-gray-600">
                Ideal: 50-60% | Atual: {soilData.Ca} cmolc/dm³
              </div>
            </div>

            {/* Magnésio */}
            <div className="space-y-2">
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
                className="h-2"
              />
              <div className="text-xs text-gray-600">
                Ideal: 15-20% | Atual: {soilData.Mg} cmolc/dm³
              </div>
            </div>

            {/* Potássio */}
            <div className="space-y-2">
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
                className="h-2"
              />
              <div className="text-xs text-gray-600">
                Ideal: 3-5% | Atual: {soilData.K} mg/dm³
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relação Ca/Mg e Fósforo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Relação Ca/Mg */}
        <Card className="bg-white/80 backdrop-blur-sm border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-800 flex items-center gap-2">
              {getStatusIcon(results.isAdequate.CaMgRatio)}
              Relação Ca/Mg
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
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
          <CardHeader className="pb-2">
            <CardTitle className="text-green-800 flex items-center gap-2">
              {getStatusIcon(results.isAdequate.P)}
              Fósforo (P)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {soilData.P} mg/dm³
              </div>
              <Badge className={getStatusColor(results.isAdequate.P)}>
                {results.isAdequate.P ? 'Adequado' : 'Baixo'}
              </Badge>
              <p className="text-sm text-gray-600 mt-2">
                Mínimo para cerrados: 15 mg/dm³
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Micronutrientes */}
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-green-800">Micronutrientes</CardTitle>
          <CardDescription>Níveis atuais dos micronutrientes essenciais</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon(results.isAdequate.B)}
                <span className="ml-2 font-medium text-sm">Boro</span>
              </div>
              <div className="text-lg font-bold text-gray-800 mb-1">
                {soilData.B} mg/dm³
              </div>
              <Badge className={getStatusColor(results.isAdequate.B)}>
                {results.isAdequate.B ? 'Adequado' : 'Baixo'}
              </Badge>
              <div className="text-xs text-gray-600 mt-1">
                Ideal: 0,2-0,6
              </div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon(results.isAdequate.Cu)}
                <span className="ml-2 font-medium text-sm">Cobre</span>
              </div>
              <div className="text-lg font-bold text-gray-800 mb-1">
                {soilData.Cu} mg/dm³
              </div>
              <Badge className={getStatusColor(results.isAdequate.Cu)}>
                {results.isAdequate.Cu ? 'Adequado' : 'Baixo'}
              </Badge>
              <div className="text-xs text-gray-600 mt-1">
                Ideal: 0,8-1,2
              </div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon(results.isAdequate.Fe)}
                <span className="ml-2 font-medium text-sm">Ferro</span>
              </div>
              <div className="text-lg font-bold text-gray-800 mb-1">
                {soilData.Fe} mg/dm³
              </div>
              <Badge className={getStatusColor(results.isAdequate.Fe)}>
                {results.isAdequate.Fe ? 'Adequado' : 'Baixo'}
              </Badge>
              <div className="text-xs text-gray-600 mt-1">
                Ideal: ≥ 5
              </div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon(results.isAdequate.Mn)}
                <span className="ml-2 font-medium text-sm">Manganês</span>
              </div>
              <div className="text-lg font-bold text-gray-800 mb-1">
                {soilData.Mn} mg/dm³
              </div>
              <Badge className={getStatusColor(results.isAdequate.Mn)}>
                {results.isAdequate.Mn ? 'Adequado' : 'Baixo'}
              </Badge>
              <div className="text-xs text-gray-600 mt-1">
                Ideal: ≥ 1,2
              </div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon(results.isAdequate.Zn)}
                <span className="ml-2 font-medium text-sm">Zinco</span>
              </div>
              <div className="text-lg font-bold text-gray-800 mb-1">
                {soilData.Zn} mg/dm³
              </div>
              <Badge className={getStatusColor(results.isAdequate.Zn)}>
                {results.isAdequate.Zn ? 'Adequado' : 'Baixo'}
              </Badge>
              <div className="text-xs text-gray-600 mt-1">
                Ideal: 0,5-1,2
              </div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon(results.isAdequate.Mo)}
                <span className="ml-2 font-medium text-sm">Molibdênio</span>
              </div>
              <div className="text-lg font-bold text-gray-800 mb-1">
                {soilData.Mo} mg/dm³
              </div>
              <Badge className={getStatusColor(results.isAdequate.Mo)}>
                {results.isAdequate.Mo ? 'Adequado' : 'Baixo'}
              </Badge>
              <div className="text-xs text-gray-600 mt-1">
                Ideal: 0,1-0,2
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enxofre e Matéria Orgânica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-800 flex items-center gap-2">
              {getStatusIcon(results.isAdequate.S)}
              Enxofre (S)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {soilData.S} mg/dm³
              </div>
              <Badge className={getStatusColor(results.isAdequate.S)}>
                {results.isAdequate.S ? 'Adequado' : 'Baixo'}
              </Badge>
              <p className="text-sm text-gray-600 mt-2">
                Mínimo recomendado: 10 mg/dm³
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-800">
              Matéria Orgânica
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {soilData.organicMatter}%
              </div>
              <Badge className={soilData.organicMatter && soilData.organicMatter >= 2.5 ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                {soilData.organicMatter && soilData.organicMatter >= 2.5 ? 'Adequado' : 'Baixo'}
              </Badge>
              <p className="text-sm text-gray-600 mt-2">
                Ideal: acima de 2,5%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Necessidades de Correção */}
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-green-800">Necessidades de Correção</CardTitle>
          <CardDescription>Quantidades necessárias para atingir os níveis ideais</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xl font-bold text-blue-800 mb-1">
                {results.needs.Ca.toFixed(2)}
              </div>
              <div className="text-sm font-medium text-blue-600">
                cmolc/dm³ de Ca
              </div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-xl font-bold text-purple-800 mb-1">
                {results.needs.Mg.toFixed(2)}
              </div>
              <div className="text-sm font-medium text-purple-600">
                cmolc/dm³ de Mg
              </div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-xl font-bold text-orange-800 mb-1">
                {results.needs.K.toFixed(2)}
              </div>
              <div className="text-sm font-medium text-orange-600">
                mg/dm³ de K
              </div>
            </div>
            
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-xl font-bold text-red-800 mb-1">
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
