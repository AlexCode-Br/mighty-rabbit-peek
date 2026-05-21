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
import { ChevronLeft, ChevronRight, X, Target, BarChart2, Percent, Download, Edit2, Activity } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle } from './ui/drawer';
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
        <button onClick={prevMonth} className="h-10 w-10 flex items-center justify-center rounded-full text-zinc-400 dark:text-zinc-500 hover:bg-white/10 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          <ChevronLeft size={20} />
        </button>
        
        <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 capitalize tracking-tight">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </div>
        
        <button onClick={nextMonth} className="h-10 w-10 flex items-center justify-center rounded-full text-zinc-400 dark:text-zinc-500 hover:bg-white/10 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {!hasMonthlyData ? (
        <div className="py-12 flex flex-col items-center justify-center text-center liquid-glass-panel rounded-[32px] border-white/10">
          <div className="w-16 h-16 bg-white/5 text-zinc-400 dark:text-zinc-500 rounded-full flex items-center justify-center mb-4 border border-white/5">
            <BarChart2 size={24} strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 mb-1">Mês sem operações</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-[250px]">Nenhum dado registrado para {format(currentMonth, 'MMMM', { locale: ptBR })}.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Card className="liquid-glass-card rounded-3xl overflow-hidden border-white/10 shadow-sm">
              <CardContent className="p-4 sm:p-5 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 truncate">Resultado do Mês</span>
                <span className={`text-xl sm:text-2xl font-bold tracking-tight truncate ${monthlyData.totalProfit > 0 ? 'text-emerald-500' : monthlyData.totalProfit < 0 ? 'text-rose-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                  {monthlyData.totalProfit > 0 ? '+' : ''}{formatBRL(monthlyData.totalProfit)}
                </span>
              </CardContent>
            </Card>
            <Card className="liquid-glass-card rounded-3xl overflow-hidden border-white/10 shadow-sm">
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

          <Card className="liquid-glass-card rounded-3xl overflow-hidden mt-4 border-white/10 shadow-sm">
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
                          <div className="liquid-glass-panel border-white/20 p-3 rounded-2xl shadow-xl">
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

          <Card className="liquid-glass-card rounded-3xl overflow-hidden mt-4 border-white/10 shadow-sm">
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
                            ${dayHasData ? 'hover:bg-white/10' : 'cursor-default'} 
                            ${isDayToday && !dayHasData ? 'bg-white/5 border border-white/10' : ''}
                          `}
                        >
                          <span className={textClass}>{format(day, 'd')}</span>
                        </button>
                        
                        {dayHasData && isCurrentMonth && (
                          <div className={`absolute bottom-0 w-1 h-1 rounded-full ${dayIsProfit ? 'bg-emerald-500 glass-glow-emerald' : dayIsLoss ? 'bg-rose-500 glass-glow-rose' : 'bg-zinc-400 dark:bg-zinc-600'}`} />
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
              className="w-full h-12 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-700 dark:text-zinc-300 font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors text-[13px] sm:text-sm"
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

      {/* BOTTOM SHEET DETALHES DO DIA (Liquid Glass treatment) */}
      <Drawer open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DrawerContent className="w-full sm:max-w-md mx-auto rounded-t-[32px] rounded-b-none max-h-[88dvh] flex flex-col p-0 liquid-glass-panel border-white/20 shadow-2xl outline-none overflow-hidden after:hidden">
          <DrawerTitle className="sr-only">Detalhes do Dia</DrawerTitle>
          
          <div className="relative p-6 pt-2 pb-6 shrink-0">
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
              <button 
                onClick={() => {
                  if (selectedDay) {
                    onEditDay(parseISO(selectedDay.date));
                    setSelectedDay(null);
                  }
                }}
                className="h-8 px-3 flex items-center gap-1.5 rounded-full bg-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-white/20 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-[10px] font-bold uppercase tracking-widest z-10"
              >
                <Edit2 size={12} />
                Editar
              </button>
              <button 
                onClick={() => setSelectedDay(null)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 text-zinc-500 hover:bg-white/20 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors z-10"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex flex-col items-center mt-6">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">
                {selectedDay && format(parseISO(selectedDay.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </span>
              
              <h2 className={`text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 ${selectedDay && selectedDay.dailyProfit >= 0 ? 'text-emerald-500 drop-shadow-[0_4px_12px_rgba(16,185,129,0.2)]' : 'text-rose-500 drop-shadow-[0_4px_12px_rgba(244,63,94,0.2)]'}`}>
                {selectedDay && (selectedDay.dailyProfit >= 0 ? '+' : '')}{selectedDay && formatBRL(selectedDay.dailyProfit)}
              </h2>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                  <Target size={12} className={selectedDay && selectedDay.dailyProfit >= data.settings.dailyGoal ? "text-emerald-500" : "text-zinc-400"} />
                  <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                    {selectedDay ? Math.min((selectedDay.dailyProfit / data.settings.dailyGoal) * 100, 100).toFixed(0) : 0}% Meta
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                  <Percent size={12} className={selectedDayWinRate >= 50 ? "text-emerald-500" : "text-rose-500"} />
                  <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                    {selectedDayWinRate.toFixed(0)}% Win
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
            <div className="space-y-4 pb-12">
              {selectedDay?.cycles.map((cycle, i) => {
                const isCycleProfit = cycle.totalProfit > 0;
                const isCycleLoss = cycle.totalProfit < 0;
                const cycleNumber = selectedDay.cycles.length - i;
                const timeStr = (cycle as any).createdAt || (cycle as any).timestamp;
                const timeDisplay = timeStr ? format(new Date(timeStr), 'HH:mm') : null;

                return (
                  <div key={cycle.id} className="liquid-glass-card rounded-[24px] p-4 sm:p-5 shadow-sm border-white/10">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex items-center justify-center w-7 h-7 rounded-full ${cycle.completed ? (isCycleProfit ? 'bg-emerald-500/20 text-emerald-400' : isCycleLoss ? 'bg-rose-500/20 text-rose-400' : 'bg-zinc-800 text-zinc-400') : 'bg-zinc-800 animate-pulse'}`}>
                          <Activity size={14} strokeWidth={2.5} />
                        </div>
                        <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          Ciclo {cycleNumber}
                          {timeDisplay && (
                            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded-md">
                              {timeDisplay}
                            </span>
                          )}
                        </h4>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-base sm:text-lg font-extrabold tracking-tight ${cycle.completed ? (isCycleProfit ? 'text-emerald-500' : isCycleLoss ? 'text-rose-500' : 'text-zinc-900 dark:text-zinc-100') : 'text-zinc-400 dark:text-zinc-500'}`}>
                          {cycle.completed ? (isCycleProfit ? '+' : '') + formatBRL(cycle.totalProfit) : 'Pendente'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {cycle.operations.map((op) => {
                        const opProfit = op.profit || 0;
                        return (
                          <div key={op.id} className="flex justify-between items-center p-3 sm:p-3.5 rounded-[16px] bg-white/5 border border-white/5">
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{op.type}</span>
                              <span className="text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                                Entrada: <span className="text-zinc-900 dark:text-zinc-100">{formatBRL(op.deposit)}</span>
                              </span>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              <span className={`text-xs sm:text-sm font-bold ${op.withdraw !== null ? (opProfit > 0 ? 'text-emerald-500' : opProfit < 0 ? 'text-rose-500' : 'text-zinc-400') : 'text-zinc-600'}`}>
                                {op.withdraw !== null ? (opProfit > 0 ? '+' : '') + formatBRL(opProfit) : '-'}
                              </span>
                              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                                Saída: <span className="text-zinc-600 dark:text-zinc-400">{op.withdraw !== null ? formatBRL(op.withdraw) : '-'}</span>
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
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}