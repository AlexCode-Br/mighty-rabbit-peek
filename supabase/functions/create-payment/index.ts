import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.23.0"

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

    // Inicializa o Stripe usando a variável de ambiente segura cadastrada no painel do Supabase
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || 'sk_test_mock_keys_for_preview'
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })

    const { userId, email } = await req.json()

    // Cria uma sessão oficial de Checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'pix'],
      customer_email: email,
      client_reference_id: userId, // Passa o ID do usuário para sabermos quem pagou no webhook
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'TradeTracker Premium - Acesso Vitalício',
              description: 'Acesso completo, gráficos de performance e anotações sem limites.',
            },
            unit_amount: 1990, // R$ 19,90 em centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://ijiipeugnflpckqsujkg.supabase.co/functions/v1/payment-callback?status=success',
      cancel_url: 'https://ijiipeugnflpckqsujkg.supabase.co/functions/v1/payment-callback?status=cancel',
    })

    console.log("[create-payment] Sessão criada com sucesso:", session.id)

    return new Response(JSON.stringify({ url: session.url }), {
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