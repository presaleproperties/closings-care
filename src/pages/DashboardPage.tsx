import { useMemo } from 'react';
import { format } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { useDeals } from '@/hooks/useDeals';
import { usePayouts, useMarkPayoutPaid } from '@/hooks/usePayouts';
import { useExpenses } from '@/hooks/useExpenses';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { ClientAnalytics } from '@/components/dashboard/ClientAnalytics';
import { IncomeProjection } from '@/components/dashboard/IncomeProjection';
import { ExpensesSummary } from '@/components/dashboard/ExpensesSummary';
import { UpcomingPayouts } from '@/components/dashboard/UpcomingPayouts';
import { QuickActions } from '@/components/dashboard/QuickActions';

export default function DashboardPage() {
  const { data: deals = [] } = useDeals();
  const { data: payouts = [] } = usePayouts();
  const { data: expenses = [] } = useExpenses();
  const markPaid = useMarkPayoutPaid();

  const now = new Date();

  // Calculate monthly expenses (recurring)
  const monthlyExpenses = useMemo(() => {
    const monthly = expenses
      .filter(e => e.recurrence === 'monthly')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const weekly = expenses
      .filter(e => e.recurrence === 'weekly')
      .reduce((sum, e) => sum + Number(e.amount) * 4.33, 0);

    // Include non-recurring as one-time but don't add to monthly
    return monthly + weekly;
  }, [expenses]);

  return (
    <AppLayout>
      <Header 
        title="Dashboard" 
        subtitle={format(now, 'EEEE, MMMM d, yyyy')}
      />

      <div className="p-4 lg:p-6 space-y-8 animate-fade-in">
        {/* Quick Actions */}
        <QuickActions />

        {/* Quick Stats */}
        <QuickStats 
          deals={deals} 
          payouts={payouts} 
          monthlyExpenses={monthlyExpenses} 
        />

        {/* Client Analytics */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Business Analytics</h2>
          <ClientAnalytics deals={deals} payouts={payouts} />
        </section>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Income Projection - Takes 2 columns */}
          <div className="lg:col-span-2">
            <IncomeProjection payouts={payouts} monthlyExpenses={monthlyExpenses} />
          </div>

          {/* Expenses Summary */}
          <ExpensesSummary expenses={expenses} />
        </div>

        {/* Upcoming Payouts - Full width */}
        <UpcomingPayouts 
          payouts={payouts} 
          onMarkPaid={(id) => markPaid.mutate(id)}
          isPending={markPaid.isPending}
        />
      </div>
    </AppLayout>
  );
}
