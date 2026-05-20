import React, { useState } from 'react';
import { useOperationDays } from '../hooks/useOperationDays';
import { Dashboard } from '../components/Dashboard';
import { GoalSettings } from '../components/GoalSettings';
import { CycleCard } from '../components/CycleCard';
import { HistoryPanel } from '../components/HistoryPanel';
import { ImportExportPanel } from '../components/ImportExportPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../components/AuthProvider';
import { LogOut, Activity, CalendarDays, HardDrive } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardApp() {
  const { data, loading, todayData, updateSettings, addCycle, updateOperation, deleteCycle, importData } = useOperationDays();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { signOut, user } = useAuth();

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

  return (
    <div className="h-[100dvh] w-full bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-zinc-200 overflow-hidden flex flex-col items-center">
      <div className="w-full max-w-md h-full flex flex-col relative">
        
        {/* Floating Header (Fixo) */}
        <div className="px-4 pt-4 pb-3 shrink-0">
          <motion.header 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/80 backdrop-blur-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-zinc-200/60 rounded-full px-5 py-2.5 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
              </div>
              <h1 className="text-base font-semibold tracking-tight text-zinc-900">
                Trade<span className="text-zinc-500">Tracker</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={signOut} className="text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full h-8 w-8 transition-colors">
                <LogOut size={16} strokeWidth={2} />
              </Button>
            </div>
          </motion.header>
        </div>

        {/* Painel Principal (Fixo) */}
        <div className="px-4 shrink-0 mb-4">
          <Dashboard 
            dailyProfit={todayData.dailyProfit}
            dailyGoal={data.settings.dailyGoal}
            stopLoss={data.settings.stopLoss}
            cyclesCount={todayData.cycles.length}
            onNewCycle={addCycle}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        </div>

        {/* Abas e Conteúdo Dinâmico (Flexível / Rolável) */}
        <div className="px-4 flex-1 flex flex-col min-h-0 pb-4">
          <Tabs defaultValue="operacoes" className="w-full h-full flex flex-col">
            <TabsList className="w-full grid grid-cols-3 rounded-2xl bg-zinc-100/80 p-1 shrink-0 mb-4">
              <TabsTrigger value="operacoes" className="rounded-xl text-zinc-500 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all font-medium text-xs h-9 flex items-center justify-center gap-2">
                <Activity size={14} /> Ciclos
              </TabsTrigger>
              <TabsTrigger value="historico" className="rounded-xl text-zinc-500 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all font-medium text-xs h-9 flex items-center justify-center gap-2">
                <CalendarDays size={14} /> Histórico
              </TabsTrigger>
              <TabsTrigger value="dados" className="rounded-xl text-zinc-500 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all font-medium text-xs h-9 flex items-center justify-center gap-2">
                <HardDrive size={14} /> Dados
              </TabsTrigger>
            </TabsList>

            {/* Configuração global para esconder as barras de scroll nos painéis */}
            <style dangerouslySetInnerHTML={{__html: `
              .no-scrollbar::-webkit-scrollbar { display: none; }
              .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />

            <TabsContent value="operacoes" className="flex-1 overflow-y-auto no-scrollbar outline-none m-0 pb-20">
              {todayData.cycles.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-10 px-4 flex flex-col items-center justify-center h-full"
                >
                  <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mb-4">
                    <Activity size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-semibold text-lg text-zinc-900 mb-1">Nenhum ciclo hoje</h3>
                  <p className="text-zinc-500 text-sm">Adicione uma operação para começar.</p>
                </motion.div>
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
            </TabsContent>

            <TabsContent value="historico" className="flex-1 overflow-y-auto no-scrollbar outline-none m-0 pb-20">
              <motion.div initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }}>
                <HistoryPanel data={data} />
              </motion.div>
            </TabsContent>

            <TabsContent value="dados" className="flex-1 overflow-y-auto no-scrollbar outline-none m-0 pb-20">
              <motion.div initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} className="space-y-4">
                <ImportExportPanel data={data} onImport={importData} />
              </motion.div>
            </TabsContent>
          </Tabs>
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