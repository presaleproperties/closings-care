import { useState, useEffect } from 'react';
import { Save, Plus, X, MapPin, Building2, User, Info, Moon, Sun, Monitor, Download, Trash2, AlertTriangle } from 'lucide-react';
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
