import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { AppSettings } from '../types';

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
      <DialogContent className="sm:max-w-md rounded-[2rem] bg-white border-none shadow-2xl p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-slate-800 font-black text-2xl tracking-tight">Configurações</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 py-2">
          <div className="space-y-4">
            <h4 className="font-bold text-xs text-indigo-600 uppercase tracking-widest bg-indigo-50 inline-block px-3 py-1 rounded-md">Metas e Limites</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dailyGoal" className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Meta Diária (R$)</Label>
                <Input
                  id="dailyGoal"
                  name="dailyGoal"
                  type="number"
                  inputMode="decimal"
                  value={formData.dailyGoal || ''}
                  onChange={handleChange}
                  className="rounded-xl bg-slate-50 border-slate-200 text-slate-800 font-mono font-bold focus-visible:ring-2 focus-visible:ring-indigo-500 h-12 shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stopLoss" className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Stop Loss (R$)</Label>
                <Input
                  id="stopLoss"
                  name="stopLoss"
                  type="number"
                  inputMode="decimal"
                  value={formData.stopLoss || ''}
                  onChange={handleChange}
                  className="rounded-xl bg-slate-50 border-slate-200 text-slate-800 font-mono font-bold focus-visible:ring-2 focus-visible:ring-rose-500 h-12 shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-xs text-indigo-600 uppercase tracking-widest bg-indigo-50 inline-block px-3 py-1 rounded-md">Entradas Padrão</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultMaeDeposit" className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">MÃE (R$)</Label>
                <Input
                  id="defaultMaeDeposit"
                  name="defaultMaeDeposit"
                  type="number"
                  inputMode="decimal"
                  value={formData.defaultMaeDeposit || ''}
                  onChange={handleChange}
                  className="rounded-xl bg-slate-50 border-slate-200 text-slate-800 font-mono font-bold focus-visible:ring-2 focus-visible:ring-indigo-500 h-12 shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultFilhaDeposit" className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">FILHA (R$)</Label>
                <Input
                  id="defaultFilhaDeposit"
                  name="defaultFilhaDeposit"
                  type="number"
                  inputMode="decimal"
                  value={formData.defaultFilhaDeposit || ''}
                  onChange={handleChange}
                  className="rounded-xl bg-slate-50 border-slate-200 text-slate-800 font-mono font-bold focus-visible:ring-2 focus-visible:ring-indigo-500 h-12 shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 font-bold text-sm rounded-2xl h-12 transition-all">
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}