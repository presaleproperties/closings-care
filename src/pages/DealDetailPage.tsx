import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Building2,
  Home,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Shield,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSyncedTransactions } from '@/hooks/usePlatformConnections';
import { formatCurrency } from '@/lib/format';
import { format, parseISO, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';
import { CollapsibleSection } from '@/components/deals/CollapsibleSection';
import { DealStatCard } from '@/components/deals/DealStatCard';
import { ParticipantCard, type Participant } from '@/components/deals/ParticipantCard';

const spring = { type: "spring" as const, stiffness: 120, damping: 20 };

function extractNetPayout(rawData: any): number {
  try {
    return Number(rawData?.myNetPayout?.amount) || 0;
  } catch {
    return 0;
  }
}

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: syncedTransactions = [], isLoading } = useSyncedTransactions();

  const transaction = useMemo(
    () => syncedTransactions.find(tx => tx.id === id),
    [syncedTransactions, id]
  );

  const nav = useMemo(() => {
    if (!id || syncedTransactions.length === 0) return { prev: null, next: null, idx: 0, total: 0 };
    const idx = syncedTransactions.findIndex(tx => tx.id === id);
    return {
      prev: idx > 0 ? syncedTransactions[idx - 1].id : null,
      next: idx < syncedTransactions.length - 1 ? syncedTransactions[idx + 1].id : null,
      idx: idx + 1,
      total: syncedTransactions.length,
    };
  }, [id, syncedTransactions]);

  if (isLoading) {
    return (
      <AppLayout>
        <Header title="Loading..." />
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/20" />
            <p className="text-sm text-muted-foreground">Loading deal...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!transaction) {
    return (
      <AppLayout>
        <Header title="Deal Not Found" />
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground mb-4">This deal could not be found.</p>
          <Button asChild><Link to="/deals">Back to Deals</Link></Button>
        </div>
      </AppLayout>
    );
  }

  const raw = transaction.raw_data || {};
  const participants: Participant[] = raw.participants || [];
  const visibleParticipants = participants.filter(p => !p.hidden && p.participantRole !== 'REAL' && p.participantRole !== 'REAL_ADMIN');
  const netPayout = extractNetPayout(raw);
  const grossCommission = transaction.commission_amount || 0;
  const salePrice = transaction.sale_price || 0;
  const isClosed = transaction.status === 'closed';
  const isListing = transaction.is_listing;
  const partMatch = transaction.property_address?.match(/Part (\d+\/\d+)/);
  const isPresale = !!partMatch;
  const cleanAddress = transaction.property_address
    ? transaction.property_address.replace(/Part \d+\/\d+\s*-\s*/, '').trim()
    : 'Unknown';

  const lifecycleState = raw.lifecycleState?.state || transaction.lifecycle_state || null;
  const lifecycleDesc = raw.lifecycleState?.description || null;
  const complianceStatus = raw.complianceStatus || transaction.compliance_status;
  const isCompliant = complianceStatus === 'COMPLIANT' || complianceStatus === 'NOT_APPLICABLE';
  const transactionCode = raw.code || transaction.transaction_code;
  const firmDate = raw.firmDate || transaction.firm_date;
  const closeDate = transaction.close_date;
  const listingDate = transaction.listing_date;

  const now = new Date();
  const isPastDue = !isClosed && closeDate && new Date(closeDate) < now;
  const daysUntilClose = closeDate ? differenceInDays(parseISO(closeDate), now) : null;

  return (
    <AppLayout>
      <Header
        title="Deal Details"
        action={
          <div className="flex items-center gap-1.5 lg:gap-2">
            {/* Touch-friendly navigation */}
            <div className="flex items-center gap-0.5 lg:gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 lg:h-9 lg:w-9 rounded-xl touch-manipulation"
                disabled={!nav.prev}
                onClick={() => { triggerHaptic('light'); navigate(`/deals/${nav.prev}`); }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground px-1.5 lg:px-2 min-w-[45px] text-center tabular-nums">
                {nav.idx}/{nav.total}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 lg:h-9 lg:w-9 rounded-xl touch-manipulation"
                disabled={!nav.next}
                onClick={() => { triggerHaptic('light'); navigate(`/deals/${nav.next}`); }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              onClick={() => { triggerHaptic('light'); navigate('/deals'); }}
              className="gap-1.5 rounded-xl h-10 lg:h-9 px-3 touch-manipulation"
            >
              <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
        }
      />

      <div className="p-3 lg:p-6 max-w-5xl mx-auto space-y-3 lg:space-y-5 pb-24 lg:pb-6">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className={cn(
            "relative overflow-hidden rounded-2xl lg:rounded-3xl border p-4 lg:p-6",
            isClosed
              ? "bg-gradient-to-br from-emerald-500/5 to-card border-emerald-500/30"
              : isPastDue
                ? "bg-gradient-to-br from-amber-500/5 to-card border-amber-500/30"
                : "bg-card/80 border-border/50"
          )}
        >
          <div className={cn("absolute left-0 top-0 bottom-0 w-1 lg:w-1.5 rounded-l-2xl lg:rounded-l-3xl",
            isClosed ? "bg-success" : isPastDue ? "bg-amber-500" : "bg-primary"
          )} />

          <div className="pl-2 lg:pl-3">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-primary shrink-0" />
                  <h1 className="text-[15px] lg:text-xl font-bold text-foreground truncate">{cleanAddress}</h1>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 ml-6 lg:ml-7">
                  {transaction.city && (
                    <span className="text-xs text-muted-foreground">{transaction.city}</span>
                  )}
                  {transactionCode && (
                    <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                      {transactionCode}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                {isClosed ? (
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

            {/* Tags - horizontal scroll on mobile */}
            <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 ml-6 lg:ml-7">
              {lifecycleState && (
                <span className="text-[10px] lg:text-xs px-2 py-0.5 lg:py-1 rounded-lg bg-muted/60 text-muted-foreground font-medium">
                  {lifecycleState.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                </span>
              )}
              {isPresale && (
                <span className="text-[10px] lg:text-xs px-2 py-0.5 lg:py-1 rounded-lg bg-amber-500/10 text-amber-700 font-medium flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> Presale {partMatch?.[1]}
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
              {transaction.mls_number && transaction.mls_number !== 'N/A' && (
                <span className="text-[10px] lg:text-xs px-2 py-0.5 lg:py-1 rounded-lg bg-muted/40 text-muted-foreground font-mono">
                  MLS {transaction.mls_number}
                </span>
              )}
              {complianceStatus && (
                <span className={cn(
                  "text-[10px] lg:text-xs px-2 py-0.5 lg:py-1 rounded-lg font-medium flex items-center gap-1",
                  isCompliant ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
                )}>
                  <Shield className="h-3 w-3" />
                  {isCompliant ? 'Compliant' : complianceStatus.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.05 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3"
        >
          <DealStatCard label="Sale Price" value={formatCurrency(salePrice)} icon={DollarSign}
            color="text-foreground" iconBg="bg-muted" />
          <DealStatCard label="GCI" value={formatCurrency(grossCommission)} icon={TrendingUp}
            color="text-primary" iconBg="bg-primary/15" />
          <DealStatCard label="My Net Payout" value={formatCurrency(netPayout)} icon={DollarSign}
            color="text-success" iconBg="bg-success/15"
            subtitle={transaction.my_split_percent ? `${(transaction.my_split_percent * 100).toFixed(0)}% split` : undefined} />
          <DealStatCard
            label={isClosed ? 'Closed' : isPastDue ? 'Was Due' : 'Close Date'}
            value={closeDate ? format(parseISO(closeDate), 'MMM d, yyyy') : '—'}
            icon={Calendar}
            color={isPastDue ? 'text-amber-600' : 'text-foreground'}
            iconBg={isPastDue ? 'bg-amber-500/15' : 'bg-muted'}
            subtitle={daysUntilClose !== null && !isClosed
              ? daysUntilClose < 0 ? `${Math.abs(daysUntilClose)}d overdue` : `${daysUntilClose}d away`
              : undefined}
          />
        </motion.div>

        {/* Dates & Details - Collapsible on mobile */}
        <div className="grid lg:grid-cols-2 gap-3 lg:gap-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
          >
            <CollapsibleSection icon={Calendar} title="Key Dates" defaultOpen={true}>
              <div className="space-y-2.5">
                <DateRow label="Firm Date" date={firmDate} />
                <DateRow label="Close Date" date={closeDate} highlight={isPastDue} />
                {listingDate && <DateRow label="Listing Date" date={listingDate} />}
                {raw.closedAt && (
                  <DateRow label="Settled" date={format(new Date(raw.closedAt), 'yyyy-MM-dd')} />
                )}
                {raw.compliantAt && (
                  <DateRow label="Compliant Since" date={format(new Date(raw.compliantAt), 'yyyy-MM-dd')} />
                )}
              </div>
            </CollapsibleSection>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.15 }}
          >
            <CollapsibleSection icon={FileText} title="Transaction Details" defaultOpen={true}>
              <div className="space-y-2.5">
                <DetailRow label="Type" value={raw.transactionType || transaction.transaction_type || '—'} />
                <DetailRow label="Property Type" value={raw.propertyType || '—'} />
                <DetailRow label="Currency" value={transaction.currency || 'CAD'} />
                {raw.kind && <DetailRow label="Kind" value={raw.kind} />}
                {lifecycleDesc && <DetailRow label="Status Info" value={lifecycleDesc} />}
                {transaction.lead_source && <DetailRow label="Lead Source" value={transaction.lead_source} />}
                {transaction.agent_name && <DetailRow label="Agent" value={transaction.agent_name} />}
              </div>
            </CollapsibleSection>
          </motion.div>
        </div>

        {/* Participants - Collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.2 }}
        >
          <CollapsibleSection
            icon={Users}
            title="Participants"
            badge={`${visibleParticipants.length} visible`}
            defaultOpen={false}
          >
            {visibleParticipants.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No participants found.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2.5 lg:gap-3">
                {visibleParticipants.map(p => (
                  <ParticipantCard key={p.id} participant={p} />
                ))}
              </div>
            )}
          </CollapsibleSection>
        </motion.div>

        {/* Related Transactions - Collapsible */}
        {raw.journeyId && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.25 }}
          >
            <CollapsibleSection icon={ExternalLink} title="Related Transactions" defaultOpen={true}>
              {(() => {
                const related = syncedTransactions.filter(
                  tx => tx.raw_data?.journeyId === raw.journeyId && tx.id !== id
                );
                if (related.length === 0) {
                  return <p className="text-sm text-muted-foreground">No related transactions found.</p>;
                }
                return (
                  <div className="space-y-2">
                    {related.map(tx => {
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
                            {formatCurrency(extractNetPayout(tx.raw_data))}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                );
              })()}
            </CollapsibleSection>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}

/* Sub-components */

function DateRow({ label, date, highlight }: { label: string; date: string | null; highlight?: boolean }) {
  if (!date) return null;
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs lg:text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-xs lg:text-sm font-medium", highlight ? "text-amber-600" : "text-foreground")}>
        {format(parseISO(date), 'MMM d, yyyy')}
      </span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs lg:text-sm text-muted-foreground">{label}</span>
      <span className="text-xs lg:text-sm font-medium text-foreground text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}
