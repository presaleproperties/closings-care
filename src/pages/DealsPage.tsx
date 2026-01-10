import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Calendar, DollarSign, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, addMonths, isBefore } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePayouts, useMarkPayoutPaid } from '@/hooks/usePayouts';
import { useDeals } from '@/hooks/useDeals';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

type TimeFilter = 'all' | 'upcoming' | 'this-month' | 'next-month' | 'paid';

export default function DealsPage() {
  const { data: payouts = [], isLoading: payoutsLoading } = usePayouts();
  const { data: deals = [], isLoading: dealsLoading } = useDeals();
  const markPaid = useMarkPayoutPaid();

  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('upcoming');

  const isLoading = payoutsLoading || dealsLoading;

  // Filter and sort payouts
  const filteredPayouts = useMemo(() => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const nextMonthStart = startOfMonth(addMonths(now, 1));
    const nextMonthEnd = endOfMonth(addMonths(now, 1));

    return payouts
      .filter((payout) => {
        // Search filter
        if (search) {
          const searchLower = search.toLowerCase();
          const matchesClient = payout.deal?.client_name?.toLowerCase().includes(searchLower);
          const matchesAddress = payout.deal?.address?.toLowerCase().includes(searchLower);
          const matchesProject = payout.deal?.project_name?.toLowerCase().includes(searchLower);
          if (!matchesClient && !matchesAddress && !matchesProject) return false;
        }

        // Time filter
        if (timeFilter === 'paid') {
          return payout.status === 'PAID';
        }

        if (payout.status === 'PAID') return false;

        if (timeFilter === 'upcoming') {
          return true; // All unpaid
        }

        if (!payout.due_date) return timeFilter === 'all';

        const dueDate = parseISO(payout.due_date);

        if (timeFilter === 'this-month') {
          return dueDate >= thisMonthStart && dueDate <= thisMonthEnd;
        }

        if (timeFilter === 'next-month') {
          return dueDate >= nextMonthStart && dueDate <= nextMonthEnd;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.status === 'PAID' && b.status === 'PAID') {
          return new Date(b.paid_date || 0).getTime() - new Date(a.paid_date || 0).getTime();
        }
        const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        return dateA - dateB;
      });
  }, [payouts, search, timeFilter]);

  // Stats
  const stats = useMemo(() => {
    const unpaid = payouts.filter(p => p.status !== 'PAID');
    const paid = payouts.filter(p => p.status === 'PAID');
    
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const nextMonthStart = startOfMonth(addMonths(now, 1));
    const nextMonthEnd = endOfMonth(addMonths(now, 1));
    
    const thisMonthPayouts = payouts.filter(p => {
      if (p.status === 'PAID' || !p.due_date) return false;
      const d = parseISO(p.due_date);
      return d >= thisMonthStart && d <= thisMonthEnd;
    });
    
    const nextMonthPayouts = payouts.filter(p => {
      if (p.status === 'PAID' || !p.due_date) return false;
      const d = parseISO(p.due_date);
      return d >= nextMonthStart && d <= nextMonthEnd;
    });
    
    return {
      upcomingCount: unpaid.length,
      upcomingAmount: unpaid.reduce((sum, p) => sum + Number(p.amount || 0), 0),
      paidCount: paid.length,
      paidAmount: paid.reduce((sum, p) => sum + Number(p.amount || 0), 0),
      totalDeals: deals.length,
      thisMonthAmount: thisMonthPayouts.reduce((sum, p) => sum + Number(p.amount || 0), 0),
      thisMonthCount: thisMonthPayouts.length,
      nextMonthAmount: nextMonthPayouts.reduce((sum, p) => sum + Number(p.amount || 0), 0),
      nextMonthCount: nextMonthPayouts.length,
    };
  }, [payouts, deals]);

  const handleMarkPaid = (id: string) => {
    markPaid.mutate(id);
  };

  const getPayoutTypeColor = (type: string) => {
    switch (type) {
      case 'Advance': return 'bg-info/15 text-info';
      case 'Completion': return 'bg-success/15 text-success';
      case '2nd Payment': return 'bg-purple-500/15 text-purple-500';
      case '3rd Deposit': return 'bg-warning/15 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return isBefore(parseISO(dueDate), new Date());
  };

  const filterButtons = [
    { key: 'upcoming' as TimeFilter, label: 'Pending', icon: Clock, count: stats.upcomingCount, amount: stats.upcomingAmount },
    { key: 'this-month' as TimeFilter, label: 'This Month', icon: Calendar, count: stats.thisMonthCount, amount: stats.thisMonthAmount },
    { key: 'next-month' as TimeFilter, label: 'Next Month', icon: Calendar, count: stats.nextMonthCount, amount: stats.nextMonthAmount },
    { key: 'paid' as TimeFilter, label: 'Received', icon: CheckCircle2, count: stats.paidCount, amount: stats.paidAmount, success: true },
  ];

  return (
    <AppLayout>
      <Header 
        title="Deals" 
        subtitle={`${stats.upcomingCount} pending · ${formatCurrency(stats.upcomingAmount)}`}
        showAddDeal={false}
        action={
          <Link 
            to="/deals/new"
            className="sm:hidden text-primary font-semibold text-[17px] active:opacity-50 transition-opacity"
          >
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </Link>
        }
      />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 animate-fade-in">
        {/* Mobile: Horizontal scroll filter pills */}
        <div className="sm:hidden -mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {filterButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setTimeFilter(btn.key)}
                className={cn(
                  "flex-shrink-0 px-4 py-2.5 rounded-full text-[13px] font-medium transition-all active:scale-95",
                  timeFilter === btn.key 
                    ? btn.success 
                      ? "bg-success text-success-foreground"
                      : "bg-primary text-primary-foreground"
                    : "bg-secondary/80 text-secondary-foreground"
                )}
              >
                {btn.label}
                <span className="ml-1.5 opacity-80">({btn.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop: Grid stats */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-3">
          {filterButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setTimeFilter(btn.key)}
              className={cn(
                "p-4 rounded-2xl border text-left transition-all active:scale-[0.98]",
                timeFilter === btn.key 
                  ? btn.success 
                    ? "bg-success/10 border-success" 
                    : "bg-primary/10 border-primary"
                  : "bg-card/95 backdrop-blur-xl border-border/50 hover:border-primary/30 shadow-ios"
              )}
            >
              <div className={cn(
                "flex items-center gap-2 mb-1",
                btn.success && timeFilter === btn.key ? "text-success" : "text-muted-foreground"
              )}>
                <btn.icon className="w-4 h-4" />
                <span className="text-xs font-medium">{btn.label}</span>
              </div>
              <p className={cn(
                "text-xl font-bold",
                btn.success && timeFilter === btn.key && "text-success"
              )}>{formatCurrency(btn.amount)}</p>
              <p className="text-xs text-muted-foreground">{btn.count} payouts</p>
            </button>
          ))}
        </div>

        {/* Search - iOS style */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <Input
            placeholder="Search by client or property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 sm:h-11 bg-secondary/60 border-0 rounded-xl placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Payouts List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredPayouts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground mb-4">
              {timeFilter === 'paid' ? 'No paid payouts yet' : 'No pending payouts'}
            </p>
            <Button asChild className="btn-premium">
              <Link to="/deals/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Deal
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile: iOS-style list */}
            <div className="sm:hidden">
              <div className="rounded-2xl bg-card/95 backdrop-blur-xl border border-border/50 overflow-hidden shadow-ios divide-y divide-border/30">
                {filteredPayouts.map((payout) => {
                  const overdue = payout.status !== 'PAID' && isOverdue(payout.due_date);
                  
                  return (
                    <Link
                      key={payout.id}
                      to={`/deals/${payout.deal_id}`}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-muted/50",
                        payout.status === 'PAID' && "opacity-60"
                      )}
                    >
                      {/* Status indicator */}
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        payout.status === 'PAID' 
                          ? "bg-success/15"
                          : overdue 
                            ? "bg-destructive/15"
                            : "bg-primary/10"
                      )}>
                        {payout.status === 'PAID' ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <DollarSign className={cn(
                            "w-5 h-5",
                            overdue ? "text-destructive" : "text-primary"
                          )} />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[15px] truncate">
                            {payout.deal?.client_name || 'Unknown'}
                          </p>
                          <Badge variant="outline" className={cn("text-[10px] shrink-0 px-1.5 py-0 border-0", getPayoutTypeColor(payout.payout_type))}>
                            {payout.payout_type}
                          </Badge>
                        </div>
                        <p className={cn(
                          "text-[13px]",
                          overdue ? "text-destructive" : "text-muted-foreground"
                        )}>
                          {payout.status === 'PAID' && payout.paid_date
                            ? `Paid ${format(parseISO(payout.paid_date), 'MMM d')}`
                            : payout.due_date
                              ? `Due ${format(parseISO(payout.due_date), 'MMM d, yyyy')}`
                              : 'No date set'}
                          {overdue && ' · Overdue'}
                        </p>
                      </div>
                      
                      {/* Amount & chevron */}
                      <div className="flex items-center gap-2 shrink-0">
                        <p className={cn(
                          "text-[15px] font-semibold",
                          payout.status === 'PAID' ? "text-success" : overdue ? "text-destructive" : ""
                        )}>
                          {formatCurrency(payout.amount)}
                        </p>
                        <ChevronRight className="w-5 h-5 text-muted-foreground/40" />
                      </div>
                    </Link>
                  );
                })}
              </div>
              
              {/* Mark paid action (shown as floating for pending items) */}
              {timeFilter !== 'paid' && filteredPayouts.length > 0 && (
                <p className="text-center text-[13px] text-muted-foreground mt-4">
                  Tap a payout to view details or mark as paid
                </p>
              )}
            </div>

            {/* Desktop: Grid cards */}
            <div className="hidden sm:grid gap-3 grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {filteredPayouts.map((payout) => {
                const overdue = payout.status !== 'PAID' && isOverdue(payout.due_date);
                
                return (
                  <div
                    key={payout.id}
                    className={cn(
                      "bg-card/95 backdrop-blur-xl border rounded-2xl p-4 transition-all hover:shadow-ios-lg group",
                      overdue ? "border-destructive/50 bg-destructive/5" : "border-border/50 hover:border-primary/30",
                      payout.status === 'PAID' && "opacity-70"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Link
                            to={`/deals/${payout.deal_id}`}
                            className="font-semibold text-sm hover:text-primary transition-colors truncate"
                          >
                            {payout.deal?.client_name || 'Unknown'}
                          </Link>
                          <Badge variant="outline" className={cn("text-[10px] shrink-0 px-1.5 py-0 border-0", getPayoutTypeColor(payout.payout_type))}>
                            {payout.payout_type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {payout.deal?.address || payout.deal?.project_name || '—'}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className={cn(
                          "text-base font-bold",
                          payout.status === 'PAID' ? "text-success" : overdue ? "text-destructive" : ""
                        )}>
                          {formatCurrency(payout.amount)}
                        </p>
                        <p className={cn(
                          "text-[10px]",
                          overdue ? "text-destructive" : "text-muted-foreground"
                        )}>
                          {payout.status === 'PAID' && payout.paid_date
                            ? `Paid ${format(parseISO(payout.paid_date), 'MMM d')}`
                            : payout.due_date
                              ? `Due ${format(parseISO(payout.due_date), 'MMM d, yyyy')}`
                              : 'No date'}
                          {overdue && ' · Overdue'}
                        </p>
                      </div>
                    </div>

                    {payout.status !== 'PAID' && (
                      <div className="flex justify-end mt-3 pt-3 border-t border-border/30">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkPaid(payout.id)}
                          className="h-8 text-xs text-success hover:text-success hover:bg-success/10"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          Mark Paid
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Quick link */}
        <div className="text-center pt-4">
          <Link to="/payouts" className="text-[13px] text-primary font-medium active:opacity-50 transition-opacity">
            View full payout schedule →
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
