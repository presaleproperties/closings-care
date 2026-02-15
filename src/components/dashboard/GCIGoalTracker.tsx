import { useMemo } from 'react';
import { Target } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useSettings } from '@/hooks/useSettings';

interface GCIGoalTrackerProps {
  gciYTD: number;
  revShareYTD: number;
}

export function GCIGoalTracker({ gciYTD, revShareYTD }: GCIGoalTrackerProps) {
  const { data: settings } = useSettings();
  const thisYear = new Date().getFullYear();

  const gciGoal = Number((settings as any)?.yearly_gci_goal) || 0;
  const revShareGoal = Number((settings as any)?.yearly_revshare_goal) || 0;

  const goals = useMemo(() => {
    const items: { label: string; current: number; goal: number; color: string }[] = [];
    if (gciGoal > 0) {
      items.push({ label: 'GCI', current: gciYTD, goal: gciGoal, color: 'hsl(var(--primary))' });
    }
    if (revShareGoal > 0) {
      items.push({ label: 'RevShare', current: revShareYTD, goal: revShareGoal, color: 'hsl(var(--accent-foreground))' });
    }
    return items;
  }, [gciYTD, revShareYTD, gciGoal, revShareGoal]);

  if (goals.length === 0) return null;

  return (
    <div className="liquid-glass rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-8 w-8 rounded-[10px] bg-primary/10 flex items-center justify-center">
          <Target className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-foreground">{thisYear} Goals</h3>
          <p className="text-[11px] text-muted-foreground">Year-to-date progress</p>
        </div>
      </div>

      <div className="space-y-4">
        {goals.map((item) => {
          const pct = item.goal > 0 ? Math.min((item.current / item.goal) * 100, 100) : 0;
          const remaining = Math.max(item.goal - item.current, 0);

          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                <span className="text-[11px] text-muted-foreground">
                  {pct.toFixed(0)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    background: item.color,
                  }}
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
    </div>
  );
}
