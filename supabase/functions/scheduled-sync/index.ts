import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // ── CRON SECRET VALIDATION ───────────────────────────────────────────────
  // Only Supabase's pg_cron job (or another trusted caller) should trigger this.
  // The cron job must pass: Authorization: Bearer <CRON_SECRET>
  const cronSecret = Deno.env.get('CRON_SECRET')
  const authHeader = req.headers.get('Authorization')
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Get all active connections
    const { data: connections, error } = await supabaseAdmin
      .from('platform_connections')
      .select('*')
      .eq('is_active', true)
      .not('api_key', 'is', null)

    if (error) throw error
    if (!connections || connections.length === 0) {
      return new Response(JSON.stringify({ message: 'No active connections to sync' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const results: any[] = []

    for (const conn of connections) {
      try {
        console.log(`[Scheduled Sync] Syncing ${conn.platform} for user ${conn.user_id}`)

        // Call the sync-platform edge function internally for each connection
        // This reuses all the existing sync logic (ReZen, Lofty, etc.)
        const syncResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/sync-platform`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({
              platform: conn.platform,
              connection_id: conn.id,
              // Pass user_id for service-role auth context
              scheduled_user_id: conn.user_id,
            }),
          }
        )

        const syncResult = await syncResponse.json()

        if (!syncResponse.ok) {
          console.error(`[Scheduled Sync] Failed for ${conn.platform} (user ${conn.user_id}):`, syncResult.error)
          results.push({ platform: conn.platform, user_id: conn.user_id, error: syncResult.error })
        } else {
          console.log(`[Scheduled Sync] Success for ${conn.platform} (user ${conn.user_id}): ${syncResult.records_synced} records`)
          results.push({ platform: conn.platform, user_id: conn.user_id, records: syncResult.records_synced })
        }
      } catch (connError) {
        const errorMsg = connError instanceof Error ? connError.message : 'Unknown error'
        console.error(`[Scheduled Sync] Error for ${conn.platform} (user ${conn.user_id}):`, errorMsg)

        await supabaseAdmin.from('platform_connections').update({
          sync_status: 'error',
          sync_error: errorMsg,
        }).eq('id', conn.id)

        results.push({ platform: conn.platform, user_id: conn.user_id, error: errorMsg })
      }
    }

    return new Response(JSON.stringify({ synced: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Scheduled sync error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})