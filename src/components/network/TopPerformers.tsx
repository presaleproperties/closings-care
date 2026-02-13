import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, TrendingUp, Users, Crown, Flame, Award, Zap } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { NetworkAgent } from '@/hooks/useNetworkData';

interface TopPerformersProps {
  agents: NetworkAgent[];
  revenueShare: any[];
}

const TIER_LABELS: Record<number, string> = {
  1: 'Affiliate',
  2: 'Associate',
  3: 'Broker',
  4: 'Franchise',
  5: 'Executive',
};

function getBadges(
  agent: NetworkAgent,
  totalRevShare: number,
  allPerformers: { revShare: number }[],
  rank: number
) {
  const badges: { icon: React.ReactNode; label: string; color: string }[] = [];

  if (agent.network_size && agent.network_size >= 10) {
    badges.push({
      icon: <Users className="w-3 h-3" />,
      label: 'Network Builder',
      color: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
    });
  }

  const medianRev = allPerformers.length > 0
    ? [...allPerformers].sort((a, b) => a.revShare - b.revShare)[Math.floor(allPerformers.length / 2)]?.revShare || 0
    : 0;
  if (totalRevShare > medianRev * 2 && totalRevShare > 0) {
    badges.push({
      icon: <Flame className="w-3 h-3" />,
      label: 'Top Earner',
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    });
  }

  if (agent.days_with_brokerage && agent.days_with_brokerage > 730) {
    badges.push({
      icon: <Star className="w-3 h-3" />,
      label: 'Veteran',
      color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    });
  }

  if (agent.days_with_brokerage && agent.days_with_brokerage < 180 && totalRevShare > 0) {
    badges.push({
      icon: <Zap className="w-3 h-3" />,
      label: 'Rising Star',
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    });
  }

  return badges;
}

export function TopPerformers({ agents, revenueShare }: TopPerformersProps) {
  const performers = useMemo(() => {
    const revByAgent: Record<string, number> = {};
    revenueShare.forEach((rs: any) => {
      revByAgent[rs.agent_name] = (revByAgent[rs.agent_name] || 0) + (Number(rs.amount) || 0);
    });

    const activeAgents = agents.filter(a => a.status === 'ACTIVE' && !a.departure_date);
    const scored = activeAgents.map(a => ({
      agent: a,
      totalRevShare: revByAgent[a.agent_name] || 0,
      networkSize: a.network_size || 0,
      score: (a.network_size || 0) * 100 + (revByAgent[a.agent_name] || 0),
    }));
    scored.sort((a, b) => b.score - a.score);

    const allStats = scored.map(s => ({ revShare: s.totalRevShare }));
    return scored.slice(0, 10).map((s, idx) => ({
      agent: s.agent,
      totalRevShare: s.totalRevShare,
      badges: getBadges(s.agent, s.totalRevShare, allStats, idx + 1),
      rank: idx + 1,
    }));
  }, [agents, revenueShare]);

  const summaryMetrics = useMemo(() => {
    if (performers.length === 0) return null;
    const totalNet = performers.reduce((s, p) => s + (p.agent.network_size || 0), 0);
    const totalRev = performers.reduce((s, p) => s + p.totalRevShare, 0);
    const avgTenure = performers.reduce((s, p) => s + (p.agent.days_with_brokerage || 0), 0) / performers.length;
    return { totalNet, totalRev, avgTenure };
  }, [performers]);

  if (performers.length === 0) {
    return (
      <Card className="border-border/40 shadow-sm">
        <CardContent className="py-12">
          <div className="text-center">
            <Trophy className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No active agents found</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Sync your platform to see top performers</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const top3 = performers.slice(0, 3);
  const rest = performers.slice(3);

  return (
    <div className="space-y-4">
      {/* Summary */}
      {summaryMetrics && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Combined Network', value: summaryMetrics.totalNet.toString() },
            { label: 'Total RevShare', value: formatCurrency(summaryMetrics.totalRev) },
            { label: 'Avg Tenure', value: `${Math.floor(summaryMetrics.avgTenure / 365)}y ${Math.floor((summaryMetrics.avgTenure % 365) / 30)}m` },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border/40 bg-card/60 p-4 text-center"
            >
              <p className="text-xl font-bold text-foreground">{m.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{m.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Podium - Top 3 */}
      <Card className="border-border/40 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Top 3 podium cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {top3.map((p, i) => {
              const initials = p.agent.agent_name.split(' ').map(n => n[0]).join('').slice(0, 2);
              const podiumColors = [
                'from-amber-500/8 to-amber-500/3 border-amber-500/25 ring-amber-500/10',
                'from-slate-400/8 to-slate-400/3 border-slate-400/25 ring-slate-400/10',
                'from-orange-600/8 to-orange-600/3 border-orange-600/25 ring-orange-600/10',
              ];
              const rankIcons = [
                <Crown className="w-5 h-5 text-amber-500" />,
                <Award className="w-5 h-5 text-slate-400" />,
                <Award className="w-5 h-5 text-orange-600" />,
              ];

              return (
                <motion.div
                  key={p.agent.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`relative rounded-xl border bg-gradient-to-b p-4 text-center ring-1 ${podiumColors[i]}`}
                >
                  <div className="absolute top-3 left-3">{rankIcons[i]}</div>
                  <Avatar className="h-14 w-14 mx-auto ring-2 ring-background shadow-md">
                    {p.agent.avatar_url && <AvatarImage src={p.agent.avatar_url} alt={p.agent.agent_name} />}
                    <AvatarFallback className="bg-primary/15 text-primary font-bold text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-sm text-foreground mt-2.5 truncate">{p.agent.agent_name}</p>
                  <p className="text-[10px] text-muted-foreground">{TIER_LABELS[p.agent.tier]}</p>

                  <div className="flex justify-center gap-4 mt-3 pt-3 border-t border-border/20">
                    <div>
                      <p className="text-sm font-bold text-foreground">{p.agent.network_size || 0}</p>
                      <p className="text-[9px] text-muted-foreground">Network</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{formatCurrency(p.totalRevShare)}</p>
                      <p className="text-[9px] text-muted-foreground">RevShare</p>
                    </div>
                  </div>

                  {p.badges.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1 mt-2.5">
                      {p.badges.map((badge, bi) => (
                        <Badge key={bi} variant="outline" className={`text-[9px] px-1.5 py-0 h-4 gap-0.5 ${badge.color}`}>
                          {badge.icon}
                          {badge.label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Remaining performers */}
          {rest.length > 0 && (
            <div className="space-y-1.5">
              {rest.map((p, idx) => {
                const initials = p.agent.agent_name.split(' ').map(n => n[0]).join('').slice(0, 2);
                const tenure = p.agent.days_with_brokerage;

                return (
                  <motion.div
                    key={p.agent.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + idx * 0.04 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-card/40 hover:bg-card/70 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-muted-foreground">{p.rank}</span>
                    </div>
                    <Avatar className="h-8 w-8 shrink-0">
                      {p.agent.avatar_url && <AvatarImage src={p.agent.avatar_url} alt={p.agent.agent_name} />}
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[10px]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{p.agent.agent_name}</p>
                        <span className="text-[10px] text-muted-foreground shrink-0">{TIER_LABELS[p.agent.tier]}</span>
                      </div>
                      {p.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {p.badges.map((badge, bi) => (
                            <Badge key={bi} variant="outline" className={`text-[8px] px-1 py-0 h-3.5 gap-0.5 ${badge.color}`}>
                              {badge.icon}
                              {badge.label}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <div>
                        <p className="text-sm font-bold text-foreground">{p.agent.network_size || 0}</p>
                        <p className="text-[8px] text-muted-foreground uppercase">Net</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{formatCurrency(p.totalRevShare)}</p>
                        <p className="text-[8px] text-muted-foreground uppercase">Rev</p>
                      </div>
                      {tenure != null && (
                        <div className="hidden sm:block">
                          <p className="text-xs font-bold text-foreground">
                            {Math.floor(tenure / 365)}y {Math.floor((tenure % 365) / 30)}m
                          </p>
                          <p className="text-[8px] text-muted-foreground uppercase">Tenure</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
