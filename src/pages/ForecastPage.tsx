import { useMemo, useState } from 'react';
import { format, parseISO, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { usePayouts } from '@/hooks/usePayouts';
import { useExpenses } from '@/hooks/useExpenses';
import { useProperties } from '@/hooks/useProperties';
import { useSettings } from '@/hooks/useSettings';
import { formatCurrency, getMonthRange } from '@/lib/format';
import { cn } from '@/lib/utils';
import { getTotalExpensesForMonth } from '@/lib/expenseCalculations';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function ForecastPage() {
  const { data: payouts = [] } = usePayouts();
  const { data: expenses = [] } = useExpenses();
  const { data: properties = [] } = useProperties();
  const { data: settings } = useSettings();

  const [view, setView] = useState<'table' | 'calendar'>('table');
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Generate forecast data for next 12 months
  const forecastData = useMemo(() => {
    const months = getMonthRange(0, 12);
    
    return months.map((monthStr) => {
      const monthPayouts = payouts.filter((p) => {
        if (!p.due_date) return false;
        return p.due_date.startsWith(monthStr);
      });

      const income = monthPayouts
        .filter((p) => p.status !== 'PAID')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const paid = monthPayouts
        .filter((p) => p.status === 'PAID')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const totalIncome = income + paid;

      // Calculate expenses for this specific month (includes property costs)
      const totalExpenses = getTotalExpensesForMonth(expenses, properties, monthStr);

      let adjustedIncome = totalIncome;
      if (settings?.apply_tax_to_forecasts && settings.tax_set_aside_percent) {
        adjustedIncome = totalIncome * (1 - settings.tax_set_aside_percent / 100);
      }

      const net = adjustedIncome - totalExpenses;

      return {
        month: monthStr,
        label: format(parseISO(`${monthStr}-01`), 'MMM'),
        fullLabel: format(parseISO(`${monthStr}-01`), 'MMMM yyyy'),
        income: totalIncome,
        expenses: totalExpenses,
        net,
      };
    });
  }, [payouts, expenses, properties, settings]);

  // Running totals
  const runningTotals = useMemo(() => {
    let cumulative = 0;
    return forecastData.map((month) => {
      cumulative += month.net;
      return { ...month, cumulative };
    });
  }, [forecastData]);

  // Summary stats
  const totals = useMemo(() => ({
    income: runningTotals.reduce((s, m) => s + m.income, 0),
    expenses: runningTotals.reduce((s, m) => s + m.expenses, 0),
    net: runningTotals.reduce((s, m) => s + m.net, 0),
  }), [runningTotals]);

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

  return (
    <AppLayout>
      <Header 
        title="Forecast" 
        subtitle="12-month projection"
      />

      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-card border border-border p-5">
            <p className="text-xs text-muted-foreground mb-1">12-Month Income</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(totals.income)}</p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-5">
            <p className="text-xs text-muted-foreground mb-1">12-Month Expenses</p>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(totals.expenses)}</p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-5">
            <p className="text-xs text-muted-foreground mb-1">Net Projection</p>
            <p className={cn("text-2xl font-bold", totals.net >= 0 ? "text-primary" : "text-destructive")}>
              {formatCurrency(totals.net)}
            </p>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="rounded-2xl bg-card border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Monthly Income vs Expenses</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={runningTotals} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'income' ? 'Income' : 'Expenses',
                  ]}
                  labelFormatter={(label) => runningTotals.find(m => m.label === label)?.fullLabel}
                />
                <Legend 
                  formatter={(value) => value === 'income' ? 'Income' : 'Expenses'}
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Bar 
                  dataKey="income" 
                  fill="hsl(142, 76%, 36%)" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar 
                  dataKey="expenses" 
                  fill="hsl(0, 84%, 60%)" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <Button 
            variant={view === 'table' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setView('table')}
          >
            Table
          </Button>
          <Button 
            variant={view === 'calendar' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setView('calendar')}
          >
            Calendar
          </Button>
        </div>

        {/* Table View */}
        {view === 'table' && (
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Month</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-4">Income</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-4">Expenses</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-4">Net</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-4">Cumulative</th>
                  </tr>
                </thead>
                <tbody>
                  {runningTotals.map((month, i) => (
                    <tr key={month.month} className={cn(
                      "border-b border-border/50 hover:bg-muted/30 transition-colors",
                      i === 0 && "bg-accent/5"
                    )}>
                      <td className="p-4">
                        <span className="font-medium">{month.fullLabel}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-success">{formatCurrency(month.income)}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-destructive">{formatCurrency(month.expenses)}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className={cn(
                          "inline-flex items-center gap-1 font-medium",
                          month.net >= 0 ? "text-success" : "text-destructive"
                        )}>
                          {month.net >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {formatCurrency(month.net)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className={cn(
                          "font-semibold",
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
          </div>
        )}

        {/* Calendar View */}
        {view === 'calendar' && (
          <div className="rounded-2xl bg-card border border-border p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setCalendarMonth((d) => addMonths(d, -1))}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <h2 className="text-lg font-semibold">
                {format(calendarMonth, 'MMMM yyyy')}
              </h2>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setCalendarMonth((d) => addMonths(d, 1))}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Weekday Headers */}
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-center text-xs font-medium text-muted-foreground py-3">
                  {day}
                </div>
              ))}

              {/* Empty cells */}
              {Array.from({ length: startOfMonth(calendarMonth).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days */}
              {calendarDays.map((day) => {
                const dayPayouts = getPayoutsForDay(day);
                const hasPayouts = dayPayouts.length > 0;
                const dayTotal = dayPayouts.reduce((sum, p) => sum + Number(p.amount), 0);

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-colors",
                      isToday(day) && "bg-primary text-primary-foreground",
                      !isToday(day) && hasPayouts && "bg-success/10",
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
                        "text-[10px] font-medium mt-0.5",
                        isToday(day) ? "text-primary-foreground/80" : "text-success"
                      )}>
                        {formatCurrency(dayTotal).replace('$', '')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success/30" />
                <span className="text-xs text-muted-foreground">Payout Expected</span>
              </div>
            </div>
          </div>
        )}

        {settings?.apply_tax_to_forecasts && (
          <p className="text-xs text-muted-foreground">
            * Includes {settings.tax_set_aside_percent}% tax set-aside
          </p>
        )}
      </div>
    </AppLayout>
  );
}