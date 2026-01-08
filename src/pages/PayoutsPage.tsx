import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { Search, Download, Check, Filter } from 'lucide-react';
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
import { usePayouts, useMarkPayoutPaid } from '@/hooks/usePayouts';
import { formatCurrency, formatDate, getCurrentMonth, getMonthRange } from '@/lib/format';
import { PayoutStatus, PayoutType } from '@/lib/types';

const payoutTypes: PayoutType[] = ['Advance', '2nd Payment', '3rd Deposit', '4th Deposit', 'Completion', 'Custom'];

export default function PayoutsPage() {
  const { data: payouts = [], isLoading } = usePayouts();
  const markPaid = useMarkPayoutPaid();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<PayoutType | 'ALL'>('ALL');
  const [monthFilter, setMonthFilter] = useState<string>('ALL');

  // Generate month options (past 6 months + next 12 months)
  const monthOptions = useMemo(() => {
    return [...getMonthRange(-6, 18)];
  }, []);

  const filteredPayouts = useMemo(() => {
    return payouts.filter((payout) => {
      const clientName = payout.deal?.client_name?.toLowerCase() || '';
      const matchesSearch = clientName.includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || payout.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || payout.payout_type === typeFilter;
      
      const payoutMonth = payout.due_date ? payout.due_date.substring(0, 7) : '';
      const matchesMonth = monthFilter === 'ALL' || payoutMonth === monthFilter;

      return matchesSearch && matchesStatus && matchesType && matchesMonth;
    });
  }, [payouts, search, statusFilter, typeFilter, monthFilter]);

  const totalAmount = filteredPayouts.reduce((sum, p) => sum + Number(p.amount), 0);

  const handleExportCSV = () => {
    const headers = ['Client', 'Deal Type', 'Payout Type', 'Amount', 'Due Date', 'Status', 'Paid Date'];
    const rows = filteredPayouts.map((p) => [
      p.deal?.client_name || '',
      p.payout_type,
      p.amount,
      p.due_date || '',
      p.status,
      p.paid_date || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payouts-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <Header 
        title="Payouts" 
        subtitle={`${filteredPayouts.length} payouts • ${formatCurrency(totalAmount)} total`}
        action={
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        }
      />

      <div className="p-4 lg:p-6 space-y-4 animate-fade-in">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by client name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Months</SelectItem>
                {monthOptions.map((month) => (
                  <SelectItem key={month} value={month}>
                    {format(parseISO(`${month}-01`), 'MMM yyyy')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PayoutStatus | 'ALL')}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PROJECTED">Projected</SelectItem>
                <SelectItem value="INVOICED">Invoiced</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as PayoutType | 'ALL')}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {payoutTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Payouts Table */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filteredPayouts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No payouts found</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr className="bg-muted/50">
                    <th>Client</th>
                    <th>Payout Type</th>
                    <th className="text-right">Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Paid Date</th>
                    <th className="w-20">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayouts.map((payout) => (
                    <tr key={payout.id} className="group">
                      <td>
                        <Link
                          to={`/deals/${payout.deal_id}`}
                          className="font-medium hover:text-accent transition-colors"
                        >
                          {payout.deal?.client_name || 'Unknown'}
                        </Link>
                      </td>
                      <td>
                        {payout.payout_type === 'Custom'
                          ? payout.custom_type_name || 'Custom'
                          : payout.payout_type}
                      </td>
                      <td className="text-right font-semibold">
                        {formatCurrency(payout.amount)}
                      </td>
                      <td className="text-muted-foreground">
                        {formatDate(payout.due_date)}
                      </td>
                      <td>
                        <StatusBadge status={payout.status} />
                      </td>
                      <td className="text-muted-foreground">
                        {formatDate(payout.paid_date)}
                      </td>
                      <td>
                        {payout.status !== 'PAID' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-success hover:bg-success/10"
                            onClick={() => markPaid.mutate(payout.id)}
                            disabled={markPaid.isPending}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
