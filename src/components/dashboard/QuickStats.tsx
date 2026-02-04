import { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Receipt, Target, Calendar, TrendingUp, Repeat } from 'lucide-react';
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

const springConfig = { type: "spring" as const, stiffness: 120, damping: 20 };

export function QuickStats({ deals, payouts, otherIncome = [], monthlyExpenses, onAutoMarkPaid }: QuickStatsProps) {
  const today = startOfDay(new Date());
  const thisYear = new Date().getFullYear();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { data: settings } = useSettings();

  const payoutsWithCap = useMemo(() => {
    return calculatePayoutsWithBrokerageCap(payouts, settings);
  }, [payouts, settings]);

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

  const breakdown = useMemo(() => {
    const totalCommissions = payoutsWithCap
      .filter(p => p.status !== 'PAID')
      .reduce((sum, p) => sum + p.netAmount, 0);

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
    const totalCommissions = payoutsWithCap
      .filter(p => p.status !== 'PAID')
      .reduce((sum, p) => sum + p.netAmount, 0);

    const totalEarned = payoutsWithCap
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.netAmount, 0);

    const thisYearCommissions = payoutsWithCap
      .filter(p => p.status !== 'PAID' && p.due_date && new Date(p.due_date).getFullYear() === thisYear)
      .reduce((sum, p) => sum + p.netAmount, 0);
    
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
    
    const totalProjected = totalCommissions + totalOtherIncome;

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
            thisYearOtherIncome += Number(income.amount) * 4.33;
          } else if (income.recurrence === 'one-time' && monthStr === startMonth) {
            thisYearOtherIncome += Number(income.amount);
          }
        }
      });
    }

    const thisYearProjected = thisYearCommissions + thisYearOtherIncome;

    // Calculate average using ALL deals (not just those with commission entered)
    const totalGrossCommission = deals.reduce((sum, d) => {
      const grossCommission = d.gross_commission_est || 
        ((d.advance_commission || 0) + (d.completion_commission || 0));
      return sum + grossCommission;
    }, 0);
    const avgDealValue = deals.length > 0
      ? totalGrossCommission / deals.length
      : 0;

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

  return (
    <div className="space-y-4">
      {/* Mobile Layout */}
      <motion.div 
        className="sm:hidden"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-2 gap-3">
          {/* Primary Widget - Projected Income */}
          <motion.div 
            variants={fadeInUp}
            whileTap={tapScale}
            onTapStart={() => triggerHaptic('light')}
            onClick={() => setShowBreakdown(true)}
            className="col-span-2 rounded-3xl p-6 cursor-pointer relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.85) 100%)',
              boxShadow: '0 8px 32px -8px hsl(var(--primary)/0.4), inset 0 1px 0 0 rgba(255,255,255,0.15)'
            }}
          >
            {/* Decorative circles */}
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -right-4 top-12 w-20 h-20 rounded-full bg-white/5" />
            
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Wallet className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-sm font-semibold text-primary-foreground/80 uppercase tracking-wider">
                  Projected Income
                </span>
              </div>
              <AnimatedCurrency 
                value={stats.totalProjected}
                className="text-4xl font-bold text-primary-foreground tracking-tight block"
                duration={1.5}
              />
              <p className="text-sm text-primary-foreground/60 mt-2">
                Tap to see breakdown →
              </p>
            </div>
          </motion.div>

          {/* This Year Widget */}
          <motion.div 
            variants={fadeInUp}
            whileTap={tapScale}
            onTapStart={() => triggerHaptic('light')}
            className="rounded-3xl p-5 cursor-pointer relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, hsl(38 92% 50%) 0%, hsl(25 95% 45%) 100%)',
              boxShadow: '0 8px 24px -8px hsl(38 92% 50%/0.4), inset 0 1px 0 0 rgba(255,255,255,0.15)'
            }}
          >
            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/10" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-white/80" />
                <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                  {thisYear}
                </span>
              </div>
              <AnimatedCurrency 
                value={stats.thisYearProjected}
                className="text-2xl font-bold text-white tracking-tight block"
                duration={1.3}
              />
              <p className="text-[11px] text-white/60 mt-1">Commissions + RevShare</p>
            </div>
          </motion.div>

          {/* Monthly Expenses Widget */}
          <motion.div 
            variants={fadeInUp}
            whileTap={tapScale}
            onTapStart={() => triggerHaptic('light')}
            className="rounded-3xl bg-card/95 backdrop-blur-xl border border-border/40 p-5 shadow-lg cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-destructive/15 flex items-center justify-center">
                <Receipt className="h-4 w-4 text-destructive" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Expenses
              </span>
            </div>
            <AnimatedCurrency 
              value={stats.monthlyExpenses}
              className="text-2xl font-bold text-destructive tracking-tight block"
              duration={1.1}
            />
            <p className="text-[11px] text-muted-foreground mt-1">Monthly recurring</p>
          </motion.div>

          {/* Avg Per Deal Widget */}
          <motion.div 
            variants={fadeInUp}
            whileTap={tapScale}
            onTapStart={() => triggerHaptic('light')}
            className="col-span-2 rounded-3xl bg-card/95 backdrop-blur-xl border border-border/40 p-5 shadow-lg cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center">
                    <Target className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Avg Per Deal
                  </span>
                </div>
                <AnimatedCurrency 
                  value={stats.avgDealValue}
                  className="text-2xl font-bold text-accent tracking-tight block"
                  duration={1.4}
                />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Gross commission</p>
                <p className="text-sm font-semibold">{deals.length} total deals</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Desktop Layout */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Projected Income */}
        <motion.div
          onClick={() => setShowBreakdown(true)}
          className="relative overflow-hidden rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
          style={{
            background: 'linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.85) 100%)',
            boxShadow: '0 8px 32px -8px hsl(var(--primary)/0.4), inset 0 1px 0 0 rgba(255,255,255,0.15)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0 }}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -right-4 top-16 w-20 h-20 rounded-full bg-white/5" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold text-primary-foreground/80 uppercase tracking-wider">Projected Income</span>
            </div>
            <AnimatedCurrency 
              value={stats.totalProjected}
              className="text-3xl font-bold text-primary-foreground tracking-tight block"
              duration={1.2}
            />
            <p className="text-xs text-primary-foreground/60 mt-2">Click for breakdown</p>
          </div>
        </motion.div>

        {/* This Year */}
        <motion.div
          className="relative overflow-hidden rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
          style={{
            background: 'linear-gradient(145deg, hsl(38 92% 50%) 0%, hsl(25 95% 45%) 100%)',
            boxShadow: '0 8px 24px -8px hsl(38 92% 50%/0.4), inset 0 1px 0 0 rgba(255,255,255,0.15)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.05 }}
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">{thisYear} Projected</span>
            </div>
            <AnimatedCurrency 
              value={stats.thisYearProjected}
              className="text-3xl font-bold text-white tracking-tight block"
              duration={1.2}
            />
            <p className="text-xs text-white/60 mt-2">Commissions + RevShare</p>
          </div>
        </motion.div>

        {/* Monthly Expenses */}
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-card/95 backdrop-blur-xl border border-border/40 p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-destructive/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.1 }}
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-destructive/5" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-destructive/15 flex items-center justify-center">
                <Receipt className="h-4 w-4 text-destructive" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monthly Expenses</span>
            </div>
            <AnimatedCurrency 
              value={stats.monthlyExpenses}
              className="text-3xl font-bold text-destructive tracking-tight block"
              duration={1.2}
            />
            <p className="text-xs text-muted-foreground mt-2">Recurring costs</p>
          </div>
        </motion.div>

        {/* Avg Per Deal */}
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-card/95 backdrop-blur-xl border border-border/40 p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-accent/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.15 }}
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-accent/5" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                <Target className="h-4 w-4 text-accent" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Per Deal</span>
            </div>
            <AnimatedCurrency 
              value={stats.avgDealValue}
              className="text-3xl font-bold text-accent tracking-tight block"
              duration={1.2}
            />
            <p className="text-xs text-muted-foreground mt-2">Gross commission</p>
          </div>
        </motion.div>
      </div>

      {/* Breakdown Dialog */}
      <Dialog open={showBreakdown} onOpenChange={setShowBreakdown}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
              Projected Income Breakdown
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Total */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Total Projected</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(breakdown.total)}</p>
              <p className="text-xs text-muted-foreground mt-1">Next {breakdown.monthsProjected} months</p>
            </div>

            {/* Commissions */}
            <div className="p-5 rounded-2xl bg-success/10 border border-success/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="font-semibold">Deal Commissions</span>
                </div>
                <span className="font-bold text-xl text-success">{formatCurrency(breakdown.commissions)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {breakdown.unpaidPayoutsCount} pending payout{breakdown.unpaidPayoutsCount !== 1 ? 's' : ''} (net of brokerage split)
              </p>
            </div>

            {/* Other Income */}
            <div className="p-5 rounded-2xl bg-sky-500/10 border border-sky-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-sky-500" />
                  <span className="font-semibold">Other Income</span>
                </div>
                <span className="font-bold text-xl text-sky-500">{formatCurrency(breakdown.otherIncome)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Revenue share, rentals, etc. over {breakdown.monthsProjected} months
              </p>
            </div>

            {/* Income Sources */}
            {breakdown.otherIncomeItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Income Sources</p>
                <div className="max-h-32 overflow-y-auto space-y-1.5">
                  {breakdown.otherIncomeItems.map((income) => (
                    <div key={income.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
                      <span className="text-sm font-medium">{income.name}</span>
                      <span className="text-sm font-bold">{formatCurrency(income.amount)}/{income.recurrence === 'monthly' ? 'mo' : income.recurrence}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
