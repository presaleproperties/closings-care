import { useMemo } from 'react';

import { getEffectiveCommission } from '@/lib/transactionUtils';

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
  city?: string | null;
  client_name?: string | null;
  [key: string]: any;
}

export interface SyncedPayoutItem {
  id: string;
  close_date: string | null;
  grossAmount: number;
  netAmount: number;
  status: 'closed' | 'active' | 'flagged'; // flagged = past-due active
  property_address: string | null;
  sale_price: number;
  city: string | null;
  client_name: string | null;
  agent_name: string | null;
  payoutType: 'Advance' | 'Completion' | 'Commission'; // Advance = Part 1/2, Completion = Part 2/2, Commission = resale/other
  isPresale: boolean;
  projectName: string | null; // extracted from property address
  firmDate: string | null;
  rawTransaction: SyncedTransaction;
}

// Local helper wrapping the shared utility with the SyncedTransaction shape
function getEffectiveCommissionForTx(tx: SyncedTransaction): number {
  return getEffectiveCommission(tx.raw_data, Number(tx.commission_amount) || 0);
}

/**
 * Determines if a transaction is a presale part and which type.
 * Convention: "Part 1/2" = Advance, "Part 2/2" = Completion
 */
function detectPayoutType(address: string | null, rawData?: any): { payoutType: 'Advance' | 'Completion' | 'Commission'; isPresale: boolean } {
  if (!address) {
    // Even without address, check for project name in raw data
    const hasProjectName = !!(rawData?.projectName);
    return { payoutType: hasProjectName ? 'Commission' : 'Commission', isPresale: hasProjectName };
  }
  
  const lowerAddr = address.toLowerCase();
  if (lowerAddr.includes('part 1/2') || lowerAddr.includes('1/2 -')) {
    return { payoutType: 'Advance', isPresale: true };
  }
  if (lowerAddr.includes('part 2/2') || lowerAddr.includes('2/2 -')) {
    return { payoutType: 'Completion', isPresale: true };
  }
  
  // Check for project name in raw data
  const hasProjectName = !!(rawData?.projectName);
  return { payoutType: 'Commission', isPresale: hasProjectName };
}

/**
 * Extracts a project name from the property address (text before "Part" or the unit info).
 */
function extractProjectName(address: string | null): string | null {
  if (!address) return null;
  // Try to extract name before "Part 1/2" or "Part 2/2"
  const partMatch = address.match(/^(.+?)(?:\s*Part\s*\d\/\d)/i);
  if (partMatch) return partMatch[1].trim();
  
  // Try to extract before " - " for presale-like addresses
  const dashMatch = address.match(/^(.+?)\s*-\s/);
  if (dashMatch && dashMatch[1].length < 50) return dashMatch[1].trim();
  
  return null;
}

/**
 * Hook that converts synced transactions into payout-like objects for the Payouts page.
 * - Labels Part 1/2 as Advance, Part 2/2 as Completion
 * - Flags past-due active deals
 * - Status follows sync (closed = paid, active = pending)
 */
export function useSyncedPayouts(syncedTransactions: SyncedTransaction[]) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const payoutItems = useMemo(() => {
    return syncedTransactions
      .filter(tx => tx.close_date) // must have a close date
      .map((tx): SyncedPayoutItem => {
        const { payoutType, isPresale } = detectPayoutType(tx.property_address, tx.raw_data);
        const effectiveAmount = getEffectiveCommissionForTx(tx);
        const grossAmount = Number(tx.commission_amount) || 0;
        
        // Determine status: if active but close_date is past, flag for review
        let status: 'closed' | 'active' | 'flagged' = tx.status === 'closed' ? 'closed' : 'active';
        if (status === 'active' && tx.close_date && tx.close_date < today) {
          status = 'flagged';
        }

        return {
          id: tx.id,
          close_date: tx.close_date,
          grossAmount,
          netAmount: effectiveAmount,
          status,
          property_address: tx.property_address,
          sale_price: Number(tx.sale_price) || 0,
          city: tx.city || null,
          client_name: tx.client_name || null,
          agent_name: tx.agent_name || null,
          payoutType,
          isPresale,
          projectName: extractProjectName(tx.property_address),
          firmDate: tx.raw_data?.firmDate || null,
          rawTransaction: tx,
        };
      })
      .sort((a, b) => {
        // Sort: flagged first, then active by close_date, then closed
        if (a.status === 'flagged' && b.status !== 'flagged') return -1;
        if (a.status !== 'flagged' && b.status === 'flagged') return 1;
        if (a.status === 'closed' && b.status !== 'closed') return 1;
        if (a.status !== 'closed' && b.status === 'closed') return -1;
        // Within same status, sort by close_date ascending
        if (a.close_date && b.close_date) return a.close_date.localeCompare(b.close_date);
        return 0;
      });
  }, [syncedTransactions, today]);

  // Stats
  const stats = useMemo(() => {
    const pending = payoutItems.filter(p => p.status === 'active');
    const flagged = payoutItems.filter(p => p.status === 'flagged');
    const received = payoutItems.filter(p => p.status === 'closed');
    
    // This month
    const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    const dueThisMonth = payoutItems.filter(p => 
      p.status !== 'closed' && p.close_date?.startsWith(thisMonth)
    );

    return {
      all: { count: payoutItems.length, total: payoutItems.reduce((s, p) => s + p.netAmount, 0) },
      pending: { count: pending.length, total: pending.reduce((s, p) => s + p.netAmount, 0) },
      flagged: { count: flagged.length, total: flagged.reduce((s, p) => s + p.netAmount, 0) },
      received: { count: received.length, total: received.reduce((s, p) => s + p.netAmount, 0) },
      dueThisMonth: { count: dueThisMonth.length, total: dueThisMonth.reduce((s, p) => s + p.netAmount, 0) },
    };
  }, [payoutItems]);

  return { payoutItems, stats };
}
