import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building2, Calendar as CalendarIcon, DollarSign, Users, FileText } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
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
import { useCreateDeal } from '@/hooks/useDeals';
import { useSettings } from '@/hooks/useSettings';
import { useCreatePayoutsFromTemplate } from '@/hooks/usePayouts';
import { DealFormData, DealType, DealStatus } from '@/lib/types';

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
  const [applyTemplate, setApplyTemplate] = useState<'presale' | 'resale' | 'none'>('none');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_name || !formData.deal_type) return;

    try {
      const deal = await createDeal.mutateAsync(formData as DealFormData);
      
      // Apply payout template if selected
      if (applyTemplate !== 'none' && settings) {
        const template = applyTemplate === 'presale' 
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
                <Label htmlFor="lead_source">Lead Source</Label>
                <Input
                  id="lead_source"
                  value={formData.lead_source || ''}
                  onChange={(e) => updateField('lead_source', e.target.value)}
                  placeholder="Referral, Zillow, etc."
                />
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
                  placeholder="123 Main Street, Unit 1001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_name">Project Name</Label>
                <Input
                  id="project_name"
                  value={formData.project_name || ''}
                  onChange={(e) => updateField('project_name', e.target.value)}
                  placeholder="The Palisades"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Vancouver"
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
                  placeholder="$1,250,000"
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
                  placeholder="$31,250"
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
                  placeholder="$28,125"
                />
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-accent" />
              <h2 className="font-semibold">Team Split</h2>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="team_member">Team Member</Label>
                <Input
                  id="team_member"
                  value={formData.team_member || ''}
                  onChange={(e) => updateField('team_member', e.target.value)}
                  placeholder="Partner name"
                />
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
          </section>

          {/* Payout Template */}
          <section className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-accent" />
              <h2 className="font-semibold">Payout Template</h2>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Optionally create payout rows based on a template
              </p>
              <Select
                value={applyTemplate}
                onValueChange={(v) => setApplyTemplate(v as 'presale' | 'resale' | 'none')}
              >
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No template</SelectItem>
                  <SelectItem value="presale">Presale ({settings?.presale_template?.length || 5} payouts)</SelectItem>
                  <SelectItem value="resale">Resale ({settings?.resale_template?.length || 1} payout)</SelectItem>
                </SelectContent>
              </Select>
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
            <Button type="submit" className="btn-premium" disabled={createDeal.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {createDeal.isPending ? 'Creating...' : 'Create Deal'}
            </Button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
