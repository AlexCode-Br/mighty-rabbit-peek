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
      <DialogContent className="sm:max-w-md w-[95vw] rounded-[32px] overflow-hidden p-0 border-none bg-transparent shadow-none outline-none ring-0">
        <div className="relative w-full h-full p-6 sm:p-8 liquid-glass-panel border-white/40 dark:border-white/10 shadow-2xl bg-white/70 dark:bg-zinc-900/40 backdrop-blur-3xl">
          
          <button 
            onClick={() => onOpenChange(false)} 
            className="absolute right-5 top-5 h-9 w-9 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all active:scale-90 z-20"
          >
            <X size={18} strokeWidth={2.5} />
          </button>

          <DialogHeader className="mb-8 text-left">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[20px] bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-sm">
                <FileText size={26} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-zinc-950 dark:text-zinc-50 tracking-tighter">Exportar</DialogTitle>
                <p className="text-[11px] font-bold text-zinc-500/80 dark:text-zinc-400 uppercase tracking-widest mt-0.5">Gere seus relatórios premium</p>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Período Selecionado</label>
              <Select value={exportMode} onValueChange={(val: any) => setExportMode(val)}>
                <SelectTrigger className="w-full bg-white/50 dark:bg-black/20 border-zinc-200 dark:border-white/10 h-14 rounded-2xl font-bold text-zinc-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500/20">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent className="liquid-glass-panel border-white/20 rounded-2xl overflow-hidden">
                  <SelectItem value="month" className="font-bold py-3">Apenas {monthName}</SelectItem>
                  <SelectItem value="custom" className="font-bold py-3">Personalizado</SelectItem>
                  <SelectItem value="all" className="font-bold py-3">Todo o histórico</SelectItem>
                </SelectContent>
              </Select>

              <AnimatePresence>
                {exportMode === 'custom' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }} 
                    className="grid grid-cols-2 gap-3 mt-3"
                  >
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-zinc-500 uppercase ml-1">Data Inicial</span>
                      <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        className="w-full bg-white/50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 h-12 rounded-xl px-3 text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-indigo-500/40 dark:[color-scheme:dark] transition-colors" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-zinc-500 uppercase ml-1">Data Final</span>
                      <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        className="w-full bg-white/50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 h-12 rounded-xl px-3 text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-indigo-500/40 dark:[color-scheme:dark] transition-colors" 
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <Button 
                onClick={handleExportPDF} 
                className="w-full h-15 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-base shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                <FileText size={20} className="mr-2" /> Gerar Relatório PDF
              </Button>
              <Button 
                onClick={handleExportCSV} 
                variant="outline" 
                className="w-full h-15 rounded-2xl border-zinc-200 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-zinc-50 dark:hover:bg-white/10 font-bold text-base text-zinc-900 dark:text-white transition-all active:scale-[0.98]"
              >
                <FileSpreadsheet size={20} className="mr-2 text-emerald-600 dark:text-emerald-400" /> Exportar Planilha
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}