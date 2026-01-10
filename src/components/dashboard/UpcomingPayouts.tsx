import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, DollarSign, Clock, AlertCircle } from 'lucide-react';
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
    <motion.div 
      className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-ios hover:shadow-ios-lg transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfigs.gentle}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50">
        <div>
          <h3 className="font-bold text-[17px] sm:text-lg flex items-center gap-2">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={springConfigs.bouncy}
            >
              <DollarSign className="h-5 w-5 text-accent" />
            </motion.div>
            Upcoming Payouts
          </h3>
          <p className="text-[13px] text-muted-foreground">{pendingCount} pending</p>
        </div>
        <Link to="/payouts">
          <motion.div whileTap={{ scale: 0.95 }} whileHover={{ x: 3 }}>
            <Button variant="ghost" size="sm" className="text-accent hover:bg-accent/10 h-8 px-2 sm:px-3">
              All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </motion.div>
        </Link>
      </div>

      {/* Content */}
      <div className="p-2 sm:p-4">
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
            className="divide-y divide-border/50 sm:space-y-2 sm:divide-y-0"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {upcomingPayouts.map((payout, index) => {
                const badge = getDueBadge(payout.due_date);
                const BadgeIcon = badge.icon;
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
                        className="flex items-center gap-3 px-3 py-3.5 sm:p-3 sm:rounded-xl sm:bg-muted/30 sm:hover:bg-muted/60 transition-all group"
                        whileTap={{ scale: 0.98, backgroundColor: "hsl(var(--muted) / 0.6)" }}
                        whileHover={{ x: 4 }}
                        transition={springConfigs.snappy}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[15px] sm:text-sm truncate">
                              {payout.deal?.client_name || 'Unknown'}
                            </p>
                            <motion.span 
                              className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                                badge.variant === 'destructive' ? 'bg-destructive/15 text-destructive' :
                                badge.variant === 'warning' ? 'bg-warning/15 text-warning' :
                                'bg-muted text-muted-foreground'
                              }`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ ...springConfigs.bouncy, delay: index * 0.05 + 0.2 }}
                            >
                              <BadgeIcon className="h-2.5 w-2.5" />
                              {badge.label}
                            </motion.span>
                          </div>
                          <p className="text-[13px] text-muted-foreground mt-0.5">
                            {payout.payout_type}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-[15px] sm:text-sm">
                            {formatCurrency(payout.amount)}
                          </span>
                          <motion.div
                            whileTap={{ scale: 0.85 }}
                            whileHover={{ scale: 1.1 }}
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-success opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded-full bg-success/10 sm:bg-transparent"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                triggerHaptic('success');
                                onMarkPaid(payout.id);
                              }}
                              disabled={isPending}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
