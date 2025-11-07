import React, { useState } from 'react';
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
  // Estado local para controlar o valor exibido
  const [displayValue, setDisplayValue] = useState<string>('');
  // Flag para controlar se estamos em modo de edição
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Formata o valor apenas para exibição quando não estamos editando
  const formatValue = (val: number | string): string => {
    if (isEditing) return displayValue;
    if (type === 'text') return val?.toString() || '';
    // Retorna vazio para valores nulos, undefined, zero ou string vazia
    if (val === null || val === undefined || val === '' || val === 0 || val === '0') return '';
    return val.toString().replace('.', ',');
  };

  // Analisa o valor apenas quando precisamos enviar para o componente pai
  const parseValue = (str: string): number | string => {
    if (type === 'text') return str;
    if (!str || str === '') return ''; // Retorna string vazia ao invés de 0
    
    // Se for apenas vírgula, mantém como string
    if (str === ',' || str === '.') {
      return str;
    }
    
    // Converter para número apenas se for um número válido
    const numericValue = str.replace(',', '.');
    if (!/^[0-9]*\.?[0-9]*$/.test(numericValue)) {
      return str; // Retorna como string se não for um número válido
    }
    
    const parsed = parseFloat(numericValue);
    return isNaN(parsed) ? '' : parsed; // Retorna '' ao invés de str quando NaN
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    setIsEditing(true);
    
    if (type === 'text') {
      onChange(inputValue);
      return;
    }
    
    // Permitir campo vazio
    if (inputValue === '') {
      onChange('');
      return;
    }
    
    // Verificar se há no máximo um separador decimal (vírgula ou ponto)
    const separators = (inputValue.match(/[,.]/g) || []).length;
    
    // Regras de aceitação mais simples
    if (
      // Qualquer dígito ou vírgula/ponto (no máximo um separador)
      separators <= 1 && /^[0-9]*[,.]?[0-9]*$/.test(inputValue)
    ) {
      onChange(inputValue); // Manter como string durante a edição
    }
  };

  // Quando o campo perde o foco, convertemos para número se for válido
  const handleBlur = () => {
    setIsEditing(false);
    if (type === 'numeric' && displayValue) {
      const parsedValue = parseValue(displayValue);
      onChange(parsedValue);
    }
  };

  // Quando o campo ganha o foco, mostramos o valor exato para edição
  const handleFocus = () => {
    setIsEditing(true);
    
    // Se o valor for 0, vazio, null ou undefined, deixa o campo vazio
    if (value === 0 || value === '' || value === '0' || value === null || value === undefined) {
      setDisplayValue('');
      return;
    }
    
    if (typeof value === 'number') {
      setDisplayValue(value.toString().replace('.', ','));
    } else if (typeof value === 'string') {
      setDisplayValue(value);
    }
  };

  return (
    <Input
      type="text"
      value={formatValue(value)}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={(e) => {
        handleFocus();
        // Seleciona todo o texto para facilitar substituição
        e.target.select();
      }}
      placeholder={placeholder}
      className={`text-gray-800 ${className}`}
      inputMode="decimal"
    />
  );
};
