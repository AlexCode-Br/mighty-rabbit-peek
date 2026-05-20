import React, { useState } from 'react';
import { useOperationDays } from '../hooks/useOperationDays';
import { Dashboard } from '../components/Dashboard';
import { GoalSettings } from '../components/GoalSettings';
import { CycleCard } from '../components/CycleCard';
import { HistoryPanel } from '../components/HistoryPanel';
import { ImportExportPanel } from '../components/ImportExportPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../components/AuthProvider';
import { LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardApp() {
  const { data, loading, todayData, updateSettings, addCycle, updateOperation, deleteCycle, importData } = useOperationDays();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { signOut, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-orange-500 font-bold flex-col gap-6">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full" 
        />
        <motion.p 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="tracking-widest text-xs uppercase text-zinc-500 font-black"
        >
          Sincronizando Dados
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50 font-sans pb-20 selection:bg-orange-500/30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed bg-opacity-5">
      {/* Header */}
      <header className="bg-zinc-950/80 shadow-sm px-4 pt-12 pb-4 sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)] border border-orange-400/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Trade<span className="text-orange-500">Tracker</span>
            </h1>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 sm:gap-4"
          >
            <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase hidden sm:inline-block bg-white/5 px-3 py-1 rounded-full">
              {user?.email?.split('@')[0]}
            </span>
            <Button variant="ghost" size="icon" onClick={signOut} className="text-zinc-500 hover:text-rose-400 rounded-full h-9 w-9 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20">
              <LogOut size={16} strokeWidth={2.5} />
            </Button>
          </motion.div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6 mt-4">
        <Dashboard 
          dailyProfit={todayData.dailyProfit}
          dailyGoal={data.settings.dailyGoal}
          stopLoss={data.settings.stopLoss}
          cyclesCount={todayData.cycles.length}
          onNewCycle={addCycle}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <Tabs defaultValue="operacoes" className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-2xl bg-zinc-900/80 backdrop-blur-md border border-white/10 p-1 mb-6 shadow-xl relative z-10">
            <TabsTrigger value="operacoes" className="rounded-xl text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-black tracking-wide text-xs sm:text-sm h-10">
              Operações
            </TabsTrigger>
            <TabsTrigger value="historico" className="rounded-xl text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-black tracking-wide text-xs sm:text-sm h-10">
              Histórico
            </TabsTrigger>
            <TabsTrigger value="dados" className="rounded-xl text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-black tracking-wide text-xs sm:text-sm h-10">
              Dados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="operacoes" className="space-y-4 outline-none min-h-[300px]">
            {todayData.cycles.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 px-4 bg-zinc-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent opacity-50" />
                <motion.div 
                  animate={{ y: [0, -10, 0] }} 
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="w-24 h-24 bg-gradient-to-br from-orange-500/20 to-amber-500/5 border border-orange-500/30 text-orange-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(249,115,22,0.2)] rotate-3"
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="-rotate-3"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </motion.div>
                <h3 className="font-black text-2xl text-white mb-2 tracking-tight">Vazio por aqui</h3>
                <p className="text-zinc-400 text-sm max-w-[250px] mx-auto leading-relaxed font-medium">
                  Registre sua primeira operação do dia para ver a mágica acontecer.
                </p>
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
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <HistoryPanel data={data} />
            </motion.div>
          </TabsContent>

          <TabsContent value="dados" className="space-y-8 outline-none">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
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