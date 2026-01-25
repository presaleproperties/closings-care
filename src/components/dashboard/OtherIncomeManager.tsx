import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Wallet, DollarSign, Calendar, Repeat, ArrowUpRight } from 'lucide-react';
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
import { springConfigs, triggerHaptic } from '@/lib/haptics';
import {
  useOtherIncome,
  useCreateOtherIncome,
  useUpdateOtherIncome,
  useDeleteOtherIncome,
  OtherIncome,
  OtherIncomeFormData,
} from '@/hooks/useOtherIncome';

const RECURRENCE_OPTIONS = [
  { value: 'monthly', label: 'Monthly', icon: Repeat },
  { value: 'weekly', label: 'Weekly', icon: Calendar },
  { value: 'one-time', label: 'One-time', icon: DollarSign },
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
    triggerHaptic('success');

    if (editingIncome) {
      await updateIncome.mutateAsync({ id: editingIncome.id, data: formData });
    } else {
      await createIncome.mutateAsync(formData);
    }

    setIsOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    triggerHaptic('warning');
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
  const annualTotal = totalMonthly * 12 + oneTimeTotal;

  return (
    <motion.div 
      className="landing-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfigs.gentle}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-border/50 bg-gradient-to-r from-sky-50/50 to-cyan-50/30 dark:from-sky-500/5 dark:to-cyan-500/10">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/20"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={springConfigs.bouncy}
          >
            <Wallet className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h3 className="font-bold text-base text-slate-800 dark:text-foreground">
              Other Income
            </h3>
            <p className="text-[12px] text-slate-500 dark:text-muted-foreground">Revenue share, side income, etc.</p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button size="sm" className="gap-1.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 shadow-lg shadow-sky-500/20">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </motion.div>
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
                        'flex flex-col items-center gap-1 px-3 py-3 rounded-xl border text-sm font-medium transition-all',
                        formData.recurrence === opt.value
                          ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                          : 'border-border hover:border-sky-300'
                      )}
                    >
                      <opt.icon className="h-4 w-4" />
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
                  className="flex-1 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600"
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
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <motion.div 
            className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-sky-500/10 to-cyan-500/5 border border-sky-200/50 dark:border-sky-500/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfigs.gentle, delay: 0.1 }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-sky-400/10 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-1.5 mb-2">
              <Repeat className="h-3.5 w-3.5 text-sky-500" />
              <p className="text-[11px] font-medium text-slate-500 dark:text-muted-foreground uppercase tracking-wide">Monthly</p>
            </div>
            <p className="text-xl font-bold text-sky-600 dark:text-sky-400">{formatCurrency(totalMonthly)}</p>
          </motion.div>
          
          <motion.div 
            className="relative overflow-hidden p-4 rounded-2xl bg-slate-50 dark:bg-muted/30 border border-slate-200/50 dark:border-border/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfigs.gentle, delay: 0.15 }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <DollarSign className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-[11px] font-medium text-slate-500 dark:text-muted-foreground uppercase tracking-wide">One-Time</p>
            </div>
            <p className="text-xl font-bold text-slate-600 dark:text-slate-300">{formatCurrency(oneTimeTotal)}</p>
          </motion.div>
          
          <motion.div 
            className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-200/50 dark:border-emerald-500/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfigs.gentle, delay: 0.2 }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-1.5 mb-2">
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
              <p className="text-[11px] font-medium text-slate-500 dark:text-muted-foreground uppercase tracking-wide">Annual</p>
            </div>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(annualTotal)}</p>
          </motion.div>
        </div>

        {/* Income List */}
        {otherIncome.length > 0 ? (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {otherIncome.map((income, index) => (
                <motion.div
                  key={income.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ ...springConfigs.gentle, delay: index * 0.05 }}
                  className="group"
                >
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-card/50 border border-slate-100 dark:border-border/30 hover:border-sky-200 dark:hover:border-sky-500/30 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                        income.recurrence === 'one-time' 
                          ? "bg-slate-100 dark:bg-muted" 
                          : "bg-sky-100 dark:bg-sky-500/20"
                      )}>
                        {income.recurrence === 'monthly' && <Repeat className="h-4 w-4 text-sky-600 dark:text-sky-400" />}
                        {income.recurrence === 'weekly' && <Calendar className="h-4 w-4 text-sky-600 dark:text-sky-400" />}
                        {income.recurrence === 'one-time' && <DollarSign className="h-4 w-4 text-slate-500" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-800 dark:text-foreground truncate">{income.name}</span>
                          <span className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0',
                            income.recurrence === 'one-time'
                              ? 'bg-slate-100 dark:bg-muted text-slate-500 dark:text-muted-foreground'
                              : 'bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400'
                          )}>
                            {income.recurrence}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-muted-foreground">
                          {income.recurrence === 'one-time'
                            ? format(parseISO(`${income.start_month}-01`), 'MMM yyyy')
                            : `From ${format(parseISO(`${income.start_month}-01`), 'MMM yyyy')}${
                                income.end_month
                                  ? ` to ${format(parseISO(`${income.end_month}-01`), 'MMM yyyy')}`
                                  : ' onwards'
                              }`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-bold text-lg text-sky-600 dark:text-sky-400">
                          {formatCurrency(income.amount)}
                        </span>
                        {income.recurrence !== 'one-time' && (
                          <span className="text-[11px] text-slate-400 dark:text-muted-foreground">
                            /{income.recurrence === 'weekly' ? 'wk' : 'mo'}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-500/20"
                          onClick={() => handleEdit(income)}
                        >
                          <Pencil className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-destructive/10"
                          onClick={() => handleDelete(income.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            className="text-center py-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfigs.gentle}
          >
            <motion.div 
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-50 dark:from-sky-500/20 dark:to-cyan-500/10 flex items-center justify-center"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Wallet className="h-7 w-7 text-sky-400" />
            </motion.div>
            <p className="text-sm font-medium text-slate-600 dark:text-muted-foreground mb-1">No other income added yet</p>
            <p className="text-xs text-slate-400 dark:text-muted-foreground">Add revenue share, rental income, or side income</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
