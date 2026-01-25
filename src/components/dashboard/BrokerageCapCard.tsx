import { motion } from 'framer-motion';
import { Target, TrendingUp, Calendar, Sparkles, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useBrokerageCap } from '@/hooks/useBrokerageCap';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function BrokerageCapCard() {
  const capStatus = useBrokerageCap();

  if (!capStatus.isEnabled || capStatus.capAmount <= 0) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all",
      capStatus.capReached && "border-success bg-gradient-to-br from-success/5 to-success/10"
    )}>
      {/* Achievement glow effect when cap reached */}
      {capStatus.capReached && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-success/20 via-success/10 to-success/20"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <CardHeader className="pb-2 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {capStatus.capReached ? (
              <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-success" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-4 w-4 text-primary" />
              </div>
            )}
            <CardTitle className="text-sm font-medium">Brokerage Cap</CardTitle>
          </div>
          {capStatus.capReached && (
            <motion.div
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/20 text-success text-xs font-medium"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Sparkles className="h-3 w-3" />
              100% Split!
            </motion.div>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Progress visualization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress to Cap</span>
            <span className={cn(
              "font-semibold",
              capStatus.capReached ? "text-success" : "text-foreground"
            )}>
              {capStatus.progressPercent.toFixed(0)}%
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={capStatus.progressPercent} 
              className={cn(
                "h-3",
                capStatus.capReached && "[&>div]:bg-success"
              )}
            />
            {capStatus.capReached && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Paid to Brokerage</p>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(capStatus.amountPaidTowardsCap)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">
              {capStatus.capReached ? 'Cap Reached!' : 'Remaining'}
            </p>
            <p className={cn(
              "text-lg font-bold",
              capStatus.capReached ? "text-success" : "text-foreground"
            )}>
              {capStatus.capReached 
                ? formatCurrency(0)
                : formatCurrency(capStatus.amountRemainingUntilCap)
              }
            </p>
          </div>
        </div>

        {/* Current split & period info */}
        <div className="pt-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Current Split</span>
            </div>
            <span className={cn(
              "font-semibold",
              capStatus.capReached ? "text-success" : "text-foreground"
            )}>
              {capStatus.capReached 
                ? "100% (You keep all!)" 
                : `${100 - capStatus.splitPercent}% / ${capStatus.splitPercent}%`
              }
            </span>
          </div>

          {capStatus.currentPeriodEnd && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Cap Resets</span>
              </div>
              <span className="text-muted-foreground">
                {format(capStatus.currentPeriodEnd, 'MMM d, yyyy')}
                {capStatus.daysUntilReset && ` (${capStatus.daysUntilReset}d)`}
              </span>
            </div>
          )}
        </div>

        {/* Cap goal */}
        <div className="text-xs text-center text-muted-foreground pt-2">
          Annual Cap Goal: <span className="font-semibold text-foreground">{formatCurrency(capStatus.capAmount)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
