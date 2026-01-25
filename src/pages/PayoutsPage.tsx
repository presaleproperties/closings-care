import { useState, useMemo } from 'react';
import { format, parseISO, differenceInDays, startOfMonth, endOfMonth, isWithinInterval, addMonths } from 'date-fns';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Download, 
  Check, 
  Filter,
  DollarSign,
  Clock,
  AlertCircle,
  MapPin,
  Building2,
  Home,
  TrendingUp,
  Calendar,
  CheckCircle2,
  FileText,
  ArrowUpRight,
  Banknote,
  CircleDollarSign
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { FloatingBackground } from '@/components/dashboard/FloatingBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePayouts, useMarkPayoutPaid } from '@/hooks/usePayouts';
import { useRefreshData } from '@/hooks/useRefreshData';
import { formatCurrency, formatDate, getMonthRange } from '@/lib/format';
import { PayoutStatus, PayoutType, Payout } from '@/lib/types';
import { triggerHaptic, springConfigs, staggerContainer, listItem } from '@/lib/haptics';

const payoutTypes: PayoutType[] = ['Advance', '2nd Payment', '3rd Deposit', '4th Deposit', 'Completion', 'Custom'];

interface StatCardProps {
  label: string;
  value: string;
  count: number;
  icon: React.ElementType;
  gradient: string;
  isActive: boolean;
  onClick: () => void;
}

function StatCard({ label, value, count, icon: Icon, gradient, isActive, onClick }: StatCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all w-full ${
        isActive 
          ? 'ring-2 ring-primary shadow-lg' 
          : 'hover:shadow-md'
      }`}
      style={{ background: gradient }}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -2 }}
      transition={springConfigs.snappy}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl ${isActive ? 'bg-white/30' : 'bg-white/20'}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <span className="text-xs font-medium text-white/80 bg-white/20 px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-white/80 font-medium">{label}</p>
      
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeStatIndicator"
          className="absolute bottom-0 left-0 right-0 h-1 bg-white/50"
          transition={springConfigs.bouncy}
        />
      )}
    </motion.button>
  );
}

interface PayoutCardProps {
  payout: Payout;
  onMarkPaid: (id: string) => void;
  isPending: boolean;
  index: number;
}

function PayoutCard({ payout, onMarkPaid, isPending, index }: PayoutCardProps) {
  const now = new Date();
  const deal = payout.deal;
  const isPresale = deal?.property_type === 'PRESALE';
  const DealIcon = isPresale ? Building2 : Home;

  const getDueBadge = (dueDate: string | null) => {
    if (!dueDate) return { label: 'No date', variant: 'muted', icon: Clock, urgent: false };
    const days = differenceInDays(parseISO(dueDate), now);
    if (days < 0) return { label: 'Overdue', variant: 'destructive', icon: AlertCircle, urgent: true };
    if (days === 0) return { label: 'Due today', variant: 'destructive', icon: AlertCircle, urgent: true };
    if (days <= 7) return { label: `${days}d left`, variant: 'warning', icon: Clock, urgent: true };
    if (days <= 30) return { label: `${days} days`, variant: 'default', icon: Calendar, urgent: false };
    return { label: format(parseISO(dueDate), 'MMM d'), variant: 'muted', icon: Calendar, urgent: false };
  };

  const badge = getDueBadge(payout.due_date);
  const BadgeIcon = badge.icon;

  return (
    <motion.div
      variants={listItem}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, x: 50, transition: springConfigs.snappy }}
      layout
      custom={index}
    >
      <Link to={`/deals/${payout.deal_id}`} onClick={() => triggerHaptic('light')}>
        <motion.div
          className={`relative overflow-hidden rounded-xl border transition-all group landing-card ${
            badge.urgent 
              ? 'border-warning/30 bg-gradient-to-r from-warning/5 to-transparent dark:from-warning/10' 
              : ''
          }`}
          whileTap={{ scale: 0.98 }}
          whileHover={{ y: -2 }}
          transition={springConfigs.snappy}
        >
          {/* Urgency indicator bar */}
          {badge.urgent && (
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
              badge.variant === 'destructive' ? 'bg-destructive' : 'bg-warning'
            }`} />
          )}
          
          {/* Status indicator for paid */}
          {payout.status === 'PAID' && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-success" />
          )}
          
          <div className="p-4 sm:p-5">
            {/* Top row: Client + Badge + Amount */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <h4 className="font-bold text-base sm:text-lg truncate text-foreground">
                    {deal?.client_name || 'Unknown'}
                  </h4>
                  <motion.span 
                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                      payout.status === 'PAID'
                        ? 'bg-success/15 text-success'
                        : badge.variant === 'destructive' 
                        ? 'bg-destructive/15 text-destructive' 
                        : badge.variant === 'warning' 
                        ? 'bg-warning/15 text-warning' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ ...springConfigs.bouncy, delay: index * 0.03 + 0.1 }}
                  >
                    {payout.status === 'PAID' ? (
                      <>
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Paid
                      </>
                    ) : (
                      <>
                        <BadgeIcon className="h-2.5 w-2.5" />
                        {badge.label}
                      </>
                    )}
                  </motion.span>
                </div>
                
                {/* Property info row */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <DealIcon className="h-3.5 w-3.5" />
                    {isPresale ? deal?.project_name || 'Presale' : 'Resale'}
                  </span>
                  {deal?.city && (
                    <>
                      <span className="text-border">•</span>
                      <span className="inline-flex items-center gap-1 truncate">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {deal.city}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="text-right shrink-0">
                <p className={`font-bold text-xl sm:text-2xl ${
                  payout.status === 'PAID' ? 'text-success' : 'text-primary'
                }`}>
                  {formatCurrency(payout.amount)}
                </p>
              </div>
            </div>
            
            {/* Bottom row: Type + Dates + Action */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium ${
                  payout.payout_type === 'Completion' 
                    ? 'bg-success/10 text-success' 
                    : payout.payout_type === 'Advance'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <TrendingUp className="h-3 w-3" />
                  {payout.payout_type === 'Custom' 
                    ? payout.custom_type_name || 'Custom' 
                    : payout.payout_type}
                </span>
                
                {payout.due_date && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due {format(parseISO(payout.due_date), 'MMM d, yyyy')}
                  </span>
                )}
                
                {payout.paid_date && (
                  <span className="text-xs text-success flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Paid {format(parseISO(payout.paid_date), 'MMM d')}
                  </span>
                )}
              </div>
              
              {payout.status !== 'PAID' && (
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1.5 text-xs font-medium text-success hover:text-success hover:bg-success/10 rounded-lg"
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
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
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
      all: {
        count: payouts.length,
        total: payouts.reduce((sum, p) => sum + Number(p.amount), 0)
      },
      pending: {
        count: pending.length,
        total: pending.reduce((sum, p) => sum + Number(p.amount), 0)
      },
      thisMonth: {
        count: thisMonth.length,
        total: thisMonth.reduce((sum, p) => sum + Number(p.amount), 0)
      },
      paid: {
        count: paid.length,
        total: paid.reduce((sum, p) => sum + Number(p.amount), 0)
      },
      overdue: {
        count: overdue.length,
        total: overdue.reduce((sum, p) => sum + Number(p.amount), 0)
      }
    };
  }, [payouts, thisMonthStart, thisMonthEnd, now]);

  const filteredPayouts = useMemo(() => {
    return payouts.filter((payout) => {
      const clientName = payout.deal?.client_name?.toLowerCase() || '';
      const matchesSearch = clientName.includes(search.toLowerCase());
      const matchesType = typeFilter === 'ALL' || payout.payout_type === typeFilter;
      
      let matchesFilter = true;
      if (activeFilter === 'pending') {
        matchesFilter = payout.status !== 'PAID';
      } else if (activeFilter === 'thisMonth') {
        matchesFilter = payout.due_date 
          ? isWithinInterval(parseISO(payout.due_date), { start: thisMonthStart, end: thisMonthEnd }) && payout.status !== 'PAID'
          : false;
      } else if (activeFilter === 'paid') {
        matchesFilter = payout.status === 'PAID';
      }

      return matchesSearch && matchesType && matchesFilter;
    }).sort((a, b) => {
      // Sort by urgency: overdue first, then by due date
      if (a.status === 'PAID' && b.status !== 'PAID') return 1;
      if (a.status !== 'PAID' && b.status === 'PAID') return -1;
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
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

  return (
    <AppLayout>
      <FloatingBackground />
      <Header 
        title="Payouts" 
        subtitle={`${filteredPayouts.length} payouts • ${formatCurrency(filteredPayouts.reduce((s, p) => s + Number(p.amount), 0))} total`}
        action={
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        }
      />

      <PullToRefresh onRefresh={refreshData} className="min-h-[calc(100vh-56px)]">
        <div className="p-4 lg:p-6 space-y-6 animate-fade-in relative z-10">
          
          {/* Stat Cards */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springConfigs.gentle}
          >
            <StatCard
              label="All Payouts"
              value={formatCurrency(stats.all.total)}
              count={stats.all.count}
              icon={CircleDollarSign}
              gradient="linear-gradient(135deg, hsl(220 20% 25%) 0%, hsl(220 25% 35%) 100%)"
              isActive={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
            />
            <StatCard
              label="Pending"
              value={formatCurrency(stats.pending.total)}
              count={stats.pending.count}
              icon={Clock}
              gradient="linear-gradient(135deg, hsl(38 75% 50%) 0%, hsl(32 85% 45%) 100%)"
              isActive={activeFilter === 'pending'}
              onClick={() => setActiveFilter('pending')}
            />
            <StatCard
              label="This Month"
              value={formatCurrency(stats.thisMonth.total)}
              count={stats.thisMonth.count}
              icon={Calendar}
              gradient="linear-gradient(135deg, hsl(175 60% 38%) 0%, hsl(175 60% 32%) 100%)"
              isActive={activeFilter === 'thisMonth'}
              onClick={() => setActiveFilter('thisMonth')}
            />
            <StatCard
              label="Received"
              value={formatCurrency(stats.paid.total)}
              count={stats.paid.count}
              icon={CheckCircle2}
              gradient="linear-gradient(135deg, hsl(158 64% 36%) 0%, hsl(158 64% 28%) 100%)"
              isActive={activeFilter === 'paid'}
              onClick={() => setActiveFilter('paid')}
            />
          </motion.div>

          {/* Overdue Alert */}
          <AnimatePresence>
            {stats.overdue.count > 0 && activeFilter !== 'paid' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <div className="p-2 rounded-lg bg-destructive/20">
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search & Filters */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by client name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11 rounded-xl"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as PayoutType | 'ALL')}>
              <SelectTrigger className="w-full sm:w-40 h-11 rounded-xl">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {payoutTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Payouts List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted/30 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredPayouts.length === 0 ? (
            <motion.div 
              className="text-center py-16 landing-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={springConfigs.gentle}
            >
              <motion.div 
                className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <DollarSign className="w-8 h-8 text-muted-foreground/40" />
              </motion.div>
              <p className="text-lg font-semibold text-muted-foreground mb-1">No payouts found</p>
              <p className="text-sm text-muted-foreground/70 mb-4">
                {search ? 'Try a different search term' : 'Create a deal to get started'}
              </p>
              {!search && (
                <Link to="/deals/new">
                  <Button variant="outline" className="rounded-full">
                    Create Deal
                  </Button>
                </Link>
              )}
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-3"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {filteredPayouts.map((payout, index) => (
                  <PayoutCard
                    key={payout.id}
                    payout={payout}
                    onMarkPaid={(id) => markPaid.mutate(id)}
                    isPending={markPaid.isPending}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </PullToRefresh>
    </AppLayout>
  );
}
