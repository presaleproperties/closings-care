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

// Breathing pulse — handled via animate prop directly on the primary card

function StatCard({
  icon: Icon, label, value, subtitle, color,
  gradientFrom, gradientTo, borderColor, iconBg, iconColor, glowColor,
  index, isPrimary = false,
}: {
  icon: any;
  label: string;
  value: number;
  subtitle: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  glowColor: string;
  index: number;
  isPrimary?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={isPrimary
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
      transition={isPrimary
        ? { duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1],
            boxShadow: { duration: 3, repeat: Infinity, repeatDelay: 4, delay: 1.5, ease: 'easeInOut' as const } }
        : { duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }
      }
      className="rounded-2xl p-3.5 sm:p-4 space-y-2 transition-[border-color,transform] duration-300 hover:-translate-y-[3px] cursor-default relative overflow-hidden"
      style={{
        background: `linear-gradient(145deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        border: `1px solid ${borderColor}`,
      }}
    >
      {/* Inner top highlight */}
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5) 50%, transparent)' }} />

      {/* Primary card: subtle shimmer sweep on mount */}
      {isPrimary && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ x: '-100%', opacity: 0.6 }}
          animate={{ x: '200%', opacity: 0 }}
          transition={{ duration: 1.1, delay: 0.5, ease: 'easeInOut' }}
          style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)' }}
        />
      )}

      <div className="flex items-center gap-1.5">
        <motion.div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, delay: index * 0.07 + 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: iconBg, boxShadow: `0 2px 8px -2px ${glowColor}` }}
        >
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: iconColor }} />
        </motion.div>
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>

      <AnimatedCurrency
        value={value}
        className={cn("text-lg sm:text-xl font-bold block tracking-tight truncate", color)}
        duration={0.9 + index * 0.08}
      />
      <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug truncate">{subtitle}</p>
    </motion.div>
  );
}

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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
      <StatCard
        index={0}
        isPrimary
        icon={Banknote}
        label="Earned YTD"
        value={receivedYTD}
        subtitle={`${closedDealsYTD} closed deals`}
        color="text-emerald-700 dark:text-emerald-400"
        gradientFrom="hsl(145 60% 97%)"
        gradientTo="hsl(152 55% 93%)"
        borderColor="hsl(152 50% 82% / 0.7)"
        iconBg="linear-gradient(145deg, hsl(158 72% 40%), hsl(158 72% 30%))"
        iconColor="white"
        glowColor="hsl(158 72% 34% / 0.5)"
      />
      <StatCard
        index={1}
        icon={ArrowUpRight}
        label="Coming In"
        value={comingIn}
        subtitle={`${activeDeals} pending deals · ${comingInDateRange || 'upcoming'}`}
        color="text-blue-700 dark:text-blue-400"
        gradientFrom="hsl(214 80% 97%)"
        gradientTo="hsl(217 70% 93%)"
        borderColor="hsl(217 60% 82% / 0.7)"
        iconBg="linear-gradient(145deg, hsl(217 91% 54%), hsl(217 91% 44%))"
        iconColor="white"
        glowColor="hsl(217 91% 50% / 0.45)"
      />
      <StatCard
        index={2}
        icon={Receipt}
        label="Expenses"
        value={monthlyExpenses}
        subtitle="Monthly recurring"
        color="text-rose-700 dark:text-rose-400"
        gradientFrom="hsl(355 80% 97%)"
        gradientTo="hsl(0 65% 94%)"
        borderColor="hsl(0 55% 84% / 0.65)"
        iconBg="linear-gradient(145deg, hsl(0 74% 54%), hsl(0 74% 44%))"
        iconColor="white"
        glowColor="hsl(0 74% 50% / 0.4)"
      />
      <StatCard
        index={3}
        icon={Users}
        label="Pipeline"
        value={pipelinePotential}
        subtitle={`${pipelineCount} prospect${pipelineCount !== 1 ? 's' : ''}`}
        color="text-violet-700 dark:text-violet-400"
        gradientFrom="hsl(270 75% 97%)"
        gradientTo="hsl(275 65% 93%)"
        borderColor="hsl(275 55% 82% / 0.65)"
        iconBg="linear-gradient(145deg, hsl(275 65% 54%), hsl(275 65% 44%))"
        iconColor="white"
        glowColor="hsl(275 65% 50% / 0.4)"
      />
    </div>
  );
}
