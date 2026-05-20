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
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg px-2 text-slate-800 tracking-tight">Gerenciamento de Dados</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-none shadow-lg shadow-slate-200/50 bg-white rounded-3xl">
          <CardContent className="p-6 flex flex-col gap-4 h-full">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="p-2.5 bg-emerald-50 rounded-xl">
                <FileSpreadsheet size={22} strokeWidth={2.5} />
              </div>
              <h4 className="font-black text-slate-800 tracking-tight">Planilha Excel</h4>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Exporte todos os seus dados estruturados para análise avançada no Excel ou Google Sheets.
            </p>
            <Button onClick={() => exportToCSV(data)} variant="outline" className="w-full rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all mt-auto h-11">
              <Download className="mr-2 h-4 w-4" /> Baixar CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg shadow-slate-200/50 bg-white rounded-3xl">
          <CardContent className="p-6 flex flex-col gap-4 h-full">
            <div className="flex items-center gap-3 text-indigo-600">
              <div className="p-2.5 bg-indigo-50 rounded-xl">
                <FileJson size={22} strokeWidth={2.5} />
              </div>
              <h4 className="font-black text-slate-800 tracking-tight">Backup Sistema</h4>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Salve um backup completo para restaurar suas configurações e histórico futuramente.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-auto">
              <Button onClick={() => exportToJSON(data)} className="w-full rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-none font-bold transition-all h-11">
                <Download className="mr-2 h-4 w-4" /> Salvar
              </Button>
              <Button onClick={handleImportClick} variant="outline" className="w-full rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all h-11">
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