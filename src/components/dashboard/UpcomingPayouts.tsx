import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Check, 
  DollarSign, 
  Clock, 
  AlertCircle,
  MapPin,
  Building2,
  Home,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { Payout } from '@/lib/types';
import { triggerHaptic, springConfigs, staggerContainer, listItem } from '@/lib/haptics';

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
      .slice(0, 5);
  }, [payouts]);

  const getDueBadge = (dueDate: string | null) => {
    if (!dueDate) return { label: 'No date', variant: 'muted', icon: Clock, urgent: false };
    const days = differenceInDays(parseISO(dueDate), now);
    if (days < 0) return { label: 'Overdue', variant: 'destructive', icon: AlertCircle, urgent: true };
    if (days === 0) return { label: 'Due today', variant: 'destructive', icon: AlertCircle, urgent: true };
    if (days <= 7) return { label: `${days}d left`, variant: 'warning', icon: Clock, urgent: true };
    if (days <= 30) return { label: `${days} days`, variant: 'default', icon: Calendar, urgent: false };
    return { label: format(parseISO(dueDate), 'MMM d'), variant: 'muted', icon: Calendar, urgent: false };
  };

  const pendingCount = payouts.filter(p => p.status !== 'PAID').length;
  const totalPending = useMemo(() => {
    return payouts
      .filter(p => p.status !== 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);
  }, [payouts]);

  return (
    <motion.div 
      className="landing-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfigs.gentle}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-border/50 bg-gradient-to-r from-amber-50/50 to-orange-50/30 dark:from-accent/5 dark:to-accent/10">
        <div className="flex items-center gap-3">
          <motion.div
            className="icon-gradient-accent icon-gradient-sm"
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={springConfigs.bouncy}
          >
            <DollarSign className="h-4 w-4 text-white" />
          </motion.div>
          <div>
            <h3 className="font-bold text-[15px] sm:text-base text-slate-800 dark:text-foreground">
              Upcoming Payouts
            </h3>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-slate-500 dark:text-muted-foreground">{pendingCount} pending</span>
              <span className="text-slate-300 dark:text-border">•</span>
              <span className="font-semibold text-emerald-600 dark:text-accent">{formatCurrency(totalPending)}</span>
            </div>
          </div>
        </div>
        <Link to="/payouts">
          <motion.div whileTap={{ scale: 0.95 }} whileHover={{ x: 3 }}>
            <Button variant="ghost" size="sm" className="text-emerald-600 dark:text-accent hover:bg-emerald-50 dark:hover:bg-accent/10 h-8 px-2 sm:px-3">
              All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </motion.div>
        </Link>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {upcomingPayouts.length === 0 ? (
          <motion.div 
            className="text-center py-10 px-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfigs.gentle}
          >
            <motion.div 
              className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <DollarSign className="w-7 h-7 text-muted-foreground/40" />
            </motion.div>
            <p className="text-[15px] font-medium text-muted-foreground mb-1">No pending payouts</p>
            <p className="text-[13px] text-muted-foreground/70 mb-4">Create a deal to get started</p>
            <Link to="/deals/new" onClick={() => triggerHaptic('medium')}>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" className="rounded-full">
                  Create Deal
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-2.5"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {upcomingPayouts.map((payout, index) => {
                const badge = getDueBadge(payout.due_date);
                const BadgeIcon = badge.icon;
                const deal = payout.deal;
                const isPresale = deal?.property_type === 'PRESALE';
                const DealIcon = isPresale ? Building2 : Home;
                
                return (
                  <motion.div
                    key={payout.id}
                    variants={listItem}
                    exit={{ opacity: 0, x: 50, transition: springConfigs.snappy }}
                    layout
                  >
                    <Link
                      to={`/deals/${payout.deal_id}`}
                      onClick={() => triggerHaptic('light')}
                    >
                      <motion.div
                        className={`relative overflow-hidden rounded-xl border transition-all group ${
                          badge.urgent 
                            ? 'border-warning/30 bg-gradient-to-r from-warning/5 to-transparent dark:from-warning/10' 
                            : 'border-slate-100 dark:border-border/50 bg-white/80 dark:bg-card/50 hover:bg-slate-50/80 dark:hover:bg-card/80'
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
                        
                        <div className="p-3 sm:p-4">
                          {/* Top row: Client name + Badge + Amount */}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-[15px] sm:text-base truncate text-slate-800 dark:text-foreground">
                                  {deal?.client_name || 'Unknown'}
                                </h4>
                                <motion.span 
                                  className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                                    badge.variant === 'destructive' ? 'bg-destructive/15 text-destructive' :
                                    badge.variant === 'warning' ? 'bg-warning/15 text-warning' :
                                    'bg-slate-100 dark:bg-muted text-slate-500 dark:text-muted-foreground'
                                  }`}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ ...springConfigs.bouncy, delay: index * 0.05 + 0.2 }}
                                >
                                  <BadgeIcon className="h-2.5 w-2.5" />
                                  {badge.label}
                                </motion.span>
                              </div>
                              
                              {/* Property info row */}
                              <div className="flex items-center gap-3 text-[12px] text-slate-500 dark:text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                  <DealIcon className="h-3 w-3" />
                                  {isPresale ? deal?.project_name || 'Presale' : 'Resale'}
                                </span>
                                {deal?.city && (
                                  <>
                                    <span className="text-slate-200 dark:text-border">•</span>
                                    <span className="inline-flex items-center gap-1 truncate">
                                      <MapPin className="h-3 w-3 shrink-0" />
                                      {deal.city}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right shrink-0">
                              <p className="font-bold text-lg sm:text-xl text-emerald-600 dark:text-accent">
                                {formatCurrency(payout.amount)}
                              </p>
                            </div>
                          </div>
                          
                          {/* Bottom row: Payout type + Due date + Mark paid */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-border/30">
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md font-medium ${
                                payout.payout_type === 'Completion' 
                                  ? 'bg-emerald-100 dark:bg-success/20 text-emerald-700 dark:text-success' 
                                  : payout.payout_type === 'Advance'
                                  ? 'bg-blue-100 dark:bg-primary/20 text-blue-700 dark:text-primary'
                                  : 'bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground'
                              }`}>
                                <TrendingUp className="h-3 w-3" />
                                {payout.payout_type}
                              </span>
                              
                              {payout.due_date && (
                                <span className="text-[11px] text-slate-400 dark:text-muted-foreground">
                                  {format(parseISO(payout.due_date), 'MMM d, yyyy')}
                                </span>
                              )}
                            </div>
                            
                            <motion.div
                              whileTap={{ scale: 0.85 }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 gap-1.5 text-[11px] font-medium text-success hover:text-success hover:bg-success/10 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  triggerHaptic('success');
                                  onMarkPaid(payout.id);
                                }}
                                disabled={isPending}
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Mark Paid</span>
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {/* View all link if more exist */}
            {pendingCount > 5 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="pt-2"
              >
                <Link to="/payouts" className="block">
                  <motion.div 
                    className="text-center py-2.5 rounded-lg bg-slate-50 dark:bg-muted/30 hover:bg-slate-100 dark:hover:bg-muted/50 transition-colors"
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-[13px] font-medium text-emerald-600 dark:text-accent">
                      View {pendingCount - 5} more payouts
                    </span>
                  </motion.div>
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
