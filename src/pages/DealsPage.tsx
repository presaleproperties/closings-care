import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, Eye, Trash2, ChevronDown, ChevronRight, Calendar, TrendingUp, Users } from 'lucide-react';
import { format, parseISO, getQuarter, getYear } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useDeals, useDeleteDeal } from '@/hooks/useDeals';
import { formatCurrency, formatDate } from '@/lib/format';
import { DealStatus, DealType, Deal } from '@/lib/types';
import { cn } from '@/lib/utils';

interface QuarterGroup {
  key: string;
  label: string;
  year: number;
  quarter: number;
  deals: Deal[];
  totalCommission: number;
  closedCount: number;
  pendingCount: number;
}

function getQuarterFromDate(dateStr: string | null | undefined): { year: number; quarter: number } | null {
  if (!dateStr) return null;
  try {
    const date = parseISO(dateStr);
    return { year: getYear(date), quarter: getQuarter(date) };
  } catch {
    return null;
  }
}

function getQuarterLabel(year: number, quarter: number): string {
  return `Q${quarter} ${year}`;
}

export default function DealsPage() {
  const { data: deals = [], isLoading } = useDeals();
  const deleteDeal = useDeleteDeal();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DealStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<DealType | 'ALL'>('ALL');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedQuarters, setExpandedQuarters] = useState<Set<string>>(new Set());

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchesSearch =
        deal.client_name.toLowerCase().includes(search.toLowerCase()) ||
        deal.address?.toLowerCase().includes(search.toLowerCase()) ||
        deal.project_name?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || deal.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || deal.deal_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [deals, search, statusFilter, typeFilter]);

  // Group deals by quarter
  const quarterGroups = useMemo(() => {
    const groups: Map<string, QuarterGroup> = new Map();
    const noDateDeals: Deal[] = [];

    filteredDeals.forEach((deal) => {
      // Get the appropriate date for grouping
      const displayDate = deal.property_type === 'PRESALE'
        ? (deal as any).completion_date
        : (deal.close_date_actual || deal.close_date_est);

      const quarterInfo = getQuarterFromDate(displayDate);

      if (!quarterInfo) {
        noDateDeals.push(deal);
        return;
      }

      const key = `${quarterInfo.year}-Q${quarterInfo.quarter}`;
      
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          label: getQuarterLabel(quarterInfo.year, quarterInfo.quarter),
          year: quarterInfo.year,
          quarter: quarterInfo.quarter,
          deals: [],
          totalCommission: 0,
          closedCount: 0,
          pendingCount: 0,
        });
      }

      const group = groups.get(key)!;
      group.deals.push(deal);
      group.totalCommission += Number(deal.gross_commission_actual || deal.gross_commission_est || 0);
      if (deal.status === 'CLOSED') {
        group.closedCount++;
      } else {
        group.pendingCount++;
      }
    });

    // Convert to array and sort by year/quarter descending (newest first)
    const sortedGroups = Array.from(groups.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.quarter - a.quarter;
    });

    // Add "No Date" group if there are deals without dates
    if (noDateDeals.length > 0) {
      sortedGroups.push({
        key: 'no-date',
        label: 'No Date Set',
        year: 0,
        quarter: 0,
        deals: noDateDeals,
        totalCommission: noDateDeals.reduce((sum, d) => sum + Number(d.gross_commission_actual || d.gross_commission_est || 0), 0),
        closedCount: noDateDeals.filter(d => d.status === 'CLOSED').length,
        pendingCount: noDateDeals.filter(d => d.status === 'PENDING').length,
      });
    }

    return sortedGroups;
  }, [filteredDeals]);

  // Auto-expand current quarter and next quarter
  useMemo(() => {
    const now = new Date();
    const currentYear = getYear(now);
    const currentQuarter = getQuarter(now);
    const currentKey = `${currentYear}-Q${currentQuarter}`;
    const nextQuarter = currentQuarter === 4 ? 1 : currentQuarter + 1;
    const nextYear = currentQuarter === 4 ? currentYear + 1 : currentYear;
    const nextKey = `${nextYear}-Q${nextQuarter}`;

    setExpandedQuarters(new Set([currentKey, nextKey]));
  }, []);

  const toggleQuarter = (key: string) => {
    setExpandedQuarters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteDeal.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  // Summary stats
  const totalStats = useMemo(() => {
    return {
      totalDeals: filteredDeals.length,
      totalCommission: filteredDeals.reduce((sum, d) => sum + Number(d.gross_commission_actual || d.gross_commission_est || 0), 0),
      pendingDeals: filteredDeals.filter(d => d.status === 'PENDING').length,
      closedDeals: filteredDeals.filter(d => d.status === 'CLOSED').length,
    };
  }, [filteredDeals]);

  return (
    <AppLayout>
      <Header 
        title="Deals" 
        subtitle={`${deals.length} total deals`}
        action={
          <Button asChild className="btn-premium hidden sm:flex">
            <Link to="/deals/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Deal
            </Link>
          </Button>
        }
      />

      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Total Deals</span>
            </div>
            <p className="text-2xl font-bold">{totalStats.totalDeals}</p>
          </div>
          <div className="bg-card border border-success/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-success mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Total Commission</span>
            </div>
            <p className="text-2xl font-bold text-success">{formatCurrency(totalStats.totalCommission)}</p>
          </div>
          <div className="bg-card border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Pending</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">{totalStats.pendingDeals}</p>
          </div>
          <div className="bg-card border border-accent/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-accent mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Closed</span>
            </div>
            <p className="text-2xl font-bold text-accent">{totalStats.closedDeals}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by client, address, or project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as DealStatus | 'ALL')}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as DealType | 'ALL')}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="BUY">Buy</SelectItem>
                <SelectItem value="SELL">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Add Button */}
        <Button asChild className="btn-premium sm:hidden w-full">
          <Link to="/deals/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Deal
          </Link>
        </Button>

        {/* Deals by Quarter */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : quarterGroups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No deals found</p>
            <Button asChild className="btn-premium">
              <Link to="/deals/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Deal
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {quarterGroups.map((group) => (
              <Collapsible
                key={group.key}
                open={expandedQuarters.has(group.key)}
                onOpenChange={() => toggleQuarter(group.key)}
              >
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  {/* Quarter Header */}
                  <CollapsibleTrigger asChild>
                    <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        {expandedQuarters.has(group.key) ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div className="text-left">
                          <h3 className="font-semibold text-lg">{group.label}</h3>
                          <p className="text-sm text-muted-foreground">
                            {group.deals.length} deal{group.deals.length !== 1 ? 's' : ''}
                            {group.pendingCount > 0 && (
                              <span className="text-amber-400 ml-2">• {group.pendingCount} pending</span>
                            )}
                            {group.closedCount > 0 && (
                              <span className="text-success ml-2">• {group.closedCount} closed</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-success">{formatCurrency(group.totalCommission)}</p>
                        <p className="text-xs text-muted-foreground">total commission</p>
                      </div>
                    </button>
                  </CollapsibleTrigger>

                  {/* Quarter Deals */}
                  <CollapsibleContent>
                    <div className="border-t border-border divide-y divide-border">
                      {group.deals.map((deal) => {
                        const displayDate = deal.property_type === 'PRESALE'
                          ? (deal as any).completion_date
                          : (deal.close_date_actual || deal.close_date_est);
                        const grossCommission = deal.gross_commission_actual || deal.gross_commission_est;

                        return (
                          <div
                            key={deal.id}
                            className="p-4 hover:bg-muted/30 transition-colors group flex items-center justify-between gap-4"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <Link
                                  to={`/deals/${deal.id}`}
                                  className="font-medium hover:text-accent transition-colors truncate"
                                >
                                  {deal.client_name}
                                </Link>
                                <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted shrink-0">
                                  {deal.deal_type}
                                </span>
                                <StatusBadge status={deal.status} />
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {deal.address || deal.project_name || '—'}
                                {displayDate && (
                                  <span className="ml-2">• {formatDate(displayDate)}</span>
                                )}
                              </p>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-right hidden sm:block">
                                <p className="text-sm text-muted-foreground">Sale Price</p>
                                <p className="font-medium">{formatCurrency(deal.sale_price)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground hidden sm:block">Commission</p>
                                <p className="font-bold text-success">{formatCurrency(grossCommission)}</p>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link to={`/deals/${deal.id}`}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setDeleteId(deal.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deal</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this deal and all associated payouts. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
