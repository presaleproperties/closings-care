import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sparkles, Home, TrendingUp, DollarSign, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { subMonths, isAfter, isBefore } from 'date-fns';
import { formatCurrency } from '@/lib/format';
import { useState } from 'react';

interface InsightsGreetingProps {
  syncedTransactions: any[];
  revenueShare?: any[];
  userName?: string;
  receivedYTD?: number;
}

export function InsightsGreeting({ syncedTransactions, revenueShare = [], userName, receivedYTD = 0 }: InsightsGreetingProps) {
  const [showMilestone, setShowMilestone] = useState(true);
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const displayName = userName || 'there';

  const stats = useMemo(() => {
    const thisYear = now.getFullYear();

    // From synced transactions
    const closedThisYear = syncedTransactions.filter(t => t.status === 'closed' && t.close_date && new Date(t.close_date).getFullYear() === thisYear);
    const activeDeals = syncedTransactions.filter(t => t.status === 'active');
    const listings = syncedTransactions.filter(t => t.is_listing && t.status === 'active');

    // Last 12 months vs prior 12 months
    const twelveMonthsAgo = subMonths(now, 12);
    const twentyFourMonthsAgo = subMonths(now, 24);
    
    const recentTx = syncedTransactions.filter(t => t.close_date && isAfter(new Date(t.close_date), twelveMonthsAgo));
    const priorTx = syncedTransactions.filter(t => t.close_date && isAfter(new Date(t.close_date), twentyFourMonthsAgo) && isBefore(new Date(t.close_date), twelveMonthsAgo));

    const recentRevenue = recentTx.reduce((s: number, t: any) => s + Number(t.commission_amount || 0), 0);
    const priorRevenue = priorTx.reduce((s: number, t: any) => s + Number(t.commission_amount || 0), 0);
    
    const txChange = priorTx.length > 0 ? Math.round(((recentTx.length - priorTx.length) / priorTx.length) * 100) : 0;
    const revChange = priorRevenue > 0 ? Math.round(((recentRevenue - priorRevenue) / priorRevenue) * 100) : 0;

    const totalVolume = syncedTransactions.reduce((s: number, t: any) => s + Number(t.sale_price || 0), 0);

    return {
      closedCount: closedThisYear.length,
      activeCount: activeDeals.length,
      paidThisYear: receivedYTD,
      activeListings: listings.length,
      recentTxCount: recentTx.length,
      priorTxCount: priorTx.length,
      recentRevenue,
      priorRevenue,
      txChange,
      revChange,
      totalVolume,
    };
  }, [syncedTransactions, now, receivedYTD]);

  const milestoneThresholds = [50000000, 25000000, 10000000, 5000000, 1000000];
  const milestone = milestoneThresholds.find(m => stats.totalVolume >= m);

  return (
    <div className="space-y-4">
      {milestone && showMilestone && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl p-4 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.7) 100%)',
          }}
        >
          <button 
            onClick={() => setShowMilestone(false)}
            className="absolute top-3 right-3 text-primary-foreground/60 hover:text-primary-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-primary-foreground" />
            <div>
              <p className="font-bold text-primary-foreground">
                You crossed {formatCurrency(milestone)} in volume!
              </p>
              <p className="text-sm text-primary-foreground/80">
                That's exceptional – top performers nationally.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <Card className="p-5 border-border/40 bg-card/80 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {greeting}, {displayName}
              </h2>
              <p className="text-sm text-muted-foreground">
                You have {stats.closedCount} deals closed, {formatCurrency(stats.paidThisYear)} earned, {stats.activeCount} active in {now.getFullYear()}.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <Card className="p-3 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-1">
              <Home className="h-4 w-4 text-primary" />
              <span className="text-xl font-bold text-foreground">{stats.activeListings}</span>
            </div>
            <p className="text-xs font-medium text-muted-foreground">Active Listings</p>
          </Card>

          <Card className="p-3 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xl font-bold text-foreground">
                {stats.txChange > 0 ? '+' : ''}{stats.txChange}%
              </span>
            </div>
            <p className="text-xs font-medium text-muted-foreground">Transactions</p>
            <p className="text-[10px] text-muted-foreground/70">
              {stats.recentTxCount} (12m) vs {stats.priorTxCount} (prior)
            </p>
          </Card>

          <Card className="p-3 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-xl font-bold text-foreground">
                {stats.revChange > 0 ? '+' : ''}{stats.revChange}%
              </span>
            </div>
            <p className="text-xs font-medium text-muted-foreground">Revenue</p>
            <p className="text-[10px] text-muted-foreground/70">
              {formatCurrency(stats.recentRevenue)} vs {formatCurrency(stats.priorRevenue)}
            </p>
          </Card>
        </div>
      </Card>
    </div>
  );
}
