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
  Building2,
  Home,
  MapPin,
  Users,
  TrendingUp,
  ArrowUpRight,
  Percent,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, addMonths, isBefore, getYear, getMonth, differenceInDays } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePayouts, useMarkPayoutPaid } from '@/hooks/usePayouts';
import { useDeals } from '@/hooks/useDeals';
import { useRefreshData } from '@/hooks/useRefreshData';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';

type TimeFilter = 'upcoming' | 'this-month' | 'next-month' | 'paid';

const springConfig = { type: "spring" as const, stiffness: 100, damping: 20 };

export default function DealsPage() {
  const { data: payouts = [], isLoading: payoutsLoading } = usePayouts();
  const { data: deals = [], isLoading: dealsLoading } = useDeals();
  const refreshData = useRefreshData();
  const markPaid = useMarkPayoutPaid();

  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('upcoming');
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  const isLoading = payoutsLoading || dealsLoading;

  const filteredPayouts = useMemo(() => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const nextMonthStart = startOfMonth(addMonths(now, 1));
    const nextMonthEnd = endOfMonth(addMonths(now, 1));

    return payouts
      .filter((payout) => {
        if (search) {
          const searchLower = search.toLowerCase();
          const matchesClient = payout.deal?.client_name?.toLowerCase().includes(searchLower);
          const matchesAddress = payout.deal?.address?.toLowerCase().includes(searchLower);
          const matchesProject = payout.deal?.project_name?.toLowerCase().includes(searchLower);
          const matchesCity = payout.deal?.city?.toLowerCase().includes(searchLower);
          if (!matchesClient && !matchesAddress && !matchesProject && !matchesCity) return false;
        }

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
      case 'Advance': return { bg: 'bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400', icon: TrendingUp };
      case 'Completion': return { bg: 'bg-success/15', text: 'text-success', icon: CheckCircle2 };
      case '2nd Payment': return { bg: 'bg-purple-500/15', text: 'text-purple-600 dark:text-purple-400', icon: DollarSign };
      case '3rd Deposit': return { bg: 'bg-warning/15', text: 'text-warning', icon: DollarSign };
      case '4th Deposit': return { bg: 'bg-orange-500/15', text: 'text-orange-600 dark:text-orange-400', icon: DollarSign };
      default: return { bg: 'bg-muted', text: 'text-muted-foreground', icon: DollarSign };
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
        transition={{ ...springConfig, delay: index * 0.03 }}
      >
        <Link
          to={`/deals/${payout.deal_id}`}
          onClick={() => triggerHaptic('light')}
        >
          <motion.div
            className={cn(
              "relative overflow-hidden rounded-3xl border transition-all duration-300 group",
              payout.status === 'PAID' 
                ? isTeamDeal
                  ? "bg-violet-50/50 dark:bg-violet-500/10 border-violet-200/50 dark:border-violet-500/30"
                  : "bg-card/50 border-border/30"
                : overdue 
                  ? "bg-destructive/5 border-destructive/40"
                  : isTeamDeal
                    ? "bg-violet-50/30 dark:bg-violet-500/5 border-violet-200/50 dark:border-violet-500/30 hover:border-violet-400/60 hover:shadow-xl hover:shadow-violet-500/10"
                    : "bg-card/95 border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
            )}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={springConfig}
          >
            {/* Status indicator bar */}
            <div className={cn(
              "absolute left-0 top-0 bottom-0 w-1.5 rounded-l-3xl",
              payout.status === 'PAID' 
                ? "bg-success/60"
                : overdue 
                  ? "bg-destructive"
                  : dueBadge?.variant === 'warning'
                    ? "bg-warning"
                    : isTeamDeal
                      ? "bg-violet-400"
                      : "bg-primary/40"
            )} />
            
            {/* Paid gradient overlay */}
            {payout.status === 'PAID' && (
              <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent pointer-events-none" />
            )}

            <div className="p-5 sm:p-6 pl-6 sm:pl-7">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2">
                    <h3 className="font-bold text-lg truncate">
                      {deal?.client_name || 'Unknown Client'}
                    </h3>
                    {dueBadge && (
                      <span className={cn(
                        "shrink-0 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide",
                        dueBadge.variant === 'destructive' && "bg-destructive/15 text-destructive",
                        dueBadge.variant === 'warning' && "bg-warning/15 text-warning",
                        dueBadge.variant === 'muted' && "bg-muted text-muted-foreground"
                      )}>
                        {dueBadge.label}
                      </span>
                    )}
                    {payout.status === 'PAID' && (
                      <span className="shrink-0 inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide bg-success/15 text-success">
                        <CheckCircle2 className="h-3 w-3" />
                        Paid
                      </span>
                    )}
                  </div>
                  
                  {/* Property info */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <DealIcon className="h-4 w-4" />
                      {isPresale ? (deal?.project_name || 'Presale') : 'Resale'}
                    </span>
                    {deal?.city && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {deal.city}
                      </span>
                    )}
                    {deal?.address && !isPresale && (
                      <span className="hidden sm:inline-flex items-center gap-1.5 truncate max-w-[200px]">
                        {deal.address}
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <p className={cn(
                    "text-2xl sm:text-3xl font-bold",
                    payout.status === 'PAID' 
                      ? "text-success" 
                      : overdue 
                        ? "text-destructive"
                        : "text-primary"
                  )}>
                    {formatCurrency(payout.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {payout.status === 'PAID' && payout.paid_date
                      ? `Received ${format(parseISO(payout.paid_date), 'MMM d, yyyy')}`
                      : payout.due_date
                        ? format(parseISO(payout.due_date), 'MMM d, yyyy')
                        : 'No date set'}
                  </p>
                </div>
              </div>

              {/* Details row */}
              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Payout type badge */}
                  <span className={cn(
                    "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-semibold",
                    typeStyles.bg, typeStyles.text
                  )}>
                    <TypeIcon className="h-3.5 w-3.5" />
                    {payout.payout_type}
                  </span>

                  {/* Deal type badge */}
                  <span className={cn(
                    "inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-semibold",
                    deal?.deal_type === 'BUY' 
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                  )}>
                    {deal?.deal_type === 'BUY' ? 'Buyer' : 'Seller'}
                  </span>

                  {/* Team member indicator */}
                  {deal?.team_member && (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400 font-semibold">
                      <Users className="h-3 w-3" />
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
                      className="h-9 text-xs font-semibold text-success hover:text-success hover:bg-success/10 rounded-xl gap-1.5"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMarkPaid(payout.id);
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark Paid
                    </Button>
                  </motion.div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    View details
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>

              {/* Sale price info */}
              {deal?.sale_price && (
                <div className="hidden sm:flex items-center gap-5 mt-4 pt-4 border-t border-border/30 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Home className="h-3.5 w-3.5" />
                    Sale: {formatCurrency(deal.sale_price)}
                  </span>
                  {deal?.gross_commission_est && (
                    <span className="inline-flex items-center gap-1.5">
                      <Percent className="h-3.5 w-3.5" />
                      GCI: {formatCurrency(
                        deal.team_member_portion && deal.team_member_portion > 0
                          ? deal.gross_commission_est * (100 - deal.team_member_portion) / 100
                          : deal.gross_commission_est
                      )}
                      {deal.team_member_portion && deal.team_member_portion > 0 && (
                        <span className="text-muted-foreground/50 ml-0.5">
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
            className="sm:hidden text-primary font-semibold active:opacity-50 transition-opacity"
          >
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </Link>
        }
      />

      <PullToRefresh onRefresh={refreshData} className="min-h-[calc(100vh-56px)]">
        <div className="p-5 lg:p-8 xl:p-10 space-y-6 lg:space-y-8">
          
          {/* Premium Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {filterButtons.map((btn, i) => (
              <motion.button
                key={btn.key}
                onClick={() => {
                  triggerHaptic('light');
                  setTimeFilter(btn.key);
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springConfig, delay: i * 0.05 }}
                className={cn(
                  "relative p-5 rounded-3xl border text-left transition-all duration-300 overflow-hidden",
                  timeFilter === btn.key 
                    ? btn.success 
                      ? "border-success/50 shadow-xl shadow-success/15" 
                      : "border-primary/50 shadow-xl shadow-primary/15"
                    : "bg-card/95 border-border/40 hover:border-primary/30 hover:shadow-lg"
                )}
                style={timeFilter === btn.key ? {
                  background: btn.success 
                    ? 'linear-gradient(145deg, hsl(var(--success)/0.15) 0%, hsl(var(--success)/0.05) 100%)'
                    : 'linear-gradient(145deg, hsl(var(--primary)/0.15) 0%, hsl(var(--primary)/0.05) 100%)'
                } : undefined}
              >
                {/* Active indicator */}
                {timeFilter === btn.key && (
                  <div className={cn(
                    "absolute top-3 right-3 w-2.5 h-2.5 rounded-full",
                    btn.success ? "bg-success" : "bg-primary"
                  )} />
                )}
                
                {/* Decorative circle */}
                <div className={cn(
                  "absolute -right-6 -top-6 w-20 h-20 rounded-full transition-opacity",
                  timeFilter === btn.key 
                    ? btn.success ? "bg-success/10" : "bg-primary/10"
                    : "bg-muted/30 opacity-0 group-hover:opacity-100"
                )} />
                
                <div className="relative">
                  <div className={cn(
                    "flex items-center gap-2 mb-3",
                    timeFilter === btn.key 
                      ? btn.success ? "text-success" : "text-primary"
                      : "text-muted-foreground"
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center",
                      timeFilter === btn.key 
                        ? btn.success ? "bg-success/20" : "bg-primary/20"
                        : "bg-muted/50"
                    )}>
                      <btn.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">{btn.label}</span>
                  </div>
                  <p className={cn(
                    "text-2xl sm:text-3xl font-bold",
                    timeFilter === btn.key 
                      ? btn.success ? "text-success" : "text-primary"
                      : "text-foreground"
                  )}>
                    {formatCurrency(btn.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                    {btn.count} payout{btn.count !== 1 ? 's' : ''}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Search and Add */}
          <motion.div 
            className="flex gap-4 items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.2 }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by client, project, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-14 bg-card/95 border-border/50 rounded-2xl text-base placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20 shadow-sm"
              />
            </div>
            <Link to="/deals/new">
              <Button className="btn-premium h-14 px-6 gap-2.5 rounded-2xl whitespace-nowrap shadow-lg">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline font-semibold">Add Deal</span>
              </Button>
            </Link>
          </motion.div>

          {/* Payouts List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <motion.div 
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center animate-pulse">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Loading your deals...</p>
              </motion.div>
            </div>
          ) : filteredPayouts.length === 0 ? (
            <motion.div 
              className="text-center py-24"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={springConfig}
            >
              <motion.div 
                className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shadow-inner border border-primary/20"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <DollarSign className="w-12 h-12 text-primary/60" />
              </motion.div>
              <p className="text-xl font-bold mb-2">
                {timeFilter === 'paid' ? 'No paid payouts yet' : 'No pending payouts'}
              </p>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                {timeFilter === 'paid' ? 'Complete some deals to see your earnings' : 'Add a deal to start tracking your income'}
              </p>
              <Button asChild className="btn-premium h-14 px-8 rounded-2xl shadow-lg">
                <Link to="/deals/new">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Deal
                </Link>
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-10">
              {groupedPayouts.map((yearGroup) => {
                const isYearExpanded = !expandedYears.has(yearGroup.year);
                const yearTotal = yearGroup.months.reduce((sum, m) => sum + m.total, 0);
                const yearPayoutCount = yearGroup.months.reduce((sum, m) => sum + m.payouts.length, 0);
                
                const toggleYear = () => {
                  triggerHaptic('light');
                  setExpandedYears(prev => {
                    const next = new Set(prev);
                    if (next.has(yearGroup.year)) {
                      next.delete(yearGroup.year);
                    } else {
                      next.add(yearGroup.year);
                    }
                    return next;
                  });
                };
                
                return (
                <div key={yearGroup.year} className="space-y-8">
                  {/* Year Header - Always clickable */}
                  {(yearGroup.year !== currentYear || groupedPayouts.length > 1) && (
                    <motion.button
                      onClick={toggleYear}
                      className="w-full flex items-center gap-4 group cursor-pointer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                      <div className="flex items-center gap-3 px-5 py-2.5 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm hover:border-primary/30 hover:shadow-md transition-all">
                        <span className="text-base font-bold">{yearGroup.year}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(yearTotal)} · {yearPayoutCount} payouts
                        </span>
                        <motion.div
                          animate={{ rotate: isYearExpanded ? 0 : -90 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </motion.div>
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                    </motion.button>
                  )}

                  <AnimatePresence initial={false}>
                    {isYearExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden space-y-8"
                      >
                        {yearGroup.months.map((monthGroup) => (
                          <div key={`${yearGroup.year}-${monthGroup.month}`} className="space-y-5">
                            {/* Month Header */}
                            <motion.div 
                              className="flex items-center justify-between"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={springConfig}
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm border border-primary/20">
                                  <Calendar className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-xl">{monthGroup.monthName}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {monthGroup.payouts.length} payout{monthGroup.payouts.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">
                                  {formatCurrency(monthGroup.total)}
                                </p>
                                <p className="text-xs text-muted-foreground font-medium">
                                  {timeFilter === 'paid' ? 'received' : 'expected'}
                                </p>
                              </div>
                            </motion.div>

                            {/* Payout Cards */}
                            <div className="grid gap-4 sm:grid-cols-2">
                              {monthGroup.payouts.map((payout, idx) => renderPayoutCard(payout, idx))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )})}
            </div>
          )}

          {/* Quick link */}
          {filteredPayouts.length > 0 && (
            <motion.div 
              className="text-center pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Link 
                to="/payouts" 
                className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline"
                onClick={() => triggerHaptic('light')}
              >
                View full payout schedule
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </motion.div>
          )}

          {/* Desktop Add button */}
          <div className="hidden sm:flex justify-center pt-6">
            <Button asChild size="lg" className="btn-premium h-14 px-10 rounded-2xl shadow-lg">
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
