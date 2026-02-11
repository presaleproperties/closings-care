import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Home, Building2, MapPin, DollarSign, Calendar, Users, Filter, ArrowUpDown, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, parseISO, getYear } from 'date-fns';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';

type StatusFilter = 'all' | 'closed' | 'pending' | 'active';
type SortBy = 'date' | 'amount' | 'name';

interface SyncedTransactionsListProps {
  transactions: any[];
  isLoading: boolean;
}

const springConfig = { type: "spring" as const, stiffness: 100, damping: 20 };

export function SyncedTransactionsList({ transactions, isLoading }: SyncedTransactionsListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');

  const stats = useMemo(() => {
    const closed = transactions.filter(t => t.status === 'Closed' || t.status === 'CLOSED');
    const pending = transactions.filter(t => t.status === 'Pending' || t.status === 'PENDING');
    const totalVolume = transactions.reduce((s, t) => s + Number(t.sale_price || 0), 0);
    const totalCommission = transactions.reduce((s, t) => s + Number(t.commission_amount || 0), 0);
    return {
      total: transactions.length,
      closed: closed.length,
      pending: pending.length,
      totalVolume,
      totalCommission,
    };
  }, [transactions]);

  const filtered = useMemo(() => {
    let result = [...transactions];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(t =>
        t.client_name?.toLowerCase().includes(s) ||
        t.property_address?.toLowerCase().includes(s) ||
        t.city?.toLowerCase().includes(s) ||
        t.agent_name?.toLowerCase().includes(s)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(t => {
        const status = (t.status || '').toLowerCase();
        if (statusFilter === 'closed') return status === 'closed';
        if (statusFilter === 'pending') return status === 'pending';
        return status !== 'closed' && status !== 'pending';
      });
    }

    result.sort((a, b) => {
      if (sortBy === 'date') {
        const da = a.close_date || a.listing_date || a.synced_at;
        const db = b.close_date || b.listing_date || b.synced_at;
        return new Date(db).getTime() - new Date(da).getTime();
      }
      if (sortBy === 'amount') return Number(b.commission_amount || 0) - Number(a.commission_amount || 0);
      return (a.client_name || '').localeCompare(b.client_name || '');
    });

    return result;
  }, [transactions, search, statusFilter, sortBy]);

  const filterButtons = [
    { key: 'all' as StatusFilter, label: 'All', count: stats.total, icon: RefreshCw },
    { key: 'closed' as StatusFilter, label: 'Closed', count: stats.closed, icon: CheckCircle2 },
    { key: 'pending' as StatusFilter, label: 'Pending', count: stats.pending, icon: Clock },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <motion.div className="flex flex-col items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center animate-pulse">
            <RefreshCw className="h-6 w-6 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Loading synced transactions...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {filterButtons.map((btn, i) => (
          <motion.button
            key={btn.key}
            onClick={() => { triggerHaptic('light'); setStatusFilter(btn.key); }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: i * 0.05 }}
            className={cn(
              "relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all duration-300 overflow-hidden",
              statusFilter === btn.key
                ? "border-primary/50 shadow-lg shadow-primary/15"
                : "bg-card/95 border-border/40 hover:border-primary/30"
            )}
            style={statusFilter === btn.key ? {
              background: 'linear-gradient(145deg, hsl(var(--primary)/0.15) 0%, hsl(var(--primary)/0.05) 100%)'
            } : undefined}
          >
            {statusFilter === btn.key && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />}
            <div className="relative">
              <div className={cn(
                "flex items-center gap-1.5 mb-1.5",
                statusFilter === btn.key ? "text-primary" : "text-muted-foreground"
              )}>
                <btn.icon className="w-3.5 h-3.5" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{btn.label}</span>
              </div>
              <p className={cn("text-lg sm:text-xl font-bold", statusFilter === btn.key ? "text-primary" : "text-foreground")}>
                {btn.count}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Volume & Commission summary */}
      <motion.div
        className="grid grid-cols-2 gap-2 sm:gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springConfig, delay: 0.15 }}
      >
        <div className="p-3 sm:p-4 rounded-xl border border-border/40 bg-card/80">
          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1">Total Volume</p>
          <p className="text-base sm:text-lg font-bold text-foreground">{formatCurrency(stats.totalVolume)}</p>
        </div>
        <div className="p-3 sm:p-4 rounded-xl border border-border/40 bg-card/80">
          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1">Total Commission</p>
          <p className="text-base sm:text-lg font-bold text-primary">{formatCurrency(stats.totalCommission)}</p>
        </div>
      </motion.div>

      {/* Search + Sort */}
      <motion.div
        className="flex gap-2 sm:gap-3 items-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springConfig, delay: 0.2 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <Input
            placeholder="Search address, client, agent..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 sm:pl-11 h-10 sm:h-12 bg-card/95 border-border/50 rounded-xl text-sm placeholder:text-muted-foreground focus:border-primary/50"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-10 sm:h-12 px-3 rounded-xl border-border/50 gap-1.5"
          onClick={() => {
            triggerHaptic('light');
            setSortBy(prev => prev === 'date' ? 'amount' : prev === 'amount' ? 'name' : 'date');
          }}
        >
          <ArrowUpDown className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">{sortBy === 'date' ? 'Date' : sortBy === 'amount' ? 'Amount' : 'Name'}</span>
        </Button>
      </motion.div>

      {/* Transaction Cards */}
      {filtered.length === 0 ? (
        <motion.div className="text-center py-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center border border-primary/20">
            <Search className="w-12 h-12 text-primary/60" />
          </div>
          <p className="text-xl font-bold mb-2">No transactions found</p>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </motion.div>
      ) : (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((tx, idx) => {
              const isClosed = (tx.status || '').toLowerCase() === 'closed';
              const date = tx.close_date || tx.listing_date;
              const isBuyer = (tx.transaction_type || '').toLowerCase().includes('buyer');

              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ ...springConfig, delay: Math.min(idx * 0.02, 0.3) }}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border transition-all duration-300 group",
                    isClosed
                      ? "bg-card/50 border-border/30"
                      : "bg-card/95 border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
                  )}
                >
                  {/* Status bar */}
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 rounded-l-2xl",
                    isClosed ? "bg-success/60" : "bg-primary/40"
                  )} />

                  {isClosed && <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent pointer-events-none" />}

                  <div className="p-3 sm:p-4 pl-4 sm:pl-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <h3 className="font-bold text-sm sm:text-base truncate">
                            {tx.client_name || tx.property_address || 'Transaction'}
                          </h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] sm:text-[10px] px-1.5 py-0 h-4 font-bold uppercase",
                              isClosed ? "border-success/40 text-success" : "border-primary/40 text-primary"
                            )}
                          >
                            {tx.status || 'Unknown'}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                          {tx.property_address && tx.property_address !== tx.client_name && (
                            <span className="inline-flex items-center gap-1 truncate">
                              <Home className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate max-w-[180px]">{tx.property_address}</span>
                            </span>
                          )}
                          {tx.city && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {tx.city}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className={cn(
                          "text-lg sm:text-xl font-bold",
                          isClosed ? "text-success" : "text-primary"
                        )}>
                          {tx.commission_amount ? formatCurrency(tx.commission_amount) : '—'}
                        </p>
                        {date && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {format(parseISO(date), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className={cn(
                          "text-[10px] px-2 py-0.5 font-semibold",
                          isBuyer ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" : "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
                        )}>
                          {isBuyer ? 'Buyer' : 'Seller'}
                        </Badge>
                        {tx.agent_name && (
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5 gap-1 border-border/40">
                            <Users className="h-2.5 w-2.5" />
                            {tx.agent_name}
                          </Badge>
                        )}
                      </div>
                      {tx.sale_price && (
                        <span className="text-xs text-muted-foreground font-medium">
                          Sale: {formatCurrency(tx.sale_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground pt-4">
        Showing {filtered.length} of {transactions.length} synced transactions
      </p>
    </div>
  );
}
