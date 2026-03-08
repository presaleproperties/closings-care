import { cn } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';

interface DealHeroCardProps {
  address: string;
  city?: string;
  clientName?: string;
  transactionCode?: string;
  status: 'closed' | 'active' | 'pending';
  lifecycleState?: string;
  isPresale: boolean;
  presalePart?: string;
  isListing: boolean;
  mlsNumber?: string;
  complianceStatus?: string;
  closeDate?: string;
}

export function DealHeroCard({
  address,
  city,
  clientName,
  transactionCode,
  status,
  lifecycleState,
  isPresale,
  presalePart,
  isListing,
  mlsNumber,
  complianceStatus,
  closeDate,
}: DealHeroCardProps) {
  const now = new Date();
  const isPastDue = status !== 'closed' && closeDate && new Date(closeDate) < now;
  const isCompliant = complianceStatus === 'COMPLIANT' || complianceStatus === 'NOT_APPLICABLE';

  const statusLabel = isListing
    ? status === 'closed' ? 'Sold' : 'Listing'
    : status === 'closed'
      ? 'Settled'
      : isPastDue
        ? 'Past Due'
        : 'Active';

  const statusClass = isListing
    ? 'text-warning'
    : status === 'closed'
      ? 'text-success'
      : isPastDue
        ? 'text-warning'
        : 'text-primary';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl lg:rounded-3xl border p-4 lg:p-6',
        status === 'closed' && !isListing
          ? 'bg-gradient-to-br from-success/5 to-card border-success/30'
          : isListing
            ? 'bg-gradient-to-br from-warning/5 to-card border-warning/30'
            : isPastDue
              ? 'bg-gradient-to-br from-warning/5 to-card border-warning/30'
              : 'bg-card/80 border-border/50'
      )}
    >
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 lg:w-1.5 rounded-l-2xl lg:rounded-l-3xl',
          isListing ? 'bg-warning' : status === 'closed' ? 'bg-success' : isPastDue ? 'bg-warning' : 'bg-primary'
        )}
      />

      <div className="pl-2 lg:pl-3">
        {/* Address & Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-[15px] lg:text-xl font-bold text-foreground truncate tracking-[-0.02em]">
              {address}
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              {clientName && (
                <span className="text-xs lg:text-sm font-semibold text-foreground">
                  {clientName}
                </span>
              )}
              {clientName && city && <span className="text-muted-foreground/40 text-xs">·</span>}
              {city && <span className="text-xs text-muted-foreground">{city}</span>}
              {transactionCode && (
                <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                  {transactionCode}
                </span>
              )}
            </div>
          </div>

          <span className={cn('text-xs font-semibold shrink-0', statusClass)}>
            {statusLabel}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
          {lifecycleState && (
            <span className="text-[10px] lg:text-xs text-muted-foreground">
              {lifecycleState.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </span>
          )}
          {lifecycleState && (isPresale || mlsNumber) && (
            <span className="text-muted-foreground/40 text-[10px]">·</span>
          )}
          <span className="text-[10px] lg:text-xs text-muted-foreground font-medium">
            {isPresale ? `Presale${presalePart ? ` ${presalePart}` : ''}` : 'Resale'}
          </span>
          {isListing && (
            <>
              <span className="text-muted-foreground/40 text-[10px]">·</span>
              <span className="text-[10px] lg:text-xs text-warning font-semibold">Listing</span>
            </>
          )}
          {mlsNumber && mlsNumber !== 'N/A' && (
            <>
              <span className="text-muted-foreground/40 text-[10px]">·</span>
              <span className="text-[10px] lg:text-xs font-mono text-muted-foreground">
                MLS {mlsNumber}
              </span>
            </>
          )}
          {complianceStatus && (
            <>
              <span className="text-muted-foreground/40 text-[10px]">·</span>
              <span
                className={cn(
                  'text-[10px] lg:text-xs font-medium',
                  isCompliant ? 'text-success' : 'text-destructive'
                )}
              >
                {isCompliant ? 'Compliant' : complianceStatus.replace(/_/g, ' ')}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
