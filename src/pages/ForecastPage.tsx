import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Wallet,
  PiggyBank,
  AlertTriangle,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { usePayouts } from '@/hooks/usePayouts';
import { useRevenueShare } from '@/hooks/usePlatformConnections';
import { useExpenses } from '@/hooks/useExpenses';
import { useProperties } from '@/hooks/useProperties';
import { useSettings } from '@/hooks/useSettings';
import { useRefreshData } from '@/hooks/useRefreshData';
import { formatCurrency, getExtendedMonthRange } from '@/lib/format';
import { cn } from '@/lib/utils';
import { getTotalExpensesForMonth } from '@/lib/expenseCalculations';
import { calculatePayoutsWithBrokerageCap } from '@/lib/brokerageCapProjection';
import { AnimatedNumber } from '@/components/ui/animated-number';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function ForecastPage() {
  const { data: payouts = [] } = usePayouts();
  const { data: revenueShare = [] } = useRevenueShare();
  const { data: expenses = [] } = useExpenses();
  const { data: properties = [] } = useProperties();
  const { data: settings } = useSettings();
  const refreshData = useRefreshData();

  const [selectedYear, setSelectedYear] = useState<string>('2026');

  // Process all payouts with brokerage cap logic
  const payoutsWithCap = useMemo(() => {
    return calculatePayoutsWithBrokerageCap(payouts, settings);
  }, [payouts, settings]);

  // Generate forecast data from Jan 2026 through end of 2030
  const forecastData = useMemo(() => {
    const months = getExtendedMonthRange(48);

    // Pre-compute RevShare by month (period format is YYYY-MM)
    const revShareByMonth: Record<string, number> = {};
    revenueShare.forEach((r: any) => {
      const period = r.period; // "YYYY-MM"
      revShareByMonth[period] = (revShareByMonth[period] || 0) + Number(r.amount);
    });
    
    return months.map((monthStr) => {
      const monthPayoutsWithCap = payoutsWithCap.filter((p) => {
        if (!p.due_date) return false;
        return p.due_date.startsWith(monthStr);
      });

      const income = monthPayoutsWithCap
        .filter((p) => p.status !== 'PAID')
        .reduce((sum, p) => sum + p.netAmount, 0);

      const paid = monthPayoutsWithCap
        .filter((p) => p.status === 'PAID')
        .reduce((sum, p) => sum + p.netAmount, 0);

      const revShareIncome = revShareByMonth[monthStr] || 0;
      const totalIncome = income + paid + revShareIncome;
      const totalExpenses = getTotalExpensesForMonth(expenses, properties, monthStr);

      let adjustedIncome = totalIncome;
      if (settings?.apply_tax_to_forecasts && settings.tax_set_aside_percent) {
        adjustedIncome = totalIncome * (1 - settings.tax_set_aside_percent / 100);
      }

      const net = adjustedIncome - totalExpenses;
      const isSlowMonth = net < 0;
      const isWarningMonth = net >= 0 && net < totalExpenses * 0.2;

      return {
        month: monthStr,
        label: format(parseISO(`${monthStr}-01`), 'MMM'),
        shortYear: format(parseISO(`${monthStr}-01`), 'yy'),
        fullLabel: format(parseISO(`${monthStr}-01`), 'MMMM yyyy'),
        income: totalIncome,
        revShare: revShareIncome,
        expenses: totalExpenses,
        net,
        isSlowMonth,
        isWarningMonth,
      };
    });
  }, [payoutsWithCap, revenueShare, expenses, properties, settings]);

  // Running totals
  const runningTotals = useMemo(() => {
    let cumulative = 0;
    return forecastData.map((month) => {
      cumulative += month.net;
      return { ...month, cumulative };
    });
  }, [forecastData]);

  // Filter by year if selected
  const filteredData = useMemo(() => {
    if (selectedYear === 'all') return runningTotals;
    return runningTotals.filter(m => m.month.startsWith(selectedYear));
  }, [runningTotals, selectedYear]);

  // Summary stats for filtered data
  const totals = useMemo(() => {
    const income = filteredData.reduce((s, m) => s + m.income, 0);
    const expenses = filteredData.reduce((s, m) => s + m.expenses, 0);
    const net = filteredData.reduce((s, m) => s + m.net, 0);
    const slowMonths = filteredData.filter(m => m.isSlowMonth).length;
    const avgMonthlyNet = filteredData.length > 0 ? net / filteredData.length : 0;
    return { income, expenses, net, slowMonths, avgMonthlyNet };
  }, [filteredData]);

  // Get unique years from forecast data
  const availableYears = useMemo(() => {
    const years = new Set(forecastData.map(m => m.month.substring(0, 4)));
    return Array.from(years).sort();
  }, [forecastData]);

  return (
    <AppLayout>
      <Header 
        title="Forecast" 
        subtitle={selectedYear === 'all' ? 'Multi-Year Projection' : `${selectedYear} Financial Outlook`}
      />

      <PullToRefresh onRefresh={refreshData} className="min-h-[calc(100vh-56px)]">
        <motion.div 
          className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Year Pills */}
          <motion.div variants={itemVariants} className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedYear('all')}
              className={cn(
                "px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap",
                selectedYear === 'all'
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              All
            </button>
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={cn(
                  "px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap",
                  selectedYear === year
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {year}
              </button>
            ))}
          </motion.div>

          {/* Summary Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {/* Total Income */}
            <div className="landing-card p-3 sm:p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20">
              <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
                <div className="p-1 sm:p-1.5 rounded-lg bg-emerald-500/20">
                  <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Income</span>
              </div>
              <AnimatedNumber
                value={totals.income}
                className="text-base sm:text-lg lg:text-xl font-bold text-emerald-600"
                duration={1.2}
              />
              <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">
                Commissions + RevShare
              </p>
            </div>

            {/* Total Expenses */}
            <div className="landing-card p-3 sm:p-4 bg-gradient-to-br from-rose-500/10 to-orange-500/5 border-rose-500/20">
              <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
                <div className="p-1 sm:p-1.5 rounded-lg bg-rose-500/20">
                  <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Expenses</span>
              </div>
              <AnimatedNumber
                value={totals.expenses}
                className="text-base sm:text-lg lg:text-xl font-bold text-rose-600"
                duration={1.2}
              />
              <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">
                {formatCurrency(totals.expenses / Math.max(filteredData.length, 1))}/mo
              </p>
            </div>

            {/* Net Profit */}
            <div className={cn(
              "landing-card p-3 sm:p-4",
              totals.net >= 0 
                ? "bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20"
                : "bg-gradient-to-br from-destructive/10 to-rose-500/5 border-destructive/20"
            )}>
              <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
                <div className={cn(
                  "p-1 sm:p-1.5 rounded-lg",
                  totals.net >= 0 ? "bg-primary/20" : "bg-destructive/20"
                )}>
                  <PiggyBank className={cn(
                    "w-3 h-3 sm:w-3.5 sm:h-3.5",
                    totals.net >= 0 ? "text-primary" : "text-destructive"
                  )} />
                </div>
                <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Net</span>
              </div>
              <AnimatedNumber
                value={totals.net}
                className={cn(
                  "text-base sm:text-lg lg:text-xl font-bold",
                  totals.net >= 0 ? "text-primary" : "text-destructive"
                )}
                duration={1.2}
              />
              <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                {totals.net >= 0 ? <TrendingUp className="w-2.5 h-2.5 text-success" /> : <TrendingDown className="w-2.5 h-2.5 text-destructive" />}
                {formatCurrency(totals.avgMonthlyNet)}/mo
              </p>
            </div>

            {/* Slow Months Alert */}
            <div className={cn(
              "landing-card p-3 sm:p-4",
              totals.slowMonths > 0
                ? "bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20"
                : "bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20"
            )}>
              <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
                <div className={cn(
                  "p-1 sm:p-1.5 rounded-lg",
                  totals.slowMonths > 0 ? "bg-amber-500/20" : "bg-emerald-500/20"
                )}>
                  <AlertTriangle className={cn(
                    "w-3 h-3 sm:w-3.5 sm:h-3.5",
                    totals.slowMonths > 0 ? "text-amber-600" : "text-emerald-600"
                  )} />
                </div>
                <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Alerts</span>
              </div>
              <div className={cn(
                "text-base sm:text-lg lg:text-xl font-bold",
                totals.slowMonths > 0 ? "text-amber-600" : "text-emerald-600"
              )}>
                {totals.slowMonths > 0 ? totals.slowMonths : '✓'}
              </div>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">
                {totals.slowMonths > 0 ? `${totals.slowMonths} negative` : 'All positive'}
              </p>
            </div>
          </motion.div>

          {/* Chart */}
          <motion.div
            variants={itemVariants}
            className="landing-card p-3 sm:p-4 lg:p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold">Cashflow</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Income vs expenses</p>
              </div>
              {settings?.apply_tax_to_forecasts && (
                <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {settings.tax_set_aside_percent}% tax
                </span>
              )}
            </div>
            
            <div className="h-48 sm:h-60 lg:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                    interval={selectedYear === 'all' ? 5 : 0}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10}
                    tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === 'income' ? 'Income (Commissions + RevShare)' : 'Expenses',
                    ]}
                    labelFormatter={(_, payload) => {
                      const d = payload?.[0]?.payload;
                      if (!d) return '';
                      const revNote = d.revShare > 0 ? ` (incl. ${formatCurrency(d.revShare)} RevShare)` : '';
                      return `${d.fullLabel}${revNote}`;
                    }}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--border))" />
                  <Area 
                    type="monotone"
                    dataKey="income" 
                    stroke="hsl(160, 84%, 39%)" 
                    strokeWidth={2}
                    fill="url(#incomeGradient)"
                  />
                  <Area 
                    type="monotone"
                    dataKey="expenses" 
                    stroke="hsl(0, 84%, 60%)" 
                    strokeWidth={2}
                    fill="url(#expenseGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] sm:text-xs text-muted-foreground">Income (Commissions + RevShare)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500" />
                <span className="text-[10px] sm:text-xs text-muted-foreground">Expenses</span>
              </div>
            </div>
          </motion.div>

          {/* Monthly Breakdown Table */}
          <motion.div
            variants={itemVariants}
            className="landing-card overflow-hidden"
          >
            <div className="p-3 sm:p-4 border-b border-border">
              <h3 className="text-xs sm:text-sm font-semibold">Monthly Breakdown</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Detailed cashflow</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-[9px] sm:text-[11px] font-semibold text-muted-foreground p-2 sm:p-3 uppercase tracking-wider">Month</th>
                    <th className="text-right text-[9px] sm:text-[11px] font-semibold text-muted-foreground p-2 sm:p-3 uppercase tracking-wider">Income</th>
                    <th className="text-right text-[9px] sm:text-[11px] font-semibold text-muted-foreground p-2 sm:p-3 uppercase tracking-wider">Expenses</th>
                    <th className="text-right text-[9px] sm:text-[11px] font-semibold text-muted-foreground p-2 sm:p-3 uppercase tracking-wider">Net</th>
                    <th className="text-right text-[9px] sm:text-[11px] font-semibold text-muted-foreground p-2 sm:p-3 uppercase tracking-wider hidden sm:table-cell">Running</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((month) => (
                    <tr 
                      key={month.month} 
                      className={cn(
                        "border-b border-border/50 transition-colors",
                        month.isSlowMonth && "bg-rose-500/5",
                        month.isWarningMonth && "bg-amber-500/5",
                        month.month === format(new Date(), 'yyyy-MM') && "bg-primary/5"
                      )}
                    >
                      <td className="p-2 sm:p-3">
                        <div className="flex items-center gap-1">
                          {month.isSlowMonth && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          )}
                          {month.isWarningMonth && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          )}
                          <span className="font-medium text-[11px] sm:text-sm">{month.label} '{month.shortYear}</span>
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 text-right">
                        <span className="text-[11px] sm:text-sm text-emerald-600 font-medium">{formatCurrency(month.income)}</span>
                      </td>
                      <td className="p-2 sm:p-3 text-right">
                        <span className="text-[11px] sm:text-sm text-rose-600">{formatCurrency(month.expenses)}</span>
                      </td>
                      <td className="p-2 sm:p-3 text-right">
                        <span className={cn(
                          "inline-flex items-center gap-0.5 text-[11px] sm:text-sm font-semibold",
                          month.net >= 0 ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {formatCurrency(month.net)}
                        </span>
                      </td>
                      <td className="p-2 sm:p-3 text-right hidden sm:table-cell">
                        <span className={cn(
                          "text-[11px] sm:text-sm font-bold",
                          month.cumulative >= 0 ? "text-primary" : "text-destructive"
                        )}>
                          {formatCurrency(month.cumulative)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </PullToRefresh>
    </AppLayout>
  );
}
