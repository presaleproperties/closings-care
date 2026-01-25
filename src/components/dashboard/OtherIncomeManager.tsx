import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Plus, Pencil, Trash2, Wallet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  useOtherIncome,
  useCreateOtherIncome,
  useUpdateOtherIncome,
  useDeleteOtherIncome,
  OtherIncome,
  OtherIncomeFormData,
} from '@/hooks/useOtherIncome';

const RECURRENCE_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'one-time', label: 'One-time' },
] as const;

export function OtherIncomeManager() {
  const { data: otherIncome = [] } = useOtherIncome();
  const createIncome = useCreateOtherIncome();
  const updateIncome = useUpdateOtherIncome();
  const deleteIncome = useDeleteOtherIncome();

  const [isOpen, setIsOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<OtherIncome | null>(null);
  const [formData, setFormData] = useState<OtherIncomeFormData>({
    name: '',
    amount: 0,
    recurrence: 'monthly',
    start_month: format(new Date(), 'yyyy-MM'),
  });

  const resetForm = () => {
    setFormData({
      name: '',
      amount: 0,
      recurrence: 'monthly',
      start_month: format(new Date(), 'yyyy-MM'),
    });
    setEditingIncome(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) resetForm();
  };

  const handleEdit = (income: OtherIncome) => {
    setEditingIncome(income);
    setFormData({
      name: income.name,
      amount: income.amount,
      recurrence: income.recurrence as 'monthly' | 'weekly' | 'one-time',
      start_month: income.start_month,
      end_month: income.end_month || undefined,
      notes: income.notes || undefined,
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingIncome) {
      await updateIncome.mutateAsync({ id: editingIncome.id, data: formData });
    } else {
      await createIncome.mutateAsync(formData);
    }

    setIsOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await deleteIncome.mutateAsync(id);
  };

  // Calculate totals
  const monthlyTotal = otherIncome
    .filter((i) => i.recurrence === 'monthly')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const weeklyTotal = otherIncome
    .filter((i) => i.recurrence === 'weekly')
    .reduce((sum, i) => sum + Number(i.amount) * 4.33, 0);

  const oneTimeTotal = otherIncome
    .filter((i) => i.recurrence === 'one-time')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const totalMonthly = monthlyTotal + weeklyTotal;

  return (
    <div className="landing-card">
      <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-border/50">
        <div className="flex items-center gap-3">
          <div className="icon-gradient-blue icon-gradient-sm">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[15px] sm:text-base text-slate-800 dark:text-foreground">
              Other Income
            </h3>
            <p className="text-[12px] text-slate-500 dark:text-muted-foreground">Revenue share, side income, etc.</p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 bg-sky-500 hover:bg-sky-600">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingIncome ? 'Edit Income' : 'Add Other Income'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., Revenue Share, Rental Income"
                  required
                />
              </div>

              <div>
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))
                  }
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <Label>Recurrence</Label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, recurrence: opt.value }))}
                      className={cn(
                        'px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                        formData.recurrence === opt.value
                          ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                          : 'border-border hover:border-muted-foreground'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Start Month</Label>
                  <Input
                    type="month"
                    value={formData.start_month}
                    onChange={(e) => setFormData((p) => ({ ...p, start_month: e.target.value }))}
                    required
                  />
                </div>
                {formData.recurrence !== 'one-time' && (
                  <div>
                    <Label>End Month (optional)</Label>
                    <Input
                      type="month"
                      value={formData.end_month || ''}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, end_month: e.target.value || undefined }))
                      }
                    />
                  </div>
                )}
              </div>

              <div>
                <Label>Notes (optional)</Label>
                <Input
                  value={formData.notes || ''}
                  onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-sky-500 hover:bg-sky-600"
                  disabled={createIncome.isPending || updateIncome.isPending}
                >
                  {editingIncome ? 'Update' : 'Add Income'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 rounded-xl bg-sky-500/10">
          <p className="text-xs text-muted-foreground mb-0.5">Monthly</p>
          <p className="font-bold text-sky-400">{formatCurrency(totalMonthly)}</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-sky-500/5">
          <p className="text-xs text-muted-foreground mb-0.5">One-Time</p>
          <p className="font-semibold text-sky-300">{formatCurrency(oneTimeTotal)}</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-sky-500/10">
          <p className="text-xs text-muted-foreground mb-0.5">Annual</p>
          <p className="font-bold text-sky-400">{formatCurrency(totalMonthly * 12 + oneTimeTotal)}</p>
        </div>
      </div>

      {/* Income List */}
      {otherIncome.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {otherIncome.map((income) => (
            <div
              key={income.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{income.name}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded font-medium',
                      income.recurrence === 'one-time'
                        ? 'bg-sky-500/20 text-sky-300'
                        : 'bg-sky-500/10 text-sky-400'
                    )}
                  >
                    {income.recurrence}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {income.recurrence === 'one-time'
                    ? format(parseISO(`${income.start_month}-01`), 'MMM yyyy')
                    : `From ${format(parseISO(`${income.start_month}-01`), 'MMM yyyy')}${
                        income.end_month
                          ? ` to ${format(parseISO(`${income.end_month}-01`), 'MMM yyyy')}`
                          : ' onwards'
                      }`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-sky-400">
                  {formatCurrency(income.amount)}
                  {income.recurrence === 'weekly' && (
                    <span className="text-xs text-muted-foreground">/wk</span>
                  )}
                  {income.recurrence === 'monthly' && (
                    <span className="text-xs text-muted-foreground">/mo</span>
                  )}
                </span>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleEdit(income)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(income.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No other income added yet</p>
        <p className="text-xs">Add revenue share, rental income, or side income</p>
        </div>
      )}
      </div>
    </div>
  );
}
