
export const formatNumber = (value: number, decimals: number = 2): string => {
  if (value === 0 || isNaN(value)) return '0' + (decimals > 0 ? ',' + '0'.repeat(decimals) : '');
  return value.toFixed(decimals).replace('.', ',');
};

export const formatNumberOptional = (value: number, decimals: number = 2): string => {
  if (value === 0 || isNaN(value)) return '0';
  const formatted = value.toFixed(decimals);
  // Remove trailing zeros after decimal point
  const withoutTrailingZeros = formatted.replace(/\.?0+$/, '');
  return withoutTrailingZeros.replace('.', ',');
};
