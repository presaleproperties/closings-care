import { parseISO, isWithinInterval, addYears, subYears, isBefore, isAfter } from 'date-fns';
import { Payout } from './types';

export interface BrokerageSettings {
  brokerage_split_percent: number | null;
  brokerage_cap_enabled?: boolean;
  brokerage_cap_amount?: number;
  brokerage_cap_start_date?: string | null;
}

export interface NetCommissionResult {
  netAmount: number;
  brokeragePortion: number;
  splitPercent: number;
  capReached: boolean;
  teamPortion: number;
}

/**
 * Calculate net commission from gross, applying brokerage split (respecting cap) and team splits
 */
export function calculateNetCommission(
  grossAmount: number,
  settings: BrokerageSettings | null | undefined,
  paidPayouts: Payout[] = [],
  teamMemberPortion?: number | null
): NetCommissionResult {
  if (!grossAmount || grossAmount <= 0) {
    return { netAmount: 0, brokeragePortion: 0, splitPercent: 0, capReached: false, teamPortion: 0 };
  }

  // Step 1: Calculate user's gross portion (for team deals)
  // User gets: 100% - teamMemberPortion
  let teamPortion = 0;
  let userGross = grossAmount;
  if (teamMemberPortion && teamMemberPortion > 0) {
    teamPortion = grossAmount * (teamMemberPortion / 100);
    userGross = grossAmount - teamPortion; // User's gross portion
  }

  const splitPercent = Number(settings?.brokerage_split_percent) || 0;
  const capEnabled = (settings as any)?.brokerage_cap_enabled || false;
  const capAmount = Number((settings as any)?.brokerage_cap_amount) || 0;
  const capStartDateStr = (settings as any)?.brokerage_cap_start_date;

  let effectiveSplitPercent = splitPercent;
  let capReached = false;

  // Check if cap tracking is enabled and calculate cap status
  if (capEnabled && capStartDateStr && capAmount > 0 && splitPercent > 0) {
    const capStartDate = parseISO(capStartDateStr);
    const today = new Date();

    // Calculate current cap period
    let currentPeriodStart = new Date(capStartDate);
    let currentPeriodEnd = addYears(currentPeriodStart, 1);

    while (isAfter(today, currentPeriodEnd)) {
      currentPeriodStart = currentPeriodEnd;
      currentPeriodEnd = addYears(currentPeriodStart, 1);
    }
    while (isBefore(today, currentPeriodStart)) {
      currentPeriodEnd = currentPeriodStart;
      currentPeriodStart = subYears(currentPeriodStart, 1);
    }

    // Calculate amount already paid towards cap
    const amountPaidTowardsCap = paidPayouts
      .filter(payout => {
        if (payout.status !== 'PAID' || !payout.paid_date) return false;
        const paidDate = parseISO(payout.paid_date);
        return isWithinInterval(paidDate, { start: currentPeriodStart, end: currentPeriodEnd });
      })
      .reduce((total, payout) => {
        const brokeragePortion = Number(payout.amount) * (splitPercent / 100);
        return total + brokeragePortion;
      }, 0);

    capReached = amountPaidTowardsCap >= capAmount;
    if (capReached) {
      effectiveSplitPercent = 0;
    }
  }

  // Step 2: Calculate brokerage portion from USER'S GROSS (not full deal)
  const brokeragePortion = userGross * (effectiveSplitPercent / 100);
  const netAmount = userGross - brokeragePortion;

  return {
    netAmount: Math.round(netAmount * 100) / 100,
    brokeragePortion: Math.round(brokeragePortion * 100) / 100,
    splitPercent: effectiveSplitPercent,
    capReached,
    teamPortion: Math.round(teamPortion * 100) / 100,
  };
}

/**
 * Format the net commission breakdown for display
 */
export function formatCommissionBreakdown(result: NetCommissionResult, grossAmount: number): string {
  const parts: string[] = [];
  
  if (result.brokeragePortion > 0) {
    parts.push(`-$${result.brokeragePortion.toLocaleString()} brokerage (${result.splitPercent}%)`);
  }
  
  if (result.teamPortion > 0) {
    parts.push(`-$${result.teamPortion.toLocaleString()} team split`);
  }
  
  if (result.capReached) {
    parts.push('✓ Cap reached - 100% split!');
  }
  
  return parts.join(' • ');
}
