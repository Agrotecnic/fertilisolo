import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NUTRIENT_UNITS } from '@/types/units';

interface UnitSelectorProps {
  nutrient: string;
  selectedUnit: string;
  onUnitChange: (unit: string) => void;
  className?: string;
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({
  nutrient,
  selectedUnit,
  onUnitChange,
  className
}) => {
  const nutrientConfig = NUTRIENT_UNITS[nutrient];
  
  if (!nutrientConfig) {
    return null;
  }

  return (
    <Select value={selectedUnit} onValueChange={onUnitChange}>
      <SelectTrigger className={`h-8 text-xs ${className || 'w-16'}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {nutrientConfig.options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-sm">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
