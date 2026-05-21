import React, { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { AppData, OperationDay } from '../types';
import { 
  format, parseISO, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, 
  addMonths, subMonths, isSameMonth, isSameDay, isToday 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatBRL } from '../utils/currency';
import { ChevronLeft, ChevronRight, X, Target, BarChart2, Percent, Download, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Button } from './ui/button';
import { ExportDialog } from './ExportDialog';

interface HistoryPanelProps {
  data: AppData;
  onEditDay: (date: Date) => void;
}

export function HistoryPanel({ data, onEditDay }: HistoryPanelProps) {
  const [selectedDay, setSelectedDay] = useState<OperationDay | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [exportOpen, setExportOpen] = useState(false);

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

  const monthlyData = useMemo(() => {
    const daysInMonth = historyDays.filter(day => {
      return isSameMonth(parseISO(day.date), currentMonth) && day.cycles.length > 0;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let totalProfit = 0;
    let winDays = 0;
    let totalDays = daysInMonth.length;

    const chartData = daysInMonth.map(day => {
      totalProfit += day.dailyProfit;
      if (day.dailyProfit >= 0) winDays++;
      return {
        name: format(parseISO(day.date), 'dd/MM'),
        profit: day.dailyProfit,
      };
    });

    const winRate = totalDays > 0 ? (winDays / totalDays) * 100 : 0;
    return { chartData, totalProfit, winRate, totalDays };
  }, [historyDays, currentMonth]);

  const hasMonthlyData = monthlyData.totalDays > 0;

  const selectedDayCompletedCycles = selectedDay?.cycles.filter(c => c.completed).length || 0;
  const selectedDayWins = selectedDay?.cycles.filter(c => c.completed && c.totalProfit > 0).length || 0;
  const selectedDayWinRate = selectedDayCompletedCycles > 0 ? (selectedDayWins / selectedDayCompletedCycles) * 100 : 0;

  return (
    <div className="space-y-4 pb-4">
      {/* Controle de Mês */}
      <div className="flex items-center justify-between px-2 mb-2">
        <button onClick={prevMonth} className="h-10 w-10 flex items-center justify-center rounded-full text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          <ChevronLeft size={20} />
        </button>
        
        <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 capitalize tracking-tight">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </div>
        
        <button onClick={nextMonth} className="h-10 w-10 flex items-center justify-center rounded-full text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {!hasMonthlyData ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500 rounded-full flex items-center justify-center mb-4">
            <BarChart2 size={24} strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 mb-1">Mês sem operações</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-[250px]">Nenhum dado registrado para {format(currentMonth, 'MMMM', { locale: ptBR })}.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
              <CardContent className="p-4 sm:p-5 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 truncate">Resultado do Mês</span>
                <span className={`text-xl sm:text-2xl font-bold tracking-tight truncate ${monthlyData.totalProfit > 0 ? 'text-emerald-500' : monthlyData.totalProfit < 0 ? 'text-rose-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                  {monthlyData.totalProfit > 0 ? '+' : ''}{formatBRL(monthlyData.totalProfit)}
                </span>
              </CardContent>
            </Card>
            <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
              <CardContent className="p-4 sm:p-5 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 truncate">Dias de Ganho</span>
                <div className="flex items-baseline gap-1 truncate">
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {monthlyData.winRate.toFixed(0)}%
                  </span>
                  <span className="text-[10px] sm:text-xs font-medium text-zinc-400 dark:text-zinc-500">
                    ({monthlyData.totalDays} dias)
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden mt-4">
            <CardContent className="p-3 pt-5 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData.chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <ReferenceLine y={0} stroke="#a1a1aa" strokeWidth={1} opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#a1a1aa' }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#a1a1aa' }} 
                    tickFormatter={(val) => `R$${val}`} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(161, 161, 170, 0.1)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const val = payload[0].value as number;
                        const isProfit = val >= 0;
                        return (
                          <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-2xl shadow-xl">
                            <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                            <p className={`text-base font-bold ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {isProfit ? '+' : ''}{formatBRL(val)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="profit" radius={[4, 4, 4, 4]} maxBarSize={40}>
                    {monthlyData.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden mt-4">
            <CardContent className="p-4 sm:p-6">
              <div className="w-full max-w-sm mx-auto select-none">
                <div className="grid grid-cols-7 mb-4">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-y-2">
                  {days.map((day, idx) => {
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isDayToday = isToday(day);
                    const dayHasData = hasData(day);
                    const dayIsProfit = isProfit(day);
                    const dayIsLoss = isLoss(day);
                    
                    let textClass = "text-zinc-900 dark:text-zinc-100";
                    if (!isCurrentMonth) textClass = "text-zinc-300 dark:text-zinc-700";
                    else if (isDayToday) textClass = "text-zinc-900 dark:text-white font-bold";

                    return (
                      <div key={idx} className="flex flex-col items-center justify-center h-12 relative group">
                        <button 
                          onClick={() => handleSelectDate(day)}
                          disabled={!isCurrentMonth || !dayHasData}
                          className={`h-9 w-9 flex items-center justify-center text-sm rounded-full transition-all duration-200 
                            ${dayHasData ? 'hover:bg-zinc-100 dark:hover:bg-zinc-800' : 'cursor-default'} 
                            ${isDayToday && !dayHasData ? 'bg-zinc-50 dark:bg-zinc-800/50' : ''}
                          `}
                        >
                          <span className={textClass}>{format(day, 'd')}</span>
                        </button>
                        
                        {dayHasData && isCurrentMonth && (
                          <div className={`absolute bottom-0 w-1 h-1 rounded-full ${dayIsProfit ? 'bg-emerald-500' : dayIsLoss ? 'bg-rose-500' : 'bg-zinc-400 dark:bg-zinc-600'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4">
            <Button 
              onClick={() => setExportOpen(true)}
              variant="outline"
              className="w-full h-12 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors text-[13px] sm:text-sm"
            >
              <Download size={18} /> Exportar Relatórios
            </Button>
          </div>
          
          <ExportDialog 
            open={exportOpen} 
            onOpenChange={setExportOpen} 
            data={data} 
            currentMonth={currentMonth} 
          />
        </>
      )}

      {/* MODAL DETALHES DO DIA (Fix de Altura para Mobile) */}
      <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="w-[95vw] sm:max-w-md rounded-[32px] max-h-[90dvh] h-[90dvh] flex flex-col p-0 bg-[#FAFAFA] dark:bg-zinc-950 border-none shadow-2xl [&>button]:hidden outline-none">
          
          <DialogHeader className="p-4 sm:p-5 pb-4 shrink-0 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 rounded-t-[32px] relative text-left">
            <button 
              onClick={() => setSelectedDay(null)}
              className="absolute right-3 sm:right-4 top-3 sm:top-4 h-8 w-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors z-10"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
            
            <div className="flex justify-between items-start pr-10">
              <div className="flex flex-col min-w-0">
                <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2 truncate">
                  {selectedDay && format(parseISO(selectedDay.date), "dd 'de' MMMM", { locale: ptBR })}
                </DialogTitle>
                
                <DialogDescription asChild>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <span className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-[6px] text-[10px] font-bold text-zinc-600 dark:text-zinc-300 shrink-0">
                      <Target size={12} className={selectedDay && selectedDay.dailyProfit >= data.settings.dailyGoal ? "text-emerald-500" : "text-zinc-400"} />
                      {selectedDay ? Math.min((selectedDay.dailyProfit / data.settings.dailyGoal) * 100, 100).toFixed(0) : 0}% meta
                    </span>
                    <span className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-[6px] text-[10px] font-bold text-zinc-600 dark:text-zinc-300 shrink-0">
                      <Percent size={12} className={selectedDayWinRate >= 50 ? "text-emerald-500" : "text-rose-500"} />
                      {selectedDayWinRate.toFixed(0)}% win
                    </span>
                  </div>
                </DialogDescription>
              </div>

              <div className="flex flex-col items-end justify-center mt-0.5 shrink-0 pl-2">
                <span className={`font-bold text-lg sm:text-xl tracking-tight leading-none ${selectedDay && selectedDay.dailyProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {selectedDay && (selectedDay.dailyProfit >= 0 ? '+' : '')}{selectedDay && formatBRL(selectedDay.dailyProfit)}
                </span>
                
                <button 
                  onClick={() => {
                    if (selectedDay) {
                      onEditDay(parseISO(selectedDay.date));
                      setSelectedDay(null);
                    }
                  }}
                  className="flex items-center gap-1.5 mt-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3 py-1.5 rounded-xl transition-colors text-[10px] font-bold uppercase tracking-widest"
                >
                  <Edit2 size={12} />
                  Editar
                </button>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1 px-3 sm:px-6 pb-6">
            <div className="space-y-3 pt-5">
              {selectedDay?.cycles.map((cycle, i) => {
                const isCycleProfit = cycle.totalProfit > 0;
                const isCycleLoss = cycle.totalProfit < 0;
                const cycleNumber = selectedDay.cycles.length - i;

                return (
                  <div key={cycle.id} className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm rounded-[20px] overflow-hidden">
                    <div className="flex justify-between items-center px-3 sm:px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800/50">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${cycle.completed ? (isCycleProfit ? 'bg-emerald-500' : isCycleLoss ? 'bg-rose-500' : 'bg-zinc-300 dark:bg-zinc-700') : 'bg-zinc-900 dark:bg-zinc-100 animate-pulse'}`} />
                        <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                          Ciclo {cycleNumber}
                        </h4>
                      </div>
                      <span className={`text-xs sm:text-sm font-semibold tracking-tight ${cycle.completed ? (isCycleProfit ? 'text-emerald-500' : isCycleLoss ? 'text-rose-500' : 'text-zinc-900 dark:text-zinc-100') : 'text-zinc-400 dark:text-zinc-500'}`}>
                        {cycle.completed ? (isCycleProfit ? '+' : '') + formatBRL(cycle.totalProfit) : 'Pendente'}
                      </span>
                    </div>

                    <div className="p-1 sm:p-1.5 space-y-0.5">
                      {cycle.operations.map((op) => {
                        const opProfit = op.profit || 0;
                        const isOpWin = opProfit > 0;
                        const isOpLoss = opProfit < 0;

                        return (
                          <div key={op.id} className="flex items-center justify-between px-2 sm:px-3 py-2.5 rounded-[14px] bg-zinc-50/50 dark:bg-zinc-800/20">
                            <span className="text-[9px] sm:text-[10px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider w-[18%]">
                              {op.type}
                            </span>
                            
                            <div className="flex flex-col items-start sm:items-center w-[28%]">
                              <span className="text-[7px] sm:text-[8px] uppercase tracking-widest text-zinc-400 font-bold mb-0.5">Entrada</span>
                              <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                                {formatBRL(op.deposit)}
                              </span>
                            </div>

                            <div className="flex flex-col items-start sm:items-center w-[28%]">
                              <span className="text-[7px] sm:text-[8px] uppercase tracking-widest text-zinc-400 font-bold mb-0.5">Saque</span>
                              <span className="text-[11px] sm:text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                {op.withdraw !== null ? formatBRL(op.withdraw) : '-'}
                              </span>
                            </div>

                            <div className="flex flex-col items-end w-[26%]">
                              <span className="text-[7px] sm:text-[8px] uppercase tracking-widest text-zinc-400 font-bold mb-0.5">Lucro</span>
                              <span className={`text-[11px] sm:text-xs font-bold truncate ${op.withdraw !== null ? (isOpWin ? 'text-emerald-500' : isOpLoss ? 'text-rose-500' : 'text-zinc-400') : 'text-zinc-300 dark:text-zinc-700'}`}>
                                {op.withdraw !== null ? (isOpWin ? '+' : '') + formatBRL(opProfit) : '-'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
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