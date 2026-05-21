import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { AppData, OperationDay } from '../types';
import { exportToCSV } from '../utils/exportCsv';
import { exportToPDF } from '../utils/exportPdf';
import { showSuccess, showError } from '../utils/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { isSameMonth, parseISO, format, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface ImportExportPanelProps {
  data: AppData;
  currentMonth: Date;
}

export function ImportExportPanel({ data, currentMonth }: ImportExportPanelProps) {
  const [exportMode, setExportMode] = useState<'month' | 'custom' | 'all'>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Nome do mês formatado (ex: "novembro" -> "Novembro")
  const rawMonthName = format(currentMonth, 'MMMM', { locale: ptBR });
  const monthName = rawMonthName.charAt(0).toUpperCase() + rawMonthName.slice(1);
  
  const getFilteredData = (): AppData | null => {
    if (exportMode === 'all') return data;
    
    const filteredHistory: Record<string, OperationDay> = {};
    
    if (exportMode === 'month') {
      Object.keys(data.history).forEach(key => {
        const day = data.history[key];
        if (isSameMonth(parseISO(day.date), currentMonth)) {
          filteredHistory[key] = day;
        }
      });
    } else if (exportMode === 'custom') {
      if (!startDate || !endDate) {
        showError('Por favor, selecione as datas de início e fim.');
        return null;
      }

      const start = startOfDay(parseISO(startDate));
      const end = endOfDay(parseISO(endDate));

      if (start > end) {
        showError('A data de início deve ser anterior ou igual à data de fim.');
        return null;
      }

      Object.keys(data.history).forEach(key => {
        const day = data.history[key];
        const date = parseISO(day.date);
        if (date >= start && date <= end) {
          filteredHistory[key] = day;
        }
      });
    }
    
    return {
      ...data,
      history: filteredHistory
    };
  };

  const handleExportPDF = () => {
    const filteredData = getFilteredData();
    if (!filteredData) return; // Erro de validação já tratado

    if (Object.keys(filteredData.history).length === 0) {
      showError('Não há dados para exportar neste período.');
      return;
    }
    exportToPDF(filteredData);
    showSuccess('Relatório PDF gerado com sucesso!');
  };

  const handleExportCSV = () => {
    const filteredData = getFilteredData();
    if (!filteredData) return; // Erro de validação já tratado

    if (Object.keys(filteredData.history).length === 0) {
      showError('Não há dados para exportar neste período.');
      return;
    }
    exportToCSV(filteredData);
    showSuccess('Planilha CSV exportada com sucesso!');
  };

  return (
    <div className="space-y-4">
      <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-3xl"></div>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Relatórios Visuais</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">Baixe PDFs com gráficos ou planilhas CSV</p>
            </div>
          </div>
          
          <div className="mb-5">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-1.5">
              Filtro de Período
            </label>
            <Select value={exportMode} onValueChange={(val: 'month' | 'custom' | 'all') => setExportMode(val)}>
              <SelectTrigger className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 h-11 rounded-xl text-sm font-medium">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl">
                <SelectItem value="month" className="rounded-lg text-sm font-medium focus:bg-zinc-100 dark:focus:bg-zinc-800 cursor-pointer">
                  Todo o período de {monthName}
                </SelectItem>
                <SelectItem value="custom" className="rounded-lg text-sm font-medium focus:bg-zinc-100 dark:focus:bg-zinc-800 cursor-pointer">
                  Período personalizado (De X a Y)
                </SelectItem>
                <SelectItem value="all" className="rounded-lg text-sm font-medium focus:bg-zinc-100 dark:focus:bg-zinc-800 cursor-pointer">
                  Todo o histórico completo
                </SelectItem>
              </SelectContent>
            </Select>

            <AnimatePresence>
              {exportMode === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="grid grid-cols-2 gap-3 overflow-hidden"
                >
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">De</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 h-11 rounded-xl px-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors shadow-sm dark:[color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Até</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 h-11 rounded-xl px-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors shadow-sm dark:[color-scheme:dark]"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={handleExportPDF} 
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2 border-none shadow-sm transition-all"
            >
              <FileText size={16} /> Gerar PDF
            </Button>
            <Button 
              onClick={handleExportCSV} 
              variant="outline" 
              className="w-full h-11 rounded-xl border-zinc-200 dark:border-zinc-700 font-medium gap-2 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 transition-all"
            >
              <FileSpreadsheet size={16} /> Planilha
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}