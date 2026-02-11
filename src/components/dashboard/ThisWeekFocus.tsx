import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { differenceInDays, isBefore, startOfDay } from 'date-fns';

interface ThisWeekFocusProps {
  deals: any[];
  payouts: any[];
}

export function ThisWeekFocus({ deals, payouts }: ThisWeekFocusProps) {
  const [dismissed, setDismissed] = useState(false);
  const now = startOfDay(new Date());

  const focus = useMemo(() => {
    // Find most overdue/stuck deals
    const overdueDeals = deals
      .filter(d => {
        if (d.status !== 'PENDING') return false;
        const closeDate = d.close_date_est;
        return closeDate && isBefore(new Date(closeDate), now);
      })
      .map(d => ({
        ...d,
        daysOverdue: differenceInDays(now, new Date(d.close_date_est)),
      }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue);

    if (overdueDeals.length === 0) return null;

    const totalStuckRevenue = overdueDeals.reduce((s, d) => 
      s + Number(d.gross_commission_est || d.net_commission_est || 0), 0
    );

    // Pick the most overdue deal for the suggested action
    const topDeal = overdueDeals[0];
    const agentName = topDeal.team_member || topDeal.client_name;
    const address = topDeal.address || topDeal.project_name || 'the property';

    return {
      overdueCount: overdueDeals.length,
      totalStuckRevenue,
      agentName,
      address,
      daysOverdue: topDeal.daysOverdue,
    };
  }, [deals, now]);

  if (!focus || dismissed) return null;

  return (
    <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">This Week's Focus</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {focus.overdueCount} overdue deal{focus.overdueCount > 1 ? 's' : ''} = {formatCurrency(focus.totalStuckRevenue)} stuck revenue
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Start with {focus.agentName} – they may need help getting these across the line.
            </p>
            <div className="mt-2 p-2.5 rounded-lg border border-border/30 bg-muted/30">
              <p className="text-[10px] text-muted-foreground mb-0.5">Suggested script:</p>
              <p className="text-xs italic text-foreground/80">
                "{focus.agentName}, I noticed {focus.address} is {focus.daysOverdue} days past close – anything I can help with?"
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setDismissed(true)}
          className="text-xs text-primary hover:underline flex-shrink-0 ml-2"
        >
          Got it
        </button>
      </div>
    </Card>
  );
}
