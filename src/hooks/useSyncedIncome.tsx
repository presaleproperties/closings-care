import { useMemo } from 'react';
import { parseISO, format, startOfMonth, endOfMonth, isWithinInterval, isBefore } from 'date-fns';

interface SyncedTransaction {
  id: string;
  close_date: string | null;
  commission_amount: number | null;
  status: string | null;
  raw_data?: any;
  property_address: string | null;
  sale_price: number | null;
  transaction_type?: string | null;
  agent_name?: string | null;
  [key: string]: any;
}

export interface SyncedPayout {
  id: string;
  close_date: string;
  grossAmount: number;
  netAmount: number; // User's actual take-home (from myNetPayout)
  status: 'closed' | 'active'; // closed = received, active = upcoming
  property_address: string | null;
  sale_price: number | null;
}

// Team agents who get the 70/30 split (user keeps 30%)
const TEAM_AGENT_NAMES = ['ravish', 'sarb'];

/**
 * Checks if a transaction is a team deal (has Ravish or Sarb as participants).
 */
function isTeamDeal(tx: SyncedTransaction): boolean {
  const participants = tx.raw_data?.participants || [];
  return participants.some((p: any) => {
    const name = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
    return TEAM_AGENT_NAMES.some(agent => name.includes(agent));
  });
}

/**
 * Extracts user's net payout from synced transaction raw_data.
 * myNetPayout already accounts for team splits and brokerage deductions.
 */
function extractNetPayout(tx: SyncedTransaction): number {
  try {
    const myNet = tx.raw_data?.myNetPayout?.amount;
    if (myNet !== null && myNet !== undefined) {
      return Number(myNet);
    }
  } catch {}
  // Fallback to commission_amount if no myNetPayout
  return Number(tx.commission_amount) || 0;
}

/**
 * Returns the appropriate commission amount for a transaction:
 * - Team deals (Ravish/Sarb): use net payout (user's 30% portion)
 * - All other deals: use gross commission
 */
function getEffectiveCommission(tx: SyncedTransaction): number {
  if (isTeamDeal(tx)) {
    return extractNetPayout(tx);
  }
  return Number(tx.commission_amount) || 0;
}

/**
 * Hook that provides income projections from synced transactions.
 * Uses gross commission for most deals, net payout for team deals (Ravish/Sarb).
 */
export function useSyncedIncome(syncedTransactions: SyncedTransaction[]) {
  // Convert synced transactions to payout-like objects
  const syncedPayouts = useMemo(() => {
    return syncedTransactions
      .filter(tx => tx.close_date)
      .map(tx => ({
        id: tx.id,
        close_date: tx.close_date!,
        grossAmount: Number(tx.commission_amount) || 0,
        netAmount: getEffectiveCommission(tx),
        status: (tx.status === 'closed' ? 'closed' : 'active') as 'closed' | 'active',
        property_address: tx.property_address,
        sale_price: Number(tx.sale_price) || 0,
      }));
  }, [syncedTransactions]);

  // Get income for a specific month (format: 'YYYY-MM')
  const getMonthIncome = useMemo(() => {
    const monthMap: Record<string, { received: number; projected: number; payouts: SyncedPayout[] }> = {};
    
    for (const p of syncedPayouts) {
      const monthStr = p.close_date.substring(0, 7); // 'YYYY-MM'
      if (!monthMap[monthStr]) {
        monthMap[monthStr] = { received: 0, projected: 0, payouts: [] };
      }
      if (p.status === 'closed') {
        monthMap[monthStr].received += p.netAmount;
      } else {
        monthMap[monthStr].projected += p.netAmount;
      }
      monthMap[monthStr].payouts.push(p);
    }
    
    return monthMap;
  }, [syncedPayouts]);

  // YTD received (closed transactions this year)
  const receivedYTD = useMemo(() => {
    const thisYear = new Date().getFullYear();
    return syncedPayouts
      .filter(p => p.status === 'closed' && p.close_date.startsWith(thisYear.toString()))
      .reduce((sum, p) => sum + p.netAmount, 0);
  }, [syncedPayouts]);

  // Total coming in (active/future transactions)
  const comingIn = useMemo(() => {
    return syncedPayouts
      .filter(p => p.status === 'active')
      .reduce((sum, p) => sum + p.netAmount, 0);
  }, [syncedPayouts]);

  // Total projected income this year (both closed + active)
  const totalThisYear = useMemo(() => {
    const thisYear = new Date().getFullYear();
    return syncedPayouts
      .filter(p => p.close_date.startsWith(thisYear.toString()))
      .reduce((sum, p) => sum + p.netAmount, 0);
  }, [syncedPayouts]);

  // 2026 projected revenue (all deals closing in 2026)
  const projectedRevenue2026 = useMemo(() => {
    return syncedPayouts
      .filter(p => p.close_date.startsWith('2026'))
      .reduce((sum, p) => sum + p.netAmount, 0);
  }, [syncedPayouts]);

  // Gross totals for comparison
  const grossComingIn = useMemo(() => {
    return syncedPayouts
      .filter(p => p.status === 'active')
      .reduce((sum, p) => sum + p.grossAmount, 0);
  }, [syncedPayouts]);

  return {
    syncedPayouts,
    getMonthIncome,
    receivedYTD,
    comingIn,
    totalThisYear,
    projectedRevenue2026,
    grossComingIn,
  };
}
