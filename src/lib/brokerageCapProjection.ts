import { Payout } from './types';

export interface PayoutWithNetAmount extends Payout {
  netAmount: number;
}

/**
 * Simplified: Payouts are now gross amounts (after team split only)
 * Brokerage fees are tracked separately as fixed monthly expenses
 */
export function calculatePayoutsWithBrokerageCap(
  payouts: Payout[]
): PayoutWithNetAmount[] {
  return payouts.map(p => ({
    ...p,
    netAmount: Number(p.amount),
  }));
}

/**
 * Calculate total net income for a set of payouts
 * No brokerage deductions - those are handled as monthly expenses
 */
export function calculateTotalNetIncome(
  payouts: Payout[]
): { grossTotal: number; netTotal: number } {
  const total = payouts.reduce((sum, p) => sum + Number(p.amount), 0);
  
  return {
    grossTotal: Math.round(total * 100) / 100,
    netTotal: Math.round(total * 100) / 100,
  };
}
