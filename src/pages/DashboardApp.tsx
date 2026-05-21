import React, { useState } from 'react';
import { useOperationDays, AddCycleData } from '../hooks/useOperationDays';
import { Dashboard } from '../components/Dashboard';
import { GoalSettings } from '../components/GoalSettings';
import { CycleCard } from '../components/CycleCard';
import { HistoryPanel } from '../components/HistoryPanel';
import { NewCycleDialog } from '../components/NewCycleDialog';
import { useAuth } from '../components/AuthProvider';
import { LogOut, Activity, CalendarDays, Home, Sun, Moon, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { showSuccess } from '../utils/toast';
import { subDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardApp() {
  const { data, loading, todayData, updateSettings, addCycle, updateOperation, deleteCycle } = useOperationDays();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newCycleOpen, setNewCycleOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ciclos' | 'home' | 'historico'>('home');
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();

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

  // --- Cálculos do Dia Atual ---
  const todayWins = todayData.cycles.filter(c => c.completed && c.totalProfit > 0).length;
  const todayLosses = todayData.cycles.filter(c => c.completed && c.totalProfit < 0).length;

  // --- Cálculos dos Últimos 7 Dias ---
  const now = new Date();
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    // 6 - i garante a ordem cronológica (do mais antigo para o dia de hoje)
    const d = subDays(now, 6 - i);
    const dayId = format(d, 'yyyy-MM-dd');
    const dayData = data.history[dayId];
    return {
      name: format(d, 'EE', { locale: ptBR }).substring(0, 3), // Seg, Ter, etc
      profit: dayData ? dayData.dailyProfit : 0,
      hasData: !!dayData && dayData.cycles.length > 0
    };
  });

  const weeklyProfit = last7DaysData.reduce((acc, day) => acc + day.profit, 0);
  const weeklyActiveDays = last7DaysData.filter(day => day.hasData).length;
  const weeklyWinDays = last7DaysData.filter(day => day.profit >= 0 && day.hasData).length;
  const weeklyWinRate = weeklyActiveDays > 0 ? (weeklyWinDays / weeklyActiveDays) * 100 : 0;
  // --------------------------

  const handleSaveNewCycle = (cycleData: AddCycleData) => {
    addCycle(cycleData);
    setNewCycleOpen(false);
    showSuccess('Ciclo adicionado com sucesso!');
  };

  const handleUpdateSettings = (newSettings: any) => {
    updateSettings(newSettings);
    showSuccess('Configurações salvas!');
  };

  const handleDeleteCycle = (cycleId: string) => {
    deleteCycle(cycleId);
    showSuccess('Ciclo removido.');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="h-[100dvh] w-full bg-[#FAFAFA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 overflow-hidden flex flex-col items-center">
      <div className="w-full max-w-md h-full flex flex-col relative bg-[#FAFAFA] dark:bg-zinc-950 sm:border-x border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl">
        
        {/* TOPO FIXO */}
        <div className="px-4 pt-4 pb-4 shrink-0">
          <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-zinc-200/60 dark:border-zinc-800/60 rounded-full px-5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white dark:text-zinc-900"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
              </div>
              <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Trade<span className="text-zinc-500 dark:text-zinc-400">Tracker</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full h-8 w-8 transition-colors">
                {theme === 'dark' ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut} className="text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full h-8 w-8 transition-colors">
                <LogOut size={16} strokeWidth={2} />
              </Button>
            </div>
          </header>
        </div>

        {/* MEIO */}
        <div className="flex-1 px-4 overflow-y-auto no-scrollbar relative z-0 pb-4">
          <style dangerouslySetInnerHTML={{__html: `
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}} />

          {activeTab === 'home' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="space-y-6">
              <Dashboard 
                dailyProfit={todayData.dailyProfit}
                dailyGoal={data.settings.dailyGoal}
                stopLoss={data.settings.stopLoss}
                cyclesCount={todayData.cycles.length}
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
              {todayData.cycles.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-full flex items-center justify-center mb-4">
                    <Activity size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 mb-1">Nenhum ciclo hoje</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-[250px]">Nenhuma operação registrada ainda. Que tal começar agora?</p>
                  <Button 
                    onClick={() => setNewCycleOpen(true)} 
                    className="mt-6 rounded-2xl h-12 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] flex items-center gap-2 px-6"
                  >
                    <Plus size={18} /> Adicionar Primeiro Ciclo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Botão de Atalho Rápido para Novo Ciclo */}
                  <Button 
                    onClick={() => setNewCycleOpen(true)}
                    variant="outline"
                    className="w-full h-14 rounded-3xl border-dashed border-2 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 font-semibold flex items-center justify-center gap-2 mb-2 transition-all"
                  >
                    <Plus size={18} /> Adicionar Novo Ciclo
                  </Button>
                  
                  <AnimatePresence mode="popLayout">
                    {todayData.cycles.map((cycle, index) => (
                      <CycleCard 
                        key={cycle.id}
                        index={todayData.cycles.length - index} 
                        cycle={cycle}
                        onUpdateOperation={updateOperation}
                        onDeleteCycle={handleDeleteCycle}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'historico' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
              <HistoryPanel data={data} />
            </motion.div>
          )}
        </div>

        {/* BASE FIXA */}
        <div 
          className="shrink-0 bg-white dark:bg-zinc-900 border-t border-zinc-200/60 dark:border-zinc-800/60 px-8 py-2 flex justify-between items-center shadow-[0_-4px_20px_rgb(0,0,0,0.02)] z-10"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
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
      className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-200 relative ${
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
        <motion.div layoutId="nav-indicator" className="absolute -top-2 w-8 h-1 bg-zinc-900 dark:bg-zinc-100 rounded-b-full" />
      )}
    </button>
  );
}