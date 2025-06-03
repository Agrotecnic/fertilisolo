import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SoilData, CalculationResult } from '@/types/soilAnalysis';
import { calculateSoilAnalysis } from '@/utils/soilCalculations';
import { saveAnalysisToHistory } from '@/utils/analysisStorage';
import { toast } from '@/hooks/use-toast';
import { BasicInfoSection } from '@/components/BasicInfoSection';
import { PrimaryMacronutrientsSection } from '@/components/PrimaryMacronutrientsSection';
import { SecondaryMacronutrientsSection } from '@/components/SecondaryMacronutrientsSection';
import { MicronutrientsSection } from '@/components/MicronutrientsSection';

interface SoilAnalysisFormProps {
  onAnalysisComplete: (data: SoilData, results: CalculationResult) => void;
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
  
  // Armazenar valores temporários durante a digitação
  const [tempInputValues, setTempInputValues] = useState<Record<string, string>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    const numericFields = ['organicMatter', 'T', 'Ca', 'Mg', 'K', 'P', 'S', 'B', 'Cu', 'Fe', 'Mn', 'Zn', 'Mo'];
    
    if (numericFields.includes(field)) {
      // Verificar se o valor é uma string e contém apenas uma vírgula
      if (typeof value === 'string') {
        // Permitir valores temporários como "0," ou ","
        if (value === ',' || value === '.' || value.endsWith(',') || value.endsWith('.') || 
            (value.includes(',') && !isNaN(parseFloat(value.replace(',', '.')))) ||
            (value.includes('.') && !isNaN(parseFloat(value)))) {
          // Armazenar o valor temporário
          setTempInputValues(prev => ({ ...prev, [field]: value }));
          
          // Se o valor termina com vírgula, não converter para número ainda
          if (value.endsWith(',') || value.endsWith('.') || value === ',' || value === '.') {
            return;
          }
          
          // Caso contrário, converter normalmente
          const numValue = parseFloat(value.replace(',', '.')) || 0;
          setFormData(prev => ({ ...prev, [field]: numValue }));
        } else if (value === '') {
          // Limpar o valor temporário quando vazio
          setTempInputValues(prev => ({ ...prev, [field]: '' }));
          setFormData(prev => ({ ...prev, [field]: 0 }));
        } else {
          // Tentar converter para número
          const numValue = parseFloat(value.replace(',', '.')) || 0;
          setTempInputValues(prev => ({ ...prev, [field]: value }));
          setFormData(prev => ({ ...prev, [field]: numValue }));
        }
      } else {
        // Se já for um número, atualizar diretamente
        setFormData(prev => ({ ...prev, [field]: value }));
        setTempInputValues(prev => ({ ...prev, [field]: value.toString() }));
      }
    } else {
      // Campo de texto normal
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Converter qualquer valor temporário pendente antes da validação
    const numericFields = ['organicMatter', 'T', 'Ca', 'Mg', 'K', 'P', 'S', 'B', 'Cu', 'Fe', 'Mn', 'Zn', 'Mo'];
    numericFields.forEach(field => {
      const tempValue = tempInputValues[field];
      if (tempValue && (tempValue.endsWith(',') || tempValue.endsWith('.'))) {
        const numValue = parseFloat(tempValue.replace(',', '.')) || 0;
        setFormData(prev => ({ ...prev, [field]: numValue }));
      }
    });

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
    if (!formData.location?.trim()) newErrors.location = 'Nome do talhão é obrigatório';
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

  // Obter o valor a ser exibido (temporário ou final)
  const getDisplayValue = (field: keyof typeof formData) => {
    const numericFields = ['organicMatter', 'T', 'Ca', 'Mg', 'K', 'P', 'S', 'B', 'Cu', 'Fe', 'Mn', 'Zn', 'Mo'];
    if (numericFields.includes(field) && tempInputValues[field] !== undefined) {
      return tempInputValues[field];
    }
    return formData[field];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
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
          T={getDisplayValue('T')}
          Ca={getDisplayValue('Ca')}
          Mg={getDisplayValue('Mg')}
          K={getDisplayValue('K')}
          P={getDisplayValue('P')}
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
          S={getDisplayValue('S')}
          organicMatter={getDisplayValue('organicMatter')}
          onSChange={(value) => handleInputChange('S', value)}
          onOrganicMatterChange={(value) => handleInputChange('organicMatter', value)}
          errors={errors}
        />
      </div>

      {/* Micronutrientes */}
      <div>
        <h3 className="text-xs font-semibold text-green-800 mb-1">Micronutrientes</h3>
        <MicronutrientsSection
          B={getDisplayValue('B')}
          Cu={getDisplayValue('Cu')}
          Fe={getDisplayValue('Fe')}
          Mn={getDisplayValue('Mn')}
          Zn={getDisplayValue('Zn')}
          Mo={getDisplayValue('Mo')}
          onBChange={(value) => handleInputChange('B', value)}
          onCuChange={(value) => handleInputChange('Cu', value)}
          onFeChange={(value) => handleInputChange('Fe', value)}
          onMnChange={(value) => handleInputChange('Mn', value)}
          onZnChange={(value) => handleInputChange('Zn', value)}
          onMoChange={(value) => handleInputChange('Mo', value)}
          errors={errors}
        />
      </div>

      <div className="flex justify-center pt-1">
        <Button 
          type="submit" 
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
        >
          Calcular Saturações e Recomendações
        </Button>
      </div>
    </form>
  );
};
