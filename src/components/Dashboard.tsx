import React from 'react';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Settings, PlusCircle, TrendingUp, TrendingDown, Target } from 'lucide-react';
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
  let progressColorClass = 'bg-primary';
  
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
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        >
          <Card className="shadow-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-2xl rounded-3xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
            <motion.div 
              className={`absolute -inset-1 opacity-20 blur-2xl transition-all duration-700 ${isProfit ? 'bg-emerald-500 group-hover:opacity-30' : 'bg-rose-500 group-hover:opacity-30'}`}
            />
            
            <CardContent className="p-6 relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Lucro do Dia</p>
                  <motion.h2 
                    key={dailyProfit}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-4xl sm:text-5xl font-black tracking-tighter ${isProfit ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]'}`}
                  >
                    {isProfit ? '+' : ''}{formatBRL(dailyProfit)}
                  </motion.h2>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: isProfit ? 5 : -5 }}
                  className={`p-3.5 rounded-2xl backdrop-blur-md ${isProfit ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.2)]' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.2)]'}`}
                >
                  {isProfit ? <TrendingUp size={28} strokeWidth={2.5} /> : <TrendingDown size={28} strokeWidth={2.5} />}
                </motion.div>
              </div>
              
              <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-white/[0.05]">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400 font-medium tracking-tight">Progresso</span>
                  <span className="font-bold text-white tracking-tight">
                    {progress.toFixed(0)}% <span className="text-zinc-500 font-normal">{isProfit ? 'da Meta' : 'do Stop'}</span>
                  </span>
                </div>
                <div className="relative h-3 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`absolute top-0 left-0 h-full ${progressColorClass} shadow-[0_0_10px_currentColor]`}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono tracking-tight font-bold">
                  <span className="text-rose-400/80">Stop: -{formatBRL(stopLoss)}</span>
                  <span className="text-emerald-400/80">Meta: {formatBRL(dailyGoal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card Operações */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
        >
          <Card className="shadow-xl border border-white/10 bg-zinc-900/60 backdrop-blur-2xl rounded-3xl h-full group hover:border-orange-500/30 transition-colors">
            <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <motion.div 
                whileHover={{ y: -2 }}
                className="p-3 bg-orange-500/10 text-orange-400 rounded-2xl mb-3 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.15)] relative z-10"
              >
                <Target size={24} strokeWidth={2.5} />
              </motion.div>
              <motion.p 
                key={cyclesCount}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-black text-white tracking-tighter leading-none mb-1 relative z-10"
              >
                {cyclesCount}
              </motion.p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest relative z-10">Operações</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Botões */}
        <motion.div 
          className="flex flex-col gap-3 justify-between"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex-1">
            <Button
              onClick={onNewCycle}
              className="w-full h-full rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-[0_0_25px_rgba(249,115,22,0.4)] border-none font-bold text-sm tracking-wide transition-all"
            >
              <PlusCircle className="mr-2 h-5 w-5" /> Nova Op
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex-1">
            <Button
              onClick={onOpenSettings}
              variant="outline"
              className="w-full h-full rounded-3xl border border-white/10 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white font-bold text-sm tracking-wide transition-all"
            >
              <Settings className="mr-2 h-4 w-4" /> Ajustes
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}