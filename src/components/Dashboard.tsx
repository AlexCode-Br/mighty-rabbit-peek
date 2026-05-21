import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Settings, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { formatBRL } from '../utils/currency';
import { motion } from 'framer-motion';
import { BarChart, Bar, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  dailyProfit: number;
  dailyGoal: number;
  stopLoss: number;
  cyclesCount: number;
  todayWins: number;
  todayLosses: number;
  weeklyProfit: number;
  weeklyWinRate: number;
  weeklyChartData: { name: string; profit: number; hasData: boolean }[];
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
  weeklyChartData,
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

  const isWeeklyProfit = weeklyProfit > 0;
  const isWeeklyLoss = weeklyProfit < 0;
  const weeklyIconBg = isWeeklyProfit 
    ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-400' 
    : isWeeklyLoss 
      ? 'bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 text-rose-400' 
      : 'bg-zinc-500/10 dark:bg-zinc-800/30 border border-zinc-500/10 text-zinc-400';
  
  const weeklyTextClass = isWeeklyProfit 
    ? 'text-emerald-400 drop-shadow-[0_2px_10px_rgba(52,211,153,0.15)]' 
    : isWeeklyLoss 
      ? 'text-rose-400 drop-shadow-[0_2px_10px_rgba(244,63,94,0.15)]' 
      : 'text-zinc-900 dark:text-zinc-100';

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
                className="text-zinc-400/80 hover:text-zinc-100 hover:bg-white/10 dark:hover:bg-white/5 rounded-full h-9 w-9 transition-colors -mr-2 -mt-2 shrink-0 border border-transparent hover:border-white/5"
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

      {/* ESTATÍSTICAS RÁPIDAS DO DIA */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.05 }}
        className="grid grid-cols-3 gap-2"
      >
        <div className="liquid-glass-card rounded-[20px] p-3 flex flex-col items-center justify-center shadow-md relative overflow-hidden group">
          <Activity className="absolute -right-3 -bottom-3 text-zinc-200/10 dark:text-white/5 transition-transform group-hover:scale-110 group-hover:-rotate-6" size={54} strokeWidth={1.5} />
          <span className="text-2xl font-black text-zinc-950 dark:text-zinc-100 leading-none mb-1 z-10">{cyclesCount}</span>
          <span className="text-[9px] font-bold text-zinc-500/80 dark:text-zinc-400/60 uppercase tracking-widest text-center z-10">Operações</span>
        </div>
        <div className="liquid-glass-card rounded-[20px] p-3 flex flex-col items-center justify-center shadow-md relative overflow-hidden group">
          <TrendingUp className="absolute -right-3 -bottom-3 text-emerald-500/10 transition-transform group-hover:scale-110 group-hover:-rotate-6" size={54} strokeWidth={1.5} />
          <span className="text-2xl font-black text-emerald-400 drop-shadow-[0_2px_8px_rgba(52,211,153,0.1)] leading-none mb-1 z-10">{todayWins}</span>
          <span className="text-[9px] font-bold text-zinc-500/80 dark:text-zinc-400/60 uppercase tracking-widest text-center z-10">Vitórias</span>
        </div>
        <div className="liquid-glass-card rounded-[20px] p-3 flex flex-col items-center justify-center shadow-md relative overflow-hidden group">
          <TrendingDown className="absolute -right-3 -bottom-3 text-rose-500/10 transition-transform group-hover:scale-110 group-hover:rotate-6" size={54} strokeWidth={1.5} />
          <span className="text-2xl font-black text-rose-400 drop-shadow-[0_2px_8px_rgba(244,63,94,0.1)] leading-none mb-1 z-10">{todayLosses}</span>
          <span className="text-[9px] font-bold text-zinc-500/80 dark:text-zinc-400/60 uppercase tracking-widest text-center z-10">Derrotas</span>
        </div>
      </motion.div>
      
      {/* BALANÇO ÚLTIMOS 7 DIAS COM GRÁFICO */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
        className="pt-2"
      >
        <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-3 px-1">Últimos 7 Dias</h3>
        <Card className="liquid-glass-panel rounded-[28px] overflow-hidden border border-white/10 shadow-lg">
          <CardContent className="p-5 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${weeklyIconBg}`}>
                  <TrendingUp size={20} strokeWidth={2.5} className={isWeeklyLoss ? "rotate-180" : ""} />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-400/80 dark:text-zinc-400/50 uppercase tracking-widest block mb-0.5">Balanço Semanal</span>
                  <span className={`text-2xl font-black tracking-tight ${weeklyTextClass}`}>
                    {isWeeklyProfit ? '+' : ''}{formatBRL(weeklyProfit)}
                  </span>
                </div>
              </div>

              <div className="text-right border-l border-white/10 pl-4 py-1">
                <span className="text-[9px] font-bold text-zinc-400/80 dark:text-zinc-400/50 uppercase tracking-widest block mb-0.5">Taxa de Acerto</span>
                <span className="text-xl font-black tracking-tight text-zinc-950 dark:text-zinc-100">
                  {weeklyWinRate.toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Mini Gráfico Sparkline Estilo WWDC */}
            <div className="h-16 w-full mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        if (!data.hasData) return null;
                        const isWin = data.profit >= 0;
                        return (
                          <div className="liquid-glass-panel border-white/20 text-zinc-950 dark:text-white px-3 py-1.5 rounded-xl shadow-xl text-xs font-bold tracking-tight">
                            {isWin ? '+' : ''}{formatBRL(data.profit)}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="profit" radius={[4, 4, 4, 4]} minPointSize={4}>
                    {weeklyChartData.map((entry, index) => {
                      let color = '#f43f5e'; // rose-500
                      if (entry.hasData) {
                        if (entry.profit >= 0) color = '#10b981'; // emerald-500
                      } else {
                        color = 'rgba(161, 161, 170, 0.15)'; // zinco translúcido
                      }
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between w-full mt-2.5 px-1.5 border-t border-white/5 pt-2">
              {weeklyChartData.map((day, i) => (
                <span key={i} className="text-[9px] font-extrabold text-zinc-500/80 dark:text-zinc-400/40 uppercase">
                  {day.name}
                </span>
              ))}
            </div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}