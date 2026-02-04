import { useState, useMemo } from 'react';
import { format, parseISO, differenceInDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Download, 
  Check, 
  DollarSign,
  Clock,
  AlertCircle,
  MapPin,
  Building2,
  Home,
  TrendingUp,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Banknote,
  MoreHorizontal
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePayouts, useMarkPayoutPaid } from '@/hooks/usePayouts';
import { useRefreshData } from '@/hooks/useRefreshData';
import { formatCurrency } from '@/lib/format';
import { PayoutType, Payout } from '@/lib/types';
import { triggerHaptic, springConfigs } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from '@/components/ui/animated-number';

const payoutTypes: PayoutType[] = ['Advance', '2nd Payment', '3rd Deposit', '4th Deposit', 'Completion', 'Custom'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

interface PayoutCardProps {
  payout: Payout;
  onMarkPaid: (id: string) => void;
  isPending: boolean;
}

function PayoutCard({ payout, onMarkPaid, isPending }: PayoutCardProps) {
  const now = new Date();
  const deal = payout.deal;
  const isPresale = deal?.property_type === 'PRESALE';
  const DealIcon = isPresale ? Building2 : Home;

  const getDueBadge = (dueDate: string | null) => {
    if (!dueDate) return { label: 'No date', color: 'text-muted-foreground bg-muted/50', urgent: false, days: null };
    const days = differenceInDays(parseISO(dueDate), now);
    if (days < 0) return { label: `${Math.abs(days)}d overdue`, color: 'text-destructive bg-destructive/10', urgent: true, days };
    if (days === 0) return { label: 'Due today', color: 'text-destructive bg-destructive/10', urgent: true, days };
    if (days <= 7) return { label: `${days}d left`, color: 'text-amber-600 bg-amber-500/10', urgent: true, days };
    if (days <= 30) return { label: `${days} days`, color: 'text-muted-foreground bg-muted/50', urgent: false, days };
    return { label: format(parseISO(dueDate), 'MMM d'), color: 'text-muted-foreground bg-muted/50', urgent: false, days };
  };

  const badge = getDueBadge(payout.due_date);
  const isPaid = payout.status === 'PAID';

  return (
    <Link to={`/deals/${payout.deal_id}`} onClick={() => triggerHaptic('light')}>
      <motion.div
        className={cn(
          "relative overflow-hidden rounded-2xl border transition-all group",
          isPaid 
            ? "bg-card border-border/50" 
            : badge.urgent 
              ? "bg-gradient-to-r from-card to-amber-500/5 border-amber-500/20" 
              : "bg-card border-border/50 hover:border-primary/30"
        )}
        whileTap={{ scale: 0.98 }}
        whileHover={{ y: -2 }}
        transition={springConfigs.snappy}
      >
        {/* Status Bar */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-1",
          isPaid ? "bg-emerald-500" : badge.urgent ? (badge.days !== null && badge.days < 0 ? "bg-destructive" : "bg-amber-500") : "bg-primary/30"
        )} />
        
        <div className="p-4 pl-5">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-base truncate">{deal?.client_name || 'Unknown'}</h4>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0",
                  isPaid ? "bg-emerald-500/10 text-emerald-600" : badge.color
                )}>
                  {isPaid ? '✓ Paid' : badge.label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <DealIcon className="h-3.5 w-3.5" />
                <span>{isPresale ? deal?.project_name || 'Presale' : 'Resale'}</span>
                {deal?.city && (
                  <>
                    <span className="text-border">•</span>
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{deal.city}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <p className={cn(
                "font-bold text-xl",
                isPaid ? "text-emerald-600" : "text-foreground"
              )}>
                {formatCurrency(payout.amount)}
              </p>
            </div>
          </div>
          
          {/* Footer Row */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              <span className={cn(
                "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium",
                payout.payout_type === 'Completion' 
                  ? "bg-emerald-500/10 text-emerald-600" 
                  : payout.payout_type === 'Advance'
                  ? "bg-primary/10 text-primary"
                  : "bg-muted/50 text-muted-foreground"
              )}>
                <TrendingUp className="h-3 w-3" />
                {payout.payout_type === 'Custom' ? payout.custom_type_name || 'Custom' : payout.payout_type}
              </span>
              
              {payout.due_date && !isPaid && (
                <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(parseISO(payout.due_date), 'MMM d, yyyy')}
                </span>
              )}
              
              {payout.paid_date && (
                <span className="text-xs text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {format(parseISO(payout.paid_date), 'MMM d')}
                </span>
              )}
            </div>
            
            {!isPaid && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 rounded-lg"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  triggerHaptic('success');
                  onMarkPaid(payout.id);
                }}
                disabled={isPending}
              >
                <Check className="w-3.5 h-3.5" />
                Mark Paid
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function PayoutsPage() {
  const { data: payouts = [], isLoading } = usePayouts();
  const markPaid = useMarkPayoutPaid();
  const refreshData = useRefreshData();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'thisMonth' | 'paid'>('all');
  const [typeFilter, setTypeFilter] = useState<PayoutType | 'ALL'>('ALL');

  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);

  // Calculate stats
  const stats = useMemo(() => {
    const pending = payouts.filter(p => p.status !== 'PAID');
    const thisMonth = payouts.filter(p => 
      p.due_date && isWithinInterval(parseISO(p.due_date), { start: thisMonthStart, end: thisMonthEnd }) && p.status !== 'PAID'
    );
    const paid = payouts.filter(p => p.status === 'PAID');
    const overdue = payouts.filter(p => 
      p.status !== 'PAID' && p.due_date && differenceInDays(parseISO(p.due_date), now) < 0
    );

    return {
      all: { count: payouts.length, total: payouts.reduce((sum, p) => sum + Number(p.amount), 0) },
      pending: { count: pending.length, total: pending.reduce((sum, p) => sum + Number(p.amount), 0) },
      thisMonth: { count: thisMonth.length, total: thisMonth.reduce((sum, p) => sum + Number(p.amount), 0) },
      paid: { count: paid.length, total: paid.reduce((sum, p) => sum + Number(p.amount), 0) },
      overdue: { count: overdue.length, total: overdue.reduce((sum, p) => sum + Number(p.amount), 0) }
    };
  }, [payouts, thisMonthStart, thisMonthEnd, now]);

  const filteredPayouts = useMemo(() => {
    return payouts.filter((payout) => {
      const clientName = payout.deal?.client_name?.toLowerCase() || '';
      const matchesSearch = clientName.includes(search.toLowerCase());
      const matchesType = typeFilter === 'ALL' || payout.payout_type === typeFilter;
      
      let matchesFilter = true;
      if (activeFilter === 'pending') matchesFilter = payout.status !== 'PAID';
      else if (activeFilter === 'thisMonth') {
        matchesFilter = payout.due_date 
          ? isWithinInterval(parseISO(payout.due_date), { start: thisMonthStart, end: thisMonthEnd }) && payout.status !== 'PAID'
          : false;
      } else if (activeFilter === 'paid') matchesFilter = payout.status === 'PAID';

      return matchesSearch && matchesType && matchesFilter;
    }).sort((a, b) => {
      if (a.status === 'PAID' && b.status !== 'PAID') return 1;
      if (a.status !== 'PAID' && b.status === 'PAID') return -1;
      if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return 0;
    });
  }, [payouts, search, typeFilter, activeFilter, thisMonthStart, thisMonthEnd]);

  const handleExportCSV = () => {
    const headers = ['Client', 'Deal Type', 'Payout Type', 'Amount', 'Due Date', 'Status', 'Paid Date'];
    const rows = filteredPayouts.map((p) => [
      p.deal?.client_name || '',
      p.payout_type,
      p.amount,
      p.due_date || '',
      p.status,
      p.paid_date || '',
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payouts-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filterConfig = [
    { id: 'all', label: 'All', count: stats.all.count },
    { id: 'pending', label: 'Pending', count: stats.pending.count },
    { id: 'thisMonth', label: 'This Month', count: stats.thisMonth.count },
    { id: 'paid', label: 'Received', count: stats.paid.count },
  ] as const;

  return (
    <AppLayout>
      <Header 
        title="Payouts" 
        subtitle="Track your commission payments"
        action={
          <Button variant="outline" onClick={handleExportCSV} className="gap-2 rounded-xl">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        }
      />

      <PullToRefresh onRefresh={refreshData} className="min-h-[calc(100vh-56px)]">
        <motion.div 
          className="p-4 lg:p-6 space-y-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Stats Card */}
          <motion.div variants={itemVariants} className="landing-card p-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pending Amount */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Pending</span>
                </div>
                <AnimatedNumber
                  value={stats.pending.total}
                  className="text-2xl lg:text-3xl font-bold text-primary"
                  duration={1}
                />
                <p className="text-xs text-muted-foreground">{stats.pending.count} payouts</p>
              </div>

              {/* This Month */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">This Month</span>
                </div>
                <AnimatedNumber
                  value={stats.thisMonth.total}
                  className="text-2xl lg:text-3xl font-bold text-amber-600"
                  duration={1}
                />
                <p className="text-xs text-muted-foreground">{stats.thisMonth.count} due</p>
              </div>

              {/* Received */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Received</span>
                </div>
                <AnimatedNumber
                  value={stats.paid.total}
                  className="text-2xl lg:text-3xl font-bold text-emerald-600"
                  duration={1}
                />
                <p className="text-xs text-muted-foreground">{stats.paid.count} paid</p>
              </div>

              {/* Total */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Banknote className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Total</span>
                </div>
                <AnimatedNumber
                  value={stats.all.total}
                  className="text-2xl lg:text-3xl font-bold"
                  duration={1}
                />
                <p className="text-xs text-muted-foreground">{stats.all.count} total</p>
              </div>
            </div>
          </motion.div>

          {/* Overdue Alert */}
          <AnimatePresence>
            {stats.overdue.count > 0 && activeFilter !== 'paid' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                variants={itemVariants}
              >
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
                  <div className="p-2 rounded-xl bg-destructive/20">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-destructive text-sm">
                      {stats.overdue.count} overdue payout{stats.overdue.count > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-destructive/80">
                      {formatCurrency(stats.overdue.total)} needs attention
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-destructive" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter Pills & Search */}
          <motion.div variants={itemVariants} className="space-y-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {filterConfig.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2",
                    activeFilter === filter.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {filter.label}
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    activeFilter === filter.id ? "bg-white/20" : "bg-background"
                  )}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search & Type Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-11 rounded-xl bg-muted/30 border-0 focus-visible:ring-1"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-11 px-4 rounded-xl gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="hidden sm:inline">{typeFilter === 'ALL' ? 'Type' : typeFilter}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => setTypeFilter('ALL')}>
                    All Types
                  </DropdownMenuItem>
                  {payoutTypes.map((type) => (
                    <DropdownMenuItem key={type} onClick={() => setTypeFilter(type)}>
                      {type}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>

          {/* Payouts List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-muted/30 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : filteredPayouts.length === 0 ? (
            <motion.div 
              variants={itemVariants}
              className="text-center py-16 landing-card"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-lg font-semibold text-muted-foreground mb-1">No payouts found</p>
              <p className="text-sm text-muted-foreground/70 mb-4">
                {search ? 'Try a different search term' : 'Create a deal to get started'}
              </p>
              {!search && (
                <Link to="/deals/new">
                  <Button className="btn-premium rounded-full">
                    Create Deal
                  </Button>
                </Link>
              )}
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-3"
              variants={containerVariants}
            >
              {/* Results Header */}
              <motion.div variants={itemVariants} className="flex items-center justify-between px-1">
                <p className="text-sm text-muted-foreground">
                  {filteredPayouts.length} payout{filteredPayouts.length !== 1 ? 's' : ''} • {formatCurrency(filteredPayouts.reduce((s, p) => s + Number(p.amount), 0))}
                </p>
              </motion.div>

              <AnimatePresence mode="popLayout">
                {filteredPayouts.map((payout) => (
                  <motion.div
                    key={payout.id}
                    variants={itemVariants}
                    layout
                    exit={{ opacity: 0, x: 50 }}
                  >
                    <PayoutCard
                      payout={payout}
                      onMarkPaid={(id) => markPaid.mutate(id)}
                      isPending={markPaid.isPending}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </PullToRefresh>
    </AppLayout>
  );
}
