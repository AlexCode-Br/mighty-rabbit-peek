import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { AppData, OperationDay } from '../types';
import { 
  format, parseISO, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, 
  addMonths, subMonths, isSameMonth, isSameDay, isToday 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatBRL } from '../utils/currency';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

interface HistoryPanelProps {
  data: AppData;
}

export function HistoryPanel({ data }: HistoryPanelProps) {
  const [selectedDay, setSelectedDay] = useState<OperationDay | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const historyDays = Object.values(data.history).sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const profitDays = historyDays.filter(day => day.dailyProfit >= 0 && day.cycles.length > 0).map(day => parseISO(day.date));
  const lossDays = historyDays.filter(day => day.dailyProfit < 0 && day.cycles.length > 0).map(day => parseISO(day.date));

  const isProfit = (date: Date) => profitDays.some(d => isSameDay(d, date));
  const isLoss = (date: Date) => lossDays.some(d => isSameDay(d, date));
  const hasData = (date: Date) => isProfit(date) || isLoss(date);

  const handleSelectDate = (date: Date) => {
    const dayId = format(date, 'yyyy-MM-dd');
    const dayData = data.history[dayId];
    if (dayData && dayData.cycles.length > 0) {
      setSelectedDay(dayData);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-bold text-lg text-white tracking-tight">Histórico</h3>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{historyDays.length} Dias operados</p>
      </div>
      
      <Card className="border border-white/5 shadow-2xl bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          
          <div className="w-full max-w-sm mx-auto select-none">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={prevMonth} 
                className="h-10 w-10 flex items-center justify-center rounded-2xl bg-zinc-800/40 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-white/5 hover:border-white/10 shadow-sm active:scale-95"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
              
              <div className="text-base sm:text-lg font-bold text-white capitalize tracking-wide">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </div>
              
              <button 
                onClick={nextMonth} 
                className="h-10 w-10 flex items-center justify-center rounded-2xl bg-zinc-800/40 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-white/5 hover:border-white/10 shadow-sm active:scale-95"
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest pb-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-1 sm:gap-y-2">
              {days.map((day, idx) => {
                const isSelected = selectedDay && isSameDay(parseISO(selectedDay.date), day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isDayToday = isToday(day);
                const dayHasData = hasData(day);
                const dayIsProfit = isProfit(day);
                
                let baseClasses = "relative h-10 w-10 sm:h-11 sm:w-11 mx-auto flex flex-col items-center justify-center text-sm rounded-2xl transition-all duration-300";
                
                if (!isCurrentMonth) {
                  baseClasses += " text-zinc-700 opacity-40 cursor-default";
                } else if (isSelected) {
                  baseClasses += " bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black shadow-[0_4px_20px_rgba(249,115,22,0.4)]";
                } else if (dayHasData) {
                  baseClasses += " hover:bg-white/10 cursor-pointer text-zinc-200 font-bold bg-white/[0.02] border border-white/[0.02]";
                } else {
                  baseClasses += " hover:bg-white/5 cursor-pointer text-zinc-400 font-medium";
                  if (isDayToday) baseClasses += " border border-white/10 text-white bg-white/5";
                }

                return (
                  <div key={idx} className="flex items-center justify-center py-0.5">
                    <button 
                      onClick={() => handleSelectDate(day)}
                      disabled={!isCurrentMonth}
                      className={baseClasses}
                    >
                      <span className={`${isSelected ? 'translate-y-0' : dayHasData ? '-translate-y-0.5' : ''} transition-transform`}>
                        {format(day, 'd')}
                      </span>
                      
                      {/* Minimalist Indicators - Dots below the number */}
                      {dayHasData && !isSelected && (
                        <span className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${dayIsProfit ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'}`} />
                      )}
                      {dayHasData && isSelected && (
                        <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-white opacity-80" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
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