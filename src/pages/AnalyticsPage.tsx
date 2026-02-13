import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, isWithinInterval } from 'date-fns';
import { useRevenueShare } from '@/hooks/usePlatformConnections';
import { useNetworkSummary } from '@/hooks/useNetworkData';
import { 
  BarChart3, TrendingUp, Users, DollarSign, Building2, Target,
  Calendar, PieChart, ArrowUpRight, ArrowDownRight, Filter,
  MapPin, Home, UserCheck, Briefcase,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { useSyncedTransactions } from '@/hooks/usePlatformConnections';
import { useSyncedIncome } from '@/hooks/useSyncedIncome';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell,
  Line, Area, AreaChart, ComposedChart,
} from 'recharts';

const springConfig = { type: "spring" as const, stiffness: 100, damping: 20 };

const PIE_COLORS = [
  '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'
];

// Team members who get a split (NOT the user)
const TEAM_MEMBERS = ['Ravish', 'Sarb'];
// Admin/TC - NOT treated as team member for commission purposes
const ADMIN_NAMES = ['Mary'];

// Detect if a participant is a team member (Ravish or Sarb)
function getTeamMemberFromTx(tx: any): string | null {
  try {
    const participants = tx.raw_data?.participants || [];
    for (const p of participants) {
      if (p.hidden || p.external) continue;
      if (!['BUYERS_AGENT', 'SELLERS_AGENT'].includes(p.participantRole)) continue;
      const firstName = (p.firstName || '').trim();
      if (TEAM_MEMBERS.some(tm => firstName.toLowerCase().startsWith(tm.toLowerCase()))) {
        return `${firstName} ${(p.lastName || '').trim()}`.trim();
      }
    }
  } catch {}
  return null;
}

function isAdminParticipant(p: any): boolean {
  const firstName = (p.firstName || '').trim();
  return ADMIN_NAMES.some(a => firstName.toLowerCase().startsWith(a.toLowerCase()));
}

// Get the "effective commission" for a transaction
// Solo deals: gross commission_amount
// Team deals (Ravish/Sarb): my_net_payout (user's 30%)
// Mary Sheridan TC deals: gross commission_amount (she's admin, not team)
function getEffectiveCommission(tx: any): number {
  const teamMember = getTeamMemberFromTx(tx);
  if (teamMember) {
    return Number(tx.my_net_payout || 0);
  }
  return Number(tx.commission_amount || 0);
}

const normalizeCity = (city: string | null): string => {
  if (!city) return 'Unknown';
  const trimmed = city.trim();
  const cityMap: Record<string, string> = {
    'surrey bc': 'Surrey',
    'surrey': 'Surrey',
    'new westminister': 'New Westminster',
    'new westminster district plan': 'New Westminster',
    'new westminster district plan ': 'New Westminster',
    'coquitlam': 'Coquitlam',
    'langley township': 'Langley',
  };
  const lower = trimmed.toLowerCase();
  if (cityMap[lower]) return cityMap[lower];
  return trimmed.replace(/\b\w/g, c => c.toUpperCase());
};

const isPresaleTransaction = (tx: any): boolean => {
  const addr = (tx.property_address || '').toLowerCase();
  return addr.includes('part 1/2') || addr.includes('part 2/2') || addr.includes('part 3/3');
};

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

export default function AnalyticsPage() {
  const { data: revenueShares = [] } = useRevenueShare();
  const { data: networkSummary } = useNetworkSummary();
  const { data: syncedTransactions = [] } = useSyncedTransactions();
  const { syncedPayouts, receivedYTD, comingIn } = useSyncedIncome(syncedTransactions);
  
  const [timeRange, setTimeRange] = useState<'ytd' | '12m' | '6m' | '3m' | 'all'>('12m');
  const [dealTypeFilter, setDealTypeFilter] = useState<'all' | 'presale' | 'resale'>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');

  const now = useMemo(() => new Date(), []);
  const thisYear = now.getFullYear();

  // Filter dimensions for dropdowns
  const filterDimensions = useMemo(() => {
    const citySet = new Map<string, number>();
    const agentSet = new Map<string, number>();
    syncedTransactions.forEach(tx => {
      citySet.set(normalizeCity(tx.city), (citySet.get(normalizeCity(tx.city)) || 0) + 1);
      getWritingAgents(tx).forEach(agent => {
        agentSet.set(agent, (agentSet.get(agent) || 0) + 1);
      });
    });
    return {
      cities: Array.from(citySet.entries()).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
      agents: Array.from(agentSet.entries()).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
    };
  }, [syncedTransactions]);

  // Time-filtered transactions
  const filteredTransactions = useMemo(() => {
    let txs = syncedTransactions;

    // Time range
    if (timeRange !== 'all') {
      const ranges: Record<string, Date> = {
        'ytd': new Date(thisYear, 0, 1),
        '12m': subMonths(now, 12),
        '6m': subMonths(now, 6),
        '3m': subMonths(now, 3),
      };
      const startDate = ranges[timeRange];
      if (startDate) {
        txs = txs.filter(tx => {
          const d = tx.close_date || tx.firm_date || tx.listing_date;
          return d && new Date(d) >= startDate;
        });
      }
    }

    // Deal type
    if (dealTypeFilter === 'presale') txs = txs.filter(isPresaleTransaction);
    if (dealTypeFilter === 'resale') txs = txs.filter(tx => !isPresaleTransaction(tx));

    // City
    if (cityFilter !== 'all') txs = txs.filter(tx => normalizeCity(tx.city) === cityFilter);

    // Agent
    if (agentFilter !== 'all') txs = txs.filter(tx => getWritingAgents(tx).includes(agentFilter));

    return txs;
  }, [syncedTransactions, timeRange, dealTypeFilter, cityFilter, agentFilter, thisYear, now]);

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

  // ── Core Metrics ──
  const metrics = useMemo(() => {
    const closed = filteredTransactions.filter(tx => tx.status === 'closed');
    const active = filteredTransactions.filter(tx => tx.status === 'active');
    const all = [...closed, ...active];

    // Effective commission: gross for solo, net for team deals
    const totalEffectiveCommission = all.reduce((s, tx) => s + getEffectiveCommission(tx), 0);
    const closedEffectiveCommission = closed.reduce((s, tx) => s + getEffectiveCommission(tx), 0);
    const activeEffectiveCommission = active.reduce((s, tx) => s + getEffectiveCommission(tx), 0);

    // Average sale price
    const txsWithPrice = all.filter(tx => tx.sale_price && tx.sale_price > 100);
    const avgSalePrice = txsWithPrice.length > 0 
      ? txsWithPrice.reduce((s, tx) => s + Number(tx.sale_price || 0), 0) / txsWithPrice.length 
      : 0;

    // Average commission per deal
    const avgCommission = all.length > 0 ? totalEffectiveCommission / all.length : 0;

    // Team vs Solo
    const teamTxs = all.filter(tx => getTeamMemberFromTx(tx) !== null);
    const soloTxs = all.filter(tx => getTeamMemberFromTx(tx) === null);

    return {
      totalDeals: all.length,
      closedDeals: closed.length,
      activeDeals: active.length,
      totalEffectiveCommission,
      closedEffectiveCommission,
      activeEffectiveCommission,
      avgSalePrice,
      avgCommission,
      teamDeals: teamTxs.length,
      soloDeals: soloTxs.length,
      totalVolume: all.reduce((s, tx) => s + Number(tx.sale_price || 0), 0),
    };
  }, [filteredTransactions]);

  // ── Team Member Analytics ──
  const teamMemberData = useMemo(() => {
    const members: Record<string, { 
      deals: number; 
      closedDeals: number;
      totalGCI: number; 
      userPortion: number; 
      teamPortion: number;
      avgDeal: number;
      totalVolume: number;
    }> = {};

    filteredTransactions.forEach(tx => {
      const teamMember = getTeamMemberFromTx(tx);
      if (!teamMember) return;

      if (!members[teamMember]) {
        members[teamMember] = { deals: 0, closedDeals: 0, totalGCI: 0, userPortion: 0, teamPortion: 0, avgDeal: 0, totalVolume: 0 };
      }
      const m = members[teamMember];
      m.deals++;
      if (tx.status === 'closed') m.closedDeals++;
      
      const grossGCI = Number(tx.commission_amount || 0);
      const userNet = Number(tx.my_net_payout || 0);
      m.totalGCI += grossGCI;
      m.userPortion += userNet;
      m.teamPortion += grossGCI - userNet;
      m.totalVolume += Number(tx.sale_price || 0);
    });

    return Object.entries(members)
      .map(([name, data]) => ({
        name,
        ...data,
        avgDeal: data.deals > 0 ? data.totalGCI / data.deals : 0,
      }))
      .sort((a, b) => b.deals - a.deals);
  }, [filteredTransactions]);

  // ── City Analytics ──
  const cityData = useMemo(() => {
    const cities: Record<string, { count: number; closedCount: number; totalGCI: number; avgPrice: number; prices: number[] }> = {};
    
    filteredTransactions.forEach(tx => {
      const city = normalizeCity(tx.city);
      if (!cities[city]) cities[city] = { count: 0, closedCount: 0, totalGCI: 0, avgPrice: 0, prices: [] };
      const c = cities[city];
      c.count++;
      if (tx.status === 'closed') c.closedCount++;
      c.totalGCI += getEffectiveCommission(tx);
      if (tx.sale_price && tx.sale_price > 100) c.prices.push(Number(tx.sale_price));
    });

    return Object.entries(cities)
      .map(([name, data]) => ({
        name,
        value: data.count,
        closedCount: data.closedCount,
        totalGCI: data.totalGCI,
        avgPrice: data.prices.length > 0 ? data.prices.reduce((s, p) => s + p, 0) / data.prices.length : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
  }, [filteredTransactions]);

  // ── Lead Source Analytics ──
  const leadSourceData = useMemo(() => {
    const sources: Record<string, { count: number; gci: number }> = {};
    filteredTransactions.forEach(tx => {
      const source = tx.lead_source || 'Unknown';
      if (!sources[source]) sources[source] = { count: 0, gci: 0 };
      sources[source].count++;
      sources[source].gci += getEffectiveCommission(tx);
    });
    const total = filteredTransactions.length;
    return Object.entries(sources)
      .map(([name, data]) => ({
        name,
        count: data.count,
        gci: data.gci,
        percentage: total > 0 ? (data.count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredTransactions]);

  // ── Presale vs Resale ──
  const presaleResaleData = useMemo(() => {
    const presale = filteredTransactions.filter(isPresaleTransaction);
    const resale = filteredTransactions.filter(tx => !isPresaleTransaction(tx));
    
    const getStats = (txs: any[]) => ({
      count: txs.length,
      gci: txs.reduce((s, tx) => s + getEffectiveCommission(tx), 0),
      avgCommission: txs.length > 0 ? txs.reduce((s, tx) => s + getEffectiveCommission(tx), 0) / txs.length : 0,
      volume: txs.reduce((s, tx) => s + Number(tx.sale_price || 0), 0),
    });

    return {
      presale: getStats(presale),
      resale: getStats(resale),
      comparisonData: [
        { name: 'Presale', ...getStats(presale) },
        { name: 'Resale', ...getStats(resale) },
      ],
    };
  }, [filteredTransactions]);

  // ── GCI Trends ──
  const gciTrends = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(now, monthsToShow - 1),
      end: now,
    });
    let cumulative = 0;
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthTxs = filteredTransactions.filter(tx => {
        const d = tx.close_date || tx.firm_date;
        if (!d) return false;
        return isWithinInterval(new Date(d), { start: monthStart, end: monthEnd });
      });
      const gci = monthTxs.reduce((s, tx) => s + getEffectiveCommission(tx), 0);
      cumulative += gci;
      return { month: format(month, 'MMM'), fullMonth: format(month, 'MMMM yyyy'), gci, cumulative, deals: monthTxs.length };
    });
  }, [filteredTransactions, now, monthsToShow]);

  // ── Deals by Month (firm date) ──
  const dealsByMonth = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(now, monthsToShow - 1),
      end: now,
    });
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthTxs = filteredTransactions.filter(tx => {
        const d = tx.firm_date || tx.close_date;
        if (!d) return false;
        return isWithinInterval(new Date(d), { start: monthStart, end: monthEnd });
      });
      const closed = monthTxs.filter(tx => tx.status === 'closed');
      const active = monthTxs.filter(tx => tx.status === 'active');
      return {
        month: format(month, 'MMM'),
        fullMonth: format(month, 'MMMM yyyy'),
        closed: closed.length,
        pending: active.length,
        total: monthTxs.length,
        gci: monthTxs.reduce((s, tx) => s + getEffectiveCommission(tx), 0),
      };
    });
  }, [filteredTransactions, now, monthsToShow]);

  // ── RevShare by Month ──
  const revShareMonthly = useMemo(() => {
    const byYearMonth: Record<string, Record<number, number>> = {};
    revenueShares.forEach(rs => {
      if (!rs.period || rs.period === 'unknown') return;
      const [yearStr, monthStr] = rs.period.split('-');
      if (!byYearMonth[yearStr]) byYearMonth[yearStr] = {};
      byYearMonth[yearStr][parseInt(monthStr)] = (byYearMonth[yearStr][parseInt(monthStr)] || 0) + Number(rs.amount);
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
              {entry.name}: {typeof entry.value === 'number' && entry.value > 100
                ? formatCurrency(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const hasFilters = dealTypeFilter !== 'all' || cityFilter !== 'all' || agentFilter !== 'all';

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
        <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
            {hasFilters && (
              <button 
                onClick={() => { setDealTypeFilter('all'); setCityFilter('all'); setAgentFilter('all'); }}
                className="ml-auto text-xs text-primary hover:underline font-medium"
              >
                Clear all
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
              <SelectTrigger className="w-[130px] h-9 rounded-lg bg-background border-border/50 text-sm">
                <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/50" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="ytd">Year to Date</SelectItem>
                <SelectItem value="12m">Last 12 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dealTypeFilter} onValueChange={(v: any) => setDealTypeFilter(v)}>
              <SelectTrigger className="w-[120px] h-9 rounded-lg bg-background border-border/50 text-sm">
                <Home className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/50" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="presale">Presale</SelectItem>
                <SelectItem value="resale">Resale</SelectItem>
              </SelectContent>
            </Select>

            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[150px] h-9 rounded-lg bg-background border-border/50 text-sm">
                <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/50" />
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent className="rounded-lg max-h-[300px]">
                <SelectItem value="all">All Cities</SelectItem>
                {filterDimensions.cities.map(c => (
                  <SelectItem key={c.name} value={c.name}>{c.name} ({c.count})</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {filterDimensions.agents.length > 1 && (
              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger className="w-[170px] h-9 rounded-lg bg-background border-border/50 text-sm">
                  <UserCheck className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/50" />
                  <SelectValue placeholder="All Agents" />
                </SelectTrigger>
                <SelectContent className="rounded-lg max-h-[300px]">
                  <SelectItem value="all">All Agents</SelectItem>
                  {filterDimensions.agents.map(a => (
                    <SelectItem key={a.name} value={a.name}>{a.name} ({a.count})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {hasFilters && (
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-primary">{filteredTransactions.length}</span> of {syncedTransactions.length} transactions
            </p>
          )}
        </div>

        {/* ── Key Metrics ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Total Deals', value: metrics.totalDeals.toString(), sub: `${metrics.closedDeals} closed · ${metrics.activeDeals} active`, icon: Briefcase, color: 'text-foreground' },
            { label: 'Earned', value: formatCurrency(metrics.closedEffectiveCommission), sub: `From ${metrics.closedDeals} closed deals`, icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Pipeline', value: formatCurrency(metrics.activeEffectiveCommission), sub: `${metrics.activeDeals} pending`, icon: TrendingUp, color: 'text-primary' },
            { label: 'Avg Sale Price', value: formatCurrency(metrics.avgSalePrice), sub: 'Per transaction', icon: Building2, color: 'text-foreground' },
            { label: 'Avg Commission', value: formatCurrency(metrics.avgCommission), sub: 'Per deal (effective)', icon: Target, color: 'text-foreground' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, ...springConfig }}
              className="rounded-xl border border-border/60 bg-card p-4 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-muted-foreground/40" />
              </div>
              <p className={cn("text-xl font-bold tracking-tight", stat.color)}>{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Main Tabs ── */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-auto inline-flex h-10 p-1 bg-muted/40 rounded-lg border border-border/30">
            <TabsTrigger value="overview" className="text-sm font-medium px-3 rounded-md">Overview</TabsTrigger>
            <TabsTrigger value="cities" className="text-sm font-medium px-3 rounded-md">Cities</TabsTrigger>
            <TabsTrigger value="deals" className="text-sm font-medium px-3 rounded-md">Deal Flow</TabsTrigger>
            <TabsTrigger value="team" className="text-sm font-medium px-3 rounded-md">Team</TabsTrigger>
            <TabsTrigger value="revshare" className="text-sm font-medium px-3 rounded-md">RevShare</TabsTrigger>
          </TabsList>

          {/* ═══ Overview Tab ═══ */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* GCI Trend */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    GCI Trend
                  </CardTitle>
                  <CardDescription>Monthly and cumulative effective commission</CardDescription>
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

              {/* Presale vs Resale */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Presale vs Resale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {presaleResaleData.comparisonData.map(type => (
                      <div 
                        key={type.name}
                        className="p-3 rounded-lg bg-muted/30 border border-border/40 cursor-pointer hover:border-primary/30 transition-all"
                        onClick={() => setDealTypeFilter(type.name.toLowerCase() as 'presale' | 'resale')}
                      >
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-2">{type.name}</p>
                        <p className="text-2xl font-bold">{type.count}</p>
                        <p className="text-sm text-primary font-semibold mt-1">{formatCurrency(type.gci)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Avg: {formatCurrency(type.avgCommission)}</p>
                      </div>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={presaleResaleData.comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="gci" name="Total GCI" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Lead Sources */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-primary" />
                  Lead Sources
                </CardTitle>
                <CardDescription>Where your deals come from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="count">
                        {leadSourceData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto">
                    {leadSourceData.map((source, i) => (
                      <div key={source.name} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/30">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <div>
                            <p className="text-sm font-medium">{source.name}</p>
                            <p className="text-xs text-muted-foreground">{source.count} deals · {source.percentage.toFixed(0)}%</p>
                          </div>
                        </div>
                        <p className="font-semibold text-sm">{formatCurrency(source.gci)}</p>
                      </div>
                    ))}
                    {leadSourceData.length === 0 && (
                      <p className="text-center text-muted-foreground py-6">No lead source data</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ Cities Tab ═══ */}
          <TabsContent value="cities" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* City Bar Chart */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4 text-primary" />
                    Deals by City
                  </CardTitle>
                  <CardDescription>Click a bar to filter</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={Math.max(250, cityData.length * 35)}>
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
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Deals" fill="hsl(217 91% 60%)" radius={[0, 4, 4, 0]} style={{ cursor: 'pointer' }} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* City Details Table */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">City Performance</CardTitle>
                  <CardDescription>Average sale price & commission by city</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {cityData.map((city, i) => (
                      <div 
                        key={city.name} 
                        className="p-3 rounded-lg bg-muted/20 border border-border/30 cursor-pointer hover:border-primary/30 transition-all"
                        onClick={() => setCityFilter(city.name)}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="font-semibold text-sm">{city.name}</p>
                          <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                            {city.value} deals
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Closed</p>
                            <p className="font-semibold">{city.closedCount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg Price</p>
                            <p className="font-semibold">{city.avgPrice > 0 ? formatCurrency(city.avgPrice) : '—'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total GCI</p>
                            <p className="font-semibold text-primary">{formatCurrency(city.totalGCI)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══ Deal Flow Tab ═══ */}
          <TabsContent value="deals" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4 text-primary" />
                    Deals by Month
                  </CardTitle>
                  <CardDescription>Closed vs pending by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dealsByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="closed" name="Closed" stackId="a" fill="hsl(142 76% 36%)" />
                      <Bar dataKey="pending" name="Pending" stackId="a" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Monthly GCI
                  </CardTitle>
                  <CardDescription>Commission earned by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dealsByMonth}>
                      <defs>
                        <linearGradient id="gciGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(158 64% 42%)" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(158 64% 42%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="gci" name="GCI" stroke="hsl(158 64% 42%)" fill="url(#gciGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══ Team Tab ═══ */}
          <TabsContent value="team" className="space-y-6">
            {/* Team Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Solo Deals', value: metrics.soloDeals },
                { label: 'Team Deals', value: metrics.teamDeals },
                { label: 'Team Members', value: teamMemberData.length },
                { label: 'Team Revenue', value: formatCurrency(teamMemberData.reduce((s, m) => s + m.userPortion, 0)) },
              ].map(stat => (
                <Card key={stat.label} className="border-border/50">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {teamMemberData.length > 0 ? (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Team Performance Chart */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="h-4 w-4 text-primary" />
                      Team Performance
                    </CardTitle>
                    <CardDescription>GCI split by team member</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={teamMemberData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                        <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                        <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="userPortion" name="Your Portion" stackId="a" fill="hsl(158 64% 42%)" />
                        <Bar dataKey="teamPortion" name="Their Portion" stackId="a" fill="hsl(217 91% 60%)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Team Member Cards */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-base">Team Member Details</CardTitle>
                    <CardDescription>Individual performance breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[350px] overflow-y-auto">
                      {teamMemberData.map(member => (
                        <div key={member.name} className="p-4 rounded-lg bg-muted/20 border border-border/30">
                          <div className="flex items-center justify-between mb-3">
                            <p className="font-semibold">{member.name}</p>
                            <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                              {member.deals} deals ({member.closedDeals} closed)
                            </span>
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">Total GCI</p>
                              <p className="font-bold">{formatCurrency(member.totalGCI)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Your Share</p>
                              <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(member.userPortion)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Their Share</p>
                              <p className="font-bold">{formatCurrency(member.teamPortion)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Avg Deal</p>
                              <p className="font-bold">{formatCurrency(member.avgDeal)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-border/50">
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No team deals found</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Deals with Ravish or Sarb will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ═══ RevShare Tab ═══ */}
          <TabsContent value="revshare" className="space-y-6">
            {revenueShares.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="py-12 text-center">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No revenue share data yet</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {revShareMonthly.yearlyTotals.map((yt, i) => (
                    <motion.div key={yt.year} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, ...springConfig }}>
                      <Card className="border-border/50">
                        <CardContent className="p-4">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{yt.year} Total</p>
                          <p className="text-xl font-bold mt-1">{formatCurrency(yt.total)}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      RevShare by Month
                    </CardTitle>
                    <CardDescription>Year-over-year comparison</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={revShareMonthly.chartData} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v.toFixed(0)}`} />
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
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Cumulative RevShare
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const sorted = [...revenueShares].filter(r => r.period && r.period !== 'unknown').sort((a, b) => a.period.localeCompare(b.period));
                        let cum = 0;
                        const trendData = sorted.map(r => {
                          cum += Number(r.amount);
                          const [y, m] = r.period.split('-');
                          return { period: `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m)-1]} ${y.slice(2)}`, cumulative: cum };
                        });
                        return (
                          <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={trendData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                              <XAxis dataKey="period" tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor(trendData.length / 8))} />
                              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                              <Tooltip content={<CustomTooltip />} />
                              <Area type="monotone" dataKey="cumulative" name="Cumulative" stroke="hsl(158 64% 42%)" fill="hsl(158 64% 42% / 0.15)" strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {revShareByTier.length > 0 && (
                    <Card className="border-border/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Users className="h-4 w-4 text-primary" />
                          RevShare by Tier
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={revShareByTier} layout="vertical" barGap={2}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                            <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                            <YAxis type="category" dataKey="tier" tick={{ fontSize: 12 }} width={50} />
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
                                <span className="font-semibold">{formatCurrency(t.earned)}</span>
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
