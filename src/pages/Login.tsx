import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
  const { session } = useAuth();

  if (session) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200/60"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center shadow-md mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            TradeTracker
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">Entre para continuar</p>
        </div>

        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#18181b', // zinc-900
                  brandAccent: '#27272a', // zinc-800
                  inputText: '#18181b',
                  inputBackground: '#fff',
                  inputBorder: '#e4e4e7',
                  messageText: '#71717a',
                }
              }
            },
            className: {
              input: 'bg-white border-zinc-200 text-zinc-900 rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-zinc-900 font-medium shadow-sm transition-all',
              button: 'rounded-xl font-medium h-11 bg-zinc-900 hover:bg-zinc-800 border-none mt-2 transition-all shadow-sm',
              label: 'text-zinc-500 font-medium tracking-wide text-xs mb-1.5',
              anchor: 'text-zinc-500 hover:text-zinc-900 font-medium text-sm transition-colors',
            }
          }}
          theme="light"
        />
      </motion.div>
    </div>
  );
}