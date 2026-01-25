import { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Receipt, Target, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { Deal, Payout } from '@/lib/types';
import { parseISO, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { triggerHaptic, springConfigs, staggerContainer, fadeInUp, tapScale } from '@/lib/haptics';

interface QuickStatsProps {
  deals: Deal[];
  payouts: Payout[];
  monthlyExpenses: number;
  onAutoMarkPaid?: (payoutIds: string[]) => void;
}

export function QuickStats({ deals, payouts, monthlyExpenses, onAutoMarkPaid }: QuickStatsProps) {
  const today = startOfDay(new Date());
  const thisYear = new Date().getFullYear();

  // Find payouts that should be auto-marked as paid (due date has passed)
  useEffect(() => {
    if (!onAutoMarkPaid) return;
    
    const overdueUnpaid = payouts.filter(p => {
      if (p.status === 'PAID' || !p.due_date) return false;
      const dueDate = parseISO(p.due_date);
      return isBefore(dueDate, today);
    });

    if (overdueUnpaid.length > 0) {
      onAutoMarkPaid(overdueUnpaid.map(p => p.id));
    }
  }, [payouts, onAutoMarkPaid, today]);

  const stats = useMemo(() => {
    // Total projected income (all unpaid payouts)
    const totalProjected = payouts
      .filter(p => p.status !== 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Total earned (paid payouts)
    const totalEarned = payouts
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // This year's projected income (unpaid payouts due this year)
    const thisYearProjected = payouts
      .filter(p => p.status !== 'PAID' && p.due_date && new Date(p.due_date).getFullYear() === thisYear)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Average deal value
    const allDeals = deals.length;
    const avgDealValue = allDeals > 0
      ? deals.reduce((sum, d) => sum + Number(d.gross_commission_est || 0), 0) / allDeals
      : 0;

    // Active deals count
    const activeDeals = deals.filter(d => d.status === 'PENDING').length;

    return {
      totalProjected,
      totalEarned,
      thisYearProjected,
      avgDealValue,
      activeDeals,
      monthlyExpenses,
    };
  }, [deals, payouts, monthlyExpenses, thisYear]);

  const statCards = [
    {
      icon: Wallet,
      label: 'Projected Income',
      value: formatCurrency(stats.totalProjected),
      subtitle: `${stats.activeDeals} active deals`,
      gradient: 'from-primary to-primary/70',
      textColor: 'text-primary-foreground',
    },
    {
      icon: Calendar,
      label: `${thisYear} Projected`,
      value: formatCurrency(stats.thisYearProjected),
      subtitle: 'Expected this year',
      gradient: 'from-amber-500 to-orange-500',
      textColor: 'text-white',
    },
    {
      icon: Receipt,
      label: 'Monthly Expenses',
      value: formatCurrency(stats.monthlyExpenses),
      subtitle: 'Recurring costs',
      accent: true,
      accentColor: 'text-destructive',
    },
    {
      icon: Target,
      label: 'Avg Per Deal',
      value: formatCurrency(stats.avgDealValue),
      subtitle: 'Gross commission',
      accent: true,
      accentColor: 'text-accent',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Mobile: iOS Widget Grid Layout with Spring Animations */}
      <motion.div 
        className="sm:hidden"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-2 gap-3">
          {/* Primary Large Widget - Projected Income */}
          <motion.div 
            variants={fadeInUp}
            whileTap={tapScale}
            onTapStart={() => triggerHaptic('light')}
            className="col-span-2 rounded-[20px] bg-gradient-to-br from-primary to-primary/80 p-5 shadow-lg cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              <motion.div 
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={springConfigs.bouncy}
              >
                <Wallet className="h-4 w-4 text-primary-foreground" />
              </motion.div>
              <span className="text-[13px] font-medium text-primary-foreground/80 uppercase tracking-wide">
                Projected Income
              </span>
            </div>
            <motion.p 
              className="text-[34px] font-bold text-primary-foreground tracking-tight leading-tight"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...springConfigs.bouncy, delay: 0.2 }}
            >
              {formatCurrency(stats.totalProjected)}
            </motion.p>
            <p className="text-[13px] text-primary-foreground/70 mt-1">
              {stats.activeDeals} active deal{stats.activeDeals !== 1 ? 's' : ''}
            </p>
          </motion.div>

          {/* This Year Projected - Widget */}
          <motion.div 
            variants={fadeInUp}
            whileTap={tapScale}
            onTapStart={() => triggerHaptic('light')}
            className="rounded-[20px] bg-gradient-to-br from-amber-500 to-orange-500 p-4 shadow-lg cursor-pointer"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="h-3.5 w-3.5 text-white/80" />
              <span className="text-[11px] font-medium text-white/80 uppercase tracking-wide">
                {thisYear}
              </span>
            </div>
            <p className="text-[22px] font-bold text-white tracking-tight leading-tight">
              {formatCurrency(stats.thisYearProjected)}
            </p>
            <p className="text-[11px] text-white/70 mt-0.5">
              Expected
            </p>
          </motion.div>

          {/* Monthly Expenses - Widget */}
          <motion.div 
            variants={fadeInUp}
            whileTap={tapScale}
            onTapStart={() => triggerHaptic('light')}
            className="rounded-[20px] bg-card/95 backdrop-blur-xl border border-border/50 p-4 shadow-ios cursor-pointer"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Receipt className="h-3.5 w-3.5 text-destructive" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Expenses
              </span>
            </div>
            <p className="text-[22px] font-bold text-destructive tracking-tight leading-tight">
              {formatCurrency(stats.monthlyExpenses)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Monthly
            </p>
          </motion.div>

          {/* Avg Per Deal - Widget */}
          <motion.div 
            variants={fadeInUp}
            whileTap={tapScale}
            onTapStart={() => triggerHaptic('light')}
            className="col-span-2 rounded-[20px] bg-card/95 backdrop-blur-xl border border-border/50 p-4 shadow-ios cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Target className="h-3.5 w-3.5 text-accent" />
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    Avg Per Deal
                  </span>
                </div>
                <p className="text-[22px] font-bold text-accent tracking-tight">
                  {formatCurrency(stats.avgDealValue)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground">Gross commission</p>
                <p className="text-[13px] font-medium text-muted-foreground">
                  {deals.length} total deals
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Desktop: Grid layout */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              "relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
              stat.gradient 
                ? `bg-gradient-to-br ${stat.gradient} ${stat.textColor} shadow-xl`
                : "bg-card/95 backdrop-blur-xl border border-border/50 shadow-ios hover:shadow-ios-lg"
            )}
          >
            {stat.gradient && (
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
            )}
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={cn(
                  "h-4 w-4",
                  stat.gradient ? "opacity-80" : stat.accentColor
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  stat.gradient ? "opacity-80" : "text-muted-foreground"
                )}>{stat.label}</span>
              </div>
              <p className={cn(
                "text-2xl lg:text-3xl font-bold tracking-tight",
                stat.accent && stat.accentColor
              )}>
                {stat.value}
              </p>
              <p className={cn(
                "text-xs mt-1",
                stat.gradient ? "opacity-70" : "text-muted-foreground"
              )}>{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
