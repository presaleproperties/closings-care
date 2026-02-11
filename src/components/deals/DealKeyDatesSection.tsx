import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import { format, parseISO } from 'date-fns';

const spring = { type: 'spring' as const, stiffness: 120, damping: 20 };

interface KeyDatesSectionProps {
  firmDate?: string;
  closeDate?: string;
  listingDate?: string;
  closedAt?: string;
  compliantAt?: string;
  isPastDue: boolean;
}

export function DealKeyDatesSection({
  firmDate,
  closeDate,
  listingDate,
  closedAt,
  compliantAt,
  isPastDue,
}: KeyDatesSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.1 }}
    >
      <CollapsibleSection icon={Calendar} title="Key Dates" defaultOpen={true}>
        <div className="space-y-2.5">
          {firmDate && <DateRow label="Firm Date" date={firmDate} />}
          {closeDate && <DateRow label="Close Date" date={closeDate} highlight={isPastDue} />}
          {listingDate && <DateRow label="Listing Date" date={listingDate} />}
          {closedAt && <DateRow label="Settled" date={format(new Date(closedAt), 'yyyy-MM-dd')} />}
          {compliantAt && (
            <DateRow label="Compliant Since" date={format(new Date(compliantAt), 'yyyy-MM-dd')} />
          )}
        </div>
      </CollapsibleSection>
    </motion.div>
  );
}

function DateRow({
  label,
  date,
  highlight,
}: {
  label: string;
  date: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs lg:text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-xs lg:text-sm font-medium ${
          highlight ? 'text-amber-600' : 'text-foreground'
        }`}
      >
        {format(parseISO(date), 'MMM d, yyyy')}
      </span>
    </div>
  );
}
