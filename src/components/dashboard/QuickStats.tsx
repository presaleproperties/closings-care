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
    subtitleFn: (p: QuickStatsProps) => `${p.closedDealsYTD} closed deals`,
    // Tailwind classes — light tint + dark tint
    bg: 'bg-emerald-50 dark:bg-emerald-950/25',
    border: 'border-emerald-200/70 dark:border-emerald-800/40',
    valueColor: 'text-emerald-800 dark:text-emerald-300',
    iconBg: 'bg-emerald-500',
    glowClass: 'shadow-emerald-200 dark:shadow-emerald-900/60',
  },
  {
    key: 'coming',
    icon: ArrowUpRight,
    label: 'Coming In',
    isPrimary: false,
    valueKey: 'comingIn' as const,
    subtitleFn: (p: QuickStatsProps) =>
      `${p.activeDeals} pending · ${p.comingInDateRange || 'upcoming'}`,
    bg: 'bg-blue-50 dark:bg-blue-950/25',
    border: 'border-blue-200/70 dark:border-blue-800/40',
    valueColor: 'text-blue-800 dark:text-blue-300',
    iconBg: 'bg-blue-500',
    glowClass: 'shadow-blue-200 dark:shadow-blue-900/60',
  },
  {
    key: 'expenses',
    icon: Receipt,
    label: 'Expenses',
    isPrimary: false,
    valueKey: 'monthlyExpenses' as const,
    subtitleFn: () => 'Monthly recurring',
    bg: 'bg-rose-50 dark:bg-rose-950/25',
    border: 'border-rose-200/65 dark:border-rose-800/35',
    valueColor: 'text-rose-800 dark:text-rose-300',
    iconBg: 'bg-rose-500',
    glowClass: 'shadow-rose-200 dark:shadow-rose-900/60',
  },
  {
    key: 'pipeline',
    icon: Users,
    label: 'Pipeline',
    isPrimary: false,
    valueKey: 'pipelinePotential' as const,
    subtitleFn: (p: QuickStatsProps) =>
      `${p.pipelineCount ?? 0} prospect${(p.pipelineCount ?? 0) !== 1 ? 's' : ''}`,
    bg: 'bg-violet-50 dark:bg-violet-950/25',
    border: 'border-violet-200/65 dark:border-violet-800/35',
    valueColor: 'text-violet-800 dark:text-violet-300',
    iconBg: 'bg-violet-500',
    glowClass: 'shadow-violet-200 dark:shadow-violet-900/60',
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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
      {CARDS.map((card, index) => {
        const value = props[card.valueKey] ?? 0;
        const subtitle = card.subtitleFn(props);

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={
              card.isPrimary
                ? {
                    opacity: 1, y: 0, scale: 1,
                    boxShadow: [
                      '0 1px 2px 0 hsl(220 25% 10% / 0.05), 0 4px 14px -3px hsl(220 25% 10% / 0.08)',
                      '0 2px 20px -3px hsl(158 72% 34% / 0.22), 0 8px 28px -6px hsl(158 72% 34% / 0.14)',
                      '0 1px 2px 0 hsl(220 25% 10% / 0.05), 0 4px 14px -3px hsl(220 25% 10% / 0.08)',
                    ],
                  }
                : { opacity: 1, y: 0, scale: 1 }
            }
            transition={
              card.isPrimary
                ? {
                    duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1],
                    boxShadow: { duration: 3, repeat: Infinity, repeatDelay: 4, delay: 1.5, ease: 'easeInOut' as const },
                  }
                : { duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }
            }
            className={cn(
              'rounded-2xl p-3.5 sm:p-4 space-y-2 border',
              'transition-transform duration-300 hover:-translate-y-[3px] cursor-default relative overflow-hidden',
              card.bg,
              card.border,
            )}
          >
            {/* Inner top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

            {/* Shimmer sweep on primary card */}
            {card.isPrimary && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ x: '-100%', opacity: 0.5 }}
                animate={{ x: '200%', opacity: 0 }}
                transition={{ duration: 1.1, delay: 0.5, ease: 'easeInOut' }}
                style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)' }}
              />
            )}

            <div className="flex items-center gap-1.5">
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, delay: index * 0.07 + 0.15, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  'w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center',
                  card.iconBg,
                )}
              >
                <card.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </motion.div>
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {card.label}
              </span>
            </div>

            <AnimatedCurrency
              value={value}
              className={cn('text-lg sm:text-xl font-bold block tracking-tight truncate', card.valueColor)}
              duration={0.9 + index * 0.08}
            />
            <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug truncate">
              {subtitle}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
