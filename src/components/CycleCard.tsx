import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import { Cycle, Operation } from '../types';
import { formatBRL } from '../utils/currency';
import { Checkbox } from './ui/checkbox';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';

interface CycleCardProps {
  index: number;
  cycle: Cycle;
  onUpdateOperation: (cycleId: string, operationId: string, updates: Partial<Operation>) => void;
  onDeleteCycle: (cycleId: string) => void;
}

export function CycleCard({ index, cycle, onUpdateOperation, onDeleteCycle }: CycleCardProps) {
  const isProfit = cycle.totalProfit > 0;
  const isLoss = cycle.totalProfit < 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)", transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
    >
      <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl mb-4 overflow-hidden group">
        <CardContent className="p-0">
          <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/50">
            <div className="flex items-center gap-2.5">
              <div className={`w-2 h-2 rounded-full shrink-0 ${cycle.completed ? (isProfit ? 'bg-emerald-500' : isLoss ? 'bg-rose-500' : 'bg-zinc-300 dark:bg-zinc-700') : 'bg-zinc-900 dark:bg-zinc-100 animate-pulse'}`} />
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Ciclo {index}
                {cycle.createdAt && (
                  <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                    • {format(parseISO(cycle.createdAt), 'HH:mm')}
                  </span>
                )}
              </h3>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-sm font-semibold tracking-tight ${cycle.completed ? (isProfit ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-zinc-400 dark:text-zinc-500') : 'text-zinc-400 dark:text-zinc-500'}`}>
                {cycle.completed ? (isProfit ? '+' : '') + formatBRL(cycle.totalProfit) : 'Pendente'}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteCycle(cycle.id)}
                className="text-zinc-300 dark:text-zinc-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 h-8 w-8 rounded-full transition-colors -mr-2 shrink-0"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>

          <div className="p-2 space-y-1">
            {cycle.operations.map((op) => (
              <div key={op.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                
                <div className="flex items-center gap-4 w-1/3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">{op.type}</span>
                    {op.type === 'MAE' && (
                      <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => onUpdateOperation(cycle.id, op.id, { bau: !(op.bau ?? false) })}>
                        <Checkbox
                          id={`bau-${op.id}`}
                          checked={op.bau ?? false}
                          onCheckedChange={(checked) => onUpdateOperation(cycle.id, op.id, { bau: !!checked })}
                          className="w-3.5 h-3.5 rounded-[4px]"
                        />
                        <span className="text-[9px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest select-none">
                          BAÚ
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col w-1/3 px-2">
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium mb-1">Entrada</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">{formatBRL(op.deposit)}</span>
                </div>
                
                <div className="flex flex-col w-1/3">
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium mb-1 text-right">Saque</span>
                  <CurrencyInput
                    initialValue={op.withdraw}
                    onChange={(val) => onUpdateOperation(cycle.id, op.id, { withdraw: val })}
                  />
                </div>

              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CurrencyInput({ initialValue, onChange }: { initialValue: number | null, onChange: (val: number | null) => void }) {
  const formatIntegerBRL = (val: number) => `R$ ${val.toLocaleString('pt-BR')}`;
  const [inputValue, setInputValue] = useState(initialValue !== null ? formatIntegerBRL(initialValue) : '');

  useEffect(() => {
    if (initialValue !== null && inputValue !== formatIntegerBRL(initialValue)) {
      setInputValue(formatIntegerBRL(initialValue));
    }
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder="R$ 0"
      value={inputValue}
      onChange={handleChange}
      className="w-full text-right text-sm font-semibold text-zinc-900 dark:text-zinc-100 bg-transparent outline-none border-b border-transparent focus:border-zinc-300 dark:focus:border-zinc-600 transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-600 py-1"
    />
  );
}