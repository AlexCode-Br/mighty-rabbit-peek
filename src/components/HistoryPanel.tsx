import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { AppData, OperationDay } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatBRL } from '../utils/currency';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

interface HistoryPanelProps {
  data: AppData;
}

export function HistoryPanel({ data }: HistoryPanelProps) {
  const [selectedDay, setSelectedDay] = useState<OperationDay | null>(null);

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

  const handleDayClick = (day: OperationDay) => {
    setSelectedDay(day);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg px-2 text-zinc-800 dark:text-zinc-100">Histórico</h3>
      
      {historyDays.map((day) => {
        const isProfit = day.dailyProfit >= 0;
        const formattedDate = format(parseISO(day.date), "dd 'de' MMMM", { locale: ptBR });
        
        return (
          <Card 
            key={day.id} 
            className="border-none shadow-sm bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors"
            onClick={() => handleDayClick(day)}
          >
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
                  <div className="flex justify-end gap-1 mt-0.5">
                    {day.goalReached && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Meta</span>}
                    {day.stopLossReached && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Stop</span>}
                  </div>
                </div>
                <div className={`p-2 rounded-full ${isProfit ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                  {isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <DialogTitle className="text-xl font-bold">
              {selectedDay && format(parseISO(selectedDay.date), "dd 'de' MMMM", { locale: ptBR })}
            </DialogTitle>
            <DialogDescription>
              Resumo: {selectedDay?.cycles.length} ciclos • Total:{' '}
              <span className={`font-bold ${selectedDay && selectedDay.dailyProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {selectedDay && (selectedDay.dailyProfit >= 0 ? '+' : '')}{selectedDay && formatBRL(selectedDay.dailyProfit)}
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="space-y-4 pt-2">
              {selectedDay?.cycles.map((cycle, i) => {
                const isCycleProfit = cycle.totalProfit >= 0;
                // Os ciclos são exibidos do mais novo pro mais antigo, ou seja, index 0 é o último ciclo.
                // Mas queremos mostrar "Ciclo X" crescente de baixo pra cima ou decrescente igual no painel principal.
                // No painel principal (App.tsx): index = todayData.cycles.length - index
                const cycleNumber = selectedDay.cycles.length - i;

                return (
                  <div key={cycle.id} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-3 relative overflow-hidden border border-zinc-100 dark:border-zinc-800">
                    <div className={`absolute left-0 top-0 w-1 h-full ${cycle.completed ? (isCycleProfit ? 'bg-green-500' : 'bg-red-500') : 'bg-orange-500'}`} />
                    
                    <div className="flex justify-between items-center ml-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-zinc-700 dark:text-zinc-200">Ciclo {cycleNumber}</h4>
                        {cycle.createdAt && (
                          <div className="flex items-center text-[10px] text-muted-foreground gap-1">
                            <Clock size={10} />
                            <span>{format(parseISO(cycle.createdAt), "HH:mm")}</span>
                          </div>
                        )}
                      </div>
                      <span className={`font-bold text-sm ${cycle.completed ? (isCycleProfit ? 'text-green-500' : 'text-red-500') : 'text-muted-foreground'}`}>
                        {cycle.completed ? (isCycleProfit ? '+' : '') + formatBRL(cycle.totalProfit) : 'Pendente'}
                      </span>
                    </div>

                    <div className="space-y-2 ml-2">
                      {cycle.operations.map((op) => (
                        <div key={op.id} className="grid grid-cols-[3rem_1fr_1fr] items-center text-xs gap-2">
                          <div className="font-semibold text-zinc-500">{op.type}</div>
                          <div>
                            <span className="text-muted-foreground mr-1">Dep:</span>
                            <span className="font-medium">{formatBRL(op.deposit)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground mr-1">Saque:</span>
                            <span className="font-medium">{op.withdraw !== null ? formatBRL(op.withdraw) : '-'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}