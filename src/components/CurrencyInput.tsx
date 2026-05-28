"use client";

import React, { useState, useEffect, useCallback } from 'react';

interface CurrencyInputProps {
  readonly initialValue: number | null;
  readonly onChange: (val: number | null) => void;
  readonly placeholder?: string;
}

export const CurrencyInput = React.memo(({ initialValue, onChange, placeholder = "R$ 0" }: CurrencyInputProps) => {
  const formatIntegerBRL = useCallback((val: number) => `R$ ${val.toLocaleString('pt-BR')}`, []);
  const [inputValue, setInputValue] = useState(initialValue !== null ? formatIntegerBRL(initialValue) : '');

  useEffect(() => {
    if (initialValue !== null) {
      const formatted = formatIntegerBRL(initialValue);
      if (inputValue !== formatted) setInputValue(formatted);
    } else if (inputValue !== '') {
      setInputValue('');
    }
  }, [initialValue, formatIntegerBRL]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digits = rawValue.replace(/\D/g, '');
    
    if (!digits) {
      setInputValue('');
      onChange(null);
      return;
    }

    const numValue = parseInt(digits, 10);
    setInputValue(formatIntegerBRL(numValue));
    onChange(numValue);
  }, [onChange, formatIntegerBRL]);

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={inputValue}
      onChange={handleChange}
      className="w-full text-left text-[14px] font-black text-zinc-950 dark:text-white bg-transparent outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 truncate transition-colors focus:text-zinc-600 dark:focus:text-zinc-400"
    />
  );
});

CurrencyInput.displayName = 'CurrencyInput';