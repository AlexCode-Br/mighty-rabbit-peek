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
    <Card className="shadow-sm border-none bg-white dark:bg-zinc-900 rounded-2xl mb-4 overflow-hidden relative group">
      <div className={`absolute top-0 left-0 w-1.5 h-full ${cycle.completed ? (isProfit ? 'bg-green-500' : 'bg-red-500') : 'bg-orange-500'}`} />
      
      <CardContent className="p-4 pl-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-orange-500">Ciclo {index}</h3>
          
          <div className="flex items-center gap-3">
            <div className={`font-bold ${cycle.completed ? (isProfit ? 'text-green-500' : 'text-red-500') : 'text-muted-foreground'}`}>
              {cycle.completed ? (isProfit ? '+' : '') + formatBRL(cycle.totalProfit) : 'Pendente'}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDeleteCycle(cycle.id)}
              className="text-muted-foreground hover:text-red-500 h-8 w-8 rounded-full"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {cycle.operations.map((op) => (
            <div key={op.id} className="grid grid-cols-[auto_1fr_1fr] items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
              <div className="font-semibold text-sm w-12 flex flex-col gap-1 items-start">
                <span>{op.type}</span>
                {op.type === 'MAE' && (
                  <div className="flex items-center gap-1 mt-1">
                    <Checkbox
                      id={`bau-${op.id}`}
                      checked={op.bau ?? false}
                      onCheckedChange={(checked) => onUpdateOperation(cycle.id, op.id, { bau: !!checked })}
                      className="h-3 w-3 rounded-[3px]"
                    />
                    <Label htmlFor={`bau-${op.id}`} className="text-[9px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                      Baú
                    </Label>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Entrada</span>
                <span className="font-medium">{formatBRL(op.deposit)}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Saque</span>
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
      className="h-8 text-right font-medium rounded-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
    />
  );
}
