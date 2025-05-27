
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { SoilData, CalculatedResults } from '@/pages/Index';

interface MicronutrientsCardProps {
  soilData: SoilData;
  results: CalculatedResults;
}

export const MicronutrientsCard: React.FC<MicronutrientsCardProps> = ({ soilData, results }) => {
  const getStatusIcon = (isAdequate: boolean) => {
    if (isAdequate) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusColor = (isAdequate: boolean) => {
    return isAdequate ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
  };

  return (
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
  );
};
