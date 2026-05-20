import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Settings, Plus } from 'lucide-react';
import { formatBRL } from '../utils/currency';
import { motion } from 'framer-motion';

interface DashboardProps {
  dailyProfit: number;
  dailyGoal: number;
  stopLoss: number;
  cyclesCount: number;
  onNewCycle: () => void;
  onOpenSettings: () => void;
}

export function Dashboard({ dailyProfit, dailyGoal, stopLoss, cyclesCount, onNewCycle, onOpenSettings }: DashboardProps) {
  const isProfit = dailyProfit >= 0;
  const isNeutral = dailyProfit === 0;
  
  let progress = 0;
  let progressColorClass = 'bg-zinc-900 dark:bg-zinc-100';
  
  if (isProfit && dailyGoal > 0) {
    progress = Math.min((dailyProfit / dailyGoal) * 100, 100);
    progressColorClass = 'bg-emerald-500';
  } else if (!isProfit && stopLoss > 0) {
    progress = Math.min((Math.abs(dailyProfit) / stopLoss) * 100, 100);
    progressColorClass = 'bg-rose-500';
  }

  return (
    <div className="space-y-3">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <Card className="border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 rounded-[28px] overflow-hidden shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-5">
              <div>
                <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Resultado Diário</p>
                <motion.h2 
                  key={dailyProfit}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`text-4xl tracking-tighter font-semibold ${
                    isNeutral ? 'text-zinc-900 dark:text-zinc-100' :
                    isProfit ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {isProfit && !isNeutral ? '+' : ''}{formatBRL(dailyProfit)}
                </motion.h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenSettings}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full h-9 w-9 transition-colors -mr-2 -mt-2"
              >
                <Settings size={18} strokeWidth={2} />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {progress.toFixed(0)}<span className="text-sm text-zinc-400 dark:text-zinc-500">%</span>
                </span>
                <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mb-1">
                  {isProfit ? 'da Meta' : 'do Stop'}
                </span>
              </div>
              
              <div className="relative h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                  className={`absolute top-0 left-0 h-full ${progressColorClass} rounded-full`}
                />
              </div>
              
              <div className="flex justify-between text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pt-1">
                <span>Stop: {formatBRL(stopLoss)}</span>
                <span>Meta: {formatBRL(dailyGoal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex gap-3">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1"
        >
          <Button
            onClick={onNewCycle}
            className="w-full h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] dark:shadow-[0_4px_14px_0_rgb(255,255,255,0.05)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-medium border-none"
          >
            <Plus size={18} /> Novo Ciclo
          </Button>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-20 shrink-0"
        >
          <div className="w-full h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col items-center justify-center shadow-sm">
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-none mb-0.5">{cyclesCount}</span>
            <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Ciclos</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}