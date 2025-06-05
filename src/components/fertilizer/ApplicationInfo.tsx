import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ApplicationInfo: React.FC = () => {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-800 text-lg">Informações Importantes sobre Aplicação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-gray-900 mb-3 text-blue-800">Saturações Ideais</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Cálcio (Ca):</span>
                  <span className="font-medium">50-60% da CTC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Magnésio (Mg):</span>
                  <span className="font-medium">15-20% da CTC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Potássio (K):</span>
                  <span className="font-medium">3-5% da CTC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Relação Ca/Mg:</span>
                  <span className="font-medium">3:1 a 5:1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Fósforo (P):</span>
                  <span className="font-medium">≥ 15 ppm</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-green-100">
              <h4 className="font-semibold text-gray-900 mb-3 text-green-800">Práticas de Aplicação</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  Aplicar calcário 60-90 dias antes do plantio
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  Incorporar uniformemente até 20 cm
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  Dividir doses altas em duas aplicações
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  Aplicar fósforo no sulco de plantio
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  Parcelar potássio em culturas anuais
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">Observações Importantes</h4>
              <p className="text-sm text-yellow-700 leading-relaxed">
                As fontes de nutrientes apresentadas são <strong>opções alternativas</strong> - você deve escolher 
                <strong> apenas uma fonte</strong> para cada nutriente com base na disponibilidade e relação custo-benefício.
              </p>
              <p className="text-sm text-yellow-700 leading-relaxed mt-2">
                Estas recomendações são baseadas no método de Saturação por Bases e nos valores informados 
                na análise de solo. Recomenda-se consultar um engenheiro agrônomo para validação das 
                recomendações e adequação às condições específicas da propriedade e da cultura a ser implantada.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
