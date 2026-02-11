import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Users, Minus } from 'lucide-react';
import type { NetworkAgent } from '@/hooks/useNetworkData';

interface SponsorTreeProps {
  agents: NetworkAgent[];
  currentUserName?: string;
}

interface TreeNode {
  agent: NetworkAgent | null; // null for the root "You" node
  children: TreeNode[];
  name: string;
  isRoot?: boolean;
}

const TIER_COLORS: Record<number, string> = {
  1: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
  2: 'bg-teal-500/20 text-teal-700 border-teal-500/30',
  3: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
  4: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  5: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
};

const TIER_DOT_COLORS: Record<number, string> = {
  1: 'hsl(158, 64%, 42%)',
  2: 'hsl(175, 60%, 43%)',
  3: 'hsl(38, 75%, 55%)',
  4: 'hsl(280, 60%, 55%)',
  5: 'hsl(200, 70%, 55%)',
};

function buildTree(agents: NetworkAgent[]): TreeNode {
  // Group agents by sponsor_name
  const bySponsor: Record<string, NetworkAgent[]> = {};
  const agentNames = new Set(agents.map(a => a.agent_name));

  agents.forEach(a => {
    const sponsor = a.sponsor_name || '__root__';
    if (!bySponsor[sponsor]) bySponsor[sponsor] = [];
    bySponsor[sponsor].push(a);
  });

  // Find root agents (those whose sponsor is not in the agent list, or no sponsor)
  const rootAgents = agents.filter(
    a => !a.sponsor_name || !agentNames.has(a.sponsor_name)
  );

  function buildNode(agent: NetworkAgent): TreeNode {
    const children = (bySponsor[agent.agent_name] || [])
      .sort((a, b) => a.agent_name.localeCompare(b.agent_name))
      .map(buildNode);
    return { agent, children, name: agent.agent_name };
  }

  const rootChildren = rootAgents
    .sort((a, b) => a.agent_name.localeCompare(b.agent_name))
    .map(buildNode);

  return {
    agent: null,
    children: rootChildren,
    name: 'You',
    isRoot: true,
  };
}

function TreeNodeComponent({
  node,
  depth = 0,
  defaultExpanded = true,
}: {
  node: TreeNode;
  depth?: number;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded && depth < 2);
  const hasChildren = node.children.length > 0;
  const agent = node.agent;
  const isActive = agent ? agent.status === 'ACTIVE' && !agent.departure_date : true;

  const initials = node.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div className="select-none">
      {/* Node row */}
      <div
        className={`group flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
          !isActive && !node.isRoot ? 'opacity-50' : ''
        }`}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {/* Expand/collapse icon */}
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )
          ) : (
            <Minus className="w-3 h-3 text-border" />
          )}
        </div>

        {/* Avatar */}
        <Avatar className="h-7 w-7 shrink-0">
          {agent?.avatar_url ? (
            <AvatarImage src={agent.avatar_url} alt={node.name} />
          ) : null}
          <AvatarFallback
            className={`text-[10px] font-semibold ${
              node.isRoot
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary/15 text-primary'
            }`}
          >
            {node.isRoot ? '★' : initials}
          </AvatarFallback>
        </Avatar>

        {/* Name & metadata */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span
            className={`text-sm font-medium truncate ${
              node.isRoot ? 'text-primary font-semibold' : 'text-foreground'
            }`}
          >
            {node.name}
          </span>

          {agent && (
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 h-4 shrink-0 ${
                TIER_COLORS[agent.tier] || TIER_COLORS[1]
              }`}
            >
              T{agent.tier}
            </Badge>
          )}

          {!isActive && agent && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 shrink-0 bg-destructive/10 text-destructive border-destructive/30"
            >
              Departed
            </Badge>
          )}
        </div>

        {/* Network size & child count */}
        <div className="flex items-center gap-2 shrink-0">
          {agent?.network_size != null && agent.network_size > 0 && (
            <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
              Net: {agent.network_size}
            </span>
          )}
          {hasChildren && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Users className="w-3 h-3" />
              {node.children.length}
            </span>
          )}
        </div>
      </div>

      {/* Children */}
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-4 pl-3 border-l-2 border-border/40">
              {node.children.map(child => (
                <TreeNodeComponent
                  key={child.agent?.id || child.name}
                  node={child}
                  depth={depth + 1}
                  defaultExpanded={depth < 1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SponsorTree({ agents }: SponsorTreeProps) {
  const tree = useMemo(() => buildTree(agents), [agents]);

  const stats = useMemo(() => {
    const sponsorCounts: Record<string, number> = {};
    agents.forEach(a => {
      if (a.sponsor_name) {
        sponsorCounts[a.sponsor_name] = (sponsorCounts[a.sponsor_name] || 0) + 1;
      }
    });
    const topSponsor = Object.entries(sponsorCounts).sort((a, b) => b[1] - a[1])[0];
    const maxDepth = (function getDepth(node: TreeNode): number {
      if (node.children.length === 0) return 0;
      return 1 + Math.max(...node.children.map(getDepth));
    })(tree);

    return {
      totalConnections: agents.filter(a => a.sponsor_name).length,
      uniqueSponsors: new Set(agents.map(a => a.sponsor_name).filter(Boolean)).size,
      topSponsor: topSponsor ? { name: topSponsor[0], count: topSponsor[1] } : null,
      maxDepth,
    };
  }, [agents, tree]);

  // Tier distribution legend
  const tierCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    agents.forEach(a => { counts[a.tier] = (counts[a.tier] || 0) + 1; });
    return Object.entries(counts)
      .map(([t, c]) => ({ tier: Number(t), count: c }))
      .sort((a, b) => a.tier - b.tier);
  }, [agents]);

  if (agents.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-12">
        No agents in your network yet. Sync your platform to see the sponsor tree.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/50">
          <span className="text-muted-foreground">Connections:</span>
          <span className="font-semibold text-foreground">{stats.totalConnections}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/50">
          <span className="text-muted-foreground">Sponsors:</span>
          <span className="font-semibold text-foreground">{stats.uniqueSponsors}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/50">
          <span className="text-muted-foreground">Depth:</span>
          <span className="font-semibold text-foreground">{stats.maxDepth} levels</span>
        </div>
        {stats.topSponsor && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/50">
            <span className="text-muted-foreground">Top Sponsor:</span>
            <span className="font-semibold text-foreground">{stats.topSponsor.name} ({stats.topSponsor.count})</span>
          </div>
        )}
      </div>

      {/* Tier legend */}
      <div className="flex flex-wrap gap-2">
        {tierCounts.map(({ tier, count }) => (
          <div
            key={tier}
            className="flex items-center gap-1.5 text-xs"
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: TIER_DOT_COLORS[tier] || TIER_DOT_COLORS[1] }}
            />
            <span className="text-muted-foreground">
              Tier {tier}: {count}
            </span>
          </div>
        ))}
      </div>

      {/* Tree */}
      <div className="rounded-xl border border-border/50 bg-card/30 p-3 max-h-[600px] overflow-y-auto">
        <TreeNodeComponent node={tree} depth={0} defaultExpanded />
      </div>
    </div>
  );
}
