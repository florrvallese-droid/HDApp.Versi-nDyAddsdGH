// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

serve(async (req) => {
  try {
    const url = new URL(req.url);
    // MP envía topic/id en query params o body dependiendo de la versión
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");
    const id = url.searchParams.get("id") || url.searchParams.get("data.id");

    if (!topic || !id) {
        // A veces viene en el body
        const body = await req.json().catch(() => ({}));
        if (body.type === 'subscription_preapproval') {
            return await checkSubscription(body.data.id);
        }
        return new Response("OK", { status: 200 });
    }

    if (topic === 'preapproval' || topic === 'subscription_preapproval') {
        return await checkSubscription(id);
    }

    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("Webhook Error:", error);
    return new Response("Error", { status: 500 });
  }
});

async function checkSubscription(preapprovalId: string) {
    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // 1. Consultar estado real a Mercado Pago
    const res = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
        headers: { "Authorization": `Bearer ${MP_ACCESS_TOKEN}` }
    });
    
    const subscription = await res.json();
    
    if (subscription.status === 'authorized') {
        const userId = subscription.external_reference;
        
        if (userId) {
            console.log(`Activando Premium para usuario ${userId}`);
            
            // Calcular fecha de expiración (hoy + 1 mes o año + margen)
            const nextPayment = subscription.next_payment_date 
                ? new Date(subscription.next_payment_date) 
                : new Date(new Date().setMonth(new Date().getMonth() + 1));

            await supabase.from('profiles').update({
                is_premium: true,
                premium_expires_at: nextPayment.toISOString(),
                // Opcional: Guardar ID de suscripción para cancelaciones futuras
                // settings: { mp_subscription_id: preapprovalId } 
            }).eq('user_id', userId);
        }
    } else if (subscription.status === 'cancelled') {
         const userId = subscription.external_reference;
         if (userId) {
             console.log(`Cancelando Premium para usuario ${userId}`);
             await supabase.from('profiles').update({
                is_premium: false
            }).eq('user_id', userId);
         }
    }

    return new Response("Updated", { status: 200 });
}