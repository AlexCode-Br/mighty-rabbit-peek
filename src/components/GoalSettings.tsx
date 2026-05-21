import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { AppSettings } from '../types';
import { X } from 'lucide-react';

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
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[85dvh] overflow-y-auto rounded-[32px] liquid-glass-panel border-white/20 shadow-2xl p-5 sm:p-6 [&>button]:hidden outline-none">
        <DialogHeader className="mb-6 relative text-left">
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute right-0 top-0 h-8 w-8 flex items-center justify-center rounded-full bg-white/10 text-zinc-500 hover:bg-white/20 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
          <DialogTitle className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter pr-10">Ajustes</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] pl-1">Diário</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 shadow-inner">
                <Label className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1 block">Meta</Label>
                <Input
                  name="dailyGoal"
                  type="number"
                  inputMode="decimal"
                  value={formData.dailyGoal || ''}
                  onChange={handleChange}
                  className="h-8 p-0 border-none bg-transparent text-zinc-950 dark:text-white font-black text-lg focus-visible:ring-0"
                />
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 shadow-inner">
                <Label className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1 block">Stop Loss</Label>
                <Input
                  name="stopLoss"
                  type="number"
                  inputMode="decimal"
                  value={formData.stopLoss || ''}
                  onChange={handleChange}
                  className="h-8 p-0 border-none bg-transparent text-rose-500 font-black text-lg focus-visible:ring-0"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] pl-1">Valores Padrão</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 shadow-inner">
                <Label className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1 block">MÃE</Label>
                <Input
                  name="defaultMaeDeposit"
                  type="number"
                  inputMode="decimal"
                  value={formData.defaultMaeDeposit || ''}
                  onChange={handleChange}
                  className="h-8 p-0 border-none bg-transparent text-zinc-950 dark:text-white font-black text-lg focus-visible:ring-0"
                />
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 shadow-inner">
                <Label className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1 block">FILHA</Label>
                <Input
                  name="defaultFilhaDeposit"
                  type="number"
                  inputMode="decimal"
                  value={formData.defaultFilhaDeposit || ''}
                  onChange={handleChange}
                  className="h-8 p-0 border-none bg-transparent text-zinc-950 dark:text-white font-black text-lg focus-visible:ring-0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button onClick={handleSave} className="w-full h-14 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-base shadow-xl border-white/10 hover:scale-[1.02] active:scale-[0.98] transition-transform">
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}