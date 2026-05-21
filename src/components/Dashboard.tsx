import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Settings } from 'lucide-react';
import { formatBRL } from '../utils/currency';
import { motion } from 'framer-motion';

interface DashboardProps {
  dailyProfit: number;
  dailyGoal: number;
  stopLoss: number;
  onOpenSettings: () => void;
}

export function Dashboard({ 
  dailyProfit, 
  dailyGoal, 
  stopLoss, 
  onOpenSettings 
}: DashboardProps) {
  const isProfit = dailyProfit >= 0;
  const isNeutral = dailyProfit === 0;
  
  const isGoalReached = isProfit && dailyGoal > 0 && dailyProfit >= dailyGoal;
  const isStopLossReached = !isProfit && stopLoss > 0 && Math.abs(dailyProfit) >= stopLoss;
  
  let progress = 0;
  let progressColorClass = 'bg-gradient-to-r from-zinc-700 to-zinc-200 dark:from-zinc-800 dark:to-zinc-200';
  let progressGlow = 'none';
  
  if (isProfit && dailyGoal > 0) {
    progress = Math.min((dailyProfit / dailyGoal) * 100, 100);
    progressColorClass = 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400';
    progressGlow = '0 0 20px rgba(52, 211, 153, 0.4)';
  } else if (!isProfit && stopLoss > 0) {
    progress = Math.min((Math.abs(dailyProfit) / stopLoss) * 100, 100);
    progressColorClass = 'bg-gradient-to-r from-rose-600 via-pink-500 to-red-400';
    progressGlow = '0 0 20px rgba(244, 63, 94, 0.4)';
  }

  return (
    <div className="space-y-4">
      {/* CARD PRINCIPAL (LUCRO DIÁRIO) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <Card className="liquid-glass-panel rounded-[28px] overflow-hidden border border-white/10 shadow-2xl relative">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-[10px] font-bold text-zinc-400/80 dark:text-zinc-400/60 uppercase tracking-widest">Resultado Diário</p>
                  {isGoalReached && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[9px] font-extrabold uppercase tracking-wider border border-emerald-500/20 backdrop-blur-md">
                      Meta Batida 🎉
                    </span>
                  )}
                  {isStopLossReached && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-[9px] font-extrabold uppercase tracking-wider border border-rose-500/20 backdrop-blur-md">
                      Stop Loss ⚠️
                    </span>
                  )}
                </div>
                <motion.h2 
                  key={dailyProfit}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 120, damping: 14 }}
                  className={`text-4xl tracking-tighter font-black ${
                    isNeutral ? 'text-zinc-950 dark:text-zinc-100' :
                    isProfit ? 'text-emerald-400 drop-shadow-[0_4px_12px_rgba(52,211,153,0.15)]' : 'text-rose-400 drop-shadow-[0_4px_12px_rgba(244,63,94,0.15)]'
                  }`}
                >
                  {isProfit && !isNeutral ? '+' : ''}{formatBRL(dailyProfit)}
                </motion.h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenSettings}
                className="text-zinc-400/80 hover:text-zinc-950 dark:hover:text-white hover:bg-white/10 dark:hover:bg-white/5 rounded-full h-9 w-9 transition-all duration-300 hover:rotate-45 hover:scale-110 active:scale-95 -mr-2 -mt-2 shrink-0 border border-transparent hover:border-white/5"
              >
                <Settings size={18} strokeWidth={2.5} />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-3xl font-black tracking-tight text-zinc-950 dark:text-zinc-100">
                  {progress.toFixed(0)}<span className="text-sm font-semibold text-zinc-400/70">%</span>
                </span>
                <span className="text-[10px] font-bold text-zinc-400/60 uppercase tracking-widest mb-1.5">
                  {isProfit ? 'da Meta' : 'do Stop'}
                </span>
              </div>
              
              <div className="relative h-2.5 w-full bg-zinc-950/20 dark:bg-black/40 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className={`absolute top-0 left-0 h-full ${progressColorClass} rounded-full`}
                  style={{ boxShadow: progressGlow }}
                />
              </div>
              
              <div className="flex justify-between text-[10px] font-bold text-zinc-500/80 dark:text-zinc-400/50 uppercase tracking-widest pt-1.5 border-t border-white/5">
                <span>Stop: <strong className="text-zinc-950 dark:text-zinc-300">{formatBRL(stopLoss)}</strong></span>
                <span>Meta: <strong className="text-zinc-950 dark:text-zinc-300">{formatBRL(dailyGoal)}</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}