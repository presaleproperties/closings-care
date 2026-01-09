import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Plus, Trash2, ChevronLeft, ChevronRight, Repeat, Calendar, Clock } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  useExpenses, 
  useCreateExpense, 
  useUpdateExpense, 
  useDeleteExpense 
} from '@/hooks/useExpenses';
import { formatCurrency, getCurrentMonth } from '@/lib/format';
import { ExpenseFormData } from '@/lib/types';

// Categorized expenses for real estate agents
const expenseCategories = {
  'Personal - Housing': [
    'Mortgage/Rent',
    'Strata Fees',
    'Property Taxes',
    'Hydro/Utilities',
    'Internet',
  ],
  'Personal - Transportation': [
    'Car Lease/Payment',
    'Car Insurance (Personal)',
    'Car Charging/Gas',
  ],
  'Personal - Living': [
    'Phone (Personal)',
    'Groceries',
    'Entertainment/Dining',
    'Gym/Fitness',
    'Apps & Subscriptions',
  ],
  'Business - Office': [
    'Office Lease',
    'Board Fees',
    'Brokerage Fees',
  ],
  'Business - Technology': [
    'CRM (CHIME, etc.)',
    'Website Hosting',
    'Google Workspace',
    'iCloud/Storage',
    'Canva/Design Tools',
    'Email Marketing (MailerLite)',
    'Editing Apps',
    'Other Software',
  ],
  'Business - Marketing': [
    'Facebook/Social Ads',
    'Signs & Signage',
    'Marketing Agency',
    'Marketing Manager',
    'Print Marketing',
  ],
  'Business - Transportation': [
    'Car (Business Use)',
    'Car Insurance (Business)',
    'Car Charging (Business)',
  ],
  'Business - Professional': [
    'BCFSA License',
    'Real Estate License',
    'Professional Development',
    'Continuing Education',
  ],
  'Business - Client': [
    'Client Gifts',
    'Staging/Clean-ups',
    'Photography',
  ],
  'Business - Admin': [
    'Phone (Business)',
    'Admin Support',
    'Bookkeeping',
  ],
  'Taxes & Savings': [
    'Tax Set-Aside',
    'GST/HST Remittance',
    'Debt Pay Down',
  ],
  'Other': [
    'Miscellaneous',
  ],
};

// Flatten categories for dropdown
const allDefaultCategories = Object.entries(expenseCategories).flatMap(([group, items]) => 
  items.map(item => ({ group, item }))
);

const defaultCategories = allDefaultCategories.map(c => c.item);

type RecurrenceType = 'monthly' | 'weekly' | 'one-time';

export default function ExpensesPage() {
  const { data: expenses = [], isLoading } = useExpenses();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ExpenseFormData> & { recurrence?: RecurrenceType }>({
    category: defaultCategories[0],
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
      // One-time expenses only show in their specific month
      if (recurrence === 'one-time') {
        return e.month === currentMonth;
      }
      // Monthly/weekly recurring expenses show in all months from their start month onwards
      const startMonth = e.month;
      return currentMonth >= startMonth;
    });
  }, [expenses, currentMonth]);

  const totalMonthExpenses = useMemo(() => {
    return monthExpenses.reduce((sum, e) => {
      const recurrence = (e as any).recurrence || 'monthly';
      if (recurrence === 'weekly') {
        // Approximate 4.33 weeks per month
        return sum + Number(e.amount) * 4.33;
      }
      return sum + Number(e.amount);
    }, 0);
  }, [monthExpenses]);

  // Get unique categories across all expenses
  const allCategories = useMemo(() => {
    const cats = new Set(expenses.map((e) => e.category));
    defaultCategories.forEach((c) => cats.add(c));
    return Array.from(cats).sort();
  }, [expenses]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      category: defaultCategories[0],
      amount: 0,
      month: currentMonth,
      recurrence: 'monthly',
    });
    setShowDialog(true);
  };

  const handleOpenEdit = (expense: typeof expenses[0]) => {
    setEditingId(expense.id);
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
      return Number(expense.amount) * 4.33; // Monthly equivalent
    }
    return Number(expense.amount);
  };

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

        {/* Expenses Grid */}
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthExpenses.map((expense) => {
              const recurrence = (expense as any).recurrence || 'monthly';
              return (
                <div
                  key={expense.id}
                  className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow group cursor-pointer"
                  onClick={() => handleOpenEdit(expense)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{expense.category}</p>
                      </div>
                      {getRecurrenceBadge(recurrence)}
                      <p className="text-2xl font-bold mt-2">
                        {formatCurrency(getDisplayAmount(expense))}
                        {recurrence === 'weekly' && (
                          <span className="text-xs font-normal text-muted-foreground ml-1">/mo</span>
                        )}
                      </p>
                      {recurrence === 'weekly' && (
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(expense.amount)}/week
                        </p>
                      )}
                      {expense.notes && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {expense.notes}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(expense.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* Add Card */}
            <button
              onClick={handleOpenAdd}
              className="bg-muted/50 border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-accent hover:text-accent transition-colors min-h-[120px]"
            >
              <Plus className="w-6 h-6" />
              <span className="font-medium">Add Expense</span>
            </button>
          </div>
        )}

        {/* Monthly Summary */}
        {monthExpenses.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            {/* By Category */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted/50 border-b border-border">
                <h3 className="font-semibold">By Category</h3>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <tbody>
                    {Object.entries(
                      monthExpenses.reduce((acc, e) => {
                        const amount = getDisplayAmount(e);
                        acc[e.category] = (acc[e.category] || 0) + amount;
                        return acc;
                      }, {} as Record<string, number>)
                    )
                      .sort((a, b) => b[1] - a[1])
                      .map(([category, total]) => (
                        <tr key={category} className="border-b border-border/50 last:border-0">
                          <td className="py-2 text-sm">{category}</td>
                          <td className="py-2 text-right font-medium text-sm">
                            {formatCurrency(total)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Personal vs Business */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted/50 border-b border-border">
                <h3 className="font-semibold">Personal vs Business</h3>
              </div>
              <div className="p-4 space-y-4">
                {(() => {
                  const personalCategories = Object.entries(expenseCategories)
                    .filter(([group]) => group.startsWith('Personal'))
                    .flatMap(([, items]) => items);
                  const businessCategories = Object.entries(expenseCategories)
                    .filter(([group]) => group.startsWith('Business'))
                    .flatMap(([, items]) => items);
                  const taxCategories = expenseCategories['Taxes & Savings'] || [];

                  const personalTotal = monthExpenses
                    .filter(e => personalCategories.includes(e.category))
                    .reduce((sum, e) => sum + getDisplayAmount(e), 0);
                  const businessTotal = monthExpenses
                    .filter(e => businessCategories.includes(e.category))
                    .reduce((sum, e) => sum + getDisplayAmount(e), 0);
                  const taxTotal = monthExpenses
                    .filter(e => taxCategories.includes(e.category))
                    .reduce((sum, e) => sum + getDisplayAmount(e), 0);
                  const otherTotal = totalMonthExpenses - personalTotal - businessTotal - taxTotal;

                  return (
                    <>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <span className="font-medium">Personal</span>
                        </div>
                        <span className="font-bold">{formatCurrency(personalTotal)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-500" />
                          <span className="font-medium">Business</span>
                        </div>
                        <span className="font-bold">{formatCurrency(businessTotal)}</span>
                      </div>
                      {taxTotal > 0 && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span className="font-medium">Taxes & Savings</span>
                          </div>
                          <span className="font-bold">{formatCurrency(taxTotal)}</span>
                        </div>
                      )}
                      {otherTotal > 0 && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                            <span className="font-medium">Other</span>
                          </div>
                          <span className="font-bold">{formatCurrency(otherTotal)}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-border flex items-center justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-lg">{formatCurrency(totalMonthExpenses)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Expense Type</Label>
              <Select
                value={formData.recurrence || 'monthly'}
                onValueChange={(v) => setFormData((p) => ({ ...p, recurrence: v as RecurrenceType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="monthly">
                    <div className="flex items-center gap-2">
                      <Repeat className="w-4 h-4" />
                      Monthly Recurring
                    </div>
                  </SelectItem>
                  <SelectItem value="weekly">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Weekly Recurring
                    </div>
                  </SelectItem>
                  <SelectItem value="one-time">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      One-Time Expense
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-popover max-h-[300px]">
                  {Object.entries(expenseCategories).map(([group, items]) => (
                    <div key={group}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                        {group}
                      </div>
                      {items.map((item) => (
                        <SelectItem key={item} value={item} className="pl-4">
                          {item}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                  {/* Include any custom categories not in the default list */}
                  {allCategories.filter(c => !defaultCategories.includes(c)).length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                        Custom
                      </div>
                      {allCategories.filter(c => !defaultCategories.includes(c)).map((cat) => (
                        <SelectItem key={cat} value={cat} className="pl-4">
                          {cat}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Amount {formData.recurrence === 'weekly' && <span className="text-muted-foreground">(per week)</span>}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.01"
                  className="pl-7"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData((p) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder={formData.recurrence === 'weekly' ? '100.00' : '500.00'}
                />
              </div>
              {formData.recurrence === 'weekly' && formData.amount && (
                <p className="text-xs text-muted-foreground">
                  ≈ {formatCurrency(formData.amount * 4.33)}/month
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                {formData.recurrence === 'one-time' ? 'Month' : 'Starting From'}
              </Label>
              <Input
                type="month"
                value={formData.month}
                onChange={(e) => setFormData((p) => ({ ...p, month: e.target.value }))}
              />
              {formData.recurrence !== 'one-time' && (
                <p className="text-xs text-muted-foreground">
                  This expense will repeat every {formData.recurrence === 'weekly' ? 'week' : 'month'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={formData.notes || ''}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Optional notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="btn-premium">
              {editingId ? 'Save' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
