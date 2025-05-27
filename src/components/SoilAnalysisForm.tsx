
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SoilData, CalculatedResults } from '@/pages/Index';
import { calculateSoilAnalysis } from '@/utils/soilCalculations';
import { saveAnalysisToHistory } from '@/utils/analysisStorage';
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    const numericFields = ['T', 'Ca', 'Mg', 'K', 'P'];
    
    if (numericFields.includes(field)) {
      const numValue = parseFloat(value) || 0;
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
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Ex: Fazenda São José, Talhão 3"
            className={errors.location ? 'border-red-500' : ''}
          />
          {errors.location && <span className="text-red-500 text-sm">{errors.location}</span>}
        </div>

        {/* CTC */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-800 text-lg">CTC (T)</CardTitle>
            <CardDescription>Capacidade de Troca Catiônica em cmolc/dm³</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              step="0.01"
              value={formData.T || ''}
              onChange={(e) => handleInputChange('T', e.target.value)}
              placeholder="0.00"
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
            <Input
              type="number"
              step="0.01"
              value={formData.Ca || ''}
              onChange={(e) => handleInputChange('Ca', e.target.value)}
              placeholder="0.00"
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
            <Input
              type="number"
              step="0.01"
              value={formData.Mg || ''}
              onChange={(e) => handleInputChange('Mg', e.target.value)}
              placeholder="0.00"
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
            <Input
              type="number"
              step="0.01"
              value={formData.K || ''}
              onChange={(e) => handleInputChange('K', e.target.value)}
              placeholder="0.00"
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
            <Input
              type="number"
              step="0.1"
              value={formData.P || ''}
              onChange={(e) => handleInputChange('P', e.target.value)}
              placeholder="0.0"
              className={errors.P ? 'border-red-500' : ''}
            />
            {errors.P && <span className="text-red-500 text-sm">{errors.P}</span>}
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
