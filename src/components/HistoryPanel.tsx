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
        <button onClick={prevMonth} className="h-10 w-10 flex items-center justify-center rounded-full text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all">
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
        
        <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 capitalize tracking-tight">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </div>
        
        <button onClick={nextMonth} className="h-10 w-10 flex items-center justify-center rounded-full text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all">
          <ChevronRight size={22} strokeWidth={2.5} />
        </button>
      </div>

      {!hasMonthlyData ? (
        <div className="py-16 flex flex-col items-center justify-center text-center liquid-glass rounded-[32px] border-none">
          <div className="w-16 h-16 bg-black/5 dark:bg-white/5 text-zinc-400 dark:text-zinc-500 rounded-2xl flex items-center justify-center mb-4">
            <BarChart2 size={28} strokeWidth={1.5} />
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-1">Mês sem operações</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-[250px] leading-relaxed">Nenhum dado registrado para {format(currentMonth, 'MMMM', { locale: ptBR })}.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Card className="liquid-glass border-none rounded-[24px] overflow-hidden">
              <CardContent className="p-5 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 truncate">Resultado Mensal</span>
                <span className={`text-2xl font-bold tracking-tight truncate ${monthlyData.totalProfit > 0 ? 'text-emerald-500' : monthlyData.totalProfit < 0 ? 'text-rose-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                  {monthlyData.totalProfit > 0 ? '+' : ''}{formatBRL(monthlyData.totalProfit)}
                </span>
              </CardContent>
            </Card>
            <Card className="liquid-glass border-none rounded-[24px] overflow-hidden">
              <CardContent className="p-5 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 truncate">Taxa de Dias</span>
                <div className="flex items-baseline gap-1 truncate">
                  <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {monthlyData.winRate.toFixed(0)}%
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
                    ({monthlyData.totalDays}D)
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="liquid-glass border-none rounded-[32px] overflow-hidden mt-4">
            <CardContent className="p-4 pt-6 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData.chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <ReferenceLine y={0} stroke="rgba(161, 161, 170, 0.2)" strokeWidth={1} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 600 }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 600 }} 
                    tickFormatter={(val) => `R$${val}`} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const val = payload[0].value as number;
                        const isProfit = val >= 0;
                        return (
                          <div className="liquid-glass !bg-zinc-900 dark:!bg-zinc-100 !border-none p-3 rounded-xl shadow-2xl">
                            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                            <p className={`text-sm font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isProfit ? '+' : ''}{formatBRL(val)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="profit" radius={[4, 4, 4, 4]} maxBarSize={30}>
                    {monthlyData.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="liquid-glass border-none rounded-[32px] overflow-hidden mt-4">
            <CardContent className="p-5 sm:p-7">
              <div className="w-full max-w-sm mx-auto select-none">
                <div className="grid grid-cols-7 mb-5">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-widest">
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
                    else if (isDayToday) textClass = "text-zinc-900 dark:text-white font-black scale-110";

                    return (
                      <div key={idx} className="flex flex-col items-center justify-center h-12 relative group">
                        <button 
                          onClick={() => handleSelectDate(day)}
                          disabled={!isCurrentMonth || !dayHasData}
                          className={`h-10 w-10 flex items-center justify-center text-sm rounded-2xl transition-all duration-300 
                            ${dayHasData ? 'hover:bg-black/5 dark:hover:bg-white/10 active:scale-90' : 'cursor-default'} 
                            ${isDayToday ? 'bg-zinc-900 dark:bg-zinc-100 !text-white dark:!text-zinc-900 shadow-lg shadow-black/10 dark:shadow-white/10' : ''}
                          `}
                        >
                          <span className={`${textClass} transition-colors`}>{format(day, 'd')}</span>
                        </button>
                        
                        {dayHasData && isCurrentMonth && !isDayToday && (
                          <div className={`absolute bottom-0 w-1.5 h-1.5 rounded-full ${dayIsProfit ? 'bg-emerald-500 shadow-emerald-500/50' : dayIsLoss ? 'bg-rose-500 shadow-rose-500/50' : 'bg-zinc-400'}`} />
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
              className="w-full h-14 rounded-[24px] border-none bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 font-bold flex items-center justify-center gap-2 shadow-xl shadow-black/10 dark:shadow-white/10 transition-all text-sm"
            >
              <Download size={20} strokeWidth={2.5} /> Exportar Relatórios
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

      {/* BOTTOM SHEET DETALHES DO DIA (Deslizável) */}
      <Drawer open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DrawerContent className="w-full sm:max-w-md mx-auto rounded-t-[40px] rounded-b-none max-h-[92dvh] flex flex-col p-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl border-none shadow-2xl outline-none overflow-hidden after:hidden">
          <DrawerTitle className="sr-only">Detalhes do Dia</DrawerTitle>
          
          <div className="relative p-8 pt-6 pb-8 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5 shrink-0">
            
            <div className="absolute top-5 left-6 right-6 flex justify-between items-center">
              <button 
                onClick={() => {
                  if (selectedDay) {
                    onEditDay(parseISO(selectedDay.date));
                    setSelectedDay(null);
                  }
                }}
                className="h-9 px-4 flex items-center gap-2 rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 border border-black/5 dark:border-white/5 transition-all text-[11px] font-bold uppercase tracking-widest z-10"
              >
                <Edit2 size={14} />
                Editar
              </button>
              <button 
                onClick={() => setSelectedDay(null)}
                className="h-9 w-9 flex items-center justify-center rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 border border-black/5 dark:border-white/5 transition-all z-10"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex flex-col items-center mt-10">
              <span className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-3">
                {selectedDay && format(parseISO(selectedDay.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </span>
              
              <h2 className={`text-5xl sm:text-6xl font-black tracking-tighter mb-6 ${selectedDay && selectedDay.dailyProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {selectedDay && (selectedDay.dailyProfit >= 0 ? '+' : '')}{selectedDay && formatBRL(selectedDay.dailyProfit)}
              </h2>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 px-4 py-2 rounded-2xl shadow-sm">
                  <Target size={14} className={selectedDay && selectedDay.dailyProfit >= data.settings.dailyGoal ? "text-emerald-500" : "text-zinc-400"} />
                  <span className="text-[12px] font-bold text-zinc-700 dark:text-zinc-300">
                    {selectedDay ? Math.min((selectedDay.dailyProfit / data.settings.dailyGoal) * 100, 100).toFixed(0) : 0}% Meta
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 px-4 py-2 rounded-2xl shadow-sm">
                  <Percent size={14} className={selectedDayWinRate >= 50 ? "text-emerald-500" : "text-rose-500"} />
                  <span className="text-[12px] font-bold text-zinc-700 dark:text-zinc-300">
                    {selectedDayWinRate.toFixed(0)}% Win
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 bg-transparent no-scrollbar">
            <div className="space-y-4 pb-16">
              {selectedDay?.cycles.map((cycle, i) => {
                const isCycleProfit = cycle.totalProfit > 0;
                const isCycleLoss = cycle.totalProfit < 0;
                const cycleNumber = selectedDay.cycles.length - i;
                const timeStr = (cycle as any).createdAt || (cycle as any).timestamp;
                const timeDisplay = timeStr ? format(new Date(timeStr), 'HH:mm') : null;

                return (
                  <div key={cycle.id} className="liquid-glass border-none rounded-[28px] p-5 sm:p-6 shadow-xl shadow-black/5">
                    
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-2xl ${cycle.completed ? (isCycleProfit ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : isCycleLoss ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-black/5 text-zinc-500 dark:bg-white/5 dark:text-zinc-400') : 'bg-blue-500/10 text-blue-500 animate-pulse'}`}>
                          <Activity size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                          <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            Ciclo {cycleNumber}
                            {timeDisplay && (
                              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-lg">
                                {timeDisplay}
                              </span>
                            )}
                          </h4>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-xl font-black tracking-tight ${cycle.completed ? (isCycleProfit ? 'text-emerald-500' : isCycleLoss ? 'text-rose-500' : 'text-zinc-900 dark:text-zinc-100') : 'text-zinc-400 dark:text-zinc-500'}`}>
                          {cycle.completed ? (isCycleProfit ? '+' : '') + formatBRL(cycle.totalProfit) : 'Pendente'}
                        </span>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-0.5">
                          Resultado
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {cycle.operations.map((op) => {
                        const opProfit = op.profit || 0;
                        const isOpWin = opProfit > 0;
                        const isOpLoss = opProfit < 0;

                        return (
                          <div key={op.id} className="flex justify-between items-center p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 transition-all">
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                                {op.type}
                              </span>
                              <span className="text-[13px] font-bold text-zinc-500 dark:text-zinc-400">
                                Entrada: <span className="text-zinc-900 dark:text-zinc-100">{formatBRL(op.deposit)}</span>
                              </span>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1.5">
                              <span className={`text-[13px] font-black ${op.withdraw !== null ? (isOpWin ? 'text-emerald-500' : isOpLoss ? 'text-rose-500' : 'text-zinc-400') : 'text-zinc-300 dark:text-zinc-700'}`}>
                                {op.withdraw !== null ? (isOpWin ? '+' : '') + formatBRL(opProfit) : '-'}
                              </span>
                              <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500">
                                Saída: <span className="text-zinc-700 dark:text-zinc-300">{op.withdraw !== null ? formatBRL(op.withdraw) : '-'}</span>
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