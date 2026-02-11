import { motion } from 'framer-motion';
import { Users, MapPin, FileText, Calendar, DollarSign, Building2, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { SyncedDeal } from '@/hooks/useSyncedDeals';

interface SyncedDealCardProps {
  deal: SyncedDeal;
  index?: number;
  onClick?: () => void;
}

export function SyncedDealCard({ deal, index = 0, onClick }: SyncedDealCardProps) {
  // Extract part info (e.g., "Part 1/2")
  const partMatch = deal.propertyAddress?.match(/Part (\d+\/\d+)/);
  const isPresale = !!partMatch;

  // Clean address: strip "Part X/Y - " prefix
  const cleanAddress = deal.propertyAddress
    ? deal.propertyAddress.replace(/Part \d+\/\d+\s*-\s*/, '').trim()
    : null;
  const displayAddress = cleanAddress || 'Unknown';

  const lifecycleDisplay = deal.lifecycleState
    ?.split('_')
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ') || null;

  // Status indicator color
  const statusIndicator =
    deal.status === 'closed'
      ? 'bg-success'
      : deal.status === 'active'
        ? 'bg-primary'
        : 'bg-amber-500';

  // Visible participants (filter out REAL / REAL_ADMIN)
  const visibleParticipants = deal.participants.filter(
    p => p.participantRole !== 'REAL' && p.participantRole !== 'REAL_ADMIN' && !(p as any).hidden
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 22, delay: index * 0.03 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 transition-all duration-200 hover:bg-card/90 hover:shadow-md hover:border-border/80">
        {/* Status indicator bar */}
        <div className={cn('absolute left-0 top-4 bottom-4 w-1 rounded-full', statusIndicator)} />

        <div className="pl-3">
          {/* Row 1: Address + Amount */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <h3 className="font-bold text-sm text-foreground truncate">
                  {displayAddress}
                </h3>
              </div>
              {deal.clientName && deal.clientName !== 'Unknown' && (
                <p className="text-xs text-muted-foreground mt-0.5 ml-6 truncate">
                  {deal.clientName}
                </p>
              )}
            </div>

            <div className="text-right shrink-0">
              <p className="text-base font-bold text-foreground">
                {formatCurrency(deal.myNetPayout || 0)}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {deal.status === 'closed' ? 'Received' : 'Net'}
              </p>
            </div>
          </div>

          {/* Row 2: Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {lifecycleDisplay && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-medium">
                {lifecycleDisplay}
              </span>
            )}
            {isPresale && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 font-medium">
                <Building2 className="h-2.5 w-2.5" />
                {partMatch?.[1]}
              </span>
            )}
            {deal.isListing && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                Listing
              </span>
            )}
            {deal.mlsNumber && deal.mlsNumber !== 'N/A' && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-muted/40 text-muted-foreground font-mono">
                MLS {deal.mlsNumber}
              </span>
            )}
          </div>

          {/* Row 3: Metrics */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {deal.salePrice != null && deal.salePrice > 0 && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 shrink-0" />
                <span>{formatCurrency(deal.salePrice)}</span>
              </div>
            )}
            {deal.commissionAmount != null && deal.commissionAmount > 0 && (
              <div className="flex items-center gap-1">
                <span className="font-semibold text-foreground">
                  {formatCurrency(deal.commissionAmount)}
                </span>
                <span>GCI</span>
              </div>
            )}
            {deal.firmDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 shrink-0" />
                <span>{format(parseISO(deal.firmDate), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>

          {/* Row 4: Participants (compact) */}
          {visibleParticipants.length > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
              <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <div className="flex-1 text-xs text-muted-foreground truncate">
                {visibleParticipants.slice(0, 2).map(p => {
                  const name = p.firstName && p.lastName
                    ? `${p.firstName} ${p.lastName}`
                    : p.company || 'Unknown';
                  const pct = p.payment?.percent ? ` (${p.payment.percent}%)` : '';
                  return name + pct;
                }).join(' · ')}
                {visibleParticipants.length > 2 && ` +${visibleParticipants.length - 2}`}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 group-hover:text-foreground transition-colors" />
            </div>
          )}

          {/* No participants - still show chevron */}
          {visibleParticipants.length === 0 && (
            <div className="flex justify-end mt-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-foreground/60 transition-colors" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
