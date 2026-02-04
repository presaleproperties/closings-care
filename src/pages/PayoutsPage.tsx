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
  Banknote,
  Sparkles,
  ArrowUpRight,
  Timer,
  Wallet
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
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } }
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
    if (!dueDate) return { label: 'No date', color: 'bg-muted/60 text-muted-foreground', urgent: false, days: null, barColor: 'bg-muted-foreground/30' };
    const days = differenceInDays(parseISO(dueDate), now);
    if (days < 0) return { label: `${Math.abs(days)}d overdue`, color: 'bg-destructive/15 text-destructive', urgent: true, days, barColor: 'bg-destructive' };
    if (days === 0) return { label: 'Due today', color: 'bg-destructive/15 text-destructive', urgent: true, days, barColor: 'bg-destructive' };
    if (days <= 7) return { label: `${days}d left`, color: 'bg-amber-500/15 text-amber-600', urgent: true, days, barColor: 'bg-amber-500' };
    if (days <= 30) return { label: `${days} days`, color: 'bg-muted/60 text-muted-foreground', urgent: false, days, barColor: 'bg-primary/40' };
    return { label: format(parseISO(dueDate), 'MMM d'), color: 'bg-muted/60 text-muted-foreground', urgent: false, days, barColor: 'bg-primary/30' };
  };

  const badge = getDueBadge(payout.due_date);
  const isPaid = payout.status === 'PAID';

  const payoutTypeConfig: Record<string, { bg: string; text: string }> = {
    'Advance': { bg: 'bg-blue-500/10', text: 'text-blue-600' },
    'Completion': { bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
    '2nd Payment': { bg: 'bg-violet-500/10', text: 'text-violet-600' },
    '3rd Deposit': { bg: 'bg-orange-500/10', text: 'text-orange-600' },
    '4th Deposit': { bg: 'bg-pink-500/10', text: 'text-pink-600' },
    'Custom': { bg: 'bg-muted/50', text: 'text-muted-foreground' },
  };

  const typeStyle = payoutTypeConfig[payout.payout_type] || payoutTypeConfig['Custom'];

  return (
    <Link to={`/deals/${payout.deal_id}`} onClick={() => triggerHaptic('light')}>
      <motion.div
        className={cn(
          "relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all group",
          isPaid 
            ? "bg-gradient-to-br from-emerald-500/5 to-card border-emerald-500/20" 
            : badge.urgent 
              ? "bg-gradient-to-br from-amber-500/5 via-card to-card border-amber-500/30" 
              : "bg-card/80 border-border/60 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
        )}
        whileTap={{ scale: 0.985 }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        transition={springConfigs.snappy}
      >
        {/* Premium Status Bar */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl",
          isPaid ? "bg-gradient-to-b from-emerald-400 to-emerald-600" : badge.barColor
        )} />
        
        <div className="p-4 pl-5">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                  isPresale ? "bg-violet-500/10" : "bg-blue-500/10"
                )}>
                  <DealIcon className={cn("h-4 w-4", isPresale ? "text-violet-500" : "text-blue-500")} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm truncate">{deal?.client_name || 'Unknown'}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="truncate">{isPresale ? deal?.project_name || 'Presale' : 'Resale'}</span>
                    {deal?.city && (
                      <>
                        <span className="text-border">•</span>
                        <span className="truncate">{deal.city}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right shrink-0">
              <p className={cn(
                "font-bold text-xl tracking-tight",
                isPaid ? "text-emerald-600" : "text-foreground"
              )}>
                {formatCurrency(payout.amount)}
              </p>
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-semibold inline-block mt-1",
                isPaid ? "bg-emerald-500/15 text-emerald-600" : badge.color
              )}>
                {isPaid ? '✓ Received' : badge.label}
              </span>
            </div>
          </div>
          
          {/* Footer Row */}
          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                "inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium",
                typeStyle.bg, typeStyle.text
              )}>
                <TrendingUp className="h-3 w-3" />
                {payout.payout_type === 'Custom' ? payout.custom_type_name || 'Custom' : payout.payout_type}
              </span>
              
              {payout.due_date && !isPaid && (
                <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1 bg-muted/40 px-2 py-1 rounded-lg">
                  <Calendar className="h-3 w-3" />
                  {format(parseISO(payout.due_date), 'MMM d, yyyy')}
                </span>
              )}
              
              {payout.paid_date && (
                <span className="text-xs text-emerald-600 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg">
                  <CheckCircle2 className="h-3 w-3" />
                  {format(parseISO(payout.paid_date), 'MMM d')}
                </span>
              )}
            </div>
            
            {!isPaid && (
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-sm shadow-emerald-500/25"
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
    { id: 'all', label: 'All', count: stats.all.count, icon: Wallet },
    { id: 'pending', label: 'Pending', count: stats.pending.count, icon: Clock },
    { id: 'thisMonth', label: 'Due Soon', count: stats.thisMonth.count, icon: Timer },
    { id: 'paid', label: 'Received', count: stats.paid.count, icon: CheckCircle2 },
  ] as const;

  const statCards = [
    { 
      label: 'Pending', 
      value: stats.pending.total, 
      count: stats.pending.count,
      icon: Clock,
      gradient: 'from-primary/20 via-primary/10 to-transparent',
      iconBg: 'bg-primary/15',
      iconColor: 'text-primary',
      valueColor: 'text-primary'
    },
    { 
      label: 'Due This Month', 
      value: stats.thisMonth.total, 
      count: stats.thisMonth.count,
      icon: Calendar,
      gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-600'
    },
    { 
      label: 'Received', 
      value: stats.paid.total, 
      count: stats.paid.count,
      icon: CheckCircle2,
      gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-600'
    },
    { 
      label: 'Total Pipeline', 
      value: stats.all.total, 
      count: stats.all.count,
      icon: Banknote,
      gradient: 'from-violet-500/20 via-violet-500/10 to-transparent',
      iconBg: 'bg-violet-500/15',
      iconColor: 'text-violet-600',
      valueColor: 'text-foreground'
    },
  ];

  return (
    <AppLayout>
      <Header 
        title="Payouts" 
        subtitle="Track your commission payments"
        action={
          <Button variant="outline" onClick={handleExportCSV} className="gap-2 rounded-xl border-border/60 hover:border-primary/40">
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
          {/* Premium Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                className={cn(
                  "relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-4",
                  "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -2 }}
              >
                {/* Gradient Background */}
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", stat.gradient)} />
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.iconBg)}>
                      <stat.icon className={cn("w-5 h-5", stat.iconColor)} />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      {stat.count} {stat.count === 1 ? 'payout' : 'payouts'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">{stat.label}</p>
                  <AnimatedNumber
                    value={stat.value}
                    className={cn("text-xl lg:text-2xl font-bold tracking-tight", stat.valueColor)}
                    duration={0.8}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Overdue Alert */}
          <AnimatePresence>
            {stats.overdue.count > 0 && activeFilter !== 'paid' && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                variants={itemVariants}
              >
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-destructive/15 via-destructive/10 to-transparent border border-destructive/25 backdrop-blur-sm">
                  <div className="p-3 rounded-xl bg-destructive/20 shrink-0">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-destructive text-sm">
                      {stats.overdue.count} Overdue Payout{stats.overdue.count > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-destructive/80 truncate">
                      {formatCurrency(stats.overdue.total)} needs immediate attention
                    </p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-destructive shrink-0" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter Pills & Search */}
          <motion.div variants={itemVariants} className="space-y-4">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {filterConfig.map(filter => (
                <motion.button
                  key={filter.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveFilter(filter.id);
                  }}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 border",
                    activeFilter === filter.id
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                      : "bg-card/80 text-muted-foreground border-border/50 hover:bg-muted/50 hover:border-primary/30"
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  <filter.icon className="w-4 h-4" />
                  {filter.label}
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-lg font-semibold",
                    activeFilter === filter.id ? "bg-white/20" : "bg-muted"
                  )}>
                    {filter.count}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Search & Type Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by client name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-card/80 border-border/50 focus-visible:ring-primary/30 focus-visible:border-primary/50"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-4 rounded-xl gap-2 border-border/50 hover:border-primary/40 bg-card/80">
                    <TrendingUp className="w-4 h-4" />
                    <span className="hidden sm:inline">{typeFilter === 'ALL' ? 'All Types' : typeFilter}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl">
                  <DropdownMenuItem onClick={() => setTypeFilter('ALL')} className="rounded-lg">
                    All Types
                  </DropdownMenuItem>
                  {payoutTypes.map((type) => (
                    <DropdownMenuItem key={type} onClick={() => setTypeFilter(type)} className="rounded-lg">
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
              {[1, 2, 3, 4].map((i) => (
                <motion.div 
                  key={i} 
                  className="h-32 bg-gradient-to-br from-muted/50 to-muted/20 animate-pulse rounded-2xl border border-border/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                />
              ))}
            </div>
          ) : filteredPayouts.length === 0 ? (
            <motion.div 
              variants={itemVariants}
              className="text-center py-20 landing-card bg-gradient-to-br from-card to-muted/20"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-5 border border-primary/20">
                <Sparkles className="w-10 h-10 text-primary/60" />
              </div>
              <p className="text-xl font-bold text-foreground mb-2">No payouts found</p>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                {search ? 'Try adjusting your search or filters' : 'Create your first deal to start tracking payouts'}
              </p>
              {!search && (
                <Link to="/deals/new">
                  <Button className="btn-premium rounded-xl gap-2 px-6">
                    <DollarSign className="w-4 h-4" />
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
                <p className="text-sm text-muted-foreground font-medium">
                  Showing <span className="text-foreground font-semibold">{filteredPayouts.length}</span> payout{filteredPayouts.length !== 1 ? 's' : ''}
                </p>
                <p className="text-sm font-semibold">
                  {formatCurrency(filteredPayouts.reduce((s, p) => s + Number(p.amount), 0))}
                </p>
              </motion.div>

              <AnimatePresence mode="popLayout">
                {filteredPayouts.map((payout, index) => (
                  <motion.div
                    key={payout.id}
                    variants={itemVariants}
                    layout
                    exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
                    custom={index}
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
