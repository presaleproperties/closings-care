import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface RevShareSummaryCardProps {
  revenueShare: any[];
}

export function RevShareSummaryCard({ revenueShare }: RevShareSummaryCardProps) {
  const { totalEarned, monthlyData, trend, avgMonthly, topTier } = useMemo(() => {
    const totalEarned = revenueShare.reduce((s, r) => s + Number(r.amount), 0);

    // Group by period for monthly trend
    const byPeriod: Record<string, number> = {};
    revenueShare.forEach(r => {
      byPeriod[r.period] = (byPeriod[r.period] || 0) + Number(r.amount);
    });

    const sorted = Object.entries(byPeriod)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12);

    const monthlyData = sorted.map(([period, amount]) => {
      const [year, month] = period.split('-');
      const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        month: monthNames[parseInt(month)] || period,
        amount: Math.round(amount * 100) / 100,
        period,
      };
    });

    // Trend: compare last 3 months vs prior 3 months
    const amounts = sorted.map(([, a]) => a);
    const recent3 = amounts.slice(-3).reduce((s, a) => s + a, 0);
    const prior3 = amounts.slice(-6, -3).reduce((s, a) => s + a, 0);
    const trend = prior3 > 0 ? Math.round(((recent3 - prior3) / prior3) * 100) : 0;

    const avgMonthly = sorted.length > 0 ? totalEarned / sorted.length : 0;

    // Top earning tier
    const byTier: Record<number, number> = {};
    revenueShare.forEach(r => {
      byTier[r.tier] = (byTier[r.tier] || 0) + Number(r.amount);
    });
    const topTier = Object.entries(byTier).sort(([, a], [, b]) => Number(b) - Number(a))[0];

    return { totalEarned, monthlyData, trend, avgMonthly, topTier };
  }, [revenueShare]);

  if (revenueShare.length === 0) return null;

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-destructive' : 'text-muted-foreground';

  const chartConfig = {
    amount: {
      label: 'RevShare',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <Card className="p-5 border-border/40 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Users className="h-4.5 w-4.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm">Revenue Share</h3>
          <p className="text-xs text-muted-foreground">Network earnings from Real Broker</p>
        </div>
        <Badge variant="outline" className={`${trendColor} border-current/30 gap-1`}>
          <TrendIcon className="h-3 w-3" />
          {trend > 0 ? '+' : ''}{trend}%
        </Badge>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2.5 rounded-lg bg-muted/30 border border-border/20">
          <p className="text-lg font-bold text-foreground">{formatCurrency(totalEarned)}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Total Earned</p>
        </div>
        <div className="text-center p-2.5 rounded-lg bg-muted/30 border border-border/20">
          <p className="text-lg font-bold text-foreground">{formatCurrency(avgMonthly)}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Monthly Avg</p>
        </div>
        <div className="text-center p-2.5 rounded-lg bg-muted/30 border border-border/20">
          <p className="text-lg font-bold text-foreground">
            {topTier ? `Tier ${topTier[0]}` : '—'}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium">Top Earner</p>
        </div>
      </div>

      {/* Monthly trend chart */}
      {monthlyData.length > 1 && (
        <ChartContainer config={chartConfig} className="h-[120px] w-full">
          <BarChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                    <p className="font-medium">{payload[0]?.payload?.period}</p>
                    <p className="text-primary font-semibold">{formatCurrency(Number(payload[0]?.value || 0))}</p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="amount"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ChartContainer>
      )}
    </Card>
  );
}
