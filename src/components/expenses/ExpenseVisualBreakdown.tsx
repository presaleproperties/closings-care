import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Home, Briefcase, Building2, PiggyBank, Receipt, TrendingDown, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

interface Expense {
  id: string;
  category: string;
  amount: number;
  recurrence?: string | null;
  month: string;
  is_fixed?: boolean;
  is_tax_deductible?: boolean;
}

interface ExpenseVisualBreakdownProps {
  expenses: Expense[];
  currentMonth: string;
  onCategoryClick?: (type: 'personal' | 'business' | 'rental' | 'taxes') => void;
}

type ExpenseType = 'personal' | 'business' | 'rental' | 'taxes' | 'other';

const typeConfig: Record<ExpenseType, { 
  icon: typeof Home; 
  label: string; 
  color: string; 
  chartColor: string;
  bg: string;
}> = {
  personal: { icon: Home, label: 'Personal', color: 'text-blue-500', chartColor: '#3b82f6', bg: 'bg-blue-500/10' },
  business: { icon: Briefcase, label: 'Business', color: 'text-purple-500', chartColor: '#a855f7', bg: 'bg-purple-500/10' },
  rental: { icon: Building2, label: 'Rental', color: 'text-teal-500', chartColor: '#14b8a6', bg: 'bg-teal-500/10' },
  taxes: { icon: PiggyBank, label: 'Taxes', color: 'text-amber-500', chartColor: '#f59e0b', bg: 'bg-amber-500/10' },
  other: { icon: Receipt, label: 'Other', color: 'text-muted-foreground', chartColor: '#6b7280', bg: 'bg-muted/50' },
};

const getCategoryType = (category: string): ExpenseType => {
  if (category.startsWith('Personal') || ['Personal Mortgage', 'Strata Fees', 'Property Taxes', 'Hydro/Utilities', 'Internet', 'Car Lease/Payment', 'Car Insurance (Personal)', 'Car Charging/Gas', 'Phone (Personal)', 'Groceries', 'Entertainment/Dining', 'Gym/Fitness', 'Apps & Subscriptions'].includes(category)) return 'personal';
  if (category.startsWith('Business') || category.startsWith('Office') || category.startsWith('Tech') || ['Office Lease', 'Board Fees', 'Brokerage Fees', 'CRM (CHIME, etc.)', 'Website Hosting', 'Google Workspace', 'iCloud/Storage', 'Canva/Design Tools', 'Email Marketing (MailerLite)', 'Editing Apps', 'Other Software', 'Facebook/Social Ads', 'Signs & Signage', 'Marketing Agency', 'Marketing Manager', 'Print Marketing', 'Car (Business Use)', 'Car Insurance (Business)', 'Car Charging (Business)', 'BCFSA License', 'Real Estate License', 'Professional Development', 'Continuing Education', 'Client Gifts', 'Staging/Clean-ups', 'Photography', 'Phone (Business)', 'Admin Support', 'Bookkeeping'].includes(category)) return 'business';
  if (category.startsWith('Rental') || ['Rental Mortgage', 'Rental Strata Fees', 'Rental Property Tax', 'Property Management', 'Rental Insurance', 'Rental Repairs/Maintenance', 'Rental Utilities', 'Rental Depreciation', 'Other Rental Expense'].includes(category)) return 'rental';
  if (['Tax Set-Aside', 'GST/HST Remittance', 'Debt Pay Down'].includes(category)) return 'taxes';
  return 'other';
};

const springConfigs = {
  gentle: { type: "spring" as const, stiffness: 120, damping: 20 },
};

export function ExpenseVisualBreakdown({ expenses, currentMonth, onCategoryClick }: ExpenseVisualBreakdownProps) {
  const analytics = useMemo(() => {
    const getDisplayAmount = (e: Expense) => {
      const recurrence = e.recurrence || 'monthly';
      if (recurrence === 'weekly') return Number(e.amount) * 4.33;
      return Number(e.amount);
    };

    // Filter for current month expenses
    const monthExpenses = expenses.filter(e => {
      const recurrence = e.recurrence || 'monthly';
      if (recurrence === 'one-time') return e.month === currentMonth;
      if (recurrence === 'yearly') {
        const expenseMonthNum = parseInt(e.month.split('-')[1]);
        const currentMonthNum = parseInt(currentMonth.split('-')[1]);
        return currentMonthNum === expenseMonthNum && currentMonth >= e.month;
      }
      return currentMonth >= e.month;
    });

    // Group by type
    const byType: Record<ExpenseType, { total: number; fixed: number; variable: number; deductible: number; count: number }> = {
      personal: { total: 0, fixed: 0, variable: 0, deductible: 0, count: 0 },
      business: { total: 0, fixed: 0, variable: 0, deductible: 0, count: 0 },
      rental: { total: 0, fixed: 0, variable: 0, deductible: 0, count: 0 },
      taxes: { total: 0, fixed: 0, variable: 0, deductible: 0, count: 0 },
      other: { total: 0, fixed: 0, variable: 0, deductible: 0, count: 0 },
    };

    let totalFixed = 0;
    let totalVariable = 0;
    let totalDeductible = 0;
    let totalNonDeductible = 0;

    monthExpenses.forEach(e => {
      const type = getCategoryType(e.category);
      const amount = getDisplayAmount(e);
      const isFixed = e.is_fixed !== false;
      const isDeductible = e.is_tax_deductible !== false;

      byType[type].total += amount;
      byType[type].count += 1;

      if (isFixed) {
        byType[type].fixed += amount;
        totalFixed += amount;
      } else {
        byType[type].variable += amount;
        totalVariable += amount;
      }

      if (isDeductible) {
        byType[type].deductible += amount;
        totalDeductible += amount;
      } else {
        totalNonDeductible += amount;
      }
    });

    const grandTotal = Object.values(byType).reduce((sum, t) => sum + t.total, 0);

    // Pie chart data for expense types
    const typeChartData = Object.entries(byType)
      .filter(([_, data]) => data.total > 0)
      .map(([type, data]) => ({
        name: typeConfig[type as ExpenseType].label,
        value: data.total,
        color: typeConfig[type as ExpenseType].chartColor,
        type: type as ExpenseType,
      }));

    // Pie chart data for fixed vs variable
    const fixedVarChartData = [
      { name: 'Fixed', value: totalFixed, color: '#0ea5e9' },
      { name: 'Variable', value: totalVariable, color: '#f97316' },
    ].filter(d => d.value > 0);

    // Pie chart data for deductible
    const deductibleChartData = [
      { name: 'Deductible', value: totalDeductible, color: '#10b981' },
      { name: 'Non-Deductible', value: totalNonDeductible, color: '#6b7280' },
    ].filter(d => d.value > 0);

    return {
      byType,
      grandTotal,
      typeChartData,
      fixedVarChartData,
      deductibleChartData,
      totalFixed,
      totalVariable,
      totalDeductible,
      totalNonDeductible,
      fixedPercent: grandTotal > 0 ? (totalFixed / grandTotal) * 100 : 0,
      deductiblePercent: grandTotal > 0 ? (totalDeductible / grandTotal) * 100 : 0,
    };
  }, [expenses, currentMonth]);

  if (analytics.grandTotal === 0) {
    return null;
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      className="landing-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfigs.gentle}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="icon-gradient-accent icon-gradient-sm">
            <TrendingDown className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">Expense Breakdown</h3>
            <p className="text-sm text-muted-foreground">Visual spending analysis</p>
          </div>
        </div>

        {/* Main Pie Chart - Expense Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Type Distribution */}
          <div className="flex flex-col items-center">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">By Category</p>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.typeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {analytics.typeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {analytics.typeChartData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fixed vs Variable */}
          <div className="flex flex-col items-center">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Fixed vs Variable</p>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.fixedVarChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {analytics.fixedVarChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span className="text-xs text-muted-foreground">Fixed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="text-xs text-muted-foreground">Variable</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {(['personal', 'business', 'rental', 'taxes'] as const).map((type) => {
            const config = typeConfig[type];
            const data = analytics.byType[type];
            const Icon = config.icon;
            const percentage = analytics.grandTotal > 0 ? (data.total / analytics.grandTotal) * 100 : 0;

            if (data.total === 0) return null;

            return (
              <motion.button
                key={type}
                onClick={() => onCategoryClick?.(type)}
                className={cn(
                  "p-4 rounded-xl border transition-all text-left group hover:scale-[1.02]",
                  config.bg, "border-transparent hover:border-border"
                )}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={cn("w-5 h-5", config.color)} />
                  <span className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</span>
                </div>
                <p className="text-lg font-bold text-foreground">{formatCurrency(data.total)}</p>
                <p className={cn("text-xs font-medium", config.color)}>{config.label}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  <span>{data.count} items</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {/* Mini progress bar */}
                <div className="mt-2 h-1 bg-muted/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ width: `${percentage}%`, backgroundColor: config.chartColor }}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Tax Deductible Summary */}
        <div className="p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-foreground">Tax Deductible</span>
            </div>
            <span className="text-sm font-bold text-success">{analytics.deductiblePercent.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-muted/50 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-success rounded-full transition-all"
              style={{ width: `${analytics.deductiblePercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="text-success">{formatCurrency(analytics.totalDeductible)} deductible</span>
            <span>{formatCurrency(analytics.totalNonDeductible)} non-deductible</span>
          </div>
        </div>

        {/* Fixed Expense Insight */}
        <div className="mt-4 p-3 rounded-xl bg-sky-500/5 border border-sky-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <span className="text-sm font-bold text-sky-500">{analytics.fixedPercent.toFixed(0)}%</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Fixed Expenses</p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(analytics.totalFixed)}/mo locked in commitments
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
