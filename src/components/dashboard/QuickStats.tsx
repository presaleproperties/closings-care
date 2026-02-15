import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Receipt, TrendingUp, TrendingDown, Banknote, ArrowUpRight, BarChart3, CalendarClock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { triggerHaptic, springConfigs, staggerContainer, fadeInUp, tapScale } from '@/lib/haptics';
import { AnimatedCurrency } from '@/components/ui/animated-number';
import { formatCurrency } from '@/lib/format';

interface QuickStatsProps {
  receivedYTD: number;
  comingIn: number;
  monthlyExpenses: number;
  spentYTD: number;
  activeDeals: number;
  closedDealsYTD: number;
  projectedRevenue2026?: number;
  revShareMonthlyAvg?: number;
  pipelineCount?: number;
  pipelinePotential?: number;
  comingInDateRange?: string;
}

const springConfig = { type: "spring" as const, stiffness: 120, damping: 20 };

export function QuickStats({ receivedYTD, comingIn, monthlyExpenses, spentYTD, activeDeals, closedDealsYTD, projectedRevenue2026 = 0, revShareMonthlyAvg = 0, pipelineCount = 0, pipelinePotential = 0, comingInDateRange }: QuickStatsProps) {
  const thisYear = new Date().getFullYear();

  const projected2026Total = projectedRevenue2026 + (revShareMonthlyAvg * 12);

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
          {/* Earned YTD */}
          <motion.div 
            variants={fadeInUp}
            whileTap={tapScale}
            onTapStart={() => triggerHaptic('light')}
            className="rounded-3xl p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, hsl(160 84% 39%) 0%, hsl(160 84% 30%) 100%)',
              boxShadow: '0 8px 24px -8px hsl(160 84% 39%/0.4), inset 0 1px 0 0 rgba(255,255,255,0.15)'
            }}
          >
            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/10" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Banknote className="h-4 w-4 text-white/80" />
                <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Earned YTD
                </span>
              </div>
              <AnimatedCurrency 
                value={receivedYTD}
                className="text-2xl font-bold text-white tracking-tight block"
                duration={1.3}
              />
              <p className="text-[11px] text-white/60 mt-1">{closedDealsYTD} deals closed</p>
            </div>
          </motion.div>

          {/* Coming In */}
          <motion.div 
            variants={fadeInUp}
            whileTap={tapScale}
            onTapStart={() => triggerHaptic('light')}
            className="rounded-3xl p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.85) 100%)',
              boxShadow: '0 8px 24px -8px hsl(var(--primary)/0.4), inset 0 1px 0 0 rgba(255,255,255,0.15)'
            }}
          >
            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/10" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="h-4 w-4 text-primary-foreground/80" />
                <span className="text-xs font-semibold text-primary-foreground/80 uppercase tracking-wider">
                  Coming In
                </span>
              </div>
              <AnimatedCurrency 
                value={comingIn}
                className="text-2xl font-bold text-primary-foreground tracking-tight block"
                duration={1.3}
              />
              <p className="text-[11px] text-primary-foreground/60 mt-1">{activeDeals} deals · {comingInDateRange || 'upcoming'}</p>
            </div>
          </motion.div>

          {/* Monthly Expenses */}
          <motion.div 
            variants={fadeInUp}
            whileTap={tapScale}
            onTapStart={() => triggerHaptic('light')}
            className="rounded-3xl bg-card/95 backdrop-blur-xl border border-border/40 p-5 shadow-lg"
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
              value={monthlyExpenses}
              className="text-2xl font-bold text-destructive tracking-tight block"
              duration={1.1}
            />
            <p className="text-[11px] text-muted-foreground mt-1">Monthly recurring</p>
          </motion.div>

          {/* Pipeline */}
          <motion.div 
            variants={fadeInUp}
            whileTap={tapScale}
            onTapStart={() => triggerHaptic('light')}
            className="rounded-3xl bg-card/95 backdrop-blur-xl border border-primary/30 p-5 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pipeline
              </span>
            </div>
            <AnimatedCurrency 
              value={pipelinePotential}
              className="text-2xl font-bold text-primary tracking-tight block"
              duration={1.1}
            />
            <p className="text-[11px] text-muted-foreground mt-1">{pipelineCount} active prospect{pipelineCount !== 1 ? 's' : ''}</p>
          </motion.div>

          {/* 2026 Projected Revenue */}
          <motion.div 
            variants={fadeInUp}
            whileTap={tapScale}
            onTapStart={() => triggerHaptic('light')}
            className="col-span-2 rounded-3xl p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, hsl(220 70% 50%) 0%, hsl(250 60% 45%) 100%)',
              boxShadow: '0 8px 24px -8px hsl(220 70% 50%/0.4), inset 0 1px 0 0 rgba(255,255,255,0.15)'
            }}
          >
            <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/10" />
            <div className="absolute right-8 top-2 w-12 h-12 rounded-full bg-white/5" />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarClock className="h-4 w-4 text-white/80" />
                  <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                    2026 Projected Revenue
                  </span>
                </div>
                <AnimatedCurrency 
                  value={projected2026Total}
                  className="text-2xl font-bold text-white tracking-tight block"
                  duration={1.3}
                />
                <p className="text-[11px] text-white/60 mt-1">Commissions + RevShare</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] text-white/50 uppercase">Commissions</p>
                <p className="text-sm font-semibold text-white/90">{formatCurrency(projectedRevenue2026)}</p>
                <p className="text-[10px] text-white/50 uppercase mt-1">RevShare</p>
                <p className="text-sm font-semibold text-white/90">{formatCurrency(revShareMonthlyAvg * 12)}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Desktop Layout */}
      <div className="hidden sm:block space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Earned YTD */}
        <motion.div
          className="relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
          style={{
            background: 'linear-gradient(145deg, hsl(160 84% 39%) 0%, hsl(160 84% 30%) 100%)',
            boxShadow: '0 8px 32px -8px hsl(160 84% 39%/0.4), inset 0 1px 0 0 rgba(255,255,255,0.15)'
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
                <Banknote className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Earned YTD</span>
            </div>
            <AnimatedCurrency 
              value={receivedYTD}
              className="text-3xl font-bold text-white tracking-tight block"
              duration={1.2}
            />
            <p className="text-xs text-white/60 mt-2">{closedDealsYTD} deals closed in {thisYear}</p>
          </div>
        </motion.div>

        {/* Coming In */}
        <motion.div
          className="relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
          style={{
            background: 'linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.85) 100%)',
            boxShadow: '0 8px 24px -8px hsl(var(--primary)/0.4), inset 0 1px 0 0 rgba(255,255,255,0.15)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.05 }}
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold text-primary-foreground/80 uppercase tracking-wider">Coming In</span>
            </div>
            <AnimatedCurrency 
              value={comingIn}
              className="text-3xl font-bold text-primary-foreground tracking-tight block"
              duration={1.2}
            />
            <p className="text-xs text-primary-foreground/60 mt-2">{activeDeals} deals · {comingInDateRange || 'upcoming'}</p>
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
              value={monthlyExpenses}
              className="text-3xl font-bold text-destructive tracking-tight block"
              duration={1.2}
            />
            <p className="text-xs text-muted-foreground mt-2">Recurring costs</p>
          </div>
        </motion.div>

        {/* Pipeline */}
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-card/95 backdrop-blur-xl border border-primary/30 p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-primary/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.15 }}
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-primary/5" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pipeline</span>
            </div>
            <AnimatedCurrency 
              value={pipelinePotential}
              className="text-3xl font-bold text-primary tracking-tight block"
              duration={1.2}
            />
            <p className="text-xs text-muted-foreground mt-2">{pipelineCount} active prospect{pipelineCount !== 1 ? 's' : ''}</p>
          </div>
        </motion.div>
        </div>

        {/* 2026 Projected Revenue - Desktop */}
        <motion.div
          className="relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5"
          style={{
            background: 'linear-gradient(145deg, hsl(220 70% 50%) 0%, hsl(250 60% 45%) 100%)',
            boxShadow: '0 8px 32px -8px hsl(220 70% 50%/0.4), inset 0 1px 0 0 rgba(255,255,255,0.15)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.2 }}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute right-16 top-4 w-20 h-20 rounded-full bg-white/5" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <CalendarClock className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">2026 Projected Revenue</span>
              </div>
              <AnimatedCurrency 
                value={projected2026Total}
                className="text-3xl font-bold text-white tracking-tight block"
                duration={1.2}
              />
              <p className="text-xs text-white/60 mt-2">Commissions + RevShare (annualized)</p>
            </div>
            <div className="flex gap-8">
              <div className="text-right">
                <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">Commissions</p>
                <p className="text-xl font-bold text-white/90">{formatCurrency(projectedRevenue2026)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">RevShare (est.)</p>
                <p className="text-xl font-bold text-white/90">{formatCurrency(revShareMonthlyAvg * 12)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
