
import React from 'react';
import { Input } from '@/components/ui/input';

interface FormattedInputProps {
  value: number | string;
  onChange: (value: number | string) => void;
  placeholder?: string;
  className?: string;
  step?: string;
  type?: 'numeric' | 'text';
}

export const FormattedInput: React.FC<FormattedInputProps> = ({
  value,
  onChange,
  placeholder = "0,00",
  className,
  step = "0.01",
  type = 'numeric'
}) => {
  const formatValue = (val: number | string): string => {
    if (type === 'text') return val.toString();
    if (val === 0 || val === '' || val === null || val === undefined) return '';
    return val.toString().replace('.', ',');
  };

  const parseValue = (str: string): number | string => {
    if (type === 'text') return str;
    if (!str || str === '') return 0;
    const numericValue = str.replace(',', '.');
    const parsed = parseFloat(numericValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (type === 'text') {
      onChange(inputValue);
      return;
    }
    
    // Para campos numéricos, permitir números, vírgula, ponto e campo vazio
    const regex = /^[0-9]*[,.]?[0-9]*$/;
    if (inputValue === '' || regex.test(inputValue)) {
      // Se campo vazio, definir como 0
      if (inputValue === '') {
        onChange(0);
        return;
      }
      
      // Garantir apenas uma vírgula ou ponto
      const commaCount = (inputValue.match(/,/g) || []).length;
      const dotCount = (inputValue.match(/\./g) || []).length;
      
      if (commaCount <= 1 && dotCount === 0) {
        // Permitir a entrada e converter para número
        onChange(parseValue(inputValue));
      } else if (dotCount <= 1 && commaCount === 0) {
        // Converter ponto para vírgula e permitir
        const withComma = inputValue.replace('.', ',');
        onChange(parseValue(withComma));
      }
    }
  };

  return (
    <Input
      type="text"
      value={formatValue(value)}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
};
