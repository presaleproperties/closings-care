import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { DealStatCard } from './DealStatCard';
import { formatCurrency } from '@/lib/format';
import { format, parseISO, differenceInDays } from 'date-fns';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.05 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3"
    >
      <DealStatCard
        label="Sale Price"
        value={formatCurrency(salePrice)}
        icon={DollarSign}
        color="text-foreground"
        iconBg="bg-muted"
      />
      <DealStatCard
        label="GCI"
        value={formatCurrency(grossCommission)}
        icon={TrendingUp}
        color="text-primary"
        iconBg="bg-primary/15"
      />
      <DealStatCard
        label="My Net Payout"
        value={formatCurrency(netPayout)}
        icon={DollarSign}
        color="text-success"
        iconBg="bg-success/15"
        subtitle={splitPercent ? `${(splitPercent * 100).toFixed(0)}% split` : undefined}
      />
      <DealStatCard
        label={isClosed ? 'Closed' : isPastDue ? 'Was Due' : 'Close Date'}
        value={closeDate ? format(parseISO(closeDate), 'MMM d, yyyy') : '—'}
        icon={Calendar}
        color={isPastDue ? 'text-amber-600' : 'text-foreground'}
        iconBg={isPastDue ? 'bg-amber-500/15' : 'bg-muted'}
        subtitle={
          daysUntilClose !== null && !isClosed
            ? daysUntilClose < 0
              ? `${Math.abs(daysUntilClose)}d overdue`
              : `${daysUntilClose}d away`
            : undefined
        }
      />
    </motion.div>
  );
}
