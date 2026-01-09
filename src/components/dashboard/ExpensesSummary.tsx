import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Receipt, RefreshCw, Calendar, Briefcase, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';

interface Expense {
  id: string;
  category: string;
  amount: number;
  recurrence?: string | null;
  month: string;
}

interface ExpensesSummaryProps {
  expenses: Expense[];
}

// Helper to determine if category is personal or business
const isPersonalCategory = (category: string): boolean => {
  const personalPrefixes = ['Personal -'];
  return personalPrefixes.some(prefix => category.startsWith(prefix));
};

const isBusinessCategory = (category: string): boolean => {
  const businessPrefixes = ['Business -'];
  return businessPrefixes.some(prefix => category.startsWith(prefix));
};

export function ExpensesSummary({ expenses }: ExpensesSummaryProps) {
  const summary = useMemo(() => {
    const calculateMonthlyAmount = (e: Expense) => {
      if (e.recurrence === 'weekly') return Number(e.amount) * 4.33;
      if (e.recurrence === 'one-time') return 0; // Don't include in monthly recurring
      return Number(e.amount);
    };

    // Separate by type
    let personalRecurring = 0;
    let businessRecurring = 0;
    let personalOneTime = 0;
    let businessOneTime = 0;
    let otherRecurring = 0;
    let otherOneTime = 0;

    expenses.forEach(e => {
      const isPersonal = isPersonalCategory(e.category);
      const isBusiness = isBusinessCategory(e.category);
      const isOneTime = e.recurrence === 'one-time';
      const amount = isOneTime ? Number(e.amount) : calculateMonthlyAmount(e);

      if (isPersonal) {
        if (isOneTime) personalOneTime += amount;
        else personalRecurring += amount;
      } else if (isBusiness) {
        if (isOneTime) businessOneTime += amount;
        else businessRecurring += amount;
      } else {
        if (isOneTime) otherOneTime += amount;
        else otherRecurring += amount;
      }
    });

    const totalRecurring = personalRecurring + businessRecurring + otherRecurring;
    const totalOneTime = personalOneTime + businessOneTime + otherOneTime;

    return {
      personalRecurring,
      businessRecurring,
      personalOneTime,
      businessOneTime,
      otherRecurring,
      otherOneTime,
      totalRecurring,
      totalOneTime,
      totalPersonal: personalRecurring + personalOneTime,
      totalBusiness: businessRecurring + businessOneTime,
    };
  }, [expenses]);

  const totalMonthlyPersonal = summary.personalRecurring;
  const totalMonthlyBusiness = summary.businessRecurring;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5 text-accent" />
            Expense Breakdown
          </h3>
          <p className="text-sm text-muted-foreground">Personal vs Business</p>
        </div>
        <Link to="/expenses">
          <Button variant="ghost" size="sm" className="text-accent">
            Manage <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Personal vs Business Split */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Home className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium text-blue-500">Personal</span>
          </div>
          <p className="text-xl font-bold">{formatCurrency(totalMonthlyPersonal)}</p>
          <p className="text-xs text-muted-foreground">/month recurring</p>
          {summary.personalOneTime > 0 && (
            <p className="text-xs text-blue-400 mt-1">+{formatCurrency(summary.personalOneTime)} one-time</p>
          )}
        </div>
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-4 w-4 text-purple-500" />
            <span className="text-xs font-medium text-purple-500">Business</span>
          </div>
          <p className="text-xl font-bold">{formatCurrency(totalMonthlyBusiness)}</p>
          <p className="text-xs text-muted-foreground">/month recurring</p>
          {summary.businessOneTime > 0 && (
            <p className="text-xs text-purple-400 mt-1">+{formatCurrency(summary.businessOneTime)} one-time</p>
          )}
        </div>
      </div>

      {/* Recurring vs One-Time */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Total Recurring</span>
          </div>
          <p className="text-lg font-bold">{formatCurrency(summary.totalRecurring)}</p>
          <p className="text-xs text-muted-foreground">/month</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">One-Time</span>
          </div>
          <p className="text-lg font-bold">{formatCurrency(summary.totalOneTime)}</p>
          <p className="text-xs text-muted-foreground">this period</p>
        </div>
      </div>

      {/* Visual Split Bar */}
      {(summary.totalRecurring > 0 || summary.totalOneTime > 0) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Expense Split</span>
            <span>Personal vs Business</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden flex">
            {totalMonthlyPersonal > 0 && (
              <div 
                className="h-full bg-blue-500"
                style={{ width: `${(totalMonthlyPersonal / (summary.totalRecurring || 1)) * 100}%` }}
              />
            )}
            {totalMonthlyBusiness > 0 && (
              <div 
                className="h-full bg-purple-500"
                style={{ width: `${(totalMonthlyBusiness / (summary.totalRecurring || 1)) * 100}%` }}
              />
            )}
            {summary.otherRecurring > 0 && (
              <div 
                className="h-full bg-muted-foreground/30"
                style={{ width: `${(summary.otherRecurring / (summary.totalRecurring || 1)) * 100}%` }}
              />
            )}
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">Personal</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-muted-foreground">Business</span>
            </div>
          </div>
        </div>
      )}

      {expenses.length === 0 && (
        <div className="text-center py-6 text-sm text-muted-foreground">
          <Receipt className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>No expenses tracked yet</p>
          <Link to="/expenses">
            <Button variant="link" size="sm" className="text-accent mt-2">
              Add your first expense
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
