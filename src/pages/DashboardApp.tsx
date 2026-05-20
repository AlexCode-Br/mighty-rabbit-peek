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
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center flex-col gap-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          className="w-8 h-8 border-[3px] border-zinc-200 border-t-zinc-900 rounded-full" 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans pb-24 selection:bg-zinc-200">
      {/* Floating Header */}
      <div className="sticky top-4 z-50 px-4 max-w-md mx-auto">
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200/60 rounded-full px-5 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
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

      <main className="max-w-md mx-auto p-4 space-y-8 mt-4">
        <Dashboard 
          dailyProfit={todayData.dailyProfit}
          dailyGoal={data.settings.dailyGoal}
          stopLoss={data.settings.stopLoss}
          cyclesCount={todayData.cycles.length}
          onNewCycle={addCycle}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <Tabs defaultValue="operacoes" className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-2xl bg-zinc-100/80 p-1 mb-8">
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

          <TabsContent value="operacoes" className="space-y-4 outline-none min-h-[300px]">
            {todayData.cycles.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 px-4 flex flex-col items-center justify-center"
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

          <TabsContent value="historico" className="outline-none">
            <motion.div initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }}>
              <HistoryPanel data={data} />
            </motion.div>
          </TabsContent>

          <TabsContent value="dados" className="space-y-8 outline-none">
            <motion.div initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }}>
              <ImportExportPanel data={data} onImport={importData} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      <GoalSettings 
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={data.settings}
        onSave={updateSettings}
      />
    </div>
  );
}