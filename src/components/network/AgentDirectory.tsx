import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, FileText, Mail, Phone, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { NetworkAgent } from '@/hooks/useNetworkData';

interface AgentDirectoryProps {
  agents: NetworkAgent[];
}

const TIER_LABELS = {
  1: 'Tier 1 - Affiliate',
  2: 'Tier 2 - Associate',
  3: 'Tier 3 - Broker',
  4: 'Tier 4 - Franchise',
  5: 'Tier 5 - Executive',
};

const TIER_COLORS: Record<number, string> = {
  1: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
  2: 'bg-teal-500/20 text-teal-700 border-teal-500/30',
  3: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
  4: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  5: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
};

export function AgentDirectory({ agents }: AgentDirectoryProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'tier' | 'network'>('name');

  const filteredAgents = useMemo(() => {
    let result = agents.filter(a => 
      a.agent_name.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.sponsor_name?.toLowerCase().includes(search.toLowerCase())
    );

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'tier':
          return a.tier - b.tier;
        case 'network':
          return (b.network_size || 0) - (a.network_size || 0);
        case 'name':
        default:
          return a.agent_name.localeCompare(b.agent_name);
      }
    });

    return result;
  }, [agents, search, sortBy]);

  const activeAgents = filteredAgents.filter(a => a.status === 'ACTIVE' && !a.departure_date);
  const departedAgents = filteredAgents.filter(a => a.status !== 'ACTIVE' || !!a.departure_date);

  return (
    <div className="space-y-4">
      {/* Search & Sort */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or sponsor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {(['name', 'tier', 'network'] as const).map(sort => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                sortBy === sort
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {sort === 'name' && 'Name'}
              {sort === 'tier' && 'Tier'}
              {sort === 'network' && 'Network'}
            </button>
          ))}
        </div>
      </div>

      {/* Active Agents */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-success" />
          Active Agents ({activeAgents.length})
        </h3>
        {activeAgents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No active agents matching search</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {activeAgents.map((agent, idx) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.02 }}
                  className="p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 transition-colors"
                >
                  {/* Header with Avatar */}
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={agent.avatar_url || undefined} alt={agent.agent_name} />
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {agent.agent_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-foreground truncate">{agent.agent_name}</p>
                      <Badge
                        variant="outline"
                        className={`mt-1 text-xs ${TIER_COLORS[agent.tier as keyof typeof TIER_COLORS] || TIER_COLORS[1]}`}
                      >
                        {TIER_LABELS[agent.tier as keyof typeof TIER_LABELS] || `Tier ${agent.tier}`}
                      </Badge>
                    </div>
                  </div>

                  {/* Network Size */}
                  {agent.network_size !== null && (
                    <div className="mb-3 p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Network Size</span>
                        <span className="text-sm font-bold text-foreground">{agent.network_size}</span>
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-1.5 text-xs">
                    {agent.email && (
                      <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{agent.email}</span>
                      </div>
                    )}
                    {agent.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span>{agent.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Sponsor & Tenure */}
                  {agent.sponsor_name && (
                    <div className="mt-3 pt-3 border-t border-border/30 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Shield className="h-3 w-3 shrink-0" />
                        <span className="truncate">Sponsor: {agent.sponsor_name}</span>
                      </div>
                    </div>
                  )}
                  {agent.days_with_brokerage !== null && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {Math.floor(agent.days_with_brokerage / 365)} yrs {(agent.days_with_brokerage % 365) / 30 | 0} mo
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Departed Agents */}
      {departedAgents.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Departed Agents ({departedAgents.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {departedAgents.map((agent, idx) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.02 }}
                  className="p-4 rounded-xl border border-border/30 bg-muted/30 opacity-60"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-10 w-10 shrink-0 opacity-60">
                      <AvatarImage src={agent.avatar_url || undefined} alt={agent.agent_name} />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {agent.agent_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-foreground truncate">{agent.agent_name}</p>
                      <Badge variant="outline" className="mt-1 text-xs bg-destructive/10 text-destructive border-destructive/30">
                        Departed
                      </Badge>
                    </div>
                  </div>
                  {agent.departure_date && (
                    <p className="text-xs text-muted-foreground">
                      Departed: {new Date(agent.departure_date).toLocaleDateString()}
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
