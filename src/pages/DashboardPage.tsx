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
import { useRefreshData } from '@/hooks/useRefreshData';
import { useOnboarding } from '@/hooks/useOnboarding';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { ClientAnalytics } from '@/components/dashboard/ClientAnalytics';
import { IncomeProjection } from '@/components/dashboard/IncomeProjection';
import { ExpenseAnalytics } from '@/components/dashboard/ExpenseAnalytics';
import { UpcomingPayouts } from '@/components/dashboard/UpcomingPayouts';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { TaxProjection } from '@/components/dashboard/TaxProjection';
import { FinancialHealth } from '@/components/dashboard/FinancialHealth';
import { OtherIncomeManager } from '@/components/dashboard/OtherIncomeManager';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Calculator, TrendingUp, Users } from 'lucide-react';
import { OverduePayoutNotification } from '@/components/payouts/OverduePayoutNotification';
import { getMonthlyRecurringExpenses, getAnnualExpenses } from '@/lib/expenseCalculations';

export default function DashboardPage() {
  const { data: deals = [] } = useDeals();
  const { data: payouts = [] } = usePayouts();
  const { data: expenses = [] } = useExpenses();
  const { data: otherIncome = [] } = useOtherIncome();
  const { data: properties = [] } = useProperties();
  const { showOnboarding, completeOnboarding } = useOnboarding();
  const markPaid = useMarkPayoutPaid();
  const autoMarkPaid = useAutoMarkPayoutsPaid();
  const updatePayout = useUpdatePayout();
  const refreshData = useRefreshData();
  
  // Track which payouts we've already auto-marked to avoid duplicate calls
  const autoMarkedRef = useRef<Set<string>>(new Set());

  const now = new Date();
  const thisYear = now.getFullYear();

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

  return (
    <AppLayout>
      <OnboardingWizard open={showOnboarding} onComplete={completeOnboarding} />
      <Header
        title="Dashboard" 
        subtitle={format(now, 'EEEE, MMMM d, yyyy')}
      />

      <PullToRefresh onRefresh={refreshData} className="min-h-[calc(100vh-56px)]">
        <div className="p-4 lg:p-6 space-y-5 lg:space-y-6 animate-fade-in">
          {/* Mobile: Date display */}
          <p className="sm:hidden text-[13px] text-muted-foreground -mt-2">
            {format(now, 'EEEE, MMMM d, yyyy')}
          </p>

          {/* Overdue Payout Notification */}
          <OverduePayoutNotification
            payouts={payouts}
            onMarkPaid={(id) => markPaid.mutate(id)}
            onUpdateDueDate={handleUpdatePayoutDueDate}
            isPending={markPaid.isPending || updatePayout.isPending}
          />

          {/* Quick Stats - First on mobile for immediate value */}
          <QuickStats 
            deals={deals} 
            payouts={payouts} 
            monthlyExpenses={expenseTotals.monthly}
            onAutoMarkPaid={handleAutoMarkPaid}
          />

          {/* Quick Actions */}
          <QuickActions />

          {/* Tabbed Dashboard Sections */}
          <Tabs defaultValue="overview" className="space-y-5 lg:space-y-6">
            {/* Mobile: iOS-style segmented control */}
            <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
              <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-grid h-10 p-1 bg-muted/60 backdrop-blur-sm">
                <TabsTrigger value="overview" className="text-[13px] sm:text-sm gap-1.5 data-[state=active]:shadow-sm">
                  <LayoutDashboard className="h-4 w-4 hidden sm:block" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="taxes" className="text-[13px] sm:text-sm gap-1.5 data-[state=active]:shadow-sm">
                  <Calculator className="h-4 w-4 hidden sm:block" />
                  Taxes
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-[13px] sm:text-sm gap-1.5 data-[state=active]:shadow-sm">
                  <TrendingUp className="h-4 w-4 hidden sm:block" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="clients" className="text-[13px] sm:text-sm gap-1.5 data-[state=active]:shadow-sm">
                  <Users className="h-4 w-4 hidden sm:block" />
                  Clients
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Income Projection - Takes 2 columns */}
                <div className="lg:col-span-2">
                  <IncomeProjection payouts={payouts} expenses={expenses} otherIncome={otherIncome} properties={properties} />
                </div>

                {/* Upcoming Payouts */}
                <UpcomingPayouts 
                  payouts={payouts} 
                  onMarkPaid={(id) => markPaid.mutate(id)}
                  isPending={markPaid.isPending}
                />
              </div>

              {/* Other Income Manager */}
              <OtherIncomeManager />

              {/* Financial Health */}
              <FinancialHealth 
                deals={deals}
                payouts={payouts}
                monthlyExpenses={expenseTotals.monthly}
                annualExpenses={expenseTotals.annual}
              />
            </TabsContent>

            {/* Taxes Tab */}
            <TabsContent value="taxes" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <TaxProjection 
                  projectedIncome={incomeTotals.projected}
                  paidIncome={incomeTotals.paid}
                  totalExpenses={expenseTotals.annual}
                />
                
                <div className="space-y-6">
                  <ExpenseAnalytics expenses={expenses} />
                </div>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <IncomeProjection payouts={payouts} expenses={expenses} otherIncome={otherIncome} properties={properties} />
                <ExpenseAnalytics expenses={expenses} />
              </div>
              
              <FinancialHealth 
                deals={deals}
                payouts={payouts}
                monthlyExpenses={expenseTotals.monthly}
                annualExpenses={expenseTotals.annual}
              />
            </TabsContent>

            {/* Clients Tab */}
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
    </AppLayout>
  );
}
