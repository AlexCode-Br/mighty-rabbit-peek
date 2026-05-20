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
      <Card className="border border-white/5 shadow-xl bg-zinc-900/80 backdrop-blur-xl rounded-3xl">
        <CardContent className="p-8 text-center text-zinc-500 font-medium">
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
      <h3 className="font-bold text-lg px-2 text-white tracking-tight">Histórico</h3>
      
      {historyDays.map((day) => {
        const isProfit = day.dailyProfit >= 0;
        const formattedDate = format(parseISO(day.date), "dd 'de' MMMM", { locale: ptBR });
        
        return (
          <Card
            key={day.id}
            className="border border-white/5 shadow-xl bg-zinc-900/80 backdrop-blur-xl rounded-3xl overflow-hidden cursor-pointer hover:bg-zinc-800/80 transition-colors"
            onClick={() => handleDayClick(day)}
          >
            <CardContent className="p-4 px-5 flex items-center justify-between">
              <div>
                <p className="font-bold text-white tracking-tight">{formattedDate}</p>
                <p className="text-xs text-zinc-500 font-semibold tracking-wide uppercase mt-0.5">{day.cycles.length} operações</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`font-mono font-bold tracking-tight ${isProfit ? 'text-emerald-400' : 'text-rose-500'}`}>
                    {isProfit ? '+' : ''}{formatBRL(day.dailyProfit)}
                  </p>
                  <div className="flex justify-end gap-1.5 mt-1">
                    {day.goalReached && <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Meta</span>}
                    {day.stopLossReached && <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Stop</span>}
                  </div>
                </div>
                <div className={`p-2.5 rounded-2xl border ${isProfit ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                  {isProfit ? <TrendingUp size={18} strokeWidth={2.5} /> : <TrendingDown size={18} strokeWidth={2.5} />}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem] h-[80vh] flex flex-col p-0 bg-zinc-950 border border-white/10 shadow-2xl">
          <DialogHeader className="p-6 pb-4 shrink-0 border-b border-white/5 bg-zinc-900/50">
            <DialogTitle className="text-2xl font-black text-white tracking-tight">
              {selectedDay && format(parseISO(selectedDay.date), "dd 'de' MMMM", { locale: ptBR })}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 font-medium mt-1">
              Resumo: {selectedDay?.cycles.length} operações • Total:{' '}
              <span className={`font-mono font-bold ${selectedDay && selectedDay.dailyProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                {selectedDay && (selectedDay.dailyProfit >= 0 ? '+' : '')}{selectedDay && formatBRL(selectedDay.dailyProfit)}
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="space-y-4 pt-4">
              {selectedDay?.cycles.map((cycle, i) => {
                const isCycleProfit = cycle.totalProfit >= 0;
                // Os ciclos são exibidos do mais novo pro mais antigo, ou seja, index 0 é o último ciclo.
                // Mas queremos mostrar "Operação X" crescente de baixo pra cima ou decrescente igual no painel principal.
                // No painel principal (App.tsx): index = todayData.cycles.length - index
                const cycleNumber = selectedDay.cycles.length - i;

                return (
                  <div key={cycle.id} className="bg-black/40 rounded-2xl p-4 space-y-3 relative overflow-hidden border border-white/5 hover:border-white/10 transition-colors">
                    <div className={`absolute left-0 top-0 w-1 h-full ${cycle.completed ? (isCycleProfit ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-orange-500'}`} />
                    
                    <div className="flex justify-between items-center ml-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-white tracking-tight">Operação {cycleNumber}</h4>
                        {cycle.createdAt && (
                          <div className="flex items-center text-[10px] text-zinc-500 font-bold tracking-widest gap-1 bg-white/5 px-2 py-0.5 rounded-md">
                            <Clock size={10} />
                            <span>{format(parseISO(cycle.createdAt), "HH:mm")}</span>
                          </div>
                        )}
                      </div>
                      <span className={`font-mono font-bold text-sm tracking-tight ${cycle.completed ? (isCycleProfit ? 'text-emerald-400' : 'text-rose-500') : 'text-zinc-500'}`}>
                        {cycle.completed ? (isCycleProfit ? '+' : '') + formatBRL(cycle.totalProfit) : 'Pendente'}
                      </span>
                    </div>

                    <div className="space-y-2 ml-2">
                      {cycle.operations.map((op) => (
                        <div key={op.id} className="grid grid-cols-[3rem_1fr_1fr] items-center text-xs gap-3">
                          <div className="font-black text-zinc-500 tracking-widest">{op.type}</div>
                          <div className="bg-white/5 rounded-md px-2 py-1 flex items-center justify-between">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Dep</span>
                            <span className="font-mono text-white font-medium">{formatBRL(op.deposit)}</span>
                          </div>
                          <div className="bg-white/5 rounded-md px-2 py-1 flex items-center justify-between">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Saq</span>
                            <span className="font-mono text-white font-medium">{op.withdraw !== null ? formatBRL(op.withdraw) : '-'}</span>
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