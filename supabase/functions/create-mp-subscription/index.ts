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
    if (!MP_ACCESS_TOKEN) throw new Error("Falta MP_ACCESS_TOKEN en las variables de entorno de Supabase.");

    const { userId, email, planType, backUrl } = await req.json();

    // PRECIOS ARGENTINA (Ejemplo: $9.900/mes o $89.000/año)
    // Estos valores deben ser analizados según tus costos operativos de IA.
    const price = planType === 'yearly' ? 89000 : 9900; 
    const title = planType === 'yearly' ? "Heavy Duty PRO - Plan Anual" : "Heavy Duty PRO - Plan Mensual";

    // Mercado Pago Pre-Approval (Suscripciones)
    const body = {
      reason: title,
      external_reference: userId,
      payer_email: email,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: price,
        currency_id: "ARS" 
      },
      back_url: backUrl,
      status: "pending"
    };
    
    if (planType === 'yearly') {
        body.auto_recurring.frequency = 12; // Cobro cada 12 meses
    }

    console.log(`[create-mp-subscription] Generando suscripción ${planType} para ${email}`);

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
      console.error("[create-mp-subscription] Error MP:", data);
      throw new Error(data.message || "Error al conectar con Mercado Pago");
    }

    return new Response(
      JSON.stringify({ url: data.init_point }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )

  } catch (error: any) {
    console.error("[create-mp-subscription] Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      },
    )
  }
})