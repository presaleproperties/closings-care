import { useMemo, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  MapPin, 
  Target,
  DollarSign,
  Calendar,
  Briefcase,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Deal, Payout } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart
} from 'recharts';
import { cn } from '@/lib/utils';
import { format, parseISO, startOfMonth, subMonths, isWithinInterval } from 'date-fns';

interface BusinessAnalyticsProps {
  deals: Deal[];
  payouts: Payout[];
}

const EMERALD_PALETTE = [
  'hsl(158, 64%, 32%)',
  'hsl(168, 76%, 36%)',
  'hsl(172, 66%, 40%)',
  'hsl(38, 92%, 50%)',
  'hsl(45, 93%, 47%)',
  'hsl(0, 84%, 60%)',
];

const CHART_COLORS = {
  primary: 'hsl(158, 64%, 32%)',
  secondary: 'hsl(168, 76%, 36%)',
  tertiary: 'hsl(38, 92%, 50%)',
  muted: 'hsl(var(--muted-foreground))',
};

type TimeFilter = 'all' | 'ytd' | '12m' | '6m' | '3m';

export function BusinessAnalytics({ deals, payouts }: BusinessAnalyticsProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const filteredDeals = useMemo(() => {
    if (timeFilter === 'all') return deals;
    
    const now = new Date();
    let startDate: Date;
    
    switch (timeFilter) {
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case '12m':
        startDate = subMonths(now, 12);
        break;
      case '6m':
        startDate = subMonths(now, 6);
        break;
      case '3m':
        startDate = subMonths(now, 3);
        break;
      default:
        return deals;
    }
    
    return deals.filter(deal => {
      const dealDate = deal.close_date_actual || deal.close_date_est || deal.pending_date;
      if (!dealDate) return false;
      return new Date(dealDate) >= startDate;
    });
  }, [deals, timeFilter]);

  const analytics = useMemo(() => {
    // Overview metrics
    const totalDeals = filteredDeals.length;
    const closedDeals = filteredDeals.filter(d => d.status === 'CLOSED').length;
    const pendingDeals = filteredDeals.filter(d => d.status === 'PENDING').length;
    
    const paidPayouts = payouts.filter(p => {
      const deal = filteredDeals.find(d => d.id === p.deal_id);
      return deal && p.status === 'PAID';
    });
    const totalRevenue = paidPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
    const avgCommission = totalDeals > 0 ? totalRevenue / closedDeals : 0;
    
    const projectedPayouts = payouts.filter(p => {
      const deal = filteredDeals.find(d => d.id === p.deal_id);
      return deal && p.status !== 'PAID';
    });
    const projectedRevenue = projectedPayouts.reduce((sum, p) => sum + Number(p.amount), 0);

    // Lead source breakdown
    const leadSourceMap = new Map<string, { count: number; revenue: number; avgDeal: number }>();
    filteredDeals.forEach(deal => {
      const source = deal.lead_source || 'Unknown';
      const existing = leadSourceMap.get(source) || { count: 0, revenue: 0, avgDeal: 0 };
      const dealPayouts = payouts.filter(p => p.deal_id === deal.id && p.status === 'PAID');
      const revenue = dealPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
      const newCount = existing.count + 1;
      const newRevenue = existing.revenue + revenue;
      leadSourceMap.set(source, {
        count: newCount,
        revenue: newRevenue,
        avgDeal: newRevenue / newCount,
      });
    });
    const leadSources = Array.from(leadSourceMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    // Property type breakdown
    const propertyTypeMap = new Map<string, { count: number; revenue: number; avgDeal: number }>();
    filteredDeals.forEach(deal => {
      const type = deal.property_type || 'Unknown';
      const existing = propertyTypeMap.get(type) || { count: 0, revenue: 0, avgDeal: 0 };
      const dealPayouts = payouts.filter(p => p.deal_id === deal.id && p.status === 'PAID');
      const revenue = dealPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
      const newCount = existing.count + 1;
      const newRevenue = existing.revenue + revenue;
      propertyTypeMap.set(type, {
        count: newCount,
        revenue: newRevenue,
        avgDeal: newRevenue / newCount,
      });
    });
    const propertyTypes = Array.from(propertyTypeMap.entries())
      .map(([name, data]) => ({ 
        name: name === 'PRESALE' ? 'Pre-Sale' : name === 'RESALE' ? 'Resale' : name, 
        ...data 
      }))
      .sort((a, b) => b.count - a.count);

    // Deal type (Buy vs Sell)
    const dealTypeMap = new Map<string, { count: number; revenue: number }>();
    filteredDeals.forEach(deal => {
      const type = deal.deal_type;
      const existing = dealTypeMap.get(type) || { count: 0, revenue: 0 };
      const dealPayouts = payouts.filter(p => p.deal_id === deal.id && p.status === 'PAID');
      const revenue = dealPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
      dealTypeMap.set(type, {
        count: existing.count + 1,
        revenue: existing.revenue + revenue,
      });
    });
    const dealTypes = Array.from(dealTypeMap.entries())
      .map(([name, data]) => ({ name: name === 'BUY' ? 'Buyer Rep' : 'Seller Rep', ...data }))
      .sort((a, b) => b.count - a.count);

    // Buyer type breakdown
    const buyerTypeMap = new Map<string, { count: number; revenue: number }>();
    filteredDeals.forEach(deal => {
      const type = deal.buyer_type || 'Not Specified';
      const existing = buyerTypeMap.get(type) || { count: 0, revenue: 0 };
      const dealPayouts = payouts.filter(p => p.deal_id === deal.id && p.status === 'PAID');
      const revenue = dealPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
      buyerTypeMap.set(type, {
        count: existing.count + 1,
        revenue: existing.revenue + revenue,
      });
    });
    const buyerTypes = Array.from(buyerTypeMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);

    // City breakdown
    const cityMap = new Map<string, { count: number; revenue: number }>();
    filteredDeals.forEach(deal => {
      const city = deal.city || 'Unknown';
      const existing = cityMap.get(city) || { count: 0, revenue: 0 };
      const dealPayouts = payouts.filter(p => p.deal_id === deal.id && p.status === 'PAID');
      const revenue = dealPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
      cityMap.set(city, {
        count: existing.count + 1,
        revenue: existing.revenue + revenue,
      });
    });
    const cities = Array.from(cityMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);

    // Team breakdown (if any deals have team members)
    const teamMap = new Map<string, { count: number; revenue: number }>();
    filteredDeals.forEach(deal => {
      const isTeamDeal = deal.team_member && deal.team_member_portion && deal.team_member_portion > 0;
      const category = isTeamDeal ? 'Team Deals' : 'Solo Deals';
      const existing = teamMap.get(category) || { count: 0, revenue: 0 };
      const dealPayouts = payouts.filter(p => p.deal_id === deal.id && p.status === 'PAID');
      const revenue = dealPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
      teamMap.set(category, {
        count: existing.count + 1,
        revenue: existing.revenue + revenue,
      });
    });
    const teamBreakdown = Array.from(teamMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);

    // Monthly trend data (last 12 months)
    const monthlyData: { month: string; deals: number; revenue: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      
      const monthDeals = filteredDeals.filter(deal => {
        const dealDate = deal.close_date_actual || deal.close_date_est;
        if (!dealDate) return false;
        return isWithinInterval(new Date(dealDate), { start: monthStart, end: monthEnd });
      });
      
      const monthRevenue = monthDeals.reduce((sum, deal) => {
        const dealPayouts = payouts.filter(p => p.deal_id === deal.id && p.status === 'PAID');
        return sum + dealPayouts.reduce((pSum, p) => pSum + Number(p.amount), 0);
      }, 0);
      
      monthlyData.push({
        month: format(monthDate, 'MMM'),
        deals: monthDeals.length,
        revenue: monthRevenue,
      });
    }

    return { 
      totalDeals, 
      closedDeals, 
      pendingDeals,
      totalRevenue, 
      avgCommission,
      projectedRevenue,
      leadSources, 
      propertyTypes, 
      dealTypes,
      buyerTypes,
      cities,
      teamBreakdown,
      monthlyData,
    };
  }, [filteredDeals, payouts]);

  const renderCustomLabel = ({ name, percent }: { name: string; percent: number }) => {
    return percent > 0.08 ? `${(percent * 100).toFixed(0)}%` : '';
  };

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    subValue,
    trend,
    color = 'primary'
  }: { 
    icon: React.ElementType; 
    label: string; 
    value: string; 
    subValue?: string;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'primary' | 'secondary' | 'warning';
  }) => (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-ios">
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/5" />
      <div className="relative">
        <div className={cn(
          "inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3",
          color === 'primary' && "bg-primary/10 text-primary",
          color === 'secondary' && "bg-accent/10 text-accent",
          color === 'warning' && "bg-warning/10 text-warning",
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {trend && (
            <span className={cn(
              "inline-flex items-center text-xs font-medium",
              trend === 'up' && "text-success",
              trend === 'down' && "text-destructive",
            )}>
              {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            </span>
          )}
        </div>
        {subValue && (
          <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
        )}
      </div>
    </div>
  );

  const BreakdownCard = ({ 
    icon: Icon, 
    title, 
    data,
    showRevenue = true,
    emptyMessage = "No data yet"
  }: { 
    icon: React.ElementType; 
    title: string; 
    data: { name: string; count: number; revenue: number }[];
    showRevenue?: boolean;
    emptyMessage?: string;
  }) => (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-ios">
      <div className="flex items-center gap-2 mb-4">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {data.length > 0 ? (
        <>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey={showRevenue ? "revenue" : "count"}
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  label={renderCustomLabel}
                  labelLine={false}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={EMERALD_PALETTE[index % EMERALD_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    showRevenue ? formatCurrency(value) : `${value} deals`, 
                    name
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2">
            {data.slice(0, 4).map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: EMERALD_PALETTE[i % EMERALD_PALETTE.length] }} 
                  />
                  <span className="text-muted-foreground truncate max-w-[100px]">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-xs bg-muted px-1.5 py-0.5 rounded">
                    {item.count}
                  </span>
                  {showRevenue && (
                    <span className="font-semibold text-xs">{formatCurrency(item.revenue)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="h-36 flex items-center justify-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Time Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Business Analytics
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track your performance across all business metrics
          </p>
        </div>
        
        {/* Time Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl">
          {(['all', 'ytd', '12m', '6m', '3m'] as TimeFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                timeFilter === filter
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {filter === 'all' ? 'All Time' : filter.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Briefcase}
          label="Total Deals"
          value={analytics.totalDeals.toString()}
          subValue={`${analytics.closedDeals} closed · ${analytics.pendingDeals} pending`}
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          subValue="Commissions received"
          color="primary"
        />
        <StatCard
          icon={Target}
          label="Avg Commission"
          value={formatCurrency(analytics.avgCommission)}
          subValue="Per closed deal"
          color="secondary"
        />
        <StatCard
          icon={TrendingUp}
          label="Pipeline"
          value={formatCurrency(analytics.projectedRevenue)}
          subValue="Projected to receive"
          color="warning"
        />
      </div>

      {/* Monthly Trend Chart */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-ios">
        <div className="flex items-center gap-2 mb-4">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold">Monthly Performance</h3>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? formatCurrency(value) : value,
                  name === 'revenue' ? 'Revenue' : 'Deals'
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown Charts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <BreakdownCard
          icon={Users}
          title="Lead Sources"
          data={analytics.leadSources}
          emptyMessage="Add lead sources to your deals"
        />
        <BreakdownCard
          icon={Building2}
          title="Property Types"
          data={analytics.propertyTypes}
        />
        <BreakdownCard
          icon={PieChartIcon}
          title="Client Type"
          data={analytics.dealTypes}
          showRevenue={false}
        />
        <BreakdownCard
          icon={Target}
          title="Buyer Type"
          data={analytics.buyerTypes}
          emptyMessage="Add buyer types to your deals"
        />
        <BreakdownCard
          icon={MapPin}
          title="Cities"
          data={analytics.cities}
        />
        <BreakdownCard
          icon={Briefcase}
          title="Solo vs Team"
          data={analytics.teamBreakdown}
        />
      </div>

      {/* Top Lead Sources Bar Chart */}
      {analytics.leadSources.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-ios">
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold">Revenue by Lead Source</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={analytics.leadSources.slice(0, 6)} 
                layout="vertical"
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis 
                  type="number"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
                <Bar 
                  dataKey="revenue" 
                  fill={CHART_COLORS.primary}
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
