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
      className="w-full text-sm font-semibold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 h-10 outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors shadow-sm placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
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
      <DialogContent className="sm:max-w-md w-[92vw] max-h-[90vh] overflow-y-auto rounded-[28px] bg-white dark:bg-zinc-900 border-none shadow-2xl p-5 [&>button]:hidden outline-none">
        <DialogHeader className="mb-4 relative text-left">
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute right-0 top-0 h-7 w-7 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
          <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight pr-8">Adicionar Ciclo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {/* MÃE */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-800/60">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 block"></span> MÃE
              </h4>
              <div className="flex items-center gap-1.5 cursor-pointer bg-white dark:bg-zinc-900/50 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700/50" onClick={() => setMaeBau(!maeBau)}>
                <Checkbox checked={maeBau} onCheckedChange={(c) => setMaeBau(!!c)} id="mae-bau-modal" className="w-3.5 h-3.5" />
                <Label htmlFor="mae-bau-modal" className="text-[9px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest cursor-pointer select-none">BAÚ</Label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest mb-1 block ml-1">Entrada</Label>
                <ModalCurrencyInput value={maeDeposit} onChange={(v) => setMaeDeposit(v || 0)} placeholder="R$ 0" />
              </div>
              <div>
                <Label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest mb-1 block ml-1">Saque (Opcional)</Label>
                <ModalCurrencyInput value={maeWithdraw} onChange={setMaeWithdraw} placeholder="Pendente" />
              </div>
            </div>
          </div>

          {/* FILHA */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-800/60">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 block"></span> FILHA
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest mb-1 block ml-1">Entrada</Label>
                <ModalCurrencyInput value={filhaDeposit} onChange={(v) => setFilhaDeposit(v || 0)} placeholder="R$ 0" />
              </div>
              <div>
                <Label className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest mb-1 block ml-1">Saque (Opcional)</Label>
                <ModalCurrencyInput value={filhaWithdraw} onChange={setFilhaWithdraw} placeholder="Pendente" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <Button onClick={handleSave} className="w-full h-11 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium shadow-sm">
            Adicionar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}