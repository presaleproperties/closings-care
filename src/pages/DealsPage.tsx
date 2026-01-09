import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Trash2 } from 'lucide-react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

  const filteredDeals = useMemo(() => {
    return deals
      .filter((deal) => {
        const matchesSearch =
          deal.client_name.toLowerCase().includes(search.toLowerCase()) ||
          deal.address?.toLowerCase().includes(search.toLowerCase()) ||
          deal.project_name?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || deal.status === statusFilter;
        const matchesType = typeFilter === 'ALL' || deal.deal_type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        // Sort by close date (most recent first), then by created_at
        const dateA = a.close_date_actual || a.close_date_est || a.created_at;
        const dateB = b.close_date_actual || b.close_date_est || b.created_at;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
  }, [deals, search, statusFilter, typeFilter]);

  const stats = useMemo(() => ({
    total: filteredDeals.length,
    pending: filteredDeals.filter(d => d.status === 'PENDING').length,
    closed: filteredDeals.filter(d => d.status === 'CLOSED').length,
    commission: filteredDeals.reduce((sum, d) => sum + Number(d.gross_commission_actual || d.gross_commission_est || 0), 0),
  }), [filteredDeals]);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteDeal.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <AppLayout>
      <Header 
        title="Deals" 
        subtitle={`${stats.pending} pending · ${stats.closed} closed · ${formatCurrency(stats.commission)} total`}
        action={
          <Button asChild className="btn-premium">
            <Link to="/deals/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Deal
            </Link>
          </Button>
        }
      />

      <div className="p-4 lg:p-6 space-y-4 animate-fade-in">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search deals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as DealStatus | 'ALL')}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as DealType | 'ALL')}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="BUY">Buy</SelectItem>
                <SelectItem value="SELL">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Property</TableHead>
                  <TableHead className="hidden sm:table-cell">Close Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeals.map((deal) => {
                  const displayDate = deal.close_date_actual || deal.close_date_est;
                  const commission = deal.gross_commission_actual || deal.gross_commission_est;

                  return (
                    <TableRow key={deal.id} className="group">
                      <TableCell>
                        <Link
                          to={`/deals/${deal.id}`}
                          className="font-medium hover:text-accent transition-colors"
                        >
                          {deal.client_name}
                        </Link>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {deal.deal_type}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {deal.address || deal.project_name || '—'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {displayDate ? formatDate(displayDate) : '—'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={deal.status} />
                      </TableCell>
                      <TableCell className="text-right font-semibold text-success">
                        {formatCurrency(commission)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link to={`/deals/${deal.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(deal.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deal</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this deal and all associated payouts.
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
