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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { motion } from 'framer-motion';

interface HistoryPanelProps {
  data: AppData;
}

export function HistoryPanel({ data }: HistoryPanelProps) {
  const [selectedDay, setSelectedDay] = useState<OperationDay | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const historyDays = Object.values(data.history).sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const profitDays = historyDays.filter(day => day.dailyProfit > 0 && day.cycles.length > 0).map(day => parseISO(day.date));
  const lossDays = historyDays.filter(day => day.dailyProfit < 0 && day.cycles.length > 0).map(day => parseISO(day.date));

  const isProfit = (date: Date) => profitDays.some(d => isSameDay(d, date));
  const isLoss = (date: Date) => lossDays.some(d => isSameDay(d, date));
  const hasData = (date: Date) => historyDays.some(d => isSameDay(parseISO(d.date), date) && d.cycles.length > 0);

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
      <Card className="border border-zinc-200/60 shadow-sm bg-white rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <div className="w-full max-w-sm mx-auto select-none">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-8">
              <button onClick={prevMonth} className="h-8 w-8 flex items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                <ChevronLeft size={20} />
              </button>
              
              <div className="text-base font-semibold text-zinc-900 capitalize tracking-tight">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </div>
              
              <button onClick={nextMonth} className="h-8 w-8 flex items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-4">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                <div key={i} className="text-center text-[10px] font-semibold text-zinc-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-2">
              {days.map((day, idx) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isDayToday = isToday(day);
                const dayHasData = hasData(day);
                const dayIsProfit = isProfit(day);
                const dayIsLoss = isLoss(day);
                
                let textClass = "text-zinc-900";
                if (!isCurrentMonth) textClass = "text-zinc-300";
                else if (isDayToday) textClass = "text-zinc-900 font-bold";

                return (
                  <div key={idx} className="flex flex-col items-center justify-center h-12 relative group">
                    <button 
                      onClick={() => handleSelectDate(day)}
                      disabled={!isCurrentMonth || !dayHasData}
                      className={`h-9 w-9 flex items-center justify-center text-sm rounded-full transition-all duration-200 
                        ${dayHasData ? 'hover:bg-zinc-100' : 'cursor-default'} 
                        ${isDayToday && !dayHasData ? 'bg-zinc-50' : ''}
                      `}
                    >
                      <span className={textClass}>{format(day, 'd')}</span>
                    </button>
                    
                    {dayHasData && isCurrentMonth && (
                      <div className={`absolute bottom-0 w-1 h-1 rounded-full ${dayIsProfit ? 'bg-emerald-500' : dayIsLoss ? 'bg-rose-500' : 'bg-zinc-400'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="sm:max-w-md rounded-[32px] h-[80vh] flex flex-col p-0 bg-[#FAFAFA] border-none shadow-2xl">
          <DialogHeader className="p-8 pb-6 shrink-0 border-b border-zinc-200/50 bg-white rounded-t-[32px]">
            <DialogTitle className="text-xl font-semibold text-zinc-900 tracking-tight">
              {selectedDay && format(parseISO(selectedDay.date), "dd 'de' MMMM", { locale: ptBR })}
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-sm mt-1.5 flex justify-between items-center">
              <span>{selectedDay?.cycles.length} ciclos</span>
              <span className={`font-semibold ${selectedDay && selectedDay.dailyProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {selectedDay && (selectedDay.dailyProfit >= 0 ? '+' : '')}{selectedDay && formatBRL(selectedDay.dailyProfit)}
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 px-4 sm:px-6 pb-6">
            <div className="space-y-4 pt-6">
              {selectedDay?.cycles.map((cycle, i) => {
                const isCycleProfit = cycle.totalProfit > 0;
                const cycleNumber = selectedDay.cycles.length - i;

                return (
                  <div key={cycle.id} className="bg-white rounded-3xl p-5 border border-zinc-200/60 shadow-sm">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-100">
                      <h4 className="font-semibold text-sm text-zinc-900">Ciclo {cycleNumber}</h4>
                      <span className={`text-sm font-semibold ${cycle.completed ? (isCycleProfit ? 'text-emerald-500' : cycle.totalProfit < 0 ? 'text-rose-500' : 'text-zinc-900') : 'text-zinc-400'}`}>
                        {cycle.completed ? (isCycleProfit ? '+' : '') + formatBRL(cycle.totalProfit) : 'Pendente'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {cycle.operations.map((op) => (
                        <div key={op.id} className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-zinc-400 w-12">{op.type}</span>
                          <span className="text-zinc-900 font-medium">{formatBRL(op.deposit)} <span className="text-zinc-300 mx-2">→</span> {op.withdraw !== null ? formatBRL(op.withdraw) : '-'}</span>
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