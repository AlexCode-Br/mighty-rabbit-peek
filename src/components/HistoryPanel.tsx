import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AppData } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatBRL } from '../utils/currency';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface HistoryPanelProps {
  data: AppData;
}

export function HistoryPanel({ data }: HistoryPanelProps) {
  const historyDays = Object.values(data.history).sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (historyDays.length === 0) {
    return (
      <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 rounded-2xl">
        <CardContent className="p-8 text-center text-muted-foreground">
          Nenhum histórico disponível.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg px-2 text-zinc-800 dark:text-zinc-100">Histórico</h3>
      
      {historyDays.map((day) => {
        const isProfit = day.dailyProfit >= 0;
        const formattedDate = format(parseISO(day.date), "dd 'de' MMMM", { locale: ptBR });
        
        return (
          <Card key={day.id} className="border-none shadow-sm bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{formattedDate}</p>
                <p className="text-sm text-muted-foreground">{day.cycles.length} ciclos</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className={`font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                    {isProfit ? '+' : ''}{formatBRL(day.dailyProfit)}
                  </p>
                  {day.goalReached && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Meta Batida</span>}
                  {day.stopLossReached && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Stop Loss</span>}
                </div>
                <div className={`p-2 rounded-full ${isProfit ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                  {isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
