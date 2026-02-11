import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Building2, Home, MapPin } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSyncedDeals } from '@/hooks/useSyncedDeals';
import { useRefreshData } from '@/hooks/useRefreshData';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';
import { SyncedDealCard } from '@/components/deals/SyncedDealCard';

const springConfig = { type: 'spring' as const, stiffness: 100, damping: 20 };

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
        deal.clientName.toLowerCase().includes(searchLower) ||
        deal.propertyAddress?.toLowerCase().includes(searchLower) ||
        deal.mlsNumber?.toLowerCase().includes(searchLower)
      );
    }
    
    return dealsToFilter.sort((a, b) => {
      // Sort by firm date (newest first)
      if (a.firmDate && b.firmDate) {
        return new Date(b.firmDate).getTime() - new Date(a.firmDate).getTime();
      }
      return 0;
    });
  }, [activeTab, activeDeals, closedDeals, listings, search]);

  const stats = useMemo(() => {
    return {
      active: activeDeals.length,
      closed: closedDeals.length,
      listings: listings.length,
      totalCommission: [...activeDeals, ...closedDeals].reduce((sum, d) => sum + (d.commissionAmount || 0), 0),
    };
  }, [activeDeals, closedDeals, listings]);

  const handleTabChange = (tab: string) => {
    triggerHaptic('light');
    setActiveTab(tab as 'active' | 'closed' | 'listings');
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <Header title="Deals" />
        
        <PullToRefresh onRefresh={refreshData}>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Search bar */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search deals, MLS..."
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
                  <TabsTrigger value="active" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>Active</span>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">
                      {stats.active}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="closed" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span>Closed</span>
                    <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full font-semibold">
                      {stats.closed}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="listings" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Listings</span>
                    <span className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">
                      {stats.listings}
                    </span>
                  </TabsTrigger>
                </TabsList>

                {/* Active Deals Tab */}
                <TabsContent value="active" className="mt-4 space-y-3">
                  {filteredDeals.length > 0 ? (
                    <div className="grid gap-3">
                      {filteredDeals.map((deal, idx) => (
                        <Link key={deal.id} to={`/deals/${deal.id}`}>
                          <SyncedDealCard deal={deal} index={idx} />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12"
                    >
                      <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">
                        {search ? 'No active deals matching your search' : 'No active deals yet'}
                      </p>
                    </motion.div>
                  )}
                </TabsContent>

                {/* Closed Deals Tab */}
                <TabsContent value="closed" className="mt-4 space-y-3">
                  {filteredDeals.length > 0 ? (
                    <div className="grid gap-3">
                      {filteredDeals.map((deal, idx) => (
                        <Link key={deal.id} to={`/deals/${deal.id}`}>
                          <SyncedDealCard deal={deal} index={idx} />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12"
                    >
                      <Home className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">
                        {search ? 'No closed deals matching your search' : 'No closed deals yet'}
                      </p>
                    </motion.div>
                  )}
                </TabsContent>

                {/* Listings Tab */}
                <TabsContent value="listings" className="mt-4 space-y-3">
                  {filteredDeals.length > 0 ? (
                    <div className="grid gap-3">
                      {filteredDeals.map((deal, idx) => (
                        <Link key={deal.id} to={`/deals/${deal.id}`}>
                          <SyncedDealCard deal={deal} index={idx} />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12"
                    >
                      <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">
                        {search ? 'No listings matching your search' : 'No listings yet'}
                      </p>
                    </motion.div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Summary stats */}
              <div className="mt-6 pt-6 border-t border-border/30">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs">Total Commission</p>
                    <p className="font-bold text-lg">{formatCurrency(stats.totalCommission)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs">All Deals</p>
                    <p className="font-bold text-lg">{stats.active + stats.closed + stats.listings}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PullToRefresh>
      </div>
    </AppLayout>
  );
}
