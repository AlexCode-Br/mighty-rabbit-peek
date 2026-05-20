import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import { Cycle, Operation } from '../types';
import { formatBRL } from '../utils/currency';
import { Checkbox } from './ui/checkbox';
import { motion } from 'framer-motion';

interface CycleCardProps {
  index: number;
  cycle: Cycle;
  onUpdateOperation: (cycleId: string, operationId: string, updates: Partial<Operation>) => void;
  onDeleteCycle: (cycleId: string) => void;
}

export function CycleCard({ index, cycle, onUpdateOperation, onDeleteCycle }: CycleCardProps) {
  const isProfit = cycle.totalProfit >= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <Card className="border-none shadow-lg shadow-slate-200/40 bg-white rounded-[2rem] mb-4 overflow-hidden relative">
        <div className={`absolute top-0 left-0 w-1.5 h-full ${cycle.completed ? (isProfit ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-indigo-400'} transition-colors`} />
        
        <CardContent className="p-5 pl-6 sm:p-6 sm:pl-8">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg text-slate-800">Ciclo {index}</h3>
              {!cycle.completed && <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse ml-1" />}
            </div>
            
            <div className="flex items-center gap-2">
              <motion.div 
                key={cycle.totalProfit}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className={`font-mono text-sm font-bold px-3 py-1.5 rounded-xl border ${cycle.completed ? (isProfit ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100') : 'bg-slate-50 text-slate-500 border-slate-100'}`}
              >
                {cycle.completed ? (isProfit ? '+' : '') + formatBRL(cycle.totalProfit) : 'Em aberto'}
              </motion.div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteCycle(cycle.id)}
                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-9 w-9 rounded-full transition-colors"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {cycle.operations.map((op) => (
              <div key={op.id} className="grid grid-cols-[auto_auto_1fr] sm:grid-cols-[auto_1fr_1.2fr] items-center gap-3 bg-slate-50 border border-slate-100 p-3 sm:p-4 rounded-2xl relative transition-colors hover:border-slate-200">
                <div className="font-black text-sm w-12 flex flex-col gap-1 items-start text-slate-700">
                  <span className="tracking-widest">{op.type}</span>
                  {op.type === 'MAE' && (
                    <motion.div whileTap={{ scale: 0.95 }} className="flex items-center gap-1 mt-1 cursor-pointer" onClick={() => onUpdateOperation(cycle.id, op.id, { bau: !(op.bau ?? false) })}>
                      <Checkbox
                        id={`bau-${op.id}`}
                        checked={op.bau ?? false}
                        onCheckedChange={(checked) => onUpdateOperation(cycle.id, op.id, { bau: !!checked })}
                        className="pointer-events-none scale-[0.8] border-indigo-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                      />
                      <Label htmlFor={`bau-${op.id}`} className="text-[10px] font-bold text-indigo-600 cursor-pointer select-none">
                        BAÚ
                      </Label>
                    </motion.div>
                  )}
                </div>
                
                <div className="flex flex-col border-l border-slate-200 pl-3 pr-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Entrada</span>
                  <span className="font-mono text-slate-800 text-sm font-bold">{formatBRL(op.deposit)}</span>
                </div>
                
                <div className="flex flex-col border-l border-slate-200 pl-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Saque Retorno</span>
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
    <Input
      type="text"
      inputMode="numeric"
      placeholder="R$ 0"
      value={inputValue}
      onChange={handleChange}
      className="h-10 px-3 text-right text-sm font-mono font-bold rounded-xl bg-white border-slate-200 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all placeholder:text-slate-300 w-full shadow-sm"
    />
  );
}