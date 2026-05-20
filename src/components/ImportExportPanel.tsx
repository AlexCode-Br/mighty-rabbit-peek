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
      <Card className="border border-zinc-200/60 shadow-sm bg-white rounded-3xl overflow-hidden">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 text-sm">Exportar Planilha</h4>
              <p className="text-xs text-zinc-500">Baixe em formato CSV</p>
            </div>
          </div>
          <Button onClick={() => exportToCSV(data)} variant="outline" className="rounded-full px-4 border-zinc-200 font-medium">
            Baixar
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-zinc-200/60 shadow-sm bg-white rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center">
              <Database size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 text-sm">Backup do Sistema</h4>
              <p className="text-xs text-zinc-500">Arquivo JSON local</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => exportToJSON(data)} variant="outline" className="w-full rounded-xl border-zinc-200 font-medium gap-2">
              <Download size={16} /> Salvar
            </Button>
            <Button onClick={handleImportClick} variant="outline" className="w-full rounded-xl border-zinc-200 font-medium gap-2">
              <Upload size={16} /> Restaurar
            </Button>
            <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}