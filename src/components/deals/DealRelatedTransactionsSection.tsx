import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CollapsibleSection } from './CollapsibleSection';
import { formatCurrency } from '@/lib/format';
import { extractNetPayout } from '@/lib/transactionUtils';
import { format, parseISO } from 'date-fns';

const spring = { type: 'spring' as const, stiffness: 120, damping: 20 };

interface SyncedTransaction {
  id: string;
  property_address?: string;
  status: string;
  close_date?: string;
  raw_data?: any;
}

interface RelatedTransactionsSectionProps {
  journeyId?: string;
  currentId: string;
  allTransactions: SyncedTransaction[];
}

function extractNetPayoutLocal(rawData: any): number {
  return extractNetPayout(rawData, 0);
}

export function DealRelatedTransactionsSection({
  journeyId,
  currentId,
  allTransactions,
}: RelatedTransactionsSectionProps) {
  if (!journeyId) return null;

  const relatedTransactions = allTransactions.filter(
    (tx) => tx.raw_data?.journeyId === journeyId && tx.id !== currentId
  );

  if (relatedTransactions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.25 }}
    >
      <CollapsibleSection icon={ExternalLink} title="Related Transactions" defaultOpen={true}>
        <div className="space-y-2">
          {relatedTransactions.map((tx) => {
            const partInfo = tx.property_address?.match(/Part (\d+\/\d+)/);
            return (
              <Link
                key={tx.id}
                to={`/deals/${tx.id}`}
                className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 active:bg-muted/50 transition-colors touch-manipulation"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {partInfo ? `Part ${partInfo[1]}` : tx.property_address || 'Related Deal'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx.status === 'closed' ? 'Settled' : 'Active'}
                    {tx.close_date && ` · ${format(parseISO(tx.close_date), 'MMM d, yyyy')}`}
                  </p>
                </div>
                <span className="text-sm font-bold text-foreground ml-3">
                  {formatCurrency(extractNetPayoutLocal(tx.raw_data))}
                </span>
              </Link>
            );
          })}
        </div>
      </CollapsibleSection>
    </motion.div>
  );
}
