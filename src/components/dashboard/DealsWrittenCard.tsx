import { useMemo, useState } from 'react';
import { PenLine, TrendingUp, TrendingDown, Users2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from '@/components/ui/animated-number';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, isWithinInterval } from 'date-fns';
import { getEffectiveCommission } from '@/hooks/useAnalyticsData';

type Grouping = 'monthly' | 'quarterly';
type Metric = 'deals' | 'gci';

interface DealsWrittenCardProps {
  syncedTransactions: any[];
  compact?: boolean;
}

const CURRENT_COLOR = 'hsl(158, 64%, 42%)';
const PREV_COLOR = 'hsl(var(--muted-foreground))';

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover/95 backdrop-blur-xl border border-border/50 rounded-xl p-3 shadow-xl min-w-[160px]">
      <p className="font-semibold text-sm mb-2">{label}</p>
      <div className="space-y-1 text-xs">
        {payload.map((entry: any, i: number) => (
          <p key={i} className="flex justify-between gap-4">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-bold">
              {typeof entry.value === 'number' && entry.value > 100
                ? formatCurrency(entry.value)
                : entry.value}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
};

export function useDealsWrittenData(syncedTransactions: any[]) {
  return useMemo(() => {
    const txsWithFirmDate = syncedTransactions.filter(tx => tx.firm_date);
    if (txsWithFirmDate.length === 0) return [];

    const dates = txsWithFirmDate.map(tx => new Date(tx.firm_date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    const months = eachMonthOfInterval({
      start: startOfMonth(minDate),
      end: endOfMonth(maxDate),
    });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthTxs = txsWithFirmDate.filter(tx =>
        isWithinInterval(new Date(tx.firm_date), { start: monthStart, end: monthEnd })
      );

      const gci = monthTxs.reduce((s, tx) => s + getEffectiveCommission(tx), 0);
      const net = monthTxs.reduce((s, tx) => s + Number(tx.my_net_payout || 0), 0);
      const buyers = monthTxs.filter(tx => !tx.is_listing).length;
      const sellers = monthTxs.filter(tx => tx.is_listing).length;
      const count = monthTxs.length;

      return {
        monthDate: month,
        monthKey: format(month, 'yyyy-MM'),
        label: format(month, 'MMM yy'),
        fullLabel: format(month, 'MMMM yyyy'),
        count,
        gci,
        net,
        avgDeal: count > 0 ? gci / count : 0,
        buyers,
        sellers,
      };
    });
  }, [syncedTransactions]);
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const QUARTER_NAMES = ['Q1', 'Q2', 'Q3', 'Q4'];

function buildYoYData(monthlyData: ReturnType<typeof useDealsWrittenData>, grouping: Grouping, currentYear: number) {
  const prevYear = currentYear - 1;

  if (grouping === 'monthly') {
    return MONTH_NAMES.map((name, i) => {
      const curMonth = monthlyData.find(m => m.monthDate.getFullYear() === currentYear && m.monthDate.getMonth() === i);
      const prevMonth = monthlyData.find(m => m.monthDate.getFullYear() === prevYear && m.monthDate.getMonth() === i);
      return {
        label: name,
        [String(currentYear)]: curMonth?.count || 0,
        [String(prevYear)]: prevMonth?.count || 0,
        [`${currentYear}_gci`]: curMonth?.gci || 0,
        [`${prevYear}_gci`]: prevMonth?.gci || 0,
      };
    });
  }

  // Quarterly
  return QUARTER_NAMES.map((name, qi) => {
    const monthIndices = [qi * 3, qi * 3 + 1, qi * 3 + 2];
    const curCount = monthIndices.reduce((s, mi) => {
      const m = monthlyData.find(m => m.monthDate.getFullYear() === currentYear && m.monthDate.getMonth() === mi);
      return s + (m?.count || 0);
    }, 0);
    const prevCount = monthIndices.reduce((s, mi) => {
      const m = monthlyData.find(m => m.monthDate.getFullYear() === prevYear && m.monthDate.getMonth() === mi);
      return s + (m?.count || 0);
    }, 0);
    const curGci = monthIndices.reduce((s, mi) => {
      const m = monthlyData.find(m => m.monthDate.getFullYear() === currentYear && m.monthDate.getMonth() === mi);
      return s + (m?.gci || 0);
    }, 0);
    const prevGci = monthIndices.reduce((s, mi) => {
      const m = monthlyData.find(m => m.monthDate.getFullYear() === prevYear && m.monthDate.getMonth() === mi);
      return s + (m?.gci || 0);
    }, 0);
    return {
      label: name,
      [String(currentYear)]: curCount,
      [String(prevYear)]: prevCount,
      [`${currentYear}_gci`]: curGci,
      [`${prevYear}_gci`]: prevGci,
    };
  });
}

export function DealsWrittenCard({ syncedTransactions, compact = false }: DealsWrittenCardProps) {
  const [grouping, setGrouping] = useState<Grouping>('monthly');
  const [metric, setMetric] = useState<Metric>('deals');
  const monthlyData = useDealsWrittenData(syncedTransactions);

  const currentYear = new Date().getFullYear();
  const prevYear = currentYear - 1;
  const currentMonth = new Date().getMonth();

  const yoyData = useMemo(() => buildYoYData(monthlyData, grouping, currentYear), [monthlyData, grouping, currentYear]);

  // YTD stats
  const ytdCurrent = useMemo(() => {
    const ytd = monthlyData.filter(m => m.monthDate.getFullYear() === currentYear);
    return { deals: ytd.reduce((s, m) => s + m.count, 0), gci: ytd.reduce((s, m) => s + m.gci, 0) };
  }, [monthlyData, currentYear]);

  const ytdPrev = useMemo(() => {
    const ytd = monthlyData.filter(m => m.monthDate.getFullYear() === prevYear && m.monthDate.getMonth() <= currentMonth);
    return { deals: ytd.reduce((s, m) => s + m.count, 0), gci: ytd.reduce((s, m) => s + m.gci, 0) };
  }, [monthlyData, prevYear, currentMonth]);

  const yoyChange = ytdPrev.deals > 0 ? ((ytdCurrent.deals - ytdPrev.deals) / ytdPrev.deals) * 100 : 0;
  const gciChange = ytdPrev.gci > 0 ? ((ytdCurrent.gci - ytdPrev.gci) / ytdPrev.gci) * 100 : 0;
  const monthsElapsed = currentMonth + 1;
  const avgPerMonth = monthsElapsed > 0 ? ytdCurrent.deals / monthsElapsed : 0;

  if (monthlyData.length === 0) return null;

  return (
    <div className="landing-card p-3 sm:p-4 lg:p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
            <PenLine className="w-3.5 h-3.5 text-primary" />
            Deals Written
          </h3>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {currentYear} vs {prevYear} · By firm date
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-0.5 bg-muted/50 rounded-lg">
            {(['deals', 'gci'] as Metric[]).map(m => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={cn(
                  "px-2 py-1 text-[10px] sm:text-xs font-medium rounded-md transition-all",
                  metric === m
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m === 'deals' ? 'Deals' : 'GCI'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 p-0.5 bg-muted/50 rounded-lg">
            {(['monthly', 'quarterly'] as Grouping[]).map(g => (
              <button
                key={g}
                onClick={() => setGrouping(g)}
                className={cn(
                  "px-2 py-1 text-[10px] sm:text-xs font-medium rounded-md transition-all",
                  grouping === g
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {g === 'monthly' ? 'Monthly' : 'Quarterly'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mb-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">YTD</span>
          <span className="font-bold">{ytdCurrent.deals}</span>
          {ytdPrev.deals > 0 && (
            <span className={cn("text-[10px] font-semibold flex items-center", yoyChange >= 0 ? "text-emerald-600" : "text-rose-600")}>
              {yoyChange >= 0 ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
              {Math.abs(yoyChange).toFixed(0)}%
            </span>
          )}
        </div>
        <div className="w-px h-3.5 bg-border" />
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">GCI</span>
          <span className="font-bold text-emerald-600">{formatCurrency(ytdCurrent.gci)}</span>
          {ytdPrev.gci > 0 && (
            <span className={cn("text-[10px] font-semibold flex items-center", gciChange >= 0 ? "text-emerald-600" : "text-rose-600")}>
              {gciChange >= 0 ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
              {Math.abs(gciChange).toFixed(0)}%
            </span>
          )}
        </div>
        <div className="w-px h-3.5 bg-border" />
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Avg/mo</span>
          <span className="font-bold">{avgPerMonth.toFixed(1)}</span>
        </div>
        <div className="w-px h-3.5 bg-border" />
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">{prevYear} same period</span>
          <span className="font-medium">{ytdPrev.deals}</span>
        </div>
      </div>

      {/* YoY Chart */}
      <div className={cn("w-full", compact ? "h-44" : "h-56 sm:h-64")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={yoyData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: compact ? 9 : 10 }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={metric === 'gci' ? 50 : 25}
              tickFormatter={metric === 'gci' ? (v) => `$${(v / 1000).toFixed(0)}k` : undefined}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar
              dataKey={metric === 'gci' ? `${prevYear}_gci` : String(prevYear)}
              name={String(prevYear)}
              fill={PREV_COLOR}
              radius={[3, 3, 0, 0]}
              opacity={0.35}
            />
            <Bar
              dataKey={metric === 'gci' ? `${currentYear}_gci` : String(currentYear)}
              name={String(currentYear)}
              fill={CURRENT_COLOR}
              radius={[3, 3, 0, 0]}
              opacity={0.85}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-2 pt-2 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full opacity-35" style={{ backgroundColor: PREV_COLOR }} />
          <span className="text-[10px] sm:text-xs text-muted-foreground">{prevYear}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CURRENT_COLOR }} />
          <span className="text-[10px] sm:text-xs text-muted-foreground">{currentYear}</span>
        </div>
      </div>

      {/* Buyer vs Seller breakdown (non-compact only) */}
      {!compact && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 mb-2">
            <Users2 className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">Buyer vs Seller Split (YTD)</span>
          </div>
          {(() => {
            const ytd = monthlyData.filter(m => m.monthDate.getFullYear() === currentYear);
            const buyers = ytd.reduce((s, m) => s + m.buyers, 0);
            const sellers = ytd.reduce((s, m) => s + m.sellers, 0);
            const total = buyers + sellers;
            return (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Buyer</span>
                    <span className="font-semibold">{buyers}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: total > 0 ? `${(buyers / total) * 100}%` : '0%' }} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Seller</span>
                    <span className="font-semibold">{sellers}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: total > 0 ? `${(sellers / total) * 100}%` : '0%' }} />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
