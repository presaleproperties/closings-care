import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { Payout } from '@/lib/types';

interface UpcomingPayoutsProps {
  payouts: Payout[];
  onMarkPaid: (id: string) => void;
  isPending: boolean;
}

export function UpcomingPayouts({ payouts, onMarkPaid, isPending }: UpcomingPayoutsProps) {
  const now = new Date();

  const upcomingPayouts = useMemo(() => {
    return payouts
      .filter((p) => p.status !== 'PAID')
      .sort((a, b) => {
        if (a.due_date && b.due_date) {
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        if (a.due_date) return -1;
        if (b.due_date) return 1;
        return 0;
      })
      .slice(0, 6);
  }, [payouts]);

  const getDueBadge = (dueDate: string | null) => {
    if (!dueDate) return { label: 'No date', variant: 'muted', icon: Clock };
    const days = differenceInDays(parseISO(dueDate), now);
    if (days < 0) return { label: 'Overdue', variant: 'destructive', icon: AlertCircle };
    if (days === 0) return { label: 'Due today', variant: 'destructive', icon: AlertCircle };
    if (days <= 7) return { label: `${days}d`, variant: 'warning', icon: Clock };
    if (days <= 30) return { label: `${days}d`, variant: 'default', icon: Clock };
    return { label: format(parseISO(dueDate), 'MMM d'), variant: 'muted', icon: Clock };
  };

  const pendingCount = payouts.filter(p => p.status !== 'PAID').length;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-accent" />
            Upcoming Payouts
          </h3>
          <p className="text-xs text-muted-foreground">{pendingCount} pending</p>
        </div>
        <Link to="/payouts">
          <Button variant="ghost" size="sm" className="text-accent hover:bg-accent/10">
            All <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>

      {upcomingPayouts.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-2">No pending payouts</p>
          <Link to="/deals/new">
            <Button variant="outline" size="sm">Create a deal</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {upcomingPayouts.map((payout) => {
            const badge = getDueBadge(payout.due_date);
            const BadgeIcon = badge.icon;
            return (
              <Link
                key={payout.id}
                to={`/deals/${payout.deal_id}`}
                className="block p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-all group border border-transparent hover:border-border"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">
                        {payout.deal?.client_name || 'Unknown'}
                      </p>
                      <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        badge.variant === 'destructive' ? 'bg-destructive/15 text-destructive' :
                        badge.variant === 'warning' ? 'bg-warning/15 text-warning' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        <BadgeIcon className="h-2.5 w-2.5" />
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {payout.payout_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-sm">
                      {formatCurrency(payout.amount)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-success opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onMarkPaid(payout.id);
                      }}
                      disabled={isPending}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
