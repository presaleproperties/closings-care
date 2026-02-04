import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, Plus, X, MapPin, Building2, User, Info, Moon, Sun, Monitor, 
  Download, Trash2, AlertTriangle, PiggyBank, Crown, Check, Sparkles, 
  Target, Palette, FileText, CreditCard, Database, Settings2, 
  DollarSign, Percent, Calendar, Shield, TrendingUp, Wallet
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
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
import { formatCurrency } from '@/lib/format';

const defaultPresale = ['Advance', '2nd Payment', '3rd Deposit', '4th Deposit', 'Completion'];
const defaultResale = ['Completion'];

const springConfig = { type: "spring" as const, stiffness: 120, damping: 20 };

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  // All settings state
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
  
  // Goals
  const [monthlyIncomeGoal, setMonthlyIncomeGoal] = useState(0);

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
      setGstRegistered((settings as any).gst_registered || false);
      setGstRate(((settings as any).gst_rate || 0.05) * 100);
      setTaxBuffer((settings as any).tax_buffer_percent || 5);
      setTaxCalculationMethod((settings as any).tax_calculation_method || 'progressive');
      setTaxSavedAmount((settings as any).tax_saved_amount || 0);
      setBrokerageCapEnabled((settings as any).brokerage_cap_enabled || false);
      setBrokerageCapAmount((settings as any).brokerage_cap_amount || 0);
      setBrokerageCapStartDate((settings as any).brokerage_cap_start_date || '');
      setMonthlyIncomeGoal((settings as any).monthly_income_goal || 0);
    }
  }, [settings]);

  // Track changes
  useEffect(() => {
    if (settings) {
      const changed = 
        taxPercent !== (settings.tax_set_aside_percent || 0) ||
        brokeragePercent !== (settings.brokerage_split_percent || 0) ||
        applyTaxToForecasts !== (settings.apply_tax_to_forecasts || false) ||
        country !== ((settings as any).country || 'CA') ||
        province !== (((settings as any).province || 'BC') as Province) ||
        taxType !== (((settings as any).tax_type || 'self-employed') as TaxType) ||
        gstRegistered !== ((settings as any).gst_registered || false) ||
        gstRate !== (((settings as any).gst_rate || 0.05) * 100) ||
        taxBuffer !== ((settings as any).tax_buffer_percent || 5) ||
        taxCalculationMethod !== ((settings as any).tax_calculation_method || 'progressive') ||
        taxSavedAmount !== ((settings as any).tax_saved_amount || 0) ||
        brokerageCapEnabled !== ((settings as any).brokerage_cap_enabled || false) ||
        brokerageCapAmount !== ((settings as any).brokerage_cap_amount || 0) ||
        brokerageCapStartDate !== ((settings as any).brokerage_cap_start_date || '') ||
        monthlyIncomeGoal !== ((settings as any).monthly_income_goal || 0) ||
        JSON.stringify(presaleTemplate) !== JSON.stringify(settings.presale_template || defaultPresale) ||
        JSON.stringify(resaleTemplate) !== JSON.stringify(settings.resale_template || defaultResale);
      setHasChanges(changed);
    }
  }, [settings, taxPercent, brokeragePercent, applyTaxToForecasts, country, province, taxType, 
      gstRegistered, gstRate, taxBuffer, taxCalculationMethod, taxSavedAmount, brokerageCapEnabled,
      brokerageCapAmount, brokerageCapStartDate, monthlyIncomeGoal, presaleTemplate, resaleTemplate]);

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
      gst_registered: gstRegistered,
      gst_rate: gstRate / 100,
      tax_buffer_percent: taxBuffer,
      tax_calculation_method: taxCalculationMethod,
      tax_saved_amount: taxSavedAmount,
      brokerage_cap_enabled: brokerageCapEnabled,
      brokerage_cap_amount: brokerageCapAmount,
      brokerage_cap_start_date: brokerageCapStartDate || null,
      monthly_income_goal: monthlyIncomeGoal,
    } as any);
    setHasChanges(false);
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

  const taxBrackets = getTaxBrackets(province, taxType);

  if (isLoading) {
    return (
      <AppLayout>
        <Header title="Settings" showAddDeal={false} />
        <div className="p-6 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Header 
        title="Settings" 
        subtitle="Configure your CommissionIQ experience"
        showAddDeal={false}
        action={
          <Button 
            onClick={handleSave} 
            className={cn("btn-premium transition-all", !hasChanges && "opacity-50")} 
            disabled={updateSettings.isPending || !hasChanges}
          >
            <Save className="w-4 h-4 mr-2" />
            {updateSettings.isPending ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
          </Button>
        }
      />

      <motion.div 
        className="p-4 lg:p-6 max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto bg-card/80 border border-border/50 p-1.5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="tax" className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4" />
              <span className="hidden sm:inline">Tax & Finance</span>
            </TabsTrigger>
            <TabsTrigger value="brokerage" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Brokerage</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline">Plan</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <AppearanceSection />
            
            {/* Goals Section */}
            <SettingsCard 
              icon={Target} 
              title="Goals" 
              description="Set your financial targets"
              iconColor="text-primary"
              gradient="from-primary/10 to-primary/5"
            >
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Monthly Income Goal</Label>
                  <p className="text-sm text-muted-foreground">
                    Set a target to track against your actual income
                  </p>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      value={monthlyIncomeGoal}
                      onChange={(e) => setMonthlyIncomeGoal(parseFloat(e.target.value) || 0)}
                      className="w-40"
                      placeholder="e.g., 15000"
                    />
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  {monthlyIncomeGoal > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Annual target: {formatCurrency(monthlyIncomeGoal * 12)}
                    </p>
                  )}
                </div>
              </div>
            </SettingsCard>

            {/* Currency */}
            <SettingsCard 
              icon={DollarSign} 
              title="Currency" 
              description="Your display currency"
              iconColor="text-success"
              gradient="from-success/10 to-success/5"
            >
              <p className="text-muted-foreground">
                All amounts are displayed in <strong className="text-foreground">CAD (Canadian Dollars)</strong>
              </p>
            </SettingsCard>
          </TabsContent>

          {/* Tax & Finance Tab */}
          <TabsContent value="tax" className="space-y-6">
            {/* Tax Jurisdiction */}
            <SettingsCard 
              icon={MapPin} 
              title="Tax Jurisdiction" 
              description="Select your location for accurate CRA tax brackets"
              iconColor="text-accent"
              gradient="from-accent/10 to-accent/5"
            >
              <div className="grid md:grid-cols-2 gap-6">
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
              </div>

              {/* Tax Type Toggle */}
              <div className="space-y-3 pt-4 border-t border-border/50 mt-4">
                <Label>Tax Filing Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <ToggleCard
                    active={taxType === 'self-employed'}
                    onClick={() => setTaxType('self-employed')}
                    icon={User}
                    title="Self-Employed"
                    description="Personal income tax + CPP"
                    activeColor="accent"
                  />
                  <ToggleCard
                    active={taxType === 'corporation'}
                    onClick={() => setTaxType('corporation')}
                    icon={Building2}
                    title="Corporation"
                    description="Small business & general rates"
                    activeColor="violet-500"
                  />
                </div>
              </div>

              {/* Tax Bracket Preview */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {taxType === 'corporation' ? 'Corporate Tax Rates' : 'Tax Brackets'} - {PROVINCE_NAMES[province]}
                  </span>
                </div>
                
                {taxType === 'corporation' && taxBrackets.corporateRates ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Small Business (≤$500K)</span>
                      <span className="font-semibold text-success">{(taxBrackets.corporateRates.small * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">General (&gt;$500K)</span>
                      <span className="font-semibold">{(taxBrackets.corporateRates.general * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Federal Brackets</p>
                      {taxBrackets.federal.slice(0, 3).map((bracket, i) => (
                        <div key={i} className="flex justify-between text-xs py-1">
                          <span className="text-muted-foreground">
                            {bracket.max === Infinity ? `$${(bracket.min / 1000).toFixed(0)}K+` : `$${(bracket.min / 1000).toFixed(0)}K - $${(bracket.max / 1000).toFixed(0)}K`}
                          </span>
                          <span className="font-medium">{(bracket.rate * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Provincial ({province})</p>
                      {taxBrackets.provincial.slice(0, 3).map((bracket, i) => (
                        <div key={i} className="flex justify-between text-xs py-1">
                          <span className="text-muted-foreground">
                            {bracket.max === Infinity ? `$${(bracket.min / 1000).toFixed(0)}K+` : `$${(bracket.min / 1000).toFixed(0)}K - $${(bracket.max / 1000).toFixed(0)}K`}
                          </span>
                          <span className="font-medium">{(bracket.rate * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SettingsCard>

            {/* Tax Safety Settings */}
            <SettingsCard 
              icon={Shield} 
              title="Tax Safety Configuration" 
              description="Configure how taxes are calculated and tracked"
              iconColor="text-warning"
              gradient="from-warning/10 to-warning/5"
            >
              {/* Tax Calculation Method */}
              <div className="space-y-3">
                <Label>Calculation Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  <ToggleCard
                    active={taxCalculationMethod === 'progressive'}
                    onClick={() => setTaxCalculationMethod('progressive')}
                    icon={TrendingUp}
                    title="Progressive"
                    description="CRA tax brackets (recommended)"
                    activeColor="accent"
                  />
                  <ToggleCard
                    active={taxCalculationMethod === 'flat'}
                    onClick={() => setTaxCalculationMethod('flat')}
                    icon={Percent}
                    title="Flat Rate"
                    description="Simple percentage"
                    activeColor="primary"
                  />
                </div>
              </div>

              {/* Flat Tax Rate */}
              <AnimatePresence>
                {taxCalculationMethod === 'flat' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 pt-4"
                  >
                    <Label>Flat Tax Rate</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[taxPercent]}
                        onValueChange={([v]) => setTaxPercent(v)}
                        max={50}
                        step={0.5}
                        className="flex-1"
                      />
                      <div className="w-20 text-right">
                        <span className="text-2xl font-bold">{taxPercent}</span>
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Conservative Buffer */}
              <div className="space-y-3 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Conservative Buffer</Label>
                    <p className="text-sm text-muted-foreground">Extra safety margin</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[taxBuffer]}
                      onValueChange={([v]) => setTaxBuffer(v)}
                      max={25}
                      step={1}
                      className="w-32"
                    />
                    <span className="w-12 text-right font-bold">{taxBuffer}%</span>
                  </div>
                </div>
              </div>

              {/* GST Settings */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>GST/HST Registered</Label>
                    <p className="text-sm text-muted-foreground">Collect and remit GST/HST?</p>
                  </div>
                  <Switch checked={gstRegistered} onCheckedChange={setGstRegistered} />
                </div>

                <AnimatePresence>
                  {gstRegistered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-4 border-l-2 border-warning/30 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>GST/HST Rate</Label>
                          <p className="text-xs text-muted-foreground">BC: 5% GST, ON: 13% HST</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="15"
                            step="0.5"
                            value={gstRate}
                            onChange={(e) => setGstRate(parseFloat(e.target.value) || 5)}
                            className="w-20 text-center"
                          />
                          <span className="text-muted-foreground">%</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tax Already Saved */}
              <div className="space-y-3 pt-4 border-t border-border/50">
                <Label>Tax Already Saved (YTD)</Label>
                <p className="text-sm text-muted-foreground">
                  How much have you set aside for taxes this year?
                </p>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={taxSavedAmount}
                  onChange={(e) => setTaxSavedAmount(parseFloat(e.target.value) || 0)}
                  className="w-40"
                  placeholder="0"
                />
              </div>

              {/* Apply to Forecasts */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div>
                  <Label>Apply Tax to Forecasts</Label>
                  <p className="text-sm text-muted-foreground">Show net amounts after tax</p>
                </div>
                <Switch checked={applyTaxToForecasts} onCheckedChange={setApplyTaxToForecasts} />
              </div>
            </SettingsCard>
          </TabsContent>

          {/* Brokerage Tab */}
          <TabsContent value="brokerage" className="space-y-6">
            <SettingsCard 
              icon={Building2} 
              title="Brokerage Split" 
              description="Configure your commission split with your brokerage"
              iconColor="text-primary"
              gradient="from-primary/10 to-primary/5"
            >
              <div className="space-y-6">
                {/* Split Percentage */}
                <div className="space-y-3">
                  <Label>Brokerage Split Percentage</Label>
                  <p className="text-sm text-muted-foreground">
                    Percentage of commission that goes to brokerage
                  </p>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[brokeragePercent]}
                      onValueChange={([v]) => setBrokeragePercent(v)}
                      max={50}
                      step={0.5}
                      className="flex-1"
                    />
                    <div className="w-24 text-right">
                      <span className="text-2xl font-bold">{brokeragePercent}</span>
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pt-2">
                    <span>You keep: {100 - brokeragePercent}%</span>
                    <span>Brokerage: {brokeragePercent}%</span>
                  </div>
                </div>
              </div>
            </SettingsCard>

            {/* Brokerage Cap */}
            <SettingsCard 
              icon={Target} 
              title="Brokerage Cap" 
              description="Track progress toward 100% commission"
              iconColor="text-success"
              gradient="from-success/10 to-success/5"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Brokerage Cap</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch to 100% after reaching cap
                    </p>
                  </div>
                  <Switch checked={brokerageCapEnabled} onCheckedChange={setBrokerageCapEnabled} />
                </div>

                <AnimatePresence>
                  {brokerageCapEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6 pl-4 border-l-2 border-success/30"
                    >
                      <div className="space-y-2">
                        <Label>Annual Cap Amount</Label>
                        <p className="text-sm text-muted-foreground">
                          Total brokerage fees until 100% split
                        </p>
                        <Input
                          type="number"
                          min="0"
                          step="1000"
                          value={brokerageCapAmount}
                          onChange={(e) => setBrokerageCapAmount(parseFloat(e.target.value) || 0)}
                          className="w-40"
                          placeholder="25000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Cap Anniversary Date</Label>
                        <p className="text-sm text-muted-foreground">
                          When your cap year resets
                        </p>
                        <Input
                          type="date"
                          value={brokerageCapStartDate}
                          onChange={(e) => setBrokerageCapStartDate(e.target.value)}
                          className="w-48"
                        />
                      </div>

                      <div className="p-4 rounded-xl bg-success/10 border border-success/30">
                        <p className="text-sm">
                          <strong>How it works:</strong> Once you pay {brokeragePercent}% on enough deals totaling {formatCurrency(brokerageCapAmount)}, you keep 100% until your anniversary.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </SettingsCard>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <SettingsCard 
              icon={FileText} 
              title="Payout Templates" 
              description="Default payout rows when creating new deals"
              iconColor="text-violet-500"
              gradient="from-violet-500/10 to-violet-500/5"
            >
              {/* Presale Template */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Presale Template</Label>
                  <p className="text-sm text-muted-foreground">
                    For pre-construction deals with multiple deposits
                  </p>
                </div>
                
                <div className="space-y-2">
                  {presaleTemplate.map((item, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-xs font-bold text-violet-500">
                        {index + 1}
                      </div>
                      <div className="flex-1 px-4 py-2.5 bg-muted/50 rounded-xl text-sm font-medium">
                        {item}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePresaleItem(index)}
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newPresaleItem}
                    onChange={(e) => setNewPresaleItem(e.target.value)}
                    placeholder="Add payout type..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPresaleItem())}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={addPresaleItem} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Resale Template */}
              <div className="space-y-4 pt-6 border-t border-border/50">
                <div>
                  <Label className="text-base">Resale Template</Label>
                  <p className="text-sm text-muted-foreground">
                    For existing property sales
                  </p>
                </div>
                
                <div className="space-y-2">
                  {resaleTemplate.map((item, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 px-4 py-2.5 bg-muted/50 rounded-xl text-sm font-medium">
                        {item}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeResaleItem(index)}
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newResaleItem}
                    onChange={(e) => setNewResaleItem(e.target.value)}
                    placeholder="Add payout type..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addResaleItem())}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={addResaleItem} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </SettingsCard>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <SubscriptionSection />
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <DataExportSection />
            <DeleteAccountSection />
          </TabsContent>
        </Tabs>
      </motion.div>
    </AppLayout>
  );
}

// Reusable Settings Card
function SettingsCard({ 
  icon: Icon, 
  title, 
  description, 
  children, 
  iconColor = "text-primary",
  gradient = "from-primary/10 to-primary/5"
}: { 
  icon: typeof Settings2; 
  title: string; 
  description: string; 
  children: React.ReactNode;
  iconColor?: string;
  gradient?: string;
}) {
  return (
    <motion.div 
      className="landing-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfig}
    >
      <div className={cn("px-6 py-4 border-b border-border/50 bg-gradient-to-r", gradient, "to-transparent")}>
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl bg-background/80 border border-border/50 flex items-center justify-center", iconColor)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {children}
      </div>
    </motion.div>
  );
}

// Toggle Card Component
function ToggleCard({ 
  active, 
  onClick, 
  icon: Icon, 
  title, 
  description, 
  activeColor = "accent" 
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof User;
  title: string;
  description: string;
  activeColor?: string;
}) {
  const colorMap: Record<string, { border: string; bg: string; text: string }> = {
    'accent': { border: 'border-accent', bg: 'bg-accent/10', text: 'text-accent' },
    'primary': { border: 'border-primary', bg: 'bg-primary/10', text: 'text-primary' },
    'violet-500': { border: 'border-violet-500', bg: 'bg-violet-500/10', text: 'text-violet-500' },
    'success': { border: 'border-success', bg: 'bg-success/10', text: 'text-success' },
  };
  
  const colors = colorMap[activeColor] || colorMap.accent;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl border-2 transition-all text-left',
        active ? `${colors.border} ${colors.bg}` : 'border-border hover:border-muted-foreground'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn('w-4 h-4', active ? colors.text : 'text-muted-foreground')} />
        <span className={cn('font-medium', active && colors.text)}>{title}</span>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </button>
  );
}

// Appearance Section
function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <SettingsCard icon={Palette} title="Appearance" description="Choose your theme" iconColor="text-accent" gradient="from-accent/10 to-accent/5">
        <div className="h-20 animate-pulse bg-muted rounded-xl" />
      </SettingsCard>
    );
  }

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <SettingsCard icon={Palette} title="Appearance" description="Choose your preferred theme" iconColor="text-accent" gradient="from-accent/10 to-accent/5">
      <div className="grid grid-cols-3 gap-3">
        {themes.map(({ value, icon: ThemeIcon, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              'p-4 rounded-xl border-2 transition-all text-center group',
              theme === value
                ? 'border-accent bg-accent/10'
                : 'border-border hover:border-muted-foreground'
            )}
          >
            <ThemeIcon className={cn(
              'w-6 h-6 mx-auto mb-2 transition-colors',
              theme === value ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'
            )} />
            <span className={cn(
              'text-sm font-medium',
              theme === value && 'text-accent'
            )}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </SettingsCard>
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
      
      if (!session) throw new Error('Please sign in to upgrade');

      const response = await supabase.functions.invoke('create-checkout', {
        body: { returnUrl: window.location.origin },
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.url) window.location.href = response.data.url;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) throw new Error('Please sign in');

      const response = await supabase.functions.invoke('create-portal-session', {
        body: { returnUrl: window.location.origin },
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.noStripeCustomer || response.data?.noActiveSubscription) {
        return;
      }
      if (response.data?.url) window.location.href = response.data.url;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <SettingsCard 
      icon={Crown} 
      title="Subscription" 
      description={isPro ? 'Pro Plan Active' : 'Free Plan'} 
      iconColor={isPro ? "text-amber-500" : "text-muted-foreground"}
      gradient={isPro ? "from-amber-500/10 to-orange-500/5" : "from-muted/50 to-muted/20"}
    >
      {isFree ? (
        <div className="space-y-6">
          {/* Usage */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Deals Used</span>
              <span className="text-sm font-bold">{usage.dealsUsed} / {limits.maxDeals}</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, usage.percentUsed)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Upgrade CTA */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-rose-500/5 border border-amber-500/30">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg">Upgrade to Pro</p>
                <p className="text-sm text-muted-foreground">Unlock unlimited deals & all features</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-5">
              {PRO_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-success shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold">$29</span>
              <span className="text-muted-foreground">CAD/month</span>
            </div>

            <Button className="w-full btn-premium h-12 text-base" onClick={handleUpgrade} disabled={loading}>
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start 14-Day Free Trial
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/5 border border-amber-500/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg">Pro Plan Active</p>
                <p className="text-sm text-muted-foreground">All features unlocked</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {PRO_FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm p-2.5 rounded-xl bg-muted/50">
                <Check className="w-4 h-4 text-success shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full" onClick={handleManageSubscription} disabled={portalLoading}>
            {portalLoading ? 'Loading...' : 'Manage Subscription'}
          </Button>
        </div>
      )}
    </SettingsCard>
  );
}

// Data Export Section
function DataExportSection() {
  const { exportDeals, exportPayouts, exportExpenses, exportAll, counts } = useDataExport();

  const exports = [
    { label: 'Deals', count: counts.deals, action: exportDeals },
    { label: 'Payouts', count: counts.payouts, action: exportPayouts },
    { label: 'Expenses', count: counts.expenses, action: exportExpenses },
  ];

  return (
    <SettingsCard 
      icon={Download} 
      title="Export Data" 
      description="Download your data as CSV files"
      iconColor="text-blue-500"
      gradient="from-blue-500/10 to-blue-500/5"
    >
      <div className="space-y-3">
        {exports.map(({ label, count, action }) => (
          <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
            <div>
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{count} records</p>
            </div>
            <Button variant="outline" size="sm" onClick={action} disabled={count === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        ))}

        <div className="pt-3 border-t border-border/50">
          <Button onClick={exportAll} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export All Data
          </Button>
        </div>
      </div>
    </SettingsCard>
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
    if (!error) navigate('/auth');
    setLoading(false);
  };

  return (
    <motion.div 
      className="landing-card overflow-hidden border-destructive/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfig}
    >
      <div className="px-6 py-4 border-b border-destructive/30 bg-gradient-to-r from-destructive/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center justify-center text-destructive">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-destructive">Danger Zone</h3>
            <p className="text-xs text-muted-foreground">Irreversible actions</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        {!showConfirm ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all data. This cannot be undone.
            </p>
            <Button variant="destructive" onClick={() => setShowConfirm(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </>
        ) : (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm font-medium text-destructive mb-2">⚠️ This will permanently delete:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>All deals and payouts</li>
                <li>All expense records</li>
                <li>All properties and settings</li>
                <li>Your account and profile</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label>Type DELETE to confirm</Label>
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
                onClick={() => { setShowConfirm(false); setConfirmText(''); }}
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
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
