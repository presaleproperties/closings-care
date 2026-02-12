import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Home, FileText, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type ActivityFilter = 'all' | 'listings' | 'transactions' | 'revshare';

interface LatestActivityProps {
  syncedTransactions: any[];
  revenueShare: any[];
  networkAgents: any[];
}

export function LatestActivity({ syncedTransactions, revenueShare, networkAgents }: LatestActivityProps) {
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const activities = useMemo(() => {
    const items: Array<{
      id: string;
      type: 'listing' | 'transaction' | 'revshare';
      title: string;
      subtitle: string;
      amount: number | null;
      date: Date;
      badge?: string;
    }> = [];

    // Synced transactions
    syncedTransactions.forEach((tx: any) => {
      const date = tx.close_date || tx.listing_date || tx.synced_at;
      if (!date) return;
      const isListing = tx.is_listing;
      items.push({
        id: `tx-${tx.id}`,
        type: isListing ? 'listing' : 'transaction',
        title: isListing ? 'Listing' : (tx.status === 'closed' ? 'Transaction Closed' : 'Transaction Active'),
        subtitle: `${tx.property_address || tx.client_name || 'Unknown'}${tx.city ? `, ${tx.city}` : ''}`,
        amount: Number(tx.sale_price || 0),
        date: new Date(date),
        badge: tx.agent_name || undefined,
      });
    });

    // RevShare entries
    revenueShare.forEach((r: any) => {
      items.push({
        id: `rev-${r.id}`,
        type: 'revshare',
        title: `RevShare Earned – Tier ${r.tier}`,
        subtitle: r.agent_name,
        amount: Number(r.amount),
        date: new Date(r.created_at),
      });
    });

    // Sort by date descending
    items.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Apply filter
    if (filter === 'all') return items.slice(0, 8);
    const typeMap: Record<string, string> = { listings: 'listing', transactions: 'transaction', revshare: 'revshare' };
    return items.filter(i => i.type === typeMap[filter]).slice(0, 8);
  }, [syncedTransactions, revenueShare, filter]);

  const filterIcons = [
    { key: 'all' as const, icon: Bell, label: 'All' },
    { key: 'listings' as const, icon: Home, label: 'Listings' },
    { key: 'transactions' as const, icon: FileText, label: 'Transactions' },
    { key: 'revshare' as const, icon: DollarSign, label: 'RevShare' },
  ];

  const typeColors: Record<string, string> = {
    listing: 'border-l-primary',
    transaction: 'border-l-blue-500',
    revshare: 'border-l-emerald-500',
  };

  return (
    <Card className="p-5 border-border/40 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <Bell className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">Latest Activity</h3>
        <div className="flex gap-1 ml-auto">
          {filterIcons.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                filter === f.key 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              title={f.label}
            >
              <f.icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
        ) : activities.map(activity => (
          <div
            key={activity.id}
            className={cn(
              "p-3 rounded-lg border border-border/30 bg-muted/20 border-l-2",
              typeColors[activity.type]
            )}
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">{activity.subtitle}</p>
                {activity.badge && (
                  <Badge variant="outline" className="mt-1 text-[10px] h-5">{activity.badge}</Badge>
                )}
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                {activity.amount !== null && activity.amount > 0 && (
                  <p className="text-sm font-semibold text-foreground">
                    {activity.amount >= 1000 ? `$${Math.round(activity.amount / 1000)}K` : formatCurrency(activity.amount)}
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground">
                  {format(activity.date, 'MMM d')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
