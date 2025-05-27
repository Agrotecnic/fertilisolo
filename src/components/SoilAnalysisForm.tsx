
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SoilData, CalculatedResults } from '@/pages/Index';
import { calculateSoilAnalysis } from '@/utils/soilCalculations';
import { saveAnalysisToHistory } from '@/utils/analysisStorage';
import { FormattedInput } from '@/components/FormattedInput';
import { toast } from '@/hooks/use-toast';

interface SoilAnalysisFormProps {
  onAnalysisComplete: (data: SoilData, results: CalculatedResults) => void;
}

export const SoilAnalysisForm: React.FC<SoilAnalysisFormProps> = ({ onAnalysisComplete }) => {
  const [formData, setFormData] = useState<Omit<SoilData, 'id' | 'date'>>({
    location: '',
    T: 0,
    Ca: 0,
    Mg: 0,
    K: 0,
    P: 0,
    S: 0,
    B: 0,
    Cu: 0,
    Fe: 0,
    Mn: 0,
    Zn: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    const numericFields = ['T', 'Ca', 'Mg', 'K', 'P', 'S', 'B', 'Cu', 'Fe', 'Mn', 'Zn'];
    
    if (numericFields.includes(field)) {
      const numValue = typeof value === 'number' ? value : (parseFloat(value) || 0);
      setFormData(prev => ({ ...prev, [field]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.T <= 0) newErrors.T = 'CTC deve ser maior que 0';
    if (formData.Ca < 0) newErrors.Ca = 'Cálcio não pode ser negativo';
    if (formData.Mg < 0) newErrors.Mg = 'Magnésio não pode ser negativo';
    if (formData.K < 0) newErrors.K = 'Potássio não pode ser negativo';
    if (formData.P < 0) newErrors.P = 'Fósforo não pode ser negativo';
    if (formData.S < 0) newErrors.S = 'Enxofre não pode ser negativo';
    if (formData.B < 0) newErrors.B = 'Boro não pode ser negativo';
    if (formData.Cu < 0) newErrors.Cu = 'Cobre não pode ser negativo';
    if (formData.Fe < 0) newErrors.Fe = 'Ferro não pode ser negativo';
    if (formData.Mn < 0) newErrors.Mn = 'Manganês não pode ser negativo';
    if (formData.Zn < 0) newErrors.Zn = 'Zinco não pode ser negativo';
    if (!formData.location.trim()) newErrors.location = 'Localização é obrigatória';

    // Validate that individual cations don't exceed CTC
    const totalCations = formData.Ca + formData.Mg + formData.K;
    if (totalCations > formData.T) {
      newErrors.general = 'A soma de Ca + Mg + K não pode exceder a CTC';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const results = calculateSoilAnalysis(formData);
      const analysisData: SoilData = {
        ...formData,
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
      };

      // Save to history
      saveAnalysisToHistory(analysisData);

      onAnalysisComplete(analysisData, results);
      
      toast({
        title: "Análise realizada com sucesso!",
        description: "Os resultados foram calculados e salvos no histórico.",
      });
    } catch (error) {
      toast({
        title: "Erro no cálculo",
        description: "Verifique os dados inseridos e tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <Alert variant="destructive">
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Localização */}
        <div className="md:col-span-2">
          <Label htmlFor="location">Localização da Análise *</Label>
          <FormattedInput
            value={0}
            onChange={() => {}}
            placeholder="Ex: Fazenda São José, Talhão 3"
            className={errors.location ? 'border-red-500' : ''}
          />
          {errors.location && <span className="text-red-500 text-sm">{errors.location}</span>}
        </div>

        {/* Macronutrientes Primários */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Macronutrientes Primários</h3>
        </div>

        {/* CTC */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-800 text-lg">CTC (T)</CardTitle>
            <CardDescription>Capacidade de Troca Catiônica em cmolc/dm³</CardDescription>
          </CardHeader>
          <CardContent>
            <FormattedInput
              value={formData.T}
              onChange={(value) => handleInputChange('T', value)}
              placeholder="0,00"
              className={errors.T ? 'border-red-500' : ''}
            />
            {errors.T && <span className="text-red-500 text-sm">{errors.T}</span>}
          </CardContent>
        </Card>

        {/* Cálcio */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-800 text-lg">Cálcio (Ca)</CardTitle>
            <CardDescription>Cálcio atual em cmolc/dm³</CardDescription>
          </CardHeader>
          <CardContent>
            <FormattedInput
              value={formData.Ca}
              onChange={(value) => handleInputChange('Ca', value)}
              placeholder="0,00"
              className={errors.Ca ? 'border-red-500' : ''}
            />
            {errors.Ca && <span className="text-red-500 text-sm">{errors.Ca}</span>}
          </CardContent>
        </Card>

        {/* Magnésio */}
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-800 text-lg">Magnésio (Mg)</CardTitle>
            <CardDescription>Magnésio atual em cmolc/dm³</CardDescription>
          </CardHeader>
          <CardContent>
            <FormattedInput
              value={formData.Mg}
              onChange={(value) => handleInputChange('Mg', value)}
              placeholder="0,00"
              className={errors.Mg ? 'border-red-500' : ''}
            />
            {errors.Mg && <span className="text-red-500 text-sm">{errors.Mg}</span>}
          </CardContent>
        </Card>

        {/* Potássio */}
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-800 text-lg">Potássio (K)</CardTitle>
            <CardDescription>Potássio atual em cmolc/dm³</CardDescription>
          </CardHeader>
          <CardContent>
            <FormattedInput
              value={formData.K}
              onChange={(value) => handleInputChange('K', value)}
              placeholder="0,00"
              className={errors.K ? 'border-red-500' : ''}
            />
            {errors.K && <span className="text-red-500 text-sm">{errors.K}</span>}
          </CardContent>
        </Card>

        {/* Fósforo */}
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 text-lg">Fósforo (P)</CardTitle>
            <CardDescription>P Resina em ppm</CardDescription>
          </CardHeader>
          <CardContent>
            <FormattedInput
              value={formData.P}
              onChange={(value) => handleInputChange('P', value)}
              placeholder="0,0"
              className={errors.P ? 'border-red-500' : ''}
            />
            {errors.P && <span className="text-red-500 text-sm">{errors.P}</span>}
          </CardContent>
        </Card>

        {/* Macronutrientes Secundários */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-green-800 mb-4 mt-6">Macronutrientes Secundários</h3>
        </div>

        {/* Enxofre */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-800 text-lg">Enxofre (S)</CardTitle>
            <CardDescription>Enxofre em ppm</CardDescription>
          </CardHeader>
          <CardContent>
            <FormattedInput
              value={formData.S}
              onChange={(value) => handleInputChange('S', value)}
              placeholder="0,0"
              className={errors.S ? 'border-red-500' : ''}
            />
            {errors.S && <span className="text-red-500 text-sm">{errors.S}</span>}
          </CardContent>
        </Card>

        {/* Micronutrientes */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-green-800 mb-4 mt-6">Micronutrientes</h3>
        </div>

        {/* Boro */}
        <Card className="bg-indigo-50 border-indigo-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-indigo-800 text-lg">Boro (B)</CardTitle>
            <CardDescription>Boro em ppm</CardDescription>
          </CardHeader>
          <CardContent>
            <FormattedInput
              value={formData.B}
              onChange={(value) => handleInputChange('B', value)}
              placeholder="0,0"
              className={errors.B ? 'border-red-500' : ''}
            />
            {errors.B && <span className="text-red-500 text-sm">{errors.B}</span>}
          </CardContent>
        </Card>

        {/* Cobre */}
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-800 text-lg">Cobre (Cu)</CardTitle>
            <CardDescription>Cobre em ppm</CardDescription>
          </CardHeader>
          <CardContent>
            <FormattedInput
              value={formData.Cu}
              onChange={(value) => handleInputChange('Cu', value)}
              placeholder="0,0"
              className={errors.Cu ? 'border-red-500' : ''}
            />
            {errors.Cu && <span className="text-red-500 text-sm">{errors.Cu}</span>}
          </CardContent>
        </Card>

        {/* Ferro */}
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-800 text-lg">Ferro (Fe)</CardTitle>
            <CardDescription>Ferro em ppm</CardDescription>
          </CardHeader>
          <CardContent>
            <FormattedInput
              value={formData.Fe}
              onChange={(value) => handleInputChange('Fe', value)}
              placeholder="0,0"
              className={errors.Fe ? 'border-red-500' : ''}
            />
            {errors.Fe && <span className="text-red-500 text-sm">{errors.Fe}</span>}
          </CardContent>
        </Card>

        {/* Manganês */}
        <Card className="bg-pink-50 border-pink-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-pink-800 text-lg">Manganês (Mn)</CardTitle>
            <CardDescription>Manganês em ppm</CardDescription>
          </CardHeader>
          <CardContent>
            <FormattedInput
              value={formData.Mn}
              onChange={(value) => handleInputChange('Mn', value)}
              placeholder="0,0"
              className={errors.Mn ? 'border-red-500' : ''}
            />
            {errors.Mn && <span className="text-red-500 text-sm">{errors.Mn}</span>}
          </CardContent>
        </Card>

        {/* Zinco */}
        <Card className="bg-cyan-50 border-cyan-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-cyan-800 text-lg">Zinco (Zn)</CardTitle>
            <CardDescription>Zinco em ppm</CardDescription>
          </CardHeader>
          <CardContent>
            <FormattedInput
              value={formData.Zn}
              onChange={(value) => handleInputChange('Zn', value)}
              placeholder="0,0"
              className={errors.Zn ? 'border-red-500' : ''}
            />
            {errors.Zn && <span className="text-red-500 text-sm">{errors.Zn}</span>}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button 
          type="submit" 
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
        >
          Calcular Saturações e Recomendações
        </Button>
      </div>
    </form>
  );
};
