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
    targetYield: 4, // Produtividade esperada padrão
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
    argila: 35, // Adicionando o campo argila que estava faltando
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
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Macronutrientes Secundários e Argila</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Enxofre (S) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="S" className="text-sm font-medium text-gray-700">Enxofre (S)</Label>
              <UnitSelector
                nutrient="S"
                selectedUnit={selectedUnits.S || 'mg_dm3'}
                onUnitChange={(unit) => handleUnitChange('S', unit)}
                className="w-20"
              />
            </div>
            <FormattedInput
              value={formData.S}
              onChange={(value) => handleInputChange('S', value)}
              placeholder="0,00"
              className="h-10 text-sm text-gray-800 border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
            {errors.S && <p className="text-sm text-red-500">{errors.S}</p>}
            <p className="text-xs text-gray-500">{getUnitLabel('S', selectedUnits.S || 'mg_dm3')}</p>
          </div>

          {/* Argila */}
          <div className="space-y-2">
            <Label htmlFor="argila" className="text-sm font-medium text-gray-700">Argila (%)</Label>
            <Input 
              id="argila" 
              type="number" 
              step="0.1"
              min="0"
              max="100"
              placeholder="Ex: 35"
              value={formData.argila || 35}
              onChange={(e) => handleInputChange('argila', parseFloat(e.target.value) || 0)}
              className="h-10"
            />
            {errors.argila && <p className="text-sm text-red-500">{errors.argila}</p>}
            <p className="text-xs text-gray-500">% de argila no solo</p>
          </div>

          {/* Matéria Orgânica */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="organicMatter" className="text-sm font-medium text-gray-700">Matéria Orgânica</Label>
              <UnitSelector
                nutrient="organicMatter"
                selectedUnit={selectedUnits.organicMatter || 'percent'}
                onUnitChange={(unit) => handleUnitChange('organicMatter', unit)}
                className="w-20"
              />
            </div>
            <FormattedInput
              value={formData.organicMatter}
              onChange={(value) => handleInputChange('organicMatter', value)}
              placeholder="0,00"
              className="h-10 text-sm text-gray-800 border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
            {errors.organicMatter && <p className="text-sm text-red-500">{errors.organicMatter}</p>}
            <p className="text-xs text-gray-500">{getUnitLabel('organicMatter', selectedUnits.organicMatter || 'percent')}</p>
          </div>
        </div>
      </div>

      {/* Micronutrientes */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Micronutrientes</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Boro (B) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="B" className="text-sm font-medium text-gray-700">Boro (B)</Label>
              <UnitSelector
                nutrient="B"
                selectedUnit={selectedUnits.B || 'mg_dm3'}
                onUnitChange={(unit) => handleUnitChange('B', unit)}
                className="w-20"
              />
            </div>
            <Input 
              id="B" 
              type="number" 
              step="0.01"
              min="0"
              placeholder="0,00"
              value={formData.B}
              onChange={(e) => handleInputChange('B', parseFloat(e.target.value) || 0)}
              className="h-10"
            />
            {errors.B && <p className="text-sm text-red-500">{errors.B}</p>}
            <p className="text-xs text-gray-500">{getUnitLabel('B', selectedUnits.B || 'mg_dm3')}</p>
          </div>

          {/* Cobre (Cu) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="Cu" className="text-sm font-medium text-gray-700">Cobre (Cu)</Label>
              <UnitSelector
                nutrient="Cu"
                selectedUnit={selectedUnits.Cu || 'mg_dm3'}
                onUnitChange={(unit) => handleUnitChange('Cu', unit)}
                className="w-20"
              />
            </div>
            <Input 
              id="Cu" 
              type="number" 
              step="0.01"
              min="0"
              placeholder="0,00"
              value={formData.Cu}
              onChange={(e) => handleInputChange('Cu', parseFloat(e.target.value) || 0)}
              className="h-10"
            />
            {errors.Cu && <p className="text-sm text-red-500">{errors.Cu}</p>}
            <p className="text-xs text-gray-500">{getUnitLabel('Cu', selectedUnits.Cu || 'mg_dm3')}</p>
          </div>

          {/* Ferro (Fe) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="Fe" className="text-sm font-medium text-gray-700">Ferro (Fe)</Label>
              <UnitSelector
                nutrient="Fe"
                selectedUnit={selectedUnits.Fe || 'mg_dm3'}
                onUnitChange={(unit) => handleUnitChange('Fe', unit)}
                className="w-20"
              />
            </div>
            <Input 
              id="Fe" 
              type="number" 
              step="0.01"
              min="0"
              placeholder="0,00"
              value={formData.Fe}
              onChange={(e) => handleInputChange('Fe', parseFloat(e.target.value) || 0)}
              className="h-10"
            />
            {errors.Fe && <p className="text-sm text-red-500">{errors.Fe}</p>}
            <p className="text-xs text-gray-500">{getUnitLabel('Fe', selectedUnits.Fe || 'mg_dm3')}</p>
          </div>

          {/* Manganês (Mn) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="Mn" className="text-sm font-medium text-gray-700">Manganês (Mn)</Label>
              <UnitSelector
                nutrient="Mn"
                selectedUnit={selectedUnits.Mn || 'mg_dm3'}
                onUnitChange={(unit) => handleUnitChange('Mn', unit)}
                className="w-20"
              />
            </div>
            <Input 
              id="Mn" 
              type="number" 
              step="0.01"
              min="0"
              placeholder="0,00"
              value={formData.Mn}
              onChange={(e) => handleInputChange('Mn', parseFloat(e.target.value) || 0)}
              className="h-10"
            />
            {errors.Mn && <p className="text-sm text-red-500">{errors.Mn}</p>}
            <p className="text-xs text-gray-500">{getUnitLabel('Mn', selectedUnits.Mn || 'mg_dm3')}</p>
          </div>

          {/* Zinco (Zn) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="Zn" className="text-sm font-medium text-gray-700">Zinco (Zn)</Label>
              <UnitSelector
                nutrient="Zn"
                selectedUnit={selectedUnits.Zn || 'mg_dm3'}
                onUnitChange={(unit) => handleUnitChange('Zn', unit)}
                className="w-20"
              />
            </div>
            <Input 
              id="Zn" 
              type="number" 
              step="0.01"
              min="0"
              placeholder="0,00"
              value={formData.Zn}
              onChange={(e) => handleInputChange('Zn', parseFloat(e.target.value) || 0)}
              className="h-10"
            />
            {errors.Zn && <p className="text-sm text-red-500">{errors.Zn}</p>}
            <p className="text-xs text-gray-500">{getUnitLabel('Zn', selectedUnits.Zn || 'mg_dm3')}</p>
          </div>

          {/* Molibdênio (Mo) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="Mo" className="text-sm font-medium text-gray-700">Molibdênio (Mo)</Label>
              <UnitSelector
                nutrient="Mo"
                selectedUnit={selectedUnits.Mo || 'mg_dm3'}
                onUnitChange={(unit) => handleUnitChange('Mo', unit)}
                className="w-20"
              />
            </div>
            <Input 
              id="Mo" 
              type="number" 
              step="0.01"
              min="0"
              placeholder="0,00"
              value={formData.Mo}
              onChange={(e) => handleInputChange('Mo', parseFloat(e.target.value) || 0)}
              className="h-10"
            />
            {errors.Mo && <p className="text-sm text-red-500">{errors.Mo}</p>}
            <p className="text-xs text-gray-500">{getUnitLabel('Mo', selectedUnits.Mo || 'mg_dm3')}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <Button 
          type="submit" 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium"
        >
          Calcular Saturações e Recomendações
        </Button>
      </div>
    </form>
  );
};
