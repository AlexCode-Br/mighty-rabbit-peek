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
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-orange-500 font-bold text-xl">Configurações</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Metas e Limites</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dailyGoal">Meta Diária (R$)</Label>
                <Input
                  id="dailyGoal"
                  name="dailyGoal"
                  type="number"
                  inputMode="decimal"
                  value={formData.dailyGoal || ''}
                  onChange={handleChange}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stopLoss">Stop Loss (R$)</Label>
                <Input
                  id="stopLoss"
                  name="stopLoss"
                  type="number"
                  inputMode="decimal"
                  value={formData.stopLoss || ''}
                  onChange={handleChange}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Entradas Padrão</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultMaeDeposit">MÃE (R$)</Label>
                <Input
                  id="defaultMaeDeposit"
                  name="defaultMaeDeposit"
                  type="number"
                  inputMode="decimal"
                  value={formData.defaultMaeDeposit || ''}
                  onChange={handleChange}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultFilhaDeposit">FILHA (R$)</Label>
                <Input
                  id="defaultFilhaDeposit"
                  name="defaultFilhaDeposit"
                  type="number"
                  inputMode="decimal"
                  value={formData.defaultFilhaDeposit || ''}
                  onChange={handleChange}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 rounded-xl">
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
