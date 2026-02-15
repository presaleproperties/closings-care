import { Banknote, ArrowUpRight, Receipt, Users, CalendarClock } from 'lucide-react';
import { AnimatedCurrency } from '@/components/ui/animated-number';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

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
      "rounded-xl border p-4 space-y-1.5 transition-colors",
      tint
    )}>
      <div className="flex items-center gap-2">
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", iconTint)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <AnimatedCurrency
        value={value}
        className={cn("text-xl font-bold block tracking-tight", color)}
        duration={0.8}
      />
      <p className="text-[11px] text-muted-foreground leading-tight">{subtitle}</p>
    </div>
  );
}

export function QuickStats({
  receivedYTD,
  comingIn,
  monthlyExpenses,
  activeDeals,
  closedDealsYTD,
  projectedRevenue2026 = 0,
  revShareMonthlyAvg = 0,
  pipelineCount = 0,
  pipelinePotential = 0,
  comingInDateRange,
}: QuickStatsProps) {
  const projected2026Total = projectedRevenue2026 + revShareMonthlyAvg * 12;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Banknote}
          label="Earned YTD"
          value={receivedYTD}
          subtitle={`${closedDealsYTD} deals closed`}
          color="text-emerald-700 dark:text-emerald-400"
          tint="bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/30"
          iconTint="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={ArrowUpRight}
          label="Coming In"
          value={comingIn}
          subtitle={`${activeDeals} deals · ${comingInDateRange || 'upcoming'}`}
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

      {/* 2026 projection */}
      <div className="rounded-xl border border-border/40 bg-gradient-to-r from-card to-muted/30 dark:from-card dark:to-muted/10 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100/80 dark:bg-amber-900/30 flex items-center justify-center">
            <CalendarClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">2026 Projected</p>
            <AnimatedCurrency
              value={projected2026Total}
              className="text-xl font-bold text-foreground block tracking-tight"
              duration={0.8}
            />
          </div>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Commissions</p>
            <p className="text-sm font-semibold text-foreground">{formatCurrency(projectedRevenue2026)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">RevShare</p>
            <p className="text-sm font-semibold text-foreground">{formatCurrency(revShareMonthlyAvg * 12)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
