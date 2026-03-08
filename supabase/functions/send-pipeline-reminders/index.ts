import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Determine which temperatures to process based on day of week
    // Hot: every day | Warm: only on Mondays (day 1)
    const body = await req.json().catch(() => ({}));
    const forceMode = body?.mode; // 'hot', 'warm', or 'both' for manual triggers

    const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon
    const isMonday = dayOfWeek === 1;

    const temperaturesToProcess: string[] = [];
    if (forceMode === 'hot') {
      temperaturesToProcess.push('hot');
    } else if (forceMode === 'warm') {
      temperaturesToProcess.push('warm');
    } else if (forceMode === 'both') {
      temperaturesToProcess.push('hot', 'warm');
    } else {
      temperaturesToProcess.push('hot'); // always send hot
      if (isMonday) temperaturesToProcess.push('warm'); // warm only on Mondays
    }

    // Fetch all users with notification settings configured
    const { data: usersWithSettings, error: settingsError } = await supabase
      .from('settings')
      .select('user_id, zapier_webhook_url, notification_phone')
      .not('zapier_webhook_url', 'is', null)
      .neq('zapier_webhook_url', '');

    if (settingsError) throw settingsError;
    if (!usersWithSettings || usersWithSettings.length === 0) {
      return new Response(JSON.stringify({ message: 'No users with webhook configured', sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let totalSent = 0;
    const results: any[] = [];

    for (const userSettings of usersWithSettings) {
      const { user_id, zapier_webhook_url, notification_phone } = userSettings;

      // Fetch active pipeline prospects for this user
      const { data: prospects, error: prospectsError } = await supabase
        .from('pipeline_prospects')
        .select('*')
        .eq('user_id', user_id)
        .eq('status', 'active')
        .in('temperature', temperaturesToProcess)
        .order('updated_at', { ascending: true });

      if (prospectsError || !prospects || prospects.length === 0) continue;

      const hotProspects = prospects.filter((p: any) => p.temperature === 'hot');
      const warmProspects = prospects.filter((p: any) => p.temperature === 'warm');

      // Build summary message
      const lines: string[] = [];
      if (hotProspects.length > 0) {
        lines.push(`🔥 HOT CLIENTS (${hotProspects.length}) — Follow up today:`);
        hotProspects.forEach((p: any) => {
          lines.push(`  • ${p.client_name} — ${p.home_type}${p.potential_commission > 0 ? ` ($${Number(p.potential_commission).toLocaleString()})` : ''}`);
        });
      }
      if (warmProspects.length > 0) {
        if (lines.length > 0) lines.push('');
        lines.push(`☀️ WARM CLIENTS (${warmProspects.length}) — Weekly check-in:`);
        warmProspects.forEach((p: any) => {
          lines.push(`  • ${p.client_name} — ${p.home_type}${p.potential_commission > 0 ? ` ($${Number(p.potential_commission).toLocaleString()})` : ''}`);
        });
      }

      const message = lines.join('\n');
      const today = new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });

      // Call Zapier webhook
      try {
        const webhookPayload = {
          type: 'pipeline_reminder',
          date: today,
          message,
          phone: notification_phone || '',
          hot_count: hotProspects.length,
          warm_count: warmProspects.length,
          total_count: prospects.length,
          hot_clients: hotProspects.map((p: any) => ({
            name: p.client_name,
            home_type: p.home_type,
            deal_type: p.deal_type,
            potential_commission: p.potential_commission,
            notes: p.notes,
          })),
          warm_clients: warmProspects.map((p: any) => ({
            name: p.client_name,
            home_type: p.home_type,
            deal_type: p.deal_type,
            potential_commission: p.potential_commission,
            notes: p.notes,
          })),
        };

        const response = await fetch(zapier_webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload),
        });

        results.push({ user_id, status: response.status, prospects: prospects.length });
        totalSent++;
      } catch (webhookError) {
        console.error(`Failed to call webhook for user ${user_id}:`, webhookError);
        results.push({ user_id, status: 'error', error: String(webhookError) });
      }
    }

    return new Response(JSON.stringify({ message: 'Reminders sent', sent: totalSent, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Error in send-pipeline-reminders:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
