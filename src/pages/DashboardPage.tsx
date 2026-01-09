import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  FileText,
  ArrowRight,
  Check,
  Building2,
  Users,
  Clock,
  Sparkles
} from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { useDeals } from '@/hooks/useDeals';
import { usePayouts, useMarkPayoutPaid } from '@/hooks/usePayouts';
import { useExpenses } from '@/hooks/useExpenses';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const { data: deals = [] } = useDeals();
  const { data: payouts = [] } = usePayouts();
  const { data: expenses = [] } = useExpenses();
  const markPaid = useMarkPayoutPaid();

  const now = new Date();
  const currentYear = now.getFullYear();
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

    // Outstanding (all unpaid)
    const outstanding = payouts
      .filter((p) => p.status !== 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Total pipeline value
    const pipelineValue = deals
      .filter((d) => d.status === 'PENDING')
      .reduce((sum, d) => sum + (Number(d.net_commission_est) || 0), 0);

    // Current month expenses
    const thisMonthExpenses = expenses
      .filter((e) => e.month === currentMonth)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const netCashflow = paidThisMonth - thisMonthExpenses;

    // Total all-time
    const totalPaid = payouts
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      expectedThisMonth,
      paidThisMonth,
      expected3Months,
      expected12Months,
      outstanding,
      pipelineValue,
      thisMonthExpenses,
      netCashflow,
      totalPaid,
      activeDeals: deals.filter((d) => d.status === 'PENDING').length,
      closedDeals: deals.filter((d) => d.status === 'CLOSED').length,
      totalDeals: deals.length,
    };
  }, [deals, payouts, expenses, currentMonth]);

  // All payouts (including those without dates) - show recent/upcoming
  const allPayouts = useMemo(() => {
    return payouts
      .filter((p) => p.status !== 'PAID')
      .sort((a, b) => {
        // Sort by due_date if exists, otherwise by created_at
        const dateA = a.due_date ? new Date(a.due_date) : new Date(a.created_at);
        const dateB = b.due_date ? new Date(b.due_date) : new Date(b.created_at);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 6);
  }, [payouts]);

  // Recent deals
  const recentDeals = useMemo(() => {
    return deals.slice(0, 5);
  }, [deals]);

  // Chart data - next 6 months forecast
  const chartData = useMemo(() => {
    const months = [];
    for (let i = 0; i < 6; i++) {
      const monthDate = addMonths(now, i);
      const monthStr = format(monthDate, 'yyyy-MM');
      const monthLabel = format(monthDate, 'MMM yyyy');

      const monthPayouts = payouts.filter((p) => {
        if (!p.due_date) return false;
        return p.due_date.startsWith(monthStr);
      });

      const projected = monthPayouts
        .filter((p) => p.status !== 'PAID')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const paid = monthPayouts
        .filter((p) => p.status === 'PAID')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      months.push({
        month: monthLabel,
        projected,
        paid,
        total: projected + paid,
      });
    }
    return months;
  }, [payouts]);

  return (
    <AppLayout>
      <Header 
        title="Dashboard" 
        subtitle={format(now, 'EEEE, MMMM d, yyyy')}
      />

      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Year Navigation */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground mr-2">View Year:</span>
          <Link to="/dashboard/2025">
            <Button variant="outline" size="sm" className="h-8">2025</Button>
          </Link>
          <Link to="/dashboard/2026">
            <Button variant="outline" size="sm" className="h-8">2026</Button>
          </Link>
          <Link to="/dashboard/2027">
            <Button variant="outline" size="sm" className="h-8">2027</Button>
          </Link>
          <Link to="/dashboard">
            <Button size="sm" className="h-8 btn-premium">
              <Sparkles className="w-3 h-3 mr-1" />
              Current
            </Button>
          </Link>
        </div>

        {/* Hero KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pipeline Value */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 opacity-70" />
                <span className="text-sm opacity-70">Pipeline Value</span>
              </div>
              <p className="text-3xl font-bold">{formatCurrency(kpis.pipelineValue)}</p>
              <p className="text-sm opacity-70 mt-1">{kpis.activeDeals} pending deals</p>
            </div>
          </div>

          {/* Outstanding */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-accent to-accent/80 p-6 text-accent-foreground">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 opacity-70" />
                <span className="text-sm opacity-70">Outstanding</span>
              </div>
              <p className="text-3xl font-bold">{formatCurrency(kpis.outstanding)}</p>
              <p className="text-sm opacity-70 mt-1">Awaiting payment</p>
            </div>
          </div>

          {/* This Month */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">This Month</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(kpis.expectedThisMonth)}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">
                {formatCurrency(kpis.paidThisMonth)} paid
              </span>
            </div>
          </div>

          {/* Net Cashflow */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Net Cashflow</span>
            </div>
            <p className={`text-3xl font-bold ${kpis.netCashflow >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(kpis.netCashflow)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Income - Expenses ({format(now, 'MMM')})
            </p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <p className="text-xs text-muted-foreground mb-1">Next 3 Months</p>
            <p className="text-xl font-semibold">{formatCurrency(kpis.expected3Months)}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <p className="text-xs text-muted-foreground mb-1">Next 12 Months</p>
            <p className="text-xl font-semibold">{formatCurrency(kpis.expected12Months)}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Paid (All Time)</p>
            <p className="text-xl font-semibold">{formatCurrency(kpis.totalPaid)}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Deals</p>
            <p className="text-xl font-semibold">{kpis.totalDeals}</p>
            <p className="text-xs text-muted-foreground">{kpis.closedDeals} closed</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Forecast Chart */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-lg">6-Month Forecast</h3>
                <p className="text-sm text-muted-foreground">Projected commission income</p>
              </div>
              <Link to="/forecast">
                <Button variant="ghost" size="sm" className="text-accent">
                  View Details <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="projected" 
                    name="Projected"
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorProjected)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="paid" 
                    name="Paid"
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPaid)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Payouts */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Pending Payouts</h3>
                <p className="text-xs text-muted-foreground">{payouts.filter(p => p.status !== 'PAID').length} awaiting</p>
              </div>
              <Link to="/payouts">
                <Button variant="ghost" size="sm" className="text-accent h-8">
                  All <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>

            {allPayouts.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No pending payouts</p>
                <Link to="/deals/new">
                  <Button variant="link" size="sm" className="text-accent mt-2">
                    Create a deal
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {allPayouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {payout.deal?.client_name || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {payout.payout_type}
                        </span>
                        {payout.due_date ? (
                          <span className="text-xs text-muted-foreground">
                            • {formatDate(payout.due_date)}
                          </span>
                        ) : (
                          <span className="text-xs text-warning">• No date set</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {formatCurrency(payout.amount)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-success opacity-0 group-hover:opacity-100 transition-opacity"
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

        {/* Recent Deals */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">Recent Deals</h3>
              <p className="text-sm text-muted-foreground">Your latest transactions</p>
            </div>
            <Link to="/deals">
              <Button variant="ghost" size="sm" className="text-accent">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>

          {recentDeals.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No deals yet</p>
              <Link to="/deals/new">
                <Button variant="link" size="sm" className="text-accent mt-2">
                  Create your first deal
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">Client</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Property</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground">Commission</th>
                    <th className="text-center py-3 px-2 text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDeals.map((deal) => (
                    <tr key={deal.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-2">
                        <Link to={`/deals/${deal.id}`} className="font-medium text-sm hover:text-accent transition-colors">
                          {deal.client_name}
                        </Link>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          deal.property_type === 'PRESALE' 
                            ? 'bg-info/10 text-info' 
                            : 'bg-secondary text-secondary-foreground'
                        }`}>
                          {deal.property_type || deal.deal_type}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground hidden sm:table-cell truncate max-w-[200px]">
                        {deal.project_name || deal.address || deal.city || '-'}
                      </td>
                      <td className="py-3 px-2 text-right font-medium text-sm">
                        {formatCurrency(deal.net_commission_est || 0)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <StatusBadge status={deal.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}