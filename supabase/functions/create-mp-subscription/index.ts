// @ts-nocheck
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
    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN');
    if (!MP_ACCESS_TOKEN) throw new Error("Falta MP_ACCESS_TOKEN");

    const { userId, email, planType, backUrl } = await req.json();

    // Configuración de Precios (Ajustar según necesidad)
    // Asumiendo moneda local de la cuenta MP. Si es ARS, ajustar valor.
    // Ejemplo: 10 USD ~ 10000 ARS (solo ejemplo)
    const price = planType === 'yearly' ? 89.99 : 9.99; 
    const frequency = planType === 'yearly' ? 12 : 1;
    const title = planType === 'yearly' ? "Heavy Duty PRO - Anual" : "Heavy Duty PRO - Mensual";

    const body = {
      reason: title,
      external_reference: userId, // CLAVE: Vinculamos el pago al usuario aquí
      payer_email: email,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months", // MP maneja meses. Si es anual, frequency 12 months.
        transaction_amount: price,
        currency_id: "ARS" // CAMBIAR A TU MONEDA LOCAL (ARS, MXN, USD, etc)
      },
      back_url: backUrl,
      status: "pending"
    };
    
    // Ajuste para plan anual (1 cobro cada 12 meses)
    if (planType === 'yearly') {
        body.auto_recurring.frequency = 12;
    }

    const response = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("MP Error:", data);
      throw new Error(data.message || "Error creando suscripción en MP");
    }

    return new Response(
      JSON.stringify({ url: data.init_point }), // init_point es el link de pago
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )

  } catch (error: any) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})