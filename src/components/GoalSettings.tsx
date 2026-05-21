import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { AppSettings } from '../types';
import { X, AlertTriangle } from 'lucide-react';

interface GoalSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onResetData: () => void;
}

export function GoalSettings({ open, onOpenChange, settings, onSave, onResetData }: GoalSettingsProps) {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  useEffect(() => {
    setFormData(settings);
    setShowConfirmReset(false);
  }, [settings, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value) || 0,
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const handleReset = () => {
    onResetData();
    setShowConfirmReset(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open && !showConfirmReset} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md w-[92vw] rounded-[28px] bg-white dark:bg-zinc-900 border-none shadow-2xl p-5 [&>button]:hidden outline-none">
          <DialogHeader className="mb-4 relative text-left">
            <button 
              onClick={() => onOpenChange(false)}
              className="absolute right-0 top-0 h-7 w-7 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
            <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight pr-8">Ajustes</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">Diário</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-800/60">
                  <Label className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest mb-1 block">Meta</Label>
                  <Input
                    name="dailyGoal"
                    type="number"
                    inputMode="decimal"
                    value={formData.dailyGoal || ''}
                    onChange={handleChange}
                    className="h-8 p-0 border-none bg-transparent text-zinc-900 dark:text-zinc-100 font-semibold shadow-none focus-visible:ring-0 text-base"
                  />
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-800/60">
                  <Label className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest mb-1 block">Stop Loss</Label>
                  <Input
                    name="stopLoss"
                    type="number"
                    inputMode="decimal"
                    value={formData.stopLoss || ''}
                    onChange={handleChange}
                    className="h-8 p-0 border-none bg-transparent text-rose-500 font-semibold shadow-none focus-visible:ring-0 text-base"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">Valores Padrão</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-800/60">
                  <Label className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest mb-1 block">Entrada MÃE</Label>
                  <Input
                    name="defaultMaeDeposit"
                    type="number"
                    inputMode="decimal"
                    value={formData.defaultMaeDeposit || ''}
                    onChange={handleChange}
                    className="h-8 p-0 border-none bg-transparent text-zinc-900 dark:text-zinc-100 font-semibold shadow-none focus-visible:ring-0 text-base"
                  />
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-800/60">
                  <Label className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest mb-1 block">Entrada FILHA</Label>
                  <Input
                    name="defaultFilhaDeposit"
                    type="number"
                    inputMode="decimal"
                    value={formData.defaultFilhaDeposit || ''}
                    onChange={handleChange}
                    className="h-8 p-0 border-none bg-transparent text-zinc-900 dark:text-zinc-100 font-semibold shadow-none focus-visible:ring-0 text-base"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
              <button 
                onClick={() => setShowConfirmReset(true)}
                className="w-full text-left text-xs font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 p-2 rounded-xl transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2"
              >
                <AlertTriangle size={14} /> Zerar Histórico de Dados
              </button>
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={handleSave} className="w-full h-11 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium shadow-sm">
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação para Zerar Dados */}
      <Dialog open={showConfirmReset} onOpenChange={(open) => !open && setShowConfirmReset(false)}>
        <DialogContent className="sm:max-w-xs rounded-[32px] p-6 bg-white dark:bg-zinc-900 border-none shadow-2xl [&>button]:hidden outline-none text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="text-rose-500" size={24} strokeWidth={2} />
          </div>
          <DialogTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">
            Atenção!
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
            Você está prestes a apagar <strong>todo o seu histórico</strong>. Suas configurações serão mantidas. Esta ação não pode ser desfeita.
          </DialogDescription>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowConfirmReset(false)} 
              variant="outline" 
              className="flex-1 rounded-2xl h-12 border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 font-medium"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleReset} 
              className="flex-1 rounded-2xl h-12 bg-rose-500 hover:bg-rose-600 text-white border-none font-medium shadow-[0_4px_14px_0_rgb(244,63,94,0.3)]"
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}