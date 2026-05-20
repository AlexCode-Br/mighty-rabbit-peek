import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import { Cycle, Operation } from '../types';
import { formatBRL, parseBRL } from '../utils/currency';
import { Checkbox } from './ui/checkbox';

interface CycleCardProps {
  index: number;
  cycle: Cycle;
  onUpdateOperation: (cycleId: string, operationId: string, updates: Partial<Operation>) => void;
  onDeleteCycle: (cycleId: string) => void;
}

export function CycleCard({ index, cycle, onUpdateOperation, onDeleteCycle }: CycleCardProps) {
  const isProfit = cycle.totalProfit >= 0;

  return (
    <Card className="shadow-xl border border-white/5 bg-zinc-900/80 backdrop-blur-md rounded-3xl mb-4 overflow-hidden relative group">
      <div className={`absolute top-0 left-0 w-1.5 h-full ${cycle.completed ? (isProfit ? 'bg-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]') : 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]'} transition-colors`} />
      
      <CardContent className="p-5 pl-7">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-lg tracking-tight text-white">Operação {index}</h3>
            {!cycle.completed && <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse ml-1" />}
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`font-mono text-sm font-bold tracking-tight px-3 py-1 rounded-full border ${cycle.completed ? (isProfit ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20') : 'bg-zinc-800 text-zinc-400 border-white/5'}`}>
              {cycle.completed ? (isProfit ? '+' : '') + formatBRL(cycle.totalProfit) : 'Pendente'}
            </div>
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
            <div key={op.id} className="grid grid-cols-[auto_auto_1fr] sm:grid-cols-[auto_1fr_1.2fr] items-center gap-2 sm:gap-3 bg-black/40 border border-white/[0.03] p-3 rounded-2xl relative overflow-hidden group-hover:border-white/[0.06] transition-colors">
              <div className="font-black text-sm w-10 flex flex-col gap-1.5 items-start text-zinc-300">
                <span className="tracking-widest">{op.type}</span>
                {op.type === 'MAE' && (
                  <div className="flex items-center gap-1 mt-1 cursor-pointer group/bau" onClick={() => onUpdateOperation(cycle.id, op.id, { bau: !(op.bau ?? false) })}>
                    <Checkbox
                      id={`bau-${op.id}`}
                      checked={op.bau ?? false}
                      onCheckedChange={(checked) => onUpdateOperation(cycle.id, op.id, { bau: !!checked })}
                      className="pointer-events-none scale-90"
                    />
                    <Label htmlFor={`bau-${op.id}`} className="text-[9px] font-black tracking-widest text-orange-500/80 group-hover/bau:text-orange-400 cursor-pointer select-none transition-colors">
                      BAÚ
                    </Label>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col border-l border-white/5 pl-2.5 sm:pl-3 pr-1">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Entrada</span>
                <span className="font-mono text-white text-xs sm:text-sm font-medium">{formatBRL(op.deposit)}</span>
              </div>
              
              <div className="flex flex-col border-l border-white/5 pl-2.5 sm:pl-3">
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
  );
}

// Separate component to handle currency input cleanly
function CurrencyInput({ initialValue, onChange }: { initialValue: number | null, onChange: (val: number | null) => void }) {
  const [inputValue, setInputValue] = useState(initialValue !== null ? formatBRL(initialValue) : '');

  useEffect(() => {
    if (initialValue !== null && inputValue !== formatBRL(initialValue)) {
      setInputValue(formatBRL(initialValue));
    }
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Extrai apenas os números
    const digits = rawValue.replace(/\D/g, '');
    
    if (!digits) {
      setInputValue('');
      onChange(null);
      return;
    }

    // Converte os dígitos em um valor numérico (divide por 100 para criar os centavos)
    const numValue = parseInt(digits, 10) / 100;
    
    setInputValue(formatBRL(numValue));
    onChange(numValue);
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      placeholder="R$ 0,00"
      value={inputValue}
      onChange={handleChange}
      className="h-8 px-2 sm:px-3 text-right text-xs sm:text-sm font-mono font-medium rounded-lg bg-zinc-900 border-white/10 text-white focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500/50 transition-all placeholder:text-zinc-600 w-full"
    />
  );
}
