import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    // Verify webhook signature to prevent forged events
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    let event: Stripe.Event;
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    } else if (!webhookSecret) {
      // Fallback: no webhook secret configured yet — log warning
      console.warn("STRIPE_WEBHOOK_SECRET not configured — processing without signature verification");
      event = JSON.parse(body);
    } else {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("Received Stripe webhook event:", event.type);

    // Handle subscription events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        
        if (userId && session.subscription) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          // Update user's subscription tier to pro
          const { error } = await supabaseAdmin
            .from("settings")
            .update({
              subscription_tier: "pro",
              subscription_started_at: new Date().toISOString(),
              subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("user_id", userId);

          if (error) {
            console.error("Error updating subscription:", error);
          } else {
            console.log(`User ${userId} upgraded to Pro`);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;
        
        if (userId) {
          const isActive = subscription.status === "active" || subscription.status === "trialing";
          
          const { error } = await supabaseAdmin
            .from("settings")
            .update({
              subscription_tier: isActive ? "pro" : "free",
              subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("user_id", userId);

          if (error) {
            console.error("Error updating subscription:", error);
          } else {
            console.log(`User ${userId} subscription updated to ${isActive ? 'pro' : 'free'}`);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;
        
        if (userId) {
          const { error } = await supabaseAdmin
            .from("settings")
            .update({
              subscription_tier: "free",
              subscription_ends_at: null,
            })
            .eq("user_id", userId);

          if (error) {
            console.error("Error canceling subscription:", error);
          } else {
            console.log(`User ${userId} subscription cancelled`);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Payment failed for invoice:", invoice.id);
        // You could send an email notification here
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
