import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { AppSettings } from '../types';
import { X, Settings2 } from 'lucide-react';

interface GoalSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export function GoalSettings({ open, onOpenChange, settings, onSave }: GoalSettingsProps) {
  const [formData, setFormData] = useState<AppSettings>(settings);

  useEffect(() => {
    setFormData(settings);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="liquid-glass border-none sm:max-w-md w-[95vw] max-h-[90dvh] overflow-y-auto rounded-[40px] p-8 [&>button]:hidden outline-none">
        <DialogHeader className="mb-8 relative text-left">
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 text-zinc-500 hover:text-zinc-900 transition-all active:scale-90"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 shadow-xl shadow-black/10 shrink-0">
              <Settings2 size={24} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter uppercase">Ajustes</DialogTitle>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Configure seus limites e metas</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] pl-1">Gerenciamento Diário</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-black/5 dark:bg-white/5 rounded-[24px] p-5 border border-black/5 dark:border-white/5 shadow-inner">
                <Label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-[0.15em] mb-2 block">Meta Diária</Label>
                <Input
                  name="dailyGoal"
                  type="number"
                  inputMode="decimal"
                  value={formData.dailyGoal || ''}
                  onChange={handleChange}
                  className="h-10 p-0 border-none bg-transparent text-zinc-900 dark:text-zinc-100 font-black shadow-none focus-visible:ring-0 text-xl"
                />
              </div>
              <div className="bg-black/5 dark:bg-white/5 rounded-[24px] p-5 border border-black/5 dark:border-white/5 shadow-inner">
                <Label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-[0.15em] mb-2 block">Stop Loss</Label>
                <Input
                  name="stopLoss"
                  type="number"
                  inputMode="decimal"
                  value={formData.stopLoss || ''}
                  onChange={handleChange}
                  className="h-10 p-0 border-none bg-transparent text-rose-500 font-black shadow-none focus-visible:ring-0 text-xl"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] pl-1">Valores Sugeridos</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-black/5 dark:bg-white/5 rounded-[24px] p-5 border border-black/5 dark:border-white/5 shadow-inner">
                <Label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-[0.15em] mb-2 block">Entrada MÃE</Label>
                <Input
                  name="defaultMaeDeposit"
                  type="number"
                  inputMode="decimal"
                  value={formData.defaultMaeDeposit || ''}
                  onChange={handleChange}
                  className="h-10 p-0 border-none bg-transparent text-zinc-900 dark:text-zinc-100 font-black shadow-none focus-visible:ring-0 text-xl"
                />
              </div>
              <div className="bg-black/5 dark:bg-white/5 rounded-[24px] p-5 border border-black/5 dark:border-white/5 shadow-inner">
                <Label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-[0.15em] mb-2 block">Entrada FILHA</Label>
                <Input
                  name="defaultFilhaDeposit"
                  type="number"
                  inputMode="decimal"
                  value={formData.defaultFilhaDeposit || ''}
                  onChange={handleChange}
                  className="h-10 p-0 border-none bg-transparent text-zinc-900 dark:text-zinc-100 font-black shadow-none focus-visible:ring-0 text-xl"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <Button onClick={handleSave} className="w-full h-16 rounded-[24px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black shadow-2xl shadow-black/20 hover:opacity-90 active:scale-[0.98] transition-all text-base tracking-widest uppercase">
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}