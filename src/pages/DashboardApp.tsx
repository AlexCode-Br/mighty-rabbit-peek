import React, { useState, useEffect, useRef } from 'react';
import { useOperationDays, AddCycleData } from '../hooks/useOperationDays';
import { Dashboard } from '../components/Dashboard';
import { GoalSettings } from '../components/GoalSettings';
import { CycleCard } from '../components/CycleCard';
import { HistoryPanel } from '../components/HistoryPanel';
import { NewCycleDialog } from '../components/NewCycleDialog';
import { useAuth } from '../components/AuthProvider';
import { LogOut, Activity, CalendarDays, Home, Sun, Moon, Plus, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { showSuccess, showError } from '../utils/toast';
import { subDays, addDays, format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Cycle } from '../types';
import { formatBRL } from '../utils/currency';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export default function DashboardApp() {
  const { data, loading, getDayData, updateSettings, addCycle, updateOperation, deleteCycle } = useOperationDays();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newCycleOpen, setNewCycleOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ciclos' | 'home' | 'historico'>('home');
  
  // Estado que controla a data atual sendo visualizada/editada
  const [activeDate, setActiveDate] = useState(new Date());
  
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const prevProfitRef = useRef<number | null>(null);

  const activeDateId = format(activeDate, 'yyyy-MM-dd');
  const activeData = getDayData(activeDateId);

  useEffect(() => {
    if (loading) return;

    // Só exibe Confetti e Notificações de Meta/Stop se estiver visualizando HOJE
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

  const handleSaveNewCycle = (cycleData: AddCycleData) => {
    let isoStr = new Date().toISOString();
    if (!isToday(activeDate)) {
      const pastDate = new Date(activeDate);
      pastDate.setHours(12, 0, 0, 0);
      isoStr = pastDate.toISOString();
    }

    addCycle(activeDateId, cycleData, isoStr);
    setNewCycleOpen(false);
    showSuccess(isToday(activeDate) ? 'Ciclo adicionado com sucesso!' : 'Ciclo adicionado ao dia anterior!');
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
    setActiveTab('home');
  };

  return (
    <div className="h-[100dvh] w-full bg-[#FAFAFA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 overflow-hidden flex flex-col items-center">
      <div className="w-full max-w-md h-full flex flex-col relative bg-[#FAFAFA] dark:bg-zinc-950 sm:border-x border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl">
        
        {/* TOPO FIXO com Safe Area do iOS */}
        <div 
          className="px-4 shrink-0 z-20 sticky top-0 bg-[#FAFAFA] dark:bg-zinc-950"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)', paddingBottom: '12px' }}
        >
          <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-zinc-200/60 dark:border-zinc-800/60 rounded-full px-4 py-2.5 flex items-center justify-between">
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

        {/* MEIO: Área rolavel */}
        <div className="flex-1 px-4 overflow-y-auto no-scrollbar relative z-0 pb-6">
          <style dangerouslySetInnerHTML={{__html: `
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}} />

          {/* NAVEGADOR DE DATAS (Apenas nas abas Home e Ciclos) */}
          {(activeTab === 'home' || activeTab === 'ciclos') && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[20px] p-1.5 mb-5 shadow-sm mt-1">
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
            </motion.div>
          )}

          {activeTab === 'home' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="space-y-5">
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
                onNewCycle={() => setNewCycleOpen(true)}
                onOpenSettings={() => setSettingsOpen(true)}
              />
            </motion.div>
          )}

          {activeTab === 'ciclos' && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
              {activeData.cycles.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-full flex items-center justify-center mb-4">
                    <Activity size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 mb-1">Nenhum ciclo {isToday(activeDate) ? 'hoje' : 'neste dia'}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-[250px] mx-auto">
                    Nenhuma operação registrada em {format(activeDate, "dd/MM/yyyy")}.
                  </p>
                  <Button 
                    onClick={() => setNewCycleOpen(true)} 
                    className="mt-6 rounded-2xl h-12 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] flex items-center gap-2 px-6"
                  >
                    <Plus size={18} /> Adicionar Ciclo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[20px] p-4 flex items-center justify-between shadow-sm">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-0.5 truncate">Lucro do Dia</span>
                      <span className={`text-xl font-bold tracking-tight truncate block ${activeData.dailyProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {activeData.dailyProfit >= 0 ? '+' : ''}{formatBRL(activeData.dailyProfit)}
                      </span>
                    </div>
                    <div className="h-8 w-[1px] bg-zinc-100 dark:bg-zinc-800 shrink-0 mx-2" />
                    <div className="text-right min-w-0">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-0.5 truncate">Concluídos</span>
                      <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 truncate block">
                        {todayCompleted} <span className="text-sm text-zinc-400 dark:text-zinc-500">/ {activeData.cycles.length}</span>
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => setNewCycleOpen(true)}
                    variant="outline"
                    className="w-full h-14 rounded-3xl border-dashed border-2 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 font-semibold flex items-center justify-center gap-2 mb-2 transition-all"
                  >
                    <Plus size={18} /> Adicionar Novo Ciclo
                  </Button>
                  
                  <AnimatePresence mode="popLayout">
                    {activeData.cycles.map((cycle, index) => (
                      <CycleCard 
                        key={cycle.id}
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
            </motion.div>
          )}

          {activeTab === 'historico' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
              <HistoryPanel data={data} onEditDay={handleEditPastDay} />
            </motion.div>
          )}
        </div>

        {/* BASE FIXA com Safe Area do iOS */}
        <div 
          className="shrink-0 bg-white dark:bg-zinc-900 border-t border-zinc-200/60 dark:border-zinc-800/60 px-6 sm:px-8 flex justify-between items-center shadow-[0_-4px_20px_rgb(0,0,0,0.02)] z-20"
          style={{ paddingTop: '8px', paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
        >
          <NavButton 
            active={activeTab === 'ciclos'} 
            onClick={() => setActiveTab('ciclos')} 
            icon={<Activity size={22} />} 
            label="Ciclos" 
          />
          <NavButton 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
            icon={<Home size={22} />} 
            label="Início" 
          />
          <NavButton 
            active={activeTab === 'historico'} 
            onClick={() => setActiveTab('historico')} 
            icon={<CalendarDays size={22} />} 
            label="Histórico" 
          />
        </div>

      </div>

      <GoalSettings 
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={data.settings}
        onSave={handleUpdateSettings}
      />

      <NewCycleDialog 
        open={newCycleOpen} 
        onOpenChange={setNewCycleOpen} 
        settings={data.settings}
        onSave={handleSaveNewCycle} 
      />
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-200 relative ${
        active ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-600 dark:hover:text-zinc-300'
      }`}
    >
      <div className={`mb-1 transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
        {icon}
      </div>
      <span className={`text-[10px] tracking-wide transition-all ${active ? 'font-bold' : 'font-medium'}`}>
        {label}
      </span>
      {active && (
        <motion.div layoutId="nav-indicator" className="absolute -top-1 w-8 h-1 bg-zinc-900 dark:bg-zinc-100 rounded-b-full" />
      )}
    </button>
  );
}