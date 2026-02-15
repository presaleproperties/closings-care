import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RevShareSummaryCardProps {
  revenueShare: any[];
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function RevShareSummaryCard({ revenueShare }: RevShareSummaryCardProps) {
  const [viewMode, setViewMode] = useState<'single' | 'compare'>('compare');

  // Extract available years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    revenueShare.forEach(r => {
      if (r.period && r.period !== 'unknown') {
        years.add(r.period.split('-')[0]);
      }
    });
    return Array.from(years).sort();
  }, [revenueShare]);

  const [selectedYear, setSelectedYear] = useState(() => availableYears[availableYears.length - 1] || '2026');

  // Build data grouped by year+month
  const { chartData, yearTotals, trend, topTier } = useMemo(() => {
    const byYearMonth: Record<string, Record<number, number>> = {};
    revenueShare.forEach(r => {
      if (!r.period || r.period === 'unknown') return;
      const [year, monthStr] = r.period.split('-');
      if (!byYearMonth[year]) byYearMonth[year] = {};
      const m = parseInt(monthStr);
      byYearMonth[year][m] = (byYearMonth[year][m] || 0) + Number(r.amount);
    });

    // All 12 months chart data
    const chartData = MONTH_NAMES.map((name, i) => {
      const entry: Record<string, any> = { month: name };
      availableYears.forEach(y => {
        entry[y] = Math.round((byYearMonth[y]?.[i + 1] || 0) * 100) / 100;
      });
      return entry;
    });

    // Year totals
    const yearTotals: Record<string, { total: number; avg: number; months: number }> = {};
    availableYears.forEach(y => {
      const months = Object.values(byYearMonth[y] || {});
      const total = months.reduce((s, v) => s + v, 0);
      yearTotals[y] = { total, avg: months.length > 0 ? total / months.length : 0, months: months.length };
    });

    // Trend: compare selected year vs prior year
    const priorYear = String(Number(selectedYear) - 1);
    const currentTotal = yearTotals[selectedYear]?.total || 0;
    const priorTotal = yearTotals[priorYear]?.total || 0;
    const trend = priorTotal > 0 ? Math.round(((currentTotal - priorTotal) / priorTotal) * 100) : 0;

    // Top tier
    const byTier: Record<number, number> = {};
    revenueShare.forEach(r => {
      byTier[r.tier] = (byTier[r.tier] || 0) + Number(r.amount);
    });
    const topTier = Object.entries(byTier).sort(([, a], [, b]) => Number(b) - Number(a))[0];

    return { chartData, yearTotals, trend, topTier };
  }, [revenueShare, availableYears, selectedYear]);

  if (revenueShare.length === 0) return null;

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-destructive' : 'text-muted-foreground';

  const currentYearData = yearTotals[selectedYear] || { total: 0, avg: 0, months: 0 };
  const YEAR_COLORS: Record<number, string> = {
    0: 'hsl(158 64% 42%)',
    1: 'hsl(217 91% 60%)',
    2: 'hsl(38 92% 50%)',
    3: 'hsl(280 68% 58%)',
  };

  // For single year view, filter chart data
  const displayData = viewMode === 'single'
    ? chartData.map(d => ({ month: d.month, [selectedYear]: d[selectedYear] }))
    : chartData;

  const displayYears = viewMode === 'single' ? [selectedYear] : availableYears;

  return (
    <div className="liquid-glass rounded-2xl p-5">
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
          <p className="text-lg font-bold text-foreground">{formatCurrency(currentYearData.total)}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Total Earned</p>
        </div>
        <div className="text-center p-2.5 rounded-lg bg-muted/30 border border-border/20">
          <p className="text-lg font-bold text-foreground">{formatCurrency(currentYearData.avg)}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Monthly Avg</p>
        </div>
        <div className="text-center p-2.5 rounded-lg bg-muted/30 border border-border/20">
          <p className="text-lg font-bold text-foreground">
            {topTier ? `Tier ${topTier[0]}` : '—'}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium">Top Earner</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mb-3">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[90px] h-8 rounded-lg bg-background border-border/50 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            {availableYears.map(y => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex h-8 rounded-lg bg-muted/40 border border-border/30 p-0.5">
          <button
            onClick={() => setViewMode('single')}
            className={`px-2.5 text-[11px] font-medium rounded-md transition-all ${viewMode === 'single' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
          >
            Single
          </button>
          <button
            onClick={() => setViewMode('compare')}
            className={`px-2.5 text-[11px] font-medium rounded-md transition-all ${viewMode === 'compare' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
          >
            Compare
          </button>
        </div>
      </div>

      {/* Chart - all 12 months */}
      <div className="h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }} barGap={2}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                    <p className="font-medium mb-1">{label}</p>
                    {payload.map((p: any, i: number) => (
                      <p key={i} style={{ color: p.color }} className="font-semibold">
                        {p.name}: {formatCurrency(Number(p.value || 0))}
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            {viewMode === 'compare' && <Legend wrapperStyle={{ fontSize: 11 }} />}
            {displayYears.map((year, i) => (
              <Bar
                key={year}
                dataKey={year}
                name={year}
                fill={YEAR_COLORS[i % 4]}
                radius={[3, 3, 0, 0]}
                maxBarSize={viewMode === 'compare' ? 16 : 24}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Year comparison summary */}
      {viewMode === 'compare' && availableYears.length > 1 && (
        <div className="mt-3 pt-3 border-t border-border/20 space-y-1.5">
          {availableYears.map((year, i) => (
            <div key={year} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: YEAR_COLORS[i % 4] }} />
                <span className="font-medium">{year}</span>
              </div>
              <span className="font-semibold">{formatCurrency(yearTotals[year]?.total || 0)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
