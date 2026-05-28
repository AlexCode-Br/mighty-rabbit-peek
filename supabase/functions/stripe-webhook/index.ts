import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.23.0"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || 'sk_test_mock_keys_for_preview'
  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })
  const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  try {
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    
    let event;

    if (endpointSecret && signature) {
      event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret)
    } else {
      event = JSON.parse(body)
    }

    console.log("[stripe-webhook] Evento recebido:", event.type)

    // Evento de pagamento concluído com sucesso
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const userId = session.client_reference_id

      if (userId) {
        // Inicializa o Supabase com privilégios de administrador (service_role)
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Atualiza a tabela blindada de forma ultra-segura
        const { error } = await supabase
          .from('user_payments')
          .upsert({ user_id: userId, is_paid: true, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })

        if (error) throw error
        console.log(`[stripe-webhook] Usuário ${userId} atualizado com sucesso para status Pago!`)
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error("[stripe-webhook] Erro no processamento:", err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})