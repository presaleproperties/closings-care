import { useMemo } from 'react';
import { Target, CalendarClock } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { AnimatedCurrency } from '@/components/ui/animated-number';
import { cn } from '@/lib/utils';
import { useSettings } from '@/hooks/useSettings';
import { motion } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl px-4 sm:px-5 py-3.5 space-y-2.5 relative overflow-hidden dark:[background:linear-gradient(145deg,hsl(222_22%_10%)_0%,hsl(222_20%_8%)_100%)]"
      style={{
        background: 'linear-gradient(145deg, hsl(0 0% 100%) 0%, hsl(220 20% 97%) 100%)',
        border: '1px solid hsl(var(--border) / 0.7)',
        boxShadow: '0 1px 3px 0 hsl(220 25% 10% / 0.05), 0 6px 20px -4px hsl(220 25% 10% / 0.08), inset 0 1px 0 0 rgba(255,255,255,0.8)',
      }}
    >
      {/* Rich ambient glow top-right */}
      <div
        className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(38 92% 50% / 0.12) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(158 70% 34% / 0.08) 0%, transparent 70%)' }}
      />
      {/* Inner top highlight */}
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.9) 60%, transparent)' }} />

      {/* Top row: Projected total + stacked bar */}
      {(() => {
        const revShareAnnual = revShareMonthlyAvg * 12;
        const commPct = projected2026Total > 0 ? (projectedRevenue / projected2026Total) * 100 : 50;
        return (
          <>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(145deg, hsl(38 90% 56%) 0%, hsl(32 92% 46%) 100%)',
                    boxShadow: '0 3px 10px -2px hsl(38 90% 50% / 0.45), inset 0 1px 0 0 rgba(255,255,255,0.25)',
                  }}
                >
                  <CalendarClock className="h-4 w-4 text-white" />
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
            </div>
            {/* Stacked proportion bar — thicker, glowing */}
            <div className="space-y-1.5">
              <div
                className="h-2.5 rounded-full overflow-hidden flex"
                style={{ background: 'hsl(var(--muted) / 0.5)' }}
              >
                <div
                  className="h-full rounded-l-full transition-all duration-700 ease-out"
                  style={{
                    width: `${commPct}%`,
                    background: 'linear-gradient(90deg, hsl(158 72% 34%), hsl(158 72% 44%))',
                    boxShadow: '2px 0 8px 0 hsl(158 70% 34% / 0.4)',
                  }}
                />
                <div
                  className="h-full rounded-r-full transition-all duration-700 ease-out"
                  style={{
                    width: `${100 - commPct}%`,
                    background: 'linear-gradient(90deg, hsl(217 91% 50%), hsl(217 91% 62%))',
                    boxShadow: '-2px 0 8px 0 hsl(217 91% 50% / 0.35)',
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'hsl(158 72% 38%)', boxShadow: '0 0 6px hsl(158 70% 38% / 0.6)' }} />
                  <span className="text-muted-foreground">Commissions</span>
                  <span className="font-semibold text-foreground">{formatCurrency(projectedRevenue)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'hsl(217 91% 52%)', boxShadow: '0 0 6px hsl(217 91% 52% / 0.5)' }} />
                  <span className="text-muted-foreground">RevShare</span>
                  <span className="font-semibold text-foreground">{formatCurrency(revShareAnnual)}</span>
                </div>
              </div>
            </div>
          </>
        );
      })()}

      {/* Goal progress bars (only if goals are set) */}
      {goals.length > 0 && (
        <>
          <div className="h-px bg-border/40" />
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{thisYear} Goals</span>
          </div>
          <div className="space-y-2.5">
            {goals.map((item) => {
              const pct = item.goal > 0 ? Math.min((item.current / item.goal) * 100, 100) : 0;
              const remaining = Math.max(item.goal - item.current, 0);

              return (
                <div key={item.label} className="space-y-1">
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
                      {remaining > 0 ? `${formatCurrency(remaining)} to go` : 'Goal reached!'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
}
