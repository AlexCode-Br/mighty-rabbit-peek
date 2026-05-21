import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Settings, Plus, TrendingUp } from 'lucide-react';
import { formatBRL } from '../utils/currency';
import { motion } from 'framer-motion';

interface DashboardProps {
  dailyProfit: number;
  dailyGoal: number;
  stopLoss: number;
  cyclesCount: number;
  todayWins: number;
  todayLosses: number;
  weeklyProfit: number;
  weeklyWinRate: number;
  onNewCycle: () => void;
  onOpenSettings: () => void;
}

export function Dashboard({ 
  dailyProfit, 
  dailyGoal, 
  stopLoss, 
  cyclesCount, 
  todayWins,
  todayLosses,
  weeklyProfit, 
  weeklyWinRate, 
  onNewCycle, 
  onOpenSettings 
}: DashboardProps) {
  const isProfit = dailyProfit >= 0;
  const isNeutral = dailyProfit === 0;
  
  const isGoalReached = isProfit && dailyGoal > 0 && dailyProfit >= dailyGoal;
  const isStopLossReached = !isProfit && stopLoss > 0 && Math.abs(dailyProfit) >= stopLoss;
  
  let progress = 0;
  let progressColorClass = 'bg-zinc-900 dark:bg-zinc-100';
  
  if (isProfit && dailyGoal > 0) {
    progress = Math.min((dailyProfit / dailyGoal) * 100, 100);
    progressColorClass = 'bg-emerald-500';
  } else if (!isProfit && stopLoss > 0) {
    progress = Math.min((Math.abs(dailyProfit) / stopLoss) * 100, 100);
    progressColorClass = 'bg-rose-500';
  }

  const isWeeklyProfit = weeklyProfit > 0;
  const isWeeklyLoss = weeklyProfit < 0;
  const weeklyIconBg = isWeeklyProfit ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' : isWeeklyLoss ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400';
  const weeklyTextClass = isWeeklyProfit ? 'text-emerald-500' : isWeeklyLoss ? 'text-rose-500' : 'text-zinc-900 dark:text-zinc-100';

  return (
    <div className="space-y-4">
      {/* CARD PRINCIPAL (LUCRO DIÁRIO) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <Card className="border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 rounded-[28px] overflow-hidden shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Resultado Diário</p>
                  {isGoalReached && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/20">
                      Meta Batida 🎉
                    </span>
                  )}
                  {isStopLossReached && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[9px] font-bold uppercase tracking-wider border border-rose-200 dark:border-rose-500/20">
                      Stop Loss ⚠️
                    </span>
                  )}
                </div>
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
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full h-9 w-9 transition-colors -mr-2 -mt-2 shrink-0"
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

      {/* ESTATÍSTICAS RÁPIDAS DO DIA */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-3 gap-2"
      >
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[20px] p-3 flex flex-col items-center justify-center shadow-sm">
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-none mb-1">{cyclesCount}</span>
          <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-center">Operações</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[20px] p-3 flex flex-col items-center justify-center shadow-sm">
          <span className="text-lg font-bold text-emerald-500 leading-none mb-1">{todayWins}</span>
          <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-center">Vitórias</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[20px] p-3 flex flex-col items-center justify-center shadow-sm">
          <span className="text-lg font-bold text-rose-500 leading-none mb-1">{todayLosses}</span>
          <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-center">Derrotas</span>
        </div>
      </motion.div>

      {/* BOTÃO NOVO CICLO LARGURA TOTAL */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Button
          onClick={onNewCycle}
          className="w-full h-14 rounded-[20px] bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] dark:shadow-[0_4px_14px_0_rgb(255,255,255,0.05)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-medium border-none text-base"
        >
          <Plus size={20} /> Novo Ciclo de Operação
        </Button>
      </motion.div>
      
      {/* BALANÇO SEMANAL */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="pt-2"
      >
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 px-2">Balanço Semanal</h3>
        <Card className="border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center ${weeklyIconBg}`}>
                <TrendingUp size={22} strokeWidth={2.5} className={isWeeklyLoss ? "rotate-180" : ""} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-0.5">Nesta Semana</span>
                <span className={`text-xl font-bold tracking-tight ${weeklyTextClass}`}>
                  {isWeeklyProfit ? '+' : ''}{formatBRL(weeklyProfit)}
                </span>
              </div>
            </div>

            <div className="text-right border-l border-zinc-100 dark:border-zinc-800 pl-4 py-1">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-0.5">Acerto</span>
              <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {weeklyWinRate.toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}