import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SoilData, CalculationResult } from '@/types/soilAnalysis';
import { calculateSoilAnalysis } from '@/utils/soilCalculations';
import { saveAnalysisToHistory } from '@/utils/analysisStorage';
import { convertSoilDataToStandard, getUnitLabel, convertFromStandardUnit, convertToStandardUnit } from '@/utils/unitConversions';
import { toast } from '@/hooks/use-toast';
import { BasicInfoSection } from '@/components/BasicInfoSection';
import { PrimaryMacronutrientsSection } from '@/components/PrimaryMacronutrientsSection';
import { SecondaryMacronutrientsSection } from '@/components/SecondaryMacronutrientsSection';
import { MicronutrientsSection } from '@/components/MicronutrientsSection';
import { UnitSelector } from '@/components/UnitSelector';
import { FormattedInput } from '@/components/FormattedInput';
// Removendo importações complexas por enquanto

interface SoilAnalysisFormProps {
  onAnalysisComplete: (data: SoilData, results: CalculationResult) => void;
  selectedFarmName?: string;
  selectedPlotName?: string;
  selectedFarmLocation?: string;
}

export const SoilAnalysisForm: React.FC<SoilAnalysisFormProps> = ({ 
  onAnalysisComplete,
  selectedFarmName,
  selectedPlotName,
  selectedFarmLocation
}) => {
  const [formData, setFormData] = useState<Omit<SoilData, 'id' | 'date'>>({
    location: '',
    crop: '',
    targetYield: undefined, // Permite campo vazio
    organicMatter: '' as any, // Permite campo vazio
    T: '' as any,
    Ca: '' as any,
    Mg: '' as any,
    K: '' as any,
    P: '' as any,
    S: '' as any,
    B: '' as any,
    Cu: '' as any,
    Fe: '' as any,
    Mn: '' as any,
    Zn: '' as any,
    Mo: '' as any,
    argila: 35, // Mantém valor padrão para argila
  });

  const [isAutoFilled, setIsAutoFilled] = useState(false);

  // Preencher automaticamente quando um talhão for selecionado
  useEffect(() => {
    if (selectedPlotName) {
      const locationValue = selectedFarmName 
        ? `${selectedFarmName} - ${selectedPlotName}` 
        : selectedPlotName;
      
      setFormData(prev => ({
        ...prev,
        location: locationValue
      }));

      setIsAutoFilled(true);

      // Mostrar notificação ao usuário
      toast({
        title: "Talhão selecionado!",
        description: `As informações de "${locationValue}" foram preenchidas automaticamente.`,
        duration: 3000,
      });
    } else {
      setIsAutoFilled(false);
    }
  }, [selectedPlotName, selectedFarmName]);
  
  // Armazenar valores temporários durante a digitação
  const [tempInputValues, setTempInputValues] = useState<Record<string, string>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estado para unidades selecionadas
  const [selectedUnits, setSelectedUnits] = useState({
    T: 'cmolc_dm3',
    Ca: 'cmolc_dm3',
    Mg: 'cmolc_dm3',
    K: 'mg_dm3',
    P: 'mg_dm3',
    S: 'mg_dm3',
    organicMatter: 'percent',
    B: 'mg_dm3',
    Cu: 'mg_dm3',
    Fe: 'mg_dm3',
    Mn: 'mg_dm3',
    Zn: 'mg_dm3',
    Mo: 'mg_dm3'
  });

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
          
          // Armazenar o valor SEM conversão (mantém na unidade do usuário)
          let numValue = parseFloat(value.replace(',', '.')) || 0;
          // Arredondar para evitar erros de precisão de ponto flutuante
          numValue = Math.round(numValue * 1000000) / 1000000;
          setFormData(prev => ({ ...prev, [field]: numValue }));
        } else if (value === '') {
          // Limpar o valor temporário quando vazio
          setTempInputValues(prev => ({ ...prev, [field]: '' }));
          setFormData(prev => ({ ...prev, [field]: 0 }));
        } else {
          // Tentar converter para número
          let numValue = parseFloat(value.replace(',', '.')) || 0;
          // Arredondar para evitar erros de precisão de ponto flutuante
          numValue = Math.round(numValue * 1000000) / 1000000;
          setTempInputValues(prev => ({ ...prev, [field]: value }));
          // Armazenar o valor SEM conversão (mantém na unidade do usuário)
          setFormData(prev => ({ ...prev, [field]: numValue }));
        }
      } else {
        // Se já for um número, armazenar diretamente SEM conversão
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

  const handleUnitChange = (nutrient: string, unit: string) => {
    const oldUnit = selectedUnits[nutrient];
    const newUnit = unit;
    
    // Se a unidade mudou e há um valor, converter o valor
    if (oldUnit !== newUnit && formData[nutrient] !== undefined) {
      const currentValue = formData[nutrient];
      
      // Primeiro converter da unidade antiga para a padrão
      const standardValue = convertToStandardUnit(currentValue, nutrient, oldUnit);
      
      // Depois converter da padrão para a nova unidade
      let newValue = convertFromStandardUnit(standardValue, nutrient, newUnit);
      
      // Arredondar para 6 casas decimais para evitar erros de precisão de ponto flutuante
      newValue = Math.round(newValue * 1000000) / 1000000;
      
      // Atualizar o valor no formData
      setFormData(prev => ({
        ...prev,
        [nutrient]: newValue
      }));
      
      // Atualizar o valor temporário também
      setTempInputValues(prev => ({
        ...prev,
        [nutrient]: newValue.toString()
      }));
    }
    
    // Atualizar a unidade selecionada
    setSelectedUnits(prev => ({
      ...prev,
      [nutrient]: unit
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Converter dados para unidades padrão antes do cálculo
      const convertedData = convertSoilDataToStandard(formData, selectedUnits);
      const results = calculateSoilAnalysis(convertedData);
      
      const analysisData: SoilData = {
        ...convertedData,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      <BasicInfoSection
        location={formData.location || ''}
        crop={formData.crop || ''}
        date={formData.date}
        targetYield={formData.targetYield}
        isAutoFilled={isAutoFilled}
        onLocationChange={(value) => handleInputChange('location', value)}
        onCropChange={(value) => handleInputChange('crop', value)}
        onDateChange={(value) => handleInputChange('date', value)}
        onTargetYieldChange={(value) => handleInputChange('targetYield', value)}
        errors={errors}
      />

      {/* Macronutrientes Primários */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Macronutrientes Primários</h3>
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
          selectedUnits={selectedUnits}
          onUnitChange={handleUnitChange}
        />
      </div>

      {/* Macronutrientes Secundários e Argila */}
      <div className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200">
        <h3 className="text-xs md:text-sm font-semibold text-gray-800 mb-3">Macronutrientes Secundários e Argila</h3>
        <SecondaryMacronutrientsSection
          S={formData.S}
          organicMatter={formData.organicMatter}
          onSChange={(value) => handleInputChange('S', value)}
          onOrganicMatterChange={(value) => handleInputChange('organicMatter', value)}
          errors={errors}
          selectedUnits={selectedUnits}
          onUnitChange={handleUnitChange}
        />
        {/* Argila */}
        <div className="mt-3 md:mt-4 space-y-2">
          <Label htmlFor="argila" className="text-xs md:text-sm font-medium text-gray-700">Argila (%)</Label>
          <Input 
            id="argila" 
            type="number" 
            step="0.1"
            min="0"
            max="100"
            placeholder="Ex: 35"
            value={formData.argila || 35}
            onChange={(e) => handleInputChange('argila', parseFloat(e.target.value) || 0)}
            className="h-9 md:h-10 text-xs md:text-sm"
          />
          {errors.argila && <p className="text-xs md:text-sm text-red-500">{errors.argila}</p>}
          <p className="text-[10px] md:text-xs text-gray-500">% de argila no solo</p>
        </div>
      </div>

      {/* Micronutrientes */}
      <div className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200">
        <h3 className="text-xs md:text-sm font-semibold text-gray-800 mb-3">Micronutrientes</h3>
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
          selectedUnits={selectedUnits}
          onUnitChange={handleUnitChange}
        />
      </div>

      <div className="flex justify-center pt-4 md:pt-6">
        <Button 
          type="submit" 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground w-full md:w-auto px-4 md:px-8 py-3 text-sm md:text-base font-medium"
        >
          <span className="block md:inline">Calcular Saturações e</span>
          <span className="block md:inline md:ml-1">Recomendações</span>
        </Button>
      </div>
    </form>
  );
};
