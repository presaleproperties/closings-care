import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Receipt, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Expense {
  id: string;
  category: string;
  amount: number;
  recurrence?: string | null;
  month: string;
}

interface ExpenseAnalyticsProps {
  expenses: Expense[];
}

const COLORS = [
  'hsl(43, 96%, 56%)',   // accent
  'hsl(217, 91%, 60%)',  // info
  'hsl(142, 76%, 36%)',  // success
  'hsl(262, 83%, 58%)',  // purple
  'hsl(0, 84%, 60%)',    // destructive
  'hsl(38, 92%, 50%)',   // warning
];

export function ExpenseAnalytics({ expenses }: ExpenseAnalyticsProps) {
  const analytics = useMemo(() => {
    // Calculate monthly totals
    const calculateMonthlyAmount = (e: Expense) => {
      if (e.recurrence === 'weekly') return Number(e.amount) * 4.33;
      return Number(e.amount);
    };

    // Group by category
    const byCategory = new Map<string, { monthly: number; oneTime: number }>();
    expenses.forEach(e => {
      const existing = byCategory.get(e.category) || { monthly: 0, oneTime: 0 };
      if (e.recurrence === 'one-time') {
        existing.oneTime += Number(e.amount);
      } else {
        existing.monthly += calculateMonthlyAmount(e);
      }
      byCategory.set(e.category, existing);
    });

    const categoryData = Array.from(byCategory.entries())
      .map(([name, data]) => ({
        name,
        monthly: data.monthly,
        oneTime: data.oneTime,
        total: data.monthly + data.oneTime,
      }))
      .sort((a, b) => b.total - a.total);

    // Calculate totals
    const totalMonthly = categoryData.reduce((sum, c) => sum + c.monthly, 0);
    const totalOneTime = categoryData.reduce((sum, c) => sum + c.oneTime, 0);
    const annualRecurring = totalMonthly * 12;

    // Find biggest expense category
    const biggestCategory = categoryData[0];

    // Identify potential savings (categories that are above average)
    const avgCategorySpend = totalMonthly / Math.max(categoryData.length, 1);
    const highSpendCategories = categoryData.filter(c => c.monthly > avgCategorySpend * 1.5);

    return {
      categoryData,
      totalMonthly,
      totalOneTime,
      annualRecurring,
      biggestCategory,
      highSpendCategories,
    };
  }, [expenses]);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-destructive/10">
            <Receipt className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Expense Analytics</h3>
            <p className="text-xs text-muted-foreground">Where your money goes</p>
          </div>
        </div>
        <Link to="/expenses">
          <Button variant="ghost" size="sm" className="text-accent">
            Manage <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 rounded-xl bg-destructive/10">
          <p className="text-xs text-muted-foreground mb-1">Monthly</p>
          <p className="text-lg font-bold text-destructive">{formatCurrency(analytics.totalMonthly)}</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-warning/10">
          <p className="text-xs text-muted-foreground mb-1">Annual (Recurring)</p>
          <p className="text-lg font-bold text-warning">{formatCurrency(analytics.annualRecurring)}</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">One-Time</p>
          <p className="text-lg font-bold">{formatCurrency(analytics.totalOneTime)}</p>
        </div>
      </div>

      {/* Chart */}
      {analytics.categoryData.length > 0 ? (
        <>
          <div className="h-48 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.categoryData.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis 
                  type="number" 
                  fontSize={11}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  fontSize={11}
                  width={100}
                  stroke="hsl(var(--muted-foreground))"
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Monthly']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="monthly" radius={[0, 4, 4, 0]}>
                  {analytics.categoryData.slice(0, 6).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Biggest Expense Alert */}
          {analytics.biggestCategory && analytics.biggestCategory.monthly > 1000 && (
            <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Highest Expense Category</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-semibold">{analytics.biggestCategory.name}</span> costs you{' '}
                    <span className="font-semibold text-warning">{formatCurrency(analytics.biggestCategory.monthly)}/month</span>
                    {' '}({formatCurrency(analytics.biggestCategory.monthly * 12)}/year)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Category Breakdown List */}
          <div className="space-y-2">
            {analytics.categoryData.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-sm">{cat.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatCurrency(cat.monthly)}/mo</p>
                  {cat.oneTime > 0 && (
                    <p className="text-xs text-muted-foreground">+{formatCurrency(cat.oneTime)} one-time</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Receipt className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-2">No expenses tracked yet</p>
          <Link to="/expenses">
            <Button variant="outline" size="sm">Add Expenses</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
