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

    if (!MP_ACCESS_TOKEN) throw new Error("Falta MP_ACCESS_TOKEN.");
    
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { userId, email, planType, referralCode, backUrl } = await req.json();

    // PRECIOS BASE
    let price = planType === 'yearly' ? 89000 : 9900; 
    let discountApplied = false;

    // VALIDAR CÓDIGO DE COACH
    if (referralCode) {
      const { data: coach } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('referral_code', referralCode)
        .eq('is_coach', true)
        .maybeSingle();

      if (coach) {
        // APLICAR 20% DE DESCUENTO
        price = Math.round(price * 0.8);
        discountApplied = true;
        console.log(`[create-mp-subscription] Descuento del coach ${coach.user_id} aplicado.`);
      }
    }

    const title = `Heavy Duty PRO ${discountApplied ? '(Desc. Coach)' : ''} - ${planType === 'yearly' ? 'Anual' : 'Mensual'}`;

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
    if (!response.ok) throw new Error(data.message || "Error MP");

    return new Response(JSON.stringify({ url: data.init_point }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
})