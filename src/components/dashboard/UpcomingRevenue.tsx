import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { format, isAfter, isBefore, addDays, startOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface UpcomingRevenueProps {
  payouts: any[];
  deals: any[];
  syncedTransactions: any[];
}

export function UpcomingRevenue({ payouts, deals, syncedTransactions }: UpcomingRevenueProps) {
  const navigate = useNavigate();
  const now = startOfDay(new Date());
  const thirtyDaysOut = addDays(now, 30);

  const upcomingItems = useMemo(() => {
    const items: Array<{
      id: string;
      date: Date;
      address: string;
      amount: number;
      agentName?: string;
      dealId?: string;
      type: string;
    }> = [];

    // Upcoming payouts from deals
    payouts
      .filter(p => p.status !== 'PAID' && p.due_date)
      .forEach(p => {
        const dueDate = new Date(p.due_date);
        if (isAfter(dueDate, now) && isBefore(dueDate, thirtyDaysOut)) {
          const deal = deals.find(d => d.id === p.deal_id);
          items.push({
            id: p.id,
            date: dueDate,
            address: deal?.address || deal?.client_name || 'Unknown',
            amount: Number(p.amount),
            agentName: deal?.team_member || undefined,
            dealId: deal?.id,
            type: deal?.deal_type === 'BUY' ? 'Buyers Agent' : 'Listing Agent',
          });
        }
      });

    // Upcoming synced transactions
    syncedTransactions
      .filter(t => t.close_date && t.status !== 'Closed')
      .forEach(t => {
        const closeDate = new Date(t.close_date);
        if (isAfter(closeDate, now) && isBefore(closeDate, thirtyDaysOut)) {
          // Don't duplicate if already in payouts
          const alreadyHas = items.some(i => 
            Math.abs(i.date.getTime() - closeDate.getTime()) < 86400000 && 
            Math.abs(i.amount - Number(t.commission_amount || 0)) < 100
          );
          if (!alreadyHas && Number(t.commission_amount) > 0) {
            items.push({
              id: t.id,
              date: closeDate,
              address: t.property_address || t.client_name || 'Unknown',
              amount: Number(t.commission_amount),
              agentName: t.agent_name || undefined,
              type: t.transaction_type === 'BUYER_SIDE' ? 'Buyers Agent' : 'Listing Agent',
            });
          }
        }
      });

    items.sort((a, b) => a.date.getTime() - b.date.getTime());
    return items;
  }, [payouts, deals, syncedTransactions, now]);

  const totalUpcoming = upcomingItems.reduce((s, i) => s + i.amount, 0);

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
        ) : upcomingItems.map(item => (
          <div
            key={item.id}
            className="p-3 rounded-lg border border-border/30 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
            onClick={() => item.dealId && navigate(`/deals/${item.dealId}`)}
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
                  {item.dealId && (
                    <span className="text-xs text-primary flex items-center gap-0.5">
                      View <ArrowRight className="h-3 w-3" />
                    </span>
                  )}
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
