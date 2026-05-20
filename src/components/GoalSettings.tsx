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
      <DialogContent className="sm:max-w-md rounded-[2rem] bg-zinc-950 border border-white/10 shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-orange-500 font-black text-2xl tracking-tight">Configurações</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 py-4">
          <div className="space-y-4">
            <h4 className="font-bold text-xs text-zinc-500 uppercase tracking-widest">Metas e Limites</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dailyGoal" className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest">Meta Diária (R$)</Label>
                <Input
                  id="dailyGoal"
                  name="dailyGoal"
                  type="number"
                  inputMode="decimal"
                  value={formData.dailyGoal || ''}
                  onChange={handleChange}
                  className="rounded-xl bg-zinc-900 border-white/5 text-white font-mono focus-visible:ring-1 focus-visible:ring-orange-500 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stopLoss" className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest">Stop Loss (R$)</Label>
                <Input
                  id="stopLoss"
                  name="stopLoss"
                  type="number"
                  inputMode="decimal"
                  value={formData.stopLoss || ''}
                  onChange={handleChange}
                  className="rounded-xl bg-zinc-900 border-white/5 text-white font-mono focus-visible:ring-1 focus-visible:ring-orange-500 h-12"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-xs text-zinc-500 uppercase tracking-widest">Entradas Padrão</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultMaeDeposit" className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest">MÃE (R$)</Label>
                <Input
                  id="defaultMaeDeposit"
                  name="defaultMaeDeposit"
                  type="number"
                  inputMode="decimal"
                  value={formData.defaultMaeDeposit || ''}
                  onChange={handleChange}
                  className="rounded-xl bg-zinc-900 border-white/5 text-white font-mono focus-visible:ring-1 focus-visible:ring-orange-500 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultFilhaDeposit" className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest">FILHA (R$)</Label>
                <Input
                  id="defaultFilhaDeposit"
                  name="defaultFilhaDeposit"
                  type="number"
                  inputMode="decimal"
                  value={formData.defaultFilhaDeposit || ''}
                  onChange={handleChange}
                  className="rounded-xl bg-zinc-900 border-white/5 text-white font-mono focus-visible:ring-1 focus-visible:ring-orange-500 h-12"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] border-none font-bold text-sm tracking-wide rounded-2xl h-12">
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
