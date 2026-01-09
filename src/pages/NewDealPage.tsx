import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building2, Calendar as CalendarIcon, DollarSign, Users, FileText } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateDeal } from '@/hooks/useDeals';
import { useSettings } from '@/hooks/useSettings';
import { useCreatePayoutsFromTemplate } from '@/hooks/usePayouts';
import { DealFormData, DealType, DealStatus, PropertyType } from '@/lib/types';

// Format number with commas
const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return '';
  return value.toLocaleString('en-US');
};

// Parse formatted string back to number
const parseCurrency = (value: string): number | null => {
  const cleaned = value.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

export default function NewDealPage() {
  const navigate = useNavigate();
  const createDeal = useCreateDeal();
  const { data: settings } = useSettings();
  const createPayoutsFromTemplate = useCreatePayoutsFromTemplate();

  const [formData, setFormData] = useState<Partial<DealFormData>>({
    client_name: '',
    deal_type: 'BUY',
    status: 'PENDING',
    city: 'Vancouver',
  });
  const [isTeamDeal, setIsTeamDeal] = useState(false);

  const isPresale = formData.property_type === 'PRESALE';
  const isResale = formData.property_type === 'RESALE';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_name || !formData.deal_type || !formData.property_type) return;

    try {
      const deal = await createDeal.mutateAsync(formData as DealFormData);
      
      // Auto-apply payout template based on property type
      if (settings) {
        const template = isPresale 
          ? settings.presale_template 
          : settings.resale_template;
        
        await createPayoutsFromTemplate.mutateAsync({
          dealId: deal.id,
          template,
        });
      }

      navigate(`/deals/${deal.id}`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const updateField = (field: keyof DealFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePropertyTypeChange = (value: PropertyType) => {
    updateField('property_type', value);
    // Clear fields that don't apply
    if (value === 'PRESALE') {
      updateField('address', undefined);
      updateField('close_date_actual', undefined);
    } else {
      updateField('project_name', undefined);
      updateField('pending_date', undefined);
    }
  };

  return (
    <AppLayout>
      <Header 
        title="New Deal" 
        showAddDeal={false}
        action={
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="p-4 lg:p-6 max-w-4xl animate-fade-in">
        <div className="space-y-8">
          {/* Client Info */}
          <section className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-accent" />
              <h2 className="font-semibold">Client Information</h2>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name *</Label>
                <Input
                  id="client_name"
                  value={formData.client_name || ''}
                  onChange={(e) => updateField('client_name', e.target.value)}
                  placeholder="John Smith"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deal_type">Deal Type *</Label>
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
                <Label htmlFor="property_type">Property Type *</Label>
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
                <Label htmlFor="lead_source">Lead Source</Label>
                <Select
                  value={formData.lead_source || ''}
                  onValueChange={(v) => updateField('lead_source', v)}
                >
                  <SelectTrigger id="lead_source">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tiktok">Tiktok</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Youtube">Youtube</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
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
            </div>
          </section>

          {/* Property Info - Conditional based on property type */}
          {formData.property_type && (
            <section className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-accent" />
                <h2 className="font-semibold">Property Details</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {isPresale && (
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

                {isResale && (
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
          )}

          {/* Dates - Always show after property type selected */}
          {formData.property_type && (
            <section className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="w-5 h-5 text-accent" />
                <h2 className="font-semibold">Key Dates</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pending_date">Firm Date</Label>
                  <Input
                    id="pending_date"
                    type="date"
                    value={formData.pending_date || ''}
                    onChange={(e) => updateField('pending_date', e.target.value)}
                  />
                </div>

                {isResale && (
                  <div className="space-y-2">
                    <Label htmlFor="close_date_est">Closing Date</Label>
                    <Input
                      id="close_date_est"
                      type="date"
                      value={formData.close_date_est || ''}
                      onChange={(e) => updateField('close_date_est', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Financials */}
          {formData.property_type && (
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
                      value={formatCurrency(formData.sale_price)}
                      onChange={(e) => updateField('sale_price', parseCurrency(e.target.value))}
                      placeholder="1,250,000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gross_commission_est">Gross Commission</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="gross_commission_est"
                      className="pl-7"
                      value={formatCurrency(formData.gross_commission_est)}
                      onChange={(e) => updateField('gross_commission_est', parseCurrency(e.target.value))}
                      placeholder="31,250"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="net_commission_est">Net Commission</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="net_commission_est"
                      className="pl-7"
                      value={formatCurrency(formData.net_commission_est)}
                      onChange={(e) => updateField('net_commission_est', parseCurrency(e.target.value))}
                      placeholder="28,125"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {isPresale 
                    ? '✓ Presale: 2 payouts will be created (Advance + Completion)'
                    : '✓ Resale: 1 payout will be created (Completion on closing date)'
                  }
                </p>
              </div>
            </section>
          )}

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
              placeholder="Additional notes about this deal..."
              rows={4}
            />
          </section>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="btn-premium" 
              disabled={createDeal.isPending || !formData.property_type}
            >
              <Save className="w-4 h-4 mr-2" />
              {createDeal.isPending ? 'Creating...' : 'Create Deal'}
            </Button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}