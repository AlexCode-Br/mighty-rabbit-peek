import React, { useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Download, Upload, FileJson, FileSpreadsheet } from 'lucide-react';
import { AppData } from '../types';
import { exportToCSV } from '../utils/exportCsv';
import { exportToJSON, importFromJSON } from '../utils/backup';

interface ImportExportPanelProps {
  data: AppData;
  onImport: (data: AppData) => void;
}

export function ImportExportPanel({ data, onImport }: ImportExportPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedData = await importFromJSON(file);
      onImport(importedData);
      alert('Dados importados com sucesso!');
    } catch (error) {
      alert('Erro ao importar arquivo. Verifique se o formato está correto.');
      console.error(error);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg px-2 text-white tracking-tight">Dados</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border border-white/5 shadow-xl bg-zinc-900/80 backdrop-blur-xl rounded-3xl">
          <CardContent className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-emerald-400">
              <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                <FileSpreadsheet size={20} strokeWidth={2.5} />
              </div>
              <h4 className="font-black text-white tracking-tight">Exportar Planilha</h4>
            </div>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
              Exporte todos os seus dados para análise no Excel ou Google Sheets.
            </p>
            <Button onClick={() => exportToCSV(data)} className="w-full rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white border border-white/5 font-bold tracking-wide transition-all mt-auto">
              <Download className="mr-2 h-4 w-4" /> Baixar CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-white/5 shadow-xl bg-zinc-900/80 backdrop-blur-xl rounded-3xl">
          <CardContent className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-orange-400">
              <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                <FileJson size={20} strokeWidth={2.5} />
              </div>
              <h4 className="font-black text-white tracking-tight">Backup Completo</h4>
            </div>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
              Salve um backup dos seus dados ou restaure de um arquivo anterior.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <Button onClick={() => exportToJSON(data)} className="w-full rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 font-bold tracking-wide transition-all">
                <Download className="mr-2 h-4 w-4" /> Salvar
              </Button>
              <Button onClick={handleImportClick} className="w-full rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white border border-white/5 font-bold tracking-wide transition-all">
                <Upload className="mr-2 h-4 w-4" /> Restaurar
              </Button>
              <input
                type="file"
                accept=".json"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
