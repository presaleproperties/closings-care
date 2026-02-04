import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Receipt, Home, Briefcase, RefreshCw, Calendar, TrendingDown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

const springConfig = { type: "spring" as const, stiffness: 120, damping: 20 };

const getExpenseType = (category: string): 'personal' | 'business' | 'rental' | 'other' => {
  if (category.startsWith('Personal -')) return 'personal';
  if (category.startsWith('Business -')) return 'business';
  if (category.startsWith('Rental -')) return 'rental';
  return 'other';
};

const typeConfig = {
  personal: { 
    color: 'hsl(217, 91%, 60%)', // blue
    icon: Home, 
    label: 'Personal',
    gradient: 'from-blue-500/15 to-blue-500/5',
    border: 'border-blue-500/25',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-500',
    badge: 'P'
  },
  business: { 
    color: 'hsl(262, 83%, 58%)', // violet
    icon: Briefcase, 
    label: 'Business',
    gradient: 'from-violet-500/15 to-violet-500/5',
    border: 'border-violet-500/25',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-500',
    badge: 'B'
  },
  rental: { 
    color: 'hsl(38, 92%, 50%)', // amber
    icon: Building2, 
    label: 'Rental',
    gradient: 'from-amber-500/15 to-amber-500/5',
    border: 'border-amber-500/25',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-500',
    badge: 'R'
  },
  other: { 
    color: 'hsl(var(--muted-foreground))',
    icon: Receipt, 
    label: 'Other',
    gradient: 'from-muted/50 to-muted/20',
    border: 'border-border/50',
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
    badge: 'O'
  },
};

export function ExpenseAnalytics({ expenses }: ExpenseAnalyticsProps) {
  const analytics = useMemo(() => {
    const calculateMonthlyAmount = (e: Expense) => {
      if (e.recurrence === 'weekly') return Number(e.amount) * 4.33;
      return Number(e.amount);
    };

    const breakdown = {
      personal: { recurring: 0, oneTime: 0 },
      business: { recurring: 0, oneTime: 0 },
      rental: { recurring: 0, oneTime: 0 },
      other: { recurring: 0, oneTime: 0 },
    };

    const byCategory = new Map<string, { 
      recurring: number; 
      oneTime: number; 
      type: 'personal' | 'business' | 'rental' | 'other';
    }>();

    expenses.forEach(e => {
      const type = getExpenseType(e.category);
      const isOneTime = e.recurrence === 'one-time';
      const amount = isOneTime ? Number(e.amount) : calculateMonthlyAmount(e);

      if (isOneTime) {
        breakdown[type].oneTime += amount;
      } else {
        breakdown[type].recurring += amount;
      }

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
        name: name.replace(/^(Personal|Business|Rental) - /, ''),
        fullName: name,
        recurring: data.recurring,
        oneTime: data.oneTime,
        total: data.recurring + data.oneTime,
        type: data.type,
      }))
      .sort((a, b) => b.total - a.total);

    const totalPersonalRecurring = breakdown.personal.recurring;
    const totalBusinessRecurring = breakdown.business.recurring;
    const totalRentalRecurring = breakdown.rental.recurring;
    const totalOtherRecurring = breakdown.other.recurring;
    const totalRecurring = totalPersonalRecurring + totalBusinessRecurring + totalRentalRecurring + totalOtherRecurring;
    
    const totalPersonalOneTime = breakdown.personal.oneTime;
    const totalBusinessOneTime = breakdown.business.oneTime;
    const totalRentalOneTime = breakdown.rental.oneTime;
    const totalOtherOneTime = breakdown.other.oneTime;
    const totalOneTime = totalPersonalOneTime + totalBusinessOneTime + totalRentalOneTime + totalOtherOneTime;

    const typeChartData: Array<{
      name: string;
      type: 'personal' | 'business' | 'rental' | 'other';
      recurring: number;
      oneTime: number;
      total: number;
    }> = [
      { 
        name: 'Personal', 
        type: 'personal',
        recurring: totalPersonalRecurring, 
        oneTime: totalPersonalOneTime,
        total: totalPersonalRecurring + totalPersonalOneTime,
      },
      { 
        name: 'Business', 
        type: 'business',
        recurring: totalBusinessRecurring, 
        oneTime: totalBusinessOneTime,
        total: totalBusinessRecurring + totalBusinessOneTime,
      },
    ];

    if (totalRentalRecurring + totalRentalOneTime > 0) {
      typeChartData.push({
        name: 'Rental',
        type: 'rental',
        recurring: totalRentalRecurring,
        oneTime: totalRentalOneTime,
        total: totalRentalRecurring + totalRentalOneTime,
      });
    }

    if (totalOtherRecurring + totalOtherOneTime > 0) {
      typeChartData.push({
        name: 'Other',
        type: 'other',
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

  return (
    <motion.div 
      className="landing-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfig}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-border/50 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-transparent">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
          >
            <Receipt className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h3 className="font-bold text-base">Expense Analytics</h3>
            <p className="text-xs text-muted-foreground">Personal vs Business breakdown</p>
          </div>
        </div>
        <Link to="/expenses">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-medium">
            Manage <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="p-5 space-y-4">
        {/* Summary Stats - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Personal */}
          <motion.div 
            className={cn(
              "p-3.5 rounded-xl border bg-gradient-to-br",
              typeConfig.personal.gradient, typeConfig.personal.border
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...springConfig, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", typeConfig.personal.iconBg)}>
                <Home className={cn("h-3.5 w-3.5", typeConfig.personal.iconColor)} />
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Personal</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(analytics.breakdown.personal.recurring)}</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
              <RefreshCw className="h-2.5 w-2.5" /> /mo
            </p>
          </motion.div>

          {/* Business */}
          <motion.div 
            className={cn(
              "p-3.5 rounded-xl border bg-gradient-to-br",
              typeConfig.business.gradient, typeConfig.business.border
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...springConfig, delay: 0.15 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", typeConfig.business.iconBg)}>
                <Briefcase className={cn("h-3.5 w-3.5", typeConfig.business.iconColor)} />
              </div>
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">Business</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(analytics.breakdown.business.recurring)}</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
              <RefreshCw className="h-2.5 w-2.5" /> /mo
            </p>
          </motion.div>

          {/* Total Recurring */}
          <motion.div 
            className="p-3.5 rounded-xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...springConfig, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 flex items-center justify-center">
                <RefreshCw className="h-3.5 w-3.5 text-rose-500" />
              </div>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Total Recurring</span>
            </div>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(analytics.totalRecurring)}</p>
            <p className="text-[10px] text-muted-foreground">/month</p>
          </motion.div>

          {/* One-Time */}
          <motion.div 
            className="p-3.5 rounded-xl bg-card/80 border border-border/50"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...springConfig, delay: 0.25 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">One-Time</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(analytics.totalOneTime)}</p>
            <p className="text-[10px] text-muted-foreground">this period</p>
          </motion.div>
        </div>

        {/* Chart */}
        {analytics.typeChartData.length > 0 && analytics.totalRecurring > 0 ? (
          <>
            <motion.div 
              className="h-28 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.typeChartData} layout="vertical" barGap={4}>
                  <XAxis 
                    type="number" 
                    fontSize={10}
                    tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
                    stroke="hsl(var(--muted-foreground))"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    fontSize={11}
                    width={65}
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      name === 'recurring' ? 'Monthly' : 'One-Time'
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  />
                  <Bar dataKey="recurring" radius={[0, 6, 6, 0]} stackId="stack">
                    {analytics.typeChartData.map((entry, index) => (
                      <Cell 
                        key={`recurring-${index}`} 
                        fill={typeConfig[entry.type].color}
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="oneTime" radius={[0, 6, 6, 0]} stackId="stack" opacity={0.4}>
                    {analytics.typeChartData.map((entry, index) => (
                      <Cell 
                        key={`onetime-${index}`} 
                        fill={typeConfig[entry.type].color}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                <span className="text-muted-foreground">Personal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-violet-500" />
                <span className="text-muted-foreground">Business</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-muted-foreground/40" />
                <span className="text-muted-foreground">One-time</span>
              </div>
            </div>

            {/* Top Categories */}
            <motion.div 
              className="space-y-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Top Categories</p>
              <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-hide">
                {analytics.categoryData.slice(0, 5).map((cat, index) => {
                  const config = typeConfig[cat.type];
                  return (
                    <motion.div 
                      key={cat.fullName} 
                      className="flex items-center justify-between p-2.5 rounded-xl bg-card/50 border border-border/30 hover:border-border/60 transition-all group"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...springConfig, delay: 0.45 + index * 0.03 }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="text-sm font-medium">{cat.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground font-medium">
                          {config.badge}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatCurrency(cat.recurring)}/mo</p>
                        {cat.oneTime > 0 && (
                          <p className="text-[10px] text-muted-foreground">+{formatCurrency(cat.oneTime)} once</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div 
            className="text-center py-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfig}
          >
            <motion.div 
              className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center border border-violet-500/20"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <TrendingDown className="h-6 w-6 text-violet-400" />
            </motion.div>
            <p className="text-sm font-semibold mb-1">No expenses tracked yet</p>
            <p className="text-xs text-muted-foreground mb-4">Add expenses to see analytics</p>
            <Link to="/expenses">
              <Button variant="outline" size="sm" className="rounded-xl">Add Expenses</Button>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
