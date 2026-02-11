import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';

const spring = { type: 'spring' as const, stiffness: 120, damping: 20 };

interface TransactionDetailsSectionProps {
  transactionType?: string;
  propertyType?: string;
  currency?: string;
  kind?: string;
  lifecycleDesc?: string;
  leadSource?: string;
  agentName?: string;
}

export function DealTransactionDetailsSection({
  transactionType,
  propertyType,
  currency,
  kind,
  lifecycleDesc,
  leadSource,
  agentName,
}: TransactionDetailsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.15 }}
    >
      <CollapsibleSection icon={FileText} title="Transaction Details" defaultOpen={true}>
        <div className="space-y-2.5">
          <DetailRow label="Type" value={transactionType || '—'} />
          <DetailRow label="Property Type" value={propertyType || '—'} />
          <DetailRow label="Currency" value={currency || 'CAD'} />
          {kind && <DetailRow label="Kind" value={kind} />}
          {lifecycleDesc && <DetailRow label="Status Info" value={lifecycleDesc} />}
          {leadSource && <DetailRow label="Lead Source" value={leadSource} />}
          {agentName && <DetailRow label="Agent" value={agentName} />}
        </div>
      </CollapsibleSection>
    </motion.div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs lg:text-sm text-muted-foreground">{label}</span>
      <span className="text-xs lg:text-sm font-medium text-foreground text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  );
}
