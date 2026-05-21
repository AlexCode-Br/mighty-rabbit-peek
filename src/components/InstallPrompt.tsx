import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, PlusSquare, X, Download, Wallet } from 'lucide-react';

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    
    setIsIOS(isIOSDevice);

    if (!isStandalone && (isIOSDevice || isAndroidDevice)) {
      const hasDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!hasDismissed) {
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
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-24 left-0 right-0 mx-auto w-[92%] max-w-sm z-[100]"
        >
          <div className="liquid-glass-panel rounded-[32px] p-4 shadow-2xl relative overflow-hidden border-white/20">
            <button 
              onClick={dismiss}
              className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
            
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-zinc-950 dark:bg-white rounded-[18px] flex items-center justify-center shrink-0 shadow-lg border border-white/10">
                <Wallet size={28} strokeWidth={2.5} className="text-white dark:text-zinc-950" />
              </div>
              
              <div className="flex-1 pr-4">
                <h3 className="font-black text-zinc-950 dark:text-zinc-100 text-[15px] leading-tight mb-1">
                  Instale o App
                </h3>
                <p className="text-zinc-500/80 dark:text-zinc-400 text-xs leading-snug mb-3">
                  Tenha acesso rápido direto na sua tela inicial.
                </p>
                
                {isIOS ? (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                    <span>Toque em</span>
                    <Share size={14} className="text-blue-500" />
                    <span>e</span>
                    <PlusSquare size={14} className="text-zinc-900 dark:text-zinc-100" />
                    <span className="truncate">Adicionar à Tela</span>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                    <Download size={14} className="text-blue-500 shrink-0" />
                    <span>Toque nos 3 pontos e em <strong>Adicionar à tela inicial</strong>.</span>
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