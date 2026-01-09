import { useState, useMemo } from 'react';
import { Plus, Building2, Pencil, Trash2, MapPin, DollarSign, Home, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
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
  useProperties,
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
  Property,
  PropertyFormData,
  PropertyType,
  calculatePropertyCashflow,
} from '@/hooks/useProperties';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Expense } from '@/lib/types';

interface PropertyManagerProps {
  expenses: Expense[];
  currentMonth: string;
}

export function PropertyManager({ expenses, currentMonth }: PropertyManagerProps) {
  const { data: properties = [], isLoading } = useProperties();
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();

  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    address: '',
    property_type: 'personal',
    monthly_rent: undefined,
    purchase_price: undefined,
    purchase_date: '',
    notes: '',
  });

  // Calculate expenses per property
  const getPropertyExpenses = (propertyId: string) => {
    const currentMonthNum = parseInt(currentMonth.split('-')[1]);
    
    return expenses.filter(e => {
      if ((e as any).rental_property_id !== propertyId) return false;
      
      const recurrence = (e as any).recurrence || 'monthly';
      const startMonth = e.month;
      
      if (recurrence === 'one-time') {
        return e.month === currentMonth;
      }
      
      if (recurrence === 'yearly') {
        const expenseMonthNum = parseInt(startMonth.split('-')[1]);
        return currentMonthNum === expenseMonthNum && currentMonth >= startMonth;
      }
      
      return currentMonth >= startMonth;
    });
  };

  const getPropertyTotal = (propertyId: string) => {
    return getPropertyExpenses(propertyId).reduce((sum, e) => {
      const recurrence = (e as any).recurrence || 'monthly';
      if (recurrence === 'weekly') {
        return sum + Number(e.amount) * 4.33;
      }
      return sum + Number(e.amount);
    }, 0);
  };

  // Calculate summary totals
  const summaryData = useMemo(() => {
    let totalCarryingCost = 0; // Personal property expenses + rental losses
    let totalRentalIncome = 0; // Rental property profits
    let personalExpenses = 0;
    let rentalNet = 0;

    properties.forEach(property => {
      const monthlyExpenses = getPropertyTotal(property.id);
      const cashflow = calculatePropertyCashflow(property, monthlyExpenses);

      if (property.property_type === 'personal') {
        personalExpenses += cashflow.expenses;
        totalCarryingCost += cashflow.expenses;
      } else {
        rentalNet += cashflow.net;
        if (cashflow.isCashFlowing) {
          totalRentalIncome += cashflow.net;
        } else {
          totalCarryingCost += Math.abs(cashflow.net);
        }
      }
    });

    return { totalCarryingCost, totalRentalIncome, personalExpenses, rentalNet };
  }, [properties, expenses, currentMonth]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      address: '',
      property_type: 'personal',
      monthly_rent: undefined,
      purchase_price: undefined,
      purchase_date: '',
      notes: '',
    });
    setShowDialog(true);
  };

  const handleOpenEdit = (property: Property) => {
    setEditingId(property.id);
    setFormData({
      name: property.name,
      address: property.address || '',
      property_type: property.property_type,
      monthly_rent: property.monthly_rent || undefined,
      purchase_price: property.purchase_price || undefined,
      purchase_date: property.purchase_date || '',
      notes: property.notes || '',
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name) return;

    const dataToSave = {
      ...formData,
      monthly_rent: formData.property_type === 'rental' ? formData.monthly_rent : 0,
    };

    if (editingId) {
      await updateProperty.mutateAsync({ id: editingId, data: dataToSave });
    } else {
      await createProperty.mutateAsync(dataToSave);
    }
    setShowDialog(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this property? Associated expenses will be unlinked.')) {
      await deleteProperty.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4 text-muted-foreground">Loading properties...</div>;
  }

  const personalProperties = properties.filter(p => p.property_type === 'personal');
  const rentalProperties = properties.filter(p => p.property_type === 'rental');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {properties.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-card border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Personal Carrying Cost</span>
            </div>
            <p className="text-xl font-bold text-destructive">
              {summaryData.personalExpenses > 0 ? `-${formatCurrency(summaryData.personalExpenses)}` : '$0'}
            </p>
          </div>
          <div className={cn(
            "bg-card border rounded-xl p-4",
            summaryData.rentalNet >= 0 ? "border-success/30" : "border-destructive/30"
          )}>
            <div className={cn(
              "flex items-center gap-2 mb-2",
              summaryData.rentalNet >= 0 ? "text-success" : "text-destructive"
            )}>
              {summaryData.rentalNet >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-medium">Rental Net</span>
            </div>
            <p className={cn(
              "text-xl font-bold",
              summaryData.rentalNet >= 0 ? "text-success" : "text-destructive"
            )}>
              {summaryData.rentalNet >= 0 ? '+' : ''}{formatCurrency(summaryData.rentalNet)}
            </p>
          </div>
          <div className="bg-card border border-destructive/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm font-medium">Total Carrying Cost</span>
            </div>
            <p className="text-xl font-bold text-destructive">
              {summaryData.totalCarryingCost > 0 ? `-${formatCurrency(summaryData.totalCarryingCost)}` : '$0'}
            </p>
          </div>
          <div className="bg-card border border-success/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-success mb-2">
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium">Rental Income</span>
            </div>
            <p className="text-xl font-bold text-success">
              {summaryData.totalRentalIncome > 0 ? `+${formatCurrency(summaryData.totalRentalIncome)}` : '$0'}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-400" />
          <h3 className="font-semibold text-lg">Properties</h3>
          <span className="text-sm text-muted-foreground">({properties.length})</span>
        </div>
        <Button size="sm" variant="outline" onClick={handleOpenAdd} className="text-teal-400 border-teal-500/30 hover:bg-teal-500/10">
          <Plus className="w-4 h-4 mr-1" />
          Add Property
        </Button>
      </div>

      {/* No Properties State */}
      {properties.length === 0 ? (
        <div className="text-center py-8 bg-card border border-dashed border-teal-500/30 rounded-xl">
          <Building2 className="w-10 h-10 text-teal-400/50 mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">Track your personal & rental properties</p>
          <Button size="sm" onClick={handleOpenAdd} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-1" />
            Add Your First Property
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Personal Properties */}
          {personalProperties.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-blue-400" />
                <h4 className="font-medium text-blue-400">Personal Properties</h4>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {personalProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    monthlyExpenses={getPropertyTotal(property.id)}
                    expenseCount={getPropertyExpenses(property.id).length}
                    onEdit={() => handleOpenEdit(property)}
                    onDelete={() => handleDelete(property.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Rental Properties */}
          {rentalProperties.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-400" />
                <h4 className="font-medium text-teal-400">Rental Properties</h4>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rentalProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    monthlyExpenses={getPropertyTotal(property.id)}
                    expenseCount={getPropertyExpenses(property.id).length}
                    onEdit={() => handleOpenEdit(property)}
                    onDelete={() => handleDelete(property.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Property' : 'Add Property'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Property Type Toggle */}
            <div className="space-y-2">
              <Label>Property Type *</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, property_type: 'personal' }))}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                    formData.property_type === 'personal'
                      ? "border-blue-500 bg-blue-500/10 text-blue-400"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <Home className="w-6 h-6" />
                  <span className="font-medium">Personal</span>
                  <span className="text-xs text-muted-foreground text-center">Your primary residence or personal use</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, property_type: 'rental' }))}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                    formData.property_type === 'rental'
                      ? "border-teal-500 bg-teal-500/10 text-teal-400"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <Building2 className="w-6 h-6" />
                  <span className="font-medium">Rental</span>
                  <span className="text-xs text-muted-foreground text-center">Investment property generating income</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Property Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder={formData.property_type === 'personal' ? "e.g., My Home" : "e.g., Downtown Condo"}
              />
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                placeholder="123 Main St, Vancouver"
              />
            </div>

            {/* Monthly Rent - Only for Rental */}
            {formData.property_type === 'rental' && (
              <div className="space-y-2 p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
                <Label className="text-teal-400">Monthly Rent Income *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    className="pl-7"
                    value={formData.monthly_rent || ''}
                    onChange={(e) => setFormData(p => ({ ...p, monthly_rent: parseFloat(e.target.value) || undefined }))}
                    placeholder="2,500"
                  />
                </div>
                <p className="text-xs text-muted-foreground">This will be compared against expenses to calculate cashflow</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Purchase Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    className="pl-7"
                    value={formData.purchase_price || ''}
                    onChange={(e) => setFormData(p => ({ ...p, purchase_price: parseFloat(e.target.value) || undefined }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Purchase Date</Label>
                <Input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData(p => ({ ...p, purchase_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                placeholder="Any additional notes..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!formData.name || (formData.property_type === 'rental' && !formData.monthly_rent)}
              className={formData.property_type === 'rental' ? "bg-teal-600 hover:bg-teal-700" : "bg-blue-600 hover:bg-blue-700"}
            >
              {editingId ? 'Save Changes' : 'Add Property'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Property Card Component
function PropertyCard({
  property,
  monthlyExpenses,
  expenseCount,
  onEdit,
  onDelete,
}: {
  property: Property;
  monthlyExpenses: number;
  expenseCount: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const cashflow = calculatePropertyCashflow(property, monthlyExpenses);
  const isPersonal = property.property_type === 'personal';
  const isRental = property.property_type === 'rental';

  return (
    <div
      className={cn(
        "bg-card border rounded-xl p-4 hover:border-opacity-60 transition-colors group",
        isPersonal ? "border-blue-500/20 hover:border-blue-500/40" : "border-teal-500/20 hover:border-teal-500/40"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-lg",
            isPersonal ? "bg-blue-500/10" : "bg-teal-500/10"
          )}>
            {isPersonal ? <Home className="w-4 h-4 text-blue-400" /> : <Building2 className="w-4 h-4 text-teal-400" />}
          </div>
          <div>
            <h4 className="font-semibold">{property.name}</h4>
            {property.address && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {property.address}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
            <Pencil className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {/* For Rental: Show Income, Expenses, Net */}
        {isRental && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Rental Income</span>
              <span className="font-medium text-success">+{formatCurrency(cashflow.income)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Expenses ({expenseCount})</span>
              <span className="font-medium text-destructive">-{formatCurrency(cashflow.expenses)}</span>
            </div>
            <div className="border-t border-border/50 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-sm font-medium flex items-center gap-1",
                  cashflow.isCashFlowing ? "text-success" : "text-destructive"
                )}>
                  {cashflow.isCashFlowing ? (
                    <>
                      <TrendingUp className="w-3.5 h-3.5" />
                      Cash Flowing
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3.5 h-3.5" />
                      Cash Burning
                    </>
                  )}
                </span>
                <span className={cn(
                  "font-bold",
                  cashflow.isCashFlowing ? "text-success" : "text-destructive"
                )}>
                  {cashflow.net >= 0 ? '+' : ''}{formatCurrency(cashflow.net)}
                </span>
              </div>
            </div>
          </>
        )}

        {/* For Personal: Show Expenses Only */}
        {isPersonal && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Monthly Expenses</span>
              <span className={cn(
                "font-semibold",
                cashflow.expenses > 0 ? "text-destructive" : "text-muted-foreground"
              )}>
                {cashflow.expenses > 0 ? `-${formatCurrency(cashflow.expenses)}` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Expense Items</span>
              <span className="text-blue-400">{expenseCount}</span>
            </div>
          </>
        )}

        {/* Purchase Info */}
        {property.purchase_price && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50 text-muted-foreground">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Purchase
            </span>
            <span>{formatCurrency(property.purchase_price)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
