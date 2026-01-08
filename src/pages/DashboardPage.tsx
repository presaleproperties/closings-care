import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  FileText,
  ArrowRight,
  Check
} from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { KpiCard } from '@/components/KpiCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { useDeals } from '@/hooks/useDeals';
import { usePayouts, useMarkPayoutPaid } from '@/hooks/usePayouts';
import { useExpenses } from '@/hooks/useExpenses';
import { formatCurrency, formatDate } from '@/lib/format';
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

export default function DashboardPage() {
  const { data: deals = [] } = useDeals();
  const { data: payouts = [] } = usePayouts();
  const { data: expenses = [] } = useExpenses();
  const markPaid = useMarkPayoutPaid();

  const now = new Date();
  const currentMonth = format(now, 'yyyy-MM');
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const thisMonthPayouts = payouts.filter((p) => {
      if (!p.due_date) return false;
      const date = parseISO(p.due_date);
      return isWithinInterval(date, { start: currentMonthStart, end: currentMonthEnd });
    });

    const expectedThisMonth = thisMonthPayouts
      .filter((p) => p.status !== 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const paidThisMonth = thisMonthPayouts
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Next 3 months
    const next3MonthsEnd = endOfMonth(addMonths(now, 3));
    const expected3Months = payouts
      .filter((p) => {
        if (!p.due_date || p.status === 'PAID') return false;
        const date = parseISO(p.due_date);
        return isWithinInterval(date, { start: now, end: next3MonthsEnd });
      })
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Next 12 months
    const next12MonthsEnd = endOfMonth(addMonths(now, 12));
    const expected12Months = payouts
      .filter((p) => {
        if (!p.due_date || p.status === 'PAID') return false;
        const date = parseISO(p.due_date);
        return isWithinInterval(date, { start: now, end: next12MonthsEnd });
      })
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Outstanding
    const outstanding = payouts
      .filter((p) => p.status !== 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Current month expenses
    const thisMonthExpenses = expenses
      .filter((e) => e.month === currentMonth)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const netCashflow = paidThisMonth - thisMonthExpenses;

    return {
      expectedThisMonth,
      paidThisMonth,
      expected3Months,
      expected12Months,
      outstanding,
      thisMonthExpenses,
      netCashflow,
      activeDeals: deals.filter((d) => d.status === 'PENDING').length,
      closedDeals: deals.filter((d) => d.status === 'CLOSED').length,
    };
  }, [deals, payouts, expenses, currentMonth]);

  // Upcoming payouts (next 60 days)
  const upcomingPayouts = useMemo(() => {
    const end = addMonths(now, 2);
    return payouts
      .filter((p) => {
        if (!p.due_date || p.status === 'PAID') return false;
        const date = parseISO(p.due_date);
        return isWithinInterval(date, { start: now, end });
      })
      .sort((a, b) => {
        if (!a.due_date || !b.due_date) return 0;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      })
      .slice(0, 8);
  }, [payouts]);

  // Chart data - last 6 months
  const chartData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = addMonths(now, -i);
      const monthStr = format(monthDate, 'yyyy-MM');
      const monthLabel = format(monthDate, 'MMM');

      const monthPayouts = payouts.filter((p) => {
        if (!p.due_date) return false;
        return p.due_date.startsWith(monthStr);
      });

      const expected = monthPayouts
        .filter((p) => p.status !== 'PAID')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const paid = monthPayouts
        .filter((p) => p.status === 'PAID')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const monthExpenses = expenses
        .filter((e) => e.month === monthStr)
        .reduce((sum, e) => sum + Number(e.amount), 0);

      months.push({
        month: monthLabel,
        expected,
        paid,
        expenses: monthExpenses,
        net: paid - monthExpenses,
      });
    }
    return months;
  }, [payouts, expenses]);

  return (
    <AppLayout>
      <Header 
        title="Dashboard" 
        subtitle={format(now, 'EEEE, MMMM d, yyyy')}
      />

      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Expected This Month"
            value={formatCurrency(kpis.expectedThisMonth)}
            icon={<Calendar className="w-4 h-4 text-accent" />}
          />
          <KpiCard
            title="Paid This Month"
            value={formatCurrency(kpis.paidThisMonth)}
            icon={<DollarSign className="w-4 h-4 text-success" />}
          />
          <KpiCard
            title="Net Cashflow"
            value={formatCurrency(kpis.netCashflow)}
            trend={kpis.netCashflow >= 0 ? 'up' : 'down'}
            icon={<TrendingUp className="w-4 h-4 text-accent" />}
          />
          <KpiCard
            title="Outstanding"
            value={formatCurrency(kpis.outstanding)}
            subtitle={`${kpis.activeDeals} pending deals`}
            icon={<FileText className="w-4 h-4 text-warning" />}
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Next 3 Months"
            value={formatCurrency(kpis.expected3Months)}
          />
          <KpiCard
            title="Next 12 Months"
            value={formatCurrency(kpis.expected12Months)}
          />
          <KpiCard
            title="Monthly Expenses"
            value={formatCurrency(kpis.thisMonthExpenses)}
          />
          <KpiCard
            title="Closed Deals"
            value={String(kpis.closedDeals)}
            subtitle="all time"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Monthly Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="paid" name="Paid" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expected" name="Expected" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Payouts */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Upcoming Payouts</h3>
              <Link to="/payouts" className="text-sm text-accent hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {upcomingPayouts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No upcoming payouts
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingPayouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {payout.deal?.client_name || 'Unknown Deal'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payout.payout_type} • {formatDate(payout.due_date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {formatCurrency(payout.amount)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-success hover:bg-success/10"
                        onClick={() => markPaid.mutate(payout.id)}
                        disabled={markPaid.isPending}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
