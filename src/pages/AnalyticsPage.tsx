import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, isWithinInterval } from 'date-fns';
import { useRevenueShare } from '@/hooks/usePlatformConnections';
import { useNetworkSummary } from '@/hooks/useNetworkData';
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
  Filter,
  MapPin,
  Home,
  UserCheck,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { useDeals } from '@/hooks/useDeals';
import { usePayouts } from '@/hooks/usePayouts';
import { useSyncedTransactions } from '@/hooks/usePlatformConnections';
import { useSyncedIncome } from '@/hooks/useSyncedIncome';
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
  const { data: revenueShares = [] } = useRevenueShare();
  const { data: networkSummary } = useNetworkSummary();
  const { data: syncedTransactions = [] } = useSyncedTransactions();
  const { syncedPayouts, receivedYTD: syncedReceivedYTD, comingIn: syncedComingIn } = useSyncedIncome(syncedTransactions);
  const [timeRange, setTimeRange] = useState<'ytd' | '12m' | '6m' | '3m' | 'all'>('12m');
  const [dealTypeFilter, setDealTypeFilter] = useState<'all' | 'presale' | 'resale'>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');

  // Normalize city names (title case, trim, merge duplicates)
  const normalizeCity = (city: string | null): string => {
    if (!city) return 'Unknown';
    const trimmed = city.trim();
    // Normalize to title case
    const normalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    // Merge known duplicates
    const cityMap: Record<string, string> = {
      'Surrey bc': 'Surrey',
      'New westminister': 'New Westminster',
      'New westminster district plan': 'New Westminster',
      'New westminster district plan ': 'New Westminster',
    };
    return cityMap[normalized.toLowerCase()] || normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  // Detect presale from property address
  const isPresaleTransaction = (tx: any): boolean => {
    const addr = (tx.property_address || '').toLowerCase();
    return addr.includes('part 1/2') || addr.includes('1/2 -') || 
           addr.includes('part 2/2') || addr.includes('2/2 -') ||
           addr.includes('part 3/3') || addr.includes('3/3 -');
  };

  // Extract writing agents from participants (BUYERS_AGENT, SELLERS_AGENT roles, excluding hidden)
  const getWritingAgents = (tx: any): string[] => {
    try {
      const participants = tx.raw_data?.participants || [];
      return participants
        .filter((p: any) => 
          ['BUYERS_AGENT', 'SELLERS_AGENT'].includes(p.participantRole) && 
          !p.hidden && !p.external
        )
        .map((p: any) => `${p.firstName || ''} ${p.lastName || ''}`.trim())
        .filter((n: string) => n.length > 0);
    } catch { return []; }
  };

  // Extract unique cities and agents from synced transactions
  const filterDimensions = useMemo(() => {
    const citySet = new Map<string, number>();
    const agentSet = new Map<string, number>();

    syncedTransactions.forEach(tx => {
      const city = normalizeCity(tx.city);
      citySet.set(city, (citySet.get(city) || 0) + 1);

      const agents = getWritingAgents(tx);
      agents.forEach(agent => {
        agentSet.set(agent, (agentSet.get(agent) || 0) + 1);
      });
    });

    return {
      cities: Array.from(citySet.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
      agents: Array.from(agentSet.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
    };
  }, [syncedTransactions]);

  // Filter synced transactions based on deal type, city, and agent
  const filteredSyncedTransactions = useMemo(() => {
    return syncedTransactions.filter(tx => {
      // Deal type filter
      if (dealTypeFilter === 'presale' && !isPresaleTransaction(tx)) return false;
      if (dealTypeFilter === 'resale' && isPresaleTransaction(tx)) return false;

      // City filter
      if (cityFilter !== 'all' && normalizeCity(tx.city) !== cityFilter) return false;

      // Agent filter
      if (agentFilter !== 'all') {
        const agents = getWritingAgents(tx);
        if (!agents.includes(agentFilter)) return false;
      }

      return true;
    });
  }, [syncedTransactions, dealTypeFilter, cityFilter, agentFilter]);

  // Use filtered synced transactions for income calculations
  const { syncedPayouts: filteredSyncedPayouts, receivedYTD: filteredReceivedYTD, comingIn: filteredComingIn } = useSyncedIncome(filteredSyncedTransactions);

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

  // Key Metrics - blending manual deals + synced transactions
  const metrics = useMemo(() => {
    // Manual deals GCI
    const manualGCI = filteredDeals.reduce((sum, d) => {
      const gci = d.gross_commission_actual || d.gross_commission_est || 
        ((d.advance_commission || 0) + (d.completion_commission || 0));
      return sum + gci;
    }, 0);

    // Synced transaction GCI (user's net split) - using filtered data
    const syncedGCI = filteredSyncedPayouts.reduce((sum, p) => sum + p.netAmount, 0);
    const totalGCI = manualGCI + syncedGCI;

    const closedDeals = filteredDeals.filter(d => d.status === 'CLOSED');
    const pendingDeals = filteredDeals.filter(d => d.status === 'PENDING');
    
    const closedGCI = closedDeals.reduce((sum, d) => {
      const gci = d.gross_commission_actual || d.gross_commission_est || 
        ((d.advance_commission || 0) + (d.completion_commission || 0));
      return sum + gci;
    }, 0) + filteredReceivedYTD;

    const totalDealCount = filteredDeals.length + filteredSyncedPayouts.length;
    const avgDealSize = totalDealCount > 0 ? totalGCI / totalDealCount : 0;
    
    const paidPayouts = payouts.filter(p => p.status === 'PAID');
    const totalReceived = paidPayouts.reduce((sum, p) => sum + Number(p.amount), 0) + filteredReceivedYTD;

    // Team deals
    const teamDeals = filteredDeals.filter(d => d.team_member);
    const soloDeals = filteredDeals.filter(d => !d.team_member);

    return {
      totalGCI,
      closedGCI,
      avgDealSize,
      totalDeals: totalDealCount,
      closedDeals: closedDeals.length,
      pendingDeals: pendingDeals.length,
      totalReceived,
      teamDeals: teamDeals.length,
      soloDeals: soloDeals.length,
      syncedComingIn: filteredComingIn,
    };
  }, [filteredDeals, payouts, filteredSyncedPayouts, filteredReceivedYTD, filteredComingIn]);

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
        // team_member_portion stores team member's percentage (default 70%)
        // User gets (100 - team_member_portion) = 30%
        const teamMemberPercent = deal.team_member_portion || 70;
        const userPortionPercent = 100 - teamMemberPercent;
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

  // City Distribution - from synced transactions (primary source)
  const cityData = useMemo(() => {
    const cities: Record<string, number> = {};
    
    // Synced transactions (primary)
    filteredSyncedTransactions.forEach(tx => {
      const city = normalizeCity(tx.city);
      cities[city] = (cities[city] || 0) + 1;
    });

    // Manual deals (secondary)
    filteredDeals.forEach(deal => {
      const city = deal.city || 'Unknown';
      cities[city] = (cities[city] || 0) + 1;
    });

    return Object.entries(cities)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredDeals, filteredSyncedTransactions]);

  // GCI Trends - blending manual deals + synced transactions
  const gciTrends = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(now, monthsToShow - 1),
      end: now,
    });

    let cumulative = 0;
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      // Manual deals GCI
      const monthDeals = filteredDeals.filter(deal => {
        const closeDate = deal.close_date_actual;
        if (!closeDate) return false;
        const parsedDate = parseISO(closeDate);
        return isWithinInterval(parsedDate, { start: monthStart, end: monthEnd });
      });
      const manualGCI = monthDeals.reduce((sum, d) => 
        sum + (d.gross_commission_actual || d.gross_commission_est || 
          ((d.advance_commission || 0) + (d.completion_commission || 0))), 0);

      // Synced transaction GCI for this month (filtered)
      const syncedGCI = filteredSyncedPayouts
        .filter(p => {
          const date = parseISO(p.close_date);
          return isWithinInterval(date, { start: monthStart, end: monthEnd });
        })
        .reduce((sum, p) => sum + p.netAmount, 0);

      const monthGCI = manualGCI + syncedGCI;
      cumulative += monthGCI;

      return {
        month: format(month, 'MMM'),
        gci: monthGCI,
        cumulative,
      };
    });
  }, [filteredDeals, filteredSyncedPayouts, now, monthsToShow]);

  // RevShare by Month (grouped by year for comparison)
  const revShareMonthly = useMemo(() => {
    const byYearMonth: Record<string, Record<number, number>> = {};
    revenueShares.forEach(rs => {
      if (!rs.period || rs.period === 'unknown') return;
      const [yearStr, monthStr] = rs.period.split('-');
      const year = yearStr;
      const month = parseInt(monthStr);
      if (!byYearMonth[year]) byYearMonth[year] = {};
      byYearMonth[year][month] = (byYearMonth[year][month] || 0) + Number(rs.amount);
    });

    const years = Object.keys(byYearMonth).sort();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      chartData: monthNames.map((name, i) => {
        const entry: Record<string, any> = { month: name };
        years.forEach(y => { entry[y] = byYearMonth[y]?.[i + 1] || 0; });
        return entry;
      }),
      years,
      yearlyTotals: years.map(y => ({
        year: y,
        total: Object.values(byYearMonth[y] || {}).reduce((s, v) => s + v, 0),
      })),
    };
  }, [revenueShares]);

  // RevShare by tier from network_summary
  const revShareByTier = useMemo(() => {
    const tiers = networkSummary?.revshare_by_tier as any;
    if (!tiers?.tierRevshareResponses) return [];
    return (tiers.tierRevshareResponses as any[]).map((t: any) => ({
      tier: `Tier ${t.tier}`,
      earned: t.earnedRevshareAmount?.amount || 0,
      missed: t.missedRevshareAmount?.amount || 0,
      contributors: t.numberOfContributors || 0,
    })).filter((t: any) => t.earned > 0 || t.missed > 0 || t.contributors > 0);
  }, [networkSummary]);

  const YEAR_COLORS = ['hsl(158 64% 42%)', 'hsl(38 92% 50%)', 'hsl(217 91% 60%)', 'hsl(280 68% 58%)'];

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
        {/* Filters Bar */}
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Filters</span>
            {(dealTypeFilter !== 'all' || cityFilter !== 'all' || agentFilter !== 'all') && (
              <button 
                onClick={() => { setDealTypeFilter('all'); setCityFilter('all'); setAgentFilter('all'); }}
                className="ml-auto text-xs text-primary hover:underline font-medium"
              >
                Clear all
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Time Period */}
            <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
              <SelectTrigger className="w-[140px] h-10 rounded-xl bg-background/50 border-border/50">
                <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="ytd">Year to Date</SelectItem>
                <SelectItem value="12m">Last 12 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            {/* Deal Type: Presale / Resale */}
            <Select value={dealTypeFilter} onValueChange={(v: any) => setDealTypeFilter(v)}>
              <SelectTrigger className="w-[140px] h-10 rounded-xl bg-background/50 border-border/50">
                <Home className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="presale">Presale</SelectItem>
                <SelectItem value="resale">Resale</SelectItem>
              </SelectContent>
            </Select>

            {/* City Filter */}
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[160px] h-10 rounded-xl bg-background/50 border-border/50">
                <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-[300px]">
                <SelectItem value="all">All Cities</SelectItem>
                {filterDimensions.cities.map(c => (
                  <SelectItem key={c.name} value={c.name}>
                    {c.name} ({c.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Agent Filter */}
            {filterDimensions.agents.length > 1 && (
              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger className="w-[180px] h-10 rounded-xl bg-background/50 border-border/50">
                  <UserCheck className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="All Agents" />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-[300px]">
                  <SelectItem value="all">All Agents</SelectItem>
                  {filterDimensions.agents.map(a => (
                    <SelectItem key={a.name} value={a.name}>
                      {a.name} ({a.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Active filter summary */}
          {(dealTypeFilter !== 'all' || cityFilter !== 'all' || agentFilter !== 'all') && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs text-muted-foreground">Showing:</span>
              <span className="text-xs font-semibold text-primary">
                {filteredSyncedTransactions.length} of {syncedTransactions.length} transactions
              </span>
            </div>
          )}
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
            <TabsTrigger value="revshare" className="text-sm font-semibold px-4 rounded-lg">RevShare</TabsTrigger>
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
                        <RechartsPieChart onClick={(state: any) => {
                          if (state?.activeTooltipIndex !== undefined && dealTypeData.propertyTypes[state.activeTooltipIndex]) {
                            const type = dealTypeData.propertyTypes[state.activeTooltipIndex].name;
                            setDealTypeFilter(type.toLowerCase() as 'presale' | 'resale');
                          }
                        }}>
                          <Pie
                            data={dealTypeData.propertyTypes}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={55}
                            paddingAngle={4}
                            dataKey="value"
                            onClick={(entry: any) => {
                              const type = entry.name;
                              setDealTypeFilter(type.toLowerCase() as 'presale' | 'resale');
                            }}
                            style={{ cursor: 'pointer' }}
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
                          <div 
                            key={item.name} 
                            className="flex items-center gap-1.5 text-xs cursor-pointer hover:opacity-70 transition-opacity"
                            onClick={() => setDealTypeFilter(item.name.toLowerCase() as 'presale' | 'resale')}
                          >
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
                <CardDescription>Click a bar to filter by city</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart 
                    data={cityData} 
                    layout="vertical"
                    onClick={(state: any) => {
                      if (state?.activeTooltipIndex !== undefined && cityData[state.activeTooltipIndex]) {
                        setCityFilter(cityData[state.activeTooltipIndex].name);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      name="Deals" 
                      fill="hsl(217 91% 60%)" 
                      radius={[0, 4, 4, 0]}
                      onClick={(entry: any) => {
                        setCityFilter(entry.name);
                      }}
                      style={{ cursor: 'pointer' }}
                    />
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

          {/* RevShare Tab */}
          <TabsContent value="revshare" className="space-y-6">
            {revenueShares.length === 0 ? (
              <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                <CardContent className="py-12 text-center">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No revenue share data yet</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Sync your Real Broker account to see RevShare analytics</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Yearly Totals Summary */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {revShareMonthly.yearlyTotals.map((yt, i) => (
                    <motion.div
                      key={yt.year}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, ...springConfig }}
                    >
                      <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                        <CardContent className="p-4">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{yt.year} Total</p>
                          <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(yt.total)}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* RevShare by Month - Year Over Year Comparison */}
                <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      RevShare by Month
                    </CardTitle>
                    <CardDescription>Year-over-year monthly comparison</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={revShareMonthly.chartData} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v.toFixed(0)}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {revShareMonthly.years.map((year, i) => (
                          <Bar key={year} dataKey={year} name={year} fill={YEAR_COLORS[i % YEAR_COLORS.length]} radius={[3, 3, 0, 0]} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Cumulative RevShare Trend */}
                  <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        RevShare Trend
                      </CardTitle>
                      <CardDescription>Cumulative revenue share over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const sorted = [...revenueShares]
                          .filter(r => r.period && r.period !== 'unknown')
                          .sort((a, b) => a.period.localeCompare(b.period));
                        let cum = 0;
                        const trendData = sorted.map(r => {
                          cum += Number(r.amount);
                          const [y, m] = r.period.split('-');
                          return { period: `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m)-1]} ${y.slice(2)}`, amount: Number(r.amount), cumulative: cum };
                        });
                        return (
                          <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={trendData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                              <XAxis dataKey="period" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={Math.max(0, Math.floor(trendData.length / 8))} />
                              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v.toFixed(0)}`} />
                              <Tooltip content={<CustomTooltip />} />
                              <Area type="monotone" dataKey="cumulative" name="Cumulative RevShare" stroke="hsl(158 64% 42%)" fill="hsl(158 64% 42% / 0.15)" strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {/* RevShare by Tier */}
                  {revShareByTier.length > 0 && (
                    <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          RevShare by Tier
                        </CardTitle>
                        <CardDescription>Earned vs missed by network tier</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={revShareByTier} layout="vertical" barGap={2}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                            <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                            <YAxis type="category" dataKey="tier" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={50} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="earned" name="Earned" fill="hsl(158 64% 42%)" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="missed" name="Missed" fill="hsl(0 84% 60% / 0.6)" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-1.5">
                          {revShareByTier.map((t: any) => (
                            <div key={t.tier} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{t.tier}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">{t.contributors} contributors</span>
                                <span className="font-semibold text-foreground">{formatCurrency(t.earned)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
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
