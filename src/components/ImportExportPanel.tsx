import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { AppData } from '../types';
import { exportToCSV } from '../utils/exportCsv';
import { exportToPDF } from '../utils/exportPdf';
import { showSuccess } from '../utils/toast';

interface ImportExportPanelProps {
  data: AppData;
  onImport?: (data: AppData) => void;
}

export function ImportExportPanel({ data }: ImportExportPanelProps) {
  
  const handleExportPDF = () => {
    exportToPDF(data);
    showSuccess('Relatório PDF gerado com sucesso!');
  };

  const handleExportCSV = () => {
    exportToCSV(data);
    showSuccess('Planilha CSV exportada com sucesso!');
  };

  return (
    <div className="space-y-4">
      {/* Relatórios (PDF e CSV) */}
      <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden relative group">
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
              onClick={handleExportPDF} 
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2 border-none shadow-sm"
            >
              <FileText size={16} /> Gerar PDF
            </Button>
            <Button 
              onClick={handleExportCSV} 
              variant="outline" 
              className="w-full rounded-xl border-zinc-200 dark:border-zinc-700 font-medium gap-2 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              <FileSpreadsheet size={16} /> Planilha
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}