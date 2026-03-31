import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UnitSelector } from '@/components/UnitSelector';
import { getUnitLabel, convertToStandardUnit } from '@/utils/unitConversions';
import { getDefaultUnits } from '@/utils/unitConversions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const UnitSystemDemo: React.FC = () => {
  const [selectedUnits, setSelectedUnits] = useState(getDefaultUnits());
  const [testValues, setTestValues] = useState({
    Ca: '0',
    K: '0',
    P: '0'
  });
  const [convertedValues, setConvertedValues] = useState({
    Ca: 0,
    K: 0,
    P: 0
  });

  const handleUnitChange = (nutrient: string, unit: string) => {
    setSelectedUnits(prev => ({
      ...prev,
      [nutrient]: unit
    }));
  };

  const handleTestConversion = () => {
    const converted = {
      Ca: convertToStandardUnit(parseFloat(testValues.Ca) || 0, 'Ca', selectedUnits.Ca),
      K: convertToStandardUnit(parseFloat(testValues.K) || 0, 'K', selectedUnits.K),
      P: convertToStandardUnit(parseFloat(testValues.P) || 0, 'P', selectedUnits.P)
    };
    setConvertedValues(converted);
  };

  return (
    <Card className="bg-blue-50 border-blue-200 mb-4">
      <CardHeader>
        <CardTitle className="text-blue-800">Sistema de Unidades de Medida - Teste</CardTitle>
        <CardDescription>
          Teste o sistema de conversão de unidades. Digite valores e veja como são convertidos para as unidades padrão.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seletor de Unidades */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Seleção de Unidades</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Cálcio (Ca):</Label>
                <UnitSelector
                  nutrient="Ca"
                  selectedUnit={selectedUnits.Ca}
                  onUnitChange={(unit) => handleUnitChange('Ca', unit)}
                  className="w-32"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Potássio (K):</Label>
                <UnitSelector
                  nutrient="K"
                  selectedUnit={selectedUnits.K}
                  onUnitChange={(unit) => handleUnitChange('K', unit)}
                  className="w-32"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Fósforo (P):</Label>
                <UnitSelector
                  nutrient="P"
                  selectedUnit={selectedUnits.P}
                  onUnitChange={(unit) => handleUnitChange('P', unit)}
                  className="w-32"
                />
              </div>
            </div>
          </div>

          {/* Teste de Conversão */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Teste de Conversão</h4>
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Cálcio (Ca):</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={testValues.Ca}
                    onChange={(e) => setTestValues(prev => ({ ...prev, Ca: e.target.value }))}
                    placeholder="Digite um valor"
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-600 self-center">
                    {getUnitLabel('Ca', selectedUnits.Ca)}
                  </span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm">Potássio (K):</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={testValues.K}
                    onChange={(e) => setTestValues(prev => ({ ...prev, K: e.target.value }))}
                    placeholder="Digite um valor"
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-600 self-center">
                    {getUnitLabel('K', selectedUnits.K)}
                  </span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm">Fósforo (P):</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={testValues.P}
                    onChange={(e) => setTestValues(prev => ({ ...prev, P: e.target.value }))}
                    placeholder="Digite um valor"
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-600 self-center">
                    {getUnitLabel('P', selectedUnits.P)}
                  </span>
                </div>
              </div>

              <Button onClick={handleTestConversion} className="w-full">
                Testar Conversão
              </Button>
            </div>
          </div>
        </div>

        {/* Resultados da Conversão */}
        {convertedValues.Ca > 0 || convertedValues.K > 0 || convertedValues.P > 0 ? (
          <div className="mt-6 p-4 bg-green-100 rounded-lg">
            <h5 className="font-semibold text-sm mb-2">Valores Convertidos para Unidades Padrão:</h5>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Ca:</strong> {convertedValues.Ca.toFixed(3)} cmolc/dm³
              </div>
              <div>
                <strong>K:</strong> {convertedValues.K.toFixed(1)} mg/dm³
              </div>
              <div>
                <strong>P:</strong> {convertedValues.P.toFixed(1)} mg/dm³
              </div>
            </div>
          </div>
        ) : null}

        {/* Informações sobre Unidades */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h5 className="font-semibold text-sm mb-2">Unidades Disponíveis:</h5>
          <div className="text-xs space-y-1">
            <div><strong>Ca, Mg, T:</strong> cmolc/dm³, meq/100g, mg/dm³</div>
            <div><strong>K:</strong> mg/dm³, cmolc/dm³, meq/100g, ppm</div>
            <div><strong>P, S, B, Cu, Fe, Mn, Zn, Mo:</strong> mg/dm³, ppm, mg/kg</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
