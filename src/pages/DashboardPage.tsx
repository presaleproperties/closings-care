import { useMemo, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
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
import { BusinessAnalytics } from '@/components/dashboard/BusinessAnalytics';
import { IncomeProjection } from '@/components/dashboard/IncomeProjection';
import { ExpenseAnalytics } from '@/components/dashboard/ExpenseAnalytics';
import { UpcomingPayouts } from '@/components/dashboard/UpcomingPayouts';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { TaxProjection } from '@/components/dashboard/TaxProjection';
import { TaxSafetyCard } from '@/components/dashboard/TaxSafetyCard';
import { SafeToSpendCard } from '@/components/dashboard/SafeToSpendCard';
import { FinancialHealth } from '@/components/dashboard/FinancialHealth';
import { ExpenseCommandCenter } from '@/components/dashboard/ExpenseCommandCenter';
import { BrokerageCapCard } from '@/components/dashboard/BrokerageCapCard';
import { AIBusinessInsights } from '@/components/dashboard/AIBusinessInsights';
import { PipelineProspects } from '@/components/dashboard/PipelineProspects';
import { EmptyDashboard } from '@/components/dashboard/EmptyDashboard';
import { FloatingBackground } from '@/components/dashboard/FloatingBackground';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { InsightsGreeting } from '@/components/dashboard/InsightsGreeting';
import { LatestActivity } from '@/components/dashboard/LatestActivity';
import { UpcomingRevenue } from '@/components/dashboard/UpcomingRevenue';
import { NeedsAttention } from '@/components/dashboard/NeedsAttention';
import { ThisWeekFocus } from '@/components/dashboard/ThisWeekFocus';
import { RevShareSummaryCard } from '@/components/dashboard/RevShareSummaryCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingUp, BarChart3, Sparkles, Lightbulb } from 'lucide-react';
import { OverduePayoutNotification } from '@/components/payouts/OverduePayoutNotification';
import { getMonthlyRecurringExpenses, getAnnualExpenses } from '@/lib/expenseCalculations';
import { useSyncedTransactions, useRevenueShare } from '@/hooks/usePlatformConnections';
import { useNetworkAgents } from '@/hooks/useNetworkData';
import { calculateTax, Province, TaxType } from '@/lib/taxCalculator';

// Dashboard v2.1 - Updated Feb 2026
const springConfig = { type: "spring" as const, stiffness: 100, damping: 20 };
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

export default function DashboardPage() {
  const { data: deals = [] } = useDeals();
  const { data: payouts = [] } = usePayouts();
  const { data: expenses = [] } = useExpenses();
  const { data: otherIncome = [] } = useOtherIncome();
  const { data: properties = [] } = useProperties();
  const { data: settings } = useSettings();
  const { data: syncedTransactions = [] } = useSyncedTransactions();
  const { data: revenueShare = [] } = useRevenueShare();
  const { data: networkAgents = [] } = useNetworkAgents();
  const { showOnboarding, isChecking, completeOnboarding } = useOnboarding();
  const markPaid = useMarkPayoutPaid();
  const autoMarkPaid = useAutoMarkPayoutsPaid();
  const updatePayout = useUpdatePayout();
  const refreshData = useRefreshData();
  
  const autoMarkedRef = useRef<Set<string>>(new Set());
  const userName = (settings as any)?.full_name?.split(' ')[0] || undefined;

  const now = new Date();
  const thisYear = now.getFullYear();

  const province = ((settings as any)?.province || 'BC') as Province;
  const taxType = ((settings as any)?.tax_type || 'self-employed') as TaxType;
  const taxBuffer = (settings as any)?.tax_buffer_percent || 5;
  const gstRegistered = (settings as any)?.gst_registered || false;
  const gstRate = (settings as any)?.gst_rate || 0.05;

  const expenseTotals = useMemo(() => {
    const monthly = getMonthlyRecurringExpenses(expenses, properties);
    const annual = getAnnualExpenses(expenses, properties);
    
    const oneTime = expenses
      .filter(e => e.recurrence === 'one-time')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    return { monthly, annual, oneTime };
  }, [expenses, properties]);

  const incomeTotals = useMemo(() => {
    const paid = payouts
      .filter(p => p.status === 'PAID' && p.paid_date && new Date(p.paid_date).getFullYear() === thisYear)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const projected = payouts
      .filter(p => p.status !== 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return { paid, projected };
  }, [payouts, thisYear]);

  const taxSetAsideRequired = useMemo(() => {
    const totalIncome = incomeTotals.paid + incomeTotals.projected;
    const deductibleRatio = totalIncome > 0 ? incomeTotals.projected / totalIncome : 0;
    const deductibleForProjected = expenseTotals.annual * deductibleRatio;
    
    const taxBreakdown = calculateTax(incomeTotals.projected, deductibleForProjected, province, taxType);
    const gstOwed = gstRegistered ? incomeTotals.projected * gstRate : 0;
    const bufferMultiplier = 1 + (taxBuffer / 100);
    return (taxBreakdown.totalTax + gstOwed) * bufferMultiplier;
  }, [incomeTotals.paid, incomeTotals.projected, expenseTotals.annual, province, taxType, taxBuffer, gstRegistered, gstRate]);

  const handleAutoMarkPaid = useCallback((payoutIds: string[]) => {
    const newIds = payoutIds.filter(id => !autoMarkedRef.current.has(id));
    if (newIds.length === 0) return;
    
    newIds.forEach(id => autoMarkedRef.current.add(id));
    autoMarkPaid.mutate(newIds);
  }, [autoMarkPaid]);

  const handleUpdatePayoutDueDate = useCallback((payoutId: string, newDate: string) => {
    updatePayout.mutate({ id: payoutId, data: { due_date: newDate } });
  }, [updatePayout]);

  if (isChecking) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div 
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center animate-pulse">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">Loading your dashboard...</p>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  const isEmpty = deals.length === 0 && syncedTransactions.length === 0;

  return (
    <AppLayout>
      <FloatingBackground />
      
      <OnboardingWizard open={showOnboarding} onComplete={completeOnboarding} />
      
      {/* Premium Header */}
      <Header
        title="Dashboard" 
        subtitle={format(now, 'EEEE, MMMM d, yyyy')}
      />

      {isEmpty ? (
        <EmptyDashboard />
      ) : (
        <PullToRefresh onRefresh={refreshData} className="min-h-[calc(100vh-56px)] relative z-10">
          {/* Mobile Dashboard */}
          <div className="sm:hidden">
            <motion.div 
              className="px-5 pt-3 pb-5"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springConfig}
            >
              <p className="text-sm text-muted-foreground font-medium">
                {format(now, 'EEEE, MMMM d')}
              </p>
              <h1 className="text-3xl font-bold tracking-tight mt-1 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Dashboard
              </h1>
            </motion.div>

            {/* Overdue Notification */}
            <div className="px-5 mb-4">
              <OverduePayoutNotification
                payouts={payouts}
                onMarkPaid={(id) => markPaid.mutate(id)}
                onUpdateDueDate={handleUpdatePayoutDueDate}
                isPending={markPaid.isPending || updatePayout.isPending}
              />
            </div>

            {/* Stats */}
            <div className="px-5 mb-6">
              <QuickStats 
                deals={deals} 
                payouts={payouts} 
                otherIncome={otherIncome}
                monthlyExpenses={expenseTotals.monthly}
                onAutoMarkPaid={handleAutoMarkPaid}
              />
            </div>

            {/* Quick Actions */}
            <div className="px-5 mb-6">
              <QuickActions />
            </div>

            {/* Mobile Tabs */}
            <Tabs defaultValue="insights" className="pb-8">
              <div className="px-5 mb-5">
                <div className="bg-muted/50 backdrop-blur-xl rounded-2xl p-1.5 border border-border/30">
                  <TabsList className="w-full grid grid-cols-4 h-11 bg-transparent p-0 gap-1">
                    {['insights', 'cashflow', 'taxes', 'analytics'].map((tab) => (
                      <TabsTrigger 
                        key={tab}
                        value={tab}
                        className="text-[11px] sm:text-[13px] font-semibold rounded-xl h-full capitalize data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50 data-[state=inactive]:text-muted-foreground transition-all duration-200"
                      >
                        {tab === 'insights' ? 'Insights' : tab === 'cashflow' ? 'Cashflow' : tab === 'taxes' ? 'Taxes' : 'Analytics'}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>

              <TabsContent value="insights" className="px-5 space-y-4 mt-0">
                <ThisWeekFocus deals={deals} payouts={payouts} />
                <InsightsGreeting deals={deals} payouts={payouts} syncedTransactions={syncedTransactions} userName={userName} />
                <LatestActivity deals={deals} syncedTransactions={syncedTransactions} revenueShare={revenueShare} networkAgents={networkAgents} />
                <UpcomingRevenue payouts={payouts} deals={deals} syncedTransactions={syncedTransactions} />
                <NeedsAttention deals={deals} payouts={payouts} syncedTransactions={syncedTransactions} />
                <RevShareSummaryCard revenueShare={revenueShare} />
              </TabsContent>

              <TabsContent value="cashflow" className="px-5 space-y-4 mt-0">
                <PipelineProspects />
                <IncomeProjection payouts={payouts} expenses={expenses} otherIncome={otherIncome} properties={properties} />
                <UpcomingPayouts 
                  payouts={payouts} 
                  onMarkPaid={(id) => markPaid.mutate(id)}
                  isPending={markPaid.isPending}
                />
                <FinancialHealth 
                  deals={deals}
                  payouts={payouts}
                  expenses={expenses}
                  properties={properties}
                  otherIncome={otherIncome}
                  monthlyExpenses={expenseTotals.monthly}
                  annualExpenses={expenseTotals.annual}
                />
                <BrokerageCapCard />
              </TabsContent>

              <TabsContent value="taxes" className="px-5 space-y-4 mt-0">
                <SafeToSpendCard
                  projectedCashIn={incomeTotals.projected}
                  monthlyExpenses={expenseTotals.monthly}
                  taxSetAsideRequired={taxSetAsideRequired}
                />
                <TaxSafetyCard 
                  paidIncome={incomeTotals.paid}
                  projectedIncome={incomeTotals.projected}
                  deductibleExpenses={expenseTotals.annual}
                />
                <TaxProjection 
                  projectedIncome={incomeTotals.projected}
                  paidIncome={incomeTotals.paid}
                  totalExpenses={expenseTotals.annual}
                />
              </TabsContent>

              <TabsContent value="analytics" className="px-5 space-y-4 mt-0">
                <ExpenseAnalytics expenses={expenses} />
                <AIBusinessInsights deals={deals} />
                <BusinessAnalytics deals={deals} payouts={payouts} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop Layout - Premium Redesign */}
          <motion.div 
            className="hidden sm:block"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Spacing Container */}
            <div className="p-5 lg:p-6 xl:p-8 space-y-6">
              
              {/* Overdue Alert */}
              <OverduePayoutNotification
                payouts={payouts}
                onMarkPaid={(id) => markPaid.mutate(id)}
                onUpdateDueDate={handleUpdatePayoutDueDate}
                isPending={markPaid.isPending || updatePayout.isPending}
              />

              {/* Stats Section */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springConfig, delay: 0.1 }}
              >
                <QuickStats 
                  deals={deals} 
                  payouts={payouts} 
                  otherIncome={otherIncome}
                  monthlyExpenses={expenseTotals.monthly}
                  onAutoMarkPaid={handleAutoMarkPaid}
                />
              </motion.section>

              {/* Quick Actions */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springConfig, delay: 0.15 }}
              >
                <QuickActions />
              </motion.section>

              {/* Premium Tabs */}
              <Tabs defaultValue="insights" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springConfig, delay: 0.2 }}
                >
                  <TabsList className="w-auto inline-flex h-12 p-1.5 bg-muted/40 backdrop-blur-xl rounded-2xl border border-border/30 shadow-sm">
                    <TabsTrigger 
                      value="insights" 
                      className="text-sm font-semibold gap-2 px-5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50 transition-all duration-200"
                    >
                      <Lightbulb className="h-4 w-4" />
                      Insights
                    </TabsTrigger>
                    <TabsTrigger 
                      value="cashflow" 
                      className="text-sm font-semibold gap-2 px-5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50 transition-all duration-200"
                    >
                      <TrendingUp className="h-4 w-4" />
                      Cashflow
                    </TabsTrigger>
                    <TabsTrigger 
                      value="taxes" 
                      className="text-sm font-semibold gap-2 px-5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50 transition-all duration-200"
                    >
                      <Calculator className="h-4 w-4" />
                      Taxes
                    </TabsTrigger>
                    <TabsTrigger 
                      value="analytics" 
                      className="text-sm font-semibold gap-2 px-5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50 transition-all duration-200"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Analytics
                    </TabsTrigger>
                  </TabsList>
                </motion.div>

                {/* Insights Tab */}
                <TabsContent value="insights" className="mt-0 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: 0.2 }}
                  >
                    <ThisWeekFocus deals={deals} payouts={payouts} />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: 0.25 }}
                  >
                    <InsightsGreeting 
                      deals={deals} 
                      payouts={payouts} 
                      syncedTransactions={syncedTransactions}
                      userName={userName}
                    />
                  </motion.div>

                  <div className="grid lg:grid-cols-3 gap-5 lg:gap-6 items-start">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...springConfig, delay: 0.3 }}
                    >
                      <LatestActivity 
                        deals={deals}
                        syncedTransactions={syncedTransactions}
                        revenueShare={revenueShare}
                        networkAgents={networkAgents}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...springConfig, delay: 0.35 }}
                    >
                      <UpcomingRevenue 
                        payouts={payouts}
                        deals={deals}
                        syncedTransactions={syncedTransactions}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...springConfig, delay: 0.4 }}
                    >
                      <NeedsAttention 
                        deals={deals}
                        payouts={payouts}
                        syncedTransactions={syncedTransactions}
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: 0.45 }}
                  >
                    <RevShareSummaryCard revenueShare={revenueShare} />
                  </motion.div>
                </TabsContent>

                {/* Cashflow Tab - Primary Focus */}
                <TabsContent value="cashflow" className="mt-0 space-y-6">
                  {/* 3-Year Projection - Hero Component */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: 0.25 }}
                  >
                    <IncomeProjection payouts={payouts} expenses={expenses} otherIncome={otherIncome} properties={properties} />
                  </motion.div>

                  <div className="grid lg:grid-cols-3 gap-5 lg:gap-6 items-start">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-5 lg:space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springConfig, delay: 0.3 }}
                      >
                        <FinancialHealth 
                          deals={deals}
                          payouts={payouts}
                          expenses={expenses}
                          properties={properties}
                          otherIncome={otherIncome}
                          monthlyExpenses={expenseTotals.monthly}
                          annualExpenses={expenseTotals.annual}
                        />
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springConfig, delay: 0.35 }}
                      >
                        <ExpenseCommandCenter 
                          expenses={expenses}
                          properties={properties}
                          monthlyExpenses={expenseTotals.monthly}
                          annualExpenses={expenseTotals.annual}
                        />
                      </motion.div>
                    </div>
                    
                    {/* Sidebar */}
                    <div className="space-y-5 lg:space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springConfig, delay: 0.35 }}
                      >
                        <PipelineProspects />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springConfig, delay: 0.4 }}
                      >
                        <UpcomingPayouts 
                          payouts={payouts} 
                          onMarkPaid={(id) => markPaid.mutate(id)}
                          isPending={markPaid.isPending}
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springConfig, delay: 0.45 }}
                      >
                        <BrokerageCapCard />
                      </motion.div>
                    </div>
                  </div>
                </TabsContent>

                {/* Taxes Tab */}
                <TabsContent value="taxes" className="mt-0 space-y-6">
                  <div className="grid lg:grid-cols-2 gap-5 lg:gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...springConfig, delay: 0.25 }}
                    >
                      <SafeToSpendCard
                        projectedCashIn={incomeTotals.projected}
                        monthlyExpenses={expenseTotals.monthly}
                        taxSetAsideRequired={taxSetAsideRequired}
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...springConfig, delay: 0.3 }}
                    >
                      <TaxSafetyCard 
                        paidIncome={incomeTotals.paid}
                        projectedIncome={incomeTotals.projected}
                        deductibleExpenses={expenseTotals.annual}
                      />
                    </motion.div>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: 0.35 }}
                  >
                    <TaxProjection 
                      projectedIncome={incomeTotals.projected}
                      paidIncome={incomeTotals.paid}
                      totalExpenses={expenseTotals.annual}
                    />
                  </motion.div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="mt-0 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: 0.2 }}
                  >
                    <ExpenseAnalytics expenses={expenses} />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: 0.25 }}
                  >
                    <AIBusinessInsights deals={deals} />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: 0.3 }}
                  >
                    <BusinessAnalytics deals={deals} payouts={payouts} />
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </PullToRefresh>
      )}
    </AppLayout>
  );
}
