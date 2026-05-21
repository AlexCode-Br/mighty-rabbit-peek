import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOperationDays } from '../hooks/useOperationDays';
import { Dashboard } from '../components/Dashboard';
import { GoalSettings } from '../components/GoalSettings';
import { CycleCard } from '../components/CycleCard';
import { HistoryPanel } from '../components/HistoryPanel';
import { ChatPanel } from '../components/ChatPanel';
import { DaySelector } from '../components/DaySelector';
import { useAuth } from '../components/AuthProvider';
import { LogOut, Activity, Sun, Moon, Plus, Wallet, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { showSuccess } from '../utils/toast';
import { format, isToday } from 'date-fns';
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
  const [activeDate, setActiveDate] = useState(new Date());
  const [isDragging, setIsDragging] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const prevProfitRef = useRef<number | null>(null);

  const { signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

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

  const scrollCarousel = useCallback((direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = window.innerWidth >= 640 ? 370 : window.innerWidth * 0.85; 
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }, []);

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
    
    setTimeout(() => {
      if (carouselRef.current && carouselRef.current.children[1]) {
        const container = carouselRef.current;
        const target = container.children[1] as HTMLElement;
        container.scrollTo({ left: target.offsetLeft - 16, behavior: 'smooth' });
      }
    }, 100);
  };

  // Drag and Scroll Handlers
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

  if (loading) return null;

  return (
    <div className="h-[100dvh] w-full bg-[#030303] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-white/10 overflow-hidden flex flex-col items-center relative">
      <LiquidGlassBackground />

      <div className="w-full max-w-[1600px] h-full flex flex-col relative z-10">
        
        <div className="px-4 lg:px-8 xl:px-10 shrink-0 z-20 sticky top-0 w-full pt-[calc(env(safe-area-inset-top)+12px)] pb-3">
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
              <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-white/10 rounded-full h-8 w-8">
                {resolvedTheme === 'dark' ? <Sun size={16} strokeWidth={2.5} /> : <Moon size={16} strokeWidth={2.5} />}
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut} className="text-zinc-500 hover:text-rose-400 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-full h-8 w-8">
                <LogOut size={16} strokeWidth={2.5} />
              </Button>
            </div>
          </header>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar relative z-0 pt-2" ref={scrollRef}>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 xl:gap-12 px-4 lg:px-8 xl:px-10 pb-12">
            
            <div className="flex-1 min-w-0 flex flex-col">
              <DaySelector activeDate={activeDate} onChangeDate={setActiveDate} />

              <Dashboard 
                dailyProfit={activeData.dailyProfit}
                dailyGoal={data.settings.dailyGoal}
                stopLoss={data.settings.stopLoss}
                onOpenSettings={() => setSettingsOpen(true)}
              />

              <div className="mt-8 mb-4 flex items-center justify-between px-2 lg:px-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-wider">Operações do Dia</h3>
                  <span className="text-[10px] font-extrabold tracking-widest uppercase text-zinc-500 bg-zinc-500/10 px-2.5 py-1 rounded-full border border-zinc-500/15">
                    {activeData.cycles.filter(c => c.completed).length} / {activeData.cycles.length}
                  </span>
                </div>

                {activeData.cycles.length > 0 && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Button variant="outline" size="icon" onClick={() => scrollCarousel('left')} className="h-8 w-8 rounded-full border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 shadow-sm"><ChevronLeft size={16} /></Button>
                    <Button variant="outline" size="icon" onClick={() => scrollCarousel('right')} className="h-8 w-8 rounded-full border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 shadow-sm"><ChevronRight size={16} /></Button>
                  </div>
                )}
              </div>

              <div>
                {activeData.cycles.length === 0 ? (
                  <div className="liquid-glass-panel border-white/10 rounded-[24px] p-8 flex flex-col items-center justify-center text-center shadow-lg">
                    <Activity size={24} className="text-zinc-500 mb-2.5 animate-pulse" />
                    <p className="text-xs font-semibold text-zinc-400 mb-4">Nenhum ciclo ativo registrado para hoje.</p>
                    <Button onClick={handleQuickAddCycle} className="rounded-xl h-11 bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold shadow-lg flex items-center gap-2 px-5 text-xs transition-transform hover:scale-[1.02]">
                      <Plus size={16} strokeWidth={2.5} /> Iniciar Novo Ciclo
                    </Button>
                  </div>
                ) : (
                  <div 
                    ref={carouselRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={() => { isMouseDown.current = false; setIsDragging(false); }}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    className={`relative flex overflow-x-auto gap-4.5 no-scrollbar pb-6 pt-1 -mx-4 px-4 items-stretch cursor-grab active:cursor-grabbing snap-x snap-mandatory touch-pan-y lg:mx-0 lg:px-0 lg:snap-none ${isDragging ? '[&_*]:pointer-events-none' : ''}`}
                  >
                    <div className="snap-center shrink-0 w-[92vw] sm:w-[360px] flex items-stretch">
                      <button onClick={handleQuickAddCycle} className="w-full min-h-[190px] rounded-[24px] border border-dashed border-white/20 hover:border-white/40 text-zinc-400 hover:text-white bg-white/[0.01] hover:bg-white/[0.04] flex flex-col items-center justify-center transition-all duration-300 group">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:rotate-90 group-hover:scale-110 transition-all border border-white/10 shadow-inner"><Plus size={24} strokeWidth={2.5} /></div>
                        <span className="text-sm font-bold tracking-tight text-zinc-300">Novo Ciclo</span>
                      </button>
                    </div>

                    <AnimatePresence mode="popLayout">
                      {activeData.cycles.map((cycle, index) => (
                        <CycleCard 
                          key={cycle.id}
                          className="snap-center shrink-0 w-[92vw] sm:w-[360px] h-full" 
                          index={activeData.cycles.length - index} 
                          cycle={cycle}
                          onUpdateOperation={(cycleId, opId, updates) => updateOperation(activeDateId, cycleId, opId, updates)}
                          onDeleteCycle={(id) => { deleteCycle(activeDateId, id); showSuccess('Ciclo removido.'); }}
                          onDuplicateCycle={(c) => { 
                            let iso = new Date().toISOString();
                            if (!isToday(activeDate)) {
                              const d = new Date(activeDate); d.setHours(12,0,0,0); iso = d.toISOString();
                            }
                            addCycle(activeDateId, { maeDeposit: c.operations[0].deposit, maeWithdraw: null, maeBau: c.operations[0].bau ?? false, filhaDeposit: c.operations[1].deposit, filhaWithdraw: null }, iso);
                            showSuccess('Ciclo duplicado!');
                          }}
                        />
                      ))}
                    </AnimatePresence>
                    <div className="w-1 shrink-0 lg:hidden" />
                  </div>
                )}
              </div>
            </div>

            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 mt-8 lg:mt-0">
              <div className="mb-4 px-2 lg:px-0"><h3 className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-wider">Histórico & Metas</h3></div>
              <HistoryPanel data={data} onEditDay={(d) => { setActiveDate(d); scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {!isChatOpen && (
          <div className="fixed bottom-6 right-6 z-30">
            <motion.button key="chat-toggle" onClick={() => setIsChatOpen(true)} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} whileHover={{ scale: 1.05 }} className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#15152b] to-[#0d0d18] dark:from-white dark:to-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center shadow-2xl border border-white/15"><MessageSquare size={22} strokeWidth={2.5} /></motion.button>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div key="chat-bg" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setIsChatOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[40]" />
            <motion.div key="chat-panel" initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-6 sm:bottom-6 w-full sm:w-[400px] z-[50]">
              <ChatPanel messages={data.chatMessages || []} onSendMessage={addChatMessage} onUpdateMessage={updateChatMessage} onDeleteMessage={deleteChatMessage} onClearChat={clearChatMessages} onClose={() => setIsChatOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <GoalSettings open={settingsOpen} onOpenChange={setSettingsOpen} settings={data.settings} onSave={(s) => { updateSettings(s); showSuccess('Configurações salvas!'); }} />
    </div>
  );
}