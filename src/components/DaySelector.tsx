"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isToday, subDays, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DaySelectorProps {
  activeDate: Date;
  onChangeDate: (date: Date) => void;
}

export const DaySelector = React.memo(({ activeDate, onChangeDate }: DaySelectorProps) => {
  return (
    <div className="flex items-center justify-between liquid-glass-panel rounded-[24px] p-1.5 mb-5 shadow-lg">
      <button 
        onClick={() => onChangeDate(subDays(activeDate, 1))} 
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors border border-white/5"
      >
        <ChevronLeft size={20} />
      </button>
      
      <div 
        className="flex flex-col items-center justify-center cursor-pointer select-none px-4" 
        onClick={() => onChangeDate(new Date())}
      >
        <span className={`text-[13px] font-black tracking-widest ${isToday(activeDate) ? 'text-zinc-950 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
          {isToday(activeDate) ? 'HOJE' : format(activeDate, "dd 'de' MMM", { locale: ptBR }).toUpperCase()}
        </span>
        {!isToday(activeDate) && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mt-0.5">
            Voltar p/ Hoje
          </span>
        )}
      </div>

      <button 
        onClick={() => onChangeDate(addDays(activeDate, 1))} 
        disabled={isToday(activeDate)}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors disabled:opacity-20 disabled:cursor-not-allowed border border-white/5"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
});

DaySelector.displayName = 'DaySelector';