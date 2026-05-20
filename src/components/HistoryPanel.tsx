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
import { Clock, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
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
        <h3 className="font-bold text-lg text-slate-800 tracking-tight">Calendário de Resultados</h3>
        <p className="text-xs text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full">{historyDays.length} Dias operados</p>
      </div>
      
      <Card className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2rem] overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          
          <div className="w-full max-w-sm mx-auto select-none">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={prevMonth} 
                className="h-10 w-10 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all border border-slate-100 active:scale-95"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
              
              <div className="text-base sm:text-lg font-black text-slate-800 capitalize tracking-wide">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </div>
              
              <button 
                onClick={nextMonth} 
                className="h-10 w-10 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all border border-slate-100 active:scale-95"
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-2">
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
                
                let baseClasses = "relative h-10 w-10 sm:h-11 sm:w-11 mx-auto flex flex-col items-center justify-center text-sm font-bold rounded-2xl transition-all duration-200";
                
                if (!isCurrentMonth) {
                  baseClasses += " text-slate-300 opacity-50 cursor-default";
                } else if (isSelected) {
                  baseClasses += " bg-indigo-600 text-white shadow-md shadow-indigo-600/30";
                } else if (dayHasData) {
                  baseClasses += " hover:bg-slate-50 cursor-pointer text-slate-700 bg-white border border-slate-100";
                } else {
                  baseClasses += " hover:bg-slate-50 cursor-pointer text-slate-400";
                  if (isDayToday) baseClasses += " border border-indigo-200 text-indigo-600 bg-indigo-50/50";
                }

                return (
                  <div key={idx} className="flex items-center justify-center py-0.5">
                    <button 
                      onClick={() => handleSelectDate(day)}
                      disabled={!isCurrentMonth}
                      className={baseClasses}
                    >
                      <span className={`${isSelected ? 'translate-y-0' : dayHasData ? '-translate-y-0.5' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      
                      {dayHasData && !isSelected && (
                        <span className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${dayIsProfit ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      )}
                      {dayHasData && isSelected && (
                        <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-white opacity-80" />
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
        <DialogContent className="sm:max-w-md rounded-[2rem] h-[80vh] flex flex-col p-0 bg-slate-50 border-none shadow-2xl">
          <DialogHeader className="p-6 pb-5 shrink-0 border-b border-slate-200 bg-white rounded-t-[2rem]">
            <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
              {selectedDay && format(parseISO(selectedDay.date), "dd 'de' MMMM", { locale: ptBR })}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-1">
              Resumo: {selectedDay?.cycles.length} operações realizadas • Saldo do dia:{' '}
              <span className={`font-mono font-bold ${selectedDay && selectedDay.dailyProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {selectedDay && (selectedDay.dailyProfit >= 0 ? '+' : '')}{selectedDay && formatBRL(selectedDay.dailyProfit)}
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 px-4 sm:px-6 pb-6">
            <div className="space-y-4 pt-5">
              {selectedDay?.cycles.map((cycle, i) => {
                const isCycleProfit = cycle.totalProfit >= 0;
                const cycleNumber = selectedDay.cycles.length - i;

                return (
                  <div key={cycle.id} className="bg-white rounded-2xl p-4 sm:p-5 space-y-4 relative overflow-hidden border border-slate-200 shadow-sm">
                    <div className={`absolute left-0 top-0 w-1.5 h-full ${cycle.completed ? (isCycleProfit ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-indigo-400'}`} />
                    
                    <div className="flex justify-between items-center pl-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-black text-base text-slate-800">Ciclo {cycleNumber}</h4>
                        {cycle.createdAt && (
                          <div className="flex items-center text-[10px] text-slate-500 font-bold tracking-widest gap-1 bg-slate-100 px-2 py-1 rounded-md">
                            <Clock size={12} />
                            <span>{format(parseISO(cycle.createdAt), "HH:mm")}</span>
                          </div>
                        )}
                      </div>
                      <span className={`font-mono font-bold text-sm bg-slate-50 px-2 py-1 rounded-md border border-slate-100 ${cycle.completed ? (isCycleProfit ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-400'}`}>
                        {cycle.completed ? (isCycleProfit ? '+' : '') + formatBRL(cycle.totalProfit) : 'Em andamento'}
                      </span>
                    </div>

                    <div className="space-y-2 pl-2">
                      {cycle.operations.map((op) => (
                        <div key={op.id} className="grid grid-cols-[3rem_1fr_1fr] items-center text-xs gap-3">
                          <div className="font-black text-slate-400 tracking-widest">{op.type}</div>
                          <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 flex items-center justify-between">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Entrada</span>
                            <span className="font-mono text-slate-700 font-bold">{formatBRL(op.deposit)}</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 flex items-center justify-between">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Saque</span>
                            <span className="font-mono text-slate-700 font-bold">{op.withdraw !== null ? formatBRL(op.withdraw) : '-'}</span>
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