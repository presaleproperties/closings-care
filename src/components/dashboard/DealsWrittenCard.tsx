import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PenLine, TrendingUp, TrendingDown, Users2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from '@/components/ui/animated-number';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, isWithinInterval } from 'date-fns';
import { getEffectiveCommission, isPresaleTransaction } from '@/hooks/useAnalyticsData';

type Grouping = 'monthly' | 'quarterly';

interface DealsWrittenCardProps {
  syncedTransactions: any[];
  compact?: boolean;
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="bg-popover/95 backdrop-blur-xl border border-border/50 rounded-xl p-3 shadow-xl min-w-[180px]">
      <p className="font-semibold text-sm mb-2">{data?.fullLabel || label}</p>
      <div className="space-y-1 text-xs">
        <p className="flex justify-between"><span className="text-muted-foreground">Deals Written</span><span className="font-bold">{data?.count}</span></p>
        <p className="flex justify-between"><span className="text-muted-foreground">GCI</span><span className="font-bold text-emerald-600">{formatCurrency(data?.gci)}</span></p>
        <p className="flex justify-between"><span className="text-muted-foreground">Net Payout</span><span className="font-bold">{formatCurrency(data?.net)}</span></p>
        <p className="flex justify-between"><span className="text-muted-foreground">Avg Deal</span><span className="font-bold">{formatCurrency(data?.avgDeal)}</span></p>
        {data?.buyers > 0 && <p className="flex justify-between"><span className="text-muted-foreground">Buyer Deals</span><span>{data?.buyers}</span></p>}
        {data?.sellers > 0 && <p className="flex justify-between"><span className="text-muted-foreground">Seller Deals</span><span>{data?.sellers}</span></p>}
      </div>
    </div>
  );
};

export function useDealsWrittenData(syncedTransactions: any[]) {
  return useMemo(() => {
    // Only include transactions with a firm_date
    const txsWithFirmDate = syncedTransactions.filter(tx => tx.firm_date);
    if (txsWithFirmDate.length === 0) return [];

    // Find date range
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

function groupByQuarter(monthlyData: ReturnType<typeof useDealsWrittenData>) {
  const quarters: Record<string, typeof monthlyData> = {};
  monthlyData.forEach(m => {
    const q = Math.ceil((m.monthDate.getMonth() + 1) / 3);
    const key = `${m.monthDate.getFullYear()}-Q${q}`;
    if (!quarters[key]) quarters[key] = [];
    quarters[key].push(m);
  });

  return Object.entries(quarters).map(([key, months]) => ({
    label: key.replace('-', ' '),
    fullLabel: key.replace('-', ' '),
    count: months.reduce((s, m) => s + m.count, 0),
    gci: months.reduce((s, m) => s + m.gci, 0),
    net: months.reduce((s, m) => s + m.net, 0),
    avgDeal: months.reduce((s, m) => s + m.count, 0) > 0
      ? months.reduce((s, m) => s + m.gci, 0) / months.reduce((s, m) => s + m.count, 0) : 0,
    buyers: months.reduce((s, m) => s + m.buyers, 0),
    sellers: months.reduce((s, m) => s + m.sellers, 0),
  }));
}

export function DealsWrittenCard({ syncedTransactions, compact = false }: DealsWrittenCardProps) {
  const [grouping, setGrouping] = useState<Grouping>('monthly');
  const monthlyData = useDealsWrittenData(syncedTransactions);

  const chartData = useMemo(() => {
    if (grouping === 'quarterly') return groupByQuarter(monthlyData);
    return monthlyData;
  }, [monthlyData, grouping]);

  // Current period stats
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const ytdData = monthlyData.filter(m => m.monthDate.getFullYear() === currentYear);
  const ytdDeals = ytdData.reduce((s, m) => s + m.count, 0);
  const ytdGci = ytdData.reduce((s, m) => s + m.gci, 0);

  // Previous year same period
  const prevYtdData = monthlyData.filter(m =>
    m.monthDate.getFullYear() === currentYear - 1 && m.monthDate.getMonth() <= currentMonth
  );
  const prevYtdDeals = prevYtdData.reduce((s, m) => s + m.count, 0);
  const yoyChange = prevYtdDeals > 0 ? ((ytdDeals - prevYtdDeals) / prevYtdDeals) * 100 : 0;

  // Monthly average this year
  const monthsElapsed = currentMonth + 1;
  const avgPerMonth = monthsElapsed > 0 ? ytdDeals / monthsElapsed : 0;

  if (monthlyData.length === 0) return null;

  // For compact mode (dashboard), show last 12 months
  const displayData = compact ? chartData.slice(-12) : chartData;

  return (
    <div className="landing-card p-3 sm:p-4 lg:p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
            <PenLine className="w-3.5 h-3.5 text-primary" />
            Deals Written
          </h3>
          <p className="text-[10px] sm:text-xs text-muted-foreground">By firm date</p>
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

      {/* Summary Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-primary/8 to-primary/3 rounded-xl p-2.5 border border-primary/10">
          <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">YTD Written</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <AnimatedNumber value={ytdDeals} className="text-lg sm:text-xl font-bold" duration={0.8} />
            {prevYtdDeals > 0 && (
              <span className={cn(
                "text-[10px] font-semibold flex items-center",
                yoyChange >= 0 ? "text-emerald-600" : "text-rose-600"
              )}>
                {yoyChange >= 0 ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
                {Math.abs(yoyChange).toFixed(0)}%
              </span>
            )}
          </div>
        </div>
        <div className="bg-muted/30 rounded-xl p-2.5 border border-border/30">
          <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">YTD GCI</p>
          <p className="text-sm sm:text-base font-bold text-emerald-600 mt-0.5">{formatCurrency(ytdGci)}</p>
        </div>
        <div className="bg-muted/30 rounded-xl p-2.5 border border-border/30">
          <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">Avg / Month</p>
          <p className="text-sm sm:text-base font-bold mt-0.5">{avgPerMonth.toFixed(1)}</p>
        </div>
        {!compact && (
          <div className="hidden sm:block bg-muted/30 rounded-xl p-2.5 border border-border/30">
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">All-Time</p>
            <p className="text-sm sm:text-base font-bold mt-0.5">{monthlyData.reduce((s, m) => s + m.count, 0)}</p>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className={cn("w-full", compact ? "h-40" : "h-56 sm:h-64")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: compact ? 9 : 10 }}
              tickLine={false}
              axisLine={false}
              interval={compact ? 'preserveStartEnd' : 0}
              angle={displayData.length > 18 ? -45 : 0}
              textAnchor={displayData.length > 18 ? 'end' : 'middle'}
              height={displayData.length > 18 ? 50 : 30}
            />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} width={25} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="count" name="Deals Written" radius={[4, 4, 0, 0]}>
              {displayData.map((entry: any, i: number) => (
                <Cell
                  key={i}
                  fill={entry.count === 0 ? 'hsl(var(--muted))' : 'hsl(158, 64%, 42%)'}
                  opacity={entry.count === 0 ? 0.3 : 0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Buyer vs Seller breakdown (non-compact only) */}
      {!compact && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 mb-2">
            <Users2 className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">Buyer vs Seller Split (YTD)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Buyer</span>
                <span className="font-semibold">{ytdData.reduce((s, m) => s + m.buyers, 0)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{
                    width: ytdDeals > 0
                      ? `${(ytdData.reduce((s, m) => s + m.buyers, 0) / ytdDeals) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Seller</span>
                <span className="font-semibold">{ytdData.reduce((s, m) => s + m.sellers, 0)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{
                    width: ytdDeals > 0
                      ? `${(ytdData.reduce((s, m) => s + m.sellers, 0) / ytdDeals) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
