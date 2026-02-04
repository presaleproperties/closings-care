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
import { LayoutDashboard, Calculator, TrendingUp, Users, Sparkles } from 'lucide-react';
import { OverduePayoutNotification } from '@/components/payouts/OverduePayoutNotification';
import { getMonthlyRecurringExpenses, getAnnualExpenses } from '@/lib/expenseCalculations';
import { calculateTax, Province, TaxType } from '@/lib/taxCalculator';

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
  const { showOnboarding, isChecking, completeOnboarding } = useOnboarding();
  const markPaid = useMarkPayoutPaid();
  const autoMarkPaid = useAutoMarkPayoutsPaid();
  const updatePayout = useUpdatePayout();
  const refreshData = useRefreshData();
  
  const autoMarkedRef = useRef<Set<string>>(new Set());

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

  const isEmpty = deals.length === 0;

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
            <Tabs defaultValue="overview" className="pb-8">
              <div className="px-5 mb-5">
                <div className="bg-muted/50 backdrop-blur-xl rounded-2xl p-1.5 border border-border/30">
                  <TabsList className="w-full grid grid-cols-4 h-11 bg-transparent p-0 gap-1">
                    {['overview', 'taxes', 'analytics', 'clients'].map((tab) => (
                      <TabsTrigger 
                        key={tab}
                        value={tab}
                        className="text-[13px] font-semibold rounded-xl h-full capitalize data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50 data-[state=inactive]:text-muted-foreground transition-all duration-200"
                      >
                        {tab === 'overview' ? 'Overview' : tab === 'taxes' ? 'Taxes' : tab === 'analytics' ? 'Charts' : 'Clients'}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>

              <TabsContent value="overview" className="px-5 space-y-5 mt-0">
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

              <TabsContent value="taxes" className="px-5 space-y-5 mt-0">
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

              <TabsContent value="analytics" className="px-5 space-y-5 mt-0">
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

              <TabsContent value="clients" className="px-5 space-y-5 mt-0">
                <ClientAnalytics deals={deals} payouts={payouts} />
                <UpcomingPayouts 
                  payouts={payouts} 
                  onMarkPaid={(id) => markPaid.mutate(id)}
                  isPending={markPaid.isPending}
                />
                {/* Deal Summary */}
                <motion.div 
                  className="rounded-2xl bg-card/95 backdrop-blur-xl border border-border/40 overflow-hidden shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={springConfig}
                >
                  <div className="px-5 py-4 border-b border-border/40 bg-gradient-to-r from-primary/5 to-transparent">
                    <h3 className="font-bold text-lg">Deal Summary</h3>
                  </div>
                  <div className="divide-y divide-border/30">
                    {[
                      { label: 'Total Deals', value: deals.length },
                      { label: 'Active Deals', value: deals.filter(d => d.status === 'PENDING').length },
                      { label: 'Closed Deals', value: deals.filter(d => d.status === 'CLOSED').length },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between px-5 py-4">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-bold text-lg">{item.value}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between px-5 py-4 bg-success/5">
                      <span className="text-muted-foreground">Close Rate</span>
                      <span className="font-bold text-lg text-success">
                        {deals.length > 0 
                          ? ((deals.filter(d => d.status === 'CLOSED').length / deals.length) * 100).toFixed(0)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </motion.div>
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
              <Tabs defaultValue="overview" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springConfig, delay: 0.2 }}
                >
                  <TabsList className="w-auto inline-flex h-12 p-1.5 bg-muted/40 backdrop-blur-xl rounded-2xl border border-border/30 shadow-sm">
                    <TabsTrigger 
                      value="overview" 
                      className="text-sm font-semibold gap-2 px-5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50 transition-all duration-200"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Overview
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
                      <TrendingUp className="h-4 w-4" />
                      Analytics
                    </TabsTrigger>
                    <TabsTrigger 
                      value="clients" 
                      className="text-sm font-semibold gap-2 px-5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50 transition-all duration-200"
                    >
                      <Users className="h-4 w-4" />
                      Clients
                    </TabsTrigger>
                  </TabsList>
                </motion.div>

                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-0 space-y-6">
                  <div className="grid lg:grid-cols-3 gap-5 lg:gap-6">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-5 lg:space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springConfig, delay: 0.25 }}
                      >
                        <IncomeProjection payouts={payouts} expenses={expenses} otherIncome={otherIncome} properties={properties} />
                      </motion.div>
                      
                      <div className="grid md:grid-cols-2 gap-5 lg:gap-6 items-stretch">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ...springConfig, delay: 0.3 }}
                          className="h-full"
                        >
                          <OtherIncomeManager />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ...springConfig, delay: 0.35 }}
                          className="h-full"
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
                      </div>
                    </div>
                    
                    {/* Sidebar */}
                    <div className="space-y-5 lg:space-y-6">
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
                    </div>
                  </div>
                  
                  {/* Expense Command Center - Full Width */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: 0.5 }}
                  >
                    <ExpenseCommandCenter 
                      expenses={expenses}
                      monthlyExpenses={expenseTotals.monthly}
                      annualExpenses={expenseTotals.annual}
                    />
                  </motion.div>
                </TabsContent>

                {/* Taxes Tab */}
                <TabsContent value="taxes" className="mt-0 space-y-6">
                  <div className="grid lg:grid-cols-2 gap-5 lg:gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...springConfig, delay: 0.25 }}
                    >
                      <TaxSafetyCard 
                        paidIncome={incomeTotals.paid}
                        projectedIncome={incomeTotals.projected}
                        deductibleExpenses={expenseTotals.annual}
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...springConfig, delay: 0.3 }}
                    >
                      <SafeToSpendCard
                        projectedCashIn={incomeTotals.projected}
                        monthlyExpenses={expenseTotals.monthly}
                        taxSetAsideRequired={taxSetAsideRequired}
                      />
                    </motion.div>
                  </div>
                  
                  <div className="grid lg:grid-cols-2 gap-5 lg:gap-6">
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
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...springConfig, delay: 0.4 }}
                    >
                      <ExpenseIntelligence 
                        expenses={expenses}
                        monthlyFixedExpenses={expenseTotals.monthly}
                        pipelineValue={incomeTotals.projected}
                      />
                    </motion.div>
                  </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="mt-0 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: 0.25 }}
                  >
                    <IncomeProjection payouts={payouts} expenses={expenses} otherIncome={otherIncome} properties={properties} />
                  </motion.div>
                  
                  <div className="grid lg:grid-cols-2 gap-5 lg:gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...springConfig, delay: 0.3 }}
                    >
                      <ExpenseAnalytics expenses={expenses} />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...springConfig, delay: 0.35 }}
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
                  </div>
                </TabsContent>

                {/* Clients Tab */}
                <TabsContent value="clients" className="mt-0 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: 0.25 }}
                  >
                    <ClientAnalytics deals={deals} payouts={payouts} />
                  </motion.div>
                  
                  <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...springConfig, delay: 0.3 }}
                    >
                      <UpcomingPayouts 
                        payouts={payouts} 
                        onMarkPaid={(id) => markPaid.mutate(id)}
                        isPending={markPaid.isPending}
                      />
                    </motion.div>
                    
                    {/* Premium Deal Summary Card */}
                    <motion.div 
                      className="rounded-2xl bg-card/95 backdrop-blur-xl border border-border/40 overflow-hidden shadow-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...springConfig, delay: 0.35 }}
                    >
                      <div className="px-6 py-5 border-b border-border/40 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
                        <h3 className="font-bold text-lg">Deal Summary</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">Your deal performance overview</p>
                      </div>
                      <div className="divide-y divide-border/30">
                        {[
                          { label: 'Total Deals', value: deals.length },
                          { label: 'Active Deals', value: deals.filter(d => d.status === 'PENDING').length, highlight: true },
                          { label: 'Closed Deals', value: deals.filter(d => d.status === 'CLOSED').length },
                        ].map((item) => (
                          <div key={item.label} className={`flex items-center justify-between px-6 py-4 ${item.highlight ? 'bg-primary/5' : ''}`}>
                            <span className="text-muted-foreground font-medium">{item.label}</span>
                            <span className={`font-bold text-xl ${item.highlight ? 'text-primary' : ''}`}>{item.value}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between px-6 py-5 bg-success/10">
                          <div>
                            <span className="text-foreground font-semibold">Close Rate</span>
                            <p className="text-xs text-muted-foreground mt-0.5">Overall success rate</p>
                          </div>
                          <span className="font-bold text-2xl text-success">
                            {deals.length > 0 
                              ? ((deals.filter(d => d.status === 'CLOSED').length / deals.length) * 100).toFixed(0)
                              : 0}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </PullToRefresh>
      )}
    </AppLayout>
  );
}
