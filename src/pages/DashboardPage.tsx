import { useMemo, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useDeals } from '@/hooks/useDeals';
import { usePayouts, useMarkPayoutPaid, useAutoMarkPayoutsPaid, useUpdatePayout } from '@/hooks/usePayouts';
import { useExpenses } from '@/hooks/useExpenses';
import { useOtherIncome } from '@/hooks/useOtherIncome';
import { useProperties } from '@/hooks/useProperties';
import { useSettings } from '@/hooks/useSettings';
import { useRefreshData } from '@/hooks/useRefreshData';
import { useOnboarding } from '@/hooks/useOnboarding';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { ClientAnalytics } from '@/components/dashboard/ClientAnalytics';
import { IncomeProjection } from '@/components/dashboard/IncomeProjection';
import { ExpenseAnalytics } from '@/components/dashboard/ExpenseAnalytics';
import { UpcomingPayouts } from '@/components/dashboard/UpcomingPayouts';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { TaxProjection } from '@/components/dashboard/TaxProjection';
import { TaxSafetyCard } from '@/components/dashboard/TaxSafetyCard';
import { SafeToSpendCard } from '@/components/dashboard/SafeToSpendCard';
import { ExpenseIntelligence } from '@/components/dashboard/ExpenseIntelligence';
import { FinancialHealth } from '@/components/dashboard/FinancialHealth';
import { OtherIncomeManager } from '@/components/dashboard/OtherIncomeManager';
import { ExpenseCommandCenter } from '@/components/dashboard/ExpenseCommandCenter';
import { BrokerageCapCard } from '@/components/dashboard/BrokerageCapCard';
import { EmptyDashboard } from '@/components/dashboard/EmptyDashboard';
import { FloatingBackground } from '@/components/dashboard/FloatingBackground';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Calculator, TrendingUp, Users } from 'lucide-react';
import { OverduePayoutNotification } from '@/components/payouts/OverduePayoutNotification';
import { getMonthlyRecurringExpenses, getAnnualExpenses } from '@/lib/expenseCalculations';
import { calculateTax, Province, TaxType } from '@/lib/taxCalculator';

export default function DashboardPage() {
  const { data: deals = [] } = useDeals();
  const { data: payouts = [] } = usePayouts();
  const { data: expenses = [] } = useExpenses();
  const { data: otherIncome = [] } = useOtherIncome();
  const { data: properties = [] } = useProperties();
  const { data: settings } = useSettings();
  const { showOnboarding, isChecking, completeOnboarding } = useOnboarding();
  const markPaid = useMarkPayoutPaid();
  const autoMarkPaid = useAutoMarkPayoutsPaid();
  const updatePayout = useUpdatePayout();
  const refreshData = useRefreshData();
  
  // Track which payouts we've already auto-marked to avoid duplicate calls
  const autoMarkedRef = useRef<Set<string>>(new Set());

  const now = new Date();
  const thisYear = now.getFullYear();

  // Get tax settings
  const province = ((settings as any)?.province || 'BC') as Province;
  const taxType = ((settings as any)?.tax_type || 'self-employed') as TaxType;
  const taxBuffer = (settings as any)?.tax_buffer_percent || 5;
  const gstRegistered = (settings as any)?.gst_registered || false;
  const gstRate = (settings as any)?.gst_rate || 0.05;

  // Calculate expense totals including property costs
  const expenseTotals = useMemo(() => {
    const monthly = getMonthlyRecurringExpenses(expenses, properties);
    const annual = getAnnualExpenses(expenses, properties);
    
    const oneTime = expenses
      .filter(e => e.recurrence === 'one-time')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      monthly,
      annual,
      oneTime,
    };
  }, [expenses, properties]);

  // Calculate income totals
  const incomeTotals = useMemo(() => {
    const paid = payouts
      .filter(p => p.status === 'PAID' && p.paid_date && new Date(p.paid_date).getFullYear() === thisYear)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const projected = payouts
      .filter(p => p.status !== 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return { paid, projected };
  }, [payouts, thisYear]);

  // Calculate dynamic tax set-aside required (replacing hardcoded 30%)
  const taxSetAsideRequired = useMemo(() => {
    const totalIncome = incomeTotals.paid + incomeTotals.projected;
    const deductibleRatio = totalIncome > 0 ? incomeTotals.projected / totalIncome : 0;
    const deductibleForProjected = expenseTotals.annual * deductibleRatio;
    
    // Calculate tax on projected income
    const taxBreakdown = calculateTax(incomeTotals.projected, deductibleForProjected, province, taxType);
    
    // Add GST if registered
    const gstOwed = gstRegistered ? incomeTotals.projected * gstRate : 0;
    
    // Apply buffer
    const bufferMultiplier = 1 + (taxBuffer / 100);
    return (taxBreakdown.totalTax + gstOwed) * bufferMultiplier;
  }, [incomeTotals.paid, incomeTotals.projected, expenseTotals.annual, province, taxType, taxBuffer, gstRegistered, gstRate]);

  // Handle auto-marking payouts as paid when due date passes
  const handleAutoMarkPaid = useCallback((payoutIds: string[]) => {
    // Filter out payouts we've already processed
    const newIds = payoutIds.filter(id => !autoMarkedRef.current.has(id));
    if (newIds.length === 0) return;
    
    // Mark them as processed
    newIds.forEach(id => autoMarkedRef.current.add(id));
    
    // Auto-mark as paid
    autoMarkPaid.mutate(newIds);
  }, [autoMarkPaid]);

  const handleUpdatePayoutDueDate = useCallback((payoutId: string, newDate: string) => {
    updatePayout.mutate({ id: payoutId, data: { due_date: newDate } });
  }, [updatePayout]);

  // Don't render onboarding wizard until we've checked localStorage
  if (isChecking) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  // Check if user has no deals yet - show empty state
  const isEmpty = deals.length === 0;

  return (
    <AppLayout>
      {/* Floating gradient background - landing page style */}
      <FloatingBackground />
      
      <OnboardingWizard open={showOnboarding} onComplete={completeOnboarding} />
      <Header
        title="Dashboard" 
        subtitle={format(now, 'EEEE, MMMM d, yyyy')}
      />

      {isEmpty ? (
        <EmptyDashboard />
      ) : (

      <PullToRefresh onRefresh={refreshData} className="min-h-[calc(100vh-56px)] relative z-10">
        {/* Mobile-first iOS dashboard */}
        <div className="sm:hidden animate-fade-in">
          {/* Greeting Section */}
          <div className="px-5 pt-2 pb-4">
            <p className="text-[13px] text-muted-foreground">
              {format(now, 'EEEE, MMMM d')}
            </p>
            <h1 className="text-[28px] font-bold tracking-tight mt-0.5">
              Dashboard
            </h1>
          </div>

          {/* Overdue Payout Notification */}
          <div className="px-5">
            <OverduePayoutNotification
              payouts={payouts}
              onMarkPaid={(id) => markPaid.mutate(id)}
              onUpdateDueDate={handleUpdatePayoutDueDate}
              isPending={markPaid.isPending || updatePayout.isPending}
            />
          </div>

          {/* iOS Widget-style Stats */}
          <div className="px-5 py-4">
            <QuickStats 
              deals={deals} 
              payouts={payouts} 
              monthlyExpenses={expenseTotals.monthly}
              onAutoMarkPaid={handleAutoMarkPaid}
            />
          </div>

          {/* Quick Actions - iOS style */}
          <div className="px-5 pb-4">
            <QuickActions />
          </div>

          {/* Tabbed Content - iOS Segmented Control */}
          <Tabs defaultValue="overview" className="pb-6">
            <div className="px-5 pb-4">
              <div className="bg-muted/60 backdrop-blur-sm rounded-[10px] p-[3px]">
                <TabsList className="w-full grid grid-cols-4 h-[32px] bg-transparent p-0 gap-0">
                  <TabsTrigger 
                    value="overview" 
                    className="text-[13px] font-medium rounded-[8px] h-full data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground transition-all"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="taxes" 
                    className="text-[13px] font-medium rounded-[8px] h-full data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground transition-all"
                  >
                    Taxes
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analytics" 
                    className="text-[13px] font-medium rounded-[8px] h-full data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground transition-all"
                  >
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger 
                    value="clients" 
                    className="text-[13px] font-medium rounded-[8px] h-full data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground transition-all"
                  >
                    Clients
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Overview Tab - Mobile */}
            <TabsContent value="overview" className="px-5 space-y-4 mt-0">
              <BrokerageCapCard />
              <IncomeProjection payouts={payouts} expenses={expenses} otherIncome={otherIncome} properties={properties} />
              <UpcomingPayouts 
                payouts={payouts} 
                onMarkPaid={(id) => markPaid.mutate(id)}
                isPending={markPaid.isPending}
              />
              <OtherIncomeManager />
              <FinancialHealth 
                deals={deals}
                payouts={payouts}
                expenses={expenses}
                properties={properties}
                otherIncome={otherIncome}
                monthlyExpenses={expenseTotals.monthly}
                annualExpenses={expenseTotals.annual}
              />
            </TabsContent>

            {/* Taxes Tab - Mobile */}
            <TabsContent value="taxes" className="px-5 space-y-4 mt-0">
              <TaxSafetyCard 
                paidIncome={incomeTotals.paid}
                projectedIncome={incomeTotals.projected}
                deductibleExpenses={expenseTotals.annual}
              />
              <SafeToSpendCard
                projectedCashIn={incomeTotals.projected}
                monthlyExpenses={expenseTotals.monthly}
                taxSetAsideRequired={taxSetAsideRequired}
              />
              <TaxProjection 
                projectedIncome={incomeTotals.projected}
                paidIncome={incomeTotals.paid}
                totalExpenses={expenseTotals.annual}
              />
              <ExpenseIntelligence 
                expenses={expenses}
                monthlyFixedExpenses={expenseTotals.monthly}
                pipelineValue={incomeTotals.projected}
              />
            </TabsContent>

            {/* Analytics Tab - Mobile */}
            <TabsContent value="analytics" className="px-5 space-y-4 mt-0">
              <IncomeProjection payouts={payouts} expenses={expenses} otherIncome={otherIncome} properties={properties} />
              <ExpenseAnalytics expenses={expenses} />
              <FinancialHealth 
                deals={deals}
                payouts={payouts}
                expenses={expenses}
                properties={properties}
                otherIncome={otherIncome}
                monthlyExpenses={expenseTotals.monthly}
                annualExpenses={expenseTotals.annual}
              />
            </TabsContent>

            {/* Clients Tab - Mobile */}
            <TabsContent value="clients" className="px-5 space-y-4 mt-0">
              <ClientAnalytics deals={deals} payouts={payouts} />
              <UpcomingPayouts 
                payouts={payouts} 
                onMarkPaid={(id) => markPaid.mutate(id)}
                isPending={markPaid.isPending}
              />
              {/* Deal Summary Card - iOS style */}
              <div className="rounded-2xl bg-card/95 backdrop-blur-xl border border-border/50 overflow-hidden shadow-ios">
                <div className="px-4 py-3 border-b border-border/50">
                  <h3 className="font-semibold text-[17px]">Deal Summary</h3>
                </div>
                <div className="divide-y divide-border/50">
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <span className="text-[15px]">Total Deals</span>
                    <span className="font-semibold text-[15px]">{deals.length}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <span className="text-[15px]">Active Deals</span>
                    <span className="font-semibold text-[15px]">{deals.filter(d => d.status === 'PENDING').length}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <span className="text-[15px]">Closed Deals</span>
                    <span className="font-semibold text-[15px]">{deals.filter(d => d.status === 'CLOSED').length}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3.5 bg-success/5">
                    <span className="text-[15px]">Close Rate</span>
                    <span className="font-semibold text-[15px] text-success">
                      {deals.length > 0 
                        ? ((deals.filter(d => d.status === 'CLOSED').length / deals.length) * 100).toFixed(0)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:block p-4 lg:p-6 space-y-5 lg:space-y-6 animate-fade-in">
          <OverduePayoutNotification
            payouts={payouts}
            onMarkPaid={(id) => markPaid.mutate(id)}
            onUpdateDueDate={handleUpdatePayoutDueDate}
            isPending={markPaid.isPending || updatePayout.isPending}
          />

          <QuickStats 
            deals={deals} 
            payouts={payouts} 
            monthlyExpenses={expenseTotals.monthly}
            onAutoMarkPaid={handleAutoMarkPaid}
          />

          <QuickActions />

          <Tabs defaultValue="overview" className="space-y-5 lg:space-y-6">
            <TabsList className="w-auto inline-grid grid-cols-4 h-10 p-1 bg-muted/60 backdrop-blur-sm">
              <TabsTrigger value="overview" className="text-sm gap-1.5 data-[state=active]:shadow-sm">
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="taxes" className="text-sm gap-1.5 data-[state=active]:shadow-sm">
                <Calculator className="h-4 w-4" />
                Taxes
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-sm gap-1.5 data-[state=active]:shadow-sm">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="clients" className="text-sm gap-1.5 data-[state=active]:shadow-sm">
                <Users className="h-4 w-4" />
                Clients
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <IncomeProjection payouts={payouts} expenses={expenses} otherIncome={otherIncome} properties={properties} />
                  <div className="grid md:grid-cols-2 gap-6">
                    <OtherIncomeManager />
                    <FinancialHealth 
                      deals={deals}
                      payouts={payouts}
                      expenses={expenses}
                      properties={properties}
                      otherIncome={otherIncome}
                      monthlyExpenses={expenseTotals.monthly}
                      annualExpenses={expenseTotals.annual}
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <BrokerageCapCard />
                  <UpcomingPayouts 
                    payouts={payouts} 
                    onMarkPaid={(id) => markPaid.mutate(id)}
                    isPending={markPaid.isPending}
                  />
                </div>
              </div>
              <ExpenseCommandCenter 
                expenses={expenses}
                monthlyExpenses={expenseTotals.monthly}
                annualExpenses={expenseTotals.annual}
              />
            </TabsContent>

            <TabsContent value="taxes" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <TaxSafetyCard 
                  paidIncome={incomeTotals.paid}
                  projectedIncome={incomeTotals.projected}
                  deductibleExpenses={expenseTotals.annual}
                />
                <SafeToSpendCard
                  projectedCashIn={incomeTotals.projected}
                  monthlyExpenses={expenseTotals.monthly}
                  taxSetAsideRequired={taxSetAsideRequired}
                />
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                <TaxProjection 
                  projectedIncome={incomeTotals.projected}
                  paidIncome={incomeTotals.paid}
                  totalExpenses={expenseTotals.annual}
                />
                <ExpenseIntelligence 
                  expenses={expenses}
                  monthlyFixedExpenses={expenseTotals.monthly}
                  pipelineValue={incomeTotals.projected}
                />
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <IncomeProjection payouts={payouts} expenses={expenses} otherIncome={otherIncome} properties={properties} />
                <ExpenseAnalytics expenses={expenses} />
              </div>
              <FinancialHealth 
                deals={deals}
                payouts={payouts}
                expenses={expenses}
                properties={properties}
                otherIncome={otherIncome}
                monthlyExpenses={expenseTotals.monthly}
                annualExpenses={expenseTotals.annual}
              />
            </TabsContent>

            <TabsContent value="clients" className="space-y-6">
              <ClientAnalytics deals={deals} payouts={payouts} />
              <div className="grid lg:grid-cols-2 gap-6">
                <UpcomingPayouts 
                  payouts={payouts} 
                  onMarkPaid={(id) => markPaid.mutate(id)}
                  isPending={markPaid.isPending}
                />
                <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl p-6 shadow-ios">
                  <h3 className="font-semibold text-lg mb-4">Deal Summary</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/50">
                      <span className="text-sm">Total Deals</span>
                      <span className="font-bold">{deals.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/50">
                      <span className="text-sm">Active Deals</span>
                      <span className="font-bold">{deals.filter(d => d.status === 'PENDING').length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/50">
                      <span className="text-sm">Closed Deals</span>
                      <span className="font-bold">{deals.filter(d => d.status === 'CLOSED').length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-success/10">
                      <span className="text-sm">Close Rate</span>
                      <span className="font-bold text-success">
                        {deals.length > 0 
                          ? ((deals.filter(d => d.status === 'CLOSED').length / deals.length) * 100).toFixed(0)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PullToRefresh>
      )}
    </AppLayout>
  );
}
