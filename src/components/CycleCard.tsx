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
        <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-900 rounded-[20px] overflow-hidden group relative h-full flex flex-col">
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="flex justify-between items-center px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800/50">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <div className={`w-2 h-2 rounded-full shrink-0 ${cycle.completed ? (isProfit ? 'bg-emerald-500' : isLoss ? 'bg-rose-500' : 'bg-zinc-300 dark:bg-zinc-700') : 'bg-zinc-900 dark:bg-zinc-100 animate-pulse'}`} />
                <h3 className="font-semibold text-[13px] sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 truncate">
                  Ciclo {index}
                  {cycle.createdAt && (
                    <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 shrink-0 hidden xs:inline">
                      • {format(parseISO(cycle.createdAt), 'HH:mm')}
                    </span>
                  )}
                </h3>
              </div>
              
              <div className="flex items-center shrink-0 gap-1">
                <span className={`text-[13px] sm:text-sm font-semibold tracking-tight mr-1 ${cycle.completed ? (isProfit ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-zinc-400 dark:text-zinc-500') : 'text-zinc-400 dark:text-zinc-500'}`}>
                  {cycle.completed ? (isProfit ? '+' : '') + formatBRL(cycle.totalProfit) : 'Pendente'}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDuplicateCycle(cycle)}
                  className="text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 h-7 w-7 rounded-full transition-colors shrink-0"
                  title="Duplicar Entradas"
                >
                  <CopyPlus size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 h-7 w-7 rounded-full transition-colors shrink-0 -mr-1.5"
                  title="Excluir Ciclo"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>

            <div className="p-1.5 space-y-0.5 flex-1 flex flex-col justify-center">
              {cycle.operations.map((op) => {
                const isOpCompleted = op.withdraw !== null;
                const opProfit = op.profit || 0;
                const isOpWin = opProfit > 0;
                const isOpLoss = opProfit < 0;

                return (
                  <div key={op.id} className="flex items-start justify-between px-2 sm:px-3 py-2.5 rounded-[14px] hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors w-full gap-2">
                    
                    {/* Coluna 1: Tipo */}
                    <div className="flex items-center shrink-0 w-[22%] sm:w-[25%] pt-0.5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] sm:text-[11px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">{op.type}</span>
                        {op.type === 'MAE' && (
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => onUpdateOperation(cycle.id, op.id, { bau: !(op.bau ?? false) })}>
                            <Checkbox
                              id={`bau-${op.id}`}
                              checked={op.bau ?? false}
                              onCheckedChange={(checked) => onUpdateOperation(cycle.id, op.id, { bau: !!checked })}
                              className="w-3 h-3 rounded-[3px] shrink-0"
                            />
                            <span className="text-[8px] sm:text-[9px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest select-none">
                              BAÚ
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Coluna 2: Entrada */}
                    <div className="flex flex-col w-[36%] sm:w-[35%] min-w-0">
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium mb-0.5 text-right truncate">Entrada</span>
                      <CurrencyInput
                        initialValue={op.deposit}
                        onChange={(val) => onUpdateOperation(cycle.id, op.id, { deposit: val || 0 })}
                      />
                    </div>
                    
                    {/* Coluna 3: Saque */}
                    <div className="flex flex-col w-[42%] sm:w-[40%] relative min-w-0">
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium mb-0.5 text-right truncate">Saque</span>
                      <CurrencyInput
                        initialValue={op.withdraw}
                        onChange={(val) => onUpdateOperation(cycle.id, op.id, { withdraw: val })}
                      />
                      
                      {!isOpCompleted ? (
                        <div className="flex items-center justify-end gap-1 mt-1.5">
                          <button 
                            onClick={() => onUpdateOperation(cycle.id, op.id, { withdraw: 0 })}
                            className="text-[9px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1.5 py-1 rounded border border-rose-100 dark:border-rose-500/20 active:scale-95 transition-all shadow-sm leading-none shrink-0"
                            title="Loss (R$ 0)"
                          >
                            R$ 0
                          </button>
                          <button 
                            onClick={() => onUpdateOperation(cycle.id, op.id, { withdraw: op.deposit })}
                            className="text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-1.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 active:scale-95 transition-all shadow-sm leading-none shrink-0"
                            title="Empate (Retorno da Entrada)"
                          >
                            = Ent
                          </button>
                        </div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`text-right mt-1.5 text-[10px] font-bold tracking-wider truncate ${isOpWin ? 'text-emerald-500' : isOpLoss ? 'text-rose-500' : 'text-zinc-400 dark:text-zinc-500'}`}
                        >
                          {isOpWin ? '+' : ''}{formatBRL(opProfit)}
                        </motion.div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-xs w-[90vw] rounded-[32px] p-6 bg-white dark:bg-zinc-900 border-none shadow-2xl [&>button]:hidden outline-none text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="text-rose-500" size={24} strokeWidth={2} />
          </div>
          <DialogTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">
            Excluir Ciclo?
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
            Você tem certeza que deseja apagar o <strong>Ciclo {index}</strong>? Esta ação não pode ser desfeita.
          </DialogDescription>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowDeleteConfirm(false)} 
              variant="outline" 
              className="flex-1 rounded-2xl h-12 border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 font-medium"
            >
              Cancelar
            </Button>
            <Button 
              onClick={confirmDelete} 
              className="flex-1 rounded-2xl h-12 bg-rose-500 hover:bg-rose-600 text-white border-none font-medium shadow-[0_4px_14px_0_rgb(244,63,94,0.3)]"
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
      className="w-full text-right text-[13px] sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 bg-transparent outline-none border-b border-transparent focus:border-zinc-300 dark:focus:border-zinc-600 transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-600 py-0.5 min-w-0"
    />
  );
}