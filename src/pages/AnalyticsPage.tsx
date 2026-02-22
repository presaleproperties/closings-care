import { useMemo } from 'react';
import { DealsWrittenCard } from '@/components/dashboard/DealsWrittenCard';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, Building2, Target,
  Calendar, Users, MapPin, Home, UserCheck, Filter,
  BarChart3, Briefcase, ArrowUpRight, ArrowDownRight, PieChart,
  ChevronRight,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { useAnalyticsData, type TimeRange } from '@/hooks/useAnalyticsData';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useRefreshData } from '@/hooks/useRefreshData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell,
  Area, AreaChart, ComposedChart, Line,
} from 'recharts';

const PIE_COLORS = [
  'hsl(158, 64%, 42%)', 'hsl(38, 92%, 50%)', 'hsl(217, 91%, 60%)',
  'hsl(280, 68%, 58%)', 'hsl(0, 84%, 60%)', 'hsl(190, 90%, 50%)',
  'hsl(330, 80%, 60%)', 'hsl(90, 65%, 45%)',
];
const YEAR_COLORS = ['hsl(158, 64%, 42%)', 'hsl(38, 92%, 50%)', 'hsl(217, 91%, 60%)', 'hsl(280, 68%, 58%)'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function ChangeIndicator({ current, previous, format: fmt = 'percent' }: { current: number; previous: number; format?: 'percent' | 'number' }) {
  if (previous === 0) return null;
  const change = ((current - previous) / previous) * 100;
  const isPositive = change >= 0;
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold",
      isPositive ? "text-emerald-600" : "text-rose-600"
    )}>
      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(change).toFixed(0)}%
    </span>
  );
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover/95 backdrop-blur-xl border border-border/50 rounded-xl p-3 shadow-xl">
      <p className="font-semibold text-sm mb-1.5">{payload[0]?.payload?.fullMonth || label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}: {typeof entry.value === 'number' && entry.value > 100
            ? formatCurrency(entry.value)
            : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const data = useAnalyticsData();
  const refreshData = useRefreshData();
  const {
    timeRange, setTimeRange, selectedYear, setSelectedYear,
    dealTypeFilter, setDealTypeFilter, cityFilter, setCityFilter,
    agentFilter, setAgentFilter,
    syncedTransactions, filteredTransactions,
    availableYears, filterDimensions, hasFilters,
    metrics, previousMetrics, teamMemberData,
    cityData, leadSourceData, presaleResaleData,
    gciTrends, dealsByMonth, revShareMonthly, revShareByTier,
    revenueShares,
  } = data;

  const subtitle = useMemo(() => {
    if (timeRange === 'year') return `${selectedYear} Performance`;
    if (timeRange === 'ytd') return `${new Date().getFullYear()} Year-to-Date`;
    if (timeRange === 'all') return 'All-Time Performance';
    return `Last ${timeRange.toUpperCase()} Performance`;
  }, [timeRange, selectedYear]);

  return (
    <AppLayout>
      <Header title="Analytics" subtitle={subtitle} />

      <PullToRefresh onRefresh={refreshData} className="min-h-[calc(100vh-56px)]">
      <motion.div
        className="p-4 sm:p-5 md:p-6 lg:p-6 space-y-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Time Range Pills ── */}
        <motion.div variants={itemVariants} className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1">
          {(['all', 'ytd', '12m', '6m', '3m'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap",
                timeRange === range
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {range === 'all' ? 'All' : range === 'ytd' ? 'YTD' : range.toUpperCase()}
            </button>
          ))}
          <div className="w-px h-5 bg-border mx-0.5" />
          {availableYears.map(year => (
            <button
              key={year}
              onClick={() => { setTimeRange('year'); setSelectedYear(year); }}
              className={cn(
                "px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap",
                timeRange === 'year' && selectedYear === year
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {year}
            </button>
          ))}
        </motion.div>

        {/* ── Filters ── */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 mr-1">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Filter:</span>
          </div>
          <Select value={dealTypeFilter} onValueChange={(v: any) => setDealTypeFilter(v)}>
            <SelectTrigger className="w-[110px] h-8 rounded-full bg-muted/30 border-border/30 text-xs">
              <Home className="h-3 w-3 mr-1 text-muted-foreground/50" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="presale">Presale</SelectItem>
              <SelectItem value="resale">Resale</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-[130px] h-8 rounded-full bg-muted/30 border-border/30 text-xs">
              <MapPin className="h-3 w-3 mr-1 text-muted-foreground/50" />
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
              <SelectTrigger className="w-[150px] h-8 rounded-full bg-muted/30 border-border/30 text-xs">
                <UserCheck className="h-3 w-3 mr-1 text-muted-foreground/50" />
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
          {hasFilters && (
            <>
              <button
                onClick={() => { setDealTypeFilter('all'); setCityFilter('all'); setAgentFilter('all'); }}
                className="text-xs text-primary hover:underline font-medium ml-1"
              >
                Clear
              </button>
              <span className="text-[10px] text-muted-foreground ml-1">
                {filteredTransactions.length} of {syncedTransactions.length}
              </span>
            </>
          )}
        </motion.div>

        {/* ── Hero Stats ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {/* Total Deals */}
          <div className="landing-card p-3 sm:p-4 bg-gradient-to-br from-primary/8 to-primary/3 border-primary/15">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="p-1 sm:p-1.5 rounded-lg bg-primary/15">
                <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Deals</span>
            </div>
            <div className="flex items-baseline gap-2">
              <AnimatedNumber value={metrics.totalDeals} className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground" duration={1} />
              <ChangeIndicator current={metrics.totalDeals} previous={previousMetrics.totalDeals} />
            </div>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">
              {metrics.closedDeals} closed · {metrics.activeDeals} active
            </p>
          </div>

          {/* Earned */}
          <div className="landing-card p-3 sm:p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="p-1 sm:p-1.5 rounded-lg bg-emerald-500/20">
                <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Earned</span>
            </div>
            <div className="flex items-baseline gap-2">
              <AnimatedNumber value={metrics.closedEffectiveCommission} className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600" duration={1.2} />
              <ChangeIndicator current={metrics.closedEffectiveCommission} previous={previousMetrics.totalGCI} />
            </div>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">From {metrics.closedDeals} closed</p>
          </div>

          {/* Pipeline */}
          <div className="landing-card p-3 sm:p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-500/20">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="p-1 sm:p-1.5 rounded-lg bg-blue-500/20">
                <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Pipeline</span>
            </div>
            <AnimatedNumber value={metrics.activeEffectiveCommission} className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600" duration={1.2} />
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">{metrics.activeDeals} pending</p>
          </div>

          {/* Avg Sale Price */}
          <div className="landing-card p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="p-1 sm:p-1.5 rounded-lg bg-muted">
                <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Avg Price</span>
            </div>
            <AnimatedNumber value={metrics.avgSalePrice} className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground" duration={1.2} />
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">Per transaction</p>
          </div>

          {/* Avg Commission */}
          <div className="landing-card p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="p-1 sm:p-1.5 rounded-lg bg-muted">
                <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Avg Comm.</span>
            </div>
            <AnimatedNumber value={metrics.avgCommission} className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground" duration={1.2} />
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">Per deal (effective)</p>
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="overview" className="space-y-4">
          <motion.div variants={itemVariants}>
            <TabsList className="w-auto inline-flex h-9 p-0.5 bg-muted/30 rounded-xl border border-border/30 overflow-x-auto max-w-full">
              <TabsTrigger value="overview" className="text-xs sm:text-sm font-medium px-2.5 sm:px-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">Overview</TabsTrigger>
              <TabsTrigger value="sources" className="text-xs sm:text-sm font-medium px-2.5 sm:px-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">Sources</TabsTrigger>
              <TabsTrigger value="deals" className="text-xs sm:text-sm font-medium px-2.5 sm:px-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">Deal Flow</TabsTrigger>
              <TabsTrigger value="team" className="text-xs sm:text-sm font-medium px-2.5 sm:px-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">Team</TabsTrigger>
              <TabsTrigger value="revshare" className="text-xs sm:text-sm font-medium px-2.5 sm:px-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">RevShare</TabsTrigger>
            </TabsList>
          </motion.div>

          {/* ═══ OVERVIEW ═══ */}
          <TabsContent value="overview" className="space-y-4">
            {/* GCI Trend */}
            <motion.div variants={itemVariants} className="landing-card p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                    GCI Trend
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Monthly + cumulative effective commission</p>
                </div>
              </div>
              <div className="h-52 sm:h-64 lg:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={gciTrends}>
                    <defs>
                      <linearGradient id="gciBarGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(158, 64%, 42%)" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(158, 64%, 42%)" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} width={50} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="gci" name="Monthly GCI" fill="url(#gciBarGrad)" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="cumulative" name="Cumulative" stroke="hsl(38, 92%, 50%)" strokeWidth={2.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-5 mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'hsl(158, 64%, 42%)' }} />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Monthly GCI</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'hsl(38, 92%, 50%)' }} />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Cumulative</span>
                </div>
              </div>
            </motion.div>

            {/* Presale vs Resale */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {presaleResaleData.comparisonData.map(type => (
                <div
                  key={type.name}
                  className={cn(
                    "landing-card p-4 cursor-pointer transition-all hover:shadow-md",
                    type.name === 'Presale'
                      ? "bg-gradient-to-br from-blue-500/8 to-indigo-500/3 border-blue-500/15"
                      : "bg-gradient-to-br from-amber-500/8 to-orange-500/3 border-amber-500/15"
                  )}
                  onClick={() => setDealTypeFilter(type.name.toLowerCase() as 'presale' | 'resale')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{type.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-2xl font-bold">{type.count}</p>
                      <p className="text-[10px] text-muted-foreground">Deals</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-primary">{formatCurrency(type.gci)}</p>
                      <p className="text-[10px] text-muted-foreground">Total GCI</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{formatCurrency(type.avgCommission)}</p>
                      <p className="text-[10px] text-muted-foreground">Avg Commission</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </TabsContent>

          {/* ═══ SOURCES ═══ */}
          <TabsContent value="sources" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Lead Sources */}
              <motion.div variants={itemVariants} className="landing-card p-3 sm:p-4 lg:p-6">
                <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 mb-1">
                  <PieChart className="w-3.5 h-3.5 text-primary" />
                  Lead Sources
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-3">Where your deals come from</p>

                {leadSourceData.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="count">
                            {leadSourceData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full space-y-1.5 mt-2">
                      {leadSourceData.map((source, i) => (
                        <div key={source.name} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span className="text-xs font-medium">{source.name}</span>
                            <span className="text-[10px] text-muted-foreground">{source.count} · {source.percentage.toFixed(0)}%</span>
                          </div>
                          <span className="text-xs font-semibold">{formatCurrency(source.gci)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8 text-sm">No lead source data</p>
                )}
              </motion.div>

              {/* City Distribution */}
              <motion.div variants={itemVariants} className="landing-card p-3 sm:p-4 lg:p-6">
                <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  Cities
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-3">Click a city to filter</p>

                <div className="h-[calc(100%-3rem)] min-h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={cityData}
                      layout="vertical"
                      onClick={(state: any) => {
                        if (state?.activeTooltipIndex !== undefined && cityData[state.activeTooltipIndex]) {
                          setCityFilter(cityData[state.activeTooltipIndex].name);
                        }
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="value" name="Deals" fill="hsl(217, 91%, 60%)" radius={[0, 6, 6, 0]} style={{ cursor: 'pointer' }} opacity={0.85} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* City Performance Table */}
            <motion.div variants={itemVariants} className="landing-card overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-border">
                <h3 className="text-xs sm:text-sm font-semibold">City Performance</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Average price & commission by market</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/30">
                {cityData.map(city => (
                  <div
                    key={city.name}
                    className="p-3 sm:p-4 bg-card cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() => setCityFilter(city.name)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{city.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{city.value} deals</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground text-[10px]">Closed</p>
                        <p className="font-semibold">{city.closedCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px]">Avg Price</p>
                        <p className="font-semibold">{city.avgPrice > 0 ? formatCurrency(city.avgPrice) : '—'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px]">GCI</p>
                        <p className="font-semibold text-primary">{formatCurrency(city.totalGCI)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* ═══ DEAL FLOW ═══ */}
          <TabsContent value="deals" className="space-y-4">
            {/* Deals Written Tracker */}
            <motion.div variants={itemVariants}>
              <DealsWrittenCard syncedTransactions={filteredTransactions} />
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* Deals by Month */}
              <motion.div variants={itemVariants} className="landing-card p-3 sm:p-4 lg:p-6">
                <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Deals by Month
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-3">Closed vs pending by firm date</p>
                <div className="h-56 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dealsByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="closed" name="Closed" stackId="a" fill="hsl(158, 64%, 42%)" opacity={0.85} />
                      <Bar dataKey="pending" name="Pending" stackId="a" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} opacity={0.85} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-5 mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'hsl(158, 64%, 42%)' }} />
                    <span className="text-[10px] sm:text-xs text-muted-foreground">Closed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'hsl(38, 92%, 50%)' }} />
                    <span className="text-[10px] sm:text-xs text-muted-foreground">Pending</span>
                  </div>
                </div>
              </motion.div>

              {/* Monthly GCI Area */}
              <motion.div variants={itemVariants} className="landing-card p-3 sm:p-4 lg:p-6">
                <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-primary" />
                  Monthly GCI
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-3">Commission earned by month</p>
                <div className="h-56 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dealsByMonth}>
                      <defs>
                        <linearGradient id="gciAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(158, 64%, 42%)" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="hsl(158, 64%, 42%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} width={50} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="gci" name="GCI" stroke="hsl(158, 64%, 42%)" fill="url(#gciAreaGrad)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </TabsContent>

          {/* ═══ TEAM ═══ */}
          <TabsContent value="team" className="space-y-4">
            {/* Team Summary Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {[
                { label: 'Solo', value: metrics.soloDeals, color: 'from-emerald-500/8 border-emerald-500/15' },
                { label: 'Team', value: metrics.teamDeals, color: 'from-blue-500/8 border-blue-500/15' },
                { label: 'Members', value: teamMemberData.length, color: '' },
                { label: 'Team Rev', value: formatCurrency(teamMemberData.reduce((s, m) => s + m.userPortion, 0)), color: 'from-emerald-500/8 border-emerald-500/15' },
              ].map(stat => (
                <div key={stat.label} className={cn("landing-card p-3 sm:p-4 bg-gradient-to-br", stat.color)}>
                  <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</span>
                  <p className="text-lg sm:text-xl font-bold mt-1">{stat.value}</p>
                </div>
              ))}
            </motion.div>

            {teamMemberData.length > 0 ? (
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Performance Chart */}
                <motion.div variants={itemVariants} className="landing-card p-3 sm:p-4 lg:p-6">
                  <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 mb-1">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    GCI Split
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-3">Your portion vs theirs</p>
                  <div className="h-56 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={teamMemberData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
                        <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="userPortion" name="Your Portion" stackId="a" fill="hsl(158, 64%, 42%)" opacity={0.85} />
                        <Bar dataKey="teamPortion" name="Their Portion" stackId="a" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} opacity={0.85} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-5 mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'hsl(158, 64%, 42%)' }} />
                      <span className="text-[10px] sm:text-xs text-muted-foreground">Your Portion</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'hsl(217, 91%, 60%)' }} />
                      <span className="text-[10px] sm:text-xs text-muted-foreground">Their Portion</span>
                    </div>
                  </div>
                </motion.div>

                {/* Team Member Cards */}
                <motion.div variants={itemVariants} className="space-y-2 sm:space-y-3">
                  {teamMemberData.map(member => (
                    <div key={member.name} className="landing-card p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{member.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {member.deals} deals ({member.closedDeals} closed)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Total GCI</p>
                          <p className="font-bold">{formatCurrency(member.totalGCI)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Your Share</p>
                          <p className="font-bold text-emerald-600">{formatCurrency(member.userPortion)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Their Share</p>
                          <p className="font-bold">{formatCurrency(member.teamPortion)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Avg Deal</p>
                          <p className="font-bold">{formatCurrency(member.avgDeal)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            ) : (
              <motion.div variants={itemVariants} className="landing-card p-12 text-center">
                <Users className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground text-sm">No team deals found in this period</p>
              </motion.div>
            )}
          </TabsContent>

          {/* ═══ REVSHARE ═══ */}
          <TabsContent value="revshare" className="space-y-4">
            {revenueShares.length === 0 ? (
              <motion.div variants={itemVariants} className="landing-card p-12 text-center">
                <DollarSign className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground text-sm">No revenue share data yet</p>
              </motion.div>
            ) : (
              <>
                {/* Yearly Totals */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                  {revShareMonthly.yearlyTotals.map((yt, i) => (
                    <div key={yt.year} className="landing-card p-3 sm:p-4 bg-gradient-to-br from-emerald-500/8 to-teal-500/3 border-emerald-500/15">
                      <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{yt.year}</span>
                      <AnimatedNumber value={yt.total} className="text-lg sm:text-xl font-bold text-emerald-600 mt-1" duration={1} />
                    </div>
                  ))}
                </motion.div>

                {/* YoY Comparison Chart */}
                <motion.div variants={itemVariants} className="landing-card p-3 sm:p-4 lg:p-6">
                  <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 mb-1">
                    <BarChart3 className="w-3.5 h-3.5 text-primary" />
                    RevShare by Month
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-3">Year-over-year comparison</p>
                  <div className="h-56 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revShareMonthly.chartData} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v.toFixed(0)}`} tickLine={false} axisLine={false} width={50} />
                        <Tooltip content={<ChartTooltip />} />
                        {revShareMonthly.years.map((year, i) => (
                          <Bar key={year} dataKey={year} name={year} fill={YEAR_COLORS[i % YEAR_COLORS.length]} radius={[3, 3, 0, 0]} opacity={0.85} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-5 mt-3 pt-3 border-t border-border">
                    {revShareMonthly.years.map((year, i) => (
                      <div key={year} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: YEAR_COLORS[i % YEAR_COLORS.length] }} />
                        <span className="text-[10px] sm:text-xs text-muted-foreground">{year}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Cumulative + Tier */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <motion.div variants={itemVariants} className="landing-card p-3 sm:p-4 lg:p-6">
                    <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 mb-1">
                      <TrendingUp className="w-3.5 h-3.5 text-primary" />
                      Cumulative RevShare
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-3">All-time growth</p>
                    {(() => {
                      const sorted = [...revenueShares].filter(r => r.period && r.period !== 'unknown').sort((a, b) => a.period.localeCompare(b.period));
                      let cum = 0;
                      const trendData = sorted.map(r => {
                        cum += Number(r.amount);
                        const [y, m] = r.period.split('-');
                        return { period: `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(m) - 1]} ${y.slice(2)}`, cumulative: cum };
                      });
                      return (
                        <div className="h-52 sm:h-60">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                              <defs>
                                <linearGradient id="cumRevGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(158, 64%, 42%)" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="hsl(158, 64%, 42%)" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                              <XAxis dataKey="period" tick={{ fontSize: 9 }} interval={Math.max(0, Math.floor(trendData.length / 8))} tickLine={false} axisLine={false} />
                              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v.toFixed(0)}`} tickLine={false} axisLine={false} width={50} />
                              <Tooltip content={<ChartTooltip />} />
                              <Area type="monotone" dataKey="cumulative" name="Cumulative" stroke="hsl(158, 64%, 42%)" fill="url(#cumRevGrad)" strokeWidth={2.5} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      );
                    })()}
                  </motion.div>

                  {revShareByTier.length > 0 && (
                    <motion.div variants={itemVariants} className="landing-card p-3 sm:p-4 lg:p-6">
                      <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 mb-1">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        By Tier
                      </h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-3">Earned vs missed by tier</p>
                      <div className="h-48 sm:h-52">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={revShareByTier} layout="vertical" barGap={2}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
                            <YAxis type="category" dataKey="tier" tick={{ fontSize: 11 }} width={50} tickLine={false} axisLine={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="earned" name="Earned" fill="hsl(158, 64%, 42%)" radius={[0, 4, 4, 0]} opacity={0.85} />
                            <Bar dataKey="missed" name="Missed" fill="hsl(0, 84%, 60%)" radius={[0, 4, 4, 0]} opacity={0.5} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                        {revShareByTier.map((t: any) => (
                          <div key={t.tier} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{t.tier}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-muted-foreground">{t.contributors} agents</span>
                              <span className="font-semibold text-emerald-600">{formatCurrency(t.earned)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
      </PullToRefresh>
    </AppLayout>
  );
}
