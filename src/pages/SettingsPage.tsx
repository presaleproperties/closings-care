import { useState, useEffect } from 'react';
import { Save, Plus, X, MapPin, Building2, User, Info } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { PROVINCES, PROVINCE_NAMES, Province, TaxType, getTaxBrackets } from '@/lib/taxCalculator';
import { cn } from '@/lib/utils';

const defaultPresale = ['Advance', '2nd Payment', '3rd Deposit', '4th Deposit', 'Completion'];
const defaultResale = ['Completion'];

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [taxPercent, setTaxPercent] = useState(0);
  const [brokeragePercent, setBrokeragePercent] = useState(0);
  const [applyTaxToForecasts, setApplyTaxToForecasts] = useState(false);
  const [country, setCountry] = useState('CA');
  const [province, setProvince] = useState<Province>('BC');
  const [taxType, setTaxType] = useState<TaxType>('self-employed');
  const [presaleTemplate, setPresaleTemplate] = useState<string[]>(defaultPresale);
  const [resaleTemplate, setResaleTemplate] = useState<string[]>(defaultResale);
  const [newPresaleItem, setNewPresaleItem] = useState('');
  const [newResaleItem, setNewResaleItem] = useState('');

  useEffect(() => {
    if (settings) {
      setTaxPercent(settings.tax_set_aside_percent || 0);
      setBrokeragePercent(settings.brokerage_split_percent || 0);
      setApplyTaxToForecasts(settings.apply_tax_to_forecasts || false);
      setCountry((settings as any).country || 'CA');
      setProvince(((settings as any).province || 'BC') as Province);
      setTaxType(((settings as any).tax_type || 'self-employed') as TaxType);
      setPresaleTemplate(settings.presale_template || defaultPresale);
      setResaleTemplate(settings.resale_template || defaultResale);
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      tax_set_aside_percent: taxPercent,
      brokerage_split_percent: brokeragePercent,
      apply_tax_to_forecasts: applyTaxToForecasts,
      country,
      province,
      tax_type: taxType,
      presale_template: presaleTemplate,
      resale_template: resaleTemplate,
    } as any);
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

  // Get tax bracket info for display
  const taxBrackets = getTaxBrackets(province, taxType);

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
        {/* Tax Jurisdiction */}
        <section className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-accent" />
            <h2 className="font-semibold">Tax Jurisdiction</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Select your location to apply accurate CRA federal and provincial tax brackets
          </p>
          
          <div className="space-y-6">
            {/* Country */}
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Currently only Canadian tax brackets are supported
              </p>
            </div>

            {/* Province */}
            <div className="space-y-2">
              <Label>Province / Territory</Label>
              <Select value={province} onValueChange={(v) => setProvince(v as Province)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((prov) => (
                    <SelectItem key={prov} value={prov}>
                      {PROVINCE_NAMES[prov]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tax Type Toggle */}
            <div className="space-y-3">
              <Label>Tax Filing Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTaxType('self-employed')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all text-left',
                    taxType === 'self-employed'
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-muted-foreground'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className={cn('w-4 h-4', taxType === 'self-employed' ? 'text-accent' : 'text-muted-foreground')} />
                    <span className={cn('font-medium', taxType === 'self-employed' && 'text-accent')}>
                      Self-Employed
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Personal income tax brackets + CPP contributions
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setTaxType('corporation')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all text-left',
                    taxType === 'corporation'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-border hover:border-muted-foreground'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className={cn('w-4 h-4', taxType === 'corporation' ? 'text-purple-400' : 'text-muted-foreground')} />
                    <span className={cn('font-medium', taxType === 'corporation' && 'text-purple-400')}>
                      Corporation
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Small business & general corporate rates
                  </p>
                </button>
              </div>
            </div>

            {/* Tax Bracket Preview */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {taxType === 'corporation' ? 'Corporate Tax Rates' : 'Tax Brackets'} - {PROVINCE_NAMES[province]}
                </span>
              </div>
              
              {taxType === 'corporation' && taxBrackets.corporateRates ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Small Business Rate (first $500K)</span>
                    <span className="font-medium text-success">{(taxBrackets.corporateRates.small * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">General Rate (above $500K)</span>
                    <span className="font-medium">{(taxBrackets.corporateRates.general * 100).toFixed(1)}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                    Combined federal + provincial rates. Small business deduction applies to active business income.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Federal Brackets</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {taxBrackets.federal.slice(0, 3).map((bracket, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {bracket.max === Infinity ? `$${(bracket.min / 1000).toFixed(0)}K+` : `$${(bracket.min / 1000).toFixed(0)}K - $${(bracket.max / 1000).toFixed(0)}K`}
                          </span>
                          <span>{(bracket.rate * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Provincial Brackets ({province})</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {taxBrackets.provincial.slice(0, 3).map((bracket, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {bracket.max === Infinity ? `$${(bracket.min / 1000).toFixed(0)}K+` : `$${(bracket.min / 1000).toFixed(0)}K - $${(bracket.max / 1000).toFixed(0)}K`}
                          </span>
                          <span>{(bracket.rate * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                    Self-employed individuals also pay CPP contributions (11.9% on earnings up to $68,500)
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

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
