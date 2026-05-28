"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { Navigate } from 'react-router-dom';
import { ShieldCheck, Sparkles, CheckCircle2, Loader2, Copy, Check, QrCode, Smartphone, LogOut } from 'lucide-react';
import { LiquidGlassBackground } from '../components/LiquidGlassBackground';
import { Button } from '../components/ui/button';
import { showSuccess, showError } from '../utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface PixData {
  qrCode: string;
  qrCodeBase64: string;
  ticketUrl: string;
  paymentId: number;
}

export default function Checkout() {
  const { session, user, isPaid, refreshPaymentStatus, signOut } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);

  // Efeito de escuta/pooling automático (Verifica o pagamento a cada 4 segundos se o Pix estiver aberto)
  useEffect(() => {
    if (!pixData || isPaid) return;

    const interval = setInterval(async () => {
      await refreshPaymentStatus();
    }, 4000);

    return () => clearInterval(interval);
  }, [pixData, isPaid, refreshPaymentStatus]);

  // Efeito de Confetes premium ao confirmar o pagamento com sucesso
  useEffect(() => {
    if (isPaid) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#3b82f6', '#ffffff']
      });
    }
  }, [isPaid]);

  // Redireciona caso já esteja pago ou sem login (Mergulhado após a declaração de TODOS os hooks)
  if (!session) return <Navigate to="/login" replace />;
  if (isPaid) return <Navigate to="/" replace />;

  const handleGeneratePix = async () => {
    if (!user) return;
    setGenerating(true);
    
    try {
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

      if (!response.ok || !result.qrCode) {
        throw new Error(result.error || 'Erro ao gerar o código PIX');
      }

      setPixData(result);
      showSuccess('PIX gerado com sucesso!');

    } catch (err: any) {
      console.error(err);
      showError(err.message || "Não foi possível gerar o PIX.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (!pixData) return;
    navigator.clipboard.writeText(pixData.qrCode);
    setCopied(true);
    showSuccess('Código Pix copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleManualCheck = async () => {
    setChecking(true);
    try {
      await refreshPaymentStatus();
      if (!isPaid) {
        showError('Pagamento ainda não detectado. Aguarde alguns instantes.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-[100dvh] relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#f4f4f7] dark:bg-[#020204]">
      <LiquidGlassBackground />
      
      <div className="relative z-10 w-full max-w-md flex flex-col gap-6 my-4">
        
        {/* Pitch de Vendas / Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full mb-4">
            <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Liberação Imediata</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-zinc-950 dark:text-white leading-none">
            Acesso Premium Vitalício
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm mt-2">
            Controle ilimitado de ciclos, anotações inteligentes e relatórios gerenciais avançados.
          </p>
        </div>

        {/* Card de Preço / Benefícios */}
        <div className="liquid-glass-panel rounded-[28px] p-6 border-white/20 shadow-xl">
          
          <AnimatePresence mode="wait">
            {!pixData ? (
              // TELA INICIAL: BENEFÍCIOS + BOTÃO GERAR PIX
              <motion.div
                key="pitch-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-6 border-b border-zinc-200/50 dark:border-white/5 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Acesso Vitalício</span>
                    <h2 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white">R$ 19,90</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Única vez</span>
                    <p className="text-[10px] text-zinc-400 mt-1">Sem mensalidades</p>
                  </div>
                </div>

                <div className="space-y-3.5 mb-8">
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
                  onClick={handleGeneratePix}
                  disabled={generating}
                  className="w-full h-14 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-base shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  {generating ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Gerando PIX Seguro...
                    </>
                  ) : (
                    <>
                      Pagar via Pix R$ 19,90
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              // TELA PIX GERADO: QR CODE + COPIA E COLA
              <motion.div
                key="pix-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                {/* QR Code Container */}
                <div className="relative w-48 h-48 bg-white p-3 rounded-2xl shadow-inner border border-zinc-200/50 flex items-center justify-center mb-6">
                  <img 
                    src={`data:image/png;base64,${pixData.qrCodeBase64}`} 
                    alt="QR Code Pix"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute -bottom-2 bg-indigo-600 text-white font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <QrCode size={10} /> Escanear QR Code
                  </div>
                </div>

                {/* Copia e Cola Input */}
                <div className="w-full bg-zinc-50 dark:bg-black/40 border dark:border-white/5 rounded-2xl p-4.5 mb-5 flex flex-col gap-2 shadow-inner">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Código Copia e Cola</span>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      readOnly 
                      value={pixData.qrCode} 
                      className="flex-1 bg-transparent border-none text-xs text-zinc-900 dark:text-zinc-100 font-mono font-medium outline-none truncate"
                    />
                    <button 
                      onClick={handleCopyCode}
                      className="p-2 rounded-lg bg-white dark:bg-white/10 text-zinc-600 dark:text-zinc-300 hover:text-indigo-500 dark:hover:text-white border dark:border-white/5 shadow-sm active:scale-[0.95] transition-transform shrink-0"
                    >
                      {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                {/* Instruções de Pagamento */}
                <div className="w-full space-y-2 mb-6">
                  <div className="flex items-start gap-2 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    <Smartphone size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                    <span>Abra o app do seu banco ou carteira digital e selecione a área PIX.</span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    <CheckCircle2 size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                    <span>Escaneie o QR Code acima ou cole o código Copia e Cola.</span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    <Loader2 size={14} className="text-indigo-500 animate-spin shrink-0 mt-0.5" />
                    <span>Aguardando pagamento... A liberação é imediata.</span>
                  </div>
                </div>

                {/* Botão de Verificação Manual */}
                <div className="w-full grid grid-cols-1 gap-2.5">
                  <Button 
                    onClick={handleManualCheck}
                    disabled={checking}
                    variant="outline"
                    className="w-full h-12 rounded-xl font-bold text-xs shadow-sm bg-white dark:bg-white/5 hover:bg-zinc-50 dark:hover:bg-white/10 border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-zinc-200"
                  >
                    {checking ? (
                      <>
                        <Loader2 className="animate-spin mr-1.5" size={14} /> Verificando...
                      </>
                    ) : (
                      "Já paguei, verificar agora"
                    )}
                  </Button>
                  <button 
                    onClick={() => setPixData(null)}
                    className="text-[10px] font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors py-1 uppercase tracking-wider"
                  >
                    Voltar para opções
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-[10px] text-zinc-400 text-center mt-4">
            Processamento de pagamento auditado de forma segura via Mercado Pago Pix.
          </p>
        </div>

        {/* Informações de Segurança + Opção de Voltar/Mudar Conta */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400/80 uppercase font-black tracking-widest">
            <ShieldCheck size={14} className="text-indigo-500" />
            <span>Conexão Segura e Criptografada</span>
          </div>
          
          <button 
            onClick={signOut}
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-400/60 hover:text-rose-500 dark:text-zinc-500 dark:hover:text-rose-400 transition-colors mt-2"
          >
            <LogOut size={12} />
            <span>Sair da conta atual</span>
          </button>
        </div>

      </div>
    </div>
  );
}