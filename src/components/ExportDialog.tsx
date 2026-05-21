import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { FileSpreadsheet, FileText, X } from 'lucide-react';
import { AppData, OperationDay } from '../types';
import { exportToCSV } from '../utils/exportCsv';
import { exportToPDF } from '../utils/exportPdf';
import { showSuccess, showError } from '../utils/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { isSameMonth, parseISO, format, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: AppData;
  currentMonth: Date;
}

export function ExportDialog({ open, onOpenChange, data, currentMonth }: ExportDialogProps) {
  const [exportMode, setExportMode] = useState<'month' | 'custom' | 'all'>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
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
    
    return { ...data, history: filteredHistory };
  };

  const handleExportPDF = () => {
    const filteredData = getFilteredData();
    if (!filteredData || Object.keys(filteredData.history).length === 0) {
      showError('Não há dados para exportar neste período.');
      return;
    }
    exportToPDF(filteredData);
    onOpenChange(false);
    showSuccess('Relatório PDF gerado!');
  };

  const handleExportCSV = () => {
    const filteredData = getFilteredData();
    if (!filteredData || Object.keys(filteredData.history).length === 0) {
      showError('Não há dados para exportar neste período.');
      return;
    }
    exportToCSV(filteredData);
    onOpenChange(false);
    showSuccess('Planilha CSV exportada!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] rounded-[32px] liquid-glass-panel border-black/5 dark:border-white/20 shadow-2xl p-5 sm:p-6 [&>button]:hidden outline-none bg-white/90 dark:bg-zinc-950/80 backdrop-blur-2xl">
        <DialogHeader className="mb-6 relative text-left">
          <button onClick={() => onOpenChange(false)} className="absolute right-0 top-0 h-8 w-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <X size={16} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-3 pr-10">
            <div className="w-12 h-12 rounded-[18px] bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
              <FileText size={22} />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">Exportar</DialogTitle>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Gere seus relatórios</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mb-6 space-y-4">
          <div className="bg-black/[0.03] dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl p-4">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] block mb-2">Período</label>
            <Select value={exportMode} onValueChange={(val: any) => setExportMode(val)}>
              <SelectTrigger className="w-full bg-white/50 dark:bg-white/5 border-black/10 dark:border-white/10 h-12 rounded-xl font-bold text-zinc-900 dark:text-white">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="liquid-glass-panel border-black/10 dark:border-white/20 rounded-2xl">
                <SelectItem value="month">Apenas {monthName}</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
                <SelectItem value="all">Todo o histórico</SelectItem>
              </SelectContent>
            </Select>

            <AnimatePresence>
              {exportMode === 'custom' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-2 gap-3 mt-4">
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1 block">Início</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 h-11 rounded-xl px-3 text-sm font-bold text-zinc-900 dark:text-white outline-none dark:[color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1 block">Fim</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 h-11 rounded-xl px-3 text-sm font-bold text-zinc-900 dark:text-white outline-none dark:[color-scheme:dark]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button onClick={handleExportPDF} className="w-full h-14 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-base shadow-xl border-white/10">
            <FileText size={18} className="mr-2" /> Gerar PDF
          </Button>
          <Button onClick={handleExportCSV} variant="outline" className="w-full h-14 rounded-2xl border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 font-black text-base text-zinc-900 dark:text-white transition-colors">
            <FileSpreadsheet size={18} className="mr-2" /> Planilha
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}