import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Plus,
  ArrowRight,
  TrendingDown,
  TrendingUp,
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useExpenseBudgets } from '@/hooks/useExpenseBudgets';

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
  monthlyExpenses: number;
  annualExpenses: number;
}

const springConfigs = {
  gentle: { type: "spring" as const, stiffness: 120, damping: 20 },
  bouncy: { type: "spring" as const, stiffness: 300, damping: 20 },
};

const getExpenseType = (category: string): 'personal' | 'business' | 'rental' | 'other' => {
  if (category.startsWith('Personal -')) return 'personal';
  if (category.startsWith('Business -')) return 'business';
  if (category.startsWith('Rental -')) return 'rental';
  return 'other';
};

const getCurrentMonth = () => format(new Date(), 'yyyy-MM');

export function ExpenseCommandCenter({ expenses, monthlyExpenses, annualExpenses }: ExpenseCommandCenterProps) {
  const { data: budgets = [] } = useExpenseBudgets();
  const currentMonth = getCurrentMonth();
  
  const analytics = useMemo(() => {
    const calculateMonthlyAmount = (e: Expense) => {
      if (e.recurrence === 'weekly') return Number(e.amount) * 4.33;
      return Number(e.amount);
    };

    // Recent expenses (last 5)
    const recentExpenses = [...expenses]
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 5);

    // Breakdown by type
    const byType = {
      personal: { recurring: 0, oneTime: 0 },
      business: { recurring: 0, oneTime: 0 },
      rental: { recurring: 0, oneTime: 0 },
      other: { recurring: 0, oneTime: 0 },
    };

    let fixedTotal = 0;
    let variableTotal = 0;
    let taxDeductible = 0;

    // Spending by category for budgets
    const categorySpending: Record<string, number> = {};

    expenses.forEach(e => {
      const type = getExpenseType(e.category);
      const isOneTime = e.recurrence === 'one-time';
      const amount = isOneTime ? Number(e.amount) : calculateMonthlyAmount(e);

      if (isOneTime) {
        byType[type].oneTime += amount;
      } else {
        byType[type].recurring += amount;
      }

      // Fixed vs variable
      if (e.is_fixed !== false) {
        fixedTotal += isOneTime ? 0 : calculateMonthlyAmount(e);
      } else {
        variableTotal += isOneTime ? 0 : calculateMonthlyAmount(e);
      }

      // Tax deductible
      if (e.is_tax_deductible !== false && (type === 'business' || type === 'rental')) {
        taxDeductible += amount;
      }

      // Category spending for current month
      const recurrence = e.recurrence || 'monthly';
      if (recurrence === 'one-time' && e.month !== currentMonth) return;
      if (recurrence !== 'one-time' && e.month > currentMonth) return;
      
      let monthlyAmt = Number(e.amount);
      if (recurrence === 'weekly') monthlyAmt *= 4.33;
      
      categorySpending[e.category] = (categorySpending[e.category] || 0) + monthlyAmt;
    });

    // Budget tracking
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

    const totalPersonal = byType.personal.recurring + byType.personal.oneTime;
    const totalBusiness = byType.business.recurring + byType.business.oneTime;
    const totalRental = byType.rental.recurring + byType.rental.oneTime;
    const totalRecurring = byType.personal.recurring + byType.business.recurring + byType.rental.recurring + byType.other.recurring;

    return {
      recentExpenses,
      byType,
      totalPersonal,
      totalBusiness,
      totalRental,
      totalRecurring,
      fixedTotal,
      variableTotal,
      taxDeductible,
      budgetStatus,
      budgetsOverLimit: budgetStatus.filter(b => b.status === 'over').length,
      budgetsWarning: budgetStatus.filter(b => b.status === 'warning').length,
    };
  }, [expenses, budgets, currentMonth]);

  return (
    <motion.div 
      className="landing-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfigs.gentle}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-border/50 bg-gradient-to-r from-rose-50/50 to-orange-50/30 dark:from-rose-500/5 dark:to-orange-500/10">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={springConfigs.bouncy}
          >
            <Receipt className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h3 className="font-bold text-base text-slate-800 dark:text-foreground">
              Expense Command Center
            </h3>
            <p className="text-[12px] text-slate-500 dark:text-muted-foreground">Track, manage & optimize spending</p>
          </div>
        </div>

        <Link to="/expenses">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button size="sm" className="gap-1.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-lg shadow-rose-500/20">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </motion.div>
        </Link>
      </div>

      <div className="p-5 space-y-5">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <motion.div 
            className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 to-orange-500/5 border border-rose-200/50 dark:border-rose-500/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfigs.gentle, delay: 0.1 }}
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-rose-400/10 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-1.5 mb-1.5">
              <RefreshCw className="h-3.5 w-3.5 text-rose-500" />
              <p className="text-[10px] font-medium text-slate-500 dark:text-muted-foreground uppercase tracking-wide">Monthly</p>
            </div>
            <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{formatCurrency(monthlyExpenses)}</p>
          </motion.div>

          <motion.div 
            className="relative overflow-hidden p-4 rounded-2xl bg-slate-50 dark:bg-muted/30 border border-slate-200/50 dark:border-border/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfigs.gentle, delay: 0.15 }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-[10px] font-medium text-slate-500 dark:text-muted-foreground uppercase tracking-wide">Annual</p>
            </div>
            <p className="text-lg font-bold text-slate-600 dark:text-slate-300">{formatCurrency(annualExpenses)}</p>
          </motion.div>

          <motion.div 
            className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-200/50 dark:border-emerald-500/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfigs.gentle, delay: 0.2 }}
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-1.5 mb-1.5">
              <PiggyBank className="h-3.5 w-3.5 text-emerald-500" />
              <p className="text-[10px] font-medium text-slate-500 dark:text-muted-foreground uppercase tracking-wide">Deductible</p>
            </div>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(analytics.taxDeductible)}</p>
          </motion.div>

          <motion.div 
            className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-200/50 dark:border-violet-500/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfigs.gentle, delay: 0.25 }}
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-violet-400/10 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-1.5 mb-1.5">
              <Wallet className="h-3.5 w-3.5 text-violet-500" />
              <p className="text-[10px] font-medium text-slate-500 dark:text-muted-foreground uppercase tracking-wide">Fixed</p>
            </div>
            <p className="text-lg font-bold text-violet-600 dark:text-violet-400">{formatCurrency(analytics.fixedTotal)}</p>
          </motion.div>
        </div>

        {/* Type Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Home className="h-3.5 w-3.5 text-cyan-500" />
              <span className="text-[10px] font-medium text-cyan-600 dark:text-cyan-400 uppercase">Personal</span>
            </div>
            <p className="text-base font-bold text-slate-800 dark:text-foreground">{formatCurrency(analytics.totalPersonal)}</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="h-3.5 w-3.5 text-purple-500" />
              <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400 uppercase">Business</span>
            </div>
            <p className="text-base font-bold text-slate-800 dark:text-foreground">{formatCurrency(analytics.totalBusiness)}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Home className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase">Rental</span>
            </div>
            <p className="text-base font-bold text-slate-800 dark:text-foreground">{formatCurrency(analytics.totalRental)}</p>
          </div>
        </div>

        {/* Budget Alerts */}
        {analytics.budgetStatus.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-foreground">Budget Tracking</span>
              </div>
              {(analytics.budgetsOverLimit > 0 || analytics.budgetsWarning > 0) && (
                <div className="flex items-center gap-2">
                  {analytics.budgetsOverLimit > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
                      {analytics.budgetsOverLimit} over
                    </span>
                  )}
                  {analytics.budgetsWarning > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-medium">
                      {analytics.budgetsWarning} warning
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {analytics.budgetStatus.slice(0, 4).map((budget, index) => (
                <motion.div
                  key={budget.fullCategory}
                  className="p-3 rounded-xl bg-white dark:bg-card/50 border border-slate-100 dark:border-border/30"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...springConfigs.gentle, delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {budget.status === 'over' ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                      ) : budget.status === 'warning' ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                      <span className="text-sm font-medium text-slate-700 dark:text-foreground">{budget.category}</span>
                    </div>
                    <span className={cn(
                      "text-xs font-semibold",
                      budget.status === 'over' ? 'text-destructive' :
                      budget.status === 'warning' ? 'text-amber-600' : 'text-emerald-600'
                    )}>
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                    </span>
                  </div>
                  <Progress 
                    value={budget.percentage} 
                    className={cn(
                      "h-1.5",
                      budget.status === 'over' ? '[&>div]:bg-destructive' :
                      budget.status === 'warning' ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'
                    )}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Expenses */}
        {analytics.recentExpenses.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-foreground">Recent Expenses</span>
              <Link to="/expenses" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {analytics.recentExpenses.map((expense, index) => {
                  const type = getExpenseType(expense.category);
                  const displayCategory = expense.category.replace(/^(Personal|Business|Rental) - /, '');
                  
                  return (
                    <motion.div
                      key={expense.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-card/50 border border-slate-100 dark:border-border/30 hover:border-slate-200 dark:hover:border-border/50 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...springConfigs.gentle, delay: index * 0.03 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          type === 'personal' ? "bg-cyan-100 dark:bg-cyan-500/20" :
                          type === 'business' ? "bg-purple-100 dark:bg-purple-500/20" :
                          type === 'rental' ? "bg-amber-100 dark:bg-amber-500/20" :
                          "bg-slate-100 dark:bg-muted"
                        )}>
                          {type === 'personal' && <Home className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />}
                          {type === 'business' && <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
                          {type === 'rental' && <Home className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
                          {type === 'other' && <Receipt className="h-4 w-4 text-slate-500" />}
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-slate-800 dark:text-foreground block truncate">{displayCategory}</span>
                          <span className="text-[10px] text-slate-400 dark:text-muted-foreground">
                            {format(parseISO(`${expense.month}-01`), 'MMM yyyy')}
                            {expense.recurrence && expense.recurrence !== 'one-time' && (
                              <span className="ml-1.5 text-primary">• {expense.recurrence}</span>
                            )}
                          </span>
                        </div>
                      </div>
                      <span className="font-semibold text-sm text-rose-600 dark:text-rose-400">
                        -{formatCurrency(expense.amount)}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <motion.div 
            className="text-center py-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfigs.gentle}
          >
            <motion.div 
              className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-rose-100 to-orange-50 dark:from-rose-500/20 dark:to-orange-500/10 flex items-center justify-center"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Receipt className="h-6 w-6 text-rose-400" />
            </motion.div>
            <p className="text-sm font-medium text-slate-600 dark:text-muted-foreground mb-1">No expenses tracked yet</p>
            <p className="text-xs text-slate-400 dark:text-muted-foreground mb-3">Start tracking to get insights</p>
            <Link to="/expenses">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add Expense
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Quick Insights */}
        {analytics.totalRecurring > 0 && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-muted/30 dark:to-muted/10 border border-slate-200/50 dark:border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-foreground">Quick Insight</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">
              Your fixed expenses are <span className="font-semibold text-violet-600">{formatCurrency(analytics.fixedTotal)}/mo</span>
              {analytics.variableTotal > 0 && (
                <>, with <span className="font-semibold text-slate-700">{formatCurrency(analytics.variableTotal)}/mo</span> in variable costs</>
              )}. 
              {analytics.taxDeductible > 0 && (
                <> You can deduct <span className="font-semibold text-emerald-600">{formatCurrency(analytics.taxDeductible)}</span> from taxes.</>
              )}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
