import { MapPin, Building2, Home, Shield, Clock, AlertTriangle, CheckCircle2, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  const daysUntilClose = closeDate ? differenceInDays(parseISO(closeDate), now) : null;
  const isCompliant = complianceStatus === 'COMPLIANT' || complianceStatus === 'NOT_APPLICABLE';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl lg:rounded-3xl border p-4 lg:p-6',
        status === 'closed'
          ? 'bg-gradient-to-br from-emerald-500/5 to-card border-emerald-500/30'
          : isPastDue
            ? 'bg-gradient-to-br from-amber-500/5 to-card border-amber-500/30'
            : 'bg-card/80 border-border/50'
      )}
    >
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 lg:w-1.5 rounded-l-2xl lg:rounded-l-3xl',
          status === 'closed' ? 'bg-success' : isPastDue ? 'bg-amber-500' : 'bg-primary'
        )}
      />

      <div className="pl-2 lg:pl-3">
        {/* Address & Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-primary shrink-0" />
              <h1 className="text-[15px] lg:text-xl font-bold text-foreground truncate">{address}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 ml-6 lg:ml-7">
              {clientName && (
                <span className="flex items-center gap-1 text-xs lg:text-sm font-semibold text-foreground">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  {clientName}
                </span>
              )}
              {clientName && city && <span className="text-muted-foreground/40">·</span>}
              {city && <span className="text-xs text-muted-foreground">{city}</span>}
              {transactionCode && (
                <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                  {transactionCode}
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0">
            {status === 'closed' ? (
              <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1 px-2 lg:px-3 py-1 lg:py-1.5 text-[11px]">
                <CheckCircle2 className="h-3 w-3" /> Settled
              </Badge>
            ) : isPastDue ? (
              <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 gap-1 px-2 lg:px-3 py-1 lg:py-1.5 text-[11px]">
                <AlertTriangle className="h-3 w-3" /> Past Due
              </Badge>
            ) : (
              <Badge className="bg-primary/15 text-primary border-primary/30 gap-1 px-2 lg:px-3 py-1 lg:py-1.5 text-[11px]">
                <Clock className="h-3 w-3" /> Active
              </Badge>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 ml-6 lg:ml-7">
          {lifecycleState && (
            <span className="text-[10px] lg:text-xs px-2 py-0.5 lg:py-1 rounded-lg bg-muted/60 text-muted-foreground font-medium">
              {lifecycleState.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </span>
          )}
          {isPresale && (
            <span className="text-[10px] lg:text-xs px-2 py-0.5 lg:py-1 rounded-lg bg-amber-500/10 text-amber-700 font-medium flex items-center gap-1">
              <Building2 className="h-3 w-3" /> Presale {presalePart}
            </span>
          )}
          {!isPresale && (
            <span className="text-[10px] lg:text-xs px-2 py-0.5 lg:py-1 rounded-lg bg-blue-500/10 text-blue-600 font-medium flex items-center gap-1">
              <Home className="h-3 w-3" /> Resale
            </span>
          )}
          {isListing && (
            <span className="text-[10px] lg:text-xs px-2 py-0.5 lg:py-1 rounded-lg bg-violet-500/10 text-violet-600 font-medium">
              Listing
            </span>
          )}
          {mlsNumber && mlsNumber !== 'N/A' && (
            <span className="text-[10px] lg:text-xs px-2 py-0.5 lg:py-1 rounded-lg bg-muted/40 text-muted-foreground font-mono">
              MLS {mlsNumber}
            </span>
          )}
          {complianceStatus && (
            <span
              className={cn(
                'text-[10px] lg:text-xs px-2 py-0.5 lg:py-1 rounded-lg font-medium flex items-center gap-1',
                isCompliant ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'
              )}
            >
              <Shield className="h-3 w-3" />
              {isCompliant ? 'Compliant' : complianceStatus.replace(/_/g, ' ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
