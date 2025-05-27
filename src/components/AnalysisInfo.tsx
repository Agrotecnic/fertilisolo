
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SoilData } from '@/pages/Index';

interface AnalysisInfoProps {
  soilData: SoilData;
}

export const AnalysisInfo: React.FC<AnalysisInfoProps> = ({ soilData }) => {
  return (
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
  );
};
