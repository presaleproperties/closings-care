import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Plus, 
  Check, 
  Building2, 
  Calendar as CalendarIcon, 
  DollarSign, 
  Users, 
  FileText,
  MoreHorizontal
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useDeal, useUpdateDeal, useDeleteDeal } from '@/hooks/useDeals';
import { 
  useDealPayouts, 
  useCreatePayout, 
  useUpdatePayout, 
  useMarkPayoutPaid,
  useDeletePayout 
} from '@/hooks/usePayouts';
import { formatCurrency, formatDate } from '@/lib/format';
import { DealFormData, DealType, DealStatus, PayoutType, PayoutStatus, PayoutFormData } from '@/lib/types';

const payoutTypes: PayoutType[] = ['Advance', '2nd Payment', '3rd Deposit', '4th Deposit', 'Completion', 'Custom'];

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: deal, isLoading } = useDeal(id);
  const { data: payouts = [] } = useDealPayouts(id);
  const updateDeal = useUpdateDeal();
  const deleteDeal = useDeleteDeal();
  const createPayout = useCreatePayout();
  const updatePayout = useUpdatePayout();
  const markPaid = useMarkPayoutPaid();
  const deletePayout = useDeletePayout();

  const [formData, setFormData] = useState<Partial<DealFormData>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [editingPayout, setEditingPayout] = useState<string | null>(null);
  const [payoutForm, setPayoutForm] = useState<Partial<PayoutFormData>>({
    payout_type: 'Completion',
    amount: 0,
    status: 'PROJECTED',
  });

  useEffect(() => {
    if (deal) {
      setFormData({
        client_name: deal.client_name,
        deal_type: deal.deal_type,
        address: deal.address || '',
        project_name: deal.project_name || '',
        city: deal.city || '',
        listing_date: deal.listing_date || '',
        pending_date: deal.pending_date || '',
        close_date_est: deal.close_date_est || '',
        close_date_actual: deal.close_date_actual || '',
        sale_price: deal.sale_price || undefined,
        gross_commission_est: deal.gross_commission_est || undefined,
        net_commission_est: deal.net_commission_est || undefined,
        gross_commission_actual: deal.gross_commission_actual || undefined,
        net_commission_actual: deal.net_commission_actual || undefined,
        team_member: deal.team_member || '',
        team_member_portion: deal.team_member_portion || undefined,
        lead_source: deal.lead_source || '',
        notes: deal.notes || '',
        status: deal.status,
      });
    }
  }, [deal]);

  const updateField = (field: keyof DealFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!id) return;
    await updateDeal.mutateAsync({ id, data: formData });
    setHasChanges(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    await deleteDeal.mutateAsync(id);
    navigate('/deals');
  };

  const handleAddPayout = () => {
    setEditingPayout(null);
    setPayoutForm({
      payout_type: 'Completion',
      amount: 0,
      status: 'PROJECTED',
    });
    setShowPayoutDialog(true);
  };

  const handleEditPayout = (payoutId: string) => {
    const payout = payouts.find((p) => p.id === payoutId);
    if (payout) {
      setEditingPayout(payoutId);
      setPayoutForm({
        payout_type: payout.payout_type,
        custom_type_name: payout.custom_type_name || '',
        amount: payout.amount,
        due_date: payout.due_date || '',
        status: payout.status,
        paid_date: payout.paid_date || '',
        notes: payout.notes || '',
      });
      setShowPayoutDialog(true);
    }
  };

  const handleSavePayout = async () => {
    if (!id) return;
    
    if (editingPayout) {
      await updatePayout.mutateAsync({ id: editingPayout, data: payoutForm });
    } else {
      await createPayout.mutateAsync({ ...payoutForm, deal_id: id } as PayoutFormData);
    }
    
    setShowPayoutDialog(false);
  };

  const totalPayouts = payouts.reduce((sum, p) => sum + Number(p.amount), 0);
  const paidPayouts = payouts.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + Number(p.amount), 0);

  if (isLoading) {
    return (
      <AppLayout>
        <Header title="Loading..." showAddDeal={false} />
        <div className="p-6 text-center text-muted-foreground">Loading deal...</div>
      </AppLayout>
    );
  }

  if (!deal) {
    return (
      <AppLayout>
        <Header title="Deal Not Found" showAddDeal={false} />
        <div className="p-6 text-center">
          <p className="text-muted-foreground mb-4">This deal could not be found.</p>
          <Button asChild>
            <Link to="/deals">Back to Deals</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Header 
        title={deal.client_name}
        subtitle={deal.address || deal.project_name || undefined}
        showAddDeal={false}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/deals')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {hasChanges && (
              <Button onClick={handleSave} className="btn-premium" disabled={updateDeal.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            )}
          </div>
        }
      />

      <div className="p-4 lg:p-6 max-w-6xl animate-fade-in">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Info */}
            <section className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  <h2 className="font-semibold">Client Information</h2>
                </div>
                <StatusBadge status={deal.status} />
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Client Name</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name || ''}
                    onChange={(e) => updateField('client_name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deal_type">Deal Type</Label>
                  <Select
                    value={formData.deal_type}
                    onValueChange={(v) => updateField('deal_type', v as DealType)}
                  >
                    <SelectTrigger id="deal_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUY">Buy</SelectItem>
                      <SelectItem value="SELL">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => updateField('status', v as DealStatus)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lead_source">Lead Source</Label>
                  <Input
                    id="lead_source"
                    value={formData.lead_source || ''}
                    onChange={(e) => updateField('lead_source', e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Property Info */}
            <section className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-accent" />
                <h2 className="font-semibold">Property Details</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => updateField('address', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project_name">Project Name</Label>
                  <Input
                    id="project_name"
                    value={formData.project_name || ''}
                    onChange={(e) => updateField('project_name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city || ''}
                    onChange={(e) => updateField('city', e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Dates */}
            <section className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="w-5 h-5 text-accent" />
                <h2 className="font-semibold">Key Dates</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="listing_date">Listing Date</Label>
                  <Input
                    id="listing_date"
                    type="date"
                    value={formData.listing_date || ''}
                    onChange={(e) => updateField('listing_date', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pending_date">Pending Date</Label>
                  <Input
                    id="pending_date"
                    type="date"
                    value={formData.pending_date || ''}
                    onChange={(e) => updateField('pending_date', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="close_date_est">Est. Close Date</Label>
                  <Input
                    id="close_date_est"
                    type="date"
                    value={formData.close_date_est || ''}
                    onChange={(e) => updateField('close_date_est', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="close_date_actual">Actual Close Date</Label>
                  <Input
                    id="close_date_actual"
                    type="date"
                    value={formData.close_date_actual || ''}
                    onChange={(e) => updateField('close_date_actual', e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Financials */}
            <section className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-accent" />
                <h2 className="font-semibold">Financials</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sale_price">Sale Price</Label>
                  <Input
                    id="sale_price"
                    type="number"
                    step="0.01"
                    value={formData.sale_price || ''}
                    onChange={(e) => updateField('sale_price', parseFloat(e.target.value) || null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gross_commission_est">Gross Commission (Est)</Label>
                  <Input
                    id="gross_commission_est"
                    type="number"
                    step="0.01"
                    value={formData.gross_commission_est || ''}
                    onChange={(e) => updateField('gross_commission_est', parseFloat(e.target.value) || null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="net_commission_est">Net Commission (Est)</Label>
                  <Input
                    id="net_commission_est"
                    type="number"
                    step="0.01"
                    value={formData.net_commission_est || ''}
                    onChange={(e) => updateField('net_commission_est', parseFloat(e.target.value) || null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gross_commission_actual">Gross Commission (Actual)</Label>
                  <Input
                    id="gross_commission_actual"
                    type="number"
                    step="0.01"
                    value={formData.gross_commission_actual || ''}
                    onChange={(e) => updateField('gross_commission_actual', parseFloat(e.target.value) || null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="net_commission_actual">Net Commission (Actual)</Label>
                  <Input
                    id="net_commission_actual"
                    type="number"
                    step="0.01"
                    value={formData.net_commission_actual || ''}
                    onChange={(e) => updateField('net_commission_actual', parseFloat(e.target.value) || null)}
                  />
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-accent" />
                <h2 className="font-semibold">Notes</h2>
              </div>
              
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={4}
              />
            </section>

            {/* Delete */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Deal
              </Button>
            </div>
          </div>

          {/* Payouts Sidebar */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Payouts</h2>
                <Button size="sm" onClick={handleAddPayout} className="btn-premium">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              {/* Payout Summary */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-semibold">{formatCurrency(totalPayouts)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="font-semibold text-success">{formatCurrency(paidPayouts)}</p>
                </div>
              </div>

              {/* Payouts List */}
              {payouts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No payouts yet
                </p>
              ) : (
                <div className="space-y-2">
                  {payouts.map((payout) => (
                    <div
                      key={payout.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            {payout.payout_type === 'Custom' 
                              ? payout.custom_type_name || 'Custom' 
                              : payout.payout_type}
                          </p>
                          <StatusBadge status={payout.status} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(payout.due_date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {formatCurrency(payout.amount)}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {payout.status !== 'PAID' && (
                              <DropdownMenuItem onClick={() => markPaid.mutate(payout.id)}>
                                <Check className="w-4 h-4 mr-2" />
                                Mark Paid
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleEditPayout(payout.id)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deletePayout.mutate({ id: payout.id, dealId: id! })}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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

      {/* Payout Dialog */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPayout ? 'Edit Payout' : 'Add Payout'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={payoutForm.payout_type}
                  onValueChange={(v) => setPayoutForm((p) => ({ ...p, payout_type: v as PayoutType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {payoutTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={payoutForm.status}
                  onValueChange={(v) => setPayoutForm((p) => ({ ...p, status: v as PayoutStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROJECTED">Projected</SelectItem>
                    <SelectItem value="INVOICED">Invoiced</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {payoutForm.payout_type === 'Custom' && (
              <div className="space-y-2">
                <Label>Custom Name</Label>
                <Input
                  value={payoutForm.custom_type_name || ''}
                  onChange={(e) => setPayoutForm((p) => ({ ...p, custom_type_name: e.target.value }))}
                  placeholder="e.g., Deposit Release"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={payoutForm.amount || ''}
                onChange={(e) => setPayoutForm((p) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={payoutForm.due_date || ''}
                  onChange={(e) => setPayoutForm((p) => ({ ...p, due_date: e.target.value }))}
                />
              </div>

              {payoutForm.status === 'PAID' && (
                <div className="space-y-2">
                  <Label>Paid Date</Label>
                  <Input
                    type="date"
                    value={payoutForm.paid_date || ''}
                    onChange={(e) => setPayoutForm((p) => ({ ...p, paid_date: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={payoutForm.notes || ''}
                onChange={(e) => setPayoutForm((p) => ({ ...p, notes: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePayout} className="btn-premium">
              {editingPayout ? 'Save' : 'Add Payout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
