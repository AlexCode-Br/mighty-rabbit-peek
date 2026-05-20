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
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, filter: "blur(8px)", transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card className="shadow-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-2xl rounded-3xl mb-4 overflow-hidden relative group transition-colors hover:border-white/20">
        <div className={`absolute top-0 left-0 w-1.5 h-full ${cycle.completed ? (isProfit ? 'bg-emerald-500 shadow-[0_0_20px_rgba(52,211,153,0.8)]' : 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.8)]') : 'bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.8)]'} transition-colors duration-500`} />
        
        <CardContent className="p-5 pl-7">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg tracking-tight text-white">Operação {index}</h3>
              {!cycle.completed && <span className="flex h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)] animate-pulse ml-1" />}
            </div>
            
            <div className="flex items-center gap-3">
              <motion.div 
                key={cycle.totalProfit}
                initial={{ scale: 1.2, color: '#fff' }}
                animate={{ scale: 1 }}
                className={`font-mono text-sm font-bold tracking-tight px-3 py-1.5 rounded-full border ${cycle.completed ? (isProfit ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.15)]' : 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]') : 'bg-zinc-800 text-zinc-400 border-white/10'}`}
              >
                {cycle.completed ? (isProfit ? '+' : '') + formatBRL(cycle.totalProfit) : 'Pendente'}
              </motion.div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteCycle(cycle.id)}
                className="text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 h-8 w-8 rounded-full transition-colors"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {cycle.operations.map((op) => (
              <div key={op.id} className="grid grid-cols-[auto_auto_1fr] sm:grid-cols-[auto_1fr_1.2fr] items-center gap-2 sm:gap-3 bg-black/40 border border-white/[0.05] p-3 rounded-2xl relative overflow-hidden hover:bg-white/[0.02] transition-colors">
                <div className="font-black text-sm w-10 flex flex-col gap-1.5 items-start text-zinc-300">
                  <span className="tracking-widest">{op.type}</span>
                  {op.type === 'MAE' && (
                    <motion.div whileTap={{ scale: 0.9 }} className="flex items-center gap-1 mt-1 cursor-pointer group/bau" onClick={() => onUpdateOperation(cycle.id, op.id, { bau: !(op.bau ?? false) })}>
                      <Checkbox
                        id={`bau-${op.id}`}
                        checked={op.bau ?? false}
                        onCheckedChange={(checked) => onUpdateOperation(cycle.id, op.id, { bau: !!checked })}
                        className="pointer-events-none scale-90 border-orange-500/50 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white"
                      />
                      <Label htmlFor={`bau-${op.id}`} className="text-[9px] font-black tracking-widest text-orange-500/80 group-hover/bau:text-orange-400 cursor-pointer select-none transition-colors">
                        BAÚ
                      </Label>
                    </motion.div>
                  )}
                </div>
                
                <div className="flex flex-col border-l border-white/10 pl-2.5 sm:pl-3 pr-1">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Entrada</span>
                  <span className="font-mono text-white text-xs sm:text-sm font-medium">{formatBRL(op.deposit)}</span>
                </div>
                
                <div className="flex flex-col border-l border-white/10 pl-2.5 sm:pl-3">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Saque</span>
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
      className="h-9 px-3 text-right text-sm font-mono font-bold rounded-xl bg-zinc-950 border-white/10 text-white focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-all placeholder:text-zinc-700 w-full shadow-inner"
    />
  );
}