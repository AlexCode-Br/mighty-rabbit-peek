import React, { useState, useEffect, useRef } from 'react';
import { useOperationDays } from '../hooks/useOperationDays';
import { Dashboard } from '../components/Dashboard';
import { GoalSettings } from '../components/GoalSettings';
import { CycleCard } from '../components/CycleCard';
import { HistoryPanel } from '../components/HistoryPanel';
import { ChatPanel } from '../components/ChatPanel';
import { useAuth } from '../components/AuthProvider';
import { LogOut, Sun, Moon, Plus, Wallet, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { showSuccess } from '../utils/toast';
import { subDays, addDays, format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Cycle, Operation } from '../types';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export default function DashboardApp() {
  const { 
    data, 
    loading, 
    getDayData, 
    updateSettings, 
    addCycle, 
    updateOperation, 
    deleteCycle,
    addChatMessage,
    updateChatMessage,
    deleteChatMessage,
    clearChatMessages
  } = useOperationDays();
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeDate, setActiveDate] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const prevProfitRef = useRef<number | null>(null);

  const activeDateId = format(activeDate, 'yyyy-MM-dd');
  const activeData = getDayData(activeDateId);

  useEffect(() => {
    if (loading) return;

    if (!isToday(activeDate)) {
      prevProfitRef.current = activeData.dailyProfit;
      return;
    }

    const prevProfit = prevProfitRef.current;
    const currentProfit = activeData.dailyProfit;
    const goal = data.settings.dailyGoal;
    const stop = data.settings.stopLoss;

    if (prevProfit !== null) {
      if (goal > 0 && currentProfit >= goal && prevProfit < goal) {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#059669', '#ffffff'],
          zIndex: 9999,
        });
        toast.success('Meta Diária Batida! 🎉', {
          description: 'Você alcançou seu objetivo. Performance incrível!',
          duration: 6000,
        });
      }

      if (stop > 0 && currentProfit <= -stop && prevProfit > -stop) {
        toast.error('Stop Loss Atingido ⚠️', {
          description: 'Limite diário alcançado. Proteja seu capital hoje.',
          duration: 6000,
        });
      }
    }

    prevProfitRef.current = currentProfit;
  }, [activeData.dailyProfit, data.settings.dailyGoal, data.settings.stopLoss, loading, activeDate]);

  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-background flex items-center justify-center flex-col gap-6">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-zinc-100 rounded-full" 
        />
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] animate-pulse">Sincronizando Dados...</p>
      </div>
    );
  }

  const todayWins = activeData.cycles.filter(c => c.completed && c.totalProfit > 0).length;
  const todayLosses = activeData.cycles.filter(c => c.completed && c.totalProfit < 0).length;
  const todayCompleted = activeData.cycles.filter(c => c.completed).length;

  const now = new Date();
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(now, 6 - i);
    const dayId = format(d, 'yyyy-MM-dd');
    const dayData = data.history[dayId];
    return {
      name: format(d, 'EE', { locale: ptBR }).substring(0, 3).toUpperCase(),
      profit: dayData ? dayData.dailyProfit : 0,
      hasData: !!dayData && dayData.cycles.length > 0
    };
  });

  const weeklyProfit = last7DaysData.reduce((acc, day) => acc + day.profit, 0);
  const weeklyActiveDays = last7DaysData.filter(day => day.hasData).length;
  const weeklyWinDays = last7DaysData.filter(day => day.profit >= 0 && day.hasData).length;
  const weeklyWinRate = weeklyActiveDays > 0 ? (weeklyWinDays / weeklyActiveDays) * 100 : 0;

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = window.innerWidth >= 640 ? 400 : window.innerWidth * 0.9; 
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollToNewCycle = () => {
    setTimeout(() => {
      if (carouselRef.current && carouselRef.current.children[1]) {
        const container = carouselRef.current;
        const target = container.children[1] as HTMLElement;
        container.scrollTo({
          left: target.offsetLeft - 24,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleQuickAddCycle = () => {
    let isoStr = new Date().toISOString();
    if (!isToday(activeDate)) {
      const pastDate = new Date(activeDate);
      pastDate.setHours(12, 0, 0, 0);
      isoStr = pastDate.toISOString();
    }

    addCycle(activeDateId, {
      maeDeposit: data.settings.defaultMaeDeposit,
      maeWithdraw: null,
      maeBau: true,
      filhaDeposit: data.settings.defaultFilhaDeposit,
      filhaWithdraw: null
    }, isoStr);
    
    scrollToNewCycle();
  };

  const handleDuplicateCycle = (cycle: Cycle) => {
    let isoStr = new Date().toISOString();
    if (!isToday(activeDate)) {
      const pastDate = new Date(activeDate);
      pastDate.setHours(12, 0, 0, 0);
      isoStr = pastDate.toISOString();
    }

    addCycle(activeDateId, {
      maeDeposit: cycle.operations[0].deposit,
      maeWithdraw: null,
      maeBau: cycle.operations[0].bau ?? false,
      filhaDeposit: cycle.operations[1].deposit,
      filhaWithdraw: null
    }, isoStr);
    
    showSuccess('Entradas duplicadas!');
    scrollToNewCycle();
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    isMouseDown.current = true;
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeft.current = carouselRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || !carouselRef.current) return;
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 5 && !isDragging) setIsDragging(true);
    if (isDragging) {
      e.preventDefault();
      carouselRef.current.scrollLeft = scrollLeft.current - walk;
    }
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
    setTimeout(() => setIsDragging(false), 50);
  };

  return (
    <div className="h-[100dvh] w-full text-zinc-900 dark:text-zinc-100 font-sans selection:bg-blue-500/20 overflow-hidden flex flex-col items-center">
      
      {/* WRAPPER PRINCIPAL */}
      <div className="w-full max-w-[1400px] h-full flex flex-col relative transition-all duration-300">
        
        {/* TOPO FIXO - LIQUID GLASS STYLE */}
        <div 
          className="px-6 lg:px-10 shrink-0 z-30 sticky top-0 w-full"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)', paddingBottom: '16px' }}
        >
          <header className="liquid-glass border-none rounded-full px-6 lg:px-8 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shadow-lg shadow-black/10 dark:shadow-white/10 shrink-0">
                <Wallet size={20} strokeWidth={2.5} className="text-white dark:text-zinc-900" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-[1px]">
                <span>Trade</span><span className="text-zinc-500 dark:text-zinc-400">Tracker</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl h-10 w-10 transition-all">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut} className="text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl h-10 w-10 transition-all">
                <LogOut size={20} />
              </Button>
            </div>
          </header>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative z-0 pt-2" ref={scrollRef}>
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 px-6 lg:px-10 pb-20">
            
            {/* COLUNA ESQUERDA: Dash & Cycles */}
            <div className="flex-1 min-w-0 flex flex-col">
              
              {/* NAVEGADOR DE DATAS - LIQUID GLASS */}
              <div className="liquid-glass border-none rounded-[28px] p-2 mb-6 flex items-center justify-between">
                <button onClick={() => setActiveDate(subDays(activeDate, 1))} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all active:scale-90">
                  <ChevronLeft size={24} strokeWidth={2.5} />
                </button>
                
                <div className="flex flex-col items-center justify-center cursor-pointer select-none px-6 py-1 active:scale-95 transition-transform" onClick={() => setActiveDate(new Date())}>
                  <span className={`text-[14px] font-black tracking-widest ${isToday(activeDate) ? 'text-zinc-900 dark:text-zinc-100' : 'text-blue-500'}`}>
                    {isToday(activeDate) ? 'HOJE' : format(activeDate, "dd 'de' MMM", { locale: ptBR }).toUpperCase()}
                  </span>
                  {!isToday(activeDate) && (
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-0.5">
                      Resetar
                    </span>
                  )}
                </div>

                <button 
                  onClick={() => setActiveDate(addDays(activeDate, 1))} 
                  disabled={isToday(activeDate)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all active:scale-90 disabled:opacity-20"
                >
                  <ChevronRight size={24} strokeWidth={2.5} />
                </button>
              </div>

              {/* DASHBOARD */}
              <Dashboard 
                dailyProfit={activeData.dailyProfit}
                dailyGoal={data.settings.dailyGoal}
                stopLoss={data.settings.stopLoss}
                cyclesCount={activeData.cycles.length}
                todayWins={todayWins}
                todayLosses={todayLosses}
                weeklyProfit={weeklyProfit}
                weeklyWinRate={weeklyWinRate}
                weeklyChartData={last7DaysData}
                onOpenSettings={() => setSettingsOpen(true)}
              />

              {/* TÍTULO SEÇÃO CICLOS */}
              <div className="mt-10 mb-5 flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight uppercase">Ciclos</h3>
                  <div className="h-px w-8 bg-zinc-200 dark:bg-zinc-800" />
                  <span className="text-[11px] font-black tracking-[0.2em] uppercase text-zinc-400">
                    {todayCompleted}/{activeData.cycles.length} CONCLUÍDOS
                  </span>
                </div>

                {activeData.cycles.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => scrollCarousel('left')} className="h-9 w-9 rounded-2xl bg-black/5 dark:bg-white/5 text-zinc-500 hover:text-zinc-900 transition-all active:scale-90"><ChevronLeft size={18} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => scrollCarousel('right')} className="h-9 w-9 rounded-2xl bg-black/5 dark:bg-white/5 text-zinc-500 hover:text-zinc-900 transition-all active:scale-90"><ChevronRight size={18} /></Button>
                  </div>
                )}
              </div>

              {/* CAROUSEL DE CICLOS */}
              <div className="relative">
                {activeData.cycles.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="liquid-glass border-none rounded-[32px] p-10 flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-16 h-16 rounded-3xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-5">
                      <Plus size={32} className="text-zinc-300 dark:text-zinc-600" />
                    </div>
                    <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-6">Nenhum ciclo ativo para esta data.</p>
                    <Button 
                      onClick={handleQuickAddCycle} 
                      className="rounded-2xl h-14 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black shadow-2xl shadow-black/10 transition-all active:scale-95 px-8"
                    >
                      INICIAR PRIMEIRO CICLO
                    </Button>
                  </motion.div>
                ) : (
                  <div 
                    ref={carouselRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={() => { isMouseDown.current = false; setIsDragging(false); }}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    className={`
                      relative flex overflow-x-auto gap-4 no-scrollbar pb-10 pt-2 -mx-6 px-6 cursor-grab active:cursor-grabbing snap-x snap-mandatory touch-pan-x
                      lg:mx-0 lg:px-0 lg:snap-none ${isDragging ? '[&_*]:pointer-events-none' : ''}
                    `}
                  >
                    {/* BOTÃO ADICIONAR NO CAROUSEL */}
                    <div className="snap-center shrink-0 w-[88vw] sm:w-[380px] flex">
                      <button 
                        onClick={handleQuickAddCycle}
                        className="liquid-glass w-full min-h-[220px] rounded-[32px] border-2 border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center transition-all group hover:bg-black/5 dark:hover:bg-white/5 active:scale-95"
                      >
                        <div className="w-14 h-14 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-90 transition-all duration-500 shadow-xl shadow-black/10">
                          <Plus size={28} className="text-white dark:text-zinc-900" />
                        </div>
                        <span className="text-base font-black text-zinc-900 dark:text-zinc-100 tracking-tight uppercase">Novo Ciclo</span>
                        <span className="text-[10px] text-zinc-400 mt-2 font-bold uppercase tracking-[0.2em]">Adicionar Manualmente</span>
                      </button>
                    </div>

                    <AnimatePresence mode="popLayout">
                      {activeData.cycles.map((cycle, index) => (
                        <CycleCard 
                          key={cycle.id}
                          className="snap-center shrink-0 w-[88vw] sm:w-[380px] h-full" 
                          index={activeData.cycles.length - index} 
                          cycle={cycle}
                          onUpdateOperation={handleUpdateOperation}
                          onDeleteCycle={handleDeleteCycle}
                          onDuplicateCycle={handleDuplicateCycle}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>

            {/* COLUNA DIREITA: Monthly History (Sidebar) */}
            <div className="w-full lg:w-[420px] shrink-0">
              <HistoryPanel data={data} onEditDay={(date) => { setActiveDate(date); scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            </div>

          </div>
        </div>
      </div>

      {/* CHAT FLOATING BUTTON - LIQUID GLASS */}
      <AnimatePresence>
        {!isChatOpen && (
          <div className="fixed bottom-8 right-8 z-40">
            <motion.button
              onClick={() => setIsChatOpen(true)}
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 20 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="liquid-glass !bg-zinc-900 dark:!bg-zinc-100 !border-none w-16 h-16 rounded-[24px] flex items-center justify-center shadow-2xl shadow-black/20 dark:shadow-white/10"
            >
              <MessageSquare size={28} strokeWidth={2.5} className="text-white dark:text-zinc-900" />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* CHAT PANEL - SLIDE OVER */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} onClick={() => setIsChatOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-8 sm:bottom-8 w-full sm:w-[440px] z-50"
            >
              <ChatPanel 
                messages={data.chatMessages || []}
                onSendMessage={addChatMessage}
                onUpdateMessage={updateChatMessage}
                onDeleteMessage={deleteChatMessage}
                onClearChat={clearChatMessages}
                onClose={() => setIsChatOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <GoalSettings 
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={data.settings}
        onSave={(newSet) => { updateSettings(newSet); showSuccess('Ajustes salvos!'); }}
      />
    </div>
  );
}