import { useState } from 'react';
import { 
  Plus, X, Camera, Home, Brush, DollarSign, Car, Megaphone, 
  GraduationCap, Users, Laptop, Building2, Receipt, Repeat, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { formatCurrency, getCurrentMonth } from '@/lib/format';
import { useCreateExpense } from '@/hooks/useExpenses';
import { cn } from '@/lib/utils';

// Quick-add categories for real estate agents
const quickCategories = [
  { id: 'photography', name: 'Photography', icon: Camera, type: 'business' as const, defaultAmount: 350, defaultRecurrence: 'one-time' as const },
  { id: 'staging', name: 'Staging', icon: Brush, type: 'business' as const, defaultAmount: 2500, defaultRecurrence: 'one-time' as const },
  { id: 'desk-fees', name: 'Desk Fees', icon: Building2, type: 'business' as const, defaultAmount: 500, defaultRecurrence: 'monthly' as const },
  { id: 'mls-fees', name: 'MLS/Board Fees', icon: Receipt, type: 'business' as const, defaultAmount: 150, defaultRecurrence: 'monthly' as const },
  { id: 'gas', name: 'Gas / Vehicle', icon: Car, type: 'business' as const, defaultAmount: 400, defaultRecurrence: 'monthly' as const },
  { id: 'ads', name: 'Facebook Ads', icon: Megaphone, type: 'business' as const, defaultAmount: 500, defaultRecurrence: 'monthly' as const },
  { id: 'coaching', name: 'Coaching', icon: GraduationCap, type: 'business' as const, defaultAmount: 500, defaultRecurrence: 'monthly' as const },
  { id: 'assistant', name: 'Assistant/VA', icon: Users, type: 'business' as const, defaultAmount: 1500, defaultRecurrence: 'monthly' as const },
  { id: 'software', name: 'Software/CRM', icon: Laptop, type: 'business' as const, defaultAmount: 200, defaultRecurrence: 'monthly' as const },
  { id: 'client-gifts', name: 'Client Gifts', icon: DollarSign, type: 'business' as const, defaultAmount: 100, defaultRecurrence: 'one-time' as const },
  { id: 'mortgage', name: 'Mortgage', icon: Home, type: 'personal' as const, defaultAmount: 2500, defaultRecurrence: 'monthly' as const },
];

type RecurrenceType = 'monthly' | 'weekly' | 'yearly' | 'one-time';

interface QuickAddExpenseProps {
  currentMonth: string;
  onExpenseAdded?: () => void;
}

export function QuickAddExpense({ currentMonth, onExpenseAdded }: QuickAddExpenseProps) {
  const createExpense = useCreateExpense();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<typeof quickCategories[0] | null>(null);
  const [amount, setAmount] = useState(0);
  const [isRecurring, setIsRecurring] = useState(true);
  const [recurrence, setRecurrence] = useState<RecurrenceType>('monthly');
  const [notes, setNotes] = useState('');
  const [month, setMonth] = useState(currentMonth);

  const handleQuickSelect = (category: typeof quickCategories[0]) => {
    setSelectedCategory(category);
    setAmount(category.defaultAmount);
    setIsRecurring(category.defaultRecurrence !== 'one-time');
    setRecurrence(category.defaultRecurrence);
    setMonth(currentMonth);
    setNotes('');
    setShowDialog(true);
  };

  const handleRecurringToggle = (checked: boolean) => {
    setIsRecurring(checked);
    setRecurrence(checked ? 'monthly' : 'one-time');
  };

  const handleSave = async () => {
    if (!selectedCategory || !amount) return;

    // Business expenses are tax deductible by default
    const isTaxDeductible = selectedCategory.type === 'business';

    await createExpense.mutateAsync({
      category: selectedCategory.name,
      amount,
      month,
      recurrence,
      notes: notes || undefined,
      is_tax_deductible: isTaxDeductible,
      is_fixed: isRecurring,
    } as any);

    setShowDialog(false);
    setSelectedCategory(null);
    onExpenseAdded?.();
  };

  const monthlyEquivalent = recurrence === 'weekly' ? amount * 4.33 : 
                           recurrence === 'yearly' ? amount / 12 : amount;

  return (
    <>
      {/* Quick Add Grid */}
      <div className="bg-card border border-border/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Quick Add</h3>
            <p className="text-sm text-muted-foreground">Common agent expenses</p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {quickCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => handleQuickSelect(category)}
                className={cn(
                  "p-3 rounded-xl border border-border/50 transition-all hover:border-accent hover:bg-accent/5 text-center group",
                  "flex flex-col items-center gap-2"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  category.type === 'personal' ? "bg-blue-500/10 group-hover:bg-blue-500/20" : "bg-purple-500/10 group-hover:bg-purple-500/20"
                )}>
                  <Icon className={cn(
                    "w-4 h-4",
                    category.type === 'personal' ? "text-blue-400" : "text-purple-400"
                  )} />
                </div>
                <span className="text-xs font-medium truncate w-full">{category.name}</span>
                <span className="text-xs text-muted-foreground">{formatCurrency(category.defaultAmount)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Add Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedCategory && (
                <>
                  <div className={cn(
                    "p-2 rounded-lg",
                    selectedCategory.type === 'personal' ? "bg-blue-500/10" : "bg-purple-500/10"
                  )}>
                    <selectedCategory.icon className={cn(
                      "w-5 h-5",
                      selectedCategory.type === 'personal' ? "text-blue-400" : "text-purple-400"
                    )} />
                  </div>
                  {selectedCategory.name}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Amount */}
            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
                <Input
                  type="number"
                  step="0.01"
                  className="pl-8 text-2xl font-bold h-14"
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  autoFocus
                />
              </div>
            </div>

            {/* Recurring Toggle - One Click */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isRecurring ? "bg-success/10" : "bg-muted"
                )}>
                  {isRecurring ? (
                    <Repeat className="w-4 h-4 text-success" />
                  ) : (
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{isRecurring ? 'Recurring' : 'One-time'}</p>
                  <p className="text-xs text-muted-foreground">
                    {isRecurring ? 'Repeats every month' : 'Single expense'}
                  </p>
                </div>
              </div>
              <Switch
                checked={isRecurring}
                onCheckedChange={handleRecurringToggle}
              />
            </div>

            {/* Recurrence Frequency (if recurring) */}
            {isRecurring && (
              <div className="space-y-2">
                <Label>Frequency</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['weekly', 'monthly', 'yearly'] as RecurrenceType[]).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setRecurrence(freq)}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all text-center",
                        recurrence === freq
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-muted-foreground"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium capitalize",
                        recurrence === freq && "text-accent"
                      )}>
                        {freq}
                      </span>
                    </button>
                  ))}
                </div>
                {recurrence !== 'monthly' && amount > 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    ≈ {formatCurrency(monthlyEquivalent)}/month
                  </p>
                )}
              </div>
            )}

            {/* Start Date */}
            <div className="space-y-2">
              <Label>{isRecurring ? 'Starts From' : 'Date'}</Label>
              <Input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>

            {/* Optional Notes */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Notes (optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!amount || createExpense.isPending}
              className="btn-premium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}