import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { differenceInDays, addDays, startOfDay, isBefore, isAfter } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface NeedsAttentionProps {
  deals: any[];
  payouts: any[];
  syncedTransactions: any[];
}

export function NeedsAttention({ deals, payouts, syncedTransactions }: NeedsAttentionProps) {
  const navigate = useNavigate();
  const now = startOfDay(new Date());

  const alerts = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      subtitle: string;
      amount: number;
      link: string;
      severity: 'error' | 'warning' | 'info';
    }> = [];

    // Overdue deals - past expected close date
    const overdueDeals = deals.filter(d => {
      if (d.status !== 'PENDING') return false;
      const closeDate = d.close_date_est || d.close_date_actual;
      return closeDate && isBefore(new Date(closeDate), now);
    });
    if (overdueDeals.length > 0) {
      const overdueValue = overdueDeals.reduce((s, d) => s + Number(d.gross_commission_est || d.net_commission_est || 0), 0);
      items.push({
        id: 'overdue',
        title: `You have ${overdueDeals.length} overdue deal${overdueDeals.length > 1 ? 's' : ''}`,
        subtitle: `${overdueDeals.length} deals past expected close date`,
        amount: overdueValue,
        link: '/deals',
        severity: 'error',
      });
    }

    // Closing this week
    const weekOut = addDays(now, 7);
    const closingThisWeek = payouts.filter(p => {
      if (p.status === 'PAID') return false;
      return p.due_date && isAfter(new Date(p.due_date), now) && isBefore(new Date(p.due_date), weekOut);
    });
    if (closingThisWeek.length > 0) {
      const weekValue = closingThisWeek.reduce((s, p) => s + Number(p.amount), 0);
      items.push({
        id: 'this-week',
        title: `You have ${closingThisWeek.length} deal${closingThisWeek.length > 1 ? 's' : ''} closing this week`,
        subtitle: `${closingThisWeek.length} deal${closingThisWeek.length > 1 ? 's' : ''} closing within 7 days`,
        amount: weekValue,
        link: '/payouts',
        severity: 'warning',
      });
    }

    // Aging pipeline - pending > 30 days
    const agingDeals = deals.filter(d => {
      if (d.status !== 'PENDING') return false;
      const pendDate = d.pending_date || d.created_at;
      return pendDate && differenceInDays(now, new Date(pendDate)) > 30;
    });
    if (agingDeals.length > 0) {
      const agingValue = agingDeals.reduce((s, d) => s + Number(d.gross_commission_est || d.net_commission_est || 0), 0);
      items.push({
        id: 'aging',
        title: `You have ${agingDeals.length} deals aging in pipeline`,
        subtitle: `${agingDeals.length} deals pending 30+ days`,
        amount: agingValue,
        link: '/deals',
        severity: 'info',
      });
    }

    // Overdue payouts
    const overduePayouts = payouts.filter(p => 
      p.status !== 'PAID' && p.due_date && isBefore(new Date(p.due_date), now)
    );
    if (overduePayouts.length > 0) {
      const overduePayoutValue = overduePayouts.reduce((s, p) => s + Number(p.amount), 0);
      items.push({
        id: 'overdue-payouts',
        title: `${overduePayouts.length} overdue payout${overduePayouts.length > 1 ? 's' : ''}`,
        subtitle: 'Payments past their due date',
        amount: overduePayoutValue,
        link: '/payouts',
        severity: 'error',
      });
    }

    return items;
  }, [deals, payouts, now]);

  const totalItems = alerts.reduce((s, a) => s + 1, 0);

  const severityColors = {
    error: 'text-destructive',
    warning: 'text-amber-500',
    info: 'text-primary',
  };

  return (
    <Card className="p-5 border-border/40 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">Needs Attention</h3>
        {totalItems > 0 && (
          <Badge variant="outline" className="ml-auto">
            {totalItems} item{totalItems > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">All clear! Nothing needs attention.</p>
        ) : alerts.map(alert => (
          <div
            key={alert.id}
            className="p-3 rounded-lg border border-border/30 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
            onClick={() => navigate(alert.link)}
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${severityColors[alert.severity]}`}>
                  {alert.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{alert.subtitle}</p>
                <button className="text-xs text-primary flex items-center gap-0.5 mt-1 hover:underline">
                  See {alert.id === 'overdue' ? `${alerts.find(a => a.id === 'overdue') ? 'items' : 'item'}` : 'details'} <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <p className="text-sm font-bold text-foreground ml-3">
                {formatCurrency(alert.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
