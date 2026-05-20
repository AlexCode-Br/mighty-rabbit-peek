import React, { useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Download, Upload, FileSpreadsheet, FileText, Database } from 'lucide-react';
import { AppData } from '../types';
import { exportToCSV } from '../utils/exportCsv';
import { exportToJSON, importFromJSON } from '../utils/backup';
import { exportToPDF } from '../utils/exportPdf';
import { showSuccess, showError } from '../utils/toast';

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
      showSuccess('Dados importados com sucesso!');
    } catch (error) {
      showError('Erro ao importar arquivo. Verifique se o formato está correto.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Relatórios (PDF e CSV) */}
      <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-3xl"></div>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Relatórios Visuais</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Baixe PDFs com gráficos ou CSV</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => exportToPDF(data)} 
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2 border-none shadow-sm"
            >
              <FileText size={16} /> Gerar PDF
            </Button>
            <Button 
              onClick={() => exportToCSV(data)} 
              variant="outline" 
              className="w-full rounded-xl border-zinc-200 dark:border-zinc-700 font-medium gap-2 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              <FileSpreadsheet size={16} /> Planilha
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup */}
      <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-zinc-400 dark:bg-zinc-600 rounded-l-3xl"></div>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
              <Database size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Backup do Sistema</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Salvar ou restaurar arquivo de dados</p>
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