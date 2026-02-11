import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// ─── ReZen (Real Broker) helpers ──────────────────────────────────────────────

const REZEN_ARRAKIS = 'https://arrakis.therealbrokerage.com/api/v1'
const REZEN_YENTA   = 'https://yenta.therealbrokerage.com/api/v1'

async function rezenFetch(url: string, apiKey: string) {
  const res = await fetch(url, {
    headers: { 'X-API-KEY': apiKey, 'Accept': 'application/json' },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`ReZen API [${res.status}]: ${text.slice(0, 300)}`)
  }
  return res.json()
}

async function syncRealBroker(supabase: any, userId: string, apiKey: string, connectionId: string) {
  // Update status
  await supabase.from('platform_connections').update({
    sync_status: 'syncing', sync_error: null,
  }).eq('id', connectionId)

  const { data: syncLog } = await supabase.from('sync_logs').insert({
    user_id: userId, platform: 'real_broker', sync_type: 'manual', status: 'started',
  }).select().single()

  try {
    // 1. Get current user's yenta ID
    const me = await rezenFetch(`${REZEN_YENTA}/users/me`, apiKey)
    const yentaId = me.id || me.agentId
    if (!yentaId) throw new Error('Could not determine your ReZen agent ID')

    let recordsSynced = 0

    // 2. Sync transactions
    try {
      const txData = await rezenFetch(
        `${REZEN_ARRAKIS}/transactions/participant/${yentaId}/current`,
        apiKey,
      )
      const transactions = txData?.data || txData?.results || (Array.isArray(txData) ? txData : [])

      for (const tx of transactions) {
        const externalId = String(tx.id || tx.transactionId || tx.code || '')
        if (!externalId) continue

        const address = tx.address || {}
        const streetParts = [address.street, address.street2].filter(Boolean).join(', ')
        const fullAddress = [streetParts, address.city, address.state, address.zip].filter(Boolean).join(', ')

        // Determine commission
        let commission: number | null = null
        if (tx.grossCommission?.amount) commission = tx.grossCommission.amount / 100
        else if (tx.totalGci) commission = tx.totalGci / 100
        else if (tx.commission) commission = typeof tx.commission === 'number' ? tx.commission : null

        // Determine sale price
        let salePrice: number | null = null
        if (tx.price?.amount) salePrice = tx.price.amount / 100
        else if (tx.salePrice) salePrice = tx.salePrice
        else if (tx.purchasePrice) salePrice = tx.purchasePrice

        // Determine status
        const rawStatus = String(tx.status || tx.lifecycleState || '').toLowerCase()
        let status = rawStatus
        if (rawStatus.includes('closed') || tx.closedAt) status = 'closed'
        else if (rawStatus.includes('terminat')) status = 'terminated'
        else if (rawStatus.includes('active') || rawStatus.includes('approved')) status = 'active'

        // Determine close date
        const closeDate = tx.closedAt || tx.rezenClosedAt || tx.closingDateActual || tx.closingDateEstimated || tx.closingDate || null

        // Determine listing date
        const listingDate = tx.listingDate || tx.contractAcceptanceDate || null

        // Get client/buyer names from participants if available
        let clientName = ''
        if (tx.participants && Array.isArray(tx.participants)) {
          const buyers = tx.participants.filter((p: any) => p.role === 'BUYER' || p.role === 'SELLER')
          clientName = buyers.map((p: any) => `${p.firstName || ''} ${p.lastName || ''}`.trim()).join(', ')
        }
        if (!clientName) clientName = tx.representedParty || tx.clientName || ''

        await supabase.from('synced_transactions').upsert({
          user_id: userId,
          platform: 'real_broker',
          external_id: externalId,
          transaction_type: tx.transactionType || tx.dealType || tx.type || 'unknown',
          client_name: clientName,
          property_address: fullAddress || '',
          city: address.city || '',
          sale_price: salePrice,
          commission_amount: commission,
          close_date: closeDate,
          listing_date: listingDate,
          status,
          agent_name: me.firstName ? `${me.firstName} ${me.lastName || ''}`.trim() : '',
          raw_data: tx,
          synced_at: new Date().toISOString(),
        }, { onConflict: 'user_id,platform,external_id' })

        recordsSynced++
      }
    } catch (txErr) {
      console.warn('Transaction sync partial error:', txErr)
    }

    // 3. Sync revenue share payments
    try {
      const rsData = await rezenFetch(
        `${REZEN_ARRAKIS}/revshares/${yentaId}/payments?pageSize=100`,
        apiKey,
      )
      const payments = rsData?.data || rsData?.results || rsData?.content || (Array.isArray(rsData) ? rsData : [])

      for (const payment of payments) {
        const paymentId = String(payment.id || payment.outgoingPaymentId || '')
        if (!paymentId) continue

        // Extract period from payment date
        const paidAt = payment.paidAt || payment.createdAt || payment.paymentDate || ''
        let period = ''
        if (paidAt) {
          const d = new Date(typeof paidAt === 'number' ? (paidAt > 1e12 ? paidAt : paidAt * 1000) : paidAt)
          if (!isNaN(d.getTime())) period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        }

        const amount = payment.amount?.amount
          ? payment.amount.amount / 100
          : (typeof payment.amount === 'number' ? payment.amount : 0)

        await supabase.from('revenue_share').upsert({
          user_id: userId,
          platform: 'real_broker',
          agent_name: payment.agentName || payment.contributorName || `${me.firstName || ''} ${me.lastName || ''}`.trim(),
          tier: payment.tier || 1,
          amount,
          period: period || 'unknown',
          cap_contribution: payment.capContribution || null,
          status: payment.status || 'paid',
          notes: `ReZen Payment ID: ${paymentId}`,
          raw_data: payment,
        }, { onConflict: 'user_id,platform,agent_name,period' })

        recordsSynced++
      }
    } catch (rsErr) {
      console.warn('Revenue share sync partial error:', rsErr)
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
      sync_status: 'error', sync_error: errorMessage,
    }).eq('id', connectionId)

    if (syncLog) {
      await supabase.from('sync_logs').update({
        status: 'error', error_message: errorMessage, completed_at: new Date().toISOString(),
      }).eq('id', syncLog.id)
    }

    throw error
  }
}

// ─── Lofty helpers ────────────────────────────────────────────────────────────

async function syncLofty(supabase: any, userId: string, apiKey: string, connectionId: string) {
  const baseUrl = 'https://api.lofty.com'

  await supabase.from('platform_connections').update({
    sync_status: 'syncing', sync_error: null,
  }).eq('id', connectionId)

  const { data: syncLog } = await supabase.from('sync_logs').insert({
    user_id: userId, platform: 'lofty', sync_type: 'manual', status: 'started',
  }).select().single()

  try {
    const response = await fetch(`${baseUrl}/transactions`, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
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

    await supabase.from('platform_connections').update({
      sync_status: 'success', last_synced_at: new Date().toISOString(), sync_error: null,
    }).eq('id', connectionId)

    if (syncLog) {
      await supabase.from('sync_logs').update({
        status: 'success', records_synced: recordsSynced, completed_at: new Date().toISOString(),
      }).eq('id', syncLog.id)
    }

    return { success: true, records_synced: recordsSynced }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await supabase.from('platform_connections').update({
      sync_status: 'error', sync_error: errorMessage,
    }).eq('id', connectionId)

    if (syncLog) {
      await supabase.from('sync_logs').update({
        status: 'error', error_message: errorMessage, completed_at: new Date().toISOString(),
      }).eq('id', syncLog.id)
    }
    throw error
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = user.id
    const { platform, connection_id } = await req.json()

    if (!platform || !connection_id) {
      return new Response(JSON.stringify({ error: 'platform and connection_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get connection and verify ownership
    const { data: connection, error: connError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('id', connection_id)
      .eq('user_id', userId)
      .single()

    if (connError || !connection) {
      return new Response(JSON.stringify({ error: 'Connection not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!connection.api_key) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let result
    switch (platform) {
      case 'lofty':
        result = await syncLofty(supabase, userId, connection.api_key, connection_id)
        break
      case 'real_broker':
        result = await syncRealBroker(supabase, userId, connection.api_key, connection_id)
        break
      default:
        return new Response(JSON.stringify({ error: `Platform '${platform}' sync not yet supported` }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Sync error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to sync'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
