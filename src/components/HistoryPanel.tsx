import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { AppData, OperationDay } from '../types';
import { format, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatBRL } from '../utils/currency';
import { Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Calendar } from './ui/calendar';

interface HistoryPanelProps {
  data: AppData;
}

export function HistoryPanel({ data }: HistoryPanelProps) {
  const [selectedDay, setSelectedDay] = useState<OperationDay | null>(null);

  const historyDays = Object.values(data.history).sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    const dayId = format(date, 'yyyy-MM-dd');
    const dayData = data.history[dayId];
    if (dayData && dayData.cycles.length > 0) {
      setSelectedDay(dayData);
    }
  };

  const profitDays = historyDays.filter(day => day.dailyProfit >= 0 && day.cycles.length > 0).map(day => parseISO(day.date));
  const lossDays = historyDays.filter(day => day.dailyProfit < 0 && day.cycles.length > 0).map(day => parseISO(day.date));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-bold text-lg text-white tracking-tight">Histórico</h3>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{historyDays.length} Dias operados</p>
      </div>
      
      <Card className="border border-white/5 shadow-2xl bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
        <CardContent className="p-2 sm:p-6 flex justify-center">
          <Calendar
            mode="single"
            locale={ptBR}
            selected={selectedDay ? parseISO(selectedDay.date) : undefined}
            onSelect={handleSelectDate}
            modifiers={{
              profit: profitDays,
              loss: lossDays
            }}
            modifiersClassNames={{
              profit: "bg-emerald-500/10 text-emerald-400 font-black border border-emerald-500/30 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors shadow-[0_0_15px_rgba(52,211,153,0.15)]",
              loss: "bg-rose-500/10 text-rose-500 font-black border border-rose-500/30 hover:bg-rose-500/20 hover:text-rose-400 transition-colors shadow-[0_0_15px_rgba(244,63,94,0.15)]"
            }}
            className="text-white w-full max-w-full"
            classNames={{
              day: "h-10 w-10 sm:h-12 sm:w-12 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center mx-auto",
              day_button: "h-10 w-10 sm:h-12 sm:w-12 p-0 font-medium aria-selected:opacity-100 flex items-center justify-center",
              selected: "bg-orange-500 text-white hover:bg-orange-600 hover:text-white focus:bg-orange-500 focus:text-white font-black shadow-[0_0_15px_rgba(249,115,22,0.5)] border-none",
              today: "bg-white/10 text-white font-bold border border-white/20",
              months: "flex flex-col w-full items-center",
              month: "space-y-4 w-full flex flex-col items-center",
              table: "border-collapse space-y-1 mx-auto",
              head_row: "flex justify-center w-full mb-2 gap-1 sm:gap-2",
              head_cell: "text-zinc-500 rounded-md w-10 sm:w-12 font-black text-[10px] uppercase tracking-widest flex items-center justify-center",
              row: "flex justify-center w-full mt-2 gap-1 sm:gap-2",
              cell: "w-10 sm:w-12 h-10 sm:h-12 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 flex items-center justify-center",
              caption: "flex justify-center pt-1 relative items-center mb-4 w-full",
              caption_label: "text-lg font-black tracking-tight capitalize",
              nav: "space-x-1 flex items-center bg-black/40 rounded-xl border border-white/5 p-1",
              nav_button: "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center text-white",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
            }}
          />
        </CardContent>
      </Card>

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