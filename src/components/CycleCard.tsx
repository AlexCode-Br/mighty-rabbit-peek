"use client";

import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Trash2, AlertTriangle, CopyPlus } from 'lucide-react';
import { Cycle, Operation } from '../types';
import { formatBRL } from '../utils/currency';
import { Checkbox } from './ui/checkbox';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { CurrencyInput } from './CurrencyInput';

interface CycleCardProps {
  index: number;
  cycle: Cycle;
  onUpdateOperation: (cycleId: string, operationId: string, updates: Partial<Operation>) => void;
  onDeleteCycle: (cycleId: string) => void;
  onDuplicateCycle: (cycle: Cycle) => void;
  className?: string;
}

export const CycleCard = React.memo(({ index, cycle, onUpdateOperation, onDeleteCycle, onDuplicateCycle, className }: CycleCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isProfit = cycle.totalProfit > 0;
  const isLoss = cycle.totalProfit < 0;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
        className={className}
      >
        <Card className="liquid-glass-panel border-white/20 dark:border-white/10 shadow-xl rounded-[24px] overflow-hidden flex flex-col h-full">
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="flex justify-between items-center px-4 py-3.5 border-b dark:border-white/5 bg-white/[0.02] dark:bg-black/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${cycle.completed ? (isProfit ? 'bg-emerald-500' : isLoss ? 'bg-rose-500' : 'bg-zinc-400') : 'bg-zinc-400 animate-pulse'}`} />
                <h3 className="font-bold text-sm text-zinc-950 dark:text-zinc-100 flex items-center gap-2 truncate">
                  Ciclo {index}
                  {cycle.createdAt && <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{format(parseISO(cycle.createdAt), 'HH:mm')}</span>}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${cycle.completed ? (isProfit ? 'text-emerald-600 bg-emerald-500/10' : isLoss ? 'text-rose-600 bg-rose-500/10' : 'text-zinc-500') : 'text-zinc-400'}`}>
                  {cycle.completed ? (isProfit ? '+' : '') + formatBRL(cycle.totalProfit) : 'Pendente'}
                </span>
                <Button variant="ghost" size="icon" onClick={() => onDuplicateCycle(cycle)} className="h-8 w-8 rounded-full"><CopyPlus size={14} /></Button>
                <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm(true)} className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-500"><Trash2 size={14} /></Button>
              </div>
            </div>

            <div className="p-3.5 flex-1 flex flex-col justify-center gap-3">
              {cycle.operations.map((op) => (
                <div key={op.id} className="p-3 bg-white/50 dark:bg-black/20 border dark:border-white/5 rounded-[18px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-300 bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-wider">{op.type}</span>
                    {op.type === 'MAE' && (
                      <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => onUpdateOperation(cycle.id, op.id, { bau: !(op.bau ?? false) })}>
                        <Checkbox checked={op.bau ?? false} className="w-3.5 h-3.5 rounded-md" />
                        <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">BAÚ</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-zinc-50 dark:bg-black/40 rounded-xl px-2.5 py-1.5 border dark:border-white/5 shadow-inner">
                      <span className="text-[8px] text-zinc-500 font-bold uppercase block">Entrada</span>
                      <CurrencyInput initialValue={op.deposit} onChange={(val) => onUpdateOperation(cycle.id, op.id, { deposit: val || 0 })} />
                    </div>
                    <div className="flex-[1.1] bg-zinc-50 dark:bg-black/40 rounded-xl px-2.5 py-1.5 border dark:border-white/5 shadow-inner">
                      <div className="flex justify-between items-center"><span className="text-[8px] text-zinc-500 font-bold uppercase">Saque</span></div>
                      <CurrencyInput initialValue={op.withdraw} onChange={(val) => onUpdateOperation(cycle.id, op.id, { withdraw: val })} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-xs w-[90vw] rounded-[28px] p-6 bg-white dark:bg-[#06060c]/95 border border-zinc-200 dark:border-white/10 shadow-2xl text-center outline-none">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4"><AlertTriangle className="text-rose-500" size={24} /></div>
          <DialogTitle className="text-lg font-bold">Excluir Ciclo?</DialogTitle>
          <DialogDescription className="text-zinc-500 text-sm mb-6">Deseja apagar o Ciclo {index}? Esta ação é irreversível.</DialogDescription>
          <div className="flex gap-3">
            <Button onClick={() => setShowDeleteConfirm(false)} variant="outline" className="flex-1 rounded-xl">Cancelar</Button>
            <Button onClick={() => { setShowDeleteConfirm(false); onDeleteCycle(cycle.id); }} className="flex-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white">Excluir</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

CycleCard.displayName = 'CycleCard';