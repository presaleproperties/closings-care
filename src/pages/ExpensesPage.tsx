import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Plus, Trash2, ChevronLeft, ChevronRight, Repeat, Calendar, Clock, User, Briefcase, Receipt, PiggyBank, MoreHorizontal, Target } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  useExpenses, 
  useCreateExpense, 
  useUpdateExpense, 
  useDeleteExpense 
} from '@/hooks/useExpenses';
import { formatCurrency, getCurrentMonth } from '@/lib/format';
import { ExpenseFormData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CategoryBudgetProgress } from '@/components/expenses/CategoryBudgetProgress';

// Categorized expenses for real estate agents
const expenseCategories = {
  personal: {
    'Housing': [
      'Mortgage/Rent',
      'Strata Fees',
      'Property Taxes',
      'Hydro/Utilities',
      'Internet',
    ],
    'Transportation': [
      'Car Lease/Payment',
      'Car Insurance (Personal)',
      'Car Charging/Gas',
    ],
    'Living': [
      'Phone (Personal)',
      'Groceries',
      'Entertainment/Dining',
      'Gym/Fitness',
      'Apps & Subscriptions',
    ],
  },
  business: {
    'Office': [
      'Office Lease',
      'Board Fees',
      'Brokerage Fees',
    ],
    'Technology': [
      'CRM (CHIME, etc.)',
      'Website Hosting',
      'Google Workspace',
      'iCloud/Storage',
      'Canva/Design Tools',
      'Email Marketing (MailerLite)',
      'Editing Apps',
      'Other Software',
    ],
    'Marketing': [
      'Facebook/Social Ads',
      'Signs & Signage',
      'Marketing Agency',
      'Marketing Manager',
      'Print Marketing',
    ],
    'Transportation': [
      'Car (Business Use)',
      'Car Insurance (Business)',
      'Car Charging (Business)',
    ],
    'Professional': [
      'BCFSA License',
      'Real Estate License',
      'Professional Development',
      'Continuing Education',
    ],
    'Client': [
      'Client Gifts',
      'Staging/Clean-ups',
      'Photography',
    ],
    'Admin': [
      'Phone (Business)',
      'Admin Support',
      'Bookkeeping',
    ],
  },
  taxes: {
    'Taxes & Savings': [
      'Tax Set-Aside',
      'GST/HST Remittance',
      'Debt Pay Down',
    ],
  },
  other: {
    'Other': [
      'Miscellaneous',
    ],
  },
};

// Get all categories flat with their type
const getAllCategories = () => {
  const result: { category: string; type: 'personal' | 'business' | 'taxes' | 'other'; group: string }[] = [];
  
  Object.entries(expenseCategories.personal).forEach(([group, items]) => {
    items.forEach(item => result.push({ category: item, type: 'personal', group }));
  });
  Object.entries(expenseCategories.business).forEach(([group, items]) => {
    items.forEach(item => result.push({ category: item, type: 'business', group }));
  });
  Object.entries(expenseCategories.taxes).forEach(([group, items]) => {
    items.forEach(item => result.push({ category: item, type: 'taxes', group }));
  });
  Object.entries(expenseCategories.other).forEach(([group, items]) => {
    items.forEach(item => result.push({ category: item, type: 'other', group }));
  });
  
  return result;
};

const allCategoriesFlat = getAllCategories();
const defaultCategories = allCategoriesFlat.map(c => c.category);

const getCategoryType = (category: string): 'personal' | 'business' | 'taxes' | 'other' => {
  const found = allCategoriesFlat.find(c => c.category === category);
  return found?.type || 'other';
};

type RecurrenceType = 'monthly' | 'weekly' | 'one-time';
type ExpenseType = 'personal' | 'business' | 'taxes' | 'other';

export default function ExpensesPage() {
  const { data: expenses = [], isLoading } = useExpenses();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ExpenseType>('personal');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ExpenseFormData> & { recurrence?: RecurrenceType }>({
    category: '',
    amount: 0,
    month: currentMonth,
    recurrence: 'monthly',
  });

  // Navigate months
  const handlePrevMonth = () => {
    const date = parseISO(`${currentMonth}-01`);
    date.setMonth(date.getMonth() - 1);
    setCurrentMonth(format(date, 'yyyy-MM'));
  };

  const handleNextMonth = () => {
    const date = parseISO(`${currentMonth}-01`);
    date.setMonth(date.getMonth() + 1);
    setCurrentMonth(format(date, 'yyyy-MM'));
  };

  // Get expenses for current month (recurring ones apply to all months)
  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const recurrence = (e as any).recurrence || 'monthly';
      if (recurrence === 'one-time') {
        return e.month === currentMonth;
      }
      const startMonth = e.month;
      return currentMonth >= startMonth;
    });
  }, [expenses, currentMonth]);

  const totalMonthExpenses = useMemo(() => {
    return monthExpenses.reduce((sum, e) => {
      const recurrence = (e as any).recurrence || 'monthly';
      if (recurrence === 'weekly') {
        return sum + Number(e.amount) * 4.33;
      }
      return sum + Number(e.amount);
    }, 0);
  }, [monthExpenses]);

  // Group expenses by type
  const groupedExpenses = useMemo(() => {
    const groups: Record<ExpenseType, typeof expenses> = {
      personal: [],
      business: [],
      taxes: [],
      other: [],
    };
    
    monthExpenses.forEach(e => {
      const type = getCategoryType(e.category);
      groups[type].push(e);
    });
    
    return groups;
  }, [monthExpenses]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setSelectedType('personal');
    setSelectedGroup(null);
    setFormData({
      category: '',
      amount: 0,
      month: currentMonth,
      recurrence: 'monthly',
    });
    setShowDialog(true);
  };

  const handleOpenEdit = (expense: typeof expenses[0]) => {
    const type = getCategoryType(expense.category);
    setEditingId(expense.id);
    setSelectedType(type);
    setSelectedGroup(null);
    setFormData({
      category: expense.category,
      amount: expense.amount,
      month: expense.month,
      notes: expense.notes || '',
      recurrence: (expense as any).recurrence || 'monthly',
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.category || !formData.amount) return;

    const dataToSave = {
      ...formData,
      recurrence: formData.recurrence || 'monthly',
    };

    if (editingId) {
      await updateExpense.mutateAsync({ id: editingId, data: dataToSave });
    } else {
      await createExpense.mutateAsync(dataToSave as ExpenseFormData);
    }
    setShowDialog(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this expense?')) {
      await deleteExpense.mutateAsync(id);
    }
  };

  const getRecurrenceBadge = (recurrence: RecurrenceType) => {
    switch (recurrence) {
      case 'weekly':
        return <Badge variant="secondary" className="text-xs"><Clock className="w-3 h-3 mr-1" />Weekly</Badge>;
      case 'one-time':
        return <Badge variant="outline" className="text-xs"><Calendar className="w-3 h-3 mr-1" />One-time</Badge>;
      default:
        return <Badge variant="default" className="text-xs bg-accent/20 text-accent border-0"><Repeat className="w-3 h-3 mr-1" />Monthly</Badge>;
    }
  };

  const getDisplayAmount = (expense: typeof expenses[0]) => {
    const recurrence = (expense as any).recurrence || 'monthly';
    if (recurrence === 'weekly') {
      return Number(expense.amount) * 4.33;
    }
    return Number(expense.amount);
  };

  const getTypeTotal = (type: ExpenseType) => {
    return groupedExpenses[type].reduce((sum, e) => sum + getDisplayAmount(e), 0);
  };

  const currentCategories = expenseCategories[selectedType] || {};

  return (
    <AppLayout>
      <Header 
        title="Expenses" 
        subtitle={`${format(parseISO(`${currentMonth}-01`), 'MMMM yyyy')}`}
        action={
          <Button onClick={handleOpenAdd} className="btn-premium">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        }
      />

      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="text-center">
            <h2 className="text-lg font-semibold">
              {format(parseISO(`${currentMonth}-01`), 'MMMM yyyy')}
            </h2>
            <p className="text-sm text-muted-foreground">
              Total: {formatCurrency(totalMonthExpenses)}
            </p>
          </div>

          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-card border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Personal</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(getTypeTotal('personal'))}</p>
            <p className="text-xs text-muted-foreground">{groupedExpenses.personal.length} items</p>
          </div>
          <div className="bg-card border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <Briefcase className="w-4 h-4" />
              <span className="text-sm font-medium">Business</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(getTypeTotal('business'))}</p>
            <p className="text-xs text-muted-foreground">{groupedExpenses.business.length} items</p>
          </div>
          <div className="bg-card border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <PiggyBank className="w-4 h-4" />
              <span className="text-sm font-medium">Taxes & Savings</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(getTypeTotal('taxes'))}</p>
            <p className="text-xs text-muted-foreground">{groupedExpenses.taxes.length} items</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Receipt className="w-4 h-4" />
              <span className="text-sm font-medium">Other</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(getTypeTotal('other'))}</p>
            <p className="text-xs text-muted-foreground">{groupedExpenses.other.length} items</p>
          </div>
        </div>

        {/* Budget Goals Progress */}
        <CategoryBudgetProgress expenses={expenses} currentMonth={currentMonth} />

        {/* Expenses List by Type */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : monthExpenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No expenses for this month</p>
            <Button onClick={handleOpenAdd} className="btn-premium">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Expense
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Personal Expenses */}
            {groupedExpenses.personal.length > 0 && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-3 bg-blue-500/10 border-b border-blue-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" />
                    <h3 className="font-semibold text-blue-400">Personal Expenses</h3>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(getTypeTotal('personal'))}</span>
                </div>
                <div className="divide-y divide-border">
                  {groupedExpenses.personal.map(expense => (
                    <ExpenseRow 
                      key={expense.id} 
                      expense={expense} 
                      onEdit={() => handleOpenEdit(expense)}
                      onDelete={() => handleDelete(expense.id)}
                      getRecurrenceBadge={getRecurrenceBadge}
                      getDisplayAmount={getDisplayAmount}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Business Expenses */}
            {groupedExpenses.business.length > 0 && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-3 bg-purple-500/10 border-b border-purple-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-purple-400" />
                    <h3 className="font-semibold text-purple-400">Business Expenses</h3>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(getTypeTotal('business'))}</span>
                </div>
                <div className="divide-y divide-border">
                  {groupedExpenses.business.map(expense => (
                    <ExpenseRow 
                      key={expense.id} 
                      expense={expense} 
                      onEdit={() => handleOpenEdit(expense)}
                      onDelete={() => handleDelete(expense.id)}
                      getRecurrenceBadge={getRecurrenceBadge}
                      getDisplayAmount={getDisplayAmount}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Taxes & Savings */}
            {groupedExpenses.taxes.length > 0 && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="w-4 h-4 text-amber-400" />
                    <h3 className="font-semibold text-amber-400">Taxes & Savings</h3>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(getTypeTotal('taxes'))}</span>
                </div>
                <div className="divide-y divide-border">
                  {groupedExpenses.taxes.map(expense => (
                    <ExpenseRow 
                      key={expense.id} 
                      expense={expense} 
                      onEdit={() => handleOpenEdit(expense)}
                      onDelete={() => handleDelete(expense.id)}
                      getRecurrenceBadge={getRecurrenceBadge}
                      getDisplayAmount={getDisplayAmount}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other */}
            {groupedExpenses.other.length > 0 && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-3 bg-muted/50 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold">Other Expenses</h3>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(getTypeTotal('other'))}</span>
                </div>
                <div className="divide-y divide-border">
                  {groupedExpenses.other.map(expense => (
                    <ExpenseRow 
                      key={expense.id} 
                      expense={expense} 
                      onEdit={() => handleOpenEdit(expense)}
                      onDelete={() => handleDelete(expense.id)}
                      getRecurrenceBadge={getRecurrenceBadge}
                      getDisplayAmount={getDisplayAmount}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Add More Button */}
            <button
              onClick={handleOpenAdd}
              className="w-full bg-muted/50 border-2 border-dashed border-border rounded-xl p-4 flex items-center justify-center gap-2 text-muted-foreground hover:border-accent hover:text-accent transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Expense</span>
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog - Optimized Form */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Step 1: Expense Type Toggle */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Type</Label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => { setSelectedType('personal'); setSelectedGroup(null); setFormData(p => ({ ...p, category: '' })); }}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1",
                    selectedType === 'personal' 
                      ? "border-blue-500 bg-blue-500/10 text-blue-400" 
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <User className="w-5 h-5" />
                  <span className="text-xs font-medium">Personal</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedType('business'); setSelectedGroup(null); setFormData(p => ({ ...p, category: '' })); }}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1",
                    selectedType === 'business' 
                      ? "border-purple-500 bg-purple-500/10 text-purple-400" 
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <Briefcase className="w-5 h-5" />
                  <span className="text-xs font-medium">Business</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedType('taxes'); setSelectedGroup(null); setFormData(p => ({ ...p, category: '' })); }}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1",
                    selectedType === 'taxes' 
                      ? "border-amber-500 bg-amber-500/10 text-amber-400" 
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <PiggyBank className="w-5 h-5" />
                  <span className="text-xs font-medium">Taxes</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedType('other'); setSelectedGroup(null); setFormData(p => ({ ...p, category: '' })); }}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1",
                    selectedType === 'other' 
                      ? "border-muted-foreground bg-muted text-foreground" 
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <MoreHorizontal className="w-5 h-5" />
                  <span className="text-xs font-medium">Other</span>
                </button>
              </div>
            </div>

            {/* Step 2: Category Selection - Visual Grid */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Category</Label>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {Object.entries(currentCategories).map(([group, items]) => (
                  <div key={group}>
                    <p className="text-xs font-medium text-muted-foreground mb-2">{group}</p>
                    <div className="flex flex-wrap gap-2">
                      {(items as string[]).map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, category: item }))}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-sm border transition-all",
                            formData.category === item
                              ? selectedType === 'personal' ? "border-blue-500 bg-blue-500/20 text-blue-300"
                              : selectedType === 'business' ? "border-purple-500 bg-purple-500/20 text-purple-300"
                              : selectedType === 'taxes' ? "border-amber-500 bg-amber-500/20 text-amber-300"
                              : "border-muted-foreground bg-muted text-foreground"
                              : "border-border hover:border-muted-foreground bg-muted/30"
                          )}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Recurrence Type */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Frequency</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, recurrence: 'monthly' }))}
                  className={cn(
                    "p-2.5 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                    formData.recurrence === 'monthly'
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <Repeat className="w-4 h-4" />
                  <span className="text-sm font-medium">Monthly</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, recurrence: 'weekly' }))}
                  className={cn(
                    "p-2.5 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                    formData.recurrence === 'weekly'
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Weekly</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, recurrence: 'one-time' }))}
                  className={cn(
                    "p-2.5 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                    formData.recurrence === 'one-time'
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">One-time</span>
                </button>
              </div>
            </div>

            {/* Step 4: Amount & Month */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Amount {formData.recurrence === 'weekly' && <span className="normal-case">(per week)</span>}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-7 h-11"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                {formData.recurrence === 'weekly' && formData.amount && formData.amount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    ≈ {formatCurrency(formData.amount * 4.33)}/month
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  {formData.recurrence === 'one-time' ? 'Month' : 'Starting'}
                </Label>
                <Input
                  type="month"
                  className="h-11"
                  value={formData.month}
                  onChange={(e) => setFormData((p) => ({ ...p, month: e.target.value }))}
                />
              </div>
            </div>

            {/* Step 5: Notes (Optional) */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Notes (optional)</Label>
              <Input
                value={formData.notes || ''}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Add a note..."
                className="h-10"
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="btn-premium"
              disabled={!formData.category || !formData.amount}
            >
              {editingId ? 'Save Changes' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

// Expense Row Component
function ExpenseRow({ 
  expense, 
  onEdit, 
  onDelete,
  getRecurrenceBadge,
  getDisplayAmount 
}: { 
  expense: any; 
  onEdit: () => void;
  onDelete: () => void;
  getRecurrenceBadge: (r: RecurrenceType) => JSX.Element;
  getDisplayAmount: (e: any) => number;
}) {
  const recurrence = expense.recurrence || 'monthly';
  
  return (
    <div 
      className="p-3 flex items-center justify-between hover:bg-muted/30 cursor-pointer group transition-colors"
      onClick={onEdit}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <p className="font-medium truncate">{expense.category}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {getRecurrenceBadge(recurrence)}
            {expense.notes && (
              <span className="text-xs text-muted-foreground truncate max-w-[150px]">{expense.notes}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-bold">{formatCurrency(getDisplayAmount(expense))}</p>
          {recurrence === 'weekly' && (
            <p className="text-xs text-muted-foreground">{formatCurrency(expense.amount)}/wk</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
