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
        <Card className="liquid-glass-panel border-white/10 shadow-xl rounded-[24px] overflow-hidden group relative h-full flex flex-col">
          <CardContent className="p-0 flex-1 flex flex-col">
            
            {/* Header do Ciclo */}
            <div className="flex justify-between items-center px-4 py-3.5 border-b border-white/5 bg-white/[0.02] dark:bg-black/10">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${cycle.completed ? (isProfit ? 'bg-emerald-400 glass-glow-emerald' : isLoss ? 'bg-rose-400 glass-glow-rose' : 'bg-zinc-400') : 'bg-zinc-400 dark:bg-zinc-500 animate-pulse'}`} />
                <h3 className="font-bold text-sm text-zinc-950 dark:text-zinc-100 flex items-center gap-2 truncate">
                  Ciclo {index}
                  {cycle.createdAt && (
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 shrink-0 bg-white/10 dark:bg-white/5 px-2 py-0.5 rounded-full">
                      {format(parseISO(cycle.createdAt), 'HH:mm')}
                    </span>
                  )}
                </h3>
              </div>
              
              <div className="flex items-center shrink-0 gap-1">
                <span className={`text-xs font-black tracking-tight mr-1 px-2.5 py-0.5 rounded-full ${cycle.completed ? (isProfit ? 'text-emerald-400 bg-emerald-500/10' : isLoss ? 'text-rose-400 bg-rose-500/10' : 'text-zinc-400 bg-white/5') : 'text-zinc-400 bg-zinc-500/10 dark:text-zinc-400 dark:bg-zinc-500/10'}`}>
                  {cycle.completed ? (isProfit ? '+' : '') + formatBRL(cycle.totalProfit) : 'Pendente'}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDuplicateCycle(cycle)}
                  className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/10 h-8 w-8 rounded-full transition-all shrink-0"
                  title="Duplicar Entradas"
                >
                  <CopyPlus size={14} strokeWidth={2.5} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-zinc-400 hover:text-rose-400 hover:bg-white/10 h-8 w-8 rounded-full transition-all shrink-0"
                  title="Excluir Ciclo"
                >
                  <Trash2 size={14} strokeWidth={2.5} />
                </Button>
              </div>
            </div>

            {/* Operações (Mãe e Filha) */}
            <div className="p-3.5 flex-1 flex flex-col justify-center gap-3">
              {cycle.operations.map((op) => {
                const isOpCompleted = op.withdraw !== null;
                const opProfit = op.profit || 0;
                const isOpWin = opProfit > 0;
                const isOpLoss = opProfit < 0;

                return (
                  <div key={op.id} className="p-3 bg-white/[0.02] dark:bg-black/20 border border-white/5 rounded-[18px] transition-all w-full">
                    
                    {/* Linha 1: Título da Operação e Status */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-zinc-700 dark:text-zinc-300 bg-white/10 dark:bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {op.type}
                        </span>
                        {op.type === 'MAE' && (
                          <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onUpdateOperation(cycle.id, op.id, { bau: !(op.bau ?? false) })}>
                            <Checkbox
                              id={`bau-${op.id}`}
                              checked={op.bau ?? false}
                              onCheckedChange={(checked) => onUpdateOperation(cycle.id, op.id, { bau: !!checked })}
                              className="w-3.5 h-3.5 rounded-md shrink-0 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 border-white/20"
                            />
                            <span className="text-[9px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-widest select-none">
                              BAÚ
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Lucro individual */}
                      {isOpCompleted && (
                        <span className={`text-[10px] font-extrabold tracking-tight px-2 py-0.5 rounded-full ${isOpWin ? 'text-emerald-400 bg-emerald-500/10' : isOpLoss ? 'text-rose-400 bg-rose-500/10' : 'text-zinc-400 bg-white/5'}`}>
                          {isOpWin ? '+' : ''}{formatBRL(opProfit)}
                        </span>
                      )}
                    </div>
                    
                    {/* Linha 2: Caixas de Entrada e Saque estilo WWDC25 */}
                    <div className="flex gap-2">
                      
                      {/* Caixa de Entrada */}
                      <div className="flex-1 bg-white/[0.04] dark:bg-black/40 rounded-xl px-2.5 py-1.5 border border-white/5 shadow-inner flex flex-col justify-center">
                        <span className="text-[8px] text-zinc-400/80 dark:text-zinc-500 font-bold uppercase tracking-widest mb-0.5 block">Entrada</span>
                        <CurrencyInput
                          initialValue={op.deposit}
                          onChange={(val) => onUpdateOperation(cycle.id, op.id, { deposit: val || 0 })}
                        />
                      </div>
                      
                      {/* Caixa de Saque */}
                      <div className="flex-[1.1] bg-white/[0.04] dark:bg-black/40 rounded-xl px-2.5 py-1.5 border border-white/5 shadow-inner flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-[8px] text-zinc-400/80 dark:text-zinc-500 font-bold uppercase tracking-widest">Saque</span>
                          
                          {/* Botões de Atalho */}
                          {!isOpCompleted && (
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => onUpdateOperation(cycle.id, op.id, { withdraw: 0 })}
                                className="px-1.5 py-0.5 text-[7.5px] font-black bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 rounded-md transition-colors"
                              >
                                LOSS
                              </button>
                              <button 
                                onClick={() => onUpdateOperation(cycle.id, op.id, { withdraw: op.deposit })}
                                className="px-1.5 py-0.5 text-[7.5px] font-black bg-white/10 hover:bg-white/20 text-zinc-300 rounded-md transition-colors"
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
        <DialogContent className="sm:max-w-xs w-[90vw] rounded-[28px] p-6 bg-[#0c0c14]/90 dark:bg-[#06060c]/95 border border-white/10 shadow-2xl [&>button]:hidden outline-none text-center backdrop-blur-xl">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/15 flex items-center justify-center mb-4 border border-rose-500/20">
            <AlertTriangle className="text-rose-400" size={24} strokeWidth={2} />
          </div>
          <DialogTitle className="text-lg font-bold text-white tracking-tight mb-2">
            Excluir Ciclo?
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm mb-6">
            Você tem certeza que deseja apagar o <strong>Ciclo {index}</strong>? Esta ação não pode ser desfeita.
          </DialogDescription>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowDeleteConfirm(false)} 
              variant="outline" 
              className="flex-1 rounded-xl h-11 border-white/10 bg-transparent text-white hover:bg-white/5 font-semibold"
            >
              Cancelar
            </Button>
            <Button 
              onClick={confirmDelete} 
              className="flex-1 rounded-xl h-11 bg-gradient-to-r from-rose-600 to-pink-500 text-white border-none font-bold shadow-[0_4px_14px_0_rgb(244,63,94,0.3)]"
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
      className="w-full text-left text-[14px] font-black text-zinc-950 dark:text-white bg-transparent outline-none placeholder:text-zinc-500 dark:placeholder:text-zinc-600 truncate transition-colors focus:text-zinc-500 dark:focus:text-zinc-400"
    />
  );
}