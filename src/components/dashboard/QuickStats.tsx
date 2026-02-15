import { Banknote, ArrowUpRight, Receipt, Users, CalendarClock } from 'lucide-react';
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

function StatCard({ icon: Icon, label, value, subtitle, color = 'text-foreground' }: {
  icon: any;
  label: string;
  value: number;
  subtitle: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <AnimatedCurrency
        value={value}
        className={`text-xl font-bold ${color} block`}
        duration={0.8}
      />
      <p className="text-[11px] text-muted-foreground">{subtitle}</p>
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
      {/* Top row: 4 key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Banknote}
          label="Earned YTD"
          value={receivedYTD}
          subtitle={`${closedDealsYTD} deals closed`}
          color="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={ArrowUpRight}
          label="Coming In"
          value={comingIn}
          subtitle={`${activeDeals} deals · ${comingInDateRange || 'upcoming'}`}
          color="text-primary"
        />
        <StatCard
          icon={Receipt}
          label="Expenses"
          value={monthlyExpenses}
          subtitle="Monthly recurring"
          color="text-destructive"
        />
        <StatCard
          icon={Users}
          label="Pipeline"
          value={pipelinePotential}
          subtitle={`${pipelineCount} prospect${pipelineCount !== 1 ? 's' : ''}`}
          color="text-primary"
        />
      </div>

      {/* 2026 projection — simple bar */}
      <div className="rounded-xl border border-border/50 bg-card p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">2026 Projected</p>
            <AnimatedCurrency
              value={projected2026Total}
              className="text-xl font-bold text-foreground block"
              duration={0.8}
            />
          </div>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">Commissions</p>
            <p className="text-sm font-semibold text-foreground">{formatCurrency(projectedRevenue2026)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">RevShare</p>
            <p className="text-sm font-semibold text-foreground">{formatCurrency(revShareMonthlyAvg * 12)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
