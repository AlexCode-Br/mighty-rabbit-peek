import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401, headers: corsHeaders })
    }

    // Acessa o Token de Produção ou Sandbox do Mercado Pago
    const mpAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN') || 'APP_USR-mock-access-token'
    const { userId, email } = await req.json()

    // Monta o payload de Preferência oficial do Mercado Pago
    const preferenceBody = {
      items: [
        {
          title: "TradeTracker Premium - Acesso Vitalício",
          description: "Acesso completo, gráficos de performance e anotações sem limites.",
          quantity: 1,
          currency_id: "BRL",
          unit_price: 19.90
        }
      ],
      payer: {
        email: email
      },
      back_urls: {
        success: "https://ijiipeugnflpckqsujkg.supabase.co/functions/v1/payment-callback?status=success",
        failure: "https://ijiipeugnflpckqsujkg.supabase.co/functions/v1/payment-callback?status=failure",
        pending: "https://ijiipeugnflpckqsujkg.supabase.co/functions/v1/payment-callback?status=pending"
      },
      auto_return: "approved",
      external_reference: userId, // Mantém o ID do usuário de forma segura
      notification_url: "https://ijiipeugnflpckqsujkg.supabase.co/functions/v1/mercadopago-webhook"
    }

    console.log("[create-payment] Criando preferência no Mercado Pago para o usuário:", userId)

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mpAccessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(preferenceBody)
    })

    const preference = await response.json()

    if (!response.ok) {
      throw new Error(preference.message || "Erro ao criar preferência de pagamento")
    }

    // init_point é o link oficial de checkout do Mercado Pago
    const checkoutUrl = preference.init_point

    return new Response(JSON.stringify({ url: checkoutUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error("[create-payment] Erro:", err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})