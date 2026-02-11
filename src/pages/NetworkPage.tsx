import { AppLayout } from '@/components/layout/AppLayout';
import { useNetworkAgents, useNetworkSummary } from '@/hooks/useNetworkData';
import { useRevenueShare } from '@/hooks/usePlatformConnections';
import { formatCurrency } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AgentDirectory } from '@/components/network/AgentDirectory';
import { SponsorTree } from '@/components/network/SponsorTree';
import { TopPerformers } from '@/components/network/TopPerformers';
import { Users, TrendingUp, Layers, Clock, DollarSign, UserPlus, UserMinus, Network, Trophy } from 'lucide-react';
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';

const TIER_COLORS = [
  'hsl(158, 64%, 32%)', // emerald
  'hsl(175, 60%, 38%)', // teal
  'hsl(38, 75%, 50%)',  // gold
  'hsl(280, 60%, 50%)', // purple
  'hsl(200, 70%, 50%)', // blue
];

export default function NetworkPage() {
  const { data: agents = [], isLoading: agentsLoading } = useNetworkAgents();
  const { data: summary } = useNetworkSummary();
  const { data: revenueShare = [] } = useRevenueShare();

  const fmt = (v: number) => formatCurrency(v);

  // Top 10 agents by revenue
  const top10Revenue = useMemo(() => {
    const agentTotals: Record<string, { name: string; total: number; tier: number }> = {};
    revenueShare.forEach((rs: any) => {
      if (!agentTotals[rs.agent_name]) {
        agentTotals[rs.agent_name] = { name: rs.agent_name, total: 0, tier: rs.tier };
      }
      agentTotals[rs.agent_name].total += Number(rs.amount) || 0;
    });
    return Object.values(agentTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [revenueShare]);

  // Network size by tier
  const tierData = useMemo(() => {
    const tiers: Record<number, number> = {};
    agents.forEach(a => {
      tiers[a.tier] = (tiers[a.tier] || 0) + 1;
    });
    return Object.entries(tiers).map(([tier, count]) => ({
      name: `Tier ${tier}`,
      value: count,
      tier: Number(tier),
    })).sort((a, b) => a.tier - b.tier);
  }, [agents]);

  // Agent additions/departures
  const movementData = useMemo(() => {
    const months: Record<string, { month: string; additions: number; departures: number }> = {};
    agents.forEach(a => {
      if (a.join_date) {
        const m = a.join_date.slice(0, 7);
        if (!months[m]) months[m] = { month: m, additions: 0, departures: 0 };
        months[m].additions++;
      }
      // Use departure_date if available, otherwise use updated_at for INACTIVE agents
      const departureMonth = a.departure_date
        ? a.departure_date.slice(0, 7)
        : (a.status === 'INACTIVE' && a.updated_at ? a.updated_at.slice(0, 7) : null);
      if (departureMonth) {
        if (!months[departureMonth]) months[departureMonth] = { month: departureMonth, additions: 0, departures: 0 };
        months[departureMonth].departures++;
      }
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);
  }, [agents]);

  // Days with brokerage distribution
  const daysDistribution = useMemo(() => {
    const buckets = [
      { label: '0-90', min: 0, max: 90, count: 0 },
      { label: '91-180', min: 91, max: 180, count: 0 },
      { label: '181-365', min: 181, max: 365, count: 0 },
      { label: '1-2 yrs', min: 366, max: 730, count: 0 },
      { label: '2+ yrs', min: 731, max: Infinity, count: 0 },
    ];
    agents.forEach(a => {
      const days = a.days_with_brokerage;
      if (days != null) {
        const bucket = buckets.find(b => days >= b.min && days <= b.max);
        if (bucket) bucket.count++;
      }
    });
    return buckets.map(b => ({ name: b.label, value: b.count }));
  }, [agents]);

  // RevShare by month/year
  const revShareByMonth = useMemo(() => {
    const months: Record<string, number> = {};
    revenueShare.forEach((rs: any) => {
      const period = rs.period || '';
      const m = period.slice(0, 7);
      if (m) months[m] = (months[m] || 0) + (Number(rs.amount) || 0);
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-24)
      .map(([month, amount]) => ({ month, amount }));
  }, [revenueShare]);

  // RevShare by year
  const revShareByYear = useMemo(() => {
    const years: Record<string, number> = {};
    revenueShare.forEach((rs: any) => {
      const period = rs.period || '';
      const y = period.slice(0, 4);
      if (y) years[y] = (years[y] || 0) + (Number(rs.amount) || 0);
    });
    return Object.entries(years)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, amount]) => ({ year, amount }));
  }, [revenueShare]);

  const activeAgents = agents.filter(a => a.status === 'ACTIVE' && !a.departure_date);
  const departedAgents = agents.filter(a => a.status !== 'ACTIVE' || !!a.departure_date);
  const totalRevShare = revenueShare.reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0);

  const tooltipStyle = {
    contentStyle: {
      background: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '12px',
      fontSize: '12px',
      boxShadow: '0 8px 24px -8px hsl(220 25% 10% / 0.15)',
    },
  };

  if (agentsLoading) {
    return (
      <AppLayout>
        <div className="p-4 lg:p-8">
          <div className="text-muted-foreground">Loading network data...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">Network</h1>
          <p className="text-muted-foreground text-sm mt-1">Your Real Broker network & revenue share overview</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Card className="kpi-card">
            <CardContent className="p-4 lg:p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Agents</p>
                  <p className="text-xl font-bold text-foreground">{agents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="kpi-card">
            <CardContent className="p-4 lg:p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Active</p>
                  <p className="text-xl font-bold text-foreground">{activeAgents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="kpi-card">
            <CardContent className="p-4 lg:p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <UserMinus className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Departed</p>
                  <p className="text-xl font-bold text-foreground">{departedAgents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="kpi-card">
            <CardContent className="p-4 lg:p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total RevShare</p>
                  <p className="text-xl font-bold text-foreground">{fmt(totalRevShare)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="top">Top Performers</TabsTrigger>
            <TabsTrigger value="tree">Tree</TabsTrigger>
            <TabsTrigger value="revshare">RevShare</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top 10 Revenue */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Top 10 Agents Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {top10Revenue.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No revenue share data yet. Sync your Real Broker account to see data.</p>
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={top10Revenue} layout="vertical" margin={{ left: 80, right: 20, top: 5, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                          <XAxis type="number" tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={75} />
                          <Tooltip formatter={(v: number) => fmt(v)} {...tooltipStyle} />
                          <Bar dataKey="total" fill="hsl(158, 64%, 32%)" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Network Size by Tier */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Network Size by Tier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tierData.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No network agent data yet.</p>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={tierData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {tierData.map((_, i) => (
                              <Cell key={i} fill={TIER_COLORS[i % TIER_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip {...tooltipStyle} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Agent Additions & Departures */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Network className="w-4 h-4 text-primary" />
                    Agent Additions & Departures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {movementData.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No agent movement data yet.</p>
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={movementData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip {...tooltipStyle} />
                          <Legend />
                          <Bar dataKey="additions" name="Additions" fill="hsl(158, 64%, 32%)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="departures" name="Departures" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Days with Brokerage */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Days with Brokerage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {daysDistribution.every(b => b.value === 0) ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No tenure data available.</p>
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={daysDistribution} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip {...tooltipStyle} />
                          <Bar dataKey="value" name="Agents" fill="hsl(175, 60%, 38%)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Top Performers Tab */}
          <TabsContent value="top" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  Top Performers
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Your highest-performing agents ranked by network size and revenue share contributions
                </p>
              </CardHeader>
              <CardContent>
                <TopPerformers agents={agents} revenueShare={revenueShare} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tree Tab - Sponsor Relationships */}
          <TabsContent value="tree" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Network className="w-4 h-4 text-primary" />
                  Sponsor Relationship Tree
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Visualize how agents are connected through sponsor relationships in your network
                </p>
              </CardHeader>
              <CardContent>
                <SponsorTree agents={agents} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* RevShare Tab */}
          <TabsContent value="revshare" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* RevShare by Month */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">RevShare by Month</CardTitle>
                </CardHeader>
                <CardContent>
                  {revShareByMonth.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No revenue share data yet.</p>
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revShareByMonth} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip formatter={(v: number) => fmt(v)} {...tooltipStyle} />
                          <Line type="monotone" dataKey="amount" stroke="hsl(158, 64%, 32%)" strokeWidth={2.5} dot={{ r: 3, fill: 'hsl(158, 64%, 32%)' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* RevShare by Year */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">RevShare by Year</CardTitle>
                </CardHeader>
                <CardContent>
                  {revShareByYear.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No yearly data yet.</p>
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revShareByYear} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                          <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip formatter={(v: number) => fmt(v)} {...tooltipStyle} />
                          <Bar dataKey="amount" name="RevShare" fill="hsl(38, 75%, 50%)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* RevShare by Tier breakdown */}
            {summary?.revshare_by_tier && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">RevShare by Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {Object.entries(summary.revshare_by_tier).map(([tier, amount], i) => (
                      <div key={tier} className="rounded-xl border border-border/50 p-4 text-center">
                        <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: TIER_COLORS[i % TIER_COLORS.length] + '22' }}>
                          <span className="text-xs font-bold" style={{ color: TIER_COLORS[i % TIER_COLORS.length] }}>{tier}</span>
                        </div>
                        <p className="text-lg font-bold text-foreground">{fmt(Number(amount) || 0)}</p>
                        <p className="text-xs text-muted-foreground">Tier {tier}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Agents Tab - Searchable Directory */}
          <TabsContent value="agents" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Agent Directory ({agents.length})
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Search, filter, and explore your network agents with their avatars and network sizes</p>
              </CardHeader>
              <CardContent>
                <AgentDirectory agents={agents} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
