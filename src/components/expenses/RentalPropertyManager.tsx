import { useState } from 'react';
import { Plus, Building2, Pencil, Trash2, MapPin, DollarSign, Calendar } from 'lucide-react';
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
  useRentalProperties,
  useCreateRentalProperty,
  useUpdateRentalProperty,
  useDeleteRentalProperty,
  RentalProperty,
  RentalPropertyFormData,
} from '@/hooks/useRentalProperties';
import { formatCurrency } from '@/lib/format';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Expense } from '@/lib/types';

interface RentalPropertyManagerProps {
  expenses: Expense[];
  currentMonth: string;
}

export function RentalPropertyManager({ expenses, currentMonth }: RentalPropertyManagerProps) {
  const { data: properties = [], isLoading } = useRentalProperties();
  const createProperty = useCreateRentalProperty();
  const updateProperty = useUpdateRentalProperty();
  const deleteProperty = useDeleteRentalProperty();

  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RentalPropertyFormData>({
    name: '',
    address: '',
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

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      address: '',
      purchase_price: undefined,
      purchase_date: '',
      notes: '',
    });
    setShowDialog(true);
  };

  const handleOpenEdit = (property: RentalProperty) => {
    setEditingId(property.id);
    setFormData({
      name: property.name,
      address: property.address || '',
      purchase_price: property.purchase_price || undefined,
      purchase_date: property.purchase_date || '',
      notes: property.notes || '',
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name) return;

    if (editingId) {
      await updateProperty.mutateAsync({ id: editingId, data: formData });
    } else {
      await createProperty.mutateAsync(formData);
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-400" />
          <h3 className="font-semibold text-lg">Rental Properties</h3>
        </div>
        <Button size="sm" variant="outline" onClick={handleOpenAdd} className="text-teal-400 border-teal-500/30 hover:bg-teal-500/10">
          <Plus className="w-4 h-4 mr-1" />
          Add Property
        </Button>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="text-center py-8 bg-card border border-dashed border-teal-500/30 rounded-xl">
          <Building2 className="w-10 h-10 text-teal-400/50 mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">No rental properties yet</p>
          <Button size="sm" onClick={handleOpenAdd} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-1" />
            Add Your First Property
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => {
            const propertyExpenses = getPropertyExpenses(property.id);
            const totalExpenses = getPropertyTotal(property.id);
            
            return (
              <div
                key={property.id}
                className="bg-card border border-teal-500/20 rounded-xl p-4 hover:border-teal-500/40 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-teal-500/10">
                      <Building2 className="w-4 h-4 text-teal-400" />
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleOpenEdit(property)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(property.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Monthly Expenses */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Expenses</span>
                    <span className={cn(
                      "font-semibold",
                      totalExpenses > 0 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {totalExpenses > 0 ? formatCurrency(totalExpenses) : '—'}
                    </span>
                  </div>

                  {/* Expense Count */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expense Items</span>
                    <span className="text-teal-400">{propertyExpenses.length}</span>
                  </div>

                  {/* Purchase Info */}
                  {property.purchase_price && (
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Purchase
                      </span>
                      <span className="font-medium">{formatCurrency(property.purchase_price)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Property' : 'Add Rental Property'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Property Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Downtown Condo"
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
              disabled={!formData.name}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {editingId ? 'Save Changes' : 'Add Property'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
