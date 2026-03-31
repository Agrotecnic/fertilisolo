import { NUTRIENT_UNITS, SelectedUnits } from '@/types/units';

/**
 * Converte um valor da unidade selecionada para a unidade padrão
 */
export const convertToStandardUnit = (
  value: number,
  nutrient: string,
  selectedUnit: string
): number => {
  const nutrientConfig = NUTRIENT_UNITS[nutrient];
  if (!nutrientConfig) return value;

  const unitConfig = nutrientConfig.options.find(opt => opt.value === selectedUnit);
  if (!unitConfig) return value;

  return value * unitConfig.conversionFactor;
};

/**
 * Converte um valor da unidade padrão para a unidade selecionada
 */
export const convertFromStandardUnit = (
  value: number,
  nutrient: string,
  selectedUnit: string
): number => {
  const nutrientConfig = NUTRIENT_UNITS[nutrient];
  if (!nutrientConfig) return value;

  const unitConfig = nutrientConfig.options.find(opt => opt.value === selectedUnit);
  if (!unitConfig) return value;

  return value / unitConfig.conversionFactor;
};

/**
 * Converte todos os valores do SoilData para unidades padrão
 */
export const convertSoilDataToStandard = (
  data: any,
  selectedUnits: SelectedUnits
): any => {
  const standardData = { ...data };

  Object.keys(selectedUnits).forEach(nutrient => {
    if (standardData[nutrient] !== undefined) {
      standardData[nutrient] = convertToStandardUnit(
        standardData[nutrient],
        nutrient,
        selectedUnits[nutrient]
      );
    }
  });

  return standardData;
};

/**
 * Obtém o rótulo da unidade selecionada
 */
export const getUnitLabel = (nutrient: string, selectedUnit: string): string => {
  const nutrientConfig = NUTRIENT_UNITS[nutrient];
  if (!nutrientConfig) return '';

  const unitConfig = nutrientConfig.options.find(opt => opt.value === selectedUnit);
  return unitConfig?.label || '';
};

/**
 * Obtém as unidades padrão para inicialização
 */
export const getDefaultUnits = (): SelectedUnits => {
  const defaultUnits: SelectedUnits = {};
  
  Object.keys(NUTRIENT_UNITS).forEach(nutrient => {
    defaultUnits[nutrient] = NUTRIENT_UNITS[nutrient].default;
  });

  return defaultUnits;
};
