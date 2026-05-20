import React, { useState } from 'react';
import { useOperationDays } from '../hooks/useOperationDays';
import { Dashboard } from '../components/Dashboard';
import { GoalSettings } from '../components/GoalSettings';
import { CycleCard } from '../components/CycleCard';
import { HistoryPanel } from '../components/HistoryPanel';
import { ImportExportPanel } from '../components/ImportExportPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../components/AuthProvider';
import { LogOut, LayoutDashboard, History, Database } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardApp() {
  const { data, loading, todayData, updateSettings, addCycle, updateOperation, deleteCycle, importData } = useOperationDays();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { signOut, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-6">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full" 
        />
        <motion.p 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="tracking-widest text-xs uppercase text-slate-400 font-bold"
        >
          Sincronizando...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200 sticky top-0 z-50 pt-10 pb-3 px-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-800">
              Trade<span className="text-indigo-600">Tracker</span>
            </h1>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full hidden sm:block">
              {user?.email?.split('@')[0]}
            </span>
            <Button variant="ghost" size="icon" onClick={signOut} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full h-10 w-10 transition-colors">
              <LogOut size={18} strokeWidth={2.5} />
            </Button>
          </motion.div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6 mt-2">
        <Dashboard 
          dailyProfit={todayData.dailyProfit}
          dailyGoal={data.settings.dailyGoal}
          stopLoss={data.settings.stopLoss}
          cyclesCount={todayData.cycles.length}
          onNewCycle={addCycle}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <Tabs defaultValue="operacoes" className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-2xl bg-slate-200/50 p-1 mb-6 shadow-inner">
            <TabsTrigger value="operacoes" className="rounded-xl text-slate-500 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all font-bold tracking-wide text-xs sm:text-sm h-10 flex items-center justify-center gap-1.5">
              <LayoutDashboard size={14} /> Operações
            </TabsTrigger>
            <TabsTrigger value="historico" className="rounded-xl text-slate-500 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all font-bold tracking-wide text-xs sm:text-sm h-10 flex items-center justify-center gap-1.5">
              <History size={14} /> Histórico
            </TabsTrigger>
            <TabsTrigger value="dados" className="rounded-xl text-slate-500 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all font-bold tracking-wide text-xs sm:text-sm h-10 flex items-center justify-center gap-1.5">
              <Database size={14} /> Dados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="operacoes" className="space-y-4 outline-none min-h-[300px]">
            {todayData.cycles.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 px-4 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40"
              >
                <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <LayoutDashboard size={32} strokeWidth={2} />
                </div>
                <h3 className="font-black text-xl text-slate-800 mb-2">Nenhuma operação</h3>
                <p className="text-slate-500 text-sm max-w-[250px] mx-auto font-medium">
                  Registre sua primeira operação do dia para acompanhar seus lucros.
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