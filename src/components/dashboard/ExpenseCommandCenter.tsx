import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Plus,
  ArrowRight,
  RefreshCw,
  Calendar,
  Home,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Target,
  Wallet,
  PiggyBank,
  Sparkles,
  TrendingDown,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useExpenseBudgets } from '@/hooks/useExpenseBudgets';
import { getCategoryType, ExpenseType } from '@/lib/expenseCategories';
import { Property, getPropertyMonthlyExpenses, calculatePropertyCashflow } from '@/hooks/useProperties';

interface Expense {
  id: string;
  category: string;
  amount: number;
  recurrence?: string | null;
  month: string;
  notes?: string | null;
  is_fixed?: boolean | null;
  is_tax_deductible?: boolean | null;
}

interface ExpenseCommandCenterProps {
  expenses: Expense[];
  properties: Property[];
  monthlyExpenses: number;
  annualExpenses: number;
}

const springConfig = { type: "spring" as const, stiffness: 120, damping: 20 };

const getCurrentMonth = () => format(new Date(), 'yyyy-MM');

const typeConfig: Record<ExpenseType, { 
  icon: typeof Home; 
  label: string;
  gradient: string;
  border: string;
  iconBg: string;
  iconColor: string;
  textColor: string;
}> = {
  personal: { 
    icon: Home, 
    label: 'Personal',
    gradient: 'from-blue-500/15 to-blue-500/5',
    border: 'border-blue-500/25',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-500',
    textColor: 'text-blue-600 dark:text-blue-400'
  },
  business: { 
    icon: Briefcase, 
    label: 'Business',
    gradient: 'from-violet-500/15 to-violet-500/5',
    border: 'border-violet-500/25',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-500',
    textColor: 'text-violet-600 dark:text-violet-400'
  },
  rental: { 
    icon: Building2, 
    label: 'Rental',
    gradient: 'from-teal-500/15 to-teal-500/5',
    border: 'border-teal-500/25',
    iconBg: 'bg-teal-500/20',
    iconColor: 'text-teal-500',
    textColor: 'text-teal-600 dark:text-teal-400'
  },
  taxes: { 
    icon: PiggyBank, 
    label: 'Taxes',
    gradient: 'from-amber-500/15 to-amber-500/5',
    border: 'border-amber-500/25',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-500',
    textColor: 'text-amber-600 dark:text-amber-400'
  },
  other: { 
    icon: Receipt, 
    label: 'Other',
    gradient: 'from-muted/50 to-muted/20',
    border: 'border-border/50',
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
    textColor: 'text-muted-foreground'
  },
};

export function ExpenseCommandCenter({ expenses, properties, monthlyExpenses, annualExpenses }: ExpenseCommandCenterProps) {
  const { data: budgets = [] } = useExpenseBudgets();
  const currentMonth = getCurrentMonth();
  
  const analytics = useMemo(() => {
    const calculateMonthlyAmount = (e: Expense) => {
      if (e.recurrence === 'weekly') return Number(e.amount) * 4.33;
      return Number(e.amount);
    };

    // Calculate property costs
    let personalPropertyCost = 0;
    let rentalPropertyCost = 0;
    let rentalPropertyIncome = 0;
    
    properties.forEach(property => {
      const monthlyExpenses = getPropertyMonthlyExpenses(property);
      
      if (property.property_type === 'personal') {
        personalPropertyCost += monthlyExpenses;
      } else {
        // Rental property - track both income and expenses
        rentalPropertyIncome += property.monthly_rent || 0;
        rentalPropertyCost += monthlyExpenses;
      }
    });
    
    const rentalNet = rentalPropertyCost - rentalPropertyIncome; // Positive = net expense, Negative = net income

    // Filter to current month's relevant expenses
    const currentMonthExpenses = expenses.filter(e => {
      const recurrence = e.recurrence || 'monthly';
      if (recurrence === 'one-time') return e.month === currentMonth;
      return e.month <= currentMonth; // Include ongoing expenses
    });

    const recentExpenses = [...currentMonthExpenses]
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 5);

    const byType: Record<ExpenseType, { recurring: number; oneTime: number }> = {
      personal: { recurring: 0, oneTime: 0 },
      business: { recurring: 0, oneTime: 0 },
      rental: { recurring: 0, oneTime: 0 },
      taxes: { recurring: 0, oneTime: 0 },
      other: { recurring: 0, oneTime: 0 },
    };

    let fixedTotal = 0;
    let variableTotal = 0;
    let taxDeductible = 0;
    const categorySpending: Record<string, number> = {};
    const processedCategories = new Set<string>();

    currentMonthExpenses.forEach(e => {
      const type = getCategoryType(e.category);
      const isOneTime = e.recurrence === 'one-time';
      const monthlyAmount = isOneTime ? Number(e.amount) : calculateMonthlyAmount(e);
      
      // Avoid double-counting recurring expenses from different months
      const categoryKey = `${e.category}-${e.recurrence || 'monthly'}`;
      if (!isOneTime && processedCategories.has(categoryKey)) return;
      if (!isOneTime) processedCategories.add(categoryKey);

      if (isOneTime) {
        byType[type].oneTime += monthlyAmount;
      } else {
        byType[type].recurring += monthlyAmount;
      }

      if (e.is_fixed !== false) {
        fixedTotal += isOneTime ? 0 : calculateMonthlyAmount(e);
      } else {
        variableTotal += isOneTime ? 0 : calculateMonthlyAmount(e);
      }

      if (e.is_tax_deductible !== false && (type === 'business' || type === 'rental')) {
        taxDeductible += monthlyAmount;
      }

      // Track category spending for budgets
      categorySpending[e.category] = (categorySpending[e.category] || 0) + monthlyAmount;
    });

    // Add property costs to fixed totals and type breakdowns
    fixedTotal += personalPropertyCost + rentalPropertyCost;
    
    // Add rental property net to deductible (rental expenses are deductible)
    if (rentalPropertyCost > 0) {
      taxDeductible += rentalPropertyCost;
    }

    const budgetStatus = budgets.map(budget => {
      const spent = categorySpending[budget.category] || 0;
      const limit = Number(budget.monthly_limit);
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;
      return {
        category: budget.category.replace(/^(Personal|Business|Rental) - /, ''),
        fullCategory: budget.category,
        spent,
        limit,
        percentage: Math.min(percentage, 100),
        status: percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'good',
        remaining: Math.max(0, limit - spent),
      };
    }).sort((a, b) => b.percentage - a.percentage);

    // Include property costs in type totals
    const totalPersonal = byType.personal.recurring + byType.personal.oneTime + personalPropertyCost;
    const totalBusiness = byType.business.recurring + byType.business.oneTime;
    const totalRental = byType.rental.recurring + byType.rental.oneTime + rentalNet; // Net rental (expense - income)
    const totalTaxes = byType.taxes.recurring + byType.taxes.oneTime;
    const totalRecurring = Object.values(byType).reduce((sum, t) => sum + t.recurring, 0);

    return {
      recentExpenses,
      byType,
      totalPersonal,
      totalBusiness,
      totalRental,
      totalTaxes,
      totalRecurring,
      fixedTotal,
      variableTotal,
      taxDeductible,
      budgetStatus,
      budgetsOverLimit: budgetStatus.filter(b => b.status === 'over').length,
      budgetsWarning: budgetStatus.filter(b => b.status === 'warning').length,
      // Property-specific data for display
      rentalPropertyIncome,
      rentalPropertyCost,
      personalPropertyCost,
    };
  }, [expenses, properties, budgets, currentMonth]);

  const statCards = [
    { 
      label: 'Monthly', 
      value: monthlyExpenses, 
      icon: RefreshCw,
      gradient: 'from-rose-500/15 via-rose-500/10 to-transparent',
      iconBg: 'bg-rose-500/20',
      iconColor: 'text-rose-500',
      valueColor: 'text-rose-600 dark:text-rose-400'
    },
    { 
      label: 'Annual', 
      value: annualExpenses, 
      icon: Calendar,
      gradient: 'from-muted/60 via-muted/30 to-transparent',
      iconBg: 'bg-muted',
      iconColor: 'text-muted-foreground',
      valueColor: 'text-foreground'
    },
    { 
      label: 'Deductible', 
      value: analytics.taxDeductible, 
      icon: PiggyBank,
      gradient: 'from-emerald-500/15 via-emerald-500/10 to-transparent',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-500',
      valueColor: 'text-emerald-600 dark:text-emerald-400'
    },
    { 
      label: 'Fixed', 
      value: analytics.fixedTotal, 
      icon: Wallet,
      gradient: 'from-violet-500/15 via-violet-500/10 to-transparent',
      iconBg: 'bg-violet-500/20',
      iconColor: 'text-violet-500',
      valueColor: 'text-violet-600 dark:text-violet-400'
    },
  ];

  const typeBreakdown = [
    { type: 'personal' as ExpenseType, value: analytics.totalPersonal },
    { type: 'business' as ExpenseType, value: analytics.totalBusiness },
    { type: 'rental' as ExpenseType, value: analytics.totalRental },
  ];

  return (
    <motion.div 
      className="landing-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfig}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-rose-500/5 via-orange-500/5 to-transparent">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/25"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Receipt className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h3 className="font-bold text-sm">Expense Center</h3>
            <p className="text-[10px] text-muted-foreground">Track & optimize spending</p>
          </div>
        </div>

        <Link to="/expenses">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button size="sm" className="gap-1.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-lg shadow-rose-500/20 rounded-xl h-8 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </motion.div>
        </Link>
      </div>

      <div className="p-4 space-y-3">
        {/* Key Metrics Grid - 2x2 on mobile */}
        <div className="grid grid-cols-2 gap-2">
          {statCards.map((stat, index) => (
            <motion.div 
              key={stat.label}
              className={cn(
                "relative overflow-hidden p-3 rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm"
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springConfig, delay: index * 0.05 }}
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", stat.gradient)} />
              <div className="relative">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center", stat.iconBg)}>
                    <stat.icon className={cn("h-3 w-3", stat.iconColor)} />
                  </div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
                <p className={cn("text-base font-bold tracking-tight", stat.valueColor)}>
                  {formatCurrency(stat.value)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Type Breakdown - Compact horizontal */}
        <div className="grid grid-cols-3 gap-2">
          {typeBreakdown.map((item, index) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;
            return (
              <motion.div 
                key={item.type}
                className={cn(
                  "p-2.5 rounded-xl border bg-gradient-to-br",
                  config.gradient, config.border
                )}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...springConfig, delay: 0.2 + index * 0.05 }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={cn("w-5 h-5 rounded-md flex items-center justify-center", config.iconBg)}>
                    <Icon className={cn("h-3 w-3", config.iconColor)} />
                  </div>
                  <span className={cn("text-[9px] font-semibold uppercase tracking-wide", config.textColor)}>
                    {config.label}
                  </span>
                </div>
                <p className="text-sm font-bold">{formatCurrency(item.value)}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Budget Tracking - Compact */}
        {analytics.budgetStatus.length > 0 && (
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold">Budgets</span>
              </div>
              <div className="flex items-center gap-1">
                {analytics.budgetsOverLimit > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive font-semibold">
                    {analytics.budgetsOverLimit} over
                  </span>
                )}
                {analytics.budgetsWarning > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 font-semibold">
                    {analytics.budgetsWarning} warning
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-1.5 max-h-20 overflow-y-auto scrollbar-hide">
              {analytics.budgetStatus.slice(0, 2).map((budget, index) => (
                <motion.div
                  key={budget.fullCategory}
                  className="p-2 rounded-lg bg-card/60 border border-border/40"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...springConfig, delay: 0.35 + index * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      {budget.status === 'over' ? (
                        <AlertTriangle className="h-3 w-3 text-destructive" />
                      ) : budget.status === 'warning' ? (
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      )}
                      <span className="text-[10px] font-medium truncate max-w-[100px]">{budget.category}</span>
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold",
                      budget.status === 'over' ? 'text-destructive' :
                      budget.status === 'warning' ? 'text-amber-600' : 'text-emerald-600'
                    )}>
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                    </span>
                  </div>
                  <Progress 
                    value={budget.percentage} 
                    className={cn(
                      "h-1",
                      budget.status === 'over' ? '[&>div]:bg-destructive' :
                      budget.status === 'warning' ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'
                    )}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Expenses - Compact */}
        {analytics.recentExpenses.length > 0 ? (
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Recent</span>
              <Link to="/expenses" className="text-[10px] text-primary hover:text-primary/80 font-medium flex items-center gap-0.5 transition-colors">
                View all <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            </div>
            
            <div className="space-y-1 max-h-28 overflow-y-auto scrollbar-hide">
              <AnimatePresence mode="popLayout">
                {analytics.recentExpenses.slice(0, 4).map((expense, index) => {
                  const type = getCategoryType(expense.category);
                  const config = typeConfig[type];
                  const Icon = config.icon;
                  
                  return (
                    <motion.div
                      key={expense.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-card/50 border border-border/30"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...springConfig, delay: 0.45 + index * 0.03 }}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                          config.iconBg
                        )}>
                          <Icon className={cn("h-3.5 w-3.5", config.iconColor)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-medium block truncate">{expense.category}</span>
                          <span className="text-[9px] text-muted-foreground">
                            {format(parseISO(`${expense.month}-01`), 'MMM')}
                            {expense.recurrence && expense.recurrence !== 'one-time' && (
                              <span className="ml-1 text-primary font-medium">• {expense.recurrence}</span>
                            )}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-xs text-rose-500 shrink-0">
                        -{formatCurrency(expense.amount)}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfig}
          >
            <motion.div 
              className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/10 flex items-center justify-center border border-rose-500/20"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <TrendingDown className="h-5 w-5 text-rose-400" />
            </motion.div>
            <p className="text-xs font-semibold mb-1">No expenses yet</p>
            <p className="text-[10px] text-muted-foreground mb-3">Start tracking to get insights</p>
            <Link to="/expenses">
              <Button size="sm" variant="outline" className="gap-1 rounded-xl h-7 text-xs">
                <Plus className="h-3 w-3" />
                Add Expense
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Quick Insight - Compact */}
        {analytics.totalRecurring > 0 && (
          <motion.div 
            className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.5 }}
          >
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-3 w-3 text-amber-500" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Insight</span>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                  Fixed: <span className="font-bold text-violet-600 dark:text-violet-400">{formatCurrency(analytics.fixedTotal)}/mo</span>
                  {analytics.variableTotal > 0 && (
                    <> + <span className="font-bold">{formatCurrency(analytics.variableTotal)}</span> variable</>
                  )}
                  {analytics.taxDeductible > 0 && (
                    <>. Tax deductible: <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(analytics.taxDeductible)}</span></>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
