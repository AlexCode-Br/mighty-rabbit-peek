import React, { useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Download, Upload, FileSpreadsheet, Database } from 'lucide-react';
import { AppData } from '../types';
import { exportToCSV } from '../utils/exportCsv';
import { exportToJSON, importFromJSON } from '../utils/backup';

interface ImportExportPanelProps {
  data: AppData;
  onImport: (data: AppData) => void;
}

export function ImportExportPanel({ data, onImport }: ImportExportPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedData = await importFromJSON(file);
      onImport(importedData);
      alert('Dados importados com sucesso!');
    } catch (error) {
      alert('Erro ao importar arquivo. Verifique se o formato está correto.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Exportar Planilha</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Baixe em formato CSV</p>
            </div>
          </div>
          <Button onClick={() => exportToCSV(data)} variant="outline" className="rounded-full px-4 border-zinc-200 dark:border-zinc-700 font-medium dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
            Baixar
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
              <Database size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Backup do Sistema</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Arquivo JSON local</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => exportToJSON(data)} variant="outline" className="w-full rounded-xl border-zinc-200 dark:border-zinc-700 font-medium gap-2 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
              <Download size={16} /> Salvar
            </Button>
            <Button onClick={handleImportClick} variant="outline" className="w-full rounded-xl border-zinc-200 dark:border-zinc-700 font-medium gap-2 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
              <Upload size={16} /> Restaurar
            </Button>
            <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}