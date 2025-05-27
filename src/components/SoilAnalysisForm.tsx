import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SoilData, CalculatedResults } from '@/pages/Index';
import { calculateSoilAnalysis } from '@/utils/soilCalculations';
import { saveAnalysisToHistory } from '@/utils/analysisStorage';
import { toast } from '@/hooks/use-toast';
import { BasicInfoSection } from '@/components/BasicInfoSection';
import { PrimaryMacronutrientsSection } from '@/components/PrimaryMacronutrientsSection';
import { SecondaryMacronutrientsSection } from '@/components/SecondaryMacronutrientsSection';
import { MicronutrientsSection } from '@/components/MicronutrientsSection';

interface SoilAnalysisFormProps {
  onAnalysisComplete: (data: SoilData, results: CalculatedResults) => void;
}

export const SoilAnalysisForm: React.FC<SoilAnalysisFormProps> = ({ onAnalysisComplete }) => {
  const [formData, setFormData] = useState<Omit<SoilData, 'id' | 'date'>>({
    location: '',
    crop: '',
    organicMatter: 0,
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
    Mo: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    const numericFields = ['organicMatter', 'T', 'Ca', 'Mg', 'K', 'P', 'S', 'B', 'Cu', 'Fe', 'Mn', 'Zn', 'Mo'];
    
    if (numericFields.includes(field)) {
      const numValue = typeof value === 'number' ? value : (parseFloat(value.toString().replace(',', '.')) || 0);
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
    if (formData.Mo < 0) newErrors.Mo = 'Molibdênio não pode ser negativo';
    if (formData.organicMatter < 0) newErrors.organicMatter = 'Matéria orgânica não pode ser negativa';
    if (!formData.location?.trim()) newErrors.location = 'Localização é obrigatória';
    if (!formData.crop?.trim()) newErrors.crop = 'Cultura é obrigatória';

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
    <form onSubmit={handleSubmit} className="space-y-2">
      {errors.general && (
        <Alert variant="destructive">
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Informações Básicas */}
      <BasicInfoSection
        location={formData.location || ''}
        crop={formData.crop || ''}
        onLocationChange={(value) => handleInputChange('location', value)}
        onCropChange={(value) => handleInputChange('crop', value)}
        errors={errors}
      />

      {/* Macronutrientes Primários */}
      <div>
        <h3 className="text-xs font-semibold text-green-800 mb-1">Macronutrientes Primários</h3>
        <PrimaryMacronutrientsSection
          T={formData.T}
          Ca={formData.Ca}
          Mg={formData.Mg}
          K={formData.K}
          P={formData.P}
          onTChange={(value) => handleInputChange('T', value)}
          onCaChange={(value) => handleInputChange('Ca', value)}
          onMgChange={(value) => handleInputChange('Mg', value)}
          onKChange={(value) => handleInputChange('K', value)}
          onPChange={(value) => handleInputChange('P', value)}
          errors={errors}
        />
      </div>

      {/* Macronutrientes Secundários */}
      <div>
        <h3 className="text-xs font-semibold text-green-800 mb-1">Macronutrientes Secundários</h3>
        <SecondaryMacronutrientsSection
          S={formData.S}
          organicMatter={formData.organicMatter}
          onSChange={(value) => handleInputChange('S', value)}
          onOrganicMatterChange={(value) => handleInputChange('organicMatter', value)}
          errors={errors}
        />
      </div>

      {/* Micronutrientes */}
      <div>
        <h3 className="text-xs font-semibold text-green-800 mb-1">Micronutrientes</h3>
        <MicronutrientsSection
          B={formData.B}
          Cu={formData.Cu}
          Fe={formData.Fe}
          Mn={formData.Mn}
          Zn={formData.Zn}
          Mo={formData.Mo}
          onBChange={(value) => handleInputChange('B', value)}
          onCuChange={(value) => handleInputChange('Cu', value)}
          onFeChange={(value) => handleInputChange('Fe', value)}
          onMnChange={(value) => handleInputChange('Mn', value)}
          onZnChange={(value) => handleInputChange('Zn', value)}
          onMoChange={(value) => handleInputChange('Mo', value)}
          errors={errors}
        />
      </div>

      <div className="flex justify-center pt-2">
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
