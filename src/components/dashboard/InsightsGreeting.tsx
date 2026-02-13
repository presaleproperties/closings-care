import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarRange, MapPin, DollarSign, TrendingUp, Briefcase, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { addMonths, format, isAfter, isBefore, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

interface InsightsGreetingProps {
  syncedTransactions: any[];
  revenueShare?: any[];
  userName?: string;
  receivedYTD?: number;
  revShareMonthlyAvg?: number;
}

export function InsightsGreeting({ syncedTransactions, revenueShare = [], userName, receivedYTD = 0, revShareMonthlyAvg = 0 }: InsightsGreetingProps) {
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const displayName = userName || 'there';

  const outlook = useMemo(() => {
    const month1Start = startOfMonth(now);
    const month1End = endOfMonth(now);
    const month2Start = startOfMonth(addMonths(now, 1));
    const month2End = endOfMonth(addMonths(now, 1));
    const month3Start = startOfMonth(addMonths(now, 2));
    const month3End = endOfMonth(addMonths(now, 2));
    const threeMonthEnd = month3End;

    // Get deals closing in the next 3 months (active ones with close dates)
    const upcomingDeals = syncedTransactions.filter((tx: any) => {
      if (!tx.close_date) return false;
      const closeDate = parseISO(tx.close_date);
      return tx.status === 'active' && isAfter(closeDate, now) && isBefore(closeDate, addMonths(now, 3));
    });

    // Deals per month
    const month1Deals = upcomingDeals.filter((tx: any) => {
      const d = parseISO(tx.close_date);
      return isAfter(d, month1Start) && isBefore(d, month1End) || d.getTime() === month1Start.getTime() || d.getTime() === month1End.getTime();
    });
    const month2Deals = upcomingDeals.filter((tx: any) => {
      const d = parseISO(tx.close_date);
      return isAfter(d, month2Start) && isBefore(d, month2End) || d.getTime() === month2Start.getTime() || d.getTime() === month2End.getTime();
    });
    const month3Deals = upcomingDeals.filter((tx: any) => {
      const d = parseISO(tx.close_date);
      return isAfter(d, month3Start) && isBefore(d, month3End) || d.getTime() === month3Start.getTime() || d.getTime() === month3End.getTime();
    });

    const getMonthCommission = (deals: any[]) => 
      deals.reduce((sum: number, tx: any) => sum + Number(tx.commission_amount || 0), 0);

    const totalCommission = getMonthCommission(upcomingDeals);
    const projectedRevShare3mo = revShareMonthlyAvg * 3;
    const total3mo = totalCommission + projectedRevShare3mo;

    const months = [
      { label: format(month1Start, 'MMM'), deals: month1Deals, commission: getMonthCommission(month1Deals) },
      { label: format(month2Start, 'MMM'), deals: month2Deals, commission: getMonthCommission(month2Deals) },
      { label: format(month3Start, 'MMM'), deals: month3Deals, commission: getMonthCommission(month3Deals) },
    ];

    // Find the month with max combined value for bar scaling
    const maxMonthValue = Math.max(
      ...months.map(m => m.commission + revShareMonthlyAvg),
      1 // prevent division by zero
    );

    return {
      upcomingDeals,
      totalCommission,
      projectedRevShare3mo,
      total3mo,
      months,
      maxMonthValue,
    };
  }, [syncedTransactions, now, revShareMonthlyAvg]);

  const thisYear = now.getFullYear();
  const closedThisYear = syncedTransactions.filter((t: any) => t.status === 'closed' && t.close_date && new Date(t.close_date).getFullYear() === thisYear).length;
  const activeDeals = syncedTransactions.filter((t: any) => t.status === 'active').length;

  return (
    <Card className="p-0 border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CalendarRange className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {greeting}, {displayName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {closedThisYear} closed, {activeDeals} active in {thisYear} · {formatCurrency(receivedYTD)} earned YTD
            </p>
          </div>
        </div>
      </div>

      {/* 3-Month Outlook */}
      <div className="px-5 pb-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">3-Month Outlook</span>
        </div>

        {/* Monthly bars */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {outlook.months.map((month, i) => {
            const commPct = outlook.maxMonthValue > 0 ? (month.commission / outlook.maxMonthValue) * 100 : 0;
            const revPct = outlook.maxMonthValue > 0 ? (revShareMonthlyAvg / outlook.maxMonthValue) * 100 : 0;
            const totalMonth = month.commission + revShareMonthlyAvg;

            return (
              <motion.div
                key={month.label}
                className="rounded-2xl border border-border/40 bg-muted/30 p-3 space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground uppercase">{month.label}</span>
                  <span className="text-[10px] text-muted-foreground">{month.deals.length} deal{month.deals.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Stacked bar */}
                <div className="h-20 flex flex-col justify-end gap-0.5">
                  {month.commission > 0 && (
                    <motion.div
                      className="rounded-t-md bg-emerald-500/80 w-full"
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(commPct, 4)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                    />
                  )}
                  {revShareMonthlyAvg > 0 && (
                    <motion.div
                      className={cn(
                        "w-full bg-blue-500/60",
                        month.commission > 0 ? "rounded-b-md" : "rounded-md"
                      )}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(revPct, 4)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 + 0.1 }}
                    />
                  )}
                  {month.commission === 0 && revShareMonthlyAvg === 0 && (
                    <div className="rounded-md bg-muted/50 w-full h-[4%]" />
                  )}
                </div>

                <p className="text-sm font-bold text-foreground">{formatCurrency(totalMonth)}</p>
                {month.deals.length > 0 && (
                  <div className="space-y-0.5">
                    {month.deals.slice(0, 2).map((deal: any) => (
                      <p key={deal.id} className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5 shrink-0" />
                        {deal.property_address || deal.client_name || 'Deal'}
                      </p>
                    ))}
                    {month.deals.length > 2 && (
                      <p className="text-[10px] text-muted-foreground/60">+{month.deals.length - 2} more</p>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Briefcase className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">Deals</span>
            </div>
            <p className="text-lg font-bold text-foreground">{outlook.upcomingDeals.length}</p>
            <p className="text-[10px] text-muted-foreground">Closing soon</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">Commissions</span>
            </div>
            <p className="text-lg font-bold text-foreground">{formatCurrency(outlook.totalCommission)}</p>
            <p className="text-[10px] text-muted-foreground">Projected GCI</p>
          </div>
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">RevShare</span>
            </div>
            <p className="text-lg font-bold text-foreground">{formatCurrency(outlook.projectedRevShare3mo)}</p>
            <p className="text-[10px] text-muted-foreground">Est. 3-month</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80" />
            <span className="text-[10px] text-muted-foreground">Commissions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-500/60" />
            <span className="text-[10px] text-muted-foreground">RevShare (est.)</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
