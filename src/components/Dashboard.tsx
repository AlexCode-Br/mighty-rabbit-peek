import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Settings, Plus, TrendingUp, TrendingDown, Target } from 'lucide-react';
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
  
  let progress = 0;
  let progressColorClass = 'bg-indigo-600';
  
  if (isProfit && dailyGoal > 0) {
    progress = Math.min((dailyProfit / dailyGoal) * 100, 100);
    progressColorClass = 'bg-emerald-500';
  } else if (!isProfit && stopLoss > 0) {
    progress = Math.min((Math.abs(dailyProfit) / stopLoss) * 100, 100);
    progressColorClass = 'bg-rose-500';
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Card Principal de Lucro */}
        <motion.div 
          className="col-span-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, type: "spring", bounce: 0 }}
        >
          <Card className="shadow-xl shadow-slate-200/50 border-none bg-white rounded-[2rem] overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Resultado de Hoje</p>
                  <motion.h2 
                    key={dailyProfit}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-4xl sm:text-5xl font-black tracking-tighter ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}
                  >
                    {isProfit ? '+' : ''}{formatBRL(dailyProfit)}
                  </motion.h2>
                </div>
                <div className={`p-3 rounded-2xl ${isProfit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {isProfit ? <TrendingUp size={28} strokeWidth={2.5} /> : <TrendingDown size={28} strokeWidth={2.5} />}
                </div>
              </div>
              
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold">Progresso</span>
                  <span className="font-bold text-slate-800">
                    {progress.toFixed(0)}% <span className="text-slate-400 font-normal">{isProfit ? 'da Meta' : 'do Stop'}</span>
                  </span>
                </div>
                <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`absolute top-0 left-0 h-full ${progressColorClass} rounded-full`}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono font-bold">
                  <span className="text-rose-500">Stop: -{formatBRL(stopLoss)}</span>
                  <span className="text-emerald-600">Meta: {formatBRL(dailyGoal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Botão Operações Resumo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="shadow-lg shadow-slate-200/40 border-none bg-white rounded-3xl h-full">
            <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-3">
                <Target size={24} strokeWidth={2.5} />
              </div>
              <motion.p 
                key={cyclesCount}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-black text-slate-800 tracking-tighter leading-none mb-1"
              >
                {cyclesCount}
              </motion.p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Operações</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Controles */}
        <motion.div 
          className="flex flex-col gap-3 justify-between"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex-1">
            <Button
              onClick={onNewCycle}
              className="w-full h-full rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-white border-none font-bold text-sm shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all"
            >
              <Plus className="mr-2 h-5 w-5" /> Adicionar
            </Button>
          </div>
          <div className="flex-1">
            <Button
              onClick={onOpenSettings}
              variant="outline"
              className="w-full h-full rounded-3xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold text-sm active:scale-[0.98] transition-all"
            >
              <Settings className="mr-2 h-4 w-4 text-slate-400" /> Configurar
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}