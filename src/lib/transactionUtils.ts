/**
 * Shared transaction utilities — single source of truth for team deal logic,
 * net payout extraction, and effective commission calculations.
 */

// Team agents who get the 70/30 split (user keeps 30%)
export const TEAM_AGENT_NAMES = ['ravish', 'sarb'];

export interface TransactionParticipant {
  id?: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  company?: string;
  participantRole?: string;
  payment?: { percent?: number };
}

/**
 * Checks if a transaction is a team deal (has Ravish or Sarb as participants).
 */
export function isTeamDeal(participants: TransactionParticipant[]): boolean {
  return participants.some(p => {
    const name = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
    return TEAM_AGENT_NAMES.some(agent => name.includes(agent));
  });
}

/**
 * Checks if a raw transaction object (with raw_data.participants) is a team deal.
 */
export function isTeamDealFromRaw(rawData: any): boolean {
  const participants = rawData?.participants || [];
  return isTeamDeal(participants);
}

/**
 * Extracts user's net payout from raw_data.myNetPayout.amount.
 * Falls back to the provided fallback amount (typically commission_amount).
 */
export function extractNetPayout(rawData: any, fallback: number = 0): number {
  try {
    const myNet = rawData?.myNetPayout?.amount;
    if (myNet !== null && myNet !== undefined) {
      return Number(myNet);
    }
  } catch {}
  return fallback;
}

/**
 * Returns the appropriate commission amount for a transaction:
 * - Team deals (Ravish/Sarb): use net payout (user's 30% portion)
 * - All other deals: use gross commission
 */
export function getEffectiveCommission(
  rawData: any,
  commissionAmount: number
): number {
  if (isTeamDealFromRaw(rawData)) {
    return extractNetPayout(rawData, commissionAmount);
  }
  return commissionAmount;
}
