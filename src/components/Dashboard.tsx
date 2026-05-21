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
  let progressColorClass = 'bg-zinc-900 dark:bg-zinc-100';
  let progressGlow = 'none';
  
  if (isProfit && dailyGoal > 0) {
    progress = Math.min((dailyProfit / dailyGoal) * 100, 100);
    progressColorClass = 'bg-emerald-500';
    progressGlow = '0 0 15px rgba(16, 185, 129, 0.4)';
  } else if (!isProfit && stopLoss > 0) {
    progress = Math.min((Math.abs(dailyProfit) / stopLoss) * 100, 100);
    progressColorClass = 'bg-rose-500';
    progressGlow = '0 0 15px rgba(244, 63, 94, 0.4)';
  }

  const isWeeklyProfit = weeklyProfit > 0;
  const isWeeklyLoss = weeklyProfit < 0;
  const weeklyIconBg = isWeeklyProfit ? 'bg-emerald-500/10 text-emerald-500' : isWeeklyLoss ? 'bg-rose-500/10 text-rose-500' : 'bg-zinc-500/10 text-zinc-500';
  const weeklyTextClass = isWeeklyProfit ? 'text-emerald-500' : isWeeklyLoss ? 'text-rose-500' : 'text-zinc-900 dark:text-zinc-100';

  return (
    <div className="space-y-4">
      {/* CARD PRINCIPAL (LUCRO DIÁRIO) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <Card className="liquid-glass border-none rounded-[32px] overflow-hidden">
          <CardContent className="p-7">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.15em]">Resultado Diário</p>
                  {isGoalReached && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider border border-emerald-500/20">
                      Meta Batida 🎉
                    </span>
                  )}
                  {isStopLossReached && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[9px] font-bold uppercase tracking-wider border border-rose-500/20">
                      Stop Loss ⚠️
                    </span>
                  )}
                </div>
                <motion.h2 
                  key={dailyProfit}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`text-5xl tracking-tighter font-bold ${
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
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 rounded-full h-10 w-10 transition-colors shrink-0"
              >
                <Settings size={20} strokeWidth={2} />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {progress.toFixed(0)}<span className="text-base text-zinc-400 dark:text-zinc-500 font-medium">%</span>
                </span>
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                  {isProfit ? 'da Meta' : 'do Stop'}
                </span>
              </div>
              
              <div className="relative h-3 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                  className={`absolute top-0 left-0 h-full ${progressColorClass} rounded-full`}
                  style={{ boxShadow: progressGlow }}
                />
              </div>
              
              <div className="flex justify-between text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.15em] pt-1">
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
        className="grid grid-cols-3 gap-3"
      >
        <div className="liquid-glass rounded-[24px] p-4 flex flex-col items-center justify-center shadow-sm relative overflow-hidden group border-none">
          <Activity className="absolute -right-2 -bottom-2 text-zinc-500/5 dark:text-white/5 transition-transform group-hover:scale-110 group-hover:-rotate-6" size={56} strokeWidth={2} />
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-none mb-1 z-10">{cyclesCount}</span>
          <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-center z-10">Operações</span>
        </div>
        <div className="liquid-glass rounded-[24px] p-4 flex flex-col items-center justify-center shadow-sm relative overflow-hidden group border-none">
          <TrendingUp className="absolute -right-2 -bottom-2 text-emerald-500/5 transition-transform group-hover:scale-110 group-hover:-rotate-6" size={56} strokeWidth={2} />
          <span className="text-2xl font-bold text-emerald-500 leading-none mb-1 z-10">{todayWins}</span>
          <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-center z-10">Vitórias</span>
        </div>
        <div className="liquid-glass rounded-[24px] p-4 flex flex-col items-center justify-center shadow-sm relative overflow-hidden group border-none">
          <TrendingDown className="absolute -right-2 -bottom-2 text-rose-500/5 transition-transform group-hover:scale-110 group-hover:rotate-6" size={56} strokeWidth={2} />
          <span className="text-2xl font-bold text-rose-500 leading-none mb-1 z-10">{todayLosses}</span>
          <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-center z-10">Derrotas</span>
        </div>
      </motion.div>
      
      {/* BALANÇO ÚLTIMOS 7 DIAS COM GRÁFICO */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="pt-2"
      >
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3 px-2 uppercase tracking-wider">Últimos 7 Dias</h3>
        <Card className="liquid-glass border-none rounded-[32px] overflow-hidden">
          <CardContent className="p-6 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${weeklyIconBg} backdrop-blur-xl`}>
                  <TrendingUp size={24} strokeWidth={2.5} className={isWeeklyLoss ? "rotate-180" : ""} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block mb-0.5">Balanço Semanal</span>
                  <span className={`text-2xl font-bold tracking-tight ${weeklyTextClass}`}>
                    {isWeeklyProfit ? '+' : ''}{formatBRL(weeklyProfit)}
                  </span>
                </div>
              </div>

              <div className="text-right pl-4 py-1">
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block mb-0.5">Acerto</span>
                <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {weeklyWinRate.toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Mini Gráfico Sparkline */}
            <div className="h-20 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        if (!data.hasData) return null;
                        const isWin = data.profit >= 0;
                        return (
                          <div className="liquid-glass !bg-zinc-900 dark:!bg-zinc-100 !border-none text-white dark:text-zinc-900 px-3 py-2 rounded-xl shadow-2xl text-[11px] font-bold tracking-wide">
                            {isWin ? '+' : ''}{formatBRL(data.profit)}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="profit" radius={[6, 6, 6, 6]} minPointSize={5}>
                    {weeklyChartData.map((entry, index) => {
                      let color = '#f43f5e'; // rose-500
                      if (entry.hasData) {
                        if (entry.profit >= 0) color = '#10b981'; // emerald-500
                      } else {
                        color = 'rgba(161, 161, 170, 0.15)'; 
                      }
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between w-full mt-3 px-1">
              {weeklyChartData.map((day, i) => (
                <span key={i} className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter">
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