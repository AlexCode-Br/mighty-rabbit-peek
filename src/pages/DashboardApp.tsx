import React, { useState, useEffect, useRef } from 'react';
import { useOperationDays } from '../hooks/useOperationDays';
import { Dashboard } from '../components/Dashboard';
import { GoalSettings } from '../components/GoalSettings';
import { CycleCard } from '../components/CycleCard';
import { HistoryPanel } from '../components/HistoryPanel';
import { ChatPanel } from '../components/ChatPanel';
import { useAuth } from '../components/AuthProvider';
import { LogOut, Activity, Sun, Moon, Plus, Wallet, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
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
  
  // Controle de Data
  const [activeDate, setActiveDate] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Controle de Scroll Horizontal com Mouse (Desktop)
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
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#059669', '#f4f4f5'],
          zIndex: 9999,
        });
        toast.success('Meta Diária Batida! 🎉', {
          description: 'Excelente trabalho! Você alcançou seu objetivo do dia.',
          duration: 6000,
        });
      }

      if (stop > 0 && currentProfit <= -stop && prevProfit > -stop) {
        toast.error('Stop Loss Atingido ⚠️', {
          description: 'Limite diário alcançado. É hora de parar e proteger o capital.',
          duration: 6000,
        });
      }
    }

    prevProfitRef.current = currentProfit;
  }, [activeData.dailyProfit, data.settings.dailyGoal, data.settings.stopLoss, loading, activeDate]);

  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-[#FAFAFA] dark:bg-zinc-950 flex items-center justify-center flex-col gap-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          className="w-8 h-8 border-[3px] border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-zinc-100 rounded-full" 
        />
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
      name: format(d, 'EE', { locale: ptBR }).substring(0, 3),
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
      const scrollAmount = window.innerWidth >= 640 ? 370 : window.innerWidth * 0.85; 
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
          left: target.offsetLeft - 16,
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
    
    showSuccess('Ciclo duplicado com sucesso!');
    scrollToNewCycle();
  };

  const handleUpdateOperation = (cycleId: string, operationId: string, updates: Partial<Operation>) => {
    updateOperation(activeDateId, cycleId, operationId, updates);
  };

  const handleDeleteCycle = (cycleId: string) => {
    deleteCycle(activeDateId, cycleId);
    showSuccess('Ciclo removido.');
  };

  const handleUpdateSettings = (newSettings: any) => {
    updateSettings(newSettings);
    showSuccess('Configurações salvas!');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleEditPastDay = (date: Date) => {
    setActiveDate(date);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    isMouseDown.current = true;
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeft.current = carouselRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isMouseDown.current = false;
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || !carouselRef.current) return;
    
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    
    if (Math.abs(walk) > 5 && !isDragging) {
      setIsDragging(true);
    }
    
    if (isDragging) {
      e.preventDefault();
      carouselRef.current.scrollLeft = scrollLeft.current - walk;
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-[#FAFAFA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 overflow-hidden flex flex-col items-center">
      
      {/* WRAPPER PRINCIPAL */}
      <div className="w-full max-w-[1600px] h-full flex flex-col relative transition-all duration-300">
        
        {/* TOPO FIXO */}
        <div 
          className="px-4 lg:px-8 xl:px-10 shrink-0 z-20 sticky top-0 w-full"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)', paddingBottom: '12px' }}
        >
          <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-zinc-200/60 dark:border-zinc-800/60 rounded-full px-4 lg:px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shadow-sm shrink-0">
                <Wallet size={15} strokeWidth={2.5} className="text-white dark:text-zinc-900" />
              </div>
              <h1 className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-[2px] truncate">
                <span>Trade</span><span className="text-zinc-500 dark:text-zinc-400">Tracker</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full h-8 w-8 transition-colors">
                {theme === 'dark' ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut} className="text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full h-8 w-8 transition-colors">
                <LogOut size={16} strokeWidth={2} />
              </Button>
            </div>
          </header>
        </div>

        {/* FEED COM LAYOUT DE COLUNAS NO DESKTOP */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative z-0 pt-2" ref={scrollRef}>
          <style dangerouslySetInnerHTML={{__html: `
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}} />

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 xl:gap-12 px-4 lg:px-8 xl:px-10 pb-12">
            
            {/* LADO ESQUERDO: Dashboard e Operações */}
            <div className="flex-1 min-w-0 flex flex-col">
              
              <div className="flex flex-col">
                {/* 1. NAVEGADOR DE DATAS */}
                <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[20px] p-1.5 mb-5 shadow-sm">
                  <button onClick={() => setActiveDate(subDays(activeDate, 1))} className="w-10 h-10 flex items-center justify-center rounded-[14px] bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className="flex flex-col items-center justify-center cursor-pointer select-none px-4" onClick={() => setActiveDate(new Date())}>
                    <span className={`text-[13px] font-bold tracking-tight ${isToday(activeDate) ? 'text-zinc-900 dark:text-zinc-100' : 'text-blue-500 dark:text-blue-400'}`}>
                      {isToday(activeDate) ? 'HOJE' : format(activeDate, "dd 'de' MMM", { locale: ptBR }).toUpperCase()}
                    </span>
                    {!isToday(activeDate) && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mt-0.5">
                        Voltar p/ Hoje
                      </span>
                    )}
                  </div>

                  <button 
                    onClick={() => setActiveDate(addDays(activeDate, 1))} 
                    disabled={isToday(activeDate)}
                    className="w-10 h-10 flex items-center justify-center rounded-[14px] bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* 2. DASHBOARD */}
                <div className="space-y-5">
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
                </div>

                {/* 3. OPERAÇÕES DO DIA */}
                <div className="mt-8 mb-3 flex items-center justify-between px-2 lg:px-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Operações do Dia</h3>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-1 rounded-md">
                      {todayCompleted} / {activeData.cycles.length}
                    </span>
                  </div>

                  {activeData.cycles.length > 0 && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => scrollCarousel('left')}
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-sm transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => scrollCarousel('right')}
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-sm transition-colors"
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  {activeData.cycles.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-200/60 dark:border-zinc-800/60 rounded-[20px] p-6 flex flex-col items-center justify-center text-center shadow-sm">
                      <Activity size={20} className="text-zinc-300 dark:text-zinc-600 mb-2" />
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-4">Nenhum ciclo registrado hoje.</p>
                      <Button 
                        onClick={handleQuickAddCycle} 
                        className="rounded-xl h-10 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium shadow-sm flex items-center gap-2 px-4 text-xs"
                      >
                        <Plus size={14} /> Iniciar Ciclo
                      </Button>
                    </div>
                  ) : (
                    <div 
                      ref={carouselRef}
                      onMouseDown={handleMouseDown}
                      onMouseLeave={handleMouseLeave}
                      onMouseUp={handleMouseUp}
                      onMouseMove={handleMouseMove}
                      onTouchStart={() => {
                        isMouseDown.current = false;
                        setIsDragging(false);
                      }}
                      className={`
                        relative flex overflow-x-auto gap-3 no-scrollbar pb-6 pt-1 -mx-4 px-4 items-stretch cursor-grab active:cursor-grabbing snap-x snap-mandatory touch-pan-x
                        lg:mx-0 lg:px-0 lg:snap-none
                        ${isDragging ? '[&_*]:pointer-events-none' : ''}
                      `}
                    >
                      {/* Botão Novo Ciclo */}
                      <div className="snap-center shrink-0 w-[92vw] sm:w-[360px] flex items-stretch">
                        <button 
                          onClick={handleQuickAddCycle}
                          className="w-full min-h-[180px] rounded-[20px] border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 flex flex-col items-center justify-center transition-all group"
                        >
                          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3 group-hover:rotate-90 group-hover:scale-110 transition-all duration-300">
                            <Plus size={24} />
                          </div>
                          <span className="text-[14px] font-bold text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 tracking-tight">Adicionar Novo Ciclo</span>
                          <span className="text-[12px] text-zinc-400 mt-1 font-medium">Toque para adicionar rapidamente</span>
                        </button>
                      </div>

                      <AnimatePresence mode="popLayout">
                        {activeData.cycles.map((cycle, index) => (
                          <CycleCard 
                            key={cycle.id}
                            className="snap-center shrink-0 w-[92vw] sm:w-[360px] h-full" 
                            index={activeData.cycles.length - index} 
                            cycle={cycle}
                            onUpdateOperation={handleUpdateOperation}
                            onDeleteCycle={handleDeleteCycle}
                            onDuplicateCycle={handleDuplicateCycle}
                          />
                        ))}
                      </AnimatePresence>
                      
                      <div className="w-1 shrink-0 lg:hidden" />
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* LADO DIREITO: Histórico (Sidebar no Desktop) */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 mt-8 lg:mt-0">
              <div className="mb-4 px-2 lg:px-0">
                <h3 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Visão Mensal</h3>
              </div>
              <div className="space-y-4">
                <HistoryPanel data={data} onEditDay={handleEditPastDay} />
              </div>
            </div>

          </div>

          {/* Spacer pro final da tela + Safe Area */}
          <div className="w-full lg:hidden" style={{ height: 'calc(env(safe-area-inset-bottom) + 32px)' }}></div>
        </div>
      </div>

      {/* BOTÃO FLUTUANTE SUSPENSO DO CHAT */}
      <AnimatePresence>
        {!isChatOpen && (
          <div className="fixed bottom-6 right-6 z-40">
            <motion.button
              onClick={() => setIsChatOpen(true)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.15)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.05)] border border-zinc-800 dark:border-zinc-200/20 transition-colors"
            >
              <MessageSquare size={22} strokeWidth={2.5} />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* PAINEL DO CHAT SUSPENSO (SLIDE-OVER) */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            {/* Backdrop escuro translúcido */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-black z-45"
            />

            {/* Container do Chat */}
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-6 sm:bottom-6 w-full sm:w-[400px] z-45"
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
        onSave={handleUpdateSettings}
      />
    </div>
  );
}