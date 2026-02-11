import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Use service role for scheduled tasks
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Get all active connections that need syncing
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
        // Create a user-scoped client for RLS
        // For scheduled sync, we use service role but still track user_id
        const syncLog = await supabaseAdmin.from('sync_logs').insert({
          user_id: conn.user_id,
          platform: conn.platform,
          sync_type: 'scheduled',
          status: 'started',
        }).select().single()

        if (conn.platform === 'lofty' && conn.api_key) {
          await supabaseAdmin.from('platform_connections').update({
            sync_status: 'syncing', sync_error: null
          }).eq('id', conn.id)

          const response = await fetch('https://api.lofty.com/transactions', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${conn.api_key}`,
            },
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Lofty API error [${response.status}]: ${errorText}`)
          }

          const data = await response.json()
          const transactions = data.data || data.results || data || []
          let recordsSynced = 0

          if (Array.isArray(transactions)) {
            for (const tx of transactions) {
              const externalId = tx.id || tx._id || String(tx.transactionId)
              await supabaseAdmin.from('synced_transactions').upsert({
                user_id: conn.user_id,
                platform: 'lofty',
                external_id: externalId,
                transaction_type: tx.type || tx.status || 'unknown',
                client_name: tx.buyerName || tx.sellerName || tx.clientName || '',
                property_address: tx.address || tx.propertyAddress || '',
                city: tx.city || '',
                sale_price: tx.price || tx.salePrice || null,
                commission_amount: tx.commission || tx.commissionAmount || null,
                close_date: tx.closeDate || tx.closingDate || null,
                listing_date: tx.listingDate || null,
                status: tx.status || '',
                agent_name: tx.agentName || tx.agent || '',
                raw_data: tx,
                synced_at: new Date().toISOString(),
              }, { onConflict: 'user_id,platform,external_id' })
              recordsSynced++
            }
          }

          await supabaseAdmin.from('platform_connections').update({
            sync_status: 'success',
            last_synced_at: new Date().toISOString(),
            sync_error: null,
          }).eq('id', conn.id)

          if (syncLog.data) {
            await supabaseAdmin.from('sync_logs').update({
              status: 'success',
              records_synced: recordsSynced,
              completed_at: new Date().toISOString(),
            }).eq('id', syncLog.data.id)
          }

          results.push({ platform: conn.platform, user_id: conn.user_id, records: recordsSynced })
        }
      } catch (connError) {
        const errorMsg = connError instanceof Error ? connError.message : 'Unknown error'
        console.error(`Sync error for ${conn.platform} (user ${conn.user_id}):`, errorMsg)

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
