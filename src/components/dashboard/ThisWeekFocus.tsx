import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { differenceInDays, isBefore, startOfDay } from 'date-fns';

interface ThisWeekFocusProps {
  syncedTransactions: any[];
}

export function ThisWeekFocus({ syncedTransactions }: ThisWeekFocusProps) {
  const [dismissed, setDismissed] = useState(false);
  const now = startOfDay(new Date());

  const focus = useMemo(() => {
    // Find active synced transactions past their close date
    const overdue = syncedTransactions
      .filter(tx => {
        if (tx.status !== 'active') return false;
        return tx.close_date && isBefore(new Date(tx.close_date), now);
      })
      .map(tx => ({
        ...tx,
        daysOverdue: differenceInDays(now, new Date(tx.close_date)),
      }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue);

    if (overdue.length === 0) return null;

    const totalStuckRevenue = overdue.reduce((s: number, tx: any) => 
      s + Number(tx.raw_data?.myNetPayout?.amount || tx.commission_amount || 0), 0
    );

    const top = overdue[0];
    const address = top.property_address || top.client_name || 'the property';

    return {
      overdueCount: overdue.length,
      totalStuckRevenue,
      address,
      daysOverdue: top.daysOverdue,
    };
  }, [syncedTransactions, now]);

  if (!focus || dismissed) return null;

  return (
    <Card className="liquid-glass p-4 border-0">
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
              Most overdue: {focus.address} – {focus.daysOverdue} days past close date.
            </p>
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
