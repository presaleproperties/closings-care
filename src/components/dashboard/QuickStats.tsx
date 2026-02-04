import { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Receipt, Target, Calendar, TrendingUp, Repeat, X } from 'lucide-react';
import { Deal, Payout, OtherIncome } from '@/lib/types';
import { parseISO, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { triggerHaptic, springConfigs, staggerContainer, fadeInUp, tapScale } from '@/lib/haptics';
import { AnimatedCurrency } from '@/components/ui/animated-number';
import { formatCurrency } from '@/lib/format';
import { calculatePayoutsWithBrokerageCap } from '@/lib/brokerageCapProjection';
import { useSettings } from '@/hooks/useSettings';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface QuickStatsProps {
  deals: Deal[];
  payouts: Payout[];
  otherIncome?: OtherIncome[];
  monthlyExpenses: number;
  onAutoMarkPaid?: (payoutIds: string[]) => void;
}

export function QuickStats({ deals, payouts, otherIncome = [], monthlyExpenses, onAutoMarkPaid }: QuickStatsProps) {
  const today = startOfDay(new Date());
  const thisYear = new Date().getFullYear();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { data: settings } = useSettings();

  // Process payouts (brokerage is now a fixed expense, not deducted from commissions)
  const payoutsWithCap = useMemo(() => {
    return calculatePayoutsWithBrokerageCap(payouts);
  }, [payouts]);

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

  // Calculate breakdown for display (using NET amounts after brokerage)
  const breakdown = useMemo(() => {
    const totalCommissions = payoutsWithCap
      .filter(p => p.status !== 'PAID')
      .reduce((sum, p) => sum + p.netAmount, 0);

    let totalOtherIncome = 0;
    const currentMonth = new Date().getMonth() + 1;
    let monthsIncluded = 0;
    
    for (let i = 0; i < 48; i++) {
      const monthOffset = currentMonth + i;
      const year = thisYear + Math.floor((monthOffset - 1) / 12);
      const month = ((monthOffset - 1) % 12) + 1;
      const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
      
      otherIncome.forEach(income => {
        const startMonth = income.start_month;
        const endMonth = income.end_month;
        
        const hasStarted = monthStr >= startMonth;
        const hasNotEnded = !endMonth || monthStr <= endMonth;
        
        if (hasStarted && hasNotEnded) {
          if (income.recurrence === 'monthly') {
            totalOtherIncome += Number(income.amount);
            monthsIncluded++;
          } else if (income.recurrence === 'weekly') {
            totalOtherIncome += Number(income.amount) * 4.33;
          } else if (income.recurrence === 'one-time' && monthStr === startMonth) {
            totalOtherIncome += Number(income.amount);
          }
        }
      });
    }

    return {
      commissions: totalCommissions,
      otherIncome: totalOtherIncome,
      total: totalCommissions + totalOtherIncome,
      unpaidPayoutsCount: payouts.filter(p => p.status !== 'PAID').length,
      otherIncomeItems: otherIncome,
      monthsProjected: 48,
    };
  }, [payoutsWithCap, payouts, otherIncome, thisYear]);

  const stats = useMemo(() => {
    // Total projected commissions (all unpaid payouts) - NET after brokerage
    const totalCommissions = payoutsWithCap
      .filter(p => p.status !== 'PAID')
      .reduce((sum, p) => sum + p.netAmount, 0);

    // Total earned (paid payouts) - NET after brokerage
    const totalEarned = payoutsWithCap
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.netAmount, 0);

    // This year's projected commission income (unpaid payouts due this year) - NET
    const thisYearCommissions = payoutsWithCap
      .filter(p => p.status !== 'PAID' && p.due_date && new Date(p.due_date).getFullYear() === thisYear)
      .reduce((sum, p) => sum + p.netAmount, 0);
    
    // Calculate total Other Income (48 months to cover through 2028)
    let totalOtherIncome = 0;
    const currentMonth = new Date().getMonth() + 1;
    for (let i = 0; i < 48; i++) {
      const monthOffset = currentMonth + i;
      const year = thisYear + Math.floor((monthOffset - 1) / 12);
      const month = ((monthOffset - 1) % 12) + 1;
      const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
      
      otherIncome.forEach(income => {
        const startMonth = income.start_month;
        const endMonth = income.end_month;
        
        const hasStarted = monthStr >= startMonth;
        const hasNotEnded = !endMonth || monthStr <= endMonth;
        
        if (hasStarted && hasNotEnded) {
          if (income.recurrence === 'monthly') {
            totalOtherIncome += Number(income.amount);
          } else if (income.recurrence === 'weekly') {
            totalOtherIncome += Number(income.amount) * 4.33;
          } else if (income.recurrence === 'one-time' && monthStr === startMonth) {
            totalOtherIncome += Number(income.amount);
          }
        }
      });
    }
    
    // Total projected = commissions + other income
    const totalProjected = totalCommissions + totalOtherIncome;

    // Calculate Other Income for this year (Jan to Dec)
    let thisYearOtherIncome = 0;
    for (let month = 1; month <= 12; month++) {
      const monthStr = `${thisYear}-${month.toString().padStart(2, '0')}`;
      
      otherIncome.forEach(income => {
        const startMonth = income.start_month;
        const endMonth = income.end_month;
        
        const hasStarted = monthStr >= startMonth;
        const hasNotEnded = !endMonth || monthStr <= endMonth;
        
        if (hasStarted && hasNotEnded) {
          if (income.recurrence === 'monthly') {
            thisYearOtherIncome += Number(income.amount);
          } else if (income.recurrence === 'weekly') {
            // Weekly income: ~4.33 weeks per month
            thisYearOtherIncome += Number(income.amount) * 4.33;
          } else if (income.recurrence === 'one-time' && monthStr === startMonth) {
            thisYearOtherIncome += Number(income.amount);
          }
        }
      });
    }

    // Total projected for this year = commissions + other income
    const thisYearProjected = thisYearCommissions + thisYearOtherIncome;

    // Average deal value - use total gross commission from all payouts per deal
    // For team deals, this is the FULL deal commission (not just user's portion)
    const dealTotals = new Map<string, number>();
    payouts.forEach(p => {
      const current = dealTotals.get(p.deal_id) || 0;
      dealTotals.set(p.deal_id, current + Number(p.amount));
    });
    const avgDealValue = dealTotals.size > 0
      ? Array.from(dealTotals.values()).reduce((sum, val) => sum + val, 0) / dealTotals.size
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
  }, [deals, payouts, payoutsWithCap, otherIncome, monthlyExpenses, thisYear]);

  const statCards = [
    {
      icon: Wallet,
      label: 'Projected Income',
      numericValue: stats.totalProjected,
      subtitle: 'Commissions + RevShare',
      gradient: 'from-primary to-primary/70',
      textColor: 'text-primary-foreground',
    },
    {
      icon: Calendar,
      label: `${thisYear} Projected`,
      numericValue: stats.thisYearProjected,
      subtitle: 'Commissions + RevShare',
      gradient: 'from-amber-500 to-orange-500',
      textColor: 'text-white',
    },
    {
      icon: Receipt,
      label: 'Monthly Expenses',
      numericValue: stats.monthlyExpenses,
      subtitle: 'Recurring costs',
      accent: true,
      accentColor: 'text-destructive',
    },
    {
      icon: Target,
      label: 'Avg Per Deal',
      numericValue: stats.avgDealValue,
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
            onClick={() => setShowBreakdown(true)}
            className="col-span-2 rounded-[20px] p-5 cursor-pointer"
            style={{
              background: 'linear-gradient(145deg, hsl(158 64% 36%) 0%, hsl(158 64% 28%) 50%, hsl(175 60% 30%) 100%)',
              boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.2), 0 4px 12px -2px hsl(158 64% 32% / 0.35), 0 12px 28px -6px hsl(158 64% 32% / 0.25)'
            }}
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
            <AnimatedCurrency 
              value={stats.totalProjected}
              className="text-[34px] font-bold text-primary-foreground tracking-tight leading-tight block"
              duration={1.5}
            />
            <p className="text-[13px] text-primary-foreground/70 mt-1">
              Tap for breakdown
            </p>
          </motion.div>

          {/* This Year Projected - Widget */}
          <motion.div 
            variants={fadeInUp}
            whileTap={tapScale}
            onTapStart={() => triggerHaptic('light')}
            className="rounded-[20px] p-4 cursor-pointer"
            style={{
              background: 'linear-gradient(145deg, hsl(38 75% 55%) 0%, hsl(32 85% 48%) 50%, hsl(25 80% 42%) 100%)',
              boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.2), 0 4px 12px -2px hsl(38 75% 50% / 0.35), 0 12px 28px -6px hsl(38 75% 50% / 0.25)'
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="h-3.5 w-3.5 text-white/80" />
              <span className="text-[11px] font-medium text-white/80 uppercase tracking-wide">
                {thisYear}
              </span>
            </div>
            <AnimatedCurrency 
              value={stats.thisYearProjected}
              className="text-[22px] font-bold text-white tracking-tight leading-tight block"
              duration={1.3}
            />
            <p className="text-[11px] text-white/70 mt-0.5">
              Commissions + RevShare
            </p>
          </motion.div>

          {/* Monthly Expenses - Widget */}
          <motion.div 
            variants={fadeInUp}
            whileTap={tapScale}
            onTapStart={() => triggerHaptic('light')}
            className="rounded-[20px] bg-card/98 backdrop-blur-2xl border border-border/40 p-4 shadow-ios cursor-pointer"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Receipt className="h-3.5 w-3.5 text-destructive" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Expenses
              </span>
            </div>
            <AnimatedCurrency 
              value={stats.monthlyExpenses}
              className="text-[22px] font-bold text-destructive tracking-tight leading-tight block"
              duration={1.1}
            />
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Monthly
            </p>
          </motion.div>

          {/* Avg Per Deal - Widget */}
          <motion.div 
            variants={fadeInUp}
            whileTap={tapScale}
            onTapStart={() => triggerHaptic('light')}
            className="col-span-2 rounded-[20px] bg-card/98 backdrop-blur-2xl border border-border/40 p-4 shadow-ios cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Target className="h-3.5 w-3.5 text-accent" />
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    Avg Per Deal
                  </span>
                </div>
                <AnimatedCurrency 
                  value={stats.avgDealValue}
                  className="text-[22px] font-bold text-accent tracking-tight block"
                  duration={1.4}
                />
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
            onClick={stat.label === 'Projected Income' ? () => setShowBreakdown(true) : undefined}
            className={cn(
              "relative overflow-hidden rounded-2xl p-5 transition-all duration-400 hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98]",
              stat.gradient 
                ? `${stat.textColor} cursor-pointer`
                : "bg-card/98 backdrop-blur-2xl border border-border/40 shadow-ios hover:shadow-ios-lg hover:border-primary/20"
            )}
            style={stat.gradient ? {
              background: stat.label.includes('Projected Income') 
                ? 'linear-gradient(145deg, hsl(158 64% 36%) 0%, hsl(158 64% 28%) 50%, hsl(175 60% 30%) 100%)'
                : 'linear-gradient(145deg, hsl(38 75% 55%) 0%, hsl(32 85% 48%) 50%, hsl(25 80% 42%) 100%)',
              boxShadow: stat.label.includes('Projected Income')
                ? 'inset 0 1px 0 0 rgba(255,255,255,0.2), 0 4px 12px -2px hsl(158 64% 32% / 0.35), 0 12px 28px -6px hsl(158 64% 32% / 0.25)'
                : 'inset 0 1px 0 0 rgba(255,255,255,0.2), 0 4px 12px -2px hsl(38 75% 50% / 0.35), 0 12px 28px -6px hsl(38 75% 50% / 0.25)'
            } : undefined}
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
              <AnimatedCurrency 
                value={stat.numericValue}
                className={cn(
                  "text-2xl lg:text-3xl font-bold tracking-tight block",
                  stat.accent && stat.accentColor
                )}
                duration={1.2}
              />
              <p className={cn(
                "text-xs mt-1",
                stat.gradient ? "opacity-70" : "text-muted-foreground"
              )}>{stat.label === 'Projected Income' ? 'Click for breakdown' : stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown Dialog */}
      <Dialog open={showBreakdown} onOpenChange={setShowBreakdown}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Projected Income Breakdown
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Total */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Total Projected</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(breakdown.total)}</p>
              <p className="text-xs text-muted-foreground mt-1">Next {breakdown.monthsProjected} months</p>
            </div>

            {/* Commissions */}
            <div className="p-4 rounded-xl bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-success" />
                <p className="text-sm font-medium text-success">Deal Commissions</p>
              </div>
              <p className="text-2xl font-bold text-success">{formatCurrency(breakdown.commissions)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {breakdown.unpaidPayoutsCount} unpaid payout{breakdown.unpaidPayoutsCount !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Other Income */}
            <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Repeat className="h-4 w-4 text-sky-500" />
                <p className="text-sm font-medium text-sky-500">Other Income (RevShare)</p>
              </div>
              <p className="text-2xl font-bold text-sky-500">{formatCurrency(breakdown.otherIncome)}</p>
              {breakdown.otherIncomeItems.map((item) => (
                <p key={item.id} className="text-xs text-muted-foreground mt-1">
                  {item.name}: {formatCurrency(item.amount)}/{item.recurrence}
                </p>
              ))}
            </div>

            {/* Calculation note */}
            <p className="text-xs text-muted-foreground text-center">
              Projection includes all unpaid commissions + recurring income through {thisYear + 3}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
