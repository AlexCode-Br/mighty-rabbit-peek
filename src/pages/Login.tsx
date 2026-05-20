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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-100">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-200/60 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600" />
        
        <div className="text-center mb-8 flex flex-col items-center mt-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Trade<span className="text-indigo-600">Tracker</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Faça login para salvar seus dados com segurança.</p>
        </div>

        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#4f46e5', // indigo-600
                  brandAccent: '#4338ca', // indigo-700
                  inputText: '#0f172a', // slate-900
                  inputBackground: '#f8fafc', // slate-50
                  inputBorder: '#e2e8f0', // slate-200
                  messageText: '#64748b', // slate-500
                }
              }
            },
            className: {
              input: 'bg-slate-50 border-slate-200 text-slate-900 rounded-xl h-12 focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium shadow-sm',
              button: 'rounded-xl font-bold tracking-wide h-12 bg-indigo-600 hover:bg-indigo-700 border-none mt-2 transition-all shadow-md shadow-indigo-600/20',
              label: 'text-slate-500 font-bold tracking-widest text-[10px] uppercase mb-1.5',
              anchor: 'text-indigo-600 hover:text-indigo-700 font-bold text-sm transition-colors',
            }
          }}
          theme="light"
        />
      </div>
    </div>
  );
}