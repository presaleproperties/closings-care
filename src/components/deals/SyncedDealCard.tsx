import { motion } from 'framer-motion';
import { Users, MapPin, FileText, Percent, Calendar, DollarSign, Building2 } from 'lucide-react';
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
  const springConfig = { type: 'spring' as const, stiffness: 100, damping: 20 };
  
  // Extract part info (e.g., "Part 1/2")
  const partMatch = deal.propertyAddress?.match(/Part (\d+\/\d+)/);
  const isPresale = !!partMatch;
  
  const statusColor = deal.status === 'closed' 
    ? 'from-success/20 to-success/5 border-success/30'
    : deal.status === 'active'
      ? 'from-primary/20 to-primary/5 border-primary/30'
      : 'from-warning/20 to-warning/5 border-warning/30';

  const lifecycleDisplay = deal.lifecycleState?.split('_').map(w => 
    w.charAt(0) + w.slice(1).toLowerCase()
  ).join(' ') || 'Unknown';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springConfig, delay: index * 0.05 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <div className={cn(
        'rounded-2xl border p-4 transition-all duration-300',
        'bg-gradient-to-br hover:shadow-lg hover:scale-[1.02]',
        statusColor
      )}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base truncate">
              {deal.clientName}
            </h3>
            {deal.propertyAddress && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                {deal.propertyAddress.replace(/Part \d+\/\d+\s*-\s*/, '')}
              </p>
            )}
          </div>
          
          {/* Amount badge */}
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(deal.myNetPayout || 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {deal.status === 'closed' ? 'Received' : 'Pending'}
            </p>
          </div>
        </div>

        {/* Status & Type Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {isPresale && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-building2/10 text-building2">
              <Building2 className="h-3 w-3" />
              {partMatch?.[1] || 'Presale'}
            </span>
          )}
          {deal.isListing && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-500/10 text-blue-600">
              <MapPin className="h-3 w-3" />
              Listing
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-muted text-muted-foreground">
            <FileText className="h-3 w-3" />
            {lifecycleDisplay}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-sm mb-3 pb-3 border-t border-border/30">
          {deal.firmDate && (
            <div className="flex items-center gap-2 mt-3 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="text-xs">{format(parseISO(deal.firmDate), 'MMM d')}</span>
            </div>
          )}
          {deal.mlsNumber && deal.mlsNumber !== 'N/A' && (
            <div className="flex items-center gap-2 mt-3 text-muted-foreground">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="text-xs font-mono">{deal.mlsNumber}</span>
            </div>
          )}
          {deal.salePrice && (
            <div className="flex items-center gap-2 mt-3 text-muted-foreground">
              <DollarSign className="h-4 w-4 shrink-0" />
              <span className="text-xs">{formatCurrency(deal.salePrice)}</span>
            </div>
          )}
          {deal.commissionAmount && (
            <div className="flex items-center gap-2 mt-3 text-muted-foreground">
              <Percent className="h-4 w-4 shrink-0" />
              <span className="text-xs">{formatCurrency(deal.commissionAmount)} GCI</span>
            </div>
          )}
        </div>

        {/* Participants */}
        {deal.participants.length > 0 && (
          <div className="pt-2 border-t border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground">
                {deal.participants.length} Participant{deal.participants.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-1 text-xs">
              {deal.participants
                .filter(p => p.participantRole !== 'REAL' && p.participantRole !== 'REAL_ADMIN' && !(p as any).hidden)
                .slice(0, 3)
                .map(p => (
                  <div key={p.id} className="flex items-center justify-between text-muted-foreground">
                    <span>{p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : (p.company || 'Unknown')}</span>
                    {p.payment?.percent && (
                      <span className="font-semibold text-foreground">{p.payment.percent}%</span>
                    )}
                  </div>
                ))}
              {deal.participants.length > 3 && (
                <div className="text-muted-foreground pt-1">+{deal.participants.length - 3} more</div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
