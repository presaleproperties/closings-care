import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, ChevronLeft, ChevronRight, 
  Home, Briefcase, Building2, PiggyBank, Receipt,
  TrendingDown, Pencil, Wallet, ArrowUpRight, ArrowDownRight,
  DollarSign, Calendar, MoreHorizontal, X, Check
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { AnimatedNumber } from '@/components/ui/animated-number';

// Use shared expense categories
import { expenseCategories, getCategoryType, getAllCategoriesFlat, ExpenseType } from '@/lib/expenseCategories';

const allCategoriesFlat = getAllCategoriesFlat();

type RecurrenceType = 'monthly' | 'weekly' | 'yearly' | 'one-time';

const typeConfig: Record<ExpenseType, { icon: typeof Home; label: string; gradient: string; bg: string; border: string; text: string }> = {
  personal: { icon: Home, label: 'Personal', gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500' },
  business: { icon: Briefcase, label: 'Business', gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-500' },
  rental: { icon: Building2, label: 'Rental', gradient: 'from-teal-500 to-emerald-600', bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-500' },
  taxes: { icon: PiggyBank, label: 'Taxes', gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-500' },
  other: { icon: Receipt, label: 'Other', gradient: 'from-slate-400 to-slate-500', bg: 'bg-muted/50', border: 'border-border', text: 'text-muted-foreground' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
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
  const [activeFilter, setActiveFilter] = useState<ExpenseType | 'all'>('all');
  const [formData, setFormData] = useState<Partial<ExpenseFormData> & { recurrence?: RecurrenceType; rental_property_id?: string; is_fixed?: boolean; is_tax_deductible?: boolean }>({
    category: '',
    amount: 0,
    month: currentMonth,
    recurrence: 'monthly',
    rental_property_id: undefined,
    is_fixed: true,
    is_tax_deductible: true,
  });

  const getDefaultTaxDeductible = (type: ExpenseType): boolean => type === 'business' || type === 'rental';

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

  // Filter expenses for current month
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

  // Calculate totals
  const getDisplayAmount = (expense: typeof expenses[0]) => {
    const recurrence = (expense as any).recurrence || 'monthly';
    if (recurrence === 'weekly') return Number(expense.amount) * 4.33;
    return Number(expense.amount);
  };

  const totalMonthExpenses = useMemo(() => 
    monthExpenses.reduce((sum, e) => sum + getDisplayAmount(e), 0)
  , [monthExpenses]);

  // Property costs
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
    return { personalCost: totalPersonalCost, rentalNet: totalRentalNet };
  }, [properties]);

  const grandTotalExpenses = totalMonthExpenses + propertyCarryingCosts.personalCost - propertyCarryingCosts.rentalNet;

  // Group expenses by type
  const groupedExpenses = useMemo(() => {
    const groups: Record<ExpenseType, typeof expenses> = { personal: [], business: [], rental: [], taxes: [], other: [] };
    monthExpenses.forEach(e => {
      const type = getCategoryType(e.category);
      groups[type].push(e);
    });
    return groups;
  }, [monthExpenses]);

  const getTypeTotal = (type: ExpenseType) => {
    let total = groupedExpenses[type].reduce((sum, e) => sum + getDisplayAmount(e), 0);
    if (type === 'personal') total += propertyCarryingCosts.personalCost;
    if (type === 'rental') total -= propertyCarryingCosts.rentalNet;
    return total;
  };

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    if (activeFilter === 'all') return monthExpenses;
    return groupedExpenses[activeFilter];
  }, [activeFilter, monthExpenses, groupedExpenses]);

  const handleOpenAdd = (type?: ExpenseType) => {
    const expenseType = type || 'personal';
    setEditingId(null);
    setSelectedType(expenseType);
    setFormData({ 
      category: '', 
      amount: 0, 
      month: currentMonth, 
      recurrence: 'monthly', 
      rental_property_id: undefined,
      is_fixed: true,
      is_tax_deductible: getDefaultTaxDeductible(expenseType),
    });
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
      is_fixed: (expense as any).is_fixed !== false,
      is_tax_deductible: (expense as any).is_tax_deductible !== false,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.category || !formData.amount) return;
    const dataToSave = {
      ...formData,
      recurrence: formData.recurrence || 'monthly',
      rental_property_id: selectedType === 'rental' ? formData.rental_property_id : null,
      is_fixed: formData.is_fixed !== false,
      is_tax_deductible: formData.is_tax_deductible !== false,
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

  const currentCategories = expenseCategories[selectedType] || {};

  return (
    <AppLayout>
      <Header 
        title="Expenses" 
        subtitle="Track your monthly spending"
        action={
          <Button onClick={() => handleOpenAdd()} className="btn-premium">
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        }
      />

      <motion.div 
        className="p-4 lg:p-6 space-y-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Month Navigator & Total */}
        <motion.div variants={itemVariants} className="landing-card p-5">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-9 w-9 rounded-xl">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <h2 className="text-lg font-bold">
                {format(parseISO(`${currentMonth}-01`), 'MMMM yyyy')}
              </h2>
            </div>
            <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-9 w-9 rounded-xl">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Total Display */}
          <div className="text-center py-4 px-6 rounded-2xl bg-gradient-to-br from-rose-500/10 to-orange-500/5 border border-rose-500/20">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Total Monthly Spending</p>
            <AnimatedNumber
              value={grandTotalExpenses}
              className="text-4xl font-bold text-rose-500"
              duration={1}
            />
            {(propertyCarryingCosts.personalCost > 0 || propertyCarryingCosts.rentalNet !== 0) && (
              <p className="text-xs text-muted-foreground mt-2">
                Includes property costs
              </p>
            )}
          </div>
        </motion.div>

        {/* Category Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(['personal', 'business', 'rental', 'taxes'] as ExpenseType[]).map(type => {
            const config = typeConfig[type];
            const total = getTypeTotal(type);
            const count = groupedExpenses[type].length;
            const isActive = activeFilter === type;
            
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(isActive ? 'all' : type)}
                className={cn(
                  "relative p-4 rounded-2xl border-2 transition-all text-left overflow-hidden group",
                  isActive 
                    ? `${config.border} ${config.bg} shadow-lg` 
                    : "border-border/50 hover:border-border bg-card"
                )}
              >
                {/* Gradient overlay on hover/active */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity",
                  config.gradient,
                  isActive ? "opacity-10" : "group-hover:opacity-5"
                )} />
                
                <div className="relative">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors",
                    isActive ? config.bg : "bg-muted/50"
                  )}>
                    <config.icon className={cn("w-4.5 h-4.5", isActive ? config.text : "text-muted-foreground")} />
                  </div>
                  <p className="font-bold text-lg">{formatCurrency(total)}</p>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                </div>

                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className={cn("absolute top-2 right-2 w-2 h-2 rounded-full", `bg-gradient-to-r ${config.gradient}`)}
                  />
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Filter Pills */}
        <motion.div variants={itemVariants} className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              activeFilter === 'all'
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            All Expenses
          </button>
          {(['personal', 'business', 'rental', 'taxes'] as ExpenseType[]).map(type => {
            const config = typeConfig[type];
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                  activeFilter === type
                    ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg`
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {config.label}
              </button>
            );
          })}
        </motion.div>

        {/* Property Costs Section */}
        <AnimatePresence>
          {(activeFilter === 'all' || activeFilter === 'personal') && properties.filter(p => p.property_type === 'personal').length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              variants={itemVariants}
            >
              <div className="landing-card overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/5 border-b border-blue-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-sm">Personal Property</span>
                  </div>
                  <span className="font-bold text-blue-500">{formatCurrency(propertyCarryingCosts.personalCost)}</span>
                </div>
                <div className="divide-y divide-border/50">
                  {properties.filter(p => p.property_type === 'personal').map(property => {
                    const expenses = getPropertyMonthlyExpenses(property);
                    return (
                      <div key={property.id} className="px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                        <div>
                          <p className="font-medium text-sm">{property.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {[
                              property.monthly_mortgage && `Mortgage`,
                              property.monthly_strata && `Strata`,
                              property.yearly_taxes && `Taxes`
                            ].filter(Boolean).join(' • ')}
                          </p>
                        </div>
                        <span className="font-semibold">{formatCurrency(expenses)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {(activeFilter === 'all' || activeFilter === 'rental') && properties.filter(p => p.property_type === 'rental').length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              variants={itemVariants}
            >
              <div className="landing-card overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-teal-500/10 to-emerald-500/5 border-b border-teal-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-teal-500" />
                    <span className="font-semibold text-sm">Rental Properties</span>
                  </div>
                  <span className={cn(
                    "font-bold",
                    propertyCarryingCosts.rentalNet >= 0 ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {propertyCarryingCosts.rentalNet >= 0 ? '+' : ''}{formatCurrency(propertyCarryingCosts.rentalNet)}
                  </span>
                </div>
                <div className="divide-y divide-border/50">
                  {properties.filter(p => p.property_type === 'rental').map(property => {
                    const cashflow = calculatePropertyCashflow(property, 0);
                    return (
                      <div key={property.id} className="px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                        <div>
                          <p className="font-medium text-sm">{property.name}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1 text-emerald-500">
                              <ArrowUpRight className="w-3 h-3" />
                              {formatCurrency(property.monthly_rent || 0)}
                            </span>
                            <span className="text-muted-foreground">−</span>
                            <span className="flex items-center gap-1 text-rose-500">
                              <ArrowDownRight className="w-3 h-3" />
                              {formatCurrency(cashflow.expenses)}
                            </span>
                          </div>
                        </div>
                        <span className={cn(
                          "font-semibold",
                          cashflow.net >= 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                          {cashflow.net >= 0 ? '+' : ''}{formatCurrency(cashflow.net)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expense List */}
        <motion.div variants={itemVariants} className="space-y-2">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : filteredExpenses.length === 0 && activeFilter !== 'all' ? (
            <div className="landing-card p-8 text-center">
              {(() => {
                const config = typeConfig[activeFilter as ExpenseType];
                return (
                  <>
                    <div className={cn("w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4", config.bg)}>
                      <config.icon className={cn("w-8 h-8", config.text)} />
                    </div>
                    <p className="text-muted-foreground mb-4">No {config.label.toLowerCase()} expenses yet</p>
                    <Button onClick={() => handleOpenAdd(activeFilter as ExpenseType)} className="btn-premium">
                      <Plus className="w-4 h-4 mr-2" />
                      Add {config.label} Expense
                    </Button>
                  </>
                );
              })()}
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="landing-card p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">No expenses tracked for this month</p>
              <Button onClick={() => handleOpenAdd()} className="btn-premium">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Expense
              </Button>
            </div>
          ) : activeFilter === 'all' ? (
            // Grouped view for "All" filter - separate Personal, Business, etc.
            <div className="space-y-4">
              {/* Personal Expenses Section */}
              {groupedExpenses.personal.length > 0 && (
                <div className="landing-card overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/5 border-b border-blue-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-sm">Personal Expenses</span>
                    </div>
                    <span className="font-bold text-blue-500">
                      {formatCurrency(groupedExpenses.personal.reduce((sum, e) => sum + getDisplayAmount(e), 0))}
                    </span>
                  </div>
                  <div className="divide-y divide-border/50">
                    {groupedExpenses.personal.map((expense) => {
                      const config = typeConfig.personal;
                      const recurrence = (expense as any).recurrence || 'monthly';
                      const displayAmount = getDisplayAmount(expense);
                      return (
                        <div key={expense.id} className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors group">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", config.bg)}>
                            <config.icon className={cn("w-5 h-5", config.text)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{expense.category}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {recurrence !== 'monthly' && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {recurrence}
                                </span>
                              )}
                              {(expense as any).is_tax_deductible && (
                                <span className="text-emerald-500">Tax Ded.</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold">{formatCurrency(displayAmount)}</p>
                            {recurrence === 'weekly' && (
                              <p className="text-[10px] text-muted-foreground">${expense.amount}/wk</p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenEdit(expense)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(expense.id)} className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Business Expenses Section */}
              {groupedExpenses.business.length > 0 && (
                <div className="landing-card overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-violet-500/10 to-purple-500/5 border-b border-violet-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-violet-500" />
                      <span className="font-semibold text-sm">Business Expenses</span>
                    </div>
                    <span className="font-bold text-violet-500">
                      {formatCurrency(groupedExpenses.business.reduce((sum, e) => sum + getDisplayAmount(e), 0))}
                    </span>
                  </div>
                  <div className="divide-y divide-border/50">
                    {groupedExpenses.business.map((expense) => {
                      const config = typeConfig.business;
                      const recurrence = (expense as any).recurrence || 'monthly';
                      const displayAmount = getDisplayAmount(expense);
                      return (
                        <div key={expense.id} className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors group">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", config.bg)}>
                            <config.icon className={cn("w-5 h-5", config.text)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{expense.category}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {recurrence !== 'monthly' && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {recurrence}
                                </span>
                              )}
                              {(expense as any).is_tax_deductible && (
                                <span className="text-emerald-500">Tax Ded.</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold">{formatCurrency(displayAmount)}</p>
                            {recurrence === 'weekly' && (
                              <p className="text-[10px] text-muted-foreground">${expense.amount}/wk</p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenEdit(expense)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(expense.id)} className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Taxes Expenses Section */}
              {groupedExpenses.taxes.length > 0 && (
                <div className="landing-card overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-amber-500/10 to-orange-500/5 border-b border-amber-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PiggyBank className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-sm">Taxes & Savings</span>
                    </div>
                    <span className="font-bold text-amber-500">
                      {formatCurrency(groupedExpenses.taxes.reduce((sum, e) => sum + getDisplayAmount(e), 0))}
                    </span>
                  </div>
                  <div className="divide-y divide-border/50">
                    {groupedExpenses.taxes.map((expense) => {
                      const config = typeConfig.taxes;
                      const recurrence = (expense as any).recurrence || 'monthly';
                      const displayAmount = getDisplayAmount(expense);
                      return (
                        <div key={expense.id} className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors group">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", config.bg)}>
                            <config.icon className={cn("w-5 h-5", config.text)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{expense.category}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {recurrence !== 'monthly' && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {recurrence}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold">{formatCurrency(displayAmount)}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenEdit(expense)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(expense.id)} className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Other Expenses Section */}
              {groupedExpenses.other.length > 0 && (
                <div className="landing-card overflow-hidden">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold text-sm">Other</span>
                    </div>
                    <span className="font-bold text-muted-foreground">
                      {formatCurrency(groupedExpenses.other.reduce((sum, e) => sum + getDisplayAmount(e), 0))}
                    </span>
                  </div>
                  <div className="divide-y divide-border/50">
                    {groupedExpenses.other.map((expense) => {
                      const config = typeConfig.other;
                      const recurrence = (expense as any).recurrence || 'monthly';
                      const displayAmount = getDisplayAmount(expense);
                      return (
                        <div key={expense.id} className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors group">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", config.bg)}>
                            <config.icon className={cn("w-5 h-5", config.text)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{expense.category}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold">{formatCurrency(displayAmount)}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenEdit(expense)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(expense.id)} className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Single category view
            <div className="landing-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">
                  {typeConfig[activeFilter].label}
                </span>
                <span className="text-sm text-muted-foreground">
                  {filteredExpenses.length} item{filteredExpenses.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="divide-y divide-border/50">
                {filteredExpenses.map((expense) => {
                  const type = getCategoryType(expense.category);
                  const config = typeConfig[type];
                  const recurrence = (expense as any).recurrence || 'monthly';
                  const displayAmount = getDisplayAmount(expense);
                  
                  return (
                    <div 
                      key={expense.id}
                      className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors group"
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", config.bg)}>
                        <config.icon className={cn("w-5 h-5", config.text)} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{expense.category}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {recurrence !== 'monthly' && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {recurrence}
                            </span>
                          )}
                          {(expense as any).is_tax_deductible && (
                            <span className="text-emerald-500">Tax Ded.</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold">{formatCurrency(displayAmount)}</p>
                        {recurrence === 'weekly' && (
                          <p className="text-[10px] text-muted-foreground">${expense.amount}/wk</p>
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEdit(expense)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(expense.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Add FAB */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenAdd()}
          className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-xl shadow-primary/25 flex items-center justify-center z-50"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingId ? 'Edit Expense' : 'New Expense'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Type Selection */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Category Type</Label>
              <div className="grid grid-cols-5 gap-2">
                {(['personal', 'business', 'rental', 'taxes', 'other'] as ExpenseType[]).map(type => {
                  const config = typeConfig[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => { 
                        setSelectedType(type); 
                        setFormData(p => ({ 
                          ...p, 
                          category: '',
                          is_tax_deductible: getDefaultTaxDeductible(type),
                        })); 
                      }}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5",
                        selectedType === type 
                          ? `${config.border} ${config.bg}` 
                          : "border-border hover:border-muted-foreground"
                      )}
                    >
                      <config.icon className={cn("w-5 h-5", selectedType === type ? config.text : "text-muted-foreground")} />
                      <span className={cn("text-[10px] font-medium", selectedType === type ? config.text : "text-muted-foreground")}>
                        {config.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {Object.entries(currentCategories).map(([group, items]) => (
                    <div key={group}>
                      <div className="px-2 py-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wide">{group}</div>
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
                  <SelectTrigger className="h-11 rounded-xl">
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
                <Label>Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-9 h-11 rounded-xl"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={formData.recurrence} onValueChange={(v) => setFormData(p => ({ ...p, recurrence: v as RecurrenceType }))}>
                  <SelectTrigger className="h-11 rounded-xl">
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
              <p className="text-sm text-muted-foreground px-1">
                ≈ {formatCurrency(formData.amount * 4.33)}/month
              </p>
            )}

            {/* Start Month */}
            <div className="space-y-2">
              <Label>{formData.recurrence === 'one-time' ? 'Month' : 'Starts From'}</Label>
              <Input
                type="month"
                className="h-11 rounded-xl"
                value={formData.month}
                onChange={(e) => setFormData(p => ({ ...p, month: e.target.value }))}
              />
            </div>

            {/* Classification Toggles */}
            <div className="grid grid-cols-2 gap-3">
              <div className={cn(
                "flex items-center justify-between p-3 rounded-xl border-2 transition-colors",
                formData.is_fixed ? "border-primary/30 bg-primary/5" : "border-border"
              )}>
                <Label className="text-sm cursor-pointer">Fixed Cost</Label>
                <Switch
                  checked={formData.is_fixed}
                  onCheckedChange={(v) => setFormData(p => ({ ...p, is_fixed: v }))}
                />
              </div>
              <div className={cn(
                "flex items-center justify-between p-3 rounded-xl border-2 transition-colors",
                formData.is_tax_deductible ? "border-emerald-500/30 bg-emerald-500/5" : "border-border"
              )}>
                <Label className="text-sm cursor-pointer">Tax Ded.</Label>
                <Switch
                  checked={formData.is_tax_deductible}
                  onCheckedChange={(v) => setFormData(p => ({ ...p, is_tax_deductible: v }))}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input
                className="h-11 rounded-xl"
                value={formData.notes || ''}
                onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                placeholder="Add a note..."
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1 h-11 rounded-xl">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!formData.category || !formData.amount}
              className="flex-1 h-11 rounded-xl btn-premium"
            >
              <Check className="w-4 h-4 mr-2" />
              {editingId ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
