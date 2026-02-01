// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de pre-flight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // MP envía los datos en el body para notificaciones V2
    const body = await req.json().catch(() => ({}));
    console.log("[mp-webhook] Notificación recibida:", body);

    // El tipo de evento para suscripciones es 'subscription_preapproval'
    const preapprovalId = body.data?.id || url.searchParams.get("id");
    const topic = body.type || url.searchParams.get("topic");

    if (topic === 'subscription_preapproval' && preapprovalId) {
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        // 1. Consultar el estado real de la suscripción a Mercado Pago
        const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
            headers: { "Authorization": `Bearer ${MP_ACCESS_TOKEN}` }
        });
        
        const subscription = await mpRes.json();
        console.log("[mp-webhook] Estado de suscripción:", subscription.status);
        
        if (subscription.status === 'authorized') {
            const userId = subscription.external_reference; // Aquí guardamos el ID del usuario
            
            if (userId) {
                console.log(`[mp-webhook] Activando PRO para usuario: ${userId}`);
                
                // Calculamos fecha de expiración (por seguridad, le damos un margen de 3 días extra)
                const nextPayment = subscription.next_payment_date 
                    ? new Date(subscription.next_payment_date) 
                    : new Date(new Date().setMonth(new Date().getMonth() + 1));
                
                nextPayment.setDate(nextPayment.getDate() + 3);

                await supabase.from('profiles').update({
                    is_premium: true,
                    premium_expires_at: nextPayment.toISOString(),
                }).eq('user_id', userId);
            }
        } else if (subscription.status === 'cancelled' || subscription.status === 'unpaid') {
             const userId = subscription.external_reference;
             if (userId) {
                 console.log(`[mp-webhook] Revocando PRO para usuario: ${userId}`);
                 await supabase.from('profiles').update({ is_premium: false }).eq('user_id', userId);
             }
        }
    }

    return new Response(JSON.stringify({ received: true }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error("[mp-webhook] Error crítico:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});