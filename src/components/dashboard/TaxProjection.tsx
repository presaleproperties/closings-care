import { useMemo } from 'react';
import { Calculator, TrendingDown, Landmark, DollarSign, PiggyBank, Lightbulb, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { calculateTax, getQuarterlyInstallment, getTaxTips } from '@/lib/taxCalculator';
import { Progress } from '@/components/ui/progress';

interface TaxProjectionProps {
  projectedIncome: number;
  paidIncome: number;
  totalExpenses: number;
}

export function TaxProjection({ projectedIncome, paidIncome, totalExpenses }: TaxProjectionProps) {
  const taxData = useMemo(() => {
    // Calculate tax on total projected income (what's expected for the year)
    const totalIncome = paidIncome + projectedIncome;
    const deductibleExpenses = totalExpenses; // Business expenses are deductible
    
    const projected = calculateTax(totalIncome, deductibleExpenses);
    const currentOwed = calculateTax(paidIncome, totalExpenses * (paidIncome / Math.max(totalIncome, 1)));
    const quarterlyInstallment = getQuarterlyInstallment(projected.totalTax);
    const tips = getTaxTips(totalIncome, deductibleExpenses);

    // Calculate how much should be set aside from projected income
    const taxSetAside = projected.totalTax - currentOwed.totalTax;

    return {
      totalIncome,
      deductibleExpenses,
      projected,
      currentOwed,
      quarterlyInstallment,
      taxSetAside,
      tips,
    };
  }, [projectedIncome, paidIncome, totalExpenses]);

  const currentMonth = new Date().getMonth();
  const monthsRemaining = 12 - currentMonth;
  const monthlyTaxSetAside = taxData.taxSetAside / Math.max(monthsRemaining, 1);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-xl bg-accent/10">
          <Calculator className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Tax Projection</h3>
          <p className="text-xs text-muted-foreground">British Columbia, Canada</p>
        </div>
      </div>

      {/* Income Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-success/10">
          <p className="text-xs text-muted-foreground mb-1">Total Projected Income</p>
          <p className="text-xl font-bold text-success">{formatCurrency(taxData.totalIncome)}</p>
        </div>
        <div className="p-4 rounded-xl bg-info/10">
          <p className="text-xs text-muted-foreground mb-1">Business Expenses</p>
          <p className="text-xl font-bold text-info">{formatCurrency(taxData.deductibleExpenses)}</p>
          <p className="text-xs text-muted-foreground mt-1">Tax deductible</p>
        </div>
      </div>

      {/* Tax Breakdown */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Federal Tax</span>
          </div>
          <span className="font-semibold">{formatCurrency(taxData.projected.federalTax)}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">BC Provincial Tax</span>
          </div>
          <span className="font-semibold">{formatCurrency(taxData.projected.provincialTax)}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">CPP (Self-Employed)</span>
          </div>
          <span className="font-semibold">{formatCurrency(taxData.projected.cppContributions)}</span>
        </div>
      </div>

      {/* Total Tax */}
      <div className="p-4 rounded-xl bg-destructive/10 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Estimated Total Tax</span>
          <span className="text-2xl font-bold text-destructive">{formatCurrency(taxData.projected.totalTax)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Effective Rate</span>
          <span>{taxData.projected.effectiveRate.toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Marginal Rate</span>
          <span>{taxData.projected.marginalRate.toFixed(1)}%</span>
        </div>
      </div>

      {/* Take Home */}
      <div className="p-4 rounded-xl bg-success/10 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Estimated Take-Home</p>
            <p className="text-xs text-muted-foreground">After taxes & CPP</p>
          </div>
          <span className="text-2xl font-bold text-success">{formatCurrency(taxData.projected.takeHome)}</span>
        </div>
      </div>

      {/* Set Aside Recommendation */}
      <div className="p-4 rounded-xl border-2 border-warning/30 bg-warning/5 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Monthly Tax Set-Aside</p>
            <p className="text-2xl font-bold text-warning mt-1">{formatCurrency(monthlyTaxSetAside)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Set aside this amount each month to cover your tax bill
            </p>
          </div>
        </div>
      </div>

      {/* Quarterly Installments */}
      <div className="p-4 rounded-xl bg-muted/50 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Quarterly Installment</p>
            <p className="text-xs text-muted-foreground">To avoid interest charges</p>
          </div>
          <span className="text-lg font-bold">{formatCurrency(taxData.quarterlyInstallment)}</span>
        </div>
      </div>

      {/* Tax Tips */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium">Tax Tips</span>
        </div>
        <div className="space-y-2">
          {taxData.tips.slice(0, 3).map((tip, i) => (
            <p key={i} className="text-xs text-muted-foreground pl-6">• {tip}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
