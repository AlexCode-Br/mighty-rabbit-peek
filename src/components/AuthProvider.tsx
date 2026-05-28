import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { LiquidGlassBackground } from './LiquidGlassBackground';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isPaid: boolean;
  setIsPaid: (paid: boolean) => void;
  signOut: () => void;
  refreshPaymentStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  session: null, 
  user: null, 
  isPaid: false, 
  setIsPaid: () => {}, 
  signOut: () => {},
  refreshPaymentStatus: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const fetchProfilePaymentStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_paid')
        .eq('id', userId)
        .single();
        
      if (!error && data) {
        setIsPaid(!!data.is_paid);
      } else {
        // Caso a coluna ainda não exista localmente durante a transição, garantimos acesso para evitar quebras
        setIsPaid(false);
      }
    } catch (err) {
      console.error("Erro ao carregar perfil de pagamento:", err);
      setIsPaid(false);
    }
  };

  const refreshPaymentStatus = async () => {
    if (user) {
      await fetchProfilePaymentStatus(user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfilePaymentStatus(session.user.id);
      }
      setTimeout(() => setLoading(false), 800);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfilePaymentStatus(session.user.id);
      } else {
        setIsPaid(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, isPaid, setIsPaid, signOut, refreshPaymentStatus }}>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f4f4f7] dark:bg-[#020204] overflow-hidden"
          >
            <LiquidGlassBackground />
            
            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-20 h-20 rounded-[28px] liquid-glass-panel flex items-center justify-center shadow-2xl mb-6 border-white/20"
              >
                <Wallet size={32} strokeWidth={2.5} className="text-zinc-900 dark:text-white" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <h2 className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white flex items-center gap-0.5">
                  <span>Trade</span><span className="text-zinc-500/80 dark:text-zinc-400">Tracker</span>
                </h2>
                <div className="mt-4 flex items-center gap-1.5 justify-center">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white" 
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-zinc-500" 
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.4 }}
                    className="w-1.5 h-1.5 rounded-full bg-zinc-400" 
                  />
                </div>
              </motion.div>
            </div>
            
            <div className="absolute bottom-10 left-0 right-0 text-center">
              <span className="text-[10px] font-bold text-zinc-400/80 uppercase tracking-[0.2em] opacity-50">
                Sincronizando dados...
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);