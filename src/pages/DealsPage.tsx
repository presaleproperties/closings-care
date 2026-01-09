import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, MoreHorizontal, Eye, Trash2 } from 'lucide-react';
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
import { useDeals, useDeleteDeal } from '@/hooks/useDeals';
import { formatCurrency, formatDate } from '@/lib/format';
import { DealStatus, DealType } from '@/lib/types';

export default function DealsPage() {
  const { data: deals = [], isLoading } = useDeals();
  const deleteDeal = useDeleteDeal();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DealStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<DealType | 'ALL'>('ALL');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.client_name.toLowerCase().includes(search.toLowerCase()) ||
      deal.address?.toLowerCase().includes(search.toLowerCase()) ||
      deal.project_name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || deal.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || deal.deal_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = async () => {
    if (deleteId) {
      await deleteDeal.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <AppLayout>
      <Header title="Deals" subtitle={`${deals.length} total deals`} />

      <div className="p-4 lg:p-6 space-y-4 animate-fade-in">
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

        {/* Deals Table */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filteredDeals.length === 0 ? (
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
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr className="bg-muted/50">
                    <th>Client</th>
                    <th>Type</th>
                    <th>Address / Project</th>
                    <th>Status</th>
                    <th className="text-right">Sale Price</th>
                    <th className="text-right">Gross Commission</th>
                    <th>Completion Date</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeals.map((deal) => {
                    // Get the appropriate date: completion_date for presale, close_date for resale
                    const displayDate = deal.property_type === 'PRESALE'
                      ? (deal as any).completion_date
                      : (deal.close_date_actual || deal.close_date_est);
                    
                    // Get gross commission
                    const grossCommission = deal.gross_commission_actual || deal.gross_commission_est;

                    return (
                      <tr key={deal.id} className="group">
                        <td>
                          <Link
                            to={`/deals/${deal.id}`}
                            className="font-medium hover:text-accent transition-colors"
                          >
                            {deal.client_name}
                          </Link>
                        </td>
                        <td>
                          <span className="text-xs font-medium px-2 py-1 rounded bg-muted">
                            {deal.deal_type}
                          </span>
                        </td>
                        <td className="text-muted-foreground">
                          {deal.address || deal.project_name || '—'}
                        </td>
                        <td>
                          <StatusBadge status={deal.status} />
                        </td>
                        <td className="text-right font-medium">
                          {formatCurrency(deal.sale_price)}
                        </td>
                        <td className="text-right font-medium">
                          {formatCurrency(grossCommission)}
                        </td>
                        <td className="text-muted-foreground">
                          {formatDate(displayDate)}
                        </td>
                      <td>
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
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
