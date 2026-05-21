import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, PlusSquare, X, Download, Wallet } from 'lucide-react';

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Verifica se já está rodando como um app instalado (Standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    
    // Verifica qual é o sistema operacional
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    
    setIsIOS(isIOSDevice);

    // Se estiver no celular e NÃO estiver instalado, mostra o aviso
    if (!isStandalone && (isIOSDevice || isAndroidDevice)) {
      const hasDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!hasDismissed) {
        // Atraso de 2.5s para não pular na cara do usuário instantaneamente
        const timer = setTimeout(() => setShow(true), 2500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-24 left-0 right-0 mx-auto w-[92%] max-w-sm z-[100]"
        >
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-4 shadow-2xl relative overflow-hidden">
            <button 
              onClick={dismiss}
              className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
            
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-zinc-900 dark:bg-zinc-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm mt-1">
                <Wallet size={24} strokeWidth={2.5} className="text-white dark:text-zinc-900" />
              </div>
              
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-[15px] leading-tight mb-1">
                  Instale o App
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-snug mb-3">
                  Tenha acesso rápido e experiência de aplicativo direto na sua tela inicial.
                </p>
                
                {isIOS ? (
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5 flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800">
                    <span>1. Toque em</span>
                    <Share size={14} className="text-blue-500" />
                    <span>2.</span>
                    <PlusSquare size={14} className="text-zinc-900 dark:text-zinc-100" />
                    <span>Adicionar à Tela</span>
                  </div>
                ) : (
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5 flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800">
                    <Download size={14} className="text-blue-500 shrink-0" />
                    <span>Toque nos 3 pontos do navegador e em <strong>Adicionar à tela inicial</strong>.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}