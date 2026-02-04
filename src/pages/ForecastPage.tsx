import { useMemo, useState } from 'react';
import { format, parseISO, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, setMonth, setYear } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Table2,
  DollarSign,
  Wallet,
  PiggyBank,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { Button } from '@/components/ui/button';
import { usePayouts } from '@/hooks/usePayouts';
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
  const { data: expenses = [] } = useExpenses();
  const { data: properties = [] } = useProperties();
  const { data: settings } = useSettings();
  const refreshData = useRefreshData();

  const [view, setView] = useState<'chart' | 'table' | 'calendar'>('chart');
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 0, 1));
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  // Process all payouts with brokerage cap logic
  const payoutsWithCap = useMemo(() => {
    return calculatePayoutsWithBrokerageCap(payouts, settings);
  }, [payouts, settings]);

  // Generate forecast data from Jan 2026 through end of 2030
  const forecastData = useMemo(() => {
    const months = getExtendedMonthRange(48);
    
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

      const totalIncome = income + paid;
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
        expenses: totalExpenses,
        net,
        isSlowMonth,
        isWarningMonth,
      };
    });
  }, [payoutsWithCap, expenses, properties, settings]);

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

  // Calendar data
  const calendarDays = useMemo(() => {
    const start = startOfMonth(calendarMonth);
    const end = endOfMonth(calendarMonth);
    return eachDayOfInterval({ start, end });
  }, [calendarMonth]);

  const calendarPayouts = useMemo(() => {
    const monthStr = format(calendarMonth, 'yyyy-MM');
    return payouts.filter((p) => p.due_date?.startsWith(monthStr));
  }, [payouts, calendarMonth]);

  const getPayoutsForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return calendarPayouts.filter((p) => p.due_date === dayStr);
  };

  const calendarMonthData = useMemo(() => {
    const monthStr = format(calendarMonth, 'yyyy-MM');
    return filteredData.find(m => m.month === monthStr) || runningTotals.find(m => m.month === monthStr);
  }, [calendarMonth, filteredData, runningTotals]);

  return (
    <AppLayout>
      <Header 
        title="Forecast" 
        subtitle={selectedYear === 'all' ? 'Multi-Year Projection' : `${selectedYear} Financial Outlook`}
      />

      <PullToRefresh onRefresh={refreshData} className="min-h-[calc(100vh-56px)]">
        <motion.div 
          className="p-4 lg:p-6 space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Year Pills & View Toggle */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedYear('all')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                  selectedYear === 'all'
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                All Years
              </button>
              {availableYears.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                    selectedYear === year
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {year}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl">
              <button
                onClick={() => setView('chart')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  view === 'chart' 
                    ? "bg-background shadow-sm text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('table')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  view === 'table' 
                    ? "bg-background shadow-sm text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Table2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('calendar')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  view === 'calendar' 
                    ? "bg-background shadow-sm text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Summary Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Total Income */}
            <div className="landing-card p-4 lg:p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Income</span>
              </div>
              <AnimatedNumber
                value={totals.income}
                className="text-xl lg:text-2xl font-bold text-emerald-600"
                duration={1.2}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {filteredData.length} months
              </p>
            </div>

            {/* Total Expenses */}
            <div className="landing-card p-4 lg:p-5 bg-gradient-to-br from-rose-500/10 to-orange-500/5 border-rose-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-rose-500/20">
                  <Wallet className="w-3.5 h-3.5 text-rose-600" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Expenses</span>
              </div>
              <AnimatedNumber
                value={totals.expenses}
                className="text-xl lg:text-2xl font-bold text-rose-600"
                duration={1.2}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {formatCurrency(totals.expenses / Math.max(filteredData.length, 1))}/mo avg
              </p>
            </div>

            {/* Net Profit */}
            <div className={cn(
              "landing-card p-4 lg:p-5",
              totals.net >= 0 
                ? "bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20"
                : "bg-gradient-to-br from-destructive/10 to-rose-500/5 border-destructive/20"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  "p-1.5 rounded-lg",
                  totals.net >= 0 ? "bg-primary/20" : "bg-destructive/20"
                )}>
                  <PiggyBank className={cn(
                    "w-3.5 h-3.5",
                    totals.net >= 0 ? "text-primary" : "text-destructive"
                  )} />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Net Profit</span>
              </div>
              <AnimatedNumber
                value={totals.net}
                className={cn(
                  "text-xl lg:text-2xl font-bold",
                  totals.net >= 0 ? "text-primary" : "text-destructive"
                )}
                duration={1.2}
              />
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                {totals.net >= 0 ? <TrendingUp className="w-3 h-3 text-success" /> : <TrendingDown className="w-3 h-3 text-destructive" />}
                {formatCurrency(totals.avgMonthlyNet)}/mo avg
              </p>
            </div>

            {/* Slow Months Alert */}
            <div className={cn(
              "landing-card p-4 lg:p-5",
              totals.slowMonths > 0
                ? "bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20"
                : "bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  "p-1.5 rounded-lg",
                  totals.slowMonths > 0 ? "bg-amber-500/20" : "bg-emerald-500/20"
                )}>
                  <AlertTriangle className={cn(
                    "w-3.5 h-3.5",
                    totals.slowMonths > 0 ? "text-amber-600" : "text-emerald-600"
                  )} />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Cash Alerts</span>
              </div>
              <div className={cn(
                "text-xl lg:text-2xl font-bold",
                totals.slowMonths > 0 ? "text-amber-600" : "text-emerald-600"
              )}>
                {totals.slowMonths > 0 ? totals.slowMonths : '✓'}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {totals.slowMonths > 0 
                  ? `${totals.slowMonths} month${totals.slowMonths > 1 ? 's' : ''} negative`
                  : 'All months positive'
                }
              </p>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Chart View */}
            {view === 'chart' && (
              <motion.div
                key="chart"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="landing-card p-5 lg:p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-semibold">Cashflow Projection</h3>
                    <p className="text-xs text-muted-foreground">Income vs expenses over time</p>
                  </div>
                  {settings?.apply_tax_to_forecasts && (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {settings.tax_set_aside_percent}% tax included
                    </span>
                  )}
                </div>
                
                <div className="h-72 lg:h-80">
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
                          name === 'income' ? 'Income' : 'Expenses',
                        ]}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel}
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
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs text-muted-foreground">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-xs text-muted-foreground">Expenses</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Table View */}
            {view === 'table' && (
              <motion.div
                key="table"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="landing-card overflow-hidden"
              >
                <div className="p-4 border-b border-border">
                  <h3 className="text-sm font-semibold">Monthly Breakdown</h3>
                  <p className="text-xs text-muted-foreground">Detailed cashflow by month</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left text-[11px] font-semibold text-muted-foreground p-4 uppercase tracking-wider">Month</th>
                        <th className="text-right text-[11px] font-semibold text-muted-foreground p-4 uppercase tracking-wider">Income</th>
                        <th className="text-right text-[11px] font-semibold text-muted-foreground p-4 uppercase tracking-wider">Expenses</th>
                        <th className="text-right text-[11px] font-semibold text-muted-foreground p-4 uppercase tracking-wider">Net</th>
                        <th className="text-right text-[11px] font-semibold text-muted-foreground p-4 uppercase tracking-wider">Running Total</th>
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
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {month.isSlowMonth && (
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                              )}
                              {month.isWarningMonth && (
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                              )}
                              <span className="font-medium text-sm">{month.fullLabel}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-sm text-emerald-600 font-medium">{formatCurrency(month.income)}</span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-sm text-rose-600">{formatCurrency(month.expenses)}</span>
                          </td>
                          <td className="p-4 text-right">
                            <span className={cn(
                              "inline-flex items-center gap-1 text-sm font-semibold",
                              month.net >= 0 ? "text-emerald-600" : "text-rose-600"
                            )}>
                              {month.net >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {formatCurrency(month.net)}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <span className={cn(
                              "text-sm font-bold",
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
            )}

            {/* Calendar View */}
            {view === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Month Summary Card */}
                {calendarMonthData && (
                  <div className={cn(
                    "landing-card p-5",
                    calendarMonthData.isSlowMonth 
                      ? "bg-gradient-to-r from-rose-500/10 to-transparent border-rose-500/20"
                      : "bg-gradient-to-r from-emerald-500/10 to-transparent border-emerald-500/20"
                  )}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {format(calendarMonth, 'MMMM yyyy')} Overview
                        </p>
                        <p className={cn(
                          "text-2xl font-bold",
                          calendarMonthData.net >= 0 ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {formatCurrency(calendarMonthData.net)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          <span className="text-emerald-600">{formatCurrency(calendarMonthData.income)}</span> in
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <span className="text-rose-600">{formatCurrency(calendarMonthData.expenses)}</span> out
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="landing-card p-5 lg:p-6">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-xl"
                      onClick={() => setCalendarMonth((d) => addMonths(d, -1))}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <Select
                        value={calendarMonth.getMonth().toString()}
                        onValueChange={(value) => setCalendarMonth((d) => setMonth(d, parseInt(value)))}
                      >
                        <SelectTrigger className="w-[120px] h-9 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {format(new Date(2024, i, 1), 'MMMM')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={calendarMonth.getFullYear().toString()}
                        onValueChange={(value) => setCalendarMonth((d) => setYear(d, parseInt(value)))}
                      >
                        <SelectTrigger className="w-[90px] h-9 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2026, 2027, 2028, 2029, 2030].map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-xl"
                      onClick={() => setCalendarMonth((d) => addMonths(d, 1))}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-center text-[11px] font-semibold text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}

                    {Array.from({ length: startOfMonth(calendarMonth).getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {calendarDays.map((day) => {
                      const dayPayouts = getPayoutsForDay(day);
                      const hasPayouts = dayPayouts.length > 0;
                      const dayTotal = dayPayouts.reduce((sum, p) => sum + Number(p.amount), 0);

                      return (
                        <div
                          key={day.toISOString()}
                          className={cn(
                            "aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all",
                            isToday(day) && "bg-primary text-primary-foreground shadow-lg shadow-primary/25",
                            !isToday(day) && hasPayouts && "bg-emerald-500/10 hover:bg-emerald-500/20",
                            !isToday(day) && !hasPayouts && "hover:bg-muted/50"
                          )}
                        >
                          <span className={cn(
                            "font-medium",
                            !isSameMonth(day, calendarMonth) && "opacity-30"
                          )}>
                            {format(day, 'd')}
                          </span>
                          {hasPayouts && (
                            <span className={cn(
                              "text-[9px] font-semibold mt-0.5",
                              isToday(day) ? "text-primary-foreground/80" : "text-emerald-600"
                            )}>
                              +{formatCurrency(dayTotal).replace('$', '')}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary shadow-sm" />
                      <span className="text-xs text-muted-foreground">Today</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500/30" />
                      <span className="text-xs text-muted-foreground">Payout Day</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </PullToRefresh>
    </AppLayout>
  );
}
