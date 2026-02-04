import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Building2,
  Home,
  MapPin,
  Users,
  TrendingUp,
  ArrowUpRight,
  Filter,
  Percent
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, addMonths, isBefore, getYear, getMonth, differenceInDays } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePayouts, useMarkPayoutPaid } from '@/hooks/usePayouts';
import { useDeals } from '@/hooks/useDeals';
import { useRefreshData } from '@/hooks/useRefreshData';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { springConfigs, triggerHaptic } from '@/lib/haptics';

type TimeFilter = 'upcoming' | 'this-month' | 'next-month' | 'paid';

export default function DealsPage() {
  const { data: payouts = [], isLoading: payoutsLoading } = usePayouts();
  const { data: deals = [], isLoading: dealsLoading } = useDeals();
  const refreshData = useRefreshData();
  const markPaid = useMarkPayoutPaid();

  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('upcoming');

  const isLoading = payoutsLoading || dealsLoading;

  // Filter payouts
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
          const matchesCity = payout.deal?.city?.toLowerCase().includes(searchLower);
          if (!matchesClient && !matchesAddress && !matchesProject && !matchesCity) return false;
        }

        // Time filter
        if (timeFilter === 'paid') {
          return payout.status === 'PAID';
        }

        if (payout.status === 'PAID') return false;

        if (timeFilter === 'upcoming') {
          return true;
        }

        if (!payout.due_date) return false;

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

  // Group payouts by year and month
  const groupedPayouts = useMemo(() => {
    const groups: Map<number, Map<number, typeof filteredPayouts>> = new Map();
    
    filteredPayouts.forEach((payout) => {
      const date = payout.status === 'PAID' && payout.paid_date 
        ? parseISO(payout.paid_date)
        : payout.due_date 
          ? parseISO(payout.due_date) 
          : new Date();
      
      const year = getYear(date);
      const month = getMonth(date);
      
      if (!groups.has(year)) {
        groups.set(year, new Map());
      }
      
      const yearGroup = groups.get(year)!;
      if (!yearGroup.has(month)) {
        yearGroup.set(month, []);
      }
      
      yearGroup.get(month)!.push(payout);
    });

    // Convert to array and sort
    const result: { year: number; months: { month: number; monthName: string; payouts: typeof filteredPayouts; total: number }[] }[] = [];
    
    const sortedYears = Array.from(groups.keys()).sort((a, b) => a - b);
    
    sortedYears.forEach((year) => {
      const yearGroup = groups.get(year)!;
      const months = Array.from(yearGroup.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([month, monthPayouts]) => ({
          month,
          monthName: format(new Date(year, month), 'MMMM'),
          payouts: monthPayouts,
          total: monthPayouts.reduce((sum, p) => sum + Number(p.amount || 0), 0),
        }));
      
      result.push({ year, months });
    });

    return result;
  }, [filteredPayouts]);

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
    triggerHaptic('success');
    markPaid.mutate(id);
  };

  const getPayoutTypeStyles = (type: string) => {
    switch (type) {
      case 'Advance': return { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400', icon: TrendingUp };
      case 'Completion': return { bg: 'bg-emerald-100 dark:bg-success/20', text: 'text-emerald-700 dark:text-success', icon: CheckCircle2 };
      case '2nd Payment': return { bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-700 dark:text-purple-400', icon: DollarSign };
      case '3rd Deposit': return { bg: 'bg-amber-100 dark:bg-warning/20', text: 'text-amber-700 dark:text-warning', icon: DollarSign };
      case '4th Deposit': return { bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-700 dark:text-orange-400', icon: DollarSign };
      default: return { bg: 'bg-slate-100 dark:bg-muted', text: 'text-slate-600 dark:text-muted-foreground', icon: DollarSign };
    }
  };

  const getDueBadge = (dueDate: string | null, status: string) => {
    if (status === 'PAID') return null;
    if (!dueDate) return { label: 'No date', variant: 'muted' };
    const days = differenceInDays(parseISO(dueDate), new Date());
    if (days < 0) return { label: 'Overdue', variant: 'destructive' };
    if (days === 0) return { label: 'Due today', variant: 'destructive' };
    if (days <= 7) return { label: `${days}d left`, variant: 'warning' };
    return null;
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return isBefore(parseISO(dueDate), new Date());
  };

  const filterButtons = [
    { key: 'upcoming' as TimeFilter, label: 'Pending', icon: Clock, count: stats.upcomingCount, amount: stats.upcomingAmount },
    { key: 'this-month' as TimeFilter, label: format(new Date(), 'MMM'), icon: Calendar, count: stats.thisMonthCount, amount: stats.thisMonthAmount },
    { key: 'next-month' as TimeFilter, label: format(addMonths(new Date(), 1), 'MMM'), icon: Calendar, count: stats.nextMonthCount, amount: stats.nextMonthAmount },
    { key: 'paid' as TimeFilter, label: 'Received', icon: CheckCircle2, count: stats.paidCount, amount: stats.paidAmount, success: true },
  ];

  const currentYear = new Date().getFullYear();

  // Enhanced payout card
  const renderPayoutCard = (payout: typeof payouts[0], index: number) => {
    const overdue = payout.status !== 'PAID' && isOverdue(payout.due_date);
    const deal = payout.deal;
    const isPresale = deal?.property_type === 'PRESALE';
    const isTeamDeal = !!deal?.team_member;
    const typeStyles = getPayoutTypeStyles(payout.payout_type);
    const TypeIcon = typeStyles.icon;
    const dueBadge = getDueBadge(payout.due_date, payout.status);
    const DealIcon = isPresale ? Building2 : Home;

    return (
      <motion.div
        key={payout.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springConfigs.gentle, delay: index * 0.03 }}
      >
        <Link
          to={`/deals/${payout.deal_id}`}
          onClick={() => triggerHaptic('light')}
        >
          <motion.div
            className={cn(
              "relative overflow-hidden rounded-2xl border transition-all group",
              payout.status === 'PAID' 
                ? isTeamDeal
                  ? "bg-violet-50/50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/30"
                  : "bg-slate-50/80 dark:bg-card/30 border-slate-200 dark:border-border/30"
                : overdue 
                  ? "bg-destructive/5 border-destructive/30 dark:border-destructive/50"
                  : isTeamDeal
                    ? "bg-violet-50/40 dark:bg-violet-500/5 border-violet-200 dark:border-violet-500/40 hover:border-violet-400 hover:shadow-lg hover:shadow-violet-500/10"
                    : "bg-white dark:bg-card/80 border-slate-200 dark:border-border/50 hover:border-primary/40 hover:shadow-lg"
            )}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={springConfigs.snappy}
          >
            {/* Team deal indicator bar */}
            {isTeamDeal && !overdue && dueBadge?.variant !== 'warning' && (
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-violet-400 dark:bg-violet-500" />
            )}
            {/* Urgency bar */}
            {overdue && (
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-destructive" />
            )}
            {dueBadge?.variant === 'warning' && (
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-warning" />
            )}
            
            {/* Paid overlay gradient */}
            {payout.status === 'PAID' && (
              <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent pointer-events-none" />
            )}

            <div className="p-4 sm:p-5">
              {/* Header row */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-bold text-base sm:text-lg truncate text-slate-800 dark:text-foreground">
                      {deal?.client_name || 'Unknown Client'}
                    </h3>
                    {dueBadge && (
                      <span className={cn(
                        "shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold",
                        dueBadge.variant === 'destructive' && "bg-destructive/15 text-destructive",
                        dueBadge.variant === 'warning' && "bg-warning/15 text-warning",
                        dueBadge.variant === 'muted' && "bg-muted text-muted-foreground"
                      )}>
                        {dueBadge.label}
                      </span>
                    )}
                    {payout.status === 'PAID' && (
                      <span className="shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-success/15 text-success">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Paid
                      </span>
                    )}
                  </div>
                  
                  {/* Property details row */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-500 dark:text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <DealIcon className="h-3.5 w-3.5" />
                      {isPresale ? (deal?.project_name || 'Presale') : 'Resale'}
                    </span>
                    {deal?.city && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {deal.city}
                      </span>
                    )}
                    {deal?.address && !isPresale && (
                      <span className="hidden sm:inline-flex items-center gap-1 truncate max-w-[200px]">
                        {deal.address}
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <p className={cn(
                    "text-xl sm:text-2xl font-bold",
                    payout.status === 'PAID' 
                      ? "text-success" 
                      : overdue 
                        ? "text-destructive"
                        : "text-emerald-600 dark:text-accent"
                  )}>
                    {formatCurrency(payout.amount)}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-muted-foreground mt-0.5">
                    {payout.status === 'PAID' && payout.paid_date
                      ? `Received ${format(parseISO(payout.paid_date), 'MMM d, yyyy')}`
                      : payout.due_date
                        ? format(parseISO(payout.due_date), 'MMM d, yyyy')
                        : 'No date set'}
                  </p>
                </div>
              </div>

              {/* Details row */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-border/30">
                <div className="flex items-center gap-2">
                  {/* Payout type badge */}
                  <span className={cn(
                    "inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-medium",
                    typeStyles.bg, typeStyles.text
                  )}>
                    <TypeIcon className="h-3 w-3" />
                    {payout.payout_type}
                  </span>

                  {/* Deal type badge */}
                  <span className={cn(
                    "inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-medium",
                    deal?.deal_type === 'BUY' 
                      ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
                  )}>
                    {deal?.deal_type === 'BUY' ? 'Buyer' : 'Seller'}
                  </span>

                  {/* Team member indicator */}
                  {deal?.team_member && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 font-medium">
                      <Users className="h-2.5 w-2.5" />
                      <span className="hidden sm:inline">{deal.team_member} •</span> {deal.team_member_portion}%
                    </span>
                  )}
                </div>

                {/* Action button */}
                {payout.status !== 'PAID' ? (
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-[11px] font-medium text-success hover:text-success hover:bg-success/10 rounded-lg gap-1.5"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMarkPaid(payout.id);
                      }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark Paid
                    </Button>
                  </motion.div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-muted-foreground">
                    View details
                    <ArrowUpRight className="h-3 w-3" />
                  </span>
                )}
              </div>

              {/* Sale price info - only on desktop */}
              {deal?.sale_price && (
                <div className="hidden sm:flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-border/30 text-[11px] text-slate-400 dark:text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    Sale: {formatCurrency(deal.sale_price)}
                  </span>
                  {deal?.gross_commission_est && (
                    <span className="inline-flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      GCI: {formatCurrency(
                        deal.team_member_portion && deal.team_member_portion > 0
                          ? deal.gross_commission_est * (100 - deal.team_member_portion) / 100
                          : deal.gross_commission_est
                      )}
                      {deal.team_member_portion && deal.team_member_portion > 0 && (
                        <span className="text-slate-300 dark:text-muted-foreground/50 ml-0.5">
                          ({100 - deal.team_member_portion}%)
                        </span>
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </Link>
      </motion.div>
    );
  };

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

      <PullToRefresh onRefresh={refreshData} className="min-h-[calc(100vh-56px)]">
        <div className="p-4 lg:p-6 space-y-5 lg:space-y-6 animate-fade-in">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {filterButtons.map((btn, i) => (
              <motion.button
                key={btn.key}
                onClick={() => {
                  triggerHaptic('light');
                  setTimeFilter(btn.key);
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springConfigs.gentle, delay: i * 0.05 }}
                className={cn(
                  "relative p-4 rounded-2xl border text-left transition-all overflow-hidden",
                  timeFilter === btn.key 
                    ? btn.success 
                      ? "bg-gradient-to-br from-success/15 to-success/5 border-success/50 shadow-lg shadow-success/10" 
                      : "bg-gradient-to-br from-primary/15 to-primary/5 border-primary/50 shadow-lg shadow-primary/10"
                    : "bg-white dark:bg-card/80 border-slate-200 dark:border-border/50 hover:border-primary/30"
                )}
              >
                {timeFilter === btn.key && (
                  <div className={cn(
                    "absolute top-2 right-2 w-2 h-2 rounded-full",
                    btn.success ? "bg-success" : "bg-primary"
                  )} />
                )}
                <div className={cn(
                  "flex items-center gap-2 mb-2",
                  timeFilter === btn.key 
                    ? btn.success ? "text-success" : "text-primary"
                    : "text-slate-500 dark:text-muted-foreground"
                )}>
                  <btn.icon className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">{btn.label}</span>
                </div>
                <p className={cn(
                  "text-2xl font-bold",
                  timeFilter === btn.key 
                    ? btn.success ? "text-success" : "text-primary"
                    : "text-slate-800 dark:text-foreground"
                )}>
                  {formatCurrency(btn.amount)}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-muted-foreground mt-0.5">
                  {btn.count} payout{btn.count !== 1 ? 's' : ''}
                </p>
              </motion.button>
            ))}
          </div>

          {/* Search and Add Deal */}
          <motion.div 
            className="flex gap-3 items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfigs.gentle, delay: 0.2 }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-muted-foreground" />
              <Input
                placeholder="Search by client, project, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 bg-white dark:bg-card/80 border-slate-200 dark:border-border/50 rounded-xl text-[15px] placeholder:text-slate-400 dark:placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
            <Link to="/deals/new">
              <Button className="btn-premium h-12 px-5 gap-2 whitespace-nowrap">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Deal</span>
              </Button>
            </Link>
          </motion.div>

          {/* Payouts List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Loading deals...</p>
              </div>
            </div>
          ) : filteredPayouts.length === 0 ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={springConfigs.gentle}
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-muted dark:to-muted/50 flex items-center justify-center shadow-inner">
                <DollarSign className="w-10 h-10 text-slate-300 dark:text-muted-foreground/50" />
              </div>
              <p className="text-lg font-medium text-slate-600 dark:text-muted-foreground mb-1">
                {timeFilter === 'paid' ? 'No paid payouts yet' : 'No pending payouts'}
              </p>
              <p className="text-sm text-slate-400 dark:text-muted-foreground mb-6">
                {timeFilter === 'paid' ? 'Complete some deals to see your earnings' : 'Add a deal to start tracking your income'}
              </p>
              <Button asChild className="btn-premium h-12 px-6">
                <Link to="/deals/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Deal
                </Link>
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {groupedPayouts.map((yearGroup) => (
                <div key={yearGroup.year} className="space-y-6">
                  {/* Year Header */}
                  {(yearGroup.year !== currentYear || groupedPayouts.length > 1) && (
                    <motion.div 
                      className="flex items-center gap-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-border to-transparent" />
                      <span className="text-sm font-bold text-slate-600 dark:text-foreground px-4 py-1.5 bg-slate-100 dark:bg-muted rounded-full">
                        {yearGroup.year}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-border to-transparent" />
                    </motion.div>
                  )}

                  {yearGroup.months.map((monthGroup) => (
                    <div key={`${yearGroup.year}-${monthGroup.month}`} className="space-y-4">
                      {/* Month Header */}
                      <motion.div 
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={springConfigs.gentle}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-foreground">{monthGroup.monthName}</h3>
                            <p className="text-xs text-slate-400 dark:text-muted-foreground">
                              {monthGroup.payouts.length} payout{monthGroup.payouts.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-emerald-600 dark:text-accent">
                            {formatCurrency(monthGroup.total)}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-muted-foreground">
                            {timeFilter === 'paid' ? 'received' : 'expected'}
                          </p>
                        </div>
                      </motion.div>

                      {/* Payout Cards Grid */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        {monthGroup.payouts.map((payout, idx) => renderPayoutCard(payout, idx))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Quick link */}
          {filteredPayouts.length > 0 && (
            <motion.div 
              className="text-center pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Link 
                to="/payouts" 
                className="inline-flex items-center gap-1 text-[13px] text-primary font-medium hover:underline"
                onClick={() => triggerHaptic('light')}
              >
                View full payout schedule
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          )}

          {/* Desktop: Add button */}
          <div className="hidden sm:flex justify-center pt-4">
            <Button asChild size="lg" className="btn-premium h-12 px-8">
              <Link to="/deals/new">
                <Plus className="w-5 h-5 mr-2" />
                New Deal
              </Link>
            </Button>
          </div>
        </div>
      </PullToRefresh>
    </AppLayout>
  );
}
