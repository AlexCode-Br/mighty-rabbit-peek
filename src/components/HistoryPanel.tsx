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
import { ChevronLeft, ChevronRight, X, Target, BarChart2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

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

  // Cálculo dos dados do mês atual para o gráfico e os cards
  const monthlyData = useMemo(() => {
    const daysInMonth = historyDays.filter(day => {
      return isSameMonth(parseISO(day.date), currentMonth);
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let totalProfit = 0;
    let winDays = 0;
    let totalDays = 0;

    const chartData = daysInMonth.map(day => {
      totalProfit += day.dailyProfit;
      if (day.cycles.length > 0) {
        totalDays++;
        if (day.dailyProfit >= 0) winDays++;
      }
      return {
        name: format(parseISO(day.date), 'dd/MM'),
        profit: day.dailyProfit,
      };
    });

    const winRate = totalDays > 0 ? (winDays / totalDays) * 100 : 0;

    return { chartData, totalProfit, winRate, totalDays };
  }, [historyDays, currentMonth]);

  const hasMonthlyData = monthlyData.totalDays > 0;

  return (
    <div className="space-y-4">
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
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-[250px]">Nenhum dado registrado para {format(currentMonth, 'MMMM', { locale: ptBR })}. Comece a operar para ver suas estatísticas aqui.</p>
        </div>
      ) : (
        <>
          {/* Cartões de Resumo do Mês */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
              <CardContent className="p-5 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Resultado do Mês</span>
                <span className={`text-2xl font-bold tracking-tight ${monthlyData.totalProfit > 0 ? 'text-emerald-500' : monthlyData.totalProfit < 0 ? 'text-rose-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                  {monthlyData.totalProfit > 0 ? '+' : ''}{formatBRL(monthlyData.totalProfit)}
                </span>
              </CardContent>
            </Card>
            <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
              <CardContent className="p-5 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Dias de Ganho</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {monthlyData.winRate.toFixed(0)}%
                  </span>
                  <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                    ({monthlyData.totalDays} dias)
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico do Mês */}
          <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
            <CardContent className="p-4 pt-6 h-52">
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

          {/* Calendário */}
          <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden mt-4">
            <CardContent className="p-6">
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
        </>
      )}

      {/* Modal de Detalhes do Dia */}
      <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="sm:max-w-md rounded-[32px] h-[80vh] flex flex-col p-0 bg-[#FAFAFA] dark:bg-zinc-950 border-none shadow-2xl [&>button]:hidden outline-none">
          <DialogHeader className="p-8 pb-6 shrink-0 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 rounded-t-[32px] relative text-left">
            <button 
              onClick={() => setSelectedDay(null)}
              className="absolute right-6 top-6 h-8 w-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
            <DialogTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight pr-10">
              {selectedDay && format(parseISO(selectedDay.date), "dd 'de' MMMM", { locale: ptBR })}
            </DialogTitle>
            
            <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-sm mt-3 flex justify-between items-center pr-8">
              <span className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg text-xs font-medium">
                <Target size={12} className={selectedDay && selectedDay.dailyProfit >= data.settings.dailyGoal ? "text-emerald-500" : "text-zinc-400"} />
                {selectedDay ? Math.min((selectedDay.dailyProfit / data.settings.dailyGoal) * 100, 100).toFixed(0) : 0}% da meta
              </span>
              <div className="flex flex-col items-end">
                <span className={`font-bold text-lg leading-none ${selectedDay && selectedDay.dailyProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {selectedDay && (selectedDay.dailyProfit >= 0 ? '+' : '')}{selectedDay && formatBRL(selectedDay.dailyProfit)}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold mt-1">
                  {selectedDay?.cycles.length} ciclos
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 px-4 sm:px-6 pb-6">
            <div className="space-y-4 pt-6">
              {selectedDay?.cycles.map((cycle, i) => {
                const isCycleProfit = cycle.totalProfit > 0;
                const cycleNumber = selectedDay.cycles.length - i;

                return (
                  <div key={cycle.id} className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                      <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        Ciclo {cycleNumber}
                        {cycle.createdAt && (
                          <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                            • {format(parseISO(cycle.createdAt), 'HH:mm')}
                          </span>
                        )}
                      </h4>
                      <span className={`text-sm font-semibold ${cycle.completed ? (isCycleProfit ? 'text-emerald-500' : cycle.totalProfit < 0 ? 'text-rose-500' : 'text-zinc-900 dark:text-zinc-100') : 'text-zinc-400 dark:text-zinc-500'}`}>
                        {cycle.completed ? (isCycleProfit ? '+' : '') + formatBRL(cycle.totalProfit) : 'Pendente'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {cycle.operations.map((op) => (
                        <div key={op.id} className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-zinc-400 dark:text-zinc-500 w-12">{op.type}</span>
                          <span className="text-zinc-900 dark:text-zinc-100 font-medium">{formatBRL(op.deposit)} <span className="text-zinc-300 dark:text-zinc-600 mx-2">→</span> {op.withdraw !== null ? formatBRL(op.withdraw) : '-'}</span>
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