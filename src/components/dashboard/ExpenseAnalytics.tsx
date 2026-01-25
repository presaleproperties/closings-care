import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Receipt, Home, Briefcase, RefreshCw, Calendar } from 'lucide-react';
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

const PERSONAL_COLOR = 'hsl(187, 92%, 42%)'; // teal
const BUSINESS_COLOR = 'hsl(160, 84%, 39%)'; // emerald
const OTHER_COLOR = 'hsl(var(--muted-foreground))';

const springConfigs = {
  gentle: { type: "spring" as const, stiffness: 120, damping: 20 },
};

// Helper to determine expense type
const getExpenseType = (category: string): 'personal' | 'business' | 'other' => {
  if (category.startsWith('Personal -')) return 'personal';
  if (category.startsWith('Business -')) return 'business';
  return 'other';
};

export function ExpenseAnalytics({ expenses }: ExpenseAnalyticsProps) {
  const analytics = useMemo(() => {
    const calculateMonthlyAmount = (e: Expense) => {
      if (e.recurrence === 'weekly') return Number(e.amount) * 4.33;
      return Number(e.amount);
    };

    // Separate by type and recurrence
    const breakdown = {
      personal: { recurring: 0, oneTime: 0 },
      business: { recurring: 0, oneTime: 0 },
      other: { recurring: 0, oneTime: 0 },
    };

    // Group by category
    const byCategory = new Map<string, { 
      recurring: number; 
      oneTime: number; 
      type: 'personal' | 'business' | 'other';
    }>();

    expenses.forEach(e => {
      const type = getExpenseType(e.category);
      const isOneTime = e.recurrence === 'one-time';
      const amount = isOneTime ? Number(e.amount) : calculateMonthlyAmount(e);

      // Update type breakdown
      if (isOneTime) {
        breakdown[type].oneTime += amount;
      } else {
        breakdown[type].recurring += amount;
      }

      // Update category breakdown
      const existing = byCategory.get(e.category) || { recurring: 0, oneTime: 0, type };
      if (isOneTime) {
        existing.oneTime += Number(e.amount);
      } else {
        existing.recurring += calculateMonthlyAmount(e);
      }
      byCategory.set(e.category, existing);
    });

    const categoryData = Array.from(byCategory.entries())
      .map(([name, data]) => ({
        name: name.replace(/^(Personal|Business) - /, ''),
        fullName: name,
        recurring: data.recurring,
        oneTime: data.oneTime,
        total: data.recurring + data.oneTime,
        type: data.type,
      }))
      .sort((a, b) => b.total - a.total);

    // Calculate totals
    const totalPersonalRecurring = breakdown.personal.recurring;
    const totalBusinessRecurring = breakdown.business.recurring;
    const totalOtherRecurring = breakdown.other.recurring;
    const totalRecurring = totalPersonalRecurring + totalBusinessRecurring + totalOtherRecurring;
    
    const totalPersonalOneTime = breakdown.personal.oneTime;
    const totalBusinessOneTime = breakdown.business.oneTime;
    const totalOtherOneTime = breakdown.other.oneTime;
    const totalOneTime = totalPersonalOneTime + totalBusinessOneTime + totalOtherOneTime;

    // Chart data for type comparison
    const typeChartData = [
      { 
        name: 'Personal', 
        recurring: totalPersonalRecurring, 
        oneTime: totalPersonalOneTime,
        total: totalPersonalRecurring + totalPersonalOneTime,
      },
      { 
        name: 'Business', 
        recurring: totalBusinessRecurring, 
        oneTime: totalBusinessOneTime,
        total: totalBusinessRecurring + totalBusinessOneTime,
      },
    ];

    if (totalOtherRecurring + totalOtherOneTime > 0) {
      typeChartData.push({
        name: 'Other',
        recurring: totalOtherRecurring,
        oneTime: totalOtherOneTime,
        total: totalOtherRecurring + totalOtherOneTime,
      });
    }

    return {
      categoryData,
      typeChartData,
      breakdown,
      totalRecurring,
      totalOneTime,
      totalPersonal: totalPersonalRecurring + totalPersonalOneTime,
      totalBusiness: totalBusinessRecurring + totalBusinessOneTime,
    };
  }, [expenses]);

  const getColorForType = (type: string) => {
    switch (type) {
      case 'personal': return PERSONAL_COLOR;
      case 'business': return BUSINESS_COLOR;
      default: return OTHER_COLOR;
    }
  };

  return (
    <motion.div 
      className="landing-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfigs.gentle}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="icon-gradient-accent icon-gradient-sm">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Expense Analytics</h3>
              <p className="text-xs text-muted-foreground">Personal vs Business breakdown</p>
            </div>
          </div>
          <Link to="/expenses">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              Manage <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Summary Stats - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Home className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-medium text-blue-500">Personal</span>
            </div>
            <p className="text-lg font-bold text-foreground">{formatCurrency(analytics.breakdown.personal.recurring)}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <RefreshCw className="h-2.5 w-2.5" /> /mo
              </span>
              {analytics.breakdown.personal.oneTime > 0 && (
                <span className="text-xs text-blue-400 flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5" /> +{formatCurrency(analytics.breakdown.personal.oneTime)}
                </span>
              )}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="h-3.5 w-3.5 text-purple-500" />
              <span className="text-xs font-medium text-purple-500">Business</span>
            </div>
            <p className="text-lg font-bold text-foreground">{formatCurrency(analytics.breakdown.business.recurring)}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <RefreshCw className="h-2.5 w-2.5" /> /mo
              </span>
              {analytics.breakdown.business.oneTime > 0 && (
                <span className="text-xs text-purple-400 flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5" /> +{formatCurrency(analytics.breakdown.business.oneTime)}
                </span>
              )}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Recurring</span>
            </div>
            <p className="text-lg font-bold text-destructive">{formatCurrency(analytics.totalRecurring)}</p>
            <p className="text-xs text-muted-foreground">/month</p>
          </div>
          <div className="p-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">One-Time</span>
            </div>
            <p className="text-lg font-bold text-foreground">{formatCurrency(analytics.totalOneTime)}</p>
            <p className="text-xs text-muted-foreground">this period</p>
          </div>
        </div>

        {/* Chart */}
        {analytics.typeChartData.length > 0 && analytics.totalRecurring > 0 ? (
          <>
            <div className="h-32 mb-5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.typeChartData} layout="vertical" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis 
                    type="number" 
                    fontSize={10}
                    tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    fontSize={11}
                    width={60}
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      name === 'recurring' ? 'Monthly Recurring' : 'One-Time'
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="recurring" fill={PERSONAL_COLOR} radius={[0, 4, 4, 0]} stackId="stack">
                    {analytics.typeChartData.map((entry, index) => (
                      <Cell 
                        key={`recurring-${index}`} 
                        fill={entry.name === 'Personal' ? PERSONAL_COLOR : entry.name === 'Business' ? BUSINESS_COLOR : OTHER_COLOR} 
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="oneTime" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} stackId="stack" opacity={0.5}>
                    {analytics.typeChartData.map((entry, index) => (
                      <Cell 
                        key={`onetime-${index}`} 
                        fill={entry.name === 'Personal' ? PERSONAL_COLOR : entry.name === 'Business' ? BUSINESS_COLOR : OTHER_COLOR}
                        opacity={0.4}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mb-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span className="text-muted-foreground">Personal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-purple-500" />
                <span className="text-muted-foreground">Business</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-current opacity-40" />
                <span className="text-muted-foreground">One-time</span>
              </div>
            </div>

            {/* Top Categories */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Top Categories</p>
              {analytics.categoryData.slice(0, 5).map((cat) => (
                <div key={cat.fullName} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: getColorForType(cat.type) }}
                    />
                    <span className="text-sm text-foreground">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({cat.type === 'personal' ? 'P' : cat.type === 'business' ? 'B' : 'O'})
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{formatCurrency(cat.recurring)}/mo</p>
                    {cat.oneTime > 0 && (
                      <p className="text-xs text-muted-foreground">+{formatCurrency(cat.oneTime)} once</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <Receipt className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">No expenses tracked yet</p>
            <Link to="/expenses">
              <Button variant="outline" size="sm">Add Expenses</Button>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
