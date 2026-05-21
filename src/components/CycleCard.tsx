import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Trash2, AlertTriangle, CopyPlus } from 'lucide-react';
import { Cycle, Operation } from '../types';
import { formatBRL } from '../utils/currency';
import { Checkbox } from './ui/checkbox';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

interface CycleCardProps {
  index: number;
  cycle: Cycle;
  onUpdateOperation: (cycleId: string, operationId: string, updates: Partial<Operation>) => void;
  onDeleteCycle: (cycleId: string) => void;
  onDuplicateCycle: (cycle: Cycle) => void;
  className?: string;
}

export function CycleCard({ index, cycle, onUpdateOperation, onDeleteCycle, onDuplicateCycle, className }: CycleCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isProfit = cycle.totalProfit > 0;
  const isLoss = cycle.totalProfit < 0;

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    onDeleteCycle(cycle.id);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)", transition: { duration: 0.2 } }}
        transition={{ type: "spring", stiffness: 500, damping: 40 }}
        className={className}
      >
        <Card className="liquid-glass border-none rounded-[28px] overflow-hidden group relative h-full flex flex-col">
          <CardContent className="p-0 flex-1 flex flex-col">
            
            {/* Header do Ciclo */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${cycle.completed ? (isProfit ? 'bg-emerald-500 shadow-emerald-500/50' : isLoss ? 'bg-rose-500 shadow-rose-500/50' : 'bg-zinc-400') : 'bg-blue-500 animate-pulse shadow-blue-500/50'}`} />
                <h3 className="font-bold text-[14px] text-zinc-900 dark:text-zinc-100 flex items-center gap-2 truncate">
                  Ciclo {index}
                  {cycle.createdAt && (
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 shrink-0 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-lg">
                      {format(parseISO(cycle.createdAt), 'HH:mm')}
                    </span>
                  )}
                </h3>
              </div>
              
              <div className="flex items-center shrink-0 gap-1">
                <span className={`text-[12px] font-bold tracking-tight px-2.5 py-1 rounded-xl ${cycle.completed ? (isProfit ? 'text-emerald-600 bg-emerald-500/10' : isLoss ? 'text-rose-600 bg-rose-500/10' : 'text-zinc-500 bg-black/5 dark:bg-white/5') : 'text-blue-600 bg-blue-500/10'}`}>
                  {cycle.completed ? (isProfit ? '+' : '') + formatBRL(cycle.totalProfit) : 'Pendente'}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDuplicateCycle(cycle)}
                  className="text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 h-8 w-8 rounded-full transition-colors shrink-0"
                >
                  <CopyPlus size={14} strokeWidth={2.5} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 h-8 w-8 rounded-full transition-colors shrink-0"
                >
                  <Trash2 size={14} strokeWidth={2.5} />
                </Button>
              </div>
            </div>

            {/* Operações (Mãe e Filha) */}
            <div className="p-3 flex-1 flex flex-col justify-center gap-3">
              {cycle.operations.map((op) => {
                const isOpCompleted = op.withdraw !== null;
                const opProfit = op.profit || 0;
                const isOpWin = opProfit > 0;
                const isOpLoss = opProfit < 0;

                return (
                  <div key={op.id} className="p-3 bg-black/[0.015] dark:bg-white/[0.015] border border-black/5 dark:border-white/5 rounded-[20px] transition-colors w-full">
                    
                    {/* Linha 1: Título da Operação e Status */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-zinc-800 dark:text-zinc-200 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-lg uppercase tracking-widest">
                          {op.type}
                        </span>
                        {op.type === 'MAE' && (
                          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onUpdateOperation(cycle.id, op.id, { bau: !(op.bau ?? false) })}>
                            <Checkbox
                              id={`bau-${op.id}`}
                              checked={op.bau ?? false}
                              onCheckedChange={(checked) => onUpdateOperation(cycle.id, op.id, { bau: !!checked })}
                              className="w-3.5 h-3.5 rounded-lg shrink-0 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                            />
                            <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest select-none">
                              BAÚ
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Lucro individual */}
                      {isOpCompleted && (
                        <span className={`text-[11px] font-bold tracking-tight px-2 py-0.5 rounded-lg ${isOpWin ? 'text-emerald-600 bg-emerald-500/10' : isOpLoss ? 'text-rose-600 bg-rose-500/10' : 'text-zinc-500 bg-black/5 dark:bg-white/5'}`}>
                          {isOpWin ? '+' : ''}{formatBRL(opProfit)}
                        </span>
                      )}
                    </div>
                    
                    {/* Linha 2: Caixas de Entrada e Saque */}
                    <div className="flex gap-2">
                      
                      {/* Caixa de Entrada */}
                      <div className="flex-1 bg-white dark:bg-zinc-950 rounded-[16px] px-3 py-2 border border-black/5 dark:border-white/5 shadow-sm flex flex-col justify-center">
                        <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-[0.1em] mb-0.5 block">Entrada</span>
                        <CurrencyInput
                          initialValue={op.deposit}
                          onChange={(val) => onUpdateOperation(cycle.id, op.id, { deposit: val || 0 })}
                        />
                      </div>
                      
                      {/* Caixa de Saque */}
                      <div className="flex-[1.2] bg-white dark:bg-zinc-950 rounded-[16px] px-3 py-2 border border-black/5 dark:border-white/5 shadow-sm flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-[0.1em]">Saque</span>
                          
                          {/* Botões de Atalho */}
                          {!isOpCompleted && (
                            <div className="flex items-center gap-1.5">
                              <button 
                                onClick={() => onUpdateOperation(cycle.id, op.id, { withdraw: 0 })}
                                className="px-2 py-0.5 text-[8px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg transition-colors"
                              >
                                LOSS
                              </button>
                              <button 
                                onClick={() => onUpdateOperation(cycle.id, op.id, { withdraw: op.deposit })}
                                className="px-2 py-0.5 text-[8px] font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300 rounded-lg transition-colors"
                              >
                                = ENT
                              </button>
                            </div>
                          )}
                        </div>
                        <CurrencyInput
                          initialValue={op.withdraw}
                          onChange={(val) => onUpdateOperation(cycle.id, op.id, { withdraw: val })}
                        />
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="liquid-glass border-none sm:max-w-xs w-[90vw] rounded-[32px] p-8 text-center outline-none">
          <div className="mx-auto w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mb-5">
            <AlertTriangle className="text-rose-500" size={28} strokeWidth={2} />
          </div>
          <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">
            Excluir Ciclo?
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 leading-relaxed">
            Você tem certeza que deseja apagar o <strong>Ciclo {index}</strong>? Esta ação não pode ser desfeita.
          </DialogDescription>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowDeleteConfirm(false)} 
              variant="outline" 
              className="flex-1 rounded-2xl h-12 border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 font-bold"
            >
              Cancelar
            </Button>
            <Button 
              onClick={confirmDelete} 
              className="flex-1 rounded-2xl h-12 bg-rose-500 hover:bg-rose-600 text-white border-none font-bold shadow-xl shadow-rose-500/20"
            >
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CurrencyInput({ initialValue, onChange }: { initialValue: number | null, onChange: (val: number | null) => void }) {
  const formatIntegerBRL = (val: number) => `R$ ${val.toLocaleString('pt-BR')}`;
  const [inputValue, setInputValue] = useState(initialValue !== null ? formatIntegerBRL(initialValue) : '');

  useEffect(() => {
    if (initialValue !== null && inputValue !== formatIntegerBRL(initialValue)) {
      setInputValue(formatIntegerBRL(initialValue));
    } else if (initialValue === null) {
      setInputValue('');
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
      className="w-full text-left text-[16px] font-black text-zinc-900 dark:text-zinc-100 bg-transparent outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600 truncate transition-colors focus:text-blue-600 dark:focus:text-blue-400"
    />
  );
}