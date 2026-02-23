import { useMemo, useState } from 'react';
import { Bell, AlertTriangle, Clock, FileQuestion, CalendarClock, ArrowRight, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/format';
import { addDays, startOfDay, isBefore, isAfter, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';

interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  amount?: number;
  count: number;
  link: string;
  severity: 'error' | 'warning' | 'info';
  icon: typeof AlertTriangle;
}

interface NotificationCenterProps {
  syncedTransactions: any[];
  pipelineProspects?: any[];
}

export function NotificationCenter({ syncedTransactions, pipelineProspects = [] }: NotificationCenterProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const now = startOfDay(new Date());

  const notifications = useMemo(() => {
    const items: NotificationItem[] = [];

    // 1. Active deals past close date
    const pastDue = syncedTransactions.filter((tx: any) =>
      tx.status === 'active' && tx.close_date && isBefore(new Date(tx.close_date), now)
    );
    if (pastDue.length > 0) {
      const total = pastDue.reduce((s: number, tx: any) => s + Number(tx.raw_data?.myNetPayout?.amount || tx.commission_amount || 0), 0);
      items.push({
        id: 'overdue-deals',
        title: `${pastDue.length} deal${pastDue.length > 1 ? 's' : ''} past close date`,
        subtitle: 'Active deals with expired close dates need status updates',
        amount: total,
        count: pastDue.length,
        link: '/deals',
        severity: 'error',
        icon: AlertTriangle,
      });
    }

    // 2. Deals closing within 7 days
    const weekOut = addDays(now, 7);
    const closingSoon = syncedTransactions.filter((tx: any) =>
      tx.status !== 'closed' && tx.close_date &&
      isAfter(new Date(tx.close_date), now) && isBefore(new Date(tx.close_date), weekOut)
    );
    if (closingSoon.length > 0) {
      const total = closingSoon.reduce((s: number, tx: any) => s + Number(tx.raw_data?.myNetPayout?.amount || tx.commission_amount || 0), 0);
      items.push({
        id: 'closing-soon',
        title: `${closingSoon.length} deal${closingSoon.length > 1 ? 's' : ''} closing this week`,
        subtitle: 'Prepare for upcoming closings',
        amount: total,
        count: closingSoon.length,
        link: '/deals',
        severity: 'warning',
        icon: CalendarClock,
      });
    }

    // 3. Missing deal info (lead source or buyer type)
    const missingInfo = syncedTransactions.filter((tx: any) =>
      tx.status !== 'closed' && (!tx.lead_source || !tx.buyer_type)
    );
    if (missingInfo.length > 0) {
      items.push({
        id: 'missing-info',
        title: `${missingInfo.length} deal${missingInfo.length > 1 ? 's' : ''} missing info`,
        subtitle: 'Lead source or buyer type not set',
        count: missingInfo.length,
        link: '/deals',
        severity: 'info',
        icon: FileQuestion,
      });
    }

    // 4. Pipeline deals that are stale (active, no update in 14+ days)
    const twoWeeksAgo = addDays(now, -14);
    const stalePipeline = pipelineProspects.filter((p: any) =>
      p.status === 'active' && p.updated_at && isBefore(new Date(p.updated_at), twoWeeksAgo)
    );
    if (stalePipeline.length > 0) {
      items.push({
        id: 'stale-pipeline',
        title: `${stalePipeline.length} stale pipeline lead${stalePipeline.length > 1 ? 's' : ''}`,
        subtitle: 'No updates in 14+ days — follow up or update status',
        count: stalePipeline.length,
        link: '/pipeline',
        severity: 'warning',
        icon: Clock,
      });
    }

    return items;
  }, [syncedTransactions, pipelineProspects, now]);

  const totalCount = notifications.reduce((s, n) => s + n.count, 0);
  const hasErrors = notifications.some(n => n.severity === 'error');

  const severityStyles = {
    error: 'border-destructive/30 bg-destructive/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    info: 'border-primary/30 bg-primary/5',
  };

  const severityTextColors = {
    error: 'text-destructive',
    warning: 'text-amber-500',
    info: 'text-primary',
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={() => triggerHaptic('light')}
          className={cn(
            "relative inline-flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-200 active:scale-95",
            "bg-secondary/80 hover:bg-secondary border border-border/50",
            totalCount > 0 && "hover:border-primary/30"
          )}
        >
          <Bell className="h-4 w-4 text-foreground" />
          {totalCount > 0 && (
            <span className={cn(
              "absolute -top-1 -right-1 h-4.5 min-w-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white",
              hasErrors ? "bg-destructive" : "bg-amber-500"
            )}>
              {totalCount > 99 ? '99+' : totalCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 sm:w-96 p-0 rounded-2xl border border-border/50 shadow-xl"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          </div>
          {totalCount > 0 && (
            <Badge variant="outline" className="text-[10px] px-2 py-0 h-5">
              {totalCount} item{totalCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Items */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">All clear!</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">Nothing needs your attention</p>
            </div>
          ) : (
            <div className="p-2 space-y-1.5">
              {notifications.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setOpen(false);
                    navigate(item.link);
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border transition-all duration-200 hover:shadow-sm group",
                    severityStyles[item.severity]
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <item.icon className={cn("h-4 w-4 mt-0.5 shrink-0", severityTextColors[item.severity])} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm font-semibold", severityTextColors[item.severity])}>
                          {item.title}
                        </p>
                        {item.amount && (
                          <span className="text-xs font-bold text-foreground shrink-0">
                            {formatCurrency(item.amount)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{item.subtitle}</p>
                      <span className="text-[11px] text-primary flex items-center gap-0.5 mt-1.5 font-medium group-hover:underline">
                        Review <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
