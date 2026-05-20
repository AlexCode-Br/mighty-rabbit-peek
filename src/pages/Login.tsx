import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { Navigate } from 'react-router-dom';

export default function Login() {
  const { session } = useAuth();

  if (session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
        
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Trade<span className="text-orange-500">Tracker</span>
          </h1>
          <p className="text-zinc-400 mt-2 text-sm font-medium">Faça login para salvar seus dados na nuvem.</p>
        </div>

        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#f97316',
                  brandAccent: '#ea580c',
                  inputText: 'white',
                  inputBackground: '#18181b',
                  inputBorder: '#27272a',
                  messageText: '#a1a1aa',
                }
              }
            },
            className: {
              input: 'bg-zinc-950 border-white/10 text-white rounded-xl h-12 focus-visible:ring-1 focus-visible:ring-orange-500 font-medium',
              button: 'rounded-xl font-bold tracking-wide h-12 bg-orange-500 hover:bg-orange-600 border-none mt-2 transition-colors',
              label: 'text-zinc-400 font-bold tracking-widest text-[10px] uppercase mb-1.5',
              anchor: 'text-orange-500 hover:text-orange-400 font-medium text-sm transition-colors',
            }
          }}
          theme="dark"
        />
      </div>
    </div>
  );
}