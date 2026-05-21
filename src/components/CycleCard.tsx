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
        <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-md bg-white dark:bg-zinc-900 rounded-[24px] overflow-hidden group relative h-full flex flex-col">
          <CardContent className="p-0 flex-1 flex flex-col">
            
            {/* Header do Ciclo */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-800/10">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${cycle.completed ? (isProfit ? 'bg-emerald-500' : isLoss ? 'bg-rose-500' : 'bg-zinc-300 dark:bg-zinc-700') : 'bg-blue-500 animate-pulse'}`} />
                <h3 className="font-bold text-[14px] text-zinc-900 dark:text-zinc-100 flex items-center gap-2 truncate">
                  Ciclo {index}
                  {cycle.createdAt && (
                    <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 shrink-0 hidden xs:inline bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">
                      {format(parseISO(cycle.createdAt), 'HH:mm')}
                    </span>
                  )}
                </h3>
              </div>
              
              <div className="flex items-center shrink-0 gap-1">
                <span className={`text-[13px] sm:text-sm font-bold tracking-tight mr-2 px-2 py-0.5 rounded-md ${cycle.completed ? (isProfit ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10' : isLoss ? 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10' : 'text-zinc-500 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-800') : 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10'}`}>
                  {cycle.completed ? (isProfit ? '+' : '') + formatBRL(cycle.totalProfit) : 'Em Andamento'}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDuplicateCycle(cycle)}
                  className="text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 h-7 w-7 rounded-full transition-colors shrink-0"
                  title="Duplicar Entradas"
                >
                  <CopyPlus size={14} strokeWidth={2.5} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 h-7 w-7 rounded-full transition-colors shrink-0 -mr-1.5"
                  title="Excluir Ciclo"
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
                  <div key={op.id} className="p-3 bg-zinc-50/80 dark:bg-zinc-800/20 border border-zinc-200/50 dark:border-zinc-800/60 rounded-[18px] transition-colors w-full">
                    
                    {/* Linha 1: Título da Operação e Status */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-extrabold text-zinc-700 dark:text-zinc-300 bg-zinc-200/60 dark:bg-zinc-700/60 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {op.type}
                        </span>
                        {op.type === 'MAE' && (
                          <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onUpdateOperation(cycle.id, op.id, { bau: !(op.bau ?? false) })}>
                            <Checkbox
                              id={`bau-${op.id}`}
                              checked={op.bau ?? false}
                              onCheckedChange={(checked) => onUpdateOperation(cycle.id, op.id, { bau: !!checked })}
                              className="w-3.5 h-3.5 rounded-[4px] shrink-0 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                            />
                            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest select-none">
                              BAÚ
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Lucro individual da operação (mostra apenas se finalizada) */}
                      {isOpCompleted && (
                        <span className={`text-[11px] font-bold tracking-tight px-2 py-0.5 rounded-md ${isOpWin ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10' : isOpLoss ? 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10' : 'text-zinc-500 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-800'}`}>
                          {isOpWin ? '+' : ''}{formatBRL(opProfit)}
                        </span>
                      )}
                    </div>
                    
                    {/* Linha 2: Caixas de Entrada e Saque */}
                    <div className="flex gap-2.5">
                      
                      {/* Caixa de Entrada */}
                      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-xl p-2.5 border border-zinc-200/70 dark:border-zinc-700/50 shadow-sm flex flex-col justify-center">
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider mb-1">Entrada</span>
                        <CurrencyInput
                          initialValue={op.deposit}
                          onChange={(val) => onUpdateOperation(cycle.id, op.id, { deposit: val || 0 })}
                        />
                      </div>
                      
                      {/* Caixa de Saque */}
                      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-xl p-2.5 border border-zinc-200/70 dark:border-zinc-700/50 shadow-sm flex flex-col justify-center relative">
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider mb-1">Saque</span>
                        <CurrencyInput
                          initialValue={op.withdraw}
                          onChange={(val) => onUpdateOperation(cycle.id, op.id, { withdraw: val })}
                        />
                        
                        {/* Botões de Atalho (Aparecem apenas se não finalizado) */}
                        {!isOpCompleted && (
                          <div className="flex items-center gap-1.5 mt-2.5">
                            <button 
                              onClick={() => onUpdateOperation(cycle.id, op.id, { withdraw: 0 })}
                              className="flex-1 text-[10px] font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 py-1.5 rounded-lg border border-rose-100 dark:border-rose-500/20 active:scale-95 transition-all shadow-sm"
                            >
                              Loss
                            </button>
                            <button 
                              onClick={() => onUpdateOperation(cycle.id, op.id, { withdraw: op.deposit })}
                              className="flex-1 text-[10px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 active:scale-95 transition-all shadow-sm"
                            >
                              = Ent
                            </button>
                          </div>
                        )}
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
      className="w-full text-left text-[15px] font-black text-zinc-900 dark:text-zinc-100 bg-transparent outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600 truncate transition-colors focus:text-blue-600 dark:focus:text-blue-400"
    />
  );
}