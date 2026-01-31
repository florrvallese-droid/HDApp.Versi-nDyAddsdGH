// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  let event;

  try {
    if (!signature || !webhookSecret) {
        throw new Error("Missing signature or secret");
    }

    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(err.message, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        
        if (userId) {
            // Grant Premium
            await supabase.from('profiles').update({
                is_premium: true,
                trial_started_at: new Date().toISOString(), // Or handle logic if it's strictly a trial start
                // We might want to store stripe_customer_id too if we added that column
            }).eq('user_id', userId);
            
            console.log(`Premium granted to user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        // We need to find the user by customer ID if we stored it, or use metadata if attached to sub
        // For this simple MVP, we might rely on client-side logic or metadata if passed down
        // Assuming metadata propagates:
        // const userId = subscription.metadata.userId; 
        
        // If we don't have direct mapping, we might need to query profiles by some stripe_id column
        // For now, let's log. In a real app, ensure `stripe_customer_id` is on the profile table.
        console.log(`Subscription deleted: ${subscription.id}`);
        break;
      }
      
      // Handle invoice.payment_succeeded to extend expiry, etc.
    }
  } catch (error: any) {
      console.error("Error processing webhook:", error);
      return new Response("Error processing event", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});