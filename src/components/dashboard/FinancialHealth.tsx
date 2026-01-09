import { useMemo } from 'react';
import { Activity, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Target, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { Deal, Payout } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

interface FinancialHealthProps {
  deals: Deal[];
  payouts: Payout[];
  monthlyExpenses: number;
  annualExpenses: number;
}

interface HealthMetric {
  label: string;
  value: number;
  target: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  insight: string;
}

export function FinancialHealth({ deals, payouts, monthlyExpenses, annualExpenses }: FinancialHealthProps) {
  const metrics = useMemo(() => {
    const now = new Date();
    const thisYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // YTD Income
    const ytdPaid = payouts
      .filter(p => p.status === 'PAID' && p.paid_date && new Date(p.paid_date).getFullYear() === thisYear)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Pipeline value
    const pipeline = payouts
      .filter(p => p.status !== 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Deal count this year
    const ytdDeals = deals.filter(d => new Date(d.created_at).getFullYear() === thisYear).length;

    // Average deal value
    const avgDealValue = ytdDeals > 0 ? ytdPaid / ytdDeals : 0;

    // Monthly average income
    const monthsElapsed = currentMonth + 1;
    const monthlyAvgIncome = ytdPaid / monthsElapsed;

    // Expense ratio
    const expenseRatio = ytdPaid > 0 ? (annualExpenses / ytdPaid) * 100 : 0;

    // Cash runway (months of expenses covered by pipeline)
    const cashRunway = monthlyExpenses > 0 ? pipeline / monthlyExpenses : 0;

    // Conversion rate (closed vs pending)
    const closedDeals = deals.filter(d => d.status === 'CLOSED').length;
    const conversionRate = deals.length > 0 ? (closedDeals / deals.length) * 100 : 0;

    // Lead source diversity
    const leadSources = new Set(deals.map(d => d.lead_source).filter(Boolean));
    const leadDiversity = leadSources.size;

    // Business health metrics
    const healthMetrics: HealthMetric[] = [
      {
        label: 'Monthly Income',
        value: monthlyAvgIncome,
        target: 15000, // Target $15k/month
        unit: 'currency',
        status: monthlyAvgIncome >= 15000 ? 'good' : monthlyAvgIncome >= 10000 ? 'warning' : 'critical',
        insight: monthlyAvgIncome >= 15000 
          ? 'Great income pace!' 
          : 'Consider increasing deal volume or commission rates',
      },
      {
        label: 'Expense Ratio',
        value: expenseRatio,
        target: 30, // Target under 30%
        unit: 'percent',
        status: expenseRatio <= 20 ? 'good' : expenseRatio <= 35 ? 'warning' : 'critical',
        insight: expenseRatio <= 20 
          ? 'Excellent expense management' 
          : 'Look for ways to reduce overhead costs',
      },
      {
        label: 'Cash Runway',
        value: cashRunway,
        target: 6, // Target 6 months
        unit: 'months',
        status: cashRunway >= 6 ? 'good' : cashRunway >= 3 ? 'warning' : 'critical',
        insight: cashRunway >= 6 
          ? 'Strong financial buffer' 
          : 'Build more pipeline to increase security',
      },
      {
        label: 'Deal Conversion',
        value: conversionRate,
        target: 80, // Target 80%
        unit: 'percent',
        status: conversionRate >= 80 ? 'good' : conversionRate >= 60 ? 'warning' : 'critical',
        insight: conversionRate >= 80 
          ? 'Excellent close rate' 
          : 'Review pending deals for bottlenecks',
      },
    ];

    // Business insights
    const insights: string[] = [];

    if (leadDiversity < 3) {
      insights.push("🎯 Diversify lead sources - you're relying on too few channels. Consider adding referral programs, social media, or open houses.");
    }

    if (monthlyAvgIncome < monthlyExpenses * 1.5) {
      insights.push("⚠️ Income is too close to expenses. Aim for income to be at least 2x your monthly expenses.");
    }

    if (pipeline < annualExpenses) {
      insights.push("📈 Build your pipeline - aim to have at least one year of expenses covered by pending deals.");
    }

    if (avgDealValue < 8000) {
      insights.push("💎 Consider focusing on higher-value properties to increase your average commission.");
    }

    if (ytdDeals < currentMonth) {
      insights.push("📅 Deal velocity is low - aim for at least 1-2 deals per month for stable income.");
    }

    if (insights.length === 0) {
      insights.push("✅ Your business metrics look healthy! Keep up the great work.");
    }

    return {
      ytdPaid,
      pipeline,
      ytdDeals,
      avgDealValue,
      monthlyAvgIncome,
      expenseRatio,
      cashRunway,
      healthMetrics,
      insights,
    };
  }, [deals, payouts, monthlyExpenses, annualExpenses]);

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
    }
  };

  const getStatusBg = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'bg-success';
      case 'warning': return 'bg-warning';
      case 'critical': return 'bg-destructive';
    }
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'critical': return AlertCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Health Score Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-xl bg-accent/10">
            <Activity className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Financial Health</h3>
            <p className="text-xs text-muted-foreground">Key business metrics</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-xl bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">YTD Income</p>
            <p className="text-lg font-bold">{formatCurrency(metrics.ytdPaid)}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Pipeline</p>
            <p className="text-lg font-bold">{formatCurrency(metrics.pipeline)}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">YTD Deals</p>
            <p className="text-lg font-bold">{metrics.ytdDeals}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Avg Deal</p>
            <p className="text-lg font-bold">{formatCurrency(metrics.avgDealValue)}</p>
          </div>
        </div>

        {/* Health Metrics */}
        <div className="space-y-4">
          {metrics.healthMetrics.map((metric, i) => {
            const StatusIcon = getStatusIcon(metric.status);
            const progress = metric.unit === 'percent' || metric.unit === 'months'
              ? Math.min((metric.value / metric.target) * 100, 100)
              : Math.min((metric.value / metric.target) * 100, 100);

            return (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <span className={`text-sm font-bold ${getStatusColor(metric.status)}`}>
                    {metric.unit === 'currency' 
                      ? formatCurrency(metric.value)
                      : metric.unit === 'percent'
                      ? `${metric.value.toFixed(0)}%`
                      : `${metric.value.toFixed(1)} ${metric.unit}`
                    }
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">{metric.insight}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Business Insights */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-accent" />
          <h3 className="font-semibold">Business Insights</h3>
        </div>
        <div className="space-y-3">
          {metrics.insights.map((insight, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/30 text-sm">
              {insight}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
