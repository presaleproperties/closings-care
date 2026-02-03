import { useState, useEffect, useMemo } from 'react';
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
  MoreHorizontal,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/DatePicker';
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
import { useDeal, useUpdateDeal, useDeleteDeal, useDeals } from '@/hooks/useDeals';
import { useSettings } from '@/hooks/useSettings';
import { usePayouts } from '@/hooks/usePayouts';
import { 
  useDealPayouts, 
  useCreatePayout, 
  useUpdatePayout, 
  useMarkPayoutPaid,
  useDeletePayout 
} from '@/hooks/usePayouts';
import { formatCurrency as formatCurrencyDisplay, formatDate } from '@/lib/format';
import { DealFormData, DealType, DealStatus, PropertyType, PayoutType, PayoutStatus, PayoutFormData } from '@/lib/types';
import { calculateNetCommission } from '@/lib/commissionCalculations';

const payoutTypes: PayoutType[] = ['Advance', '2nd Payment', '3rd Deposit', '4th Deposit', 'Completion', 'Custom'];

// Format number with commas for input display
const formatCurrencyInput = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return '';
  return value.toLocaleString('en-US');
};

// Parse formatted string back to number
const parseCurrency = (value: string): number | null => {
  const cleaned = value.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: deal, isLoading } = useDeal(id);
  const { data: allDeals = [] } = useDeals();
  const { data: payouts = [] } = useDealPayouts(id);
  const { data: allPayouts = [] } = usePayouts();
  const { data: settings } = useSettings();
  const updateDeal = useUpdateDeal();
  const deleteDeal = useDeleteDeal();
  const createPayout = useCreatePayout();
  const updatePayout = useUpdatePayout();
  const markPaid = useMarkPayoutPaid();
  const deletePayout = useDeletePayout();

  // Calculate prev/next deal for navigation
  const dealNavigation = useMemo(() => {
    if (!id || allDeals.length === 0) return { prev: null, next: null, currentIndex: -1, total: 0 };
    
    const currentIndex = allDeals.findIndex(d => d.id === id);
    if (currentIndex === -1) return { prev: null, next: null, currentIndex: -1, total: 0 };
    
    return {
      prev: currentIndex > 0 ? allDeals[currentIndex - 1].id : null,
      next: currentIndex < allDeals.length - 1 ? allDeals[currentIndex + 1].id : null,
      currentIndex: currentIndex + 1,
      total: allDeals.length,
    };
  }, [id, allDeals]);

  const [formData, setFormData] = useState<Partial<DealFormData>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isTeamDeal, setIsTeamDeal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [editingPayout, setEditingPayout] = useState<string | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [payoutForm, setPayoutForm] = useState<Partial<PayoutFormData>>({
    payout_type: 'Completion',
    amount: 0,
    status: 'PROJECTED',
  });

  const isPresale = formData.property_type === 'PRESALE';
  const isResale = formData.property_type === 'RESALE';

  // Auto-calculate net commission when gross changes
  const netCommissionResult = useMemo(() => {
    return calculateNetCommission(
      formData.gross_commission_est || 0,
      settings as any,
      allPayouts,
      isTeamDeal ? formData.team_member_portion : undefined
    );
  }, [formData.gross_commission_est, formData.team_member_portion, settings, allPayouts, isTeamDeal]);

  // Update net commission when calculation changes
  useEffect(() => {
    if (formData.gross_commission_est && formData.gross_commission_est > 0) {
      const newNet = netCommissionResult.netAmount;
      if (newNet !== formData.net_commission_est) {
        setFormData(prev => ({ ...prev, net_commission_est: newNet }));
        setHasChanges(true);
      }
    }
  }, [netCommissionResult.netAmount]);

  useEffect(() => {
    if (deal) {
      const dealData = deal as any; // Handle extended fields from DB
      setFormData({
        client_name: deal.client_name,
        deal_type: deal.deal_type,
        property_type: deal.property_type || undefined,
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
        // Presale-specific fields
        buyer_type: dealData.buyer_type || '',
        advance_commission: dealData.advance_commission || undefined,
        completion_commission: dealData.completion_commission || undefined,
        advance_date: dealData.advance_date || '',
        completion_date: dealData.completion_date || '',
      });
      setIsTeamDeal(!!deal.team_member);
    }
  }, [deal]);

  const updateField = (field: keyof DealFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handlePropertyTypeChange = (value: PropertyType) => {
    updateField('property_type', value);
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

  const handleNavigateToDeal = (dealId: string | null) => {
    if (!dealId) return;
    if (hasChanges) {
      setPendingNavigation(dealId);
    } else {
      navigate(`/deals/${dealId}`);
    }
  };

  const confirmNavigation = () => {
    if (pendingNavigation) {
      navigate(`/deals/${pendingNavigation}`);
      setPendingNavigation(null);
      setHasChanges(false);
    }
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
            {/* Deal Navigation */}
            <div className="flex items-center gap-1 mr-2">
              <Button 
                variant="outline" 
                size="icon"
                className="h-9 w-9"
                disabled={!dealNavigation.prev}
                onClick={() => handleNavigateToDeal(dealNavigation.prev)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2 min-w-[60px] text-center">
                {dealNavigation.currentIndex} / {dealNavigation.total}
              </span>
              <Button 
                variant="outline" 
                size="icon"
                className="h-9 w-9"
                disabled={!dealNavigation.next}
                onClick={() => handleNavigateToDeal(dealNavigation.next)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
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
        {/* Deal Dashboard Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <div className="landing-card p-4 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Sale Price</div>
            <div className="text-lg font-bold text-foreground">
              {formData.sale_price ? formatCurrencyDisplay(formData.sale_price) : '—'}
            </div>
          </div>
          <div className="landing-card p-4 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Gross Commission</div>
            <div className="text-lg font-bold text-primary">
              {formData.gross_commission_est ? formatCurrencyDisplay(formData.gross_commission_est) : '—'}
            </div>
          </div>
          <div className="landing-card p-4 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Net Commission</div>
            <div className="text-lg font-bold text-accent">
              {formData.net_commission_est ? formatCurrencyDisplay(formData.net_commission_est) : '—'}
            </div>
          </div>
          <div className="landing-card p-4 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Payouts</div>
            <div className="text-lg font-bold mb-2">
              <span className="text-primary">{formatCurrencyDisplay(paidPayouts)}</span>
              <span className="text-muted-foreground text-sm font-normal"> / {formatCurrencyDisplay(totalPayouts)}</span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${totalPayouts > 0 ? Math.min((paidPayouts / totalPayouts) * 100, 100) : 0}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {totalPayouts > 0 ? Math.round((paidPayouts / totalPayouts) * 100) : 0}% collected
            </div>
          </div>
          <div className="landing-card p-4 text-center col-span-2 sm:col-span-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Status</div>
            <div className="flex justify-center">
              <StatusBadge status={deal.status} />
            </div>
          </div>
        </div>

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
                  <Label htmlFor="property_type">Property Type</Label>
                  <Select
                    value={formData.property_type || ''}
                    onValueChange={(v) => handlePropertyTypeChange(v as PropertyType)}
                  >
                    <SelectTrigger id="property_type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESALE">Presale</SelectItem>
                      <SelectItem value="RESALE">Resale</SelectItem>
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
                  <Label htmlFor="buyer_type">Buyer Type</Label>
                  <Select
                    value={formData.buyer_type || ''}
                    onValueChange={(v) => updateField('buyer_type', v)}
                  >
                    <SelectTrigger id="buyer_type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="First Time Homebuyer">First Time Homebuyer</SelectItem>
                      <SelectItem value="Investor">Investor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lead_source">Lead Source</Label>
                  <Select
                    value={formData.lead_source || ''}
                    onValueChange={(v) => updateField('lead_source', v)}
                  >
                    <SelectTrigger id="lead_source">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="Tiktok">Tiktok</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Youtube">Youtube</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Property Info - Conditional based on property type */}
            <section className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-accent" />
                <h2 className="font-semibold">Property Details</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {(isPresale || !formData.property_type) && (
                  <div className="space-y-2">
                    <Label htmlFor="project_name">Project Name</Label>
                    <Input
                      id="project_name"
                      value={formData.project_name || ''}
                      onChange={(e) => updateField('project_name', e.target.value)}
                      placeholder="The Palisades"
                    />
                  </div>
                )}

                {(isResale || !formData.property_type) && (
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="123 Main Street, Unit 1001"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Select
                    value={formData.city || ''}
                    onValueChange={(v) => updateField('city', v)}
                  >
                    <SelectTrigger id="city">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="Vancouver">Vancouver</SelectItem>
                      <SelectItem value="Burnaby">Burnaby</SelectItem>
                      <SelectItem value="Surrey">Surrey</SelectItem>
                      <SelectItem value="Langley">Langley</SelectItem>
                      <SelectItem value="Delta">Delta</SelectItem>
                      <SelectItem value="Coquitlam">Coquitlam</SelectItem>
                      <SelectItem value="Abbotsford">Abbotsford</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Dates */}
            <section className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="w-5 h-5 text-accent" />
                <h2 className="font-semibold">Key Dates</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Firm Date</Label>
                  <DatePicker
                    value={formData.pending_date}
                    onChange={(val) => updateField('pending_date', val)}
                    placeholder="Select firm date"
                  />
                </div>

                {isPresale && (
                  <>
                    <div className="space-y-2">
                      <Label>Advance Commission Date</Label>
                      <DatePicker
                        value={formData.advance_date}
                        onChange={(val) => updateField('advance_date', val)}
                        placeholder="Select advance date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Completion Date</Label>
                      <DatePicker
                        value={formData.completion_date}
                        onChange={(val) => updateField('completion_date', val)}
                        placeholder="Select completion date"
                      />
                    </div>
                  </>
                )}

                {(isResale || !formData.property_type) && (
                  <div className="space-y-2">
                    <Label>Closing Date</Label>
                    <DatePicker
                      value={formData.close_date_est}
                      onChange={(val) => updateField('close_date_est', val)}
                      placeholder="Select closing date"
                    />
                  </div>
                )}
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
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="sale_price"
                      className="pl-7"
                      value={formatCurrencyInput(formData.sale_price)}
                      onChange={(e) => updateField('sale_price', parseCurrency(e.target.value))}
                      placeholder="1,250,000"
                    />
                  </div>
                </div>

                {isPresale && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="advance_commission">Advance Commission</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          id="advance_commission"
                          className="pl-7"
                          value={formatCurrencyInput(formData.advance_commission)}
                          onChange={(e) => {
                            const val = parseCurrency(e.target.value);
                            updateField('advance_commission', val);
                            const completion = formData.completion_commission || 0;
                            updateField('gross_commission_est', (val || 0) + completion);
                          }}
                          placeholder="5,000"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="completion_commission">Completion Commission</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          id="completion_commission"
                          className="pl-7"
                          value={formatCurrencyInput(formData.completion_commission)}
                          onChange={(e) => {
                            const val = parseCurrency(e.target.value);
                            updateField('completion_commission', val);
                            const advance = formData.advance_commission || 0;
                            updateField('gross_commission_est', advance + (val || 0));
                          }}
                          placeholder="26,250"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="gross_commission_est">
                    Gross Commission {isPresale && <span className="text-xs text-muted-foreground">(auto-calculated)</span>}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="gross_commission_est"
                      className="pl-7"
                      value={formatCurrencyInput(formData.gross_commission_est)}
                      onChange={(e) => updateField('gross_commission_est', parseCurrency(e.target.value))}
                      placeholder="31,250"
                      readOnly={isPresale}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="net_commission_est">
                    Net Commission <span className="text-xs text-muted-foreground">(auto-calculated)</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="net_commission_est"
                      className="pl-7 bg-muted/50"
                      value={formatCurrencyInput(formData.net_commission_est)}
                      readOnly
                      placeholder="Auto-calculated"
                    />
                  </div>
                </div>
              </div>

              {/* Commission breakdown */}
              {formData.gross_commission_est && formData.gross_commission_est > 0 && (
                <div className="flex items-start gap-2 p-3 mt-4 bg-muted/40 rounded-lg">
                  <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <span className="font-medium text-foreground">Gross:</span> ${formatCurrencyInput(formData.gross_commission_est)}
                      {netCommissionResult.brokeragePortion > 0 && (
                        <> → <span className="text-destructive">-${formatCurrencyInput(netCommissionResult.brokeragePortion)}</span> brokerage ({netCommissionResult.splitPercent}%)</>
                      )}
                      {netCommissionResult.teamPortion > 0 && (
                        <> → <span className="text-destructive">-${formatCurrencyInput(netCommissionResult.teamPortion)}</span> team</>
                      )}
                      {' '}= <span className="font-semibold text-success">${formatCurrencyInput(netCommissionResult.netAmount)}</span> net
                    </p>
                    {netCommissionResult.capReached && (
                      <p className="text-success font-medium">✓ Brokerage cap reached - keeping 100%!</p>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Team Split */}
            <section className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-accent" />
                <h2 className="font-semibold">Team Split</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Switch 
                    id="is_team_deal"
                    checked={isTeamDeal}
                    onCheckedChange={(checked) => {
                      setIsTeamDeal(checked);
                      setHasChanges(true);
                      if (!checked) {
                        updateField('team_member', undefined);
                        updateField('team_member_portion', undefined);
                      }
                    }}
                  />
                  <Label htmlFor="is_team_deal">Is this a team deal?</Label>
                </div>

                {isTeamDeal && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="team_member">Team Member</Label>
                      <Select
                        value={formData.team_member || ''}
                        onValueChange={(v) => updateField('team_member', v)}
                      >
                        <SelectTrigger id="team_member">
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sarb">Sarb</SelectItem>
                          <SelectItem value="Ravish">Ravish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="team_member_portion">Their Portion (%)</Label>
                      <Input
                        id="team_member_portion"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.team_member_portion || ''}
                        onChange={(e) => updateField('team_member_portion', parseFloat(e.target.value) || null)}
                        placeholder="50"
                      />
                    </div>
                  </div>
                )}
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
                  <p className="font-semibold">{formatCurrencyDisplay(totalPayouts)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="font-semibold text-success">{formatCurrencyDisplay(paidPayouts)}</p>
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
                          {formatCurrencyDisplay(payout.amount)}
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

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={!!pendingNavigation} onOpenChange={(open) => !open && setPendingNavigation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={confirmNavigation}>
              Leave
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
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  className="pl-7"
                  value={formatCurrencyInput(payoutForm.amount)}
                  onChange={(e) => setPayoutForm((p) => ({ ...p, amount: parseCurrency(e.target.value) || 0 }))}
                  placeholder="10,000"
                />
              </div>
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