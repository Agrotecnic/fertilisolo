
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
    if (typeof val === 'string') return val;
    if (val === 0) return '';
    return val.toString().replace('.', ',');
  };

  const parseValue = (str: string): number | string => {
    if (type === 'text') return str;
    if (!str) return 0;
    return parseFloat(str.replace(',', '.')) || 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (type === 'text') {
      onChange(inputValue);
      return;
    }
    
    // Para campos numéricos, permitir apenas números, vírgula e ponto
    const sanitized = inputValue.replace(/[^0-9,]/g, '');
    
    // Garantir apenas uma vírgula
    const parts = sanitized.split(',');
    const formatted = parts.length > 2 ? parts[0] + ',' + parts.slice(1).join('') : sanitized;
    
    onChange(parseValue(formatted));
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
