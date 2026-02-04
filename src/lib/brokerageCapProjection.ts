import { parseISO, isWithinInterval, addYears, isBefore, isAfter, startOfYear, endOfYear } from 'date-fns';
import { Payout } from './types';

export interface BrokerageSettings {
  brokerage_split_percent: number | null;
  brokerage_cap_enabled?: boolean;
  brokerage_cap_amount?: number;
  brokerage_cap_start_date?: string | null;
}

export interface PayoutWithNetAmount extends Payout {
  netAmount: number;
  brokerageDeducted: number;
  capReachedAtThisPayout: boolean;
}

export interface YearlyCapStatus {
  year: number;
  totalBrokeragePaid: number;
  capAmount: number;
  capReached: boolean;
  effectiveSplitPercent: number;
}

/**
 * Calculate net amounts for all payouts, simulating brokerage cap progression
 * This is used for projections - it processes payouts in date order and tracks
 * when the cap is reached during the year
 */
export function calculatePayoutsWithBrokerageCap(
  payouts: Payout[],
  settings: BrokerageSettings | null | undefined
): PayoutWithNetAmount[] {
  const splitPercent = Number(settings?.brokerage_split_percent) || 0;
  const capEnabled = settings?.brokerage_cap_enabled || false;
  const capAmount = Number(settings?.brokerage_cap_amount) || 0;
  const capStartDateStr = settings?.brokerage_cap_start_date;

  // If no split or no cap, return payouts with full amounts as net
  if (splitPercent <= 0) {
    return payouts.map(p => ({
      ...p,
      netAmount: Number(p.amount),
      brokerageDeducted: 0,
      capReachedAtThisPayout: false,
    }));
  }

  // Sort payouts by date (use due_date for projected, paid_date for paid)
  const sortedPayouts = [...payouts].sort((a, b) => {
    const dateA = a.status === 'PAID' && a.paid_date ? a.paid_date : a.due_date || '9999-12-31';
    const dateB = b.status === 'PAID' && b.paid_date ? b.paid_date : b.due_date || '9999-12-31';
    return dateA.localeCompare(dateB);
  });

  // Track cumulative brokerage paid per year
  const yearlyBrokeragePaid: Record<number, number> = {};

  // Get the cap period start (use cap_start_date or default to Jan 1)
  const getCapYearForDate = (dateStr: string): number => {
    if (!capStartDateStr) {
      // Default to calendar year
      return parseISO(dateStr).getFullYear();
    }
    
    const date = parseISO(dateStr);
    const capStart = parseISO(capStartDateStr);
    
    // Calculate which anniversary year this date falls into
    let yearStart = new Date(capStart);
    let yearEnd = addYears(yearStart, 1);
    
    while (isAfter(date, yearEnd)) {
      yearStart = yearEnd;
      yearEnd = addYears(yearStart, 1);
    }
    while (isBefore(date, yearStart)) {
      yearEnd = yearStart;
      yearStart = addYears(yearStart, -1);
    }
    
    return yearStart.getFullYear();
  };

  return sortedPayouts.map(payout => {
    const amount = Number(payout.amount);
    const payoutDate = payout.status === 'PAID' && payout.paid_date 
      ? payout.paid_date 
      : payout.due_date || new Date().toISOString().split('T')[0];
    
    const capYear = getCapYearForDate(payoutDate);
    
    // Initialize year tracking if needed
    if (!yearlyBrokeragePaid[capYear]) {
      yearlyBrokeragePaid[capYear] = 0;
    }

    let brokerageDeducted = 0;
    let capReachedAtThisPayout = false;

    if (capEnabled && capAmount > 0) {
      const currentYearPaid = yearlyBrokeragePaid[capYear];
      
      if (currentYearPaid >= capAmount) {
        // Cap already reached - no deduction
        brokerageDeducted = 0;
        capReachedAtThisPayout = true;
      } else {
        // Calculate brokerage for this payout
        const fullBrokerage = amount * (splitPercent / 100);
        const remainingUntilCap = capAmount - currentYearPaid;
        
        if (fullBrokerage <= remainingUntilCap) {
          // Full brokerage deduction
          brokerageDeducted = fullBrokerage;
        } else {
          // Partial deduction - cap reached during this payout
          brokerageDeducted = remainingUntilCap;
          capReachedAtThisPayout = true;
        }
        
        yearlyBrokeragePaid[capYear] += brokerageDeducted;
      }
    } else {
      // No cap - always deduct full brokerage
      brokerageDeducted = amount * (splitPercent / 100);
    }

    const netAmount = amount - brokerageDeducted;

    return {
      ...payout,
      netAmount: Math.round(netAmount * 100) / 100,
      brokerageDeducted: Math.round(brokerageDeducted * 100) / 100,
      capReachedAtThisPayout,
    };
  });
}

/**
 * Get the cap status for each year based on payouts
 */
export function getYearlyCapStatus(
  payouts: Payout[],
  settings: BrokerageSettings | null | undefined,
  years: number[]
): Record<number, YearlyCapStatus> {
  const splitPercent = Number(settings?.brokerage_split_percent) || 0;
  const capEnabled = settings?.brokerage_cap_enabled || false;
  const capAmount = Number(settings?.brokerage_cap_amount) || 0;

  const result: Record<number, YearlyCapStatus> = {};
  
  // Process payouts with cap to get accurate yearly totals
  const processedPayouts = calculatePayoutsWithBrokerageCap(payouts, settings);
  
  for (const year of years) {
    const yearPayouts = processedPayouts.filter(p => {
      const date = p.status === 'PAID' && p.paid_date ? p.paid_date : p.due_date;
      return date?.startsWith(year.toString());
    });
    
    const totalBrokeragePaid = yearPayouts.reduce((sum, p) => sum + p.brokerageDeducted, 0);
    const capReached = capEnabled && capAmount > 0 && totalBrokeragePaid >= capAmount;
    
    result[year] = {
      year,
      totalBrokeragePaid,
      capAmount,
      capReached,
      effectiveSplitPercent: capReached ? 0 : splitPercent,
    };
  }
  
  return result;
}

/**
 * Calculate total net income for a set of payouts after brokerage deductions
 */
export function calculateTotalNetIncome(
  payouts: Payout[],
  settings: BrokerageSettings | null | undefined
): { grossTotal: number; netTotal: number; totalBrokerageDeducted: number } {
  const processed = calculatePayoutsWithBrokerageCap(payouts, settings);
  
  const grossTotal = processed.reduce((sum, p) => sum + Number(p.amount), 0);
  const netTotal = processed.reduce((sum, p) => sum + p.netAmount, 0);
  const totalBrokerageDeducted = processed.reduce((sum, p) => sum + p.brokerageDeducted, 0);
  
  return {
    grossTotal: Math.round(grossTotal * 100) / 100,
    netTotal: Math.round(netTotal * 100) / 100,
    totalBrokerageDeducted: Math.round(totalBrokerageDeducted * 100) / 100,
  };
}
