"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../integrations/supabase/client';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'react-router-dom';
import { Wallet, ShieldCheck, Sparkles, CreditCard, CheckCircle2, Copy, Loader2, ArrowRight } from 'lucide-react';
import { LiquidGlassBackground } from '../components/LiquidGlassBackground';
import { Button } from '../components/ui/button';
import { showSuccess, showError } from '../utils/toast';
import confetti from 'canvas-confetti';

export default function Checkout() {
  const { session, user, isPaid, setIsPaid } = useAuth();
  const [activeTab, setActiveTab] = useState<'pix' | 'card'>('pix');
  const [processing, setProcessing] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutos para o Pix
  const [copied, setCopied] = useState(false);
  
  // Estados do formulário de cartão de crédito
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  if (!session) return <Navigate to="/login" replace />;
  if (isPaid) return <Navigate to="/" replace />;

  // Cronômetro do Pix
  useEffect(() => {
    if (activeTab !== 'pix') return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 600));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTab]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const pixKey = "00020101021226830014br.gov.bcb.pix2561qr.trade-tracker-premium.19.90.active.production.key";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    showSuccess("Código Pix Copia e Cola copiado!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePaymentSuccess = async () => {
    if (!user) return;
    setProcessing(true);
    
    try {
      // Atualiza o status no Supabase de maneira imediata
      const { error } = await supabase
        .from('profiles')
        .update({ is_paid: true })
        .eq('id', user.id);

      if (error) throw error;

      // Dispara celebração de sucesso
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#6366f1', '#10b981', '#3b82f6', '#fafafa'],
        zIndex: 9999
      });

      setIsPaid(true);
      showSuccess("Acesso vitalício desbloqueado! Seja bem-vindo ao Premium.");
    } catch (err) {
      console.error(err);
      showError("Erro ao atualizar o pagamento. Tente novamente.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      showError("Preencha todos os campos do cartão.");
      return;
    }
    
    setProcessing(true);
    setTimeout(() => {
      handlePaymentSuccess();
    }, 2000); // Simula 2 segundos de aprovação bancária
  };

  return (
    <div className="min-h-[100dvh] relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#f4f4f7] dark:bg-[#020204]">
      <LiquidGlassBackground />
      
      <div className="relative z-10 w-full max-w-lg flex flex-col gap-6">
        
        {/* Pitch de Vendas / Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full mb-4">
            <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Versão de Alto Desempenho</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-zinc-950 dark:text-white leading-none">
            Desbloqueie o Premium
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm mt-2 max-w-sm mx-auto">
            Faça como os melhores traders e controle seus ciclos sem limites.
          </p>
        </div>

        {/* Card de Preço / Benefícios */}
        <div className="liquid-glass-panel rounded-[28px] p-6 border-white/20 shadow-xl">
          <div className="flex justify-between items-center mb-6 border-b border-zinc-200/50 dark:border-white/5 pb-4">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Acesso Vitalício</span>
              <h2 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white">R$ 19,90</h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Taxa Única</span>
              <p className="text-[10px] text-zinc-400 mt-1">Sem mensalidades</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
              <span>Simulação de Ciclos de Alta Precisão (Mãe e Filha)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
              <span>Gráficos de Performance e Histórico por Meses</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
              <span>Anotações Avançadas Integradas</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
              <span>Exportação ilimitada de PDF e CSV (Premium)</span>
            </div>
          </div>

          {/* Seletor de Abas de Pagamento */}
          <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-black/35 p-1 rounded-2xl mb-6 border border-zinc-200/40 dark:border-white/5">
            <button 
              onClick={() => setActiveTab('pix')}
              className={`h-11 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'pix' ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              <CheckCircle2 size={16} className="text-teal-500 shrink-0" /> Pix (Rápido)
            </button>
            <button 
              onClick={() => setActiveTab('card')}
              className={`h-11 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'card' ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              <CreditCard size={16} className="text-indigo-500 shrink-0" /> Cartão de Crédito
            </button>
          </div>

          {/* Aba Pix */}
          {activeTab === 'pix' && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-white p-3 rounded-2xl border border-zinc-200 shadow-inner">
                {/* QR Code Simulado Premium via SVG limpo */}
                <svg width="150" height="150" viewBox="0 0 100 100" className="text-zinc-950">
                  <path d="M5 5h30v30H5V5zm3 3v24h24V8H8zM5 65h30v30H5V65zm3 3v24h24V68H8zM65 5h30v30H65V5zm3 3v24h24V8H68z" fill="currentColor"/>
                  <path d="M14 14h12v12H14V14zm0 60h12v12H14V74zm60-60h12v12H74V14z" fill="currentColor"/>
                  <path d="M45 10h10v10H45V10zm5 25h20v5H50v-5zm-5 15h10v20H45V50zm15 15h15v10H60V65zm15-20h10v10H75V45zm-15-5h10v10H60V40z" fill="currentColor"/>
                </svg>
              </div>

              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Expira em</span>
                <span className="text-lg font-black text-rose-500 tracking-tight">{formatTime(countdown)}</span>
              </div>

              <div className="w-full space-y-2">
                <Button 
                  onClick={handleCopyPix}
                  variant="outline"
                  className="w-full h-12 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-200 font-bold text-xs"
                >
                  <Copy size={16} className="mr-2" /> 
                  {copied ? "Chave Copiada!" : "Copiar Chave Pix"}
                </Button>

                <Button 
                  onClick={handlePaymentSuccess}
                  disabled={processing}
                  className="w-full h-14 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white font-black text-base shadow-xl"
                >
                  {processing ? (
                    <Loader2 className="animate-spin mr-2" size={20} />
                  ) : (
                    "Confirmar Pagamento Realizado"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Aba Cartão de Crédito */}
          {activeTab === 'card' && (
            <form onSubmit={handleCardSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block ml-1">Número do Cartão</label>
                <input 
                  type="text" 
                  maxLength={19}
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                  className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 h-12 rounded-xl px-4 text-sm font-bold text-zinc-950 dark:text-white outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block ml-1">Nome no Cartão</label>
                <input 
                  type="text" 
                  placeholder="NOME DO TITULAR"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 h-12 rounded-xl px-4 text-sm font-bold text-zinc-950 dark:text-white outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block ml-1">Validade</label>
                  <input 
                    type="text" 
                    maxLength={5}
                    placeholder="MM/AA"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, '').replace(/(\d{2})/, '$1/'))}
                    className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 h-12 rounded-xl px-4 text-sm font-bold text-zinc-950 dark:text-white outline-none focus:border-indigo-500/50 transition-colors text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block ml-1">CVV</label>
                  <input 
                    type="password" 
                    maxLength={4}
                    placeholder="000"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 h-12 rounded-xl px-4 text-sm font-bold text-zinc-950 dark:text-white outline-none focus:border-indigo-500/50 transition-colors text-center"
                  />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={processing}
                className="w-full h-14 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-base shadow-xl mt-6"
              >
                {processing ? (
                  <Loader2 className="animate-spin mr-2" size={20} />
                ) : (
                  "Pagar R$ 19,90"
                )}
              </Button>
            </form>
          )}

        </div>

        {/* Informações de Segurança */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400/80 uppercase font-black tracking-widest">
          <ShieldCheck size={14} className="text-indigo-500" />
          <span>Pagamento Seguro de Teste Integrado</span>
        </div>

      </div>
    </div>
  );
}