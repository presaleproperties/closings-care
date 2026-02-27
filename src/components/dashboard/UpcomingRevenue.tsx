import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { format, isAfter, isBefore, addDays, startOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface UpcomingRevenueProps {
  syncedTransactions: any[];
}

export function UpcomingRevenue({ syncedTransactions }: UpcomingRevenueProps) {
  const navigate = useNavigate();
  const now = startOfDay(new Date());
  const thirtyDaysOut = addDays(now, 30);

  const upcomingItems = useMemo(() => {
    return syncedTransactions
      .filter((tx: any) => {
        if (tx.status === 'closed') return false;
        if (!tx.close_date) return false;
        const closeDate = new Date(tx.close_date);
        return isAfter(closeDate, now) && isBefore(closeDate, thirtyDaysOut) && Number(tx.commission_amount) > 0;
      })
      .map((tx: any) => ({
        id: tx.id,
        date: new Date(tx.close_date),
        address: tx.property_address || tx.client_name || 'Unknown',
        amount: Number(tx.raw_data?.myNetPayout?.amount || tx.commission_amount || 0),
        agentName: tx.agent_name || undefined,
        isListing: !!tx.is_listing,
        type: tx.is_listing ? 'Listing Agent' : (tx.transaction_type === 'BUYER_SIDE' ? 'Buyers Agent' : 'Listing Agent'),
      }))
      .sort((a: any, b: any) => a.date.getTime() - b.date.getTime());
  }, [syncedTransactions, now]);

  const totalUpcoming = upcomingItems.reduce((s: number, i: any) => s + i.amount, 0);

  return (
    <div className="liquid-glass rounded-2xl p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-[15px] text-foreground leading-tight">Upcoming Revenue</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Next 30 days</p>
          </div>
        </div>
        {totalUpcoming > 0 && (
          <Badge variant="outline" className="text-primary border-primary/30 text-xs shrink-0 mt-1">
            {formatCurrency(totalUpcoming)}
          </Badge>
        )}
      </div>

      {/* Revenue items */}
      <div className="space-y-3 max-h-[420px] overflow-y-auto">
        {upcomingItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No upcoming closings</p>
        ) : upcomingItems.map((item: any) => (
          <div
            key={item.id}
            onClick={() => navigate(`/deals/${item.id}`)}
            className="p-3.5 rounded-xl border border-border/30 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-xs font-semibold text-primary leading-none">
                  Closing {format(item.date, 'MMM d')}
                </p>
                <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">{item.address}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {item.agentName && (
                    <span className="text-[11px] text-muted-foreground">{item.agentName}</span>
                  )}
                  <Badge variant="outline" className={`text-[10px] h-5 px-2 ${item.isListing ? 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/5' : ''}`}>{item.type}</Badge>
                </div>
              </div>
              <p className="text-base font-bold text-foreground shrink-0">
                {item.amount >= 1000 ? `$${Math.round(item.amount / 1000)}K` : formatCurrency(item.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {upcomingItems.length > 0 && (
        <button 
          onClick={() => navigate('/payouts')}
          className="w-full text-center text-sm font-medium text-primary hover:bg-primary/5 rounded-xl py-2.5 mt-4 transition-colors"
        >
          View full calendar →
        </button>
      )}
    </div>
  );
}
