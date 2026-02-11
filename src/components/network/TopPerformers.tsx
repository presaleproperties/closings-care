import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, TrendingUp, Users, Crown, Flame, Award, Zap } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { NetworkAgent } from '@/hooks/useNetworkData';

interface TopPerformersProps {
  agents: NetworkAgent[];
  revenueShare: any[];
}

interface PerformerData {
  agent: NetworkAgent;
  totalRevShare: number;
  badges: { icon: React.ReactNode; label: string; color: string }[];
  rank: number;
}

const TIER_LABELS: Record<number, string> = {
  1: 'Affiliate',
  2: 'Associate',
  3: 'Broker',
  4: 'Franchise',
  5: 'Executive',
};

const RANK_STYLES: Record<number, { bg: string; border: string; glow: string }> = {
  1: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    glow: 'shadow-[0_0_20px_-4px_hsl(38,75%,50%,0.25)]',
  },
  2: {
    bg: 'bg-slate-300/10',
    border: 'border-slate-400/40',
    glow: 'shadow-[0_0_16px_-4px_hsl(215,15%,60%,0.2)]',
  },
  3: {
    bg: 'bg-orange-600/10',
    border: 'border-orange-600/40',
    glow: 'shadow-[0_0_16px_-4px_hsl(25,75%,47%,0.2)]',
  },
};

const RANK_ICONS = [
  <Crown className="w-4 h-4 text-amber-500" />,
  <Award className="w-4 h-4 text-slate-400" />,
  <Award className="w-4 h-4 text-orange-600" />,
];

function getBadges(
  agent: NetworkAgent,
  totalRevShare: number,
  allPerformers: { networkSize: number; revShare: number; tenure: number }[],
  rank: number
) {
  const badges: { icon: React.ReactNode; label: string; color: string }[] = [];

  // Network builder badge
  if (agent.network_size && agent.network_size >= 10) {
    badges.push({
      icon: <Users className="w-3 h-3" />,
      label: 'Network Builder',
      color: 'bg-teal-500/15 text-teal-700 border-teal-500/30',
    });
  }

  // High earner badge
  const medianRev = allPerformers.length > 0
    ? [...allPerformers].sort((a, b) => a.revShare - b.revShare)[Math.floor(allPerformers.length / 2)]?.revShare || 0
    : 0;
  if (totalRevShare > medianRev * 2 && totalRevShare > 0) {
    badges.push({
      icon: <Flame className="w-3 h-3" />,
      label: 'Top Earner',
      color: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
    });
  }

  // Veteran badge
  if (agent.days_with_brokerage && agent.days_with_brokerage > 730) {
    badges.push({
      icon: <Star className="w-3 h-3" />,
      label: 'Veteran',
      color: 'bg-purple-500/15 text-purple-700 border-purple-500/30',
    });
  }

  // Rising star badge
  if (agent.days_with_brokerage && agent.days_with_brokerage < 180 && totalRevShare > 0) {
    badges.push({
      icon: <Zap className="w-3 h-3" />,
      label: 'Rising Star',
      color: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
    });
  }

  // Top 3 badge
  if (rank <= 3) {
    badges.push({
      icon: <Trophy className="w-3 h-3" />,
      label: rank === 1 ? '#1 Contributor' : `Top ${rank}`,
      color: rank === 1
        ? 'bg-amber-500/15 text-amber-700 border-amber-500/30'
        : 'bg-primary/10 text-primary border-primary/30',
    });
  }

  return badges;
}

export function TopPerformers({ agents, revenueShare }: TopPerformersProps) {
  const performers = useMemo(() => {
    // Aggregate revenue share per agent
    const revByAgent: Record<string, number> = {};
    revenueShare.forEach((rs: any) => {
      const name = rs.agent_name;
      revByAgent[name] = (revByAgent[name] || 0) + (Number(rs.amount) || 0);
    });

    // Only active agents
    const activeAgents = agents.filter(a => a.status === 'ACTIVE' && !a.departure_date);

    // Score: weighted combination of network size + rev share
    const scored = activeAgents.map(a => ({
      agent: a,
      totalRevShare: revByAgent[a.agent_name] || 0,
      networkSize: a.network_size || 0,
      score: (a.network_size || 0) * 100 + (revByAgent[a.agent_name] || 0),
    }));

    scored.sort((a, b) => b.score - a.score);

    const allStats = scored.map(s => ({
      networkSize: s.networkSize,
      revShare: s.totalRevShare,
      tenure: s.agent.days_with_brokerage || 0,
    }));

    return scored.slice(0, 10).map((s, idx) => ({
      agent: s.agent,
      totalRevShare: s.totalRevShare,
      badges: getBadges(s.agent, s.totalRevShare, allStats, idx + 1),
      rank: idx + 1,
    }));
  }, [agents, revenueShare]);

  // Summary metrics
  const summaryMetrics = useMemo(() => {
    if (performers.length === 0) return null;
    const totalNet = performers.reduce((s, p) => s + (p.agent.network_size || 0), 0);
    const totalRev = performers.reduce((s, p) => s + p.totalRevShare, 0);
    const avgTenure = performers.reduce((s, p) => s + (p.agent.days_with_brokerage || 0), 0) / performers.length;
    return { totalNet, totalRev, avgTenure };
  }, [performers]);

  if (performers.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-12">
        No active agents found. Sync your platform to see top performers.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary metrics */}
      {summaryMetrics && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border/50 bg-muted/30 p-3 text-center">
            <p className="text-lg font-bold text-foreground">{summaryMetrics.totalNet}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Combined Network</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/30 p-3 text-center">
            <p className="text-lg font-bold text-foreground">{formatCurrency(summaryMetrics.totalRev)}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total RevShare</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/30 p-3 text-center">
            <p className="text-lg font-bold text-foreground">
              {Math.floor(summaryMetrics.avgTenure / 365)}y {Math.floor((summaryMetrics.avgTenure % 365) / 30)}m
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Tenure</p>
          </div>
        </div>
      )}

      {/* Performer cards */}
      <div className="space-y-2">
        {performers.map((p, idx) => {
          const rankStyle = RANK_STYLES[p.rank] || {
            bg: 'bg-card/50',
            border: 'border-border/50',
            glow: '',
          };
          const initials = p.agent.agent_name
            .split(' ')
            .map(n => n[0])
            .join('')
            .slice(0, 2);
          const tenure = p.agent.days_with_brokerage;

          return (
            <motion.div
              key={p.agent.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`flex items-center gap-3 p-3 rounded-xl border ${rankStyle.border} ${rankStyle.bg} ${rankStyle.glow} transition-colors hover:bg-card/80`}
            >
              {/* Rank */}
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                {p.rank <= 3 ? (
                  RANK_ICONS[p.rank - 1]
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">{p.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <Avatar className="h-9 w-9 shrink-0">
                {p.agent.avatar_url && <AvatarImage src={p.agent.avatar_url} alt={p.agent.agent_name} />}
                <AvatarFallback className="bg-primary/15 text-primary font-semibold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Name & tier */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">{p.agent.agent_name}</p>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {TIER_LABELS[p.agent.tier] || `Tier ${p.agent.tier}`}
                  </span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {p.badges.map((badge, bi) => (
                    <Badge
                      key={bi}
                      variant="outline"
                      className={`text-[9px] px-1.5 py-0 h-4 gap-0.5 ${badge.color}`}
                    >
                      {badge.icon}
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-4 shrink-0 text-right">
                <div>
                  <p className="text-sm font-bold text-foreground">{p.agent.network_size || 0}</p>
                  <p className="text-[9px] text-muted-foreground uppercase">Network</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{formatCurrency(p.totalRevShare)}</p>
                  <p className="text-[9px] text-muted-foreground uppercase">RevShare</p>
                </div>
                {tenure != null && (
                  <div className="hidden sm:block">
                    <p className="text-sm font-bold text-foreground">
                      {Math.floor(tenure / 365)}y {Math.floor((tenure % 365) / 30)}m
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase">Tenure</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
