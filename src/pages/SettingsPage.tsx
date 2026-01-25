import { useState, useEffect } from 'react';
import { Save, Plus, X, MapPin, Building2, User, Info, Moon, Sun, Monitor, Download, Trash2, AlertTriangle, PiggyBank, Crown, Check, Sparkles, Target } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useDataExport } from '@/hooks/useDataExport';
import { useSubscription } from '@/hooks/useSubscription';
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
  
  // Tax safety settings
  const [gstRegistered, setGstRegistered] = useState(false);
  const [gstRate, setGstRate] = useState(5);
  const [taxBuffer, setTaxBuffer] = useState(5);
  const [taxCalculationMethod, setTaxCalculationMethod] = useState<'progressive' | 'flat'>('progressive');
  const [taxSavedAmount, setTaxSavedAmount] = useState(0);
  
  // Brokerage cap settings
  const [brokerageCapEnabled, setBrokerageCapEnabled] = useState(false);
  const [brokerageCapAmount, setBrokerageCapAmount] = useState(0);
  const [brokerageCapStartDate, setBrokerageCapStartDate] = useState('');

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
      // New tax settings
      setGstRegistered((settings as any).gst_registered || false);
      setGstRate(((settings as any).gst_rate || 0.05) * 100);
      setTaxBuffer((settings as any).tax_buffer_percent || 5);
      setTaxCalculationMethod((settings as any).tax_calculation_method || 'progressive');
      setTaxSavedAmount((settings as any).tax_saved_amount || 0);
      // Brokerage cap settings
      setBrokerageCapEnabled((settings as any).brokerage_cap_enabled || false);
      setBrokerageCapAmount((settings as any).brokerage_cap_amount || 0);
      setBrokerageCapStartDate((settings as any).brokerage_cap_start_date || '');
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
      // New tax settings
      gst_registered: gstRegistered,
      gst_rate: gstRate / 100,
      tax_buffer_percent: taxBuffer,
      tax_calculation_method: taxCalculationMethod,
      tax_saved_amount: taxSavedAmount,
      // Brokerage cap settings
      brokerage_cap_enabled: brokerageCapEnabled,
      brokerage_cap_amount: brokerageCapAmount,
      brokerage_cap_start_date: brokerageCapStartDate || null,
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
        {/* Appearance */}
        <AppearanceSection />

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

        {/* Tax Safety Settings */}
        <section className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <PiggyBank className="w-5 h-5 text-warning" />
            <h2 className="font-semibold">Tax Safety Settings</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Configure how the app calculates and tracks your tax obligations
          </p>
          
          <div className="space-y-6">
            {/* Tax Calculation Method */}
            <div className="space-y-3">
              <Label>Tax Calculation Method</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTaxCalculationMethod('progressive')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all text-left',
                    taxCalculationMethod === 'progressive'
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-muted-foreground'
                  )}
                >
                  <span className={cn('font-medium', taxCalculationMethod === 'progressive' && 'text-accent')}>
                    Progressive (Recommended)
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Uses actual CRA tax brackets for accurate calculations
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setTaxCalculationMethod('flat')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all text-left',
                    taxCalculationMethod === 'flat'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-muted-foreground'
                  )}
                >
                  <span className={cn('font-medium', taxCalculationMethod === 'flat' && 'text-primary')}>
                    Flat Percentage
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Simple flat rate for quick estimates
                  </p>
                </button>
              </div>
            </div>

            {/* Flat Tax Rate (only shown if flat method selected) */}
            {taxCalculationMethod === 'flat' && (
              <div className="space-y-2">
                <Label htmlFor="tax">Flat Tax Rate (%)</Label>
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
            )}

            {/* Conservative Buffer */}
            <div className="space-y-2">
              <Label htmlFor="buffer">Conservative Buffer (%)</Label>
              <p className="text-sm text-muted-foreground">
                Extra buffer to protect from underestimating taxes
              </p>
              <div className="flex items-center gap-3">
                <Input
                  id="buffer"
                  type="number"
                  min="0"
                  max="25"
                  step="1"
                  value={taxBuffer}
                  onChange={(e) => setTaxBuffer(parseFloat(e.target.value) || 0)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">Default: 5%</span>
              </div>
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 mt-2">
                <p className="text-xs text-warning">
                  This extra buffer protects you from tax surprises. The higher the buffer, the more conservative your estimates.
                </p>
              </div>
            </div>

            {/* GST Settings */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="gstRegistered">GST/HST Registered</Label>
                  <p className="text-sm text-muted-foreground">
                    Are you registered to collect GST/HST?
                  </p>
                </div>
                <Switch
                  id="gstRegistered"
                  checked={gstRegistered}
                  onCheckedChange={setGstRegistered}
                />
              </div>

              {gstRegistered && (
                <div className="space-y-2 pl-4 border-l-2 border-warning/30">
                  <Label htmlFor="gstRate">GST/HST Rate (%)</Label>
                  <p className="text-sm text-muted-foreground">
                    Your applicable GST/HST rate (BC: 5% GST, Ontario: 13% HST)
                  </p>
                  <Input
                    id="gstRate"
                    type="number"
                    min="0"
                    max="15"
                    step="0.5"
                    value={gstRate}
                    onChange={(e) => setGstRate(parseFloat(e.target.value) || 5)}
                    className="w-24"
                  />
                </div>
              )}
            </div>

            {/* Tax Saved Amount */}
            <div className="space-y-2 pt-4 border-t border-border">
              <Label htmlFor="taxSaved">Tax Already Saved ($)</Label>
              <p className="text-sm text-muted-foreground">
                How much have you already set aside for taxes this year?
              </p>
              <Input
                id="taxSaved"
                type="number"
                min="0"
                step="100"
                value={taxSavedAmount}
                onChange={(e) => setTaxSavedAmount(parseFloat(e.target.value) || 0)}
                className="w-40"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
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

        {/* Financial Settings */}
        <section className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Brokerage Settings</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="brokerage">Brokerage Split (%)</Label>
              <p className="text-sm text-muted-foreground">
                Percentage of commission that goes to brokerage before hitting cap
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

            {/* Brokerage Cap Toggle */}
            <div className="pt-4 border-t border-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="capEnabled">Enable Brokerage Cap</Label>
                  <p className="text-sm text-muted-foreground">
                    Track progress toward your annual cap and switch to 100% split after reaching it
                  </p>
                </div>
                <Switch
                  id="capEnabled"
                  checked={brokerageCapEnabled}
                  onCheckedChange={setBrokerageCapEnabled}
                />
              </div>

              {brokerageCapEnabled && (
                <div className="space-y-4 pl-4 border-l-2 border-primary/30">
                  <div className="space-y-2">
                    <Label htmlFor="capAmount">Annual Cap Amount ($)</Label>
                    <p className="text-sm text-muted-foreground">
                      Total brokerage fees until you hit 100% split
                    </p>
                    <Input
                      id="capAmount"
                      type="number"
                      min="0"
                      step="100"
                      value={brokerageCapAmount}
                      onChange={(e) => setBrokerageCapAmount(parseFloat(e.target.value) || 0)}
                      className="w-40"
                      placeholder="e.g., 25000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capStartDate">Cap Anniversary Date</Label>
                    <p className="text-sm text-muted-foreground">
                      When your cap year starts (resets annually on this date)
                    </p>
                    <Input
                      id="capStartDate"
                      type="date"
                      value={brokerageCapStartDate}
                      onChange={(e) => setBrokerageCapStartDate(e.target.value)}
                      className="w-48"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <p className="text-xs text-primary">
                      <strong>How it works:</strong> Once you've paid {brokeragePercent}% on enough deals to total ${brokerageCapAmount.toLocaleString()}, you'll automatically switch to keeping 100% of your commission until your anniversary date.
                    </p>
                  </div>
                </div>
              )}
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

        {/* Subscription */}
        <SubscriptionSection />

        {/* Data Export */}
        <DataExportSection />

        {/* Delete Account */}
        <DeleteAccountSection />
      </div>
    </AppLayout>
  );
}

// Appearance Section Component
function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sun className="w-5 h-5 text-accent" />
          <h2 className="font-semibold">Appearance</h2>
        </div>
        <div className="h-16 animate-pulse bg-muted rounded-lg" />
      </section>
    );
  }

  return (
    <section className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sun className="w-5 h-5 text-accent" />
        <h2 className="font-semibold">Appearance</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Choose your preferred theme
      </p>
      
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={cn(
            'p-4 rounded-xl border-2 transition-all text-center',
            theme === 'light'
              ? 'border-accent bg-accent/10'
              : 'border-border hover:border-muted-foreground'
          )}
        >
          <Sun className={cn(
            'w-6 h-6 mx-auto mb-2',
            theme === 'light' ? 'text-accent' : 'text-muted-foreground'
          )} />
          <span className={cn(
            'text-sm font-medium',
            theme === 'light' && 'text-accent'
          )}>
            Light
          </span>
        </button>
        
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={cn(
            'p-4 rounded-xl border-2 transition-all text-center',
            theme === 'dark'
              ? 'border-accent bg-accent/10'
              : 'border-border hover:border-muted-foreground'
          )}
        >
          <Moon className={cn(
            'w-6 h-6 mx-auto mb-2',
            theme === 'dark' ? 'text-accent' : 'text-muted-foreground'
          )} />
          <span className={cn(
            'text-sm font-medium',
            theme === 'dark' && 'text-accent'
          )}>
            Dark
          </span>
        </button>
        
        <button
          type="button"
          onClick={() => setTheme('system')}
          className={cn(
            'p-4 rounded-xl border-2 transition-all text-center',
            theme === 'system'
              ? 'border-accent bg-accent/10'
              : 'border-border hover:border-muted-foreground'
          )}
        >
          <Monitor className={cn(
            'w-6 h-6 mx-auto mb-2',
            theme === 'system' ? 'text-accent' : 'text-muted-foreground'
          )} />
          <span className={cn(
            'text-sm font-medium',
            theme === 'system' && 'text-accent'
          )}>
            System
          </span>
        </button>
      </div>
    </section>
  );
}

// Subscription Section
function SubscriptionSection() {
  const { tier, limits, usage, isPro, isFree } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const PRO_FEATURES = [
    'Unlimited deals',
    'Full expense tracking',
    '12-month projections',
    'Tax set-aside calculator',
    'Safe-to-spend tracking',
    'Data export',
    'Priority support',
  ];

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Please sign in to upgrade');
      }

      const response = await supabase.functions.invoke('create-checkout', {
        body: { returnUrl: window.location.origin },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      const { toast } = await import('@/hooks/use-toast');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start checkout',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Please sign in');
      }

      const response = await supabase.functions.invoke('create-portal-session', {
        body: { returnUrl: window.location.origin },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Handle case where user was manually upgraded (no Stripe customer)
      if (response.data?.noStripeCustomer || response.data?.noActiveSubscription) {
        const { toast } = await import('@/hooks/use-toast');
        toast({
          title: 'Admin-Managed Subscription',
          description: response.data.message || 'Your subscription is managed by an administrator.',
        });
        return;
      }

      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      const { toast } = await import('@/hooks/use-toast');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to open subscription portal',
        variant: 'destructive',
      });
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <section id="subscription" className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Crown className={cn("w-5 h-5", isPro ? "text-amber-400" : "text-muted-foreground")} />
        <h2 className="font-semibold">Subscription</h2>
        <span className={cn(
          "px-2 py-0.5 rounded-full text-xs font-medium",
          isPro ? "bg-amber-500/15 text-amber-500" : "bg-muted text-muted-foreground"
        )}>
          {isPro ? 'Pro' : 'Free'}
        </span>
      </div>

      {isFree ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Deals Used</span>
              <span className="text-sm font-bold">{usage.dealsUsed} / {limits.maxDeals}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(100, usage.percentUsed)}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">Upgrade to Pro</p>
                <p className="text-sm text-muted-foreground">Unlock unlimited deals and all features</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {PRO_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs">
                  <Check className="w-3 h-3 text-success shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold">$29</span>
              <span className="text-muted-foreground">CAD/month</span>
            </div>

            <Button 
              className="w-full btn-premium" 
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start 14-Day Free Trial
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Pro Plan Active</p>
                <p className="text-sm text-muted-foreground">You have access to all features</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {PRO_FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50">
                <Check className="w-4 h-4 text-success shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleManageSubscription}
            disabled={portalLoading}
          >
            {portalLoading ? (
              <>
                <span className="w-4 h-4 mr-2 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              'Manage Subscription'
            )}
          </Button>
        </div>
      )}
    </section>
  );
}

// Data Export Section
function DataExportSection() {
  const { exportDeals, exportPayouts, exportExpenses, exportAll, counts } = useDataExport();

  return (
    <section className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Download className="w-5 h-5 text-accent" />
        <h2 className="font-semibold">Export Data</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Download your data as CSV files for backup or accounting purposes
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <p className="font-medium text-sm">Deals</p>
            <p className="text-xs text-muted-foreground">{counts.deals} records</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportDeals} disabled={counts.deals === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <p className="font-medium text-sm">Payouts</p>
            <p className="text-xs text-muted-foreground">{counts.payouts} records</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportPayouts} disabled={counts.payouts === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <p className="font-medium text-sm">Expenses</p>
            <p className="text-xs text-muted-foreground">{counts.expenses} records</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportExpenses} disabled={counts.expenses === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="pt-3 border-t border-border">
          <Button onClick={exportAll} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export All Data
          </Button>
        </div>
      </div>
    </section>
  );
}

// Delete Account Section
function DeleteAccountSection() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const { deleteAccount } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    
    setLoading(true);
    const { error } = await deleteAccount();
    
    if (error) {
      console.error('Failed to delete account:', error);
      setLoading(false);
      return;
    }
    
    navigate('/auth');
  };

  return (
    <section className="bg-card border border-destructive/30 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h2 className="font-semibold text-destructive">Danger Zone</h2>
      </div>

      {!showConfirm ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button 
            variant="destructive" 
            onClick={() => setShowConfirm(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm font-medium text-destructive mb-2">
              ⚠️ This will permanently delete:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>All your deals and payouts</li>
              <li>All expense records</li>
              <li>All properties and settings</li>
              <li>Your account and profile</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Type DELETE to confirm</Label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="font-mono"
            />
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowConfirm(false);
                setConfirmText('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={confirmText !== 'DELETE' || loading}
              className="flex-1"
            >
              {loading ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
