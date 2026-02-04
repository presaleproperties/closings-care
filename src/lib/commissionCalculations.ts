/**
 * Simplified commission calculations
 * Brokerage split is handled as a fixed monthly expense, not deducted from commissions
 */

export interface NetCommissionResult {
  netAmount: number;
  teamPortion: number;
}

/**
 * Calculate net commission from gross, applying only team splits
 * Brokerage fees are tracked separately as monthly expenses ($1,250/month)
 */
export function calculateNetCommission(
  grossAmount: number,
  teamMemberPortion?: number | null
): NetCommissionResult {
  if (!grossAmount || grossAmount <= 0) {
    return { netAmount: 0, teamPortion: 0 };
  }

  // Calculate user's portion (for team deals)
  // User gets: 100% - teamMemberPortion (default 70% goes to team member, user keeps 30%)
  let teamPortion = 0;
  let userNet = grossAmount;
  
  if (teamMemberPortion && teamMemberPortion > 0) {
    teamPortion = grossAmount * (teamMemberPortion / 100);
    userNet = grossAmount - teamPortion;
  }

  return {
    netAmount: Math.round(userNet * 100) / 100,
    teamPortion: Math.round(teamPortion * 100) / 100,
  };
}

/**
 * Format the net commission breakdown for display
 */
export function formatCommissionBreakdown(result: NetCommissionResult, grossAmount: number): string {
  const parts: string[] = [];
  
  if (result.teamPortion > 0) {
    parts.push(`-$${result.teamPortion.toLocaleString()} team split`);
  }
  
  return parts.join(' • ');
}
