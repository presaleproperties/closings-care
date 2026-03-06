import { Banknote, ArrowUpRight, Receipt, Users } from 'lucide-react';
import { AnimatedCurrency } from '@/components/ui/animated-number';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface QuickStatsProps {
  receivedYTD: number;
  comingIn: number;
  monthlyExpenses: number;
  activeDeals: number;
  closedDealsYTD: number;
  pipelineCount?: number;
  pipelinePotential?: number;
  comingInDateRange?: string;
}

const CARDS = [
  {
    key: 'earned',
    icon: Banknote,
    label: 'Earned YTD',
    isPrimary: true,
    valueKey: 'receivedYTD' as const,
    subtitleFn: (p: QuickStatsProps) => `${p.closedDealsYTD} closed deal${p.closedDealsYTD !== 1 ? 's' : ''}`,
    bg: 'bg-emerald-50/80 dark:bg-emerald-950/20',
    border: 'border-emerald-200/60 dark:border-emerald-800/30',
    valueColor: 'text-emerald-900 dark:text-emerald-300',
    labelColor: 'text-emerald-700/70 dark:text-emerald-400/60',
    iconBg: 'bg-emerald-500',
    dotColor: 'bg-emerald-400',
  },
  {
    key: 'coming',
    icon: ArrowUpRight,
    label: 'Coming In',
    isPrimary: false,
    valueKey: 'comingIn' as const,
    subtitleFn: (p: QuickStatsProps) =>
      `${p.activeDeals} pending${p.comingInDateRange ? ' · ' + p.comingInDateRange : ''}`,
    bg: 'bg-blue-50/80 dark:bg-blue-950/20',
    border: 'border-blue-200/60 dark:border-blue-800/30',
    valueColor: 'text-blue-900 dark:text-blue-300',
    labelColor: 'text-blue-700/70 dark:text-blue-400/60',
    iconBg: 'bg-blue-500',
    dotColor: 'bg-blue-400',
  },
  {
    key: 'expenses',
    icon: Receipt,
    label: 'Expenses / mo',
    isPrimary: false,
    valueKey: 'monthlyExpenses' as const,
    subtitleFn: () => 'Monthly recurring',
    bg: 'bg-rose-50/80 dark:bg-rose-950/20',
    border: 'border-rose-200/60 dark:border-rose-800/30',
    valueColor: 'text-rose-900 dark:text-rose-300',
    labelColor: 'text-rose-700/70 dark:text-rose-400/60',
    iconBg: 'bg-rose-500',
    dotColor: 'bg-rose-400',
  },
  {
    key: 'pipeline',
    icon: Users,
    label: 'Pipeline',
    isPrimary: false,
    valueKey: 'pipelinePotential' as const,
    subtitleFn: (p: QuickStatsProps) =>
      `${p.pipelineCount ?? 0} prospect${(p.pipelineCount ?? 0) !== 1 ? 's' : ''}`,
    bg: 'bg-violet-50/80 dark:bg-violet-950/20',
    border: 'border-violet-200/60 dark:border-violet-800/30',
    valueColor: 'text-violet-900 dark:text-violet-300',
    labelColor: 'text-violet-700/70 dark:text-violet-400/60',
    iconBg: 'bg-violet-500',
    dotColor: 'bg-violet-400',
  },
] as const;

export function QuickStats({
  receivedYTD,
  comingIn,
  monthlyExpenses,
  activeDeals,
  closedDealsYTD,
  pipelineCount = 0,
  pipelinePotential = 0,
  comingInDateRange,
}: QuickStatsProps) {
  const props = {
    receivedYTD, comingIn, monthlyExpenses, activeDeals,
    closedDealsYTD, pipelineCount, pipelinePotential, comingInDateRange,
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {CARDS.map((card, index) => {
        const value = props[card.valueKey] ?? 0;
        const subtitle = card.subtitleFn(props);

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={
              card.isPrimary
                ? {
                    opacity: 1, y: 0, scale: 1,
                    boxShadow: [
                      '0 1px 2px 0 hsl(220 25% 10% / 0.04), 0 3px 12px -3px hsl(220 25% 10% / 0.07)',
                      '0 2px 20px -3px hsl(158 72% 34% / 0.18), 0 8px 28px -6px hsl(158 72% 34% / 0.12)',
                      '0 1px 2px 0 hsl(220 25% 10% / 0.04), 0 3px 12px -3px hsl(220 25% 10% / 0.07)',
                    ],
                  }
                : { opacity: 1, y: 0, scale: 1 }
            }
            transition={
              card.isPrimary
                ? {
                    duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1],
                    boxShadow: { duration: 3.5, repeat: Infinity, repeatDelay: 5, delay: 1.8, ease: 'easeInOut' as const },
                  }
                : { duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }
            }
            className={cn(
              'rounded-2xl p-4 sm:p-4.5 border relative overflow-hidden',
              'transition-transform duration-300 hover:-translate-y-0.5 cursor-default',
              card.bg,
              card.border,
            )}
          >
            {/* Subtle inner top shine */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/15" />

            {/* Shimmer sweep on primary */}
            {card.isPrimary && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ x: '-110%', opacity: 0.6 }}
                animate={{ x: '210%', opacity: 0 }}
                transition={{ duration: 1.2, delay: 0.6, ease: 'easeInOut' }}
                style={{ background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.35) 50%, transparent 62%)' }}
              />
            )}

            {/* Label row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <div className={cn('w-1.5 h-1.5 rounded-full', card.dotColor)} />
                <span className={cn('text-[11px] font-semibold uppercase tracking-widest', card.labelColor)}>
                  {card.label}
                </span>
              </div>
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.06 + 0.18, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  'w-7 h-7 rounded-[10px] flex items-center justify-center shrink-0',
                  card.iconBg,
                )}
              >
                <card.icon className="h-3.5 w-3.5 text-white" strokeWidth={2} />
              </motion.div>
            </div>

            {/* Value */}
            <AnimatedCurrency
              value={value}
              className={cn('text-[22px] sm:text-2xl font-bold block tracking-tight leading-none mb-1.5', card.valueColor)}
              duration={0.85 + index * 0.07}
            />

            {/* Subtitle */}
            <p className="text-[11px] text-muted-foreground/70 leading-tight truncate font-medium">
              {subtitle}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
