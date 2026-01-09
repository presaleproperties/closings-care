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
import { format, parseISO } from 'date-fns';
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

const YEAR = 2025;
const YEAR_START = new Date(YEAR, 0, 1);
const YEAR_END = new Date(YEAR, 11, 31);

export default function Dashboard2025Page() {
  const { data: allDeals = [] } = useDeals();
  const { data: allPayouts = [] } = usePayouts();
  const { data: allExpenses = [] } = useExpenses();
  const markPaid = useMarkPayoutPaid();

  // Filter data for 2025
  const deals = useMemo(() => 
    allDeals.filter(d => {
      const closeDate = d.close_date_actual || d.close_date_est || d.pending_date;
      if (!closeDate) return false;
      const date = parseISO(closeDate);
      return date.getFullYear() === YEAR;
    }), [allDeals]);

  const payouts = useMemo(() => 
    allPayouts.filter(p => {
      if (!p.due_date) return false;
      const date = parseISO(p.due_date);
      return date.getFullYear() === YEAR;
    }), [allPayouts]);

  const expenses = useMemo(() => 
    allExpenses.filter(e => e.month.startsWith(`${YEAR}`)), [allExpenses]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalPaid = payouts
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalExpected = payouts
      .filter((p) => p.status !== 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalExpenses = expenses
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const netIncome = totalPaid - totalExpenses;

    const grossCommission = deals.reduce((sum, d) => 
      sum + Number(d.gross_commission_actual || d.gross_commission_est || 0), 0);

    return {
      totalPaid,
      totalExpected,
      totalExpenses,
      netIncome,
      grossCommission,
      closedDeals: deals.filter((d) => d.status === 'CLOSED').length,
      pendingDeals: deals.filter((d) => d.status === 'PENDING').length,
      totalDeals: deals.length,
    };
  }, [deals, payouts, expenses]);

  // Monthly chart data for 2025
  const chartData = useMemo(() => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const monthStr = `${YEAR}-${String(i + 1).padStart(2, '0')}`;
      const monthLabel = format(new Date(YEAR, i, 1), 'MMM');

      const monthPayouts = payouts.filter((p) => 
        p.due_date?.startsWith(monthStr)
      );

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

  // Top payouts
  const topPayouts = useMemo(() => {
    return payouts
      .filter((p) => p.status === 'PAID')
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 8);
  }, [payouts]);

  return (
    <AppLayout>
      <Header 
        title="2025 Dashboard" 
        subtitle="Full year overview"
      />

      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Navigation tabs */}
        <div className="flex gap-2 flex-wrap">
          <Link to="/dashboard/2025">
            <Button variant="default" size="sm">2025</Button>
          </Link>
          <Link to="/dashboard/2026">
            <Button variant="outline" size="sm">2026</Button>
          </Link>
          <Link to="/dashboard/2027">
            <Button variant="outline" size="sm">2027</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="sm">Current</Button>
          </Link>
        </div>

        {/* Main KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Gross Commission"
            value={formatCurrency(kpis.grossCommission)}
            icon={<DollarSign className="w-4 h-4 text-success" />}
          />
          <KpiCard
            title="Total Paid"
            value={formatCurrency(kpis.totalPaid)}
            icon={<DollarSign className="w-4 h-4 text-accent" />}
          />
          <KpiCard
            title="Net Income"
            value={formatCurrency(kpis.netIncome)}
            trend={kpis.netIncome >= 0 ? 'up' : 'down'}
            icon={<TrendingUp className="w-4 h-4 text-accent" />}
          />
          <KpiCard
            title="Total Expenses"
            value={formatCurrency(kpis.totalExpenses)}
            icon={<FileText className="w-4 h-4 text-destructive" />}
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Closed Deals"
            value={String(kpis.closedDeals)}
            subtitle="completed"
          />
          <KpiCard
            title="Pending Deals"
            value={String(kpis.pendingDeals)}
            subtitle="in progress"
          />
          <KpiCard
            title="Total Deals"
            value={String(kpis.totalDeals)}
            subtitle="all year"
          />
          <KpiCard
            title="Still Expected"
            value={formatCurrency(kpis.totalExpected)}
            subtitle="pending payouts"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">2025 Monthly Breakdown</h3>
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

          {/* Top Payouts */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Top Payouts (2025)</h3>
              <Link to="/payouts" className="text-sm text-accent hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {topPayouts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No paid payouts in 2025
              </p>
            ) : (
              <div className="space-y-3">
                {topPayouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {payout.deal?.client_name || 'Unknown Deal'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payout.payout_type} • {formatDate(payout.paid_date || payout.due_date)}
                      </p>
                    </div>
                    <span className="font-semibold text-sm text-success">
                      {formatCurrency(payout.amount)}
                    </span>
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
