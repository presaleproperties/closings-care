import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/format';
import { format, parseISO, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

const spring = { type: 'spring' as const, stiffness: 120, damping: 20 };

interface DealStatsGridProps {
  salePrice: number;
  grossCommission: number;
  netPayout: number;
  splitPercent?: number;
  closeDate?: string;
  isClosed: boolean;
  isPastDue: boolean;
}

export function DealStatsGrid({
  salePrice,
  grossCommission,
  netPayout,
  splitPercent,
  closeDate,
  isClosed,
  isPastDue,
}: DealStatsGridProps) {
  const daysUntilClose =
    closeDate && !isClosed ? differenceInDays(parseISO(closeDate), new Date()) : null;

  const stats = [
    {
      label: 'Sale Price',
      value: formatCurrency(salePrice),
      valueClass: 'text-foreground',
      sub: null,
    },
    {
      label: 'GCI',
      value: formatCurrency(grossCommission),
      valueClass: 'text-primary',
      sub: null,
    },
    {
      label: 'My Net Payout',
      value: formatCurrency(netPayout),
      valueClass: 'text-success',
      sub: splitPercent ? `${(splitPercent * 100).toFixed(0)}% split` : null,
    },
    {
      label: isClosed ? 'Closed' : isPastDue ? 'Was Due' : 'Close Date',
      value: closeDate ? format(parseISO(closeDate), 'MMM d, yyyy') : '—',
      valueClass: isPastDue ? 'text-warning' : 'text-foreground',
      sub:
        daysUntilClose !== null && !isClosed
          ? daysUntilClose < 0
            ? `${Math.abs(daysUntilClose)}d overdue`
            : `${daysUntilClose}d away`
          : null,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.05 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3"
    >
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-border/50 bg-card/80 px-4 py-3"
        >
          <p className="metric-label mb-1.5">{s.label}</p>
          <p className={cn('text-base lg:text-lg font-bold tracking-tight', s.valueClass)}>
            {s.value}
          </p>
          {s.sub && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
          )}
        </div>
      ))}
    </motion.div>
  );
}
