import { useMemo } from 'react';
import { useExpenses } from './useExpenses';
import { useSettings } from './useSettings';
import { parseISO, isWithinInterval, addYears, isBefore, isAfter, startOfYear, endOfYear } from 'date-fns';

export interface BrokerageCapStatus {
  isEnabled: boolean;
  capAmount: number;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  amountPaidTowardsCap: number;
  amountRemainingUntilCap: number;
  capReached: boolean;
  progressPercent: number;
  daysUntilReset: number | null;
  monthlyExpense: number;
}

/**
 * Track brokerage cap progress based on monthly brokerage fee expenses
 * The $15,000 cap is tracked via $1,250/month fixed expenses
 */
export function useBrokerageCap(): BrokerageCapStatus {
  const { data: settings } = useSettings();
  const { data: expenses = [] } = useExpenses();

  return useMemo(() => {
    const isEnabled = (settings as any)?.brokerage_cap_enabled || false;
    const capAmount = Number((settings as any)?.brokerage_cap_amount) || 15000;
    const capStartDateStr = (settings as any)?.brokerage_cap_start_date;
    const monthlyExpense = capAmount / 12; // $1,250/month for $15K cap

    // Default return if not enabled
    if (!isEnabled || !capStartDateStr) {
      return {
        isEnabled,
        capAmount,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        amountPaidTowardsCap: 0,
        amountRemainingUntilCap: capAmount,
        capReached: false,
        progressPercent: 0,
        daysUntilReset: null,
        monthlyExpense,
      };
    }

    const capStartDate = parseISO(capStartDateStr);
    const today = new Date();

    // Calculate the current cap period based on anniversary date (Jan 1st)
    let currentPeriodStart = new Date(capStartDate);
    let currentPeriodEnd = addYears(currentPeriodStart, 1);

    // Adjust to find the current period
    while (isAfter(today, currentPeriodEnd)) {
      currentPeriodStart = currentPeriodEnd;
      currentPeriodEnd = addYears(currentPeriodStart, 1);
    }
    while (isBefore(today, currentPeriodStart)) {
      currentPeriodEnd = currentPeriodStart;
      currentPeriodStart = addYears(currentPeriodStart, -1);
    }

    // Calculate brokerage fees paid this year from expenses
    // Look for expenses with "Brokerage" in notes within the current period
    const brokerageExpenses = expenses.filter(expense => {
      if (!expense.month) return false;
      const expenseDate = parseISO(`${expense.month}-01`);
      const inPeriod = isWithinInterval(expenseDate, { 
        start: currentPeriodStart, 
        end: currentPeriodEnd 
      });
      const isBrokerageFee = expense.notes?.toLowerCase().includes('brokerage');
      return inPeriod && isBrokerageFee;
    });

    const amountPaidTowardsCap = brokerageExpenses.reduce(
      (total, expense) => total + Number(expense.amount), 
      0
    );

    const capReached = amountPaidTowardsCap >= capAmount;
    const amountRemainingUntilCap = Math.max(0, capAmount - amountPaidTowardsCap);
    const progressPercent = capAmount > 0 ? Math.min(100, (amountPaidTowardsCap / capAmount) * 100) : 0;

    // Calculate days until reset
    const msUntilReset = currentPeriodEnd.getTime() - today.getTime();
    const daysUntilReset = Math.ceil(msUntilReset / (1000 * 60 * 60 * 24));

    return {
      isEnabled,
      capAmount,
      currentPeriodStart,
      currentPeriodEnd,
      amountPaidTowardsCap,
      amountRemainingUntilCap,
      capReached,
      progressPercent,
      daysUntilReset,
      monthlyExpense,
    };
  }, [settings, expenses]);
}
