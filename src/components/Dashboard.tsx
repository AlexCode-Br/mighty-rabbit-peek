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
        <Card className="col-span-2 shadow-sm border-none bg-white dark:bg-zinc-900 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Lucro do Dia</p>
                <h2 className={`text-3xl font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                  {isProfit ? '+' : ''}{formatBRL(dailyProfit)}
                </h2>
              </div>
              <div className={`p-3 rounded-full ${isProfit ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                {isProfit ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">
                  {progress.toFixed(0)}% {isProfit ? 'da Meta' : 'do Stop Loss'}
                </span>
              </div>
              <Progress value={progress} className="h-2" indicatorColor={progressColorClass} />
              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>Stop: -{formatBRL(stopLoss)}</span>
                <span>Meta: {formatBRL(dailyGoal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white dark:bg-zinc-900 rounded-2xl">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Target className="text-orange-500 mb-2" size={24} />
            <p className="text-2xl font-bold">{cyclesCount}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Ciclos Hoje</p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2 justify-between">
          <Button 
            onClick={onNewCycle} 
            className="flex-1 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Novo Ciclo
          </Button>
          <Button 
            onClick={onOpenSettings} 
            variant="outline" 
            className="flex-1 rounded-2xl border-orange-200 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all active:scale-95"
          >
            <Settings className="mr-2 h-4 w-4" /> Ajustes
          </Button>
        </div>
      </div>
    </div>
  );
}
