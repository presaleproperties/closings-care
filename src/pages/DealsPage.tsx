import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Calendar, DollarSign, CheckCircle2, Clock, Eye } from 'lucide-react';
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
          // Include dates from start of month through end of month (inclusive)
          return dueDate >= thisMonthStart && dueDate <= thisMonthEnd;
        }

        if (timeFilter === 'next-month') {
          // Include dates from start of next month through end of next month (inclusive)
          return dueDate >= nextMonthStart && dueDate <= nextMonthEnd;
        }

        return true;
      })
      .sort((a, b) => {
        // Paid items sorted by paid_date desc
        if (a.status === 'PAID' && b.status === 'PAID') {
          return new Date(b.paid_date || 0).getTime() - new Date(a.paid_date || 0).getTime();
        }
        // Unpaid items sorted by due_date asc (soonest first)
        const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        return dateA - dateB;
      });
  }, [payouts, search, timeFilter]);

  // Stats
  const stats = useMemo(() => {
    const unpaid = payouts.filter(p => p.status !== 'PAID');
    const paid = payouts.filter(p => p.status === 'PAID');
    
    return {
      upcomingCount: unpaid.length,
      upcomingAmount: unpaid.reduce((sum, p) => sum + Number(p.amount || 0), 0),
      paidCount: paid.length,
      paidAmount: paid.reduce((sum, p) => sum + Number(p.amount || 0), 0),
      totalDeals: deals.length,
    };
  }, [payouts, deals]);

  const handleMarkPaid = (id: string) => {
    markPaid.mutate(id);
  };

  const getPayoutTypeColor = (type: string) => {
    switch (type) {
      case 'Advance': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Completion': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case '2nd Payment': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case '3rd Deposit': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return isBefore(parseISO(dueDate), new Date());
  };

  return (
    <AppLayout>
      <Header 
        title="Deals & Payouts" 
        subtitle={`${stats.upcomingCount} pending · ${formatCurrency(stats.upcomingAmount)} expected`}
        action={
          <Button asChild className="btn-premium">
            <Link to="/deals/new">
              <Plus className="w-4 h-4 mr-2" />
              New Deal
            </Link>
          </Button>
        }
      />

      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setTimeFilter('upcoming')}
            className={cn(
              "p-4 rounded-xl border text-left transition-all",
              timeFilter === 'upcoming' 
                ? "bg-accent/10 border-accent" 
                : "bg-card border-border hover:border-accent/50"
            )}
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Pending</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(stats.upcomingAmount)}</p>
            <p className="text-xs text-muted-foreground">{stats.upcomingCount} payouts</p>
          </button>

          <button
            onClick={() => setTimeFilter('this-month')}
            className={cn(
              "p-4 rounded-xl border text-left transition-all",
              timeFilter === 'this-month' 
                ? "bg-accent/10 border-accent" 
                : "bg-card border-border hover:border-accent/50"
            )}
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">This Month</span>
            </div>
            <p className="text-xl font-bold">
              {formatCurrency(
                payouts
                  .filter(p => {
                    if (p.status === 'PAID' || !p.due_date) return false;
                    const d = parseISO(p.due_date);
                    const monthStart = startOfMonth(new Date());
                    const monthEnd = endOfMonth(new Date());
                    return d >= monthStart && d <= monthEnd;
                  })
                  .reduce((sum, p) => sum + Number(p.amount || 0), 0)
              )}
            </p>
          </button>

          <button
            onClick={() => setTimeFilter('next-month')}
            className={cn(
              "p-4 rounded-xl border text-left transition-all",
              timeFilter === 'next-month' 
                ? "bg-accent/10 border-accent" 
                : "bg-card border-border hover:border-accent/50"
            )}
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Next Month</span>
            </div>
            <p className="text-xl font-bold">
              {formatCurrency(
                payouts
                  .filter(p => {
                    if (p.status === 'PAID' || !p.due_date) return false;
                    const d = parseISO(p.due_date);
                    const nextMonthStart = startOfMonth(addMonths(new Date(), 1));
                    const nextMonthEnd = endOfMonth(addMonths(new Date(), 1));
                    return d >= nextMonthStart && d <= nextMonthEnd;
                  })
                  .reduce((sum, p) => sum + Number(p.amount || 0), 0)
              )}
            </p>
          </button>

          <button
            onClick={() => setTimeFilter('paid')}
            className={cn(
              "p-4 rounded-xl border text-left transition-all",
              timeFilter === 'paid' 
                ? "bg-success/10 border-success" 
                : "bg-card border-border hover:border-success/50"
            )}
          >
            <div className="flex items-center gap-2 text-success mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs">Received</span>
            </div>
            <p className="text-xl font-bold text-success">{formatCurrency(stats.paidAmount)}</p>
            <p className="text-xs text-muted-foreground">{stats.paidCount} paid</p>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by client or property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Payouts List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filteredPayouts.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {filteredPayouts.map((payout) => {
              const overdue = payout.status !== 'PAID' && isOverdue(payout.due_date);
              
              return (
                <div
                  key={payout.id}
                  className={cn(
                    "bg-card border rounded-xl p-4 transition-all hover:shadow-md group",
                    overdue ? "border-destructive/50 bg-destructive/5" : "border-border hover:border-accent/30",
                    payout.status === 'PAID' && "opacity-70"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Client & Property */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Link
                          to={`/deals/${payout.deal_id}`}
                          className="font-semibold text-sm hover:text-accent transition-colors truncate"
                        >
                          {payout.deal?.client_name || 'Unknown'}
                        </Link>
                        <Badge variant="outline" className={cn("text-[10px] shrink-0 px-1.5 py-0", getPayoutTypeColor(payout.payout_type))}>
                          {payout.payout_type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {payout.deal?.address || payout.deal?.project_name || '—'}
                      </p>
                    </div>

                    {/* Right: Amount & Actions */}
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <p className={cn(
                        "text-base font-bold",
                        payout.status === 'PAID' ? "text-success" : overdue ? "text-destructive" : "text-foreground"
                      )}>
                        {formatCurrency(payout.amount)}
                      </p>
                      <p className={cn(
                        "text-[10px]",
                        overdue ? "text-destructive font-medium" : "text-muted-foreground"
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

                  {/* Actions Row */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <Link
                      to={`/deals/${payout.deal_id}`}
                      className="text-xs text-muted-foreground hover:text-accent transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View Deal
                    </Link>
                    {payout.status !== 'PAID' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkPaid(payout.id)}
                        className="h-7 text-xs text-success hover:text-success hover:bg-success/10"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick link to all deals */}
        <div className="text-center pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {stats.totalDeals} total deals · 
            <Link to="/payouts" className="text-accent hover:underline ml-1">
              View full payout schedule →
            </Link>
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
