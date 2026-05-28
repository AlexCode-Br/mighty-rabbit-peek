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

    const mpAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN') || 'APP_USR-mock-access-token'
    const { userId, email } = await req.json()

    // Payload de pagamento direto via PIX oficial do Mercado Pago
    const paymentBody = {
      transaction_amount: 19.90,
      description: "TradeTracker Premium - Acesso Vitalício",
      payment_method_id: "pix",
      payer: {
        email: email,
        first_name: "Cliente",
        last_name: "TradeTracker"
      },
      external_reference: userId,
      notification_url: "https://ijiipeugnflpckqsujkg.supabase.co/functions/v1/mercadopago-webhook"
    }

    console.log("[create-payment] Criando pagamento PIX direto no Mercado Pago para o usuário:", userId)

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mpAccessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID()
      },
      body: JSON.stringify(paymentBody)
    })

    const paymentResult = await response.json()

    if (!response.ok) {
      throw new Error(paymentResult.message || "Erro ao criar pagamento via PIX")
    }

    // Extrai o código "Copia e Cola" e a imagem base64 do QR Code gerado pelo Mercado Pago
    const qrCode = paymentResult.point_of_interaction?.transaction_data?.qr_code
    const qrCodeBase64 = paymentResult.point_of_interaction?.transaction_data?.qr_code_base64
    const ticketUrl = paymentResult.point_of_interaction?.transaction_data?.ticket_url

    return new Response(JSON.stringify({ 
      qrCode, 
      qrCodeBase64, 
      ticketUrl, 
      paymentId: paymentResult.id 
    }), {
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