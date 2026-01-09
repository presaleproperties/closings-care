import { Expense } from '@/lib/types';
import { Property, getPropertyMonthlyExpenses, calculatePropertyCashflow } from '@/hooks/useProperties';

/**
 * Calculate total tracked expenses for a specific month
 * Includes monthly, weekly (x4.33), yearly (if month matches), and one-time expenses
 */
export function getTrackedExpensesForMonth(expenses: Expense[], monthStr: string): number {
  const targetMonth = monthStr.slice(5, 7); // Extract MM from YYYY-MM
  
  let total = 0;
  
  for (const expense of expenses) {
    const recurrence = expense.recurrence || 'monthly';
    const amount = Number(expense.amount);
    const expenseMonth = expense.month?.slice(5, 7); // MM from expense.month
    const expenseYearMonth = expense.month; // YYYY-MM
    
    // Only count expenses that have started (month >= expense start month)
    if (expenseYearMonth && monthStr < expenseYearMonth) {
      continue; // Skip expenses that haven't started yet
    }
    
    switch (recurrence) {
      case 'monthly':
        total += amount;
        break;
      case 'weekly':
        total += amount * 4.33;
        break;
      case 'yearly':
        if (expenseMonth === targetMonth) {
          total += amount;
        }
        break;
      case 'one-time':
        if (expenseYearMonth === monthStr) {
          total += amount;
        }
        break;
    }
  }
  
  return total;
}

/**
 * Calculate property carrying costs
 * - Personal properties: full carrying cost (mortgage + strata + taxes/12)
 * - Rental properties: net cashflow (rent - expenses), can be positive (income) or negative (expense)
 */
export function getPropertyCostsForMonth(properties: Property[]): {
  personalCost: number;
  rentalNet: number;
  totalNet: number; // Positive = net income from properties, Negative = net expense
} {
  let personalCost = 0;
  let rentalNet = 0;
  
  for (const property of properties) {
    const builtInExpenses = getPropertyMonthlyExpenses(property);
    
    if (property.property_type === 'personal') {
      personalCost += builtInExpenses;
    } else {
      // Rental: calculate net (income - expenses)
      const cashflow = calculatePropertyCashflow(property, 0);
      rentalNet += cashflow.net;
    }
  }
  
  return {
    personalCost,
    rentalNet,
    totalNet: rentalNet - personalCost, // Positive if rental profits exceed personal costs
  };
}

/**
 * Calculate total expenses for a month including property costs
 * This is the complete picture for financial calculations
 */
export function getTotalExpensesForMonth(
  expenses: Expense[], 
  properties: Property[], 
  monthStr: string
): number {
  const trackedExpenses = getTrackedExpensesForMonth(expenses, monthStr);
  const propertyCosts = getPropertyCostsForMonth(properties);
  
  // Total expenses = tracked expenses + personal property costs - rental net
  // If rental is profitable (positive), it reduces total expenses
  // If rental is losing (negative), it adds to total expenses
  return trackedExpenses + propertyCosts.personalCost - propertyCosts.rentalNet;
}

/**
 * Calculate monthly recurring expense total (for quick stats)
 * Includes property carrying costs
 */
export function getMonthlyRecurringExpenses(expenses: Expense[], properties: Property[]): number {
  // Calculate recurring expense base (monthly + weekly converted)
  const monthlyRecurring = expenses
    .filter(e => e.recurrence === 'monthly' || e.recurrence === 'weekly')
    .reduce((sum, e) => {
      if (e.recurrence === 'weekly') {
        return sum + Number(e.amount) * 4.33;
      }
      return sum + Number(e.amount);
    }, 0);
  
  const propertyCosts = getPropertyCostsForMonth(properties);
  
  return monthlyRecurring + propertyCosts.personalCost - propertyCosts.rentalNet;
}

/**
 * Calculate annual expenses (for tax projections)
 * Includes property costs for 12 months
 */
export function getAnnualExpenses(expenses: Expense[], properties: Property[]): number {
  const monthlyRecurring = expenses
    .filter(e => e.recurrence === 'monthly' || e.recurrence === 'weekly')
    .reduce((sum, e) => {
      if (e.recurrence === 'weekly') {
        return sum + Number(e.amount) * 4.33;
      }
      return sum + Number(e.amount);
    }, 0);

  const yearlyExpenses = expenses
    .filter(e => e.recurrence === 'yearly')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const oneTimeExpenses = expenses
    .filter(e => e.recurrence === 'one-time')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const propertyCosts = getPropertyCostsForMonth(properties);
  const annualPropertyNet = (propertyCosts.personalCost - propertyCosts.rentalNet) * 12;

  return (monthlyRecurring * 12) + yearlyExpenses + oneTimeExpenses + annualPropertyNet;
}
