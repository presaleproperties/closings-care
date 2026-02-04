import { useMemo } from 'react';
import { usePayouts } from './usePayouts';
import { useSettings } from './useSettings';
import { parseISO, isWithinInterval, addYears, subYears, isBefore, isAfter } from 'date-fns';

export interface BrokerageCapStatus {
  isEnabled: boolean;
  capAmount: number;
  splitPercent: number;
  capStartDate: Date | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  amountPaidTowardsCap: number;
  amountRemainingUntilCap: number;
  capReached: boolean;
  progressPercent: number;
  effectiveSplitPercent: number; // 0 if cap reached, otherwise splitPercent
  daysUntilReset: number | null;
}

export function useBrokerageCap(): BrokerageCapStatus {
  const { data: settings } = useSettings();
  const { data: payouts = [] } = usePayouts();

  return useMemo(() => {
    const isEnabled = (settings as any)?.brokerage_cap_enabled || false;
    const capAmount = Number((settings as any)?.brokerage_cap_amount) || 0;
    const splitPercent = Number(settings?.brokerage_split_percent) || 0;
    const capStartDateStr = (settings as any)?.brokerage_cap_start_date;

    // Default return if not enabled
    if (!isEnabled || !capStartDateStr || capAmount <= 0 || splitPercent <= 0) {
      return {
        isEnabled,
        capAmount,
        splitPercent,
        capStartDate: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        amountPaidTowardsCap: 0,
        amountRemainingUntilCap: capAmount,
        capReached: false,
        progressPercent: 0,
        effectiveSplitPercent: splitPercent,
        daysUntilReset: null,
      };
    }

    const capStartDate = parseISO(capStartDateStr);
    const today = new Date();

    // Calculate the current cap period based on anniversary date
    let currentPeriodStart = new Date(capStartDate);
    let currentPeriodEnd = addYears(currentPeriodStart, 1);

    // Adjust to find the current period
    while (isAfter(today, currentPeriodEnd)) {
      currentPeriodStart = currentPeriodEnd;
      currentPeriodEnd = addYears(currentPeriodStart, 1);
    }
    while (isBefore(today, currentPeriodStart)) {
      currentPeriodEnd = currentPeriodStart;
      currentPeriodStart = subYears(currentPeriodStart, 1);
    }

    // Calculate amount paid towards cap from PAID payouts in current period
    const paidPayoutsInPeriod = payouts.filter(payout => {
      if (payout.status !== 'PAID' || !payout.paid_date) return false;
      const paidDate = parseISO(payout.paid_date);
      return isWithinInterval(paidDate, { start: currentPeriodStart, end: currentPeriodEnd });
    });

    // Calculate brokerage portion of each payout
    const amountPaidTowardsCap = paidPayoutsInPeriod.reduce((total, payout) => {
      const brokeragePortion = Number(payout.amount) * (splitPercent / 100);
      return total + brokeragePortion;
    }, 0);

    const capReached = amountPaidTowardsCap >= capAmount;
    const amountRemainingUntilCap = Math.max(0, capAmount - amountPaidTowardsCap);
    const progressPercent = capAmount > 0 ? Math.min(100, (amountPaidTowardsCap / capAmount) * 100) : 0;
    const effectiveSplitPercent = capReached ? 0 : splitPercent;

    // Calculate days until reset
    const msUntilReset = currentPeriodEnd.getTime() - today.getTime();
    const daysUntilReset = Math.ceil(msUntilReset / (1000 * 60 * 60 * 24));

    return {
      isEnabled,
      capAmount,
      splitPercent,
      capStartDate,
      currentPeriodStart,
      currentPeriodEnd,
      amountPaidTowardsCap,
      amountRemainingUntilCap,
      capReached,
      progressPercent,
      effectiveSplitPercent,
      daysUntilReset,
    };
  }, [settings, payouts]);
}

// Helper to calculate net commission after brokerage split
export function calculateNetAfterSplit(
  grossAmount: number, 
  capStatus: BrokerageCapStatus
): { netAmount: number; brokeragePortion: number } {
  if (!capStatus.isEnabled || capStatus.capReached) {
    return { netAmount: grossAmount, brokeragePortion: 0 };
  }

  const brokeragePortion = grossAmount * (capStatus.effectiveSplitPercent / 100);
  const netAmount = grossAmount - brokeragePortion;

  return { netAmount, brokeragePortion };
}
