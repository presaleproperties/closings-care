import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePipelineProspects } from '@/hooks/usePipelineProspects';
import { formatCurrency } from '@/lib/format';
import { Users, Flame, Thermometer, Snowflake, ArrowRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const tempConfig: Record<string, { icon: any; color: string }> = {
  hot: { icon: Flame, color: 'text-rose-500' },
  warm: { icon: Thermometer, color: 'text-amber-500' },
  cold: { icon: Snowflake, color: 'text-sky-500' },
};

export function PipelinePreview({ layout = 'vertical' }: { layout?: 'horizontal' | 'vertical' }) {
  const { data: prospects = [] } = usePipelineProspects();

  const active = prospects.filter(p => p.status === 'active');
  const totalPotential = active.reduce((sum, p) => sum + Number(p.potential_commission), 0);
  const hotCount = active.filter(p => p.temperature === 'hot').length;
  const warmCount = active.filter(p => p.temperature === 'warm').length;
  const coldCount = active.filter(p => p.temperature === 'cold').length;

  const sorted = [...active].sort((a, b) => {
    const order: Record<string, number> = { hot: 0, warm: 1, cold: 2 };
    return (order[a.temperature] ?? 1) - (order[b.temperature] ?? 1);
  }).slice(0, 4);

  const TempPills = () => (
    <div className="flex items-center gap-2 flex-wrap">
      {hotCount > 0 && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
          <Flame className="h-3 w-3" /> {hotCount}
        </span>
      )}
      {warmCount > 0 && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <Thermometer className="h-3 w-3" /> {warmCount}
        </span>
      )}
      {coldCount > 0 && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-500 border border-sky-500/20">
          <Snowflake className="h-3 w-3" /> {coldCount}
        </span>
      )}
    </div>
  );

  if (layout === 'horizontal') {
    return (
      <Card className="border-border/40 bg-card/90 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[15px] font-semibold leading-tight">Pipeline</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {active.length} active · {formatCurrency(totalPotential)} potential
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <TempPills />
              <Link
                to="/pipeline"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary/5 border border-dashed border-primary/20 transition-colors ml-1"
              >
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {sorted.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-xs">No active prospects</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {sorted.map((p, idx) => {
                const tc = tempConfig[p.temperature] || tempConfig.warm;
                const Icon = tc.icon;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-center gap-2.5 py-3 px-3.5 rounded-xl bg-muted/20 border border-border/15"
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", tc.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.client_name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{p.home_type}</p>
                    </div>
                    <span className="text-sm font-bold text-primary whitespace-nowrap">
                      {formatCurrency(p.potential_commission)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
          {active.length > 4 && (
            <p className="text-[11px] text-muted-foreground text-center pt-3">
              +{active.length - 4} more prospect{active.length - 4 !== 1 ? 's' : ''}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 bg-card/90 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-3 sm:pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-[15px] font-semibold leading-tight">Pipeline</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {active.length} active prospect{active.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-primary">{formatCurrency(totalPotential)}</p>
            <p className="text-[11px] text-muted-foreground">potential</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-0 sm:pt-0 space-y-4">
        {/* Temperature summary pills */}
        {active.length > 0 && <TempPills />}

        {/* Prospect list */}
        {sorted.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <TrendingUp className="h-7 w-7 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No active prospects</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sorted.map((p, idx) => {
              const tc = tempConfig[p.temperature] || tempConfig.warm;
              const Icon = tc.icon;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-center gap-3 py-3 px-3.5 rounded-xl bg-muted/20 border border-border/15"
                >
                  <Icon className={cn("h-4 w-4 shrink-0", tc.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.client_name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{p.home_type}</p>
                  </div>
                  <span className="text-sm font-bold text-primary whitespace-nowrap">
                    {formatCurrency(p.potential_commission)}
                  </span>
                </motion.div>
              );
            })}
            {active.length > 4 && (
              <p className="text-[11px] text-muted-foreground text-center pt-1">
                +{active.length - 4} more prospect{active.length - 4 !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Link to full page */}
        <Link
          to="/pipeline"
          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold text-primary hover:bg-primary/5 border border-dashed border-primary/20 transition-colors"
        >
          View Full Pipeline
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
