import { useMemo } from 'react';
import { Target, CalendarClock } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { AnimatedCurrency } from '@/components/ui/animated-number';
import { cn } from '@/lib/utils';
import { useSettings } from '@/hooks/useSettings';

interface GCIGoalTrackerProps {
  gciYTD: number;
  revShareYTD: number;
  projectedRevenue: number;
  revShareMonthlyAvg: number;
}

export function GCIGoalTracker({ gciYTD, revShareYTD, projectedRevenue, revShareMonthlyAvg }: GCIGoalTrackerProps) {
  const { data: settings } = useSettings();
  const thisYear = new Date().getFullYear();

  const gciGoal = Number((settings as any)?.yearly_gci_goal) || 0;
  const revShareGoal = Number((settings as any)?.yearly_revshare_goal) || 0;
  const projected2026Total = projectedRevenue + revShareMonthlyAvg * 12;

  const goals = useMemo(() => {
    const items: { label: string; current: number; goal: number; color: string }[] = [];
    if (gciGoal > 0) {
      items.push({ label: 'GCI', current: gciYTD, goal: gciGoal, color: 'hsl(var(--primary))' });
    }
    if (revShareGoal > 0) {
      items.push({ label: 'RevShare', current: revShareYTD, goal: revShareGoal, color: 'hsl(var(--accent))' });
    }
    return items;
  }, [gciYTD, revShareYTD, gciGoal, revShareGoal]);

  return (
    <div className="liquid-glass rounded-2xl p-5 space-y-4">
      {/* Top row: Projected total + breakdown */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100/80 dark:bg-amber-900/30 flex items-center justify-center">
            <CalendarClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{thisYear} Projected</p>
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
            <p className="text-sm font-semibold text-foreground">{formatCurrency(projectedRevenue)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">RevShare</p>
            <p className="text-sm font-semibold text-foreground">{formatCurrency(revShareMonthlyAvg * 12)}</p>
          </div>
        </div>
      </div>

      {/* Goal progress bars (only if goals are set) */}
      {goals.length > 0 && (
        <>
          <div className="h-px bg-border/40" />
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{thisYear} Goals</span>
          </div>
          <div className="space-y-3">
            {goals.map((item) => {
              const pct = item.goal > 0 ? Math.min((item.current / item.goal) * 100, 100) : 0;
              const remaining = Math.max(item.goal - item.current, 0);

              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                    <span className="text-[11px] text-muted-foreground">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%`, background: item.color }}
                    />
                  </div>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-bold text-foreground">{formatCurrency(item.current)}</span>
                    <span className="text-muted-foreground">
                      {remaining > 0 ? `${formatCurrency(remaining)} to go` : '🎯 Goal reached!'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
