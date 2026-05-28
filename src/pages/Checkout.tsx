"use client";

import React, { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { Navigate } from 'react-router-dom';
import { ShieldCheck, Sparkles, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { LiquidGlassBackground } from '../components/LiquidGlassBackground';
import { Button } from '../components/ui/button';
import { showError } from '../utils/toast';

export default function Checkout() {
  const { session, user, isPaid } = useAuth();
  const [processing, setProcessing] = useState(false);

  if (!session) return <Navigate to="/login" replace />;
  if (isPaid) return <Navigate to="/" replace />;

  const handlePaySecurely = async () => {
    if (!user) return;
    setProcessing(true);
    
    try {
      // Chama a Edge Function para gerar o checkout seguro no Mercado Pago
      const response = await fetch('https://ijiipeugnflpckqsujkg.supabase.co/functions/v1/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.url) {
        throw new Error(result.error || 'Erro ao gerar o checkout');
      }

      // Redireciona o usuário para o Mercado Pago
      window.location.href = result.url;

    } catch (err: any) {
      console.error(err);
      showError(err.message || "Não foi possível conectar ao Mercado Pago.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-[100dvh] relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#f4f4f7] dark:bg-[#020204]">
      <LiquidGlassBackground />
      
      <div className="relative z-10 w-full max-w-md flex flex-col gap-6">
        
        {/* Pitch de Vendas / Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full mb-4">
            <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Versão de Alto Desempenho</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-zinc-950 dark:text-white leading-none">
            Desbloqueie o Premium
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm mt-2">
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

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
              <span>Simulação de Ciclos de Alta Precisão</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
              <span>Gráficos de Performance e Histórico Completo</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
              <span>Anotações Avançadas Integradas</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
              <span>Exportação ilimitada de PDF e CSV</span>
            </div>
          </div>

          <Button 
            onClick={handlePaySecurely}
            disabled={processing}
            className="w-full h-14 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-base shadow-xl flex items-center justify-center gap-2"
          >
            {processing ? (
              <Loader2 className="animate-spin mr-2" size={20} />
            ) : (
              <>
                Pagar com Mercado Pago <ArrowRight size={18} />
              </>
            )}
          </Button>

          <p className="text-[10px] text-zinc-400 text-center mt-4">
            Pague de forma segura usando Pix ou Cartão de Crédito.
          </p>
        </div>

        {/* Informações de Segurança */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400/80 uppercase font-black tracking-widest">
          <ShieldCheck size={14} className="text-indigo-500" />
          <span>Conexão Protegida Ativa</span>
        </div>

      </div>
    </div>
  );
}