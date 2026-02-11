import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Search, Building2, Home, MapPin,
  ArrowUpDown, ArrowDownAZ, ArrowUpAZ,
  CalendarArrowDown, CalendarArrowUp,
  SlidersHorizontal, X,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSyncedDeals, SyncedDeal } from '@/hooks/useSyncedDeals';
import { useRefreshData } from '@/hooks/useRefreshData';
import { formatCurrency } from '@/lib/format';
import { triggerHaptic } from '@/lib/haptics';
import { SyncedDealCard } from '@/components/deals/SyncedDealCard';
import { cn } from '@/lib/utils';

type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'address-asc' | 'address-desc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'amount-desc', label: 'Highest Amount' },
  { value: 'amount-asc', label: 'Lowest Amount' },
  { value: 'address-asc', label: 'Address A–Z' },
  { value: 'address-desc', label: 'Address Z–A' },
];

function getSortFn(key: SortKey) {
  return (a: SyncedDeal, b: SyncedDeal) => {
    switch (key) {
      case 'date-desc': {
        const dA = a.closeDate || a.firmDate || '';
        const dB = b.closeDate || b.firmDate || '';
        return dB.localeCompare(dA);
      }
      case 'date-asc': {
        const dA = a.closeDate || a.firmDate || '';
        const dB = b.closeDate || b.firmDate || '';
        return dA.localeCompare(dB);
      }
      case 'amount-desc':
        return (b.myNetPayout || 0) - (a.myNetPayout || 0);
      case 'amount-asc':
        return (a.myNetPayout || 0) - (b.myNetPayout || 0);
      case 'address-asc':
        return (a.propertyAddress || '').localeCompare(b.propertyAddress || '');
      case 'address-desc':
        return (b.propertyAddress || '').localeCompare(a.propertyAddress || '');
    }
  };
}

export default function DealsPage() {
  const { activeDeals, closedDeals, listings } = useSyncedDeals();
  const refreshData = useRefreshData();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'closed' | 'listings'>('active');
  const [sortKey, setSortKey] = useState<SortKey>('date-desc');
  const [showFilters, setShowFilters] = useState(false);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const hasActiveFilters = !!minAmount || !!maxAmount;

  const filteredDeals = useMemo(() => {
    let deals = activeTab === 'active' ? activeDeals : activeTab === 'closed' ? closedDeals : listings;

    // Search
    if (search) {
      const q = search.toLowerCase();
      deals = deals.filter(d =>
        (d.propertyAddress || '').toLowerCase().includes(q) ||
        d.clientName.toLowerCase().includes(q) ||
        d.mlsNumber?.toLowerCase().includes(q)
      );
    }

    // Amount range filter
    const min = minAmount ? Number(minAmount) : null;
    const max = maxAmount ? Number(maxAmount) : null;
    if (min !== null) deals = deals.filter(d => (d.myNetPayout || 0) >= min);
    if (max !== null) deals = deals.filter(d => (d.myNetPayout || 0) <= max);

    // Sort
    return [...deals].sort(getSortFn(sortKey));
  }, [activeTab, activeDeals, closedDeals, listings, search, sortKey, minAmount, maxAmount]);

  const stats = useMemo(() => {
    const allDeals = [...activeDeals, ...closedDeals];
    return {
      active: activeDeals.length,
      closed: closedDeals.length,
      listings: listings.length,
      totalNet: allDeals.reduce((sum, d) => sum + (d.myNetPayout || 0), 0),
      totalVolume: allDeals.reduce((sum, d) => sum + (d.salePrice || 0), 0),
    };
  }, [activeDeals, closedDeals, listings]);

  const handleTabChange = (tab: string) => {
    triggerHaptic('light');
    setActiveTab(tab as 'active' | 'closed' | 'listings');
  };

  const clearFilters = () => {
    setMinAmount('');
    setMaxAmount('');
    setShowFilters(false);
  };

  const EmptyState = ({ icon: Icon, label }: { icon: typeof Building2; label: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
        <Icon className="h-7 w-7 text-muted-foreground/50" />
      </div>
      <p className="text-muted-foreground text-sm">
        {search || hasActiveFilters ? `No ${label} matching your filters` : `No ${label} yet`}
      </p>
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" className="mt-2 text-primary" onClick={clearFilters}>
          Clear filters
        </Button>
      )}
    </motion.div>
  );

  const DealList = ({ deals, emptyIcon, emptyLabel }: { deals: SyncedDeal[]; emptyIcon: typeof Building2; emptyLabel: string }) => (
    deals.length > 0 ? (
      <div className="grid gap-2">
        {deals.map((deal, idx) => (
          <Link key={deal.id} to={`/deals/${deal.id}`}>
            <SyncedDealCard deal={deal} index={idx} />
          </Link>
        ))}
      </div>
    ) : (
      <EmptyState icon={emptyIcon} label={emptyLabel} />
    )
  );

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <Header title="Deals" />

        <PullToRefresh onRefresh={refreshData}>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 lg:p-6 space-y-4 max-w-4xl mx-auto pb-24 lg:pb-6">

              {/* Hero Stats */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                className="grid grid-cols-3 gap-2.5 lg:gap-4"
              >
                {[
                  { value: stats.active + stats.closed, label: 'Deals', gradient: 'from-primary/10 via-primary/5 to-transparent', iconColor: 'text-primary' },
                  { value: formatCurrency(stats.totalNet), label: 'Net Income', gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent', iconColor: 'text-emerald-600' },
                  { value: formatCurrency(stats.totalVolume), label: 'Volume', gradient: 'from-accent/10 via-accent/5 to-transparent', iconColor: 'text-accent' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    className={cn(
                      "relative overflow-hidden rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm p-3.5 lg:p-4 text-center",
                      "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300"
                    )}
                  >
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-70", stat.gradient)} />
                    <div className="relative">
                      <p className={cn("text-lg lg:text-2xl font-extrabold tracking-tight", stat.iconColor)}>
                        {stat.value}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-semibold">
                        {stat.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Search + Sort + Filter Row */}
              <div className="space-y-2.5">
                <div className="flex gap-2">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by address, client, MLS..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 h-11 lg:h-10 rounded-xl bg-card/80 border-border/50 focus-visible:ring-primary/30 focus-visible:border-primary/40 text-sm"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground touch-manipulation"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Sort */}
                  <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                    <SelectTrigger className="w-[140px] lg:w-[170px] h-11 lg:h-10 rounded-xl bg-card/80 border-border/50">
                      <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {SORT_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Filter Toggle */}
                  <Button
                    variant={showFilters || hasActiveFilters ? 'default' : 'outline'}
                    size="icon"
                    className={cn(
                      'h-11 w-11 lg:h-10 lg:w-10 rounded-xl shrink-0 touch-manipulation border-border/50 bg-card/80',
                      hasActiveFilters && !showFilters && 'bg-primary text-primary-foreground border-primary'
                    )}
                    onClick={() => {
                      triggerHaptic('light');
                      setShowFilters(!showFilters);
                    }}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>

                  {/* Add Deal */}
                  <Link to="/deals/new">
                    <Button
                      size="icon"
                      className="rounded-xl h-11 w-11 lg:h-10 lg:w-10 touch-manipulation btn-premium shadow-lg shadow-primary/20"
                      onClick={() => triggerHaptic('light')}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>

                {/* Filter Panel - Collapsible */}
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-border/50 bg-card/60 p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount Range</span>
                        {hasActiveFilters && (
                          <button onClick={clearFilters} className="text-[10px] text-primary font-medium touch-manipulation">
                            Clear all
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                          <Input
                            type="number"
                            placeholder="Min"
                            value={minAmount}
                            onChange={(e) => setMinAmount(e.target.value)}
                            className="pl-7 h-9 text-sm"
                          />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                          <Input
                            type="number"
                            placeholder="Max"
                            value={maxAmount}
                            onChange={(e) => setMaxAmount(e.target.value)}
                            className="pl-7 h-9 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Active filter chips */}
                {hasActiveFilters && !showFilters && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {minAmount && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-primary/10 text-primary font-medium">
                        Min: {formatCurrency(Number(minAmount))}
                        <button onClick={() => setMinAmount('')} className="touch-manipulation">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {maxAmount && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-primary/10 text-primary font-medium">
                        Max: {formatCurrency(Number(maxAmount))}
                        <button onClick={() => setMaxAmount('')} className="touch-manipulation">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>
                )}

                {/* Results count */}
                <p className="text-[10px] text-muted-foreground">
                  {filteredDeals.length} {filteredDeals.length === 1 ? 'deal' : 'deals'}
                  {(search || hasActiveFilters) && ' matching'}
                </p>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-3 h-12 lg:h-11 rounded-2xl bg-muted/50 border border-border/40 p-1">
                  <TabsTrigger value="active" className="gap-1.5 rounded-xl data-[state=active]:shadow-md data-[state=active]:bg-card text-sm font-semibold">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Active</span>
                    <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-bold">
                      {stats.active}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="closed" className="gap-1.5 rounded-xl data-[state=active]:shadow-md data-[state=active]:bg-card text-sm font-semibold">
                    <Home className="h-3.5 w-3.5" />
                    <span>Closed</span>
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-600 px-1.5 py-0.5 rounded-full font-bold">
                      {stats.closed}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="listings" className="gap-1.5 rounded-xl data-[state=active]:shadow-md data-[state=active]:bg-card text-sm font-semibold">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Listings</span>
                    <span className="text-[10px] bg-blue-500/15 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-bold">
                      {stats.listings}
                    </span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-4">
                  <DealList deals={filteredDeals} emptyIcon={Building2} emptyLabel="active deals" />
                </TabsContent>
                <TabsContent value="closed" className="mt-4">
                  <DealList deals={filteredDeals} emptyIcon={Home} emptyLabel="closed deals" />
                </TabsContent>
                <TabsContent value="listings" className="mt-4">
                  <DealList deals={filteredDeals} emptyIcon={MapPin} emptyLabel="listings" />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </PullToRefresh>
      </div>
    </AppLayout>
  );
}
