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
      <h3 className="font-bold text-lg px-2 text-zinc-800 dark:text-zinc-100">Dados</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 rounded-2xl">
          <CardContent className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-orange-500">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <FileSpreadsheet size={20} />
              </div>
              <h4 className="font-semibold text-zinc-800 dark:text-zinc-100">Exportar Planilha</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Exporte todos os seus dados para análise no Excel ou Google Sheets.
            </p>
            <Button onClick={() => exportToCSV(data)} className="w-full rounded-xl" variant="outline">
              <Download className="mr-2 h-4 w-4" /> Baixar CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 rounded-2xl">
          <CardContent className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-blue-500">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <FileJson size={20} />
              </div>
              <h4 className="font-semibold text-zinc-800 dark:text-zinc-100">Backup</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Salve um backup completo dos seus dados ou restaure de um arquivo anterior.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => exportToJSON(data)} className="w-full rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border-none shadow-none">
                <Download className="mr-2 h-4 w-4" /> Salvar
              </Button>
              <Button onClick={handleImportClick} className="w-full rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 border-none shadow-none">
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
