import { Banknote, ArrowUpRight, Receipt, Users } from 'lucide-react';
import { AnimatedCurrency } from '@/components/ui/animated-number';
import { cn } from '@/lib/utils';

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

function StatCard({ icon: Icon, label, value, subtitle, color, tint, iconTint }: {
  icon: any;
  label: string;
  value: number;
  subtitle: string;
  color: string;
  tint: string;
  iconTint: string;
}) {
  return (
    <div className={cn(
      "rounded-2xl p-3.5 sm:p-4 space-y-2 transition-all duration-300 hover:-translate-y-0.5 cursor-default",
      "border",
      tint
    )}
    style={{
      boxShadow: '0 1px 2px 0 hsl(220 25% 10% / 0.04), 0 4px 12px -2px hsl(220 25% 10% / 0.06)',
    }}
    >
      <div className="flex items-center gap-1.5">
        <div className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center", iconTint)}>
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <AnimatedCurrency
        value={value}
        className={cn("text-lg sm:text-xl font-bold block tracking-tight truncate", color)}
        duration={0.8}
      />
      <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug truncate">{subtitle}</p>
    </div>
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
        icon={Banknote}
        label="Earned YTD"
        value={receivedYTD}
        subtitle={`${closedDealsYTD} closed deals`}
        color="text-emerald-700 dark:text-emerald-400"
        tint="bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/30"
        iconTint="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
      />
      <StatCard
        icon={ArrowUpRight}
        label="Coming In"
        value={comingIn}
        subtitle={`${activeDeals} pending deals · ${comingInDateRange || 'upcoming'}`}
        color="text-blue-700 dark:text-blue-400"
        tint="bg-blue-50/70 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-800/30"
        iconTint="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
      />
      <StatCard
        icon={Receipt}
        label="Expenses"
        value={monthlyExpenses}
        subtitle="Monthly recurring"
        color="text-rose-700 dark:text-rose-400"
        tint="bg-rose-50/50 dark:bg-rose-950/15 border-rose-200/50 dark:border-rose-800/25"
        iconTint="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400"
      />
      <StatCard
        icon={Users}
        label="Pipeline"
        value={pipelinePotential}
        subtitle={`${pipelineCount} prospect${pipelineCount !== 1 ? 's' : ''}`}
        color="text-violet-700 dark:text-violet-400"
        tint="bg-violet-50/50 dark:bg-violet-950/15 border-violet-200/50 dark:border-violet-800/25"
        iconTint="bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400"
      />
    </div>
  );
}
