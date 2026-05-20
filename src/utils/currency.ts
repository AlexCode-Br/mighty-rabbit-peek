export const formatBRL = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const parseBRL = (value: string): number => {
  if (!value) return 0;
  const numericString = value.replace(/[^0-9-]/g, '');
  return Number(numericString) / 100;
};
