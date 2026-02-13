import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Mail, Phone, Shield, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { NetworkAgent } from '@/hooks/useNetworkData';

interface AgentDirectoryProps {
  agents: NetworkAgent[];
}

const TIER_LABELS: Record<number, string> = {
  1: 'Affiliate',
  2: 'Associate',
  3: 'Broker',
  4: 'Franchise',
  5: 'Executive',
};

const TIER_BADGE_COLORS: Record<number, string> = {
  1: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  2: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  3: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  4: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  5: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

const TIER_AVATAR_COLORS: Record<number, string> = {
  1: 'bg-emerald-500/15 text-emerald-700',
  2: 'bg-teal-500/15 text-teal-700',
  3: 'bg-amber-500/15 text-amber-700',
  4: 'bg-purple-500/15 text-purple-700',
  5: 'bg-blue-500/15 text-blue-700',
};

export function AgentDirectory({ agents }: AgentDirectoryProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'tier' | 'network'>('name');
  const [filterTier, setFilterTier] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<'active' | 'departed' | null>(null);
  const [filterTenure, setFilterTenure] = useState<'0-6' | '6-12' | '12-24' | '24+' | null>(null);
  const [showDeparted, setShowDeparted] = useState(false);

  const filteredAgents = useMemo(() => {
    let result = agents.filter(a => {
      const matchesSearch =
        a.agent_name.toLowerCase().includes(search.toLowerCase()) ||
        a.email?.toLowerCase().includes(search.toLowerCase()) ||
        a.sponsor_name?.toLowerCase().includes(search.toLowerCase());
      const matchesTier = !filterTier || a.tier === filterTier;
      let matchesStatus = true;
      if (filterStatus === 'active') matchesStatus = a.status === 'ACTIVE' && !a.departure_date;
      else if (filterStatus === 'departed') matchesStatus = a.status !== 'ACTIVE' || !!a.departure_date;
      let matchesTenure = true;
      if (filterTenure && a.days_with_brokerage !== null) {
        const years = a.days_with_brokerage / 365;
        if (filterTenure === '0-6') matchesTenure = years < 0.5;
        else if (filterTenure === '6-12') matchesTenure = years >= 0.5 && years < 1;
        else if (filterTenure === '12-24') matchesTenure = years >= 1 && years < 2;
        else if (filterTenure === '24+') matchesTenure = years >= 2;
      }
      return matchesSearch && matchesTier && matchesStatus && matchesTenure;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'tier': return a.tier - b.tier;
        case 'network': return (b.network_size || 0) - (a.network_size || 0);
        default: return a.agent_name.localeCompare(b.agent_name);
      }
    });
    return result;
  }, [agents, search, sortBy, filterTier, filterStatus, filterTenure]);

  const activeAgents = filteredAgents.filter(a => a.status === 'ACTIVE' && !a.departure_date);
  const departedAgents = filteredAgents.filter(a => a.status !== 'ACTIVE' || !!a.departure_date);
  const hasFilters = filterTier || filterStatus || filterTenure;

  const formatTenure = (days: number | null) => {
    if (days == null) return null;
    const y = Math.floor(days / 365);
    const m = Math.floor((days % 365) / 30);
    if (y > 0) return `${y}y ${m}m`;
    return `${m}mo`;
  };

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Agent Directory
          </CardTitle>
          <span className="text-xs text-muted-foreground">{filteredAgents.length} of {agents.length}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />

            {/* Sort pills */}
            <div className="flex gap-1 mr-2">
              {(['name', 'tier', 'network'] as const).map(sort => (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    sortBy === sort
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {sort.charAt(0).toUpperCase() + sort.slice(1)}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-border/50" />

            {/* Tier filter */}
            <Select value={filterTier?.toString() || 'all'} onValueChange={(v) => setFilterTier(v === 'all' ? null : parseInt(v))}>
              <SelectTrigger className="h-8 w-[120px] text-[11px] border-border/40">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                {[1, 2, 3, 4, 5].map(tier => (
                  <SelectItem key={tier} value={tier.toString()}>
                    Tier {tier} · {TIER_LABELS[tier]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status pills */}
            <button
              onClick={() => setFilterStatus(filterStatus === 'active' ? null : 'active')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                filterStatus === 'active'
                  ? 'bg-success/15 text-success ring-1 ring-success/30'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus(filterStatus === 'departed' ? null : 'departed')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                filterStatus === 'departed'
                  ? 'bg-destructive/15 text-destructive ring-1 ring-destructive/30'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              Departed
            </button>

            {/* Tenure filter */}
            <Select value={filterTenure || 'all'} onValueChange={(v) => setFilterTenure(v === 'all' ? null : (v as any))}>
              <SelectTrigger className="h-8 w-[130px] text-[11px] border-border/40">
                <SelectValue placeholder="All Tenure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tenure</SelectItem>
                <SelectItem value="0-6">0-6 months</SelectItem>
                <SelectItem value="6-12">6-12 months</SelectItem>
                <SelectItem value="12-24">1-2 years</SelectItem>
                <SelectItem value="24+">2+ years</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <button
                onClick={() => { setFilterTier(null); setFilterStatus(null); setFilterTenure(null); }}
                className="px-2 py-1 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Active Agents Grid */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Active ({activeAgents.length})
            </h3>
          </div>
          {activeAgents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No active agents matching filters</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              <AnimatePresence mode="popLayout">
                {activeAgents.map((agent, idx) => (
                  <AgentCard key={agent.id} agent={agent} idx={idx} formatTenure={formatTenure} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Departed Agents */}
        {departedAgents.length > 0 && (
          <div>
            <button
              onClick={() => setShowDeparted(!showDeparted)}
              className="flex items-center gap-2 mb-3 group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
                Departed ({departedAgents.length})
              </h3>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${showDeparted ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showDeparted && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {departedAgents.map((agent, idx) => (
                      <AgentCard key={agent.id} agent={agent} idx={idx} formatTenure={formatTenure} departed />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AgentCard({
  agent,
  idx,
  formatTenure,
  departed,
}: {
  agent: NetworkAgent;
  idx: number;
  formatTenure: (d: number | null) => string | null;
  departed?: boolean;
}) {
  const initials = agent.agent_name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const tenure = formatTenure(agent.days_with_brokerage);
  const tierColor = TIER_BADGE_COLORS[agent.tier] || TIER_BADGE_COLORS[1];
  const avatarColor = TIER_AVATAR_COLORS[agent.tier] || TIER_AVATAR_COLORS[1];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: Math.min(idx * 0.015, 0.3) }}
      className={`group p-4 rounded-xl border transition-all duration-200 ${
        departed
          ? 'border-border/20 bg-muted/20 opacity-55'
          : 'border-border/30 bg-card/50 hover:bg-card/80 hover:border-border/50 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 shrink-0 ring-2 ring-background">
          <AvatarImage src={agent.avatar_url || undefined} alt={agent.agent_name} />
          <AvatarFallback className={`font-semibold text-xs ${avatarColor}`}>
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-foreground truncate leading-tight">{agent.agent_name}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-[18px] ${tierColor}`}>
              {TIER_LABELS[agent.tier] || `T${agent.tier}`}
            </Badge>
            {departed && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-[18px] bg-destructive/10 text-destructive border-destructive/20">
                Departed
              </Badge>
            )}
          </div>
        </div>

        {/* Network size chip */}
        {agent.network_size != null && agent.network_size > 0 && (
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-foreground">{agent.network_size}</p>
            <p className="text-[9px] text-muted-foreground">network</p>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="mt-3 pt-3 border-t border-border/20 space-y-1.5">
        {agent.email && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{agent.email}</span>
          </div>
        )}
        {agent.phone && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3 w-3 shrink-0" />
            <span>{agent.phone}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          {agent.sponsor_name && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="h-3 w-3 shrink-0" />
              <span className="truncate">{agent.sponsor_name}</span>
            </div>
          )}
          {tenure && (
            <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
              {tenure}
            </span>
          )}
        </div>
        {departed && agent.departure_date && (
          <p className="text-[10px] text-destructive/70">
            Left {new Date(agent.departure_date).toLocaleDateString()}
          </p>
        )}
      </div>
    </motion.div>
  );
}
