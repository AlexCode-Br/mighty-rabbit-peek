import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Settings, PlusCircle, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { formatBRL } from '../utils/currency';

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
  
  // Calculate progress based on whether we are in profit or loss
  let progress = 0;
  let progressColorClass = 'bg-primary';
  
  if (isProfit && dailyGoal > 0) {
    progress = Math.min((dailyProfit / dailyGoal) * 100, 100);
    progressColorClass = 'bg-green-500';
  } else if (!isProfit && stopLoss > 0) {
    progress = Math.min((Math.abs(dailyProfit) / stopLoss) * 100, 100);
    progressColorClass = 'bg-red-500';
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="col-span-2 shadow-2xl border border-white/5 bg-zinc-900/80 backdrop-blur-xl rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
          <CardContent className="p-6 relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">Lucro do Dia</p>
                <h2 className={`text-4xl font-black tracking-tighter ${isProfit ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.2)]' : 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.2)]'}`}>
                  {isProfit ? '+' : ''}{formatBRL(dailyProfit)}
                </h2>
              </div>
              <div className={`p-3.5 rounded-2xl ${isProfit ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.1)]' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]'}`}>
                {isProfit ? <TrendingUp size={24} strokeWidth={2.5} /> : <TrendingDown size={24} strokeWidth={2.5} />}
              </div>
            </div>
            
            <div className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/[0.03]">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400 font-medium tracking-tight">Progresso</span>
                <span className="font-bold text-white tracking-tight">
                  {progress.toFixed(0)}% <span className="text-zinc-500 font-normal">{isProfit ? 'da Meta' : 'do Stop Loss'}</span>
                </span>
              </div>
              <Progress value={progress} className="h-2.5 bg-zinc-800" indicatorColor={progressColorClass} />
              <div className="flex justify-between text-xs pt-1 font-mono tracking-tight">
                <span className="text-rose-400/80">Stop: -{formatBRL(stopLoss)}</span>
                <span className="text-emerald-400/80">Meta: {formatBRL(dailyGoal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border border-white/5 bg-zinc-900/80 backdrop-blur-xl rounded-3xl">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
            <div className="p-3 bg-orange-500/10 text-orange-400 rounded-2xl mb-3 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
              <Target size={20} strokeWidth={2.5} />
            </div>
            <p className="text-3xl font-black text-white tracking-tighter leading-none mb-1">{cyclesCount}</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Operações Hoje</p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 justify-between">
          <Button
            onClick={onNewCycle}
            className="flex-1 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] border-none font-bold text-sm tracking-wide transition-all active:scale-95"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Nova Operação
          </Button>
          <Button
            onClick={onOpenSettings}
            variant="outline"
            className="flex-1 rounded-3xl border border-white/10 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white font-semibold text-sm tracking-wide transition-all active:scale-95"
          >
            <Settings className="mr-2 h-4 w-4" /> Ajustes
          </Button>
        </div>
      </div>
    </div>
  );
}
