import { useState, useEffect } from 'react';
import { Save, Plus, X } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

const defaultPresale = ['Advance', '2nd Payment', '3rd Deposit', '4th Deposit', 'Completion'];
const defaultResale = ['Completion'];

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [taxPercent, setTaxPercent] = useState(0);
  const [brokeragePercent, setBrokeragePercent] = useState(0);
  const [applyTaxToForecasts, setApplyTaxToForecasts] = useState(false);
  const [presaleTemplate, setPresaleTemplate] = useState<string[]>(defaultPresale);
  const [resaleTemplate, setResaleTemplate] = useState<string[]>(defaultResale);
  const [newPresaleItem, setNewPresaleItem] = useState('');
  const [newResaleItem, setNewResaleItem] = useState('');

  useEffect(() => {
    if (settings) {
      setTaxPercent(settings.tax_set_aside_percent || 0);
      setBrokeragePercent(settings.brokerage_split_percent || 0);
      setApplyTaxToForecasts(settings.apply_tax_to_forecasts || false);
      setPresaleTemplate(settings.presale_template || defaultPresale);
      setResaleTemplate(settings.resale_template || defaultResale);
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      tax_set_aside_percent: taxPercent,
      brokerage_split_percent: brokeragePercent,
      apply_tax_to_forecasts: applyTaxToForecasts,
      presale_template: presaleTemplate,
      resale_template: resaleTemplate,
    });
  };

  const addPresaleItem = () => {
    if (newPresaleItem.trim()) {
      setPresaleTemplate([...presaleTemplate, newPresaleItem.trim()]);
      setNewPresaleItem('');
    }
  };

  const removePresaleItem = (index: number) => {
    setPresaleTemplate(presaleTemplate.filter((_, i) => i !== index));
  };

  const addResaleItem = () => {
    if (newResaleItem.trim()) {
      setResaleTemplate([...resaleTemplate, newResaleItem.trim()]);
      setNewResaleItem('');
    }
  };

  const removeResaleItem = (index: number) => {
    setResaleTemplate(resaleTemplate.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <AppLayout>
        <Header title="Settings" showAddDeal={false} />
        <div className="p-6 text-center text-muted-foreground">Loading...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Header 
        title="Settings" 
        showAddDeal={false}
        action={
          <Button onClick={handleSave} className="btn-premium" disabled={updateSettings.isPending}>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        }
      />

      <div className="p-4 lg:p-6 max-w-2xl space-y-6 animate-fade-in">
        {/* Financial Settings */}
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Financial Settings</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tax">Tax Set-Aside (%)</Label>
              <p className="text-sm text-muted-foreground">
                Percentage of income to set aside for taxes
              </p>
              <Input
                id="tax"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={taxPercent}
                onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                className="w-32"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brokerage">Brokerage Split (%)</Label>
              <p className="text-sm text-muted-foreground">
                Percentage of commission that goes to brokerage
              </p>
              <Input
                id="brokerage"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={brokeragePercent}
                onChange={(e) => setBrokeragePercent(parseFloat(e.target.value) || 0)}
                className="w-32"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="applyTax">Apply Tax Set-Aside to Forecasts</Label>
                <p className="text-sm text-muted-foreground">
                  Show net amounts after tax deduction in forecast
                </p>
              </div>
              <Switch
                id="applyTax"
                checked={applyTaxToForecasts}
                onCheckedChange={setApplyTaxToForecasts}
              />
            </div>
          </div>
        </section>

        {/* Payout Templates */}
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Payout Templates</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Configure default payout rows when creating new deals
          </p>
          
          {/* Presale Template */}
          <div className="space-y-4 mb-8">
            <Label>Presale Template</Label>
            <p className="text-sm text-muted-foreground">
              Used for pre-construction deals with multiple deposit installments
            </p>
            
            <div className="space-y-2">
              {presaleTemplate.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-muted rounded-md text-sm">
                    {item}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePresaleItem(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newPresaleItem}
                onChange={(e) => setNewPresaleItem(e.target.value)}
                placeholder="Add payout type..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPresaleItem())}
              />
              <Button variant="outline" onClick={addPresaleItem}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Resale Template */}
          <div className="space-y-4">
            <Label>Resale Template</Label>
            <p className="text-sm text-muted-foreground">
              Used for existing property sales with single completion payout
            </p>
            
            <div className="space-y-2">
              {resaleTemplate.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-muted rounded-md text-sm">
                    {item}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeResaleItem(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newResaleItem}
                onChange={(e) => setNewResaleItem(e.target.value)}
                placeholder="Add payout type..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addResaleItem())}
              />
              <Button variant="outline" onClick={addResaleItem}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Currency (Read-only) */}
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Currency</h2>
          <p className="text-muted-foreground">
            All amounts are displayed in <strong>CAD (Canadian Dollars)</strong>
          </p>
        </section>
      </div>
    </AppLayout>
  );
}
