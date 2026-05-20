import React, { useState } from 'react';
import { useOperationDays } from '../hooks/useOperationDays';
import { Dashboard } from '../components/Dashboard';
import { GoalSettings } from '../components/GoalSettings';
import { CycleCard } from '../components/CycleCard';
import { HistoryPanel } from '../components/HistoryPanel';
import { ImportExportPanel } from '../components/ImportExportPanel';
import { useAuth } from '../components/AuthProvider';
import { LogOut, Activity, CalendarDays, HardDrive } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardApp() {
  const { data, loading, todayData, updateSettings, addCycle, updateOperation, deleteCycle, importData } = useOperationDays();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ciclos' | 'historico' | 'dados'>('ciclos');
  const { signOut } = useAuth();

  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-[#FAFAFA] flex items-center justify-center flex-col gap-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          className="w-8 h-8 border-[3px] border-zinc-200 border-t-zinc-900 rounded-full" 
        />
      </div>
    );
  }

  const handleNewCycle = () => {
    addCycle();
    setActiveTab('ciclos'); // Garante que volta para a aba de ciclos ao criar um novo
  };

  return (
    <div className="h-[100dvh] w-full bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-zinc-200 overflow-hidden flex flex-col items-center">
      <div className="w-full max-w-md h-full flex flex-col relative bg-[#FAFAFA] sm:border-x border-zinc-200/50 shadow-2xl">
        
        {/* TOPO FIXO: Header Minimalista */}
        <div className="px-4 pt-4 pb-3 shrink-0">
          <header className="bg-white/80 backdrop-blur-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-zinc-200/60 rounded-full px-5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
              </div>
              <h1 className="text-base font-semibold tracking-tight text-zinc-900">
                Trade<span className="text-zinc-500">Tracker</span>
              </h1>
            </div>
            
            <Button variant="ghost" size="icon" onClick={signOut} className="text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full h-8 w-8 transition-colors">
              <LogOut size={16} strokeWidth={2} />
            </Button>
          </header>
        </div>

        {/* TOPO FIXO: Menu Inicial / Principais Informações */}
        <div className="px-4 shrink-0 mb-2">
          <Dashboard 
            dailyProfit={todayData.dailyProfit}
            dailyGoal={data.settings.dailyGoal}
            stopLoss={data.settings.stopLoss}
            cyclesCount={todayData.cycles.length}
            onNewCycle={handleNewCycle}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        </div>

        {/* MEIO: Conteúdo Flexível (apenas esta área rola internamente se tiver muitos itens) */}
        <div className="flex-1 px-4 overflow-y-auto no-scrollbar relative z-0 pb-4">
          <style dangerouslySetInnerHTML={{__html: `
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}} />

          {activeTab === 'ciclos' && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
              {todayData.cycles.length === 0 ? (
                <div className="text-center py-10 flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mb-4">
                    <Activity size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-semibold text-lg text-zinc-900 mb-1">Nenhum ciclo hoje</h3>
                  <p className="text-zinc-500 text-sm">Clique em Novo Ciclo para começar.</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {todayData.cycles.map((cycle, index) => (
                    <CycleCard 
                      key={cycle.id}
                      index={todayData.cycles.length - index} 
                      cycle={cycle}
                      onUpdateOperation={updateOperation}
                      onDeleteCycle={deleteCycle}
                    />
                  ))}
                </AnimatePresence>
              )}
            </motion.div>
          )}

          {activeTab === 'historico' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
              <HistoryPanel data={data} />
            </motion.div>
          )}

          {activeTab === 'dados' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
              <ImportExportPanel data={data} onImport={importData} />
            </motion.div>
          )}
        </div>

        {/* BASE FIXA: Menu de Navegação Inferior (Estilo App) */}
        <div 
          className="shrink-0 bg-white border-t border-zinc-200/60 px-6 py-2 flex justify-between items-center shadow-[0_-4px_20px_rgb(0,0,0,0.02)] z-10"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
        >
          <NavButton 
            active={activeTab === 'ciclos'} 
            onClick={() => setActiveTab('ciclos')} 
            icon={<Activity size={20} />} 
            label="Ciclos" 
          />
          <NavButton 
            active={activeTab === 'historico'} 
            onClick={() => setActiveTab('historico')} 
            icon={<CalendarDays size={20} />} 
            label="Histórico" 
          />
          <NavButton 
            active={activeTab === 'dados'} 
            onClick={() => setActiveTab('dados')} 
            icon={<HardDrive size={20} />} 
            label="Dados" 
          />
        </div>

      </div>

      <GoalSettings 
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={data.settings}
        onSave={updateSettings}
      />
    </div>
  );
}

// Componente para os botões da barra inferior
function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-20 h-14 rounded-2xl transition-all duration-200 ${
        active ? 'text-zinc-900' : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600'
      }`}
    >
      <div className={`mb-1 transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
        {icon}
      </div>
      <span className={`text-[10px] tracking-wide transition-all ${active ? 'font-bold' : 'font-medium'}`}>
        {label}
      </span>
      {/* Indicador de aba ativa */}
      {active && (
        <motion.div layoutId="nav-indicator" className="absolute bottom-0 w-8 h-1 bg-zinc-900 rounded-t-full" />
      )}
    </button>
  );
}