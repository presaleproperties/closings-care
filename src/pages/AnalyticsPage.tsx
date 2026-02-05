import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, isWithinInterval } from 'date-fns';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Building2, 
  Target,
  Calendar,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { useDeals } from '@/hooks/useDeals';
import { usePayouts } from '@/hooks/usePayouts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ComposedChart,
} from 'recharts';

const springConfig = { type: "spring" as const, stiffness: 100, damping: 20 };

const COLORS = {
  primary: 'hsl(158 64% 32%)',
  secondary: 'hsl(38 92% 50%)',
  tertiary: 'hsl(217 91% 60%)',
  quaternary: 'hsl(280 68% 58%)',
  quinary: 'hsl(350 89% 60%)',
  success: 'hsl(142 76% 36%)',
  warning: 'hsl(38 92% 50%)',
  danger: 'hsl(0 84% 60%)',
};

const PIE_COLORS = [
  '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'
];

export default function AnalyticsPage() {
  const { data: deals = [] } = useDeals();
  const { data: payouts = [] } = usePayouts();
  const [timeRange, setTimeRange] = useState<'ytd' | '12m' | '6m' | '3m' | 'all'>('12m');

  // Stable date reference
  const now = useMemo(() => new Date(), []);
  const thisYear = now.getFullYear();

  // Get number of months to show based on time range
  const monthsToShow = useMemo(() => {
    switch (timeRange) {
      case '3m': return 3;
      case '6m': return 6;
      case 'ytd': return now.getMonth() + 1;
      case '12m': return 12;
      case 'all': return 24;
      default: return 12;
    }
  }, [timeRange, now]);

  // Filter deals based on time range
  const filteredDeals = useMemo(() => {
    if (timeRange === 'all') return deals;
    
    const ranges: Record<string, { start: Date; end: Date }> = {
      'ytd': { start: new Date(thisYear, 0, 1), end: now },
      '12m': { start: subMonths(now, 12), end: now },
      '6m': { start: subMonths(now, 6), end: now },
      '3m': { start: subMonths(now, 3), end: now },
    };
    
    const range = ranges[timeRange];
    if (!range) return deals;
    
    return deals.filter(deal => {
      const dealDate = deal.created_at ? parseISO(deal.created_at) : null;
      if (!dealDate) return false;
      return isWithinInterval(dealDate, range);
    });
  }, [deals, timeRange, thisYear, now]);

  // Key Metrics
  const metrics = useMemo(() => {
    const totalGCI = filteredDeals.reduce((sum, d) => {
      const gci = d.gross_commission_actual || d.gross_commission_est || 
        ((d.advance_commission || 0) + (d.completion_commission || 0));
      return sum + gci;
    }, 0);

    const closedDeals = filteredDeals.filter(d => d.status === 'CLOSED');
    const pendingDeals = filteredDeals.filter(d => d.status === 'PENDING');
    
    const closedGCI = closedDeals.reduce((sum, d) => {
      const gci = d.gross_commission_actual || d.gross_commission_est || 
        ((d.advance_commission || 0) + (d.completion_commission || 0));
      return sum + gci;
    }, 0);

    const avgDealSize = filteredDeals.length > 0 ? totalGCI / filteredDeals.length : 0;
    
    const paidPayouts = payouts.filter(p => p.status === 'PAID');
    const totalReceived = paidPayouts.reduce((sum, p) => sum + Number(p.amount), 0);

    // Team deals
    const teamDeals = filteredDeals.filter(d => d.team_member);
    const soloDeals = filteredDeals.filter(d => !d.team_member);

    return {
      totalGCI,
      closedGCI,
      avgDealSize,
      totalDeals: filteredDeals.length,
      closedDeals: closedDeals.length,
      pendingDeals: pendingDeals.length,
      totalReceived,
      teamDeals: teamDeals.length,
      soloDeals: soloDeals.length,
    };
  }, [filteredDeals, payouts]);

  // Lead Source Analytics
  const leadSourceData = useMemo(() => {
    const sources: Record<string, { count: number; gci: number }> = {};
    
    filteredDeals.forEach(deal => {
      const source = deal.lead_source || 'Unknown';
      if (!sources[source]) {
        sources[source] = { count: 0, gci: 0 };
      }
      sources[source].count++;
      sources[source].gci += deal.gross_commission_actual || deal.gross_commission_est || 
        ((deal.advance_commission || 0) + (deal.completion_commission || 0));
    });

    return Object.entries(sources)
      .map(([name, data]) => ({
        name,
        count: data.count,
        gci: data.gci,
        percentage: filteredDeals.length > 0 ? (data.count / filteredDeals.length) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredDeals]);

  // Deal Types Analytics
  const dealTypeData = useMemo(() => {
    const presale = filteredDeals.filter(d => d.property_type === 'PRESALE');
    const resale = filteredDeals.filter(d => d.property_type === 'RESALE');
    const buy = filteredDeals.filter(d => d.deal_type === 'BUY');
    const sell = filteredDeals.filter(d => d.deal_type === 'SELL');

    const getGCI = (deals: typeof filteredDeals) => 
      deals.reduce((sum, d) => sum + (d.gross_commission_actual || d.gross_commission_est || 
        ((d.advance_commission || 0) + (d.completion_commission || 0))), 0);

    return {
      propertyTypes: [
        { name: 'Presale', value: presale.length, gci: getGCI(presale) },
        { name: 'Resale', value: resale.length, gci: getGCI(resale) },
      ],
      dealTypes: [
        { name: 'Buyer Rep', value: buy.length, gci: getGCI(buy) },
        { name: 'Seller Rep', value: sell.length, gci: getGCI(sell) },
      ],
    };
  }, [filteredDeals]);

  // Monthly Deals Written (by created_at)
  const dealsWrittenByMonth = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(now, monthsToShow - 1),
      end: now,
    });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthDeals = filteredDeals.filter(deal => {
        const createdDate = deal.created_at ? parseISO(deal.created_at) : null;
        return createdDate && isWithinInterval(createdDate, { start: monthStart, end: monthEnd });
      });

      const gci = monthDeals.reduce((sum, d) => 
        sum + (d.gross_commission_actual || d.gross_commission_est || 
          ((d.advance_commission || 0) + (d.completion_commission || 0))), 0);

      return {
        month: format(month, 'MMM'),
        fullMonth: format(month, 'MMMM yyyy'),
        deals: monthDeals.length,
        gci,
      };
    });
  }, [filteredDeals, now, monthsToShow]);

  // Monthly Deals Closing (by close_date_est or close_date_actual)
  const dealsClosingByMonth = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(now, monthsToShow - 1),
      end: now,
    });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const closingDeals = filteredDeals.filter(deal => {
        const closeDate = deal.close_date_actual || deal.close_date_est;
        if (!closeDate) return false;
        const parsedDate = parseISO(closeDate);
        return isWithinInterval(parsedDate, { start: monthStart, end: monthEnd });
      });

      const closed = closingDeals.filter(d => d.status === 'CLOSED');
      const pending = closingDeals.filter(d => d.status === 'PENDING');

      const gci = closingDeals.reduce((sum, d) => 
        sum + (d.gross_commission_actual || d.gross_commission_est || 
          ((d.advance_commission || 0) + (d.completion_commission || 0))), 0);

      return {
        month: format(month, 'MMM'),
        fullMonth: format(month, 'MMMM yyyy'),
        closed: closed.length,
        pending: pending.length,
        total: closingDeals.length,
        gci,
      };
    });
  }, [filteredDeals, now, monthsToShow]);

  // Team Member Performance
  const teamMemberData = useMemo(() => {
    const members: Record<string, { deals: number; gci: number; userPortion: number }> = {};
    
    filteredDeals.forEach(deal => {
      if (deal.team_member) {
        if (!members[deal.team_member]) {
          members[deal.team_member] = { deals: 0, gci: 0, userPortion: 0 };
        }
        members[deal.team_member].deals++;
        const totalGCI = deal.gross_commission_actual || deal.gross_commission_est || 
          ((deal.advance_commission || 0) + (deal.completion_commission || 0));
        members[deal.team_member].gci += totalGCI;
        // User's portion (typically 30%)
        const userPortionPercent = deal.team_member_portion || 30;
        members[deal.team_member].userPortion += totalGCI * (userPortionPercent / 100);
      }
    });

    return Object.entries(members)
      .map(([name, data]) => ({
        name,
        deals: data.deals,
        gci: data.gci,
        userPortion: data.userPortion,
        teamPortion: data.gci - data.userPortion,
      }))
      .sort((a, b) => b.gci - a.gci);
  }, [filteredDeals]);

  // City Distribution
  const cityData = useMemo(() => {
    const cities: Record<string, number> = {};
    
    filteredDeals.forEach(deal => {
      const city = deal.city || 'Unknown';
      cities[city] = (cities[city] || 0) + 1;
    });

    return Object.entries(cities)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredDeals]);

  // GCI Trends
  const gciTrends = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(now, monthsToShow - 1),
      end: now,
    });

    let cumulative = 0;
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthDeals = filteredDeals.filter(deal => {
        const closeDate = deal.close_date_actual;
        if (!closeDate) return false;
        const parsedDate = parseISO(closeDate);
        return isWithinInterval(parsedDate, { start: monthStart, end: monthEnd });
      });

      const monthGCI = monthDeals.reduce((sum, d) => 
        sum + (d.gross_commission_actual || d.gross_commission_est || 
          ((d.advance_commission || 0) + (d.completion_commission || 0))), 0);

      cumulative += monthGCI;

      return {
        month: format(month, 'MMM'),
        gci: monthGCI,
        cumulative,
      };
    });
  }, [filteredDeals, now, monthsToShow]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl p-3 shadow-xl">
          <p className="font-semibold text-sm mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.toLowerCase().includes('gci') || entry.name.toLowerCase().includes('portion') 
                ? formatCurrency(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <AppLayout>
      <Header title="Business Analytics" subtitle="Deep dive into your business performance" />
      
      <motion.div 
        className="p-4 sm:p-6 lg:p-8 space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Time Range Filter */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Time Period:</span>
          </div>
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="12m">Last 12 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total GCI"
            value={formatCurrency(metrics.totalGCI)}
            subtitle={`${metrics.totalDeals} deals`}
            icon={DollarSign}
            trend={metrics.closedGCI > 0 ? 'up' : undefined}
            gradient="from-emerald-500 to-teal-600"
          />
          <MetricCard
            title="Closed GCI"
            value={formatCurrency(metrics.closedGCI)}
            subtitle={`${metrics.closedDeals} closed`}
            icon={Target}
            gradient="from-amber-500 to-orange-600"
          />
          <MetricCard
            title="Avg Deal Size"
            value={formatCurrency(metrics.avgDealSize)}
            subtitle="gross commission"
            icon={TrendingUp}
            gradient="from-blue-500 to-indigo-600"
          />
          <MetricCard
            title="Pipeline"
            value={formatCurrency(metrics.totalGCI - metrics.closedGCI)}
            subtitle={`${metrics.pendingDeals} pending`}
            icon={Building2}
            gradient="from-violet-500 to-purple-600"
          />
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-auto inline-flex h-11 p-1.5 bg-muted/40 backdrop-blur-xl rounded-xl border border-border/30">
            <TabsTrigger value="overview" className="text-sm font-semibold px-4 rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="leads" className="text-sm font-semibold px-4 rounded-lg">Lead Sources</TabsTrigger>
            <TabsTrigger value="deals" className="text-sm font-semibold px-4 rounded-lg">Deal Flow</TabsTrigger>
            <TabsTrigger value="team" className="text-sm font-semibold px-4 rounded-lg">Team</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* GCI Trend */}
              <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    GCI Trend
                  </CardTitle>
                  <CardDescription>Monthly and cumulative gross commission</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={gciTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="gci" name="Monthly GCI" fill="hsl(158 64% 42%)" radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="cumulative" name="Cumulative" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Deal Types */}
              <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Deal Distribution
                  </CardTitle>
                  <CardDescription>Property types and representation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 text-center">Property Type</p>
                      <ResponsiveContainer width="100%" height={150}>
                        <RechartsPieChart>
                          <Pie
                            data={dealTypeData.propertyTypes}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={55}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {dealTypeData.propertyTypes.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-4 mt-2">
                        {dealTypeData.propertyTypes.map((item, i) => (
                          <div key={item.name} className="flex items-center gap-1.5 text-xs">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                            <span>{item.name} ({item.value})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 text-center">Representation</p>
                      <ResponsiveContainer width="100%" height={150}>
                        <RechartsPieChart>
                          <Pie
                            data={dealTypeData.dealTypes}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={55}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {dealTypeData.dealTypes.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index + 2]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-4 mt-2">
                        {dealTypeData.dealTypes.map((item, i) => (
                          <div key={item.name} className="flex items-center gap-1.5 text-xs">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i + 2] }} />
                            <span>{item.name} ({item.value})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* City Distribution */}
            <Card className="bg-card/60 backdrop-blur-xl border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Deals by City
                </CardTitle>
                <CardDescription>Geographic distribution of your deals</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={cityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Deals" fill="hsl(217 91% 60%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lead Sources Tab */}
          <TabsContent value="leads" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Lead Source Chart */}
              <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Lead Sources
                  </CardTitle>
                  <CardDescription>Where your deals are coming from</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={leadSourceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="count"
                        label={({ name, percentage }) => `${name} (${percentage.toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {leadSourceData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Lead Source Table */}
              <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                <CardHeader>
                  <CardTitle>Lead Source Performance</CardTitle>
                  <CardDescription>GCI by acquisition channel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {leadSourceData.map((source, i) => (
                      <div key={source.name} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} 
                          />
                          <div>
                            <p className="font-medium text-sm">{source.name}</p>
                            <p className="text-xs text-muted-foreground">{source.count} deals ({source.percentage.toFixed(1)}%)</p>
                          </div>
                        </div>
                        <p className="font-bold text-primary">{formatCurrency(source.gci)}</p>
                      </div>
                    ))}
                    {leadSourceData.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No lead source data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Deal Flow Tab */}
          <TabsContent value="deals" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Deals Written */}
              <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Deals Written by Month
                  </CardTitle>
                  <CardDescription>When deals were created/listed</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dealsWrittenByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="deals" name="Deals Written" fill="hsl(158 64% 42%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Deals Closing */}
              <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Deals Closing by Month
                  </CardTitle>
                  <CardDescription>Expected closings timeline</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dealsClosingByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="closed" name="Closed" stackId="a" fill="hsl(142 76% 36%)" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="pending" name="Pending" stackId="a" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Monthly GCI */}
            <Card className="bg-card/60 backdrop-blur-xl border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Monthly GCI from Closings
                </CardTitle>
                <CardDescription>Commission earned by closing month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dealsClosingByMonth}>
                    <defs>
                      <linearGradient id="gciGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(158 64% 42%)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(158 64% 42%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="gci" name="GCI" stroke="hsl(158 64% 42%)" fill="url(#gciGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            {/* Team Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Solo Deals</p>
                  <p className="text-2xl font-bold mt-1">{metrics.soloDeals}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Team Deals</p>
                  <p className="text-2xl font-bold mt-1">{metrics.teamDeals}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/60 backdrop-blur-xl border-border/50 col-span-2 lg:col-span-1">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Team Members</p>
                  <p className="text-2xl font-bold mt-1">{teamMemberData.length}</p>
                </CardContent>
              </Card>
            </div>

            {teamMemberData.length > 0 ? (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Team Performance Chart */}
                <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Team Member Performance
                    </CardTitle>
                    <CardDescription>GCI contribution by team member</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={teamMemberData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                        <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="userPortion" name="Your Portion" stackId="a" fill="hsl(158 64% 42%)" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="teamPortion" name="Team Portion" stackId="a" fill="hsl(217 91% 60%)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Team Member List */}
                <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                  <CardHeader>
                    <CardTitle>Team Member Details</CardTitle>
                    <CardDescription>Individual performance breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {teamMemberData.map((member) => (
                        <div key={member.name} className="p-4 rounded-xl bg-muted/30 border border-border/30">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold">{member.name}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                              {member.deals} deals
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">Total GCI</p>
                              <p className="font-bold">{formatCurrency(member.gci)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Your Share</p>
                              <p className="font-bold text-primary">{formatCurrency(member.userPortion)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Their Share</p>
                              <p className="font-bold text-blue-500">{formatCurrency(member.teamPortion)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No team deals recorded yet</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Add team members to your deals to see performance analytics</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </AppLayout>
  );
}

// Metric Card Component
function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  gradient 
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  icon: any; 
  trend?: 'up' | 'down';
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfig}
    >
      <Card className={cn(
        "relative overflow-hidden border-0",
        `bg-gradient-to-br ${gradient}`
      )}>
        <CardContent className="p-4 sm:p-5">
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Icon className="h-4 w-4 text-white" />
              </div>
              {trend && (
                <div className={cn(
                  "flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded",
                  trend === 'up' ? 'bg-white/20 text-white' : 'bg-red-500/20 text-red-200'
                )}>
                  {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                </div>
              )}
            </div>
            <p className="text-white/80 text-xs font-medium uppercase tracking-wider">{title}</p>
            <p className="text-white text-xl sm:text-2xl font-bold mt-1">{value}</p>
            <p className="text-white/60 text-xs mt-1">{subtitle}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
