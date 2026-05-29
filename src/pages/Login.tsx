import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Wallet } from 'lucide-react';
import { LiquidGlassBackground } from '../components/LiquidGlassBackground';

export default function Login() {
  const { session } = useAuth();
  const { resolvedTheme } = useTheme();

  if (session) return <Navigate to="/" replace />;

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="min-h-[100dvh] relative flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-[#f4f4f7] dark:bg-[#020204]">
      <LiquidGlassBackground />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-md liquid-glass-panel rounded-[32px] p-8 sm:p-10 shadow-2xl border-white/20"
      >
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-[#1d1d36] to-[#0a0a14] dark:from-white dark:to-zinc-100 flex items-center justify-center shadow-xl mb-6 border border-white/10">
            <Wallet size={32} strokeWidth={2.5} className="text-white dark:text-zinc-950" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-zinc-950 dark:text-white flex items-center gap-0.5">
            <span>Trade</span><span className="text-zinc-500/80 dark:text-zinc-400">Tracker</span>
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] mt-2 text-[10px]">Portal de Performance</p>
        </div>

        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: isDark ? '#fff' : '#000',
                  brandAccent: isDark ? '#f4f4f5' : '#18181b',
                  inputText: isDark ? '#fff' : '#000',
                  inputBackground: 'rgba(255, 255, 255, 0.05)',
                  inputBorder: 'rgba(255, 255, 255, 0.1)',
                  messageText: isDark ? '#a1a1aa' : '#71717a',
                }
              }
            },
            className: {
              input: 'bg-white/5 border-white/10 text-zinc-950 dark:text-white rounded-xl h-12 text-base font-bold shadow-inner focus:border-white/20 transition-all',
              button: 'rounded-xl font-black h-14 text-base bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-none mt-2 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]',
              label: 'text-zinc-500 font-bold uppercase tracking-widest text-[9px] mb-2',
              anchor: 'text-zinc-500 hover:text-zinc-950 dark:hover:text-white font-bold text-[11px] uppercase tracking-widest transition-colors mt-4 block text-center',
            }
          }}
          theme={isDark ? "dark" : "light"}
        />
      </motion.div>
    </div>
  );
}