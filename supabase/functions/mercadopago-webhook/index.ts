import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    console.log("[mercadopago-webhook] Notificação recebida:", JSON.stringify(body))

    const mpAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN') || 'APP_USR-mock-access-token'

    // O Mercado Pago envia notificações de diferentes formas dependendo da API
    const resourceId = body.data?.id || body.resource?.id || (body.resource ? body.resource.split('/').pop() : null)
    const topic = body.type || body.topic

    // Apenas processa se for um tópico de pagamento ("payment")
    if ((topic === "payment" || body.action === "payment.created" || body.action === "payment.updated") && resourceId) {
      console.log(`[mercadopago-webhook] Consultando detalhes do pagamento ${resourceId} no Mercado Pago...`)

      // Consulta de forma 100% segura diretamente na API do Mercado Pago para evitar fraudes (spoofing)
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${resourceId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${mpAccessToken}`
        }
      })

      const paymentData = await response.json()

      if (!response.ok) {
        throw new Error(paymentData.message || "Erro ao consultar dados de pagamento")
      }

      console.log(`[mercadopago-webhook] Status retornado pelo MP: ${paymentData.status}`)

      // Se o pagamento for realmente aprovado, atualiza o status de pagamento do usuário
      if (paymentData.status === "approved") {
        const userId = paymentData.external_reference

        if (userId) {
          const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
          const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
          const supabase = createClient(supabaseUrl, supabaseServiceKey)

          // Atualiza a tabela blindada
          const { error } = await supabase
            .from('user_payments')
            .upsert({ 
              user_id: userId, 
              is_paid: true, 
              updated_at: new Date().toISOString() 
            }, { onConflict: 'user_id' })

          if (error) throw error
          console.log(`[mercadopago-webhook] Usuário ${userId} liberado com sucesso!`)
        } else {
          console.warn("[mercadopago-webhook] Pagamento aprovado mas sem external_reference associado")
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error("[mercadopago-webhook] Erro no processamento:", err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})