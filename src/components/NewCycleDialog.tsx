import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { X } from 'lucide-react';
import { AppSettings } from '../types';
import { AddCycleData } from '../hooks/useOperationDays';

interface NewCycleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AppSettings;
  onSave: (data: AddCycleData) => void;
}

function ModalCurrencyInput({ value, onChange, placeholder }: { value: number | null, onChange: (val: number | null) => void, placeholder: string }) {
  const formatVal = (v: number) => `R$ ${v.toLocaleString('pt-BR')}`;
  const [inputValue, setInputValue] = useState(value !== null ? formatVal(value) : '');

  useEffect(() => {
    if (value !== null && inputValue !== formatVal(value)) {
      setInputValue(formatVal(value));
    } else if (value === null) {
      setInputValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digits = rawValue.replace(/\D/g, '');
    if (!digits) {
      setInputValue('');
      onChange(null);
      return;
    }
    const numValue = parseInt(digits, 10);
    setInputValue(formatVal(numValue));
    onChange(numValue);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={inputValue}
      onChange={handleChange}
      className="w-full text-base font-semibold text-zinc-900 dark:text-zinc-100 bg-transparent outline-none border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-700 py-1"
    />
  );
}

export function NewCycleDialog({ open, onOpenChange, settings, onSave }: NewCycleDialogProps) {
  const [maeDeposit, setMaeDeposit] = useState<number>(settings.defaultMaeDeposit);
  const [maeWithdraw, setMaeWithdraw] = useState<number | null>(null);
  const [maeBau, setMaeBau] = useState<boolean>(true);

  const [filhaDeposit, setFilhaDeposit] = useState<number>(settings.defaultFilhaDeposit);
  const [filhaWithdraw, setFilhaWithdraw] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setMaeDeposit(settings.defaultMaeDeposit);
      setMaeWithdraw(null);
      setMaeBau(true);
      setFilhaDeposit(settings.defaultFilhaDeposit);
      setFilhaWithdraw(null);
    }
  }, [open, settings]);

  const handleSave = () => {
    onSave({
      maeDeposit: maeDeposit || 0,
      maeWithdraw,
      maeBau,
      filhaDeposit: filhaDeposit || 0,
      filhaWithdraw
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[92vw] max-h-[90vh] overflow-y-auto rounded-[32px] bg-white dark:bg-zinc-900 border-none shadow-2xl p-6 sm:p-8 [&>button]:hidden outline-none">
        <DialogHeader className="mb-6 relative text-left">
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute -right-2 -top-2 h-8 w-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
          <DialogTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight pr-8">Adicionar Novo Ciclo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5">
          {/* MÃE */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100 block"></span> MÃE
              </h4>
              <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setMaeBau(!maeBau)}>
                <Checkbox checked={maeBau} onCheckedChange={(c) => setMaeBau(!!c)} id="mae-bau-modal" />
                <Label htmlFor="mae-bau-modal" className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest cursor-pointer select-none">BAÚ</Label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-widest mb-1.5 block">Entrada</Label>
                <ModalCurrencyInput value={maeDeposit} onChange={(v) => setMaeDeposit(v || 0)} placeholder="R$ 0" />
              </div>
              <div>
                <Label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-widest mb-1.5 block">Saque (Opcional)</Label>
                <ModalCurrencyInput value={maeWithdraw} onChange={setMaeWithdraw} placeholder="Pendente" />
              </div>
            </div>
          </div>

          {/* FILHA */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 block"></span> FILHA
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-widest mb-1.5 block">Entrada</Label>
                <ModalCurrencyInput value={filhaDeposit} onChange={(v) => setFilhaDeposit(v || 0)} placeholder="R$ 0" />
              </div>
              <div>
                <Label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-widest mb-1.5 block">Saque (Opcional)</Label>
                <ModalCurrencyInput value={filhaWithdraw} onChange={setFilhaWithdraw} placeholder="Pendente" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-2">
          <Button onClick={handleSave} className="w-full h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium shadow-[0_4px_14px_0_rgb(0,0,0,0.1)]">
            Adicionar Ciclo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}