
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
    
    // Permitir apenas números e uma vírgula ou ponto
    if (inputValue === '') {
      onChange(0);
      return;
    }
    
    // Regex para aceitar números com vírgula ou ponto
    const regex = /^[0-9]*[,.]?[0-9]*$/;
    if (regex.test(inputValue)) {
      // Contar vírgulas e pontos para garantir que há apenas um separador
      const hasComma = inputValue.includes(',');
      const hasDot = inputValue.includes('.');
      
      if ((hasComma && !hasDot) || (!hasComma && hasDot) || (!hasComma && !hasDot)) {
        onChange(parseValue(inputValue));
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
