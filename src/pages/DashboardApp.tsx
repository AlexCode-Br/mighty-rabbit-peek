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

export default function DashboardApp() {
  const { data, loading, todayData, updateSettings, addCycle, updateOperation, deleteCycle, importData } = useOperationDays();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { signOut, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-orange-500 font-bold flex-col gap-4">
        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
        <p className="animate-pulse tracking-widest text-xs uppercase text-zinc-500 font-black">Sincronizando Seus Dados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50 font-sans pb-20 selection:bg-orange-500/30">
      {/* Header */}
      <header className="bg-zinc-950 shadow-sm px-4 pt-12 pb-4 sticky top-0 z-10 border-b border-white/5 backdrop-blur-xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Trade<span className="text-orange-500">Tracker</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs text-zinc-400 font-bold tracking-widest hidden sm:inline-block">Olá, {user?.email?.split('@')[0]}</span>
            <Button variant="ghost" size="icon" onClick={signOut} className="text-zinc-500 hover:text-rose-400 rounded-full h-8 w-8 hover:bg-rose-500/10 transition-colors">
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        <Dashboard 
          dailyProfit={todayData.dailyProfit}
          dailyGoal={data.settings.dailyGoal}
          stopLoss={data.settings.stopLoss}
          cyclesCount={todayData.cycles.length}
          onNewCycle={addCycle}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <Tabs defaultValue="operacoes" className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-2xl bg-zinc-900 border border-white/5 p-1 mb-6">
            <TabsTrigger value="operacoes" className="rounded-xl text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all font-bold tracking-wide text-xs sm:text-sm">
              Operações
            </TabsTrigger>
            <TabsTrigger value="historico" className="rounded-xl text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all font-bold tracking-wide text-xs sm:text-sm">
              Histórico
            </TabsTrigger>
            <TabsTrigger value="dados" className="rounded-xl text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all font-bold tracking-wide text-xs sm:text-sm">
              Dados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="operacoes" className="space-y-4 outline-none">
            {todayData.cycles.length === 0 ? (
              <div className="text-center py-16 px-4 bg-zinc-900/50 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500/20 to-amber-500/5 border border-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <h3 className="font-bold text-xl text-white mb-2 tracking-tight">Nenhuma operação hoje</h3>
                <p className="text-zinc-400 text-sm max-w-[250px] mx-auto leading-relaxed">
                  Comece uma nova operação para monitorar seus lucros e perdas do dia.
                </p>
              </div>
            ) : (
              <div>
                {todayData.cycles.map((cycle, index) => (
                  <CycleCard 
                    key={cycle.id}
                    index={todayData.cycles.length - index} 
                    cycle={cycle}
                    onUpdateOperation={updateOperation}
                    onDeleteCycle={deleteCycle}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="historico" className="outline-none">
            <HistoryPanel data={data} />
          </TabsContent>

          <TabsContent value="dados" className="space-y-8 outline-none">
            <ImportExportPanel data={data} onImport={importData} />
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