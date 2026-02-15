import { useMemo } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useExpenses } from '@/hooks/useExpenses';
import { useProperties } from '@/hooks/useProperties';
import { useSettings } from '@/hooks/useSettings';
import { useRefreshData } from '@/hooks/useRefreshData';
import { useOnboarding } from '@/hooks/useOnboarding';

import { QuickStats } from '@/components/dashboard/QuickStats';
import { BusinessAnalytics } from '@/components/dashboard/BusinessAnalytics';
import { IncomeProjection } from '@/components/dashboard/IncomeProjection';
import { ExpenseAnalytics } from '@/components/dashboard/ExpenseAnalytics';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { TaxProjection } from '@/components/dashboard/TaxProjection';
import { TaxSafetyCard } from '@/components/dashboard/TaxSafetyCard';
import { SafeToSpendCard } from '@/components/dashboard/SafeToSpendCard';
import { FinancialHealth } from '@/components/dashboard/FinancialHealth';
import { ExpenseCommandCenter } from '@/components/dashboard/ExpenseCommandCenter';

import { AIBusinessInsights } from '@/components/dashboard/AIBusinessInsights';
import { PipelinePreview } from '@/components/dashboard/PipelinePreview';
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
import { Calculator, TrendingUp, BarChart3, Lightbulb } from 'lucide-react';
import { getMonthlyRecurringExpenses, getAnnualExpenses, getTrackedExpensesForMonth, getPropertyCostsForMonth } from '@/lib/expenseCalculations';
import { useSyncedTransactions, useRevenueShare } from '@/hooks/usePlatformConnections';
import { useNetworkAgents } from '@/hooks/useNetworkData';
import { useSyncedIncome } from '@/hooks/useSyncedIncome';
import { calculateTax, Province, TaxType } from '@/lib/taxCalculator';
import { Sparkles } from 'lucide-react';

const springConfig = { type: "spring" as const, stiffness: 100, damping: 20 };
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

export default function DashboardPage() {
  const { data: expenses = [] } = useExpenses();
  const { data: properties = [] } = useProperties();
  const { data: settings } = useSettings();
  const { data: syncedTransactions = [] } = useSyncedTransactions();
  const { data: revenueShare = [] } = useRevenueShare();
  const { data: networkAgents = [] } = useNetworkAgents();
  const { syncedPayouts, receivedYTD, comingIn, projectedRevenue2026 } = useSyncedIncome(syncedTransactions);
  const { showOnboarding, isChecking, completeOnboarding } = useOnboarding();
  const refreshData = useRefreshData();
  
  const userName = (settings as any)?.full_name?.split(' ')[0] || undefined;

  const now = new Date();
  const thisYear = now.getFullYear();

  const province = ((settings as any)?.province || 'BC') as Province;
  const taxType = ((settings as any)?.tax_type || 'self-employed') as TaxType;
  const taxBuffer = (settings as any)?.tax_buffer_percent || 5;
  const gstRegistered = (settings as any)?.gst_registered || false;
  const gstRate = (settings as any)?.gst_rate || 0.05;

  // RevShare monthly average (for projection components)
  const revShareMonthlyAvg = useMemo(() => {
    if (revenueShare.length === 0) return 0;
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const cutoff = format(twelveMonthsAgo, 'yyyy-MM');
    const recentRevShare = revenueShare.filter((r: any) => r.period >= cutoff);
    if (recentRevShare.length === 0) {
      const total = revenueShare.reduce((sum: number, r: any) => sum + Number(r.amount), 0);
      const uniqueMonths = new Set(revenueShare.map((r: any) => r.period));
      return uniqueMonths.size > 0 ? total / uniqueMonths.size : 0;
    }
    const total = recentRevShare.reduce((sum: number, r: any) => sum + Number(r.amount), 0);
    const uniqueMonths = new Set(recentRevShare.map((r: any) => r.period));
    return uniqueMonths.size > 0 ? total / uniqueMonths.size : 0;
  }, [revenueShare]);

  const expenseTotals = useMemo(() => {
    const monthly = getMonthlyRecurringExpenses(expenses, properties);
    const annual = getAnnualExpenses(expenses, properties);
    return { monthly, annual };
  }, [expenses, properties]);

  // Accurate YTD spent: sum of tracked expenses Jan → current month
  const spentYTD = useMemo(() => {
    const currentMonth = now.getMonth() + 1;
    const propertyCosts = getPropertyCostsForMonth(properties);
    const monthlyPropertyNet = propertyCosts.personalCost - propertyCosts.rentalNet;
    let total = 0;
    for (let month = 1; month <= currentMonth; month++) {
      const monthStr = `${thisYear}-${month.toString().padStart(2, '0')}`;
      total += getTrackedExpensesForMonth(expenses, monthStr) + monthlyPropertyNet;
    }
    return total;
  }, [expenses, properties, thisYear, now]);

  // Deal counts from synced data
  const dealCounts = useMemo(() => {
    const active = syncedTransactions.filter((tx: any) => tx.status === 'active').length;
    const closedYTD = syncedTransactions.filter((tx: any) => 
      tx.status === 'closed' && tx.close_date && new Date(tx.close_date).getFullYear() === thisYear
    ).length;
    return { active, closedYTD };
  }, [syncedTransactions, thisYear]);

  const incomeTotals = useMemo(() => {
    return { paid: receivedYTD, projected: comingIn };
  }, [receivedYTD, comingIn]);

  const taxSetAsideRequired = useMemo(() => {
    const totalIncome = incomeTotals.paid + incomeTotals.projected;
    const deductibleRatio = totalIncome > 0 ? incomeTotals.projected / totalIncome : 0;
    const deductibleForProjected = expenseTotals.annual * deductibleRatio;
    const taxBreakdown = calculateTax(incomeTotals.projected, deductibleForProjected, province, taxType);
    const gstOwed = gstRegistered ? incomeTotals.projected * gstRate : 0;
    const bufferMultiplier = 1 + (taxBuffer / 100);
    return (taxBreakdown.totalTax + gstOwed) * bufferMultiplier;
  }, [incomeTotals.paid, incomeTotals.projected, expenseTotals.annual, province, taxType, taxBuffer, gstRegistered, gstRate]);

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

  const isEmpty = syncedTransactions.length === 0;

  const quickStatsProps = {
    receivedYTD,
    comingIn,
    monthlyExpenses: expenseTotals.monthly,
    spentYTD,
    activeDeals: dealCounts.active,
    closedDealsYTD: dealCounts.closedYTD,
    projectedRevenue2026,
    revShareMonthlyAvg,
  };

  return (
    <AppLayout>
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

            <div className="px-5 mb-6">
              <QuickStats {...quickStatsProps} />
            </div>

            <div className="px-5 mb-6">
              <QuickActions />
            </div>

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
                <ThisWeekFocus syncedTransactions={syncedTransactions} />
                <InsightsGreeting syncedTransactions={syncedTransactions} revenueShare={revenueShare} userName={userName} receivedYTD={receivedYTD} revShareMonthlyAvg={revShareMonthlyAvg} />
                <LatestActivity syncedTransactions={syncedTransactions} revenueShare={revenueShare} networkAgents={networkAgents} />
                <UpcomingRevenue syncedTransactions={syncedTransactions} />
                <NeedsAttention syncedTransactions={syncedTransactions} />
                <RevShareSummaryCard revenueShare={revenueShare} />
              </TabsContent>

              <TabsContent value="cashflow" className="px-5 space-y-4 mt-0">
                <PipelinePreview />
                <IncomeProjection payouts={[]} expenses={expenses} revShareMonthlyAvg={revShareMonthlyAvg} properties={properties} syncedPayouts={syncedPayouts} />
                <FinancialHealth 
                  expenses={expenses}
                  properties={properties}
                  revShareMonthlyAvg={revShareMonthlyAvg}
                  monthlyExpenses={expenseTotals.monthly}
                  annualExpenses={expenseTotals.annual}
                  receivedYTD={receivedYTD}
                  comingIn={comingIn}
                />
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
                <AIBusinessInsights syncedTransactions={syncedTransactions} />
                <BusinessAnalytics deals={[]} payouts={[]} syncedPayouts={syncedPayouts} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop Layout */}
          <motion.div 
            className="hidden sm:block"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <div className="p-5 lg:p-6 xl:p-8 space-y-6">

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springConfig, delay: 0.1 }}
              >
                <QuickStats {...quickStatsProps} />
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springConfig, delay: 0.15 }}
              >
                <QuickActions />
              </motion.section>

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
                    transition={{ ...springConfig, delay: 0.25 }}
                  >
                <InsightsGreeting 
                      syncedTransactions={syncedTransactions}
                      revenueShare={revenueShare}
                      userName={userName}
                      receivedYTD={receivedYTD}
                      revShareMonthlyAvg={revShareMonthlyAvg}
                    />
                  </motion.div>

                  <div className="grid lg:grid-cols-3 gap-5 lg:gap-6 items-start">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...springConfig, delay: 0.3 }}
                    >
                      <LatestActivity 
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
                      <UpcomingRevenue syncedTransactions={syncedTransactions} />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...springConfig, delay: 0.4 }}
                      className="space-y-5"
                    >
                      <NeedsAttention syncedTransactions={syncedTransactions} />
                      <PipelinePreview />
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

                {/* Cashflow Tab */}
                <TabsContent value="cashflow" className="mt-0 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: 0.25 }}
                  >
                    <IncomeProjection payouts={[]} expenses={expenses} revShareMonthlyAvg={revShareMonthlyAvg} properties={properties} syncedPayouts={syncedPayouts} />
                  </motion.div>

                  <div className="grid lg:grid-cols-3 gap-5 lg:gap-6 items-start">
                    <div className="lg:col-span-2 space-y-5 lg:space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springConfig, delay: 0.3 }}
                      >
                        <FinancialHealth 
                          expenses={expenses}
                          properties={properties}
                          revShareMonthlyAvg={revShareMonthlyAvg}
                          monthlyExpenses={expenseTotals.monthly}
                          annualExpenses={expenseTotals.annual}
                          receivedYTD={receivedYTD}
                          comingIn={comingIn}
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
                    
                    <div className="space-y-5 lg:space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springConfig, delay: 0.35 }}
                      >
                        <PipelinePreview />
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
                    <AIBusinessInsights syncedTransactions={syncedTransactions} />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: 0.3 }}
                  >
                    <BusinessAnalytics deals={[]} payouts={[]} syncedPayouts={syncedPayouts} />
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
