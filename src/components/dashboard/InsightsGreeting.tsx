import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarRange, MapPin, DollarSign, TrendingUp, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { addMonths, format, isAfter, isBefore, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { formatCurrency } from '@/lib/format';

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
  const thisYear = now.getFullYear();

  const closedThisYear = syncedTransactions.filter((t: any) => t.status === 'closed' && t.close_date && new Date(t.close_date).getFullYear() === thisYear).length;
  const activeDeals = syncedTransactions.filter((t: any) => t.status === 'active').length;

  const outlook = useMemo(() => {
    const months = [0, 1, 2].map(offset => {
      const monthStart = startOfMonth(addMonths(now, offset));
      const monthEnd = endOfMonth(addMonths(now, offset));

      const deals = syncedTransactions.filter((tx: any) => {
        if (!tx.close_date || tx.status !== 'active') return false;
        const d = parseISO(tx.close_date);
        return isWithinInterval(d, { start: monthStart, end: monthEnd });
      });

      const commission = deals.reduce((sum: number, tx: any) => sum + Number(tx.commission_amount || 0), 0);

      return {
        label: format(monthStart, 'MMM'),
        deals,
        commission,
        total: commission + revShareMonthlyAvg,
      };
    });

    const totalCommission = months.reduce((s, m) => s + m.commission, 0);
    const totalDeals = months.reduce((s, m) => s + m.deals.length, 0);

    return { months, totalCommission, totalDeals, projectedRevShare3mo: revShareMonthlyAvg * 3 };
  }, [syncedTransactions, now, revShareMonthlyAvg]);

  return (
    <Card className="border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden">
      {/* Greeting */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <CalendarRange className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">{greeting}, {displayName}</h2>
          <p className="text-xs text-muted-foreground">
            {closedThisYear} closed, {activeDeals} active in {thisYear} · {formatCurrency(receivedYTD)} earned YTD
          </p>
        </div>
      </div>

      {/* 3 month columns */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {outlook.months.map((month, i) => (
            <motion.div
              key={month.label}
              className="space-y-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{month.label}</span>
                <span className="text-[10px] text-muted-foreground/60">
                  {month.deals.length} deal{month.deals.length !== 1 ? 's' : ''}
                </span>
              </div>

              <p className="text-lg font-bold text-foreground">{formatCurrency(month.total)}</p>

              {month.deals.length > 0 ? (
                <div className="space-y-1">
                  {month.deals.slice(0, 2).map((deal: any) => (
                    <p key={deal.id} className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5 shrink-0 text-muted-foreground/50" />
                      {deal.property_address || deal.client_name || 'Deal'}
                    </p>
                  ))}
                  {month.deals.length > 2 && (
                    <p className="text-[10px] text-muted-foreground/50">+{month.deals.length - 2} more</p>
                  )}
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground/40">No closings</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom summary */}
      <div className="border-t border-border/30 px-5 py-3 flex items-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5" />
          <span className="font-semibold text-foreground">{outlook.totalDeals}</span> closing
        </span>
        <span className="flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5" />
          <span className="font-semibold text-foreground">{formatCurrency(outlook.totalCommission)}</span> GCI
        </span>
        <span className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" />
          <span className="font-semibold text-foreground">{formatCurrency(outlook.projectedRevShare3mo)}</span> RevShare
        </span>
      </div>
    </Card>
  );
}
