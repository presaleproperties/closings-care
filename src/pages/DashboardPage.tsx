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
  Sparkles,
  CalendarDays,
  Wallet
} from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO, differenceInDays } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { useDeals } from '@/hooks/useDeals';
import { usePayouts, useMarkPayoutPaid } from '@/hooks/usePayouts';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const { data: deals = [] } = useDeals();
  const { data: payouts = [] } = usePayouts();
  const markPaid = useMarkPayoutPaid();

  const now = new Date();

  // Calculate forecast KPIs from pending payouts
  const forecast = useMemo(() => {
    const pendingPayouts = payouts.filter((p) => p.status !== 'PAID');
    
    // Total pending (all unpaid regardless of date)
    const totalPending = pendingPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
    const pendingCount = pendingPayouts.length;
    
    // This Month
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const thisMonth = pendingPayouts
      .filter((p) => {
        if (!p.due_date) return false;
        const date = parseISO(p.due_date);
        return isWithinInterval(date, { start: thisMonthStart, end: thisMonthEnd });
      })
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Next Month
    const nextMonthStart = startOfMonth(addMonths(now, 1));
    const nextMonthEnd = endOfMonth(addMonths(now, 1));
    const nextMonth = pendingPayouts
      .filter((p) => {
        if (!p.due_date) return false;
        const date = parseISO(p.due_date);
        return isWithinInterval(date, { start: nextMonthStart, end: nextMonthEnd });
      })
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Next 3 Months (from today)
    const next3MonthsEnd = endOfMonth(addMonths(now, 3));
    const next3Months = pendingPayouts
      .filter((p) => {
        if (!p.due_date) return false;
        const date = parseISO(p.due_date);
        return isWithinInterval(date, { start: now, end: next3MonthsEnd });
      })
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Next 12 Months (from today)
    const next12MonthsEnd = endOfMonth(addMonths(now, 12));
    const next12Months = pendingPayouts
      .filter((p) => {
        if (!p.due_date) return false;
        const date = parseISO(p.due_date);
        return isWithinInterval(date, { start: now, end: next12MonthsEnd });
      })
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      totalPending,
      pendingCount,
      thisMonth,
      nextMonth,
      next3Months,
      next12Months,
      activeDeals: deals.filter((d) => d.status === 'PENDING').length,
    };
  }, [deals, payouts]);

  // Get pending payouts sorted by urgency
  const upcomingPayouts = useMemo(() => {
    return payouts
      .filter((p) => p.status !== 'PAID')
      .sort((a, b) => {
        if (a.due_date && b.due_date) {
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        if (a.due_date) return -1;
        if (b.due_date) return 1;
        return 0;
      })
      .slice(0, 8);
  }, [payouts]);

  // Chart data - 12-month forecast
  const chartData = useMemo(() => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const monthDate = addMonths(now, i);
      const monthLabel = format(monthDate, 'MMM');
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const projected = payouts
        .filter((p) => {
          if (!p.due_date || p.status === 'PAID') return false;
          const date = parseISO(p.due_date);
          return isWithinInterval(date, { start: monthStart, end: monthEnd });
        })
        .reduce((sum, p) => sum + Number(p.amount), 0);

      months.push({
        month: monthLabel,
        fullMonth: format(monthDate, 'MMM yyyy'),
        projected,
      });
    }
    return months;
  }, [payouts]);

  // Due date badge
  const getDueBadge = (dueDate: string | null) => {
    if (!dueDate) return { label: 'No date', variant: 'muted' as const };
    const days = differenceInDays(parseISO(dueDate), now);
    if (days < 0) return { label: 'Overdue', variant: 'destructive' as const };
    if (days === 0) return { label: 'Due today', variant: 'destructive' as const };
    if (days <= 7) return { label: `${days}d`, variant: 'warning' as const };
    if (days <= 30) return { label: `${days}d`, variant: 'default' as const };
    return { label: formatDate(dueDate), variant: 'muted' as const };
  };

  return (
    <AppLayout>
      <Header 
        title="Commission Forecast" 
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

        {/* Primary Forecast KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Pending */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-5 h-5 opacity-80" />
                <span className="text-sm font-medium opacity-80">Total Pending</span>
              </div>
              <p className="text-3xl lg:text-4xl font-bold tracking-tight">{formatCurrency(forecast.totalPending)}</p>
              <p className="text-sm opacity-70 mt-2">{forecast.pendingCount} payouts</p>
            </div>
          </div>

          {/* This Month */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-accent to-accent/80 p-6 text-accent-foreground shadow-lg">
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 opacity-80" />
                <span className="text-sm font-medium opacity-80">This Month</span>
              </div>
              <p className="text-3xl lg:text-4xl font-bold tracking-tight">{formatCurrency(forecast.thisMonth)}</p>
              <p className="text-sm opacity-70 mt-2">{format(now, 'MMMM')}</p>
            </div>
          </div>

          {/* Next Month */}
          <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Next Month</span>
            </div>
            <p className="text-3xl lg:text-4xl font-bold tracking-tight">{formatCurrency(forecast.nextMonth)}</p>
            <p className="text-sm text-muted-foreground mt-2">{format(addMonths(now, 1), 'MMMM')}</p>
          </div>

          {/* Next 3 Months */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Next 3 Months</span>
            </div>
            <p className="text-3xl lg:text-4xl font-bold tracking-tight">{formatCurrency(forecast.next3Months)}</p>
            <p className="text-sm text-muted-foreground mt-2">Through {format(addMonths(now, 3), 'MMM yyyy')}</p>
          </div>
        </div>

        {/* Next 12 Months Summary */}
        <div className="rounded-xl border border-border bg-card/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Next 12 Months Total</p>
              <p className="text-2xl font-bold">{formatCurrency(forecast.next12Months)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Active Deals</p>
              <p className="text-2xl font-bold">{forecast.activeDeals}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 12-Month Forecast Chart */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-lg">12-Month Forecast</h3>
                <p className="text-sm text-muted-foreground">Projected commissions by month</p>
              </div>
              <Link to="/forecast">
                <Button variant="ghost" size="sm" className="text-accent">
                  Details <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap="15%">
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={1}/>
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.5}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11} 
                    tickFormatter={(v) => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Projected']}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullMonth}
                  />
                  <Bar 
                    dataKey="projected" 
                    fill="url(#barGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Payouts */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Upcoming Payouts</h3>
                <p className="text-xs text-muted-foreground">{forecast.pendingCount} pending</p>
              </div>
              <Link to="/payouts">
                <Button variant="ghost" size="sm" className="text-accent h-8">
                  All <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>

            {upcomingPayouts.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">No pending payouts</p>
                <Link to="/deals/new">
                  <Button variant="outline" size="sm">Create a deal</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {upcomingPayouts.map((payout) => {
                  const badge = getDueBadge(payout.due_date);
                  return (
                    <Link
                      key={payout.id}
                      to={`/deals/${payout.deal_id}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {payout.deal?.client_name || 'Unknown'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {payout.payout_type}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            badge.variant === 'destructive' ? 'bg-destructive/10 text-destructive' :
                            badge.variant === 'warning' ? 'bg-warning/10 text-warning' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {badge.label}
                          </span>
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
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            markPaid.mutate(payout.id);
                          }}
                          disabled={markPaid.isPending}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </Link>
                  );
                })}
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

          {deals.length === 0 ? (
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
            <div className="grid gap-3">
              {deals.slice(0, 5).map((deal) => (
                <Link
                  key={deal.id}
                  to={`/deals/${deal.id}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{deal.client_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {deal.property_type === 'PRESALE' ? deal.project_name : deal.address || 'No address'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(deal.net_commission_est)}</p>
                      <p className="text-xs text-muted-foreground">{deal.deal_type}</p>
                    </div>
                    <StatusBadge status={deal.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
