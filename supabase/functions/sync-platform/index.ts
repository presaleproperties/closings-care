import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface LoftyTransaction {
  id: string
  address?: string
  city?: string
  price?: number
  commission?: number
  closeDate?: string
  listingDate?: string
  status?: string
  buyerName?: string
  sellerName?: string
  agentName?: string
  type?: string
}

async function syncLofty(supabase: any, userId: string, apiKey: string, connectionId: string) {
  const baseUrl = 'https://api.lofty.com'
  
  // Update connection status
  await supabase.from('platform_connections').update({ 
    sync_status: 'syncing', sync_error: null 
  }).eq('id', connectionId)

  // Create sync log
  const { data: syncLog } = await supabase.from('sync_logs').insert({
    user_id: userId, platform: 'lofty', sync_type: 'manual', status: 'started'
  }).select().single()

  try {
    // Fetch transactions from Lofty API
    const response = await fetch(`${baseUrl}/transactions`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
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
        
        await supabase.from('synced_transactions').upsert({
          user_id: userId,
          platform: 'lofty',
          external_id: externalId,
          transaction_type: tx.type || tx.status || 'unknown',
          client_name: tx.buyerName || tx.sellerName || tx.clientName || tx.contact_name || '',
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

    // Update connection and sync log
    await supabase.from('platform_connections').update({
      sync_status: 'success',
      last_synced_at: new Date().toISOString(),
      sync_error: null,
    }).eq('id', connectionId)

    if (syncLog) {
      await supabase.from('sync_logs').update({
        status: 'success',
        records_synced: recordsSynced,
        completed_at: new Date().toISOString(),
      }).eq('id', syncLog.id)
    }

    return { success: true, records_synced: recordsSynced }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    await supabase.from('platform_connections').update({
      sync_status: 'error',
      sync_error: errorMessage,
    }).eq('id', connectionId)

    if (syncLog) {
      await supabase.from('sync_logs').update({
        status: 'error',
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      }).eq('id', syncLog.id)
    }

    throw error
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const userId = claimsData.claims.sub

    const { platform, connection_id } = await req.json()

    if (!platform || !connection_id) {
      return new Response(JSON.stringify({ error: 'platform and connection_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get the connection and verify ownership
    const { data: connection, error: connError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('id', connection_id)
      .eq('user_id', userId)
      .single()

    if (connError || !connection) {
      return new Response(JSON.stringify({ error: 'Connection not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!connection.api_key) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let result
    switch (platform) {
      case 'lofty':
        result = await syncLofty(supabase, userId, connection.api_key, connection_id)
        break
      default:
        return new Response(JSON.stringify({ error: `Platform '${platform}' sync not yet supported` }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Sync error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to sync'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
