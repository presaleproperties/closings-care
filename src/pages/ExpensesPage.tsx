import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { 
  useExpenses, 
  useCreateExpense, 
  useUpdateExpense, 
  useDeleteExpense 
} from '@/hooks/useExpenses';
import { formatCurrency, getCurrentMonth, getMonthRange } from '@/lib/format';
import { ExpenseFormData } from '@/lib/types';

const defaultCategories = [
  'Marketing',
  'Office Rent',
  'Insurance',
  'MLS Fees',
  'Software',
  'Vehicle',
  'Professional Development',
  'Admin Support',
  'Other',
];

export default function ExpensesPage() {
  const { data: expenses = [], isLoading } = useExpenses();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ExpenseFormData>>({
    category: defaultCategories[0],
    amount: 0,
    month: currentMonth,
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

  // Group expenses by category for current month
  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => e.month === currentMonth);
  }, [expenses, currentMonth]);

  const totalMonthExpenses = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

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
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.category || !formData.amount) return;

    if (editingId) {
      await updateExpense.mutateAsync({ id: editingId, data: formData });
    } else {
      await createExpense.mutateAsync(formData as ExpenseFormData);
    }
    setShowDialog(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this expense?')) {
      await deleteExpense.mutateAsync(id);
    }
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
            {monthExpenses.map((expense) => (
              <div
                key={expense.id}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow group cursor-pointer"
                onClick={() => handleOpenEdit(expense)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{expense.category}</p>
                    <p className="text-2xl font-bold mt-1">
                      {formatCurrency(expense.amount)}
                    </p>
                    {expense.notes && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {expense.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(expense.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

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
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 bg-muted/50 border-b border-border">
              <h3 className="font-semibold">Monthly Summary</h3>
            </div>
            <div className="p-4">
              <table className="w-full">
                <tbody>
                  {Object.entries(
                    monthExpenses.reduce((acc, e) => {
                      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
                      return acc;
                    }, {} as Record<string, number>)
                  )
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, total]) => (
                      <tr key={category} className="border-b border-border/50 last:border-0">
                        <td className="py-2">{category}</td>
                        <td className="py-2 text-right font-medium">
                          {formatCurrency(total)}
                        </td>
                      </tr>
                    ))}
                  <tr className="font-semibold">
                    <td className="py-2 pt-4">Total</td>
                    <td className="py-2 pt-4 text-right">{formatCurrency(totalMonthExpenses)}</td>
                  </tr>
                </tbody>
              </table>
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
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount || ''}
                onChange={(e) => setFormData((p) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Month</Label>
              <Input
                type="month"
                value={formData.month}
                onChange={(e) => setFormData((p) => ({ ...p, month: e.target.value }))}
              />
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
