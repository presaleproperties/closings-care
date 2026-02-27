import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("No authorization header");
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) throw new Error("User not authenticated");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify caller is admin
    const { data: adminRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminRole) throw new Error("Unauthorized: Admin access required");

    const { action, targetUserId, name, email } = await req.json();

    if (!targetUserId) throw new Error("targetUserId is required");
    if (targetUserId === user.id) throw new Error("Cannot modify your own account via admin panel");

    if (action === "delete") {
      // Delete all user data in dependency order
      await supabaseAdmin.from("payouts").delete().eq("user_id", targetUserId);
      await supabaseAdmin.from("deals").delete().eq("user_id", targetUserId);
      await supabaseAdmin.from("expenses").delete().eq("user_id", targetUserId);
      await supabaseAdmin.from("revenue_share").delete().eq("user_id", targetUserId);
      await supabaseAdmin.from("synced_transactions").delete().eq("user_id", targetUserId);
      await supabaseAdmin.from("platform_connections").delete().eq("user_id", targetUserId);
      await supabaseAdmin.from("pipeline_prospects").delete().eq("user_id", targetUserId);
      await supabaseAdmin.from("properties").delete().eq("user_id", targetUserId);
      await supabaseAdmin.from("other_income").delete().eq("user_id", targetUserId);
      await supabaseAdmin.from("settings").delete().eq("user_id", targetUserId);
      await supabaseAdmin.from("profiles").delete().eq("user_id", targetUserId);
      await supabaseAdmin.from("user_roles").delete().eq("user_id", targetUserId);
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
      if (deleteError) throw new Error(`Failed to delete auth user: ${deleteError.message}`);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "reset_password") {
      // Get the user's email first
      const { data: authUserData } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
      if (!authUserData?.user?.email) throw new Error("Could not find user email");
      const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
        authUserData.user.email,
        { redirectTo: `${req.headers.get("origin") || "https://commissioniq.lovable.app"}/reset-password` }
      );
      if (resetError) throw new Error(`Failed to send reset email: ${resetError.message}`);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "edit") {
      if (!name && !email) throw new Error("name or email is required for edit");

      if (name) {
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({ full_name: name.trim() })
          .eq("user_id", targetUserId);
        if (profileError) throw new Error(`Failed to update profile: ${profileError.message}`);
      }

      if (email) {
        const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, { email: email.trim() });
        if (emailError) throw new Error(`Failed to update email: ${emailError.message}`);
      }

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
