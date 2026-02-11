import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import { useSyncedTransactions } from '@/hooks/usePlatformConnections';
import { parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';

const springConfig = { type: 'spring' as const, stiffness: 100, damping: 20 };

interface LifecycleCount {
  stage: string;
  count: number;
  percent: number;
  color: string;
}

export function BusinessPulse() {
  const { data: syncedTransactions = [] } = useSyncedTransactions();
  const now = new Date();

  const pulseMetrics = useMemo(() => {
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1));
    const lastMonthEnd = endOfMonth(lastMonthStart);

    // Deals written this month (firm_date)
    const thisMonthDeals = syncedTransactions.filter(tx => {
      if (!tx.firm_date) return false;
      const firmDate = parseISO(tx.firm_date);
      return isWithinInterval(firmDate, { start: thisMonthStart, end: thisMonthEnd });
    });

    // Deals written last month
    const lastMonthDeals = syncedTransactions.filter(tx => {
      if (!tx.firm_date) return false;
      const firmDate = parseISO(tx.firm_date);
      return isWithinInterval(firmDate, { start: lastMonthStart, end: lastMonthEnd });
    });

    // Lifecycle breakdown for this month
    const lifecycleCounts: Record<string, number> = {};
    thisMonthDeals.forEach(tx => {
      const stage = tx.lifecycle_state || 'Unknown';
      lifecycleCounts[stage] = (lifecycleCounts[stage] || 0) + 1;
    });

    const lifecycleData: LifecycleCount[] = Object.entries(lifecycleCounts)
      .map(([stage, count]) => {
        const colors: Record<string, string> = {
          'PENDING': 'bg-warning/30 border-warning/50',
          'NEEDS_COMMISSION_VALIDATION': 'bg-blue-500/30 border-blue-500/50',
          'COMMISSION_DOCUMENT_SENT': 'bg-primary/30 border-primary/50',
          'READY_FOR_COMMISSION_DOCUMENT_GENERATION': 'bg-accent/30 border-accent/50',
          'PAYMENT_SCHEDULED': 'bg-teal-500/30 border-teal-500/50',
          'SETTLED': 'bg-success/30 border-success/50',
          'ACTIVE': 'bg-primary/30 border-primary/50',
          'CLOSED': 'bg-success/30 border-success/50',
          'TERMINATED': 'bg-destructive/30 border-destructive/50',
        };
        return {
          stage: stage.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' '),
          count,
          percent: thisMonthDeals.length > 0 ? Math.round((count / thisMonthDeals.length) * 100) : 0,
          color: colors[stage] || 'bg-muted/30 border-muted/50',
        };
      })
      .sort((a, b) => b.count - a.count);

    // Compliance issues
    const complianceIssues = thisMonthDeals.filter(tx => tx.compliance_status === 'NOT_COMPLAINT');

    // Trend
    const trend = thisMonthDeals.length - lastMonthDeals.length;
    const trendPercent = lastMonthDeals.length > 0 ? Math.round((trend / lastMonthDeals.length) * 100) : 0;

    return {
      thisMonthCount: thisMonthDeals.length,
      lastMonthCount: lastMonthDeals.length,
      trend,
      trendPercent,
      lifecycleData,
      complianceIssues: complianceIssues.length,
    };
  }, [syncedTransactions, now]);

  const trendColor = pulseMetrics.trend > 0 ? 'text-success' : pulseMetrics.trend < 0 ? 'text-destructive' : 'text-muted-foreground';
  const trendIcon = pulseMetrics.trend > 0 ? '+' : '';

  return (
    <motion.div
      className="rounded-3xl bg-card/95 backdrop-blur-xl border border-border/40 overflow-hidden shadow-lg p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfig}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-success"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <h3 className="font-bold text-lg">Business Pulse</h3>
          </div>
          <p className="text-sm text-muted-foreground">Deals written this month</p>
        </div>
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Main Metric */}
      <div className="grid grid-cols-2 gap-3 mb-5 pb-5 border-b border-border/30">
        <div>
          <p className="text-4xl font-bold text-foreground">{pulseMetrics.thisMonthCount}</p>
          <p className="text-xs text-muted-foreground mt-1">This Month</p>
        </div>
        <div>
          <p className={cn('text-2xl font-bold', trendColor)}>
            {trendIcon}{pulseMetrics.trend}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            vs Last Month {pulseMetrics.lastMonthCount > 0 ? `(${trendIcon}${Math.abs(pulseMetrics.trendPercent)}%)` : ''}
          </p>
        </div>
      </div>

      {/* Lifecycle Breakdown */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pipeline Status</p>
        <div className="space-y-2">
          {pulseMetrics.lifecycleData.map((item, idx) => (
            <motion.div
              key={item.stage}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn('p-2 rounded-lg border', item.color)}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.stage}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{item.count}</span>
                  <span className="text-xs text-muted-foreground">({item.percent}%)</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-muted/30 rounded-full mt-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percent}%` }}
                  transition={{ delay: idx * 0.05 + 0.2, duration: 0.6 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Compliance Alert */}
      {pulseMetrics.complianceIssues > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 rounded-lg bg-destructive/15 border border-destructive/30 flex items-start gap-2"
        >
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">
              {pulseMetrics.complianceIssues} compliance issue{pulseMetrics.complianceIssues !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Deals needing compliance validation
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
