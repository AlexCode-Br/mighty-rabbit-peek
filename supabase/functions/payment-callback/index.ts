import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

serve((req) => {
  const url = new URL(req.url)
  const status = url.searchParams.get('status') || 'success'

  // HTML com visual Premium combinando com o TradeTracker
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pagamento Processado - TradeTracker</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', sans-serif;
          background-color: #020204;
          color: #ffffff;
        }
        .liquid-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        }
      </style>
    </head>
    <body class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-md liquid-card rounded-[32px] p-8 text-center">
        
        ${status === 'success' ? `
          <!-- ÍCONE SUCESSO -->
          <div class="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-[24px] flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          
          <h1 class="text-2xl font-black tracking-tight mb-2">Acesso Liberado!</h1>
          <p class="text-zinc-400 text-sm mb-8">Seu pagamento foi aprovado pelo Mercado Pago. O seu acesso premium vitalício ao TradeTracker já está ativo.</p>
        ` : `
          <!-- ÍCONE FALHA OU PENDENTE -->
          <div class="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-[24px] flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          
          <h1 class="text-2xl font-black tracking-tight mb-2">Quase lá!</h1>
          <p class="text-zinc-400 text-sm mb-8">O pagamento está sendo processado ou aguardando compensação. Assim que for confirmado, seu app será liberado.</p>
        `}

        <button 
          onclick="window.location.href = '/'"
          class="w-full h-14 rounded-2xl bg-white text-zinc-950 font-black text-base shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          Voltar para o Aplicativo
        </button>
        
      </div>
    </body>
    </html>
  `

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    status: 200,
  })
})