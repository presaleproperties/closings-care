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

export function PipelinePreview() {
  const { data: prospects = [] } = usePipelineProspects();

  const active = prospects.filter(p => p.status === 'active');
  const totalPotential = active.reduce((sum, p) => sum + Number(p.potential_commission), 0);
  const hotCount = active.filter(p => p.temperature === 'hot').length;
  const warmCount = active.filter(p => p.temperature === 'warm').length;
  const coldCount = active.filter(p => p.temperature === 'cold').length;

  // Show top 4 prospects sorted: hot first, then warm, then cold
  const sorted = [...active].sort((a, b) => {
    const order: Record<string, number> = { hot: 0, warm: 1, cold: 2 };
    return (order[a.temperature] ?? 1) - (order[b.temperature] ?? 1);
  }).slice(0, 4);

  return (
    <Card className="border-border/40 bg-card/90 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Pipeline</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{active.length} active prospect{active.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">{formatCurrency(totalPotential)}</p>
            <p className="text-[10px] text-muted-foreground">potential</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Temperature summary pills */}
        {active.length > 0 && (
          <div className="flex items-center gap-2">
            {hotCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <Flame className="h-2.5 w-2.5" /> {hotCount} Hot
              </span>
            )}
            {warmCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Thermometer className="h-2.5 w-2.5" /> {warmCount} Warm
              </span>
            )}
            {coldCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-500 border border-sky-500/20">
                <Snowflake className="h-2.5 w-2.5" /> {coldCount} Cold
              </span>
            )}
          </div>
        )}

        {/* Prospect list */}
        {sorted.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <TrendingUp className="h-7 w-7 mx-auto mb-1.5 opacity-30" />
            <p className="text-xs">No active prospects</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {sorted.map((p, idx) => {
              const tc = tempConfig[p.temperature] || tempConfig.warm;
              const Icon = tc.icon;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-center gap-2.5 py-2 px-2.5 rounded-lg bg-muted/20 border border-border/15"
                >
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", tc.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.client_name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.home_type}</p>
                  </div>
                  <span className="text-sm font-bold text-primary whitespace-nowrap">
                    {formatCurrency(p.potential_commission)}
                  </span>
                </motion.div>
              );
            })}
            {active.length > 4 && (
              <p className="text-[10px] text-muted-foreground text-center pt-1">
                +{active.length - 4} more prospect{active.length - 4 !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Link to full page */}
        <Link
          to="/pipeline"
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold text-primary hover:bg-primary/5 border border-dashed border-primary/20 transition-colors"
        >
          View Full Pipeline
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}