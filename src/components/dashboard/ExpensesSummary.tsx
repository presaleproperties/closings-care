import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Receipt, RefreshCw, Calendar } from 'lucide-react';
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

export function ExpensesSummary({ expenses }: ExpensesSummaryProps) {
  const summary = useMemo(() => {
    const monthlyRecurring = expenses
      .filter(e => e.recurrence === 'monthly')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const weeklyRecurring = expenses
      .filter(e => e.recurrence === 'weekly')
      .reduce((sum, e) => sum + Number(e.amount) * 4.33, 0); // Weekly to monthly

    const oneTime = expenses
      .filter(e => e.recurrence === 'one-time')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    // Group by category
    const byCategory = new Map<string, number>();
    expenses.forEach(e => {
      const amount = e.recurrence === 'weekly' ? Number(e.amount) * 4.33 : Number(e.amount);
      const existing = byCategory.get(e.category) || 0;
      byCategory.set(e.category, existing + amount);
    });

    const categories = Array.from(byCategory.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    return {
      monthlyRecurring,
      weeklyRecurring,
      oneTime,
      totalMonthly: monthlyRecurring + weeklyRecurring,
      categories,
    };
  }, [expenses]);

  const getProgressColor = (index: number) => {
    const colors = ['bg-accent', 'bg-info', 'bg-success', 'bg-warning', 'bg-destructive'];
    return colors[index % colors.length];
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5 text-accent" />
            Expense Breakdown
          </h3>
          <p className="text-sm text-muted-foreground">Monthly recurring costs</p>
        </div>
        <Link to="/expenses">
          <Button variant="ghost" size="sm" className="text-accent">
            Manage <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-muted/50">
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Recurring</span>
          </div>
          <p className="text-xl font-bold">{formatCurrency(summary.totalMonthly)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">/month</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/50">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">One-time</span>
          </div>
          <p className="text-xl font-bold">{formatCurrency(summary.oneTime)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">this period</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {summary.categories.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">By Category</p>
          {summary.categories.slice(0, 5).map((cat, index) => (
            <div key={cat.name}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground truncate">{cat.name}</span>
                <span className="font-medium">{formatCurrency(cat.amount)}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getProgressColor(index)}`}
                  style={{ width: `${Math.min((cat.amount / summary.totalMonthly) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-sm text-muted-foreground">
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
