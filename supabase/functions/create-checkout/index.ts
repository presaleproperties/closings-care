import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header to identify the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client with the user's token
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the user from the session
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer already exists in Stripe
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId: string;
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
      
      // Check if they already have an active subscription
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });
      
      if (subscriptions.data.length > 0) {
        throw new Error("You already have an active subscription");
      }
    } else {
      // Create a new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    // Get the price for Pro subscription
    // First try lookup key, then search by product name patterns
    const prices = await stripe.prices.list({
      lookup_keys: ['dealzflow_pro'],
      limit: 1,
    });

    let priceId: string;
    if (prices.data.length > 0) {
      priceId = prices.data[0].id;
      console.log("Found price via lookup key:", priceId);
    } else {
      // Search by product name (multiple patterns)
      const products = await stripe.products.list({
        limit: 50,
        active: true,
      });
      
      // Search for various product name patterns
      const proProduct = products.data.find((p: { name: string }) => 
        p.name === 'Dealzflow Pro' || 
        p.name === 'Commission Tracker Pro' ||
        p.name.toLowerCase().includes('pro') && p.name.toLowerCase().includes('deal')
      );
      
      if (!proProduct) {
        console.error("Available products:", products.data.map((p: { name: string }) => p.name));
        throw new Error("Pro subscription product not found. Please contact support.");
      }
      
      console.log("Found product:", proProduct.name, proProduct.id);
      
      const productPrices = await stripe.prices.list({
        product: proProduct.id,
        active: true,
        type: 'recurring',
        limit: 1,
      });
      
      if (productPrices.data.length === 0) {
        throw new Error("Pro subscription price not found. Please contact support.");
      }
      
      priceId = productPrices.data[0].id;
      console.log("Using price:", priceId);
    }

    // Parse the request body for return URL
    const { returnUrl } = await req.json();
    const baseUrl = returnUrl || Deno.env.get("SITE_URL") || "https://svbilqvudkkdhslxebce.lovableproject.com";

    // Create Checkout Session with 14-day trial
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/settings?subscription=success`,
      cancel_url: `${baseUrl}/settings?subscription=cancelled`,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          supabase_user_id: user.id,
        },
      },
      metadata: {
        supabase_user_id: user.id,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);
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
