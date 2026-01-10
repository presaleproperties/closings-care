import { useMemo } from 'react';
import { useSettings } from './useSettings';
import { useDeals } from './useDeals';

export type SubscriptionTier = 'free' | 'pro';

export interface SubscriptionLimits {
  maxDeals: number;
  projectionMonths: number;
  taxCalculator: boolean;
  safeToSpend: boolean;
  dataExport: boolean;
  fullExpenseTracking: boolean;
  prioritySupport: boolean;
}

const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    maxDeals: 10,
    projectionMonths: 3,
    taxCalculator: false,
    safeToSpend: false,
    dataExport: false,
    fullExpenseTracking: false,
    prioritySupport: false,
  },
  pro: {
    maxDeals: Infinity,
    projectionMonths: 12,
    taxCalculator: true,
    safeToSpend: true,
    dataExport: true,
    fullExpenseTracking: true,
    prioritySupport: true,
  },
};

export function useSubscription() {
  const { data: settings } = useSettings();
  const { data: deals = [] } = useDeals();

  const tier: SubscriptionTier = (settings as any)?.subscription_tier || 'free';
  const limits = TIER_LIMITS[tier];

  const usage = useMemo(() => ({
    dealsUsed: deals.length,
    dealsRemaining: Math.max(0, limits.maxDeals - deals.length),
    isAtDealLimit: deals.length >= limits.maxDeals,
    percentUsed: limits.maxDeals === Infinity ? 0 : (deals.length / limits.maxDeals) * 100,
  }), [deals.length, limits.maxDeals]);

  const canAddDeal = usage.dealsRemaining > 0;
  const isPro = tier === 'pro';
  const isFree = tier === 'free';

  return {
    tier,
    limits,
    usage,
    canAddDeal,
    isPro,
    isFree,
  };
}
