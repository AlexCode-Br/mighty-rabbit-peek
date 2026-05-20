import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

export default function Login() {
  const { session } = useAuth();
  const { theme } = useTheme();

  if (session) return <Navigate to="/" replace />;

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-zinc-950 flex items-center justify-center p-4 transition-colors">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-zinc-200/60 dark:border-zinc-800/60"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shadow-md mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white dark:text-zinc-900" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            TradeTracker
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
              input: 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 font-medium shadow-sm transition-all',
              button: 'rounded-xl font-medium h-11 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 border-none mt-2 transition-all shadow-sm',
              label: 'text-zinc-500 dark:text-zinc-400 font-medium tracking-wide text-xs mb-1.5',
              anchor: 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium text-sm transition-colors',
            }
          }}
          theme={isDark ? "dark" : "light"}
        />
      </motion.div>
    </div>
  );
}