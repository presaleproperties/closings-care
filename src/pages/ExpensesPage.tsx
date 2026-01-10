import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  Plus, Trash2, ChevronLeft, ChevronRight, Repeat, Calendar, Clock, 
  User, Briefcase, Receipt, PiggyBank, CalendarClock, Building2, Home,
  TrendingDown, Pencil
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useProperties, getPropertyMonthlyExpenses, calculatePropertyCashflow } from '@/hooks/useProperties';
import { formatCurrency, getCurrentMonth } from '@/lib/format';
import { ExpenseFormData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CategoryBudgetProgress } from '@/components/expenses/CategoryBudgetProgress';
import { PropertyManager } from '@/components/expenses/PropertyManager';
import { QuickAddExpense } from '@/components/expenses/QuickAddExpense';

// Categorized expenses for real estate agents
const expenseCategories = {
  personal: {
    'Housing': ['Personal Mortgage', 'Strata Fees', 'Property Taxes', 'Hydro/Utilities', 'Internet'],
    'Transportation': ['Car Lease/Payment', 'Car Insurance (Personal)', 'Car Charging/Gas'],
    'Living': ['Phone (Personal)', 'Groceries', 'Entertainment/Dining', 'Gym/Fitness', 'Apps & Subscriptions'],
  },
  business: {
    'Office': ['Office Lease', 'Board Fees', 'Brokerage Fees'],
    'Technology': ['CRM (CHIME, etc.)', 'Website Hosting', 'Google Workspace', 'iCloud/Storage', 'Canva/Design Tools', 'Email Marketing (MailerLite)', 'Editing Apps', 'Other Software'],
    'Marketing': ['Facebook/Social Ads', 'Signs & Signage', 'Marketing Agency', 'Marketing Manager', 'Print Marketing'],
    'Transportation': ['Car (Business Use)', 'Car Insurance (Business)', 'Car Charging (Business)'],
    'Professional': ['BCFSA License', 'Real Estate License', 'Professional Development', 'Continuing Education'],
    'Client': ['Client Gifts', 'Staging/Clean-ups', 'Photography'],
    'Admin': ['Phone (Business)', 'Admin Support', 'Bookkeeping'],
  },
  rental: {
    'Rental Property': ['Rental Mortgage', 'Rental Strata Fees', 'Rental Property Tax', 'Property Management', 'Rental Insurance', 'Rental Repairs/Maintenance', 'Rental Utilities', 'Rental Depreciation', 'Other Rental Expense'],
  },
  taxes: {
    'Taxes & Savings': ['Tax Set-Aside', 'GST/HST Remittance', 'Debt Pay Down'],
  },
  other: {
    'Other': ['Miscellaneous'],
  },
};

const getAllCategories = () => {
  const result: { category: string; type: 'personal' | 'business' | 'rental' | 'taxes' | 'other'; group: string }[] = [];
  Object.entries(expenseCategories.personal).forEach(([group, items]) => items.forEach(item => result.push({ category: item, type: 'personal', group })));
  Object.entries(expenseCategories.business).forEach(([group, items]) => items.forEach(item => result.push({ category: item, type: 'business', group })));
  Object.entries(expenseCategories.rental).forEach(([group, items]) => items.forEach(item => result.push({ category: item, type: 'rental', group })));
  Object.entries(expenseCategories.taxes).forEach(([group, items]) => items.forEach(item => result.push({ category: item, type: 'taxes', group })));
  Object.entries(expenseCategories.other).forEach(([group, items]) => items.forEach(item => result.push({ category: item, type: 'other', group })));
  return result;
};

const allCategoriesFlat = getAllCategories();

const getCategoryType = (category: string): 'personal' | 'business' | 'rental' | 'taxes' | 'other' => {
  const found = allCategoriesFlat.find(c => c.category === category);
  return found?.type || 'other';
};

type RecurrenceType = 'monthly' | 'weekly' | 'yearly' | 'one-time';
type ExpenseType = 'personal' | 'business' | 'rental' | 'taxes' | 'other';

const typeConfig: Record<ExpenseType, { icon: typeof User; label: string; color: string; bg: string; border: string }> = {
  personal: { icon: Home, label: 'Personal', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  business: { icon: Briefcase, label: 'Business', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  rental: { icon: Building2, label: 'Rental', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30' },
  taxes: { icon: PiggyBank, label: 'Taxes', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  other: { icon: Receipt, label: 'Other', color: 'text-muted-foreground', bg: 'bg-muted/50', border: 'border-border' },
};

export default function ExpensesPage() {
  const { data: expenses = [], isLoading } = useExpenses();
  const { data: properties = [] } = useProperties();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ExpenseType>('personal');
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'business' | 'rental' | 'taxes' | 'properties'>('overview');
  const [formData, setFormData] = useState<Partial<ExpenseFormData> & { recurrence?: RecurrenceType; rental_property_id?: string }>({
    category: '',
    amount: 0,
    month: currentMonth,
    recurrence: 'monthly',
    rental_property_id: undefined,
  });

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

  const monthExpenses = useMemo(() => {
    const currentMonthNum = parseInt(currentMonth.split('-')[1]);
    return expenses.filter((e) => {
      const recurrence = (e as any).recurrence || 'monthly';
      const startMonth = e.month;
      if (recurrence === 'one-time') return e.month === currentMonth;
      if (recurrence === 'yearly') {
        const expenseMonthNum = parseInt(startMonth.split('-')[1]);
        return currentMonthNum === expenseMonthNum && currentMonth >= startMonth;
      }
      return currentMonth >= startMonth;
    });
  }, [expenses, currentMonth]);

  const totalMonthExpenses = useMemo(() => {
    return monthExpenses.reduce((sum, e) => {
      const recurrence = (e as any).recurrence || 'monthly';
      if (recurrence === 'weekly') return sum + Number(e.amount) * 4.33;
      return sum + Number(e.amount);
    }, 0);
  }, [monthExpenses]);

  const propertyCarryingCosts = useMemo(() => {
    let totalPersonalCost = 0;
    let totalRentalNet = 0;
    properties.forEach(property => {
      const builtInExpenses = getPropertyMonthlyExpenses(property);
      if (property.property_type === 'personal') {
        totalPersonalCost += builtInExpenses;
      } else {
        const cashflow = calculatePropertyCashflow(property, 0);
        totalRentalNet += cashflow.net;
      }
    });
    return { personalCost: totalPersonalCost, rentalNet: totalRentalNet, totalNet: totalRentalNet - totalPersonalCost };
  }, [properties]);

  const grandTotalExpenses = useMemo(() => {
    return totalMonthExpenses + propertyCarryingCosts.personalCost - propertyCarryingCosts.rentalNet;
  }, [totalMonthExpenses, propertyCarryingCosts]);

  const groupedExpenses = useMemo(() => {
    const groups: Record<ExpenseType, typeof expenses> = { personal: [], business: [], rental: [], taxes: [], other: [] };
    monthExpenses.forEach(e => {
      const type = getCategoryType(e.category);
      groups[type].push(e);
    });
    return groups;
  }, [monthExpenses]);

  const handleOpenAdd = (type?: ExpenseType, propertyId?: string) => {
    setEditingId(null);
    setSelectedType(type || 'personal');
    setFormData({ category: '', amount: 0, month: currentMonth, recurrence: 'monthly', rental_property_id: propertyId });
    setShowDialog(true);
  };

  const handleOpenEdit = (expense: typeof expenses[0]) => {
    const type = getCategoryType(expense.category);
    setEditingId(expense.id);
    setSelectedType(type);
    setFormData({
      category: expense.category,
      amount: expense.amount,
      month: expense.month,
      notes: expense.notes || '',
      recurrence: (expense as any).recurrence || 'monthly',
      rental_property_id: (expense as any).rental_property_id || undefined,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.category || !formData.amount) return;
    const dataToSave = {
      ...formData,
      recurrence: formData.recurrence || 'monthly',
      rental_property_id: selectedType === 'rental' ? formData.rental_property_id : null,
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

  const getDisplayAmount = (expense: typeof expenses[0]) => {
    const recurrence = (expense as any).recurrence || 'monthly';
    if (recurrence === 'weekly') return Number(expense.amount) * 4.33;
    return Number(expense.amount);
  };

  const getTypeTotal = (type: ExpenseType) => groupedExpenses[type].reduce((sum, e) => sum + getDisplayAmount(e), 0);

  const currentCategories = expenseCategories[selectedType] || {};

  const renderExpenseList = (type: ExpenseType) => {
    const typeExpenses = groupedExpenses[type];
    const config = typeConfig[type];
    
    if (typeExpenses.length === 0) {
      return (
        <div className="text-center py-12">
          <config.icon className={`w-12 h-12 mx-auto mb-3 ${config.color} opacity-50`} />
          <p className="text-muted-foreground mb-4">No {config.label.toLowerCase()} expenses yet</p>
          <Button onClick={() => handleOpenAdd(type)} className="btn-premium">
            <Plus className="w-4 h-4 mr-2" />
            Add {config.label} Expense
          </Button>
        </div>
      );
    }

    // Group by category
    const byCategory: Record<string, typeof typeExpenses> = {};
    typeExpenses.forEach(e => {
      if (!byCategory[e.category]) byCategory[e.category] = [];
      byCategory[e.category].push(e);
    });

    return (
      <div className="space-y-3">
        {Object.entries(byCategory).map(([category, items]) => {
          const categoryTotal = items.reduce((sum, e) => sum + getDisplayAmount(e), 0);
          return (
            <div key={category} className="bg-card border border-border/50 rounded-xl overflow-hidden">
              <div className={`px-4 py-3 ${config.bg} flex items-center justify-between`}>
                <span className={`font-medium ${config.color}`}>{category}</span>
                <span className="font-semibold">{formatCurrency(categoryTotal)}</span>
              </div>
              <div className="divide-y divide-border/30">
                {items.map(expense => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    onEdit={() => handleOpenEdit(expense)}
                    onDelete={() => handleDelete(expense.id)}
                    getDisplayAmount={getDisplayAmount}
                    propertyName={type === 'rental' ? properties.find(p => p.id === (expense as any).rental_property_id)?.name : undefined}
                  />
                ))}
              </div>
            </div>
          );
        })}
        <button
          onClick={() => handleOpenAdd(type)}
          className={`w-full border-2 border-dashed ${config.border} rounded-xl p-4 flex items-center justify-center gap-2 ${config.color} hover:bg-muted/30 transition-colors`}
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">Add {config.label} Expense</span>
        </button>
      </div>
    );
  };

  return (
    <AppLayout>
      <Header 
        title="Expenses" 
        subtitle={format(parseISO(`${currentMonth}-01`), 'MMMM yyyy')}
        action={
          <Button onClick={() => handleOpenAdd()} className="btn-premium">
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        }
      />

      <div className="p-4 lg:p-6 space-y-5 animate-fade-in">
        {/* Month Navigation + Summary */}
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-9 w-9">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold">
              {format(parseISO(`${currentMonth}-01`), 'MMMM yyyy')}
            </h2>
            <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-9 w-9">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Total Display */}
          <div className="text-center mb-5">
            <p className="text-sm text-muted-foreground mb-1">Total Monthly Expenses</p>
            <p className="text-4xl font-bold text-destructive">{formatCurrency(grandTotalExpenses)}</p>
            {properties.length > 0 && propertyCarryingCosts.totalNet !== 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Includes {formatCurrency(Math.abs(propertyCarryingCosts.totalNet))} property {propertyCarryingCosts.totalNet < 0 ? 'costs' : 'income'}
              </p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-2">
            {(['personal', 'business', 'rental', 'taxes'] as ExpenseType[]).map(type => {
              const config = typeConfig[type];
              const total = getTypeTotal(type);
              const count = groupedExpenses[type].length;
              return (
                <button
                  key={type}
                  onClick={() => setActiveTab(type as 'personal' | 'business' | 'rental' | 'taxes')}
                  className={cn(
                    "p-3 rounded-xl border transition-all text-left",
                    activeTab === type ? `${config.border} ${config.bg}` : "border-border/30 hover:border-border"
                  )}
                >
                  <config.icon className={`w-4 h-4 ${config.color} mb-1`} />
                  <p className="font-semibold text-sm truncate">{formatCurrency(total)}</p>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <TabsList className="w-full grid grid-cols-6 h-11 bg-muted/50">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="personal" className="text-xs sm:text-sm">Personal</TabsTrigger>
            <TabsTrigger value="business" className="text-xs sm:text-sm">Business</TabsTrigger>
            <TabsTrigger value="rental" className="text-xs sm:text-sm">Rental</TabsTrigger>
            <TabsTrigger value="taxes" className="text-xs sm:text-sm">Taxes</TabsTrigger>
            <TabsTrigger value="properties" className="text-xs sm:text-sm">Properties</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-5">
            {/* Quick Add Section */}
            <QuickAddExpense currentMonth={currentMonth} />

            {/* Budget Goals */}
            <CategoryBudgetProgress expenses={expenses} currentMonth={currentMonth} />

            {/* All Expenses Summary */}
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : monthExpenses.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border/50 rounded-2xl">
                <TrendingDown className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">No expenses tracked for this month</p>
                <Button onClick={() => handleOpenAdd()} className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Expense
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {(['personal', 'business', 'rental', 'taxes', 'other'] as ExpenseType[]).map(type => {
                  const typeExpenses = groupedExpenses[type];
                  if (typeExpenses.length === 0) return null;
                  const config = typeConfig[type];
                  const total = getTypeTotal(type);
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        if (type === 'other') return;
                        setActiveTab(type as 'personal' | 'business' | 'rental' | 'taxes');
                      }}
                      className={`w-full bg-card border ${config.border} rounded-xl p-4 flex items-center justify-between hover:bg-muted/30 transition-colors`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.bg}`}>
                          <config.icon className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{config.label}</p>
                          <p className="text-sm text-muted-foreground">{typeExpenses.length} expense{typeExpenses.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold">{formatCurrency(total)}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Personal Tab */}
          <TabsContent value="personal">
            {renderExpenseList('personal')}
          </TabsContent>

          {/* Business Tab */}
          <TabsContent value="business">
            {renderExpenseList('business')}
          </TabsContent>

          {/* Rental Tab */}
          <TabsContent value="rental">
            {renderExpenseList('rental')}
          </TabsContent>

          {/* Taxes Tab */}
          <TabsContent value="taxes">
            {renderExpenseList('taxes')}
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties">
            <PropertyManager expenses={expenses} currentMonth={currentMonth} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Type Selection */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Type</Label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['personal', 'business', 'rental', 'taxes', 'other'] as ExpenseType[]).map(type => {
                  const config = typeConfig[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => { setSelectedType(type); setFormData(p => ({ ...p, category: '' })); }}
                      className={cn(
                        "p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1",
                        selectedType === type ? `${config.border} ${config.bg}` : "border-border hover:border-muted-foreground"
                      )}
                    >
                      <config.icon className={cn("w-4 h-4", selectedType === type ? config.color : "text-muted-foreground")} />
                      <span className={cn("text-xs font-medium", selectedType === type ? config.color : "text-muted-foreground")}>{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {Object.entries(currentCategories).map(([group, items]) => (
                    <div key={group}>
                      <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">{group}</div>
                      {(items as string[]).map((item: string) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rental Property Selection */}
            {selectedType === 'rental' && properties.filter(p => p.property_type === 'rental').length > 0 && (
              <div className="space-y-2">
                <Label>Link to Property</Label>
                <Select value={formData.rental_property_id || ''} onValueChange={(v) => setFormData(p => ({ ...p, rental_property_id: v || undefined }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.filter(p => p.property_type === 'rental').map(property => (
                      <SelectItem key={property.id} value={property.id}>{property.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Amount & Recurrence */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-7"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Recurrence</Label>
                <Select value={formData.recurrence} onValueChange={(v) => setFormData(p => ({ ...p, recurrence: v as RecurrenceType }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="one-time">One-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.recurrence === 'weekly' && formData.amount && (
              <p className="text-sm text-muted-foreground">
                ≈ {formatCurrency(formData.amount * 4.33)}/month
              </p>
            )}

            {/* Start Month */}
            <div className="space-y-2">
              <Label>{formData.recurrence === 'one-time' ? 'Month' : 'Starts From'}</Label>
              <Input
                type="month"
                value={formData.month}
                onChange={(e) => setFormData(p => ({ ...p, month: e.target.value }))}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={formData.notes || ''}
                onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                placeholder="Optional notes..."
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.category || !formData.amount} className="btn-premium">
              {editingId ? 'Update' : 'Add'} Expense
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
  getDisplayAmount,
  propertyName
}: { 
  expense: any; 
  onEdit: () => void; 
  onDelete: () => void;
  getDisplayAmount: (e: any) => number;
  propertyName?: string;
}) {
  const recurrence = expense.recurrence || 'monthly';
  const displayAmount = getDisplayAmount(expense);

  const getRecurrenceIcon = () => {
    switch (recurrence) {
      case 'weekly': return <Clock className="w-3 h-3" />;
      case 'yearly': return <CalendarClock className="w-3 h-3" />;
      case 'one-time': return <Calendar className="w-3 h-3" />;
      default: return <Repeat className="w-3 h-3" />;
    }
  };

  const getRecurrenceLabel = () => {
    switch (recurrence) {
      case 'weekly': return 'Weekly';
      case 'yearly': return 'Yearly';
      case 'one-time': return 'One-time';
      default: return 'Monthly';
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {propertyName && (
            <Badge variant="outline" className="text-xs shrink-0">
              <Building2 className="w-3 h-3 mr-1" />
              {propertyName}
            </Badge>
          )}
          {expense.notes && (
            <span className="text-xs text-muted-foreground truncate">{expense.notes}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs gap-1">
            {getRecurrenceIcon()}
            {getRecurrenceLabel()}
          </Badge>
          {recurrence === 'weekly' && (
            <span className="text-xs text-muted-foreground">
              ${expense.amount} × 4.33
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold">{formatCurrency(displayAmount)}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
