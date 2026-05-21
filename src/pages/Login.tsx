import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Wallet } from 'lucide-react';

export default function Login() {
  const { session } = useAuth();
  const { theme } = useTheme();

  if (session) return <Navigate to="/" replace />;

  const isDark = theme === 'dark';

  return (
    <div 
      className="min-h-[100dvh] bg-[#FAFAFA] dark:bg-zinc-950 flex items-center justify-center p-4 sm:p-8 transition-colors"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-zinc-200/60 dark:border-zinc-800/60"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shadow-md mb-4">
            <Wallet size={24} strokeWidth={2.5} className="text-white dark:text-zinc-900" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
            <span>Trade</span><span className="text-zinc-500 dark:text-zinc-400">Tracker</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">Entre para continuar</p>
        </div>

        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: isDark ? '#f4f4f5' : '#18181b', // zinc-100 / zinc-900
                  brandAccent: isDark ? '#e4e4e7' : '#27272a', // zinc-200 / zinc-800
                  inputText: isDark ? '#f4f4f5' : '#18181b',
                  inputBackground: isDark ? '#18181b' : '#fff',
                  inputBorder: isDark ? '#27272a' : '#e4e4e7',
                  messageText: isDark ? '#a1a1aa' : '#71717a',
                }
              }
            },
            className: {
              input: 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl h-12 text-base focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 font-medium shadow-sm transition-all',
              button: 'rounded-xl font-medium h-12 text-base bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 border-none mt-2 transition-all shadow-sm',
              label: 'text-zinc-500 dark:text-zinc-400 font-medium tracking-wide text-xs mb-1.5',
              anchor: 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium text-[13px] sm:text-sm transition-colors',
            }
          }}
          theme={isDark ? "dark" : "light"}
        />
      </motion.div>
    </div>
  );
}