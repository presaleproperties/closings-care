import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
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
        type: tx.transaction_type === 'BUYER_SIDE' ? 'Buyers Agent' : 'Listing Agent',
      }))
      .sort((a: any, b: any) => a.date.getTime() - b.date.getTime());
  }, [syncedTransactions, now]);

  const totalUpcoming = upcomingItems.reduce((s: number, i: any) => s + i.amount, 0);

  return (
    <Card className="p-5 border-border/40 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <div>
          <h3 className="font-semibold text-foreground">Upcoming Revenue</h3>
        </div>
        {totalUpcoming > 0 && (
          <Badge variant="outline" className="ml-auto text-primary border-primary/30">
            {formatCurrency(totalUpcoming)} in 30 days
          </Badge>
        )}
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {upcomingItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No upcoming closings</p>
        ) : upcomingItems.map((item: any) => (
          <div
            key={item.id}
            className="p-3 rounded-lg border border-border/30 bg-muted/20"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-primary">
                  Closing {format(item.date, 'MMM d')}
                </p>
                <p className="text-sm text-foreground truncate mt-0.5">{item.address}</p>
                <div className="flex items-center gap-2 mt-1">
                  {item.agentName && (
                    <span className="text-xs text-muted-foreground">{item.agentName}</span>
                  )}
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5">{item.type}</Badge>
                </div>
              </div>
              <p className="text-sm font-bold text-foreground ml-3">
                {item.amount >= 1000 ? `$${Math.round(item.amount / 1000)}K` : formatCurrency(item.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {upcomingItems.length > 0 && (
        <button 
          onClick={() => navigate('/payouts')}
          className="w-full text-center text-sm text-primary hover:underline mt-3"
        >
          View full calendar →
        </button>
      )}
    </Card>
  );
}
