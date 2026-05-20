import React, { useState } from 'react';
import { useOperationDays } from './hooks/useOperationDays';
import { Dashboard } from './components/Dashboard';
import { GoalSettings } from './components/GoalSettings';
import { CycleCard } from './components/CycleCard';
import { Charts } from './components/Charts';
import { HistoryPanel } from './components/HistoryPanel';
import { ImportExportPanel } from './components/ImportExportPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

export default function App() {
  const { data, todayData, updateSettings, addCycle, updateOperation, deleteCycle, importData } = useOperationDays();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 shadow-sm px-4 pt-12 pb-4 sticky top-0 z-10 border-b border-zinc-100 dark:border-zinc-800">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Controle de Ciclos
          </h1>
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
          <TabsList className="w-full grid grid-cols-3 rounded-2xl bg-zinc-200/50 dark:bg-zinc-800/50 p-1 mb-6">
            <TabsTrigger value="operacoes" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm">
              Operações
            </TabsTrigger>
            <TabsTrigger value="graficos" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm">
              Evolução
            </TabsTrigger>
            <TabsTrigger value="dados" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm">
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="operacoes" className="space-y-4 outline-none">
            {todayData.cycles.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border-none border-zinc-100">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💸</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Nenhum ciclo hoje</h3>
                <p className="text-muted-foreground text-sm">
                  Comece um novo ciclo para acompanhar suas operações financeiras.
                </p>
              </div>
            ) : (
              <div>
                {todayData.cycles.map((cycle, index) => (
                  <CycleCard 
                    key={cycle.id}
                    index={todayData.cycles.length - index} // Show numbering decreasing from top to bottom, or properly
                    cycle={cycle}
                    onUpdateOperation={updateOperation}
                    onDeleteCycle={deleteCycle}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="graficos" className="outline-none">
            <Charts todayData={todayData} />
          </TabsContent>

          <TabsContent value="dados" className="space-y-8 outline-none">
            <HistoryPanel data={data} />
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
