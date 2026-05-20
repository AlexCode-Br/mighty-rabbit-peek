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
      <DialogContent className="sm:max-w-md rounded-[32px] bg-white dark:bg-zinc-900 border-none shadow-2xl p-8 [&>button]:hidden outline-none">
        <DialogHeader className="mb-6 relative text-left">
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute -right-2 -top-2 h-8 w-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
          <DialogTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight pr-8">Ajustes</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Diário</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-800">
                <Label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-widest mb-1.5 block">Meta</Label>
                <Input
                  name="dailyGoal"
                  type="number"
                  inputMode="decimal"
                  value={formData.dailyGoal || ''}
                  onChange={handleChange}
                  className="h-8 p-0 border-none bg-transparent text-zinc-900 dark:text-zinc-100 font-semibold shadow-none focus-visible:ring-0 text-lg"
                />
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-800">
                <Label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-widest mb-1.5 block">Stop Loss</Label>
                <Input
                  name="stopLoss"
                  type="number"
                  inputMode="decimal"
                  value={formData.stopLoss || ''}
                  onChange={handleChange}
                  className="h-8 p-0 border-none bg-transparent text-rose-500 font-semibold shadow-none focus-visible:ring-0 text-lg"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Valores Padrão</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-800">
                <Label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-widest mb-1.5 block">MÃE</Label>
                <Input
                  name="defaultMaeDeposit"
                  type="number"
                  inputMode="decimal"
                  value={formData.defaultMaeDeposit || ''}
                  onChange={handleChange}
                  className="h-8 p-0 border-none bg-transparent text-zinc-900 dark:text-zinc-100 font-semibold shadow-none focus-visible:ring-0 text-lg"
                />
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-800">
                <Label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-widest mb-1.5 block">FILHA</Label>
                <Input
                  name="defaultFilhaDeposit"
                  type="number"
                  inputMode="decimal"
                  value={formData.defaultFilhaDeposit || ''}
                  onChange={handleChange}
                  className="h-8 p-0 border-none bg-transparent text-zinc-900 dark:text-zinc-100 font-semibold shadow-none focus-visible:ring-0 text-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button onClick={handleSave} className="w-full h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium shadow-[0_4px_14px_0_rgb(0,0,0,0.1)]">
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}