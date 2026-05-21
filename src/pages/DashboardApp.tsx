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
import { LiquidGlassBackground } from '../components/LiquidGlassBackground';

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
  const { resolvedTheme, setTheme } = useTheme();
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

  const todayCompleted = activeData.cycles.filter(c => c.completed).length;

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
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
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
    <div className="h-[100dvh] w-full bg-[#030303] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-white/10 overflow-hidden flex flex-col items-center relative">
      
      {/* Background do Liquid Glass da WWDC25 */}
      <LiquidGlassBackground />

      {/* WRAPPER PRINCIPAL COM POSIÇÃO RELATIVA E Z-INDEX PARA FLUTUAR SOBRE O BACKGROUND */}
      <div className="w-full max-w-[1600px] h-full flex flex-col relative z-10 transition-all duration-300">
        
        {/* TOPO FIXO (Painel Ultra Translúcido) */}
        <div 
          className="px-4 lg:px-8 xl:px-10 shrink-0 z-20 sticky top-0 w-full"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)', paddingBottom: '12px' }}
        >
          <header className="liquid-glass-panel rounded-full px-4 lg:px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1d1d36] to-[#0a0a14] dark:from-white/10 dark:to-white/5 flex items-center justify-center shadow-lg shrink-0 border border-white/10">
                <Wallet size={16} strokeWidth={2.5} className="text-white dark:text-zinc-200" />
              </div>
              <h1 className="text-base font-extrabold tracking-tight text-zinc-950 dark:text-zinc-100 flex items-center gap-[2px] truncate">
                <span>Trade</span><span className="text-zinc-500/80 dark:text-zinc-400">Tracker</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-1.5 shrink-0">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-white/10 rounded-full h-8 w-8 transition-colors">
                {resolvedTheme === 'dark' ? <Sun size={16} strokeWidth={2.5} /> : <Moon size={16} strokeWidth={2.5} />}
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut} className="text-zinc-500 hover:text-rose-400 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-full h-8 w-8 transition-colors">
                <LogOut size={16} strokeWidth={2.5} />
              </Button>
            </div>
          </header>
        </div>

        {/* FEED COM LAYOUT DE COLUNAS NO DESKTOP */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative z-0 pt-2" ref={scrollRef}>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 xl:gap-12 px-4 lg:px-8 xl:px-10 pb-12">
            
            {/* LADO ESQUERDO: Dashboard e Operações */}
            <div className="flex-1 min-w-0 flex flex-col">
              
              <div className="flex flex-col">
                {/* 1. NAVEGADOR DE DATAS (Estilo Vidro Ativo) */}
                <div className="flex items-center justify-between liquid-glass-panel rounded-[24px] p-1.5 mb-5 shadow-lg">
                  <button onClick={() => setActiveDate(subDays(activeDate, 1))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors border border-white/5">
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className="flex flex-col items-center justify-center cursor-pointer select-none px-4" onClick={() => setActiveDate(new Date())}>
                    <span className={`text-[13px] font-black tracking-widest ${isToday(activeDate) ? 'text-zinc-950 dark:text-white' : 'text-cyan-400'}`}>
                      {isToday(activeDate) ? 'HOJE' : format(activeDate, "dd 'de' MMM", { locale: ptBR }).toUpperCase()}
                    </span>
                    {!isToday(activeDate) && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mt-0.5">
                        Voltar p/ Hoje
                      </span>
                    )}
                  </div>

                  <button 
                    onClick={() => setActiveDate(addDays(activeDate, 1))} 
                    disabled={isToday(activeDate)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors disabled:opacity-20 disabled:cursor-not-allowed border border-white/5"
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
                    onOpenSettings={() => setSettingsOpen(true)}
                  />
                </div>

                {/* 3. OPERAÇÕES DO DIA */}
                <div className="mt-8 mb-4 flex items-center justify-between px-2 lg:px-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-wider">Operações do Dia</h3>
                    <span className="text-[10px] font-extrabold tracking-widest uppercase text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/15">
                      {todayCompleted} / {activeData.cycles.length}
                    </span>
                  </div>

                  {activeData.cycles.length > 0 && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => scrollCarousel('left')}
                        className="h-8 w-8 rounded-full border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 shadow-sm transition-all"
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => scrollCarousel('right')}
                        className="h-8 w-8 rounded-full border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 shadow-sm transition-all"
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  {activeData.cycles.length === 0 ? (
                    <div className="liquid-glass-panel border-white/10 rounded-[24px] p-8 flex flex-col items-center justify-center text-center shadow-lg">
                      <Activity size={24} className="text-zinc-500 mb-2.5 animate-pulse" />
                      <p className="text-xs font-semibold text-zinc-400 mb-4">Nenhum ciclo ativo registrado para hoje.</p>
                      <Button 
                        onClick={handleQuickAddCycle} 
                        className="rounded-xl h-11 bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold shadow-lg flex items-center gap-2 px-5 text-xs transition-transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Plus size={16} strokeWidth={2.5} /> Iniciar Novo Ciclo
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
                        relative flex overflow-x-auto gap-4.5 no-scrollbar pb-6 pt-1 -mx-4 px-4 items-stretch cursor-grab active:cursor-grabbing snap-x snap-mandatory touch-pan-x
                        lg:mx-0 lg:px-0 lg:snap-none
                        ${isDragging ? '[&_*]:pointer-events-none' : ''}
                      `}
                    >
                      {/* Botão Novo Ciclo */}
                      <div className="snap-center shrink-0 w-[92vw] sm:w-[360px] flex items-stretch">
                        <button 
                          onClick={handleQuickAddCycle}
                          className="w-full min-h-[190px] rounded-[24px] border border-dashed border-white/20 hover:border-white/40 text-zinc-400 hover:text-white bg-white/[0.01] hover:bg-white/[0.04] flex flex-col items-center justify-center transition-all duration-300 group"
                        >
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:rotate-90 group-hover:scale-110 transition-all duration-300 border border-white/10 shadow-inner">
                            <Plus size={24} strokeWidth={2.5} />
                          </div>
                          <span className="text-sm font-bold tracking-tight text-zinc-300">Novo Ciclo</span>
                          <span className="text-xs text-zinc-500 mt-1 font-medium">Toque para adicionar rapidamente</span>
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
                <h3 className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-wider">Histórico & Metas</h3>
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
          <div className="fixed bottom-6 right-6 z-30">
            <motion.button
              key="chat-toggle-btn"
              onClick={() => setIsChatOpen(true)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#15152b] to-[#0d0d18] dark:from-white dark:to-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/15 dark:border-white/5 transition-all"
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
              key="chat-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[40]"
            />

            {/* Container do Chat */}
            <motion.div
              key="chat-panel-container"
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-6 sm:bottom-6 w-full sm:w-[400px] z-[50]"
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