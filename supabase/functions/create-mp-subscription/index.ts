// @ts-nocheck
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
    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!MP_ACCESS_TOKEN) throw new Error("Falta MP_ACCESS_TOKEN en las variables de entorno.");
    
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { userId, email, planType, roleType, referralCode, backUrl } = await req.json();

    // DEFINICIÓN DE PRECIOS (ARS)
    // Atleta PRO: ~9.99 USD -> 9.900 ARS
    // Coach Hub: ~29.99 USD -> 29.900 ARS
    
    let basePrice = 0;
    if (roleType === 'coach') {
        basePrice = planType === 'yearly' ? 269000 : 29900; // Anual tiene ~25% OFF
    } else {
        basePrice = planType === 'yearly' ? 89000 : 9900;
    }

    let finalPrice = basePrice;
    let discountApplied = false;

    // VALIDAR CÓDIGO DE COACH PARA DESCUENTO ADICIONAL
    if (referralCode) {
      const { data: coach } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('referral_code', referralCode.toUpperCase())
        .eq('is_coach', true)
        .maybeSingle();

      if (coach) {
        finalPrice = Math.round(basePrice * 0.9); // 10% OFF extra por referido
        discountApplied = true;
      }
    }

    const planName = roleType === 'coach' ? 'COACH HUB' : 'ATLETA PRO';
    const recurrence = planType === 'yearly' ? 'Anual' : 'Mensual';
    const title = `Heavy Duty ${planName} ${discountApplied ? '(Promo Team)' : ''} - ${recurrence}`;

    const body = {
      reason: title,
      external_reference: userId,
      payer_email: email,
      auto_recurring: {
        frequency: planType === 'yearly' ? 12 : 1,
        frequency_type: "months",
        transaction_amount: finalPrice,
        currency_id: "ARS" 
      },
      back_url: backUrl,
      status: "pending"
    };

    const response = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error en la comunicación con Mercado Pago");

    return new Response(JSON.stringify({ url: data.init_point }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
})