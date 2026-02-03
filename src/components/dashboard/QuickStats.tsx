import { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Receipt, Target, Calendar } from 'lucide-react';
import { Deal, Payout, OtherIncome } from '@/lib/types';
import { parseISO, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { triggerHaptic, springConfigs, staggerContainer, fadeInUp, tapScale } from '@/lib/haptics';
import { AnimatedCurrency } from '@/components/ui/animated-number';

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

    // This year's projected commission income (unpaid payouts due this year)
    const thisYearCommissions = payouts
      .filter(p => p.status !== 'PAID' && p.due_date && new Date(p.due_date).getFullYear() === thisYear)
      .reduce((sum, p) => sum + Number(p.amount), 0);

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
  }, [deals, payouts, otherIncome, monthlyExpenses, thisYear]);

  const statCards = [
    {
      icon: Wallet,
      label: 'Projected Income',
      numericValue: stats.totalProjected,
      subtitle: `${stats.activeDeals} active deals`,
      gradient: 'from-primary to-primary/70',
      textColor: 'text-primary-foreground',
    },
    {
      icon: Calendar,
      label: `${thisYear} Projected`,
      numericValue: stats.thisYearProjected,
      subtitle: 'Expected this year',
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
              {stats.activeDeals} active deal{stats.activeDeals !== 1 ? 's' : ''}
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
              Expected
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
            className={cn(
              "relative overflow-hidden rounded-2xl p-5 transition-all duration-400 hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98]",
              stat.gradient 
                ? `${stat.textColor}`
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
              )}>{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
