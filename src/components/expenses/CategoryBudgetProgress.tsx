import { useMemo, useState } from 'react';
import { Target, AlertTriangle, CheckCircle, Settings2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useExpenseBudgets, useUpsertExpenseBudget, useDeleteExpenseBudget, ExpenseBudget } from '@/hooks/useExpenseBudgets';

interface Expense {
  id: string;
  category: string;
  amount: number;
  recurrence?: string | null;
  month: string;
}

interface CategoryBudgetProgressProps {
  expenses: Expense[];
  currentMonth: string;
}

interface CategorySpending {
  category: string;
  spending: number;
  budget: ExpenseBudget | null;
  percentage: number;
  isOverBudget: boolean;
}

export function CategoryBudgetProgress({ expenses, currentMonth }: CategoryBudgetProgressProps) {
  const { data: budgets = [] } = useExpenseBudgets();
  const upsertBudget = useUpsertExpenseBudget();
  const deleteBudget = useDeleteExpenseBudget();
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string>('');
  const [budgetAmount, setBudgetAmount] = useState<number>(0);

  // Calculate spending by category for current month
  const categorySpending = useMemo(() => {
    const spendingMap: Record<string, number> = {};
    
    expenses.forEach(e => {
      const recurrence = e.recurrence || 'monthly';
      // Only count expenses that apply to current month
      if (recurrence === 'one-time' && e.month !== currentMonth) return;
      if (recurrence !== 'one-time' && e.month > currentMonth) return;
      
      let amount = Number(e.amount);
      if (recurrence === 'weekly') amount *= 4.33;
      
      spendingMap[e.category] = (spendingMap[e.category] || 0) + amount;
    });

    return spendingMap;
  }, [expenses, currentMonth]);

  // Combine spending with budgets
  const categoriesWithBudgets = useMemo(() => {
    const result: CategorySpending[] = [];
    const budgetMap = new Map(budgets.map(b => [b.category, b]));
    
    // Categories with budgets
    budgets.forEach(budget => {
      const spending = categorySpending[budget.category] || 0;
      const percentage = budget.monthly_limit > 0 ? (spending / budget.monthly_limit) * 100 : 0;
      result.push({
        category: budget.category,
        spending,
        budget,
        percentage: Math.min(percentage, 100),
        isOverBudget: spending > budget.monthly_limit,
      });
    });

    // Sort by percentage (highest first)
    return result.sort((a, b) => b.percentage - a.percentage);
  }, [budgets, categorySpending]);

  // Categories with spending but no budget
  const categoriesWithoutBudgets = useMemo(() => {
    const budgetCategories = new Set(budgets.map(b => b.category));
    return Object.entries(categorySpending)
      .filter(([category]) => !budgetCategories.has(category))
      .sort((a, b) => b[1] - a[1]);
  }, [budgets, categorySpending]);

  const handleSetBudget = (category: string, currentBudget?: number) => {
    setEditingCategory(category);
    setBudgetAmount(currentBudget || 0);
    setShowDialog(true);
  };

  const handleSaveBudget = async () => {
    if (!editingCategory) return;
    await upsertBudget.mutateAsync({
      category: editingCategory,
      monthly_limit: budgetAmount,
    });
    setShowDialog(false);
  };

  const handleRemoveBudget = async (budgetId: string) => {
    await deleteBudget.mutateAsync(budgetId);
  };

  const getProgressColor = (percentage: number, isOverBudget: boolean) => {
    if (isOverBudget) return 'bg-destructive';
    if (percentage >= 80) return 'bg-amber-500';
    if (percentage >= 50) return 'bg-accent';
    return 'bg-emerald-500';
  };

  if (categoriesWithBudgets.length === 0 && categoriesWithoutBudgets.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Budget Goals</h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {categoriesWithBudgets.length} categories tracked
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Categories with budgets */}
        {categoriesWithBudgets.map(({ category, spending, budget, percentage, isOverBudget }) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOverBudget ? (
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                ) : percentage >= 80 ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                )}
                <span className="font-medium text-sm">{category}</span>
              </div>
              <button
                onClick={() => handleSetBudget(category, budget?.monthly_limit)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="relative">
              <Progress 
                value={percentage} 
                className={cn(
                  "h-2.5",
                  isOverBudget && "bg-destructive/20"
                )}
              />
              <div 
                className={cn(
                  "absolute inset-0 h-2.5 rounded-full transition-all",
                  getProgressColor(percentage, isOverBudget)
                )}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className={cn(
                isOverBudget ? "text-destructive font-medium" : "text-muted-foreground"
              )}>
                {formatCurrency(spending)} spent
              </span>
              <span className="text-muted-foreground">
                of {formatCurrency(budget?.monthly_limit || 0)}
              </span>
            </div>
            
            {isOverBudget && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Over budget by {formatCurrency(spending - (budget?.monthly_limit || 0))}
              </p>
            )}
          </div>
        ))}

        {/* Quick add for categories without budgets */}
        {categoriesWithoutBudgets.length > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
              Set budgets for:
            </p>
            <div className="flex flex-wrap gap-2">
              {categoriesWithoutBudgets.slice(0, 5).map(([category, amount]) => (
                <button
                  key={category}
                  onClick={() => handleSetBudget(category)}
                  className="px-3 py-1.5 rounded-full text-xs border border-dashed border-border hover:border-accent hover:text-accent transition-colors flex items-center gap-1.5 bg-muted/30"
                >
                  <Target className="w-3 h-3" />
                  {category}
                  <span className="text-muted-foreground">({formatCurrency(amount)})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Set Budget Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Set Budget Goal</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Category</p>
              <p className="font-medium">{editingCategory}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Monthly Budget Limit</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="50"
                  className="pl-7"
                  value={budgetAmount || ''}
                  onChange={(e) => setBudgetAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              {categorySpending[editingCategory] && (
                <p className="text-xs text-muted-foreground mt-2">
                  Current spending: {formatCurrency(categorySpending[editingCategory])}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4">
            {budgets.find(b => b.category === editingCategory) && (
              <Button 
                variant="ghost" 
                className="text-destructive hover:bg-destructive/10 mr-auto"
                onClick={() => {
                  const budget = budgets.find(b => b.category === editingCategory);
                  if (budget) {
                    handleRemoveBudget(budget.id);
                    setShowDialog(false);
                  }
                }}
              >
                Remove
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveBudget}
              disabled={!budgetAmount}
              className="btn-premium"
            >
              Save Budget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
