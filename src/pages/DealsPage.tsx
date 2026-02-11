import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Building2, Home, MapPin, DollarSign, TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSyncedDeals } from '@/hooks/useSyncedDeals';
import { useRefreshData } from '@/hooks/useRefreshData';
import { formatCurrency } from '@/lib/format';
import { triggerHaptic } from '@/lib/haptics';
import { SyncedDealCard } from '@/components/deals/SyncedDealCard';

export default function DealsPage() {
  const { activeDeals, closedDeals, listings } = useSyncedDeals();
  const refreshData = useRefreshData();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'closed' | 'listings'>('active');

  const filteredDeals = useMemo(() => {
    let dealsToFilter = activeTab === 'active' ? activeDeals : activeTab === 'closed' ? closedDeals : listings;
    
    if (search) {
      const searchLower = search.toLowerCase();
      dealsToFilter = dealsToFilter.filter(deal =>
        (deal.propertyAddress || 'unknown').toLowerCase().includes(searchLower) ||
        deal.clientName.toLowerCase().includes(searchLower) ||
        deal.mlsNumber?.toLowerCase().includes(searchLower)
      );
    }
    
    return dealsToFilter.sort((a, b) => {
      if (a.firmDate && b.firmDate) {
        return new Date(b.firmDate).getTime() - new Date(a.firmDate).getTime();
      }
      return 0;
    });
  }, [activeTab, activeDeals, closedDeals, listings, search]);

  const stats = useMemo(() => {
    const allDeals = [...activeDeals, ...closedDeals];
    return {
      active: activeDeals.length,
      closed: closedDeals.length,
      listings: listings.length,
      totalCommission: allDeals.reduce((sum, d) => sum + (d.commissionAmount || 0), 0),
      totalNet: allDeals.reduce((sum, d) => sum + (d.myNetPayout || 0), 0),
      totalVolume: allDeals.reduce((sum, d) => sum + (d.salePrice || 0), 0),
    };
  }, [activeDeals, closedDeals, listings]);

  const handleTabChange = (tab: string) => {
    triggerHaptic('light');
    setActiveTab(tab as 'active' | 'closed' | 'listings');
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
        {search ? `No ${label} matching "${search}"` : `No ${label} yet`}
      </p>
    </motion.div>
  );

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <Header title="Deals" />
        
        <PullToRefresh onRefresh={refreshData}>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 lg:p-6 space-y-5 max-w-4xl mx-auto">

              {/* Hero Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border/50 bg-card/50 p-3 text-center">
                  <p className="text-xl font-bold text-foreground">{stats.active + stats.closed}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Deals</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-card/50 p-3 text-center">
                  <p className="text-xl font-bold text-foreground">{formatCurrency(stats.totalNet)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Net Income</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-card/50 p-3 text-center">
                  <p className="text-xl font-bold text-foreground">{formatCurrency(stats.totalVolume)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Volume</p>
                </div>
              </div>

              {/* Search */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by address, client, MLS..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Link to="/deals/new">
                  <Button
                    size="icon"
                    className="rounded-xl"
                    onClick={() => triggerHaptic('light')}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </Link>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="active" className="gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Active</span>
                    <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-bold">
                      {stats.active}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="closed" className="gap-1.5">
                    <Home className="h-3.5 w-3.5" />
                    <span>Closed</span>
                    <span className="text-[10px] bg-success/15 text-success px-1.5 py-0.5 rounded-full font-bold">
                      {stats.closed}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="listings" className="gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Listings</span>
                    <span className="text-[10px] bg-blue-500/15 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-bold">
                      {stats.listings}
                    </span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-4 space-y-2">
                  {filteredDeals.length > 0 ? (
                    <div className="grid gap-2">
                      {filteredDeals.map((deal, idx) => (
                        <Link key={deal.id} to={`/deals/${deal.id}`}>
                          <SyncedDealCard deal={deal} index={idx} />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={Building2} label="active deals" />
                  )}
                </TabsContent>

                <TabsContent value="closed" className="mt-4 space-y-2">
                  {filteredDeals.length > 0 ? (
                    <div className="grid gap-2">
                      {filteredDeals.map((deal, idx) => (
                        <Link key={deal.id} to={`/deals/${deal.id}`}>
                          <SyncedDealCard deal={deal} index={idx} />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={Home} label="closed deals" />
                  )}
                </TabsContent>

                <TabsContent value="listings" className="mt-4 space-y-2">
                  {filteredDeals.length > 0 ? (
                    <div className="grid gap-2">
                      {filteredDeals.map((deal, idx) => (
                        <Link key={deal.id} to={`/deals/${deal.id}`}>
                          <SyncedDealCard deal={deal} index={idx} />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={MapPin} label="listings" />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </PullToRefresh>
      </div>
    </AppLayout>
  );
}
