import { useMemo } from 'react';
import { format, parseISO, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePayouts } from '@/hooks/usePayouts';
import { useExpenses } from '@/hooks/useExpenses';
import { useSettings } from '@/hooks/useSettings';
import { formatCurrency, getCurrentMonth, getMonthRange } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function ForecastPage() {
  const { data: payouts = [] } = usePayouts();
  const { data: expenses = [] } = useExpenses();
  const { data: settings } = useSettings();

  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Generate forecast data for next 12 months
  const forecastData = useMemo(() => {
    const months = getMonthRange(0, 12);
    
    return months.map((monthStr) => {
      const monthPayouts = payouts.filter((p) => {
        if (!p.due_date) return false;
        return p.due_date.startsWith(monthStr);
      });

      const projected = monthPayouts
        .filter((p) => p.status === 'PROJECTED')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const invoiced = monthPayouts
        .filter((p) => p.status === 'INVOICED')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const paid = monthPayouts
        .filter((p) => p.status === 'PAID')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const totalExpected = projected + invoiced + paid;

      const monthExpenses = expenses
        .filter((e) => e.month === monthStr)
        .reduce((sum, e) => sum + Number(e.amount), 0);

      let adjustedExpected = totalExpected;
      if (settings?.apply_tax_to_forecasts && settings.tax_set_aside_percent) {
        adjustedExpected = totalExpected * (1 - settings.tax_set_aside_percent / 100);
      }

      const netCashflow = adjustedExpected - monthExpenses;

      return {
        month: monthStr,
        label: format(parseISO(`${monthStr}-01`), 'MMM yyyy'),
        projected,
        invoiced,
        paid,
        totalExpected,
        expenses: monthExpenses,
        adjustedExpected,
        netCashflow,
      };
    });
  }, [payouts, expenses, settings]);

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

  // Running totals
  const runningTotals = useMemo(() => {
    let cumulativeNet = 0;
    return forecastData.map((month) => {
      cumulativeNet += month.netCashflow;
      return { ...month, cumulativeNet };
    });
  }, [forecastData]);

  return (
    <AppLayout>
      <Header 
        title="Forecast" 
        subtitle="12-month cashflow projection"
      />

      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <Tabs defaultValue="table">
          <TabsList>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          {/* Table View */}
          <TabsContent value="table" className="mt-6">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr className="bg-muted/50">
                      <th>Month</th>
                      <th className="text-right">Projected</th>
                      <th className="text-right">Invoiced</th>
                      <th className="text-right">Paid</th>
                      <th className="text-right">Total Expected</th>
                      <th className="text-right">Expenses</th>
                      <th className="text-right">Net Cashflow</th>
                      <th className="text-right">Cumulative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runningTotals.map((month) => (
                      <tr key={month.month}>
                        <td className="font-medium">{month.label}</td>
                        <td className="text-right text-muted-foreground">
                          {formatCurrency(month.projected)}
                        </td>
                        <td className="text-right text-info">
                          {formatCurrency(month.invoiced)}
                        </td>
                        <td className="text-right text-success">
                          {formatCurrency(month.paid)}
                        </td>
                        <td className="text-right font-medium">
                          {formatCurrency(month.totalExpected)}
                        </td>
                        <td className="text-right text-destructive">
                          {formatCurrency(month.expenses)}
                        </td>
                        <td className={cn(
                          'text-right font-semibold',
                          month.netCashflow >= 0 ? 'text-success' : 'text-destructive'
                        )}>
                          {formatCurrency(month.netCashflow)}
                        </td>
                        <td className={cn(
                          'text-right font-semibold',
                          month.cumulativeNet >= 0 ? 'text-success' : 'text-destructive'
                        )}>
                          {formatCurrency(month.cumulativeNet)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/50 font-semibold">
                      <td>Total (12 mo)</td>
                      <td className="text-right">
                        {formatCurrency(runningTotals.reduce((s, m) => s + m.projected, 0))}
                      </td>
                      <td className="text-right">
                        {formatCurrency(runningTotals.reduce((s, m) => s + m.invoiced, 0))}
                      </td>
                      <td className="text-right">
                        {formatCurrency(runningTotals.reduce((s, m) => s + m.paid, 0))}
                      </td>
                      <td className="text-right">
                        {formatCurrency(runningTotals.reduce((s, m) => s + m.totalExpected, 0))}
                      </td>
                      <td className="text-right">
                        {formatCurrency(runningTotals.reduce((s, m) => s + m.expenses, 0))}
                      </td>
                      <td className="text-right">
                        {formatCurrency(runningTotals.reduce((s, m) => s + m.netCashflow, 0))}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {settings?.apply_tax_to_forecasts && (
              <p className="text-sm text-muted-foreground mt-2">
                * Net calculations include {settings.tax_set_aside_percent}% tax set-aside
              </p>
            )}
          </TabsContent>

          {/* Calendar View */}
          <TabsContent value="calendar" className="mt-6">
            <div className="bg-card border border-border rounded-lg p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <Button variant="outline" size="icon" onClick={() => setCalendarMonth((d) => addMonths(d, -1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <h2 className="text-lg font-semibold">
                  {format(calendarMonth, 'MMMM yyyy')}
                </h2>

                <Button variant="outline" size="icon" onClick={() => setCalendarMonth((d) => addMonths(d, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Weekday Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}

                {/* Empty cells for days before month start */}
                {Array.from({ length: startOfMonth(calendarMonth).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[80px]" />
                ))}

                {/* Days */}
                {calendarDays.map((day) => {
                  const dayPayouts = getPayoutsForDay(day);
                  const dayTotal = dayPayouts.reduce((sum, p) => sum + Number(p.amount), 0);

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        'min-h-[80px] p-2 border border-border rounded-lg',
                        isToday(day) && 'border-accent bg-accent/5',
                        !isSameMonth(day, calendarMonth) && 'opacity-50'
                      )}
                    >
                      <div className={cn(
                        'text-sm font-medium mb-1',
                        isToday(day) && 'text-accent'
                      )}>
                        {format(day, 'd')}
                      </div>
                      
                      {dayPayouts.length > 0 && (
                        <div className="space-y-1">
                          {dayPayouts.slice(0, 2).map((payout) => (
                            <div
                              key={payout.id}
                              className={cn(
                                'text-xs px-1.5 py-0.5 rounded truncate',
                                payout.status === 'PAID' && 'bg-success/10 text-success',
                                payout.status === 'INVOICED' && 'bg-info/10 text-info',
                                payout.status === 'PROJECTED' && 'bg-muted text-muted-foreground'
                              )}
                            >
                              {formatCurrency(payout.amount)}
                            </div>
                          ))}
                          {dayPayouts.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayPayouts.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-6 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-success/20 border border-success" />
                  <span className="text-sm">Paid</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-info/20 border border-info" />
                  <span className="text-sm">Invoiced</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-muted border border-border" />
                  <span className="text-sm">Projected</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
