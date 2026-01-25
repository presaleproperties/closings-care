import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Clock, AlertTriangle, CheckCircle, Flame, Snowflake } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Expense } from '@/lib/types';

interface ExpenseIntelligenceProps {
  expenses: Expense[];
  monthlyFixedExpenses: number;
  pipelineValue: number; // Total value of pending payouts
}

const springConfigs = {
  gentle: { type: "spring" as const, stiffness: 120, damping: 20 },
};

export function ExpenseIntelligence({
  expenses,
  monthlyFixedExpenses,
  pipelineValue,
}: ExpenseIntelligenceProps) {
  const analysis = useMemo(() => {
    // Calculate fixed vs variable breakdown
    let fixedTotal = 0;
    let variableTotal = 0;
    let taxDeductibleTotal = 0;
    let nonDeductibleTotal = 0;

    expenses.forEach((expense) => {
      const amount = Number(expense.amount);
      const isFixed = (expense as any).is_fixed !== false; // Default to true
      const isTaxDeductible = (expense as any).is_tax_deductible !== false; // Default to true
      const recurrence = expense.recurrence || 'monthly';
      
      // Calculate monthly equivalent
      let monthlyAmount = amount;
      if (recurrence === 'weekly') {
        monthlyAmount = amount * 4.33;
      } else if (recurrence === 'yearly') {
        monthlyAmount = amount / 12;
      }

      if (isFixed) {
        fixedTotal += monthlyAmount;
      } else {
        variableTotal += monthlyAmount;
      }

      if (isTaxDeductible) {
        taxDeductibleTotal += monthlyAmount;
      } else {
        nonDeductibleTotal += monthlyAmount;
      }
    });

    // Calculate runway (months pipeline covers expenses)
    const totalMonthlyBurn = monthlyFixedExpenses;
    const runwayMonths = totalMonthlyBurn > 0 ? Math.floor(pipelineValue / totalMonthlyBurn) : 0;

    // Health status based on runway
    let healthStatus: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';
    if (runwayMonths < 2) {
      healthStatus = 'critical';
    } else if (runwayMonths < 4) {
      healthStatus = 'warning';
    } else if (runwayMonths < 6) {
      healthStatus = 'good';
    }

    return {
      fixedTotal,
      variableTotal,
      taxDeductibleTotal,
      nonDeductibleTotal,
      totalMonthlyBurn,
      runwayMonths,
      healthStatus,
      fixedPercent: (fixedTotal / (fixedTotal + variableTotal)) * 100 || 0,
      deductiblePercent: (taxDeductibleTotal / (taxDeductibleTotal + nonDeductibleTotal)) * 100 || 0,
    };
  }, [expenses, monthlyFixedExpenses, pipelineValue]);

  const statusConfig = {
    excellent: { color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', icon: CheckCircle, label: 'Excellent', gradient: 'icon-gradient-primary' },
    good: { color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', icon: CheckCircle, label: 'Good', gradient: 'icon-gradient-primary' },
    warning: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', icon: AlertTriangle, label: 'Needs Attention', gradient: 'icon-gradient-accent' },
    critical: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', icon: AlertTriangle, label: 'Critical', gradient: 'icon-gradient-accent' },
  };

  const config = statusConfig[analysis.healthStatus];
  const StatusIcon = config.icon;

  return (
    <motion.div 
      className="landing-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfigs.gentle}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="icon-gradient-purple icon-gradient-sm">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Expense Intelligence</h3>
              <p className="text-sm text-muted-foreground">Your spending breakdown</p>
            </div>
          </div>
          <Link to="/expenses">
            <Button variant="outline" size="sm">Manage</Button>
          </Link>
        </div>

        {/* Monthly Burn Rate */}
        <div className="p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-foreground">Monthly Burn Rate</span>
            </div>
            <span className="text-xl font-bold text-destructive">{formatCurrency(analysis.totalMonthlyBurn)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Fixed expenses determine how many months you can survive without income.
          </p>
        </div>

        {/* Pipeline Runway */}
        <div className={cn("p-4 rounded-xl border-2 mb-5", config.bg, config.border)}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Pipeline Runway</span>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusIcon className={cn("h-4 w-4", config.color)} />
              <span className={cn("text-sm font-medium", config.color)}>{config.label}</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">
            {analysis.runwayMonths} <span className="text-lg font-normal text-muted-foreground">months</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Your current pipeline covers {analysis.runwayMonths} months of expenses.
          </p>
        </div>

        {/* Fixed vs Variable */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Fixed vs Variable</span>
            <span className="text-xs text-muted-foreground">{analysis.fixedPercent.toFixed(0)}% fixed</span>
          </div>
          <Progress value={analysis.fixedPercent} className="h-2 mb-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Snowflake className="h-3 w-3 text-sky-400" />
              <span>Fixed: {formatCurrency(analysis.fixedTotal)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="h-3 w-3 text-orange-400" />
              <span>Variable: {formatCurrency(analysis.variableTotal)}</span>
            </div>
          </div>
        </div>

        {/* Tax Deductible Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Tax Deductible</span>
            <span className="text-xs text-muted-foreground">{analysis.deductiblePercent.toFixed(0)}% deductible</span>
          </div>
          <Progress value={analysis.deductiblePercent} className="h-2 mb-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="text-success">Deductible: {formatCurrency(analysis.taxDeductibleTotal)}</span>
            <span>Non-deductible: {formatCurrency(analysis.nonDeductibleTotal)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
