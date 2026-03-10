import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useClientInventory, useUpsertClientInventory, useDeleteClientInventory, ClientInventoryItem } from '@/hooks/useClientInventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Plus, Search, Building2, Home, Layers, Edit2, Trash2, MapPin, Calendar, DollarSign, User, Filter, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

const PROPERTY_TYPES = ['Condo', 'Townhome', 'Detached Home', 'Presale'] as const;

const propertyTypeIcon = {
  Condo: Building2,
  Townhome: Layers,
  'Detached Home': Home,
  Presale: Building2,
};

const propertyTypeColor: Record<string, string> = {
  Condo: 'bg-info/10 text-info border-info/20',
  Townhome: 'bg-warning/10 text-warning border-warning/20',
  'Detached Home': 'bg-success/10 text-success border-success/20',
  Presale: 'bg-primary/10 text-primary border-primary/20',
};

const formSchema = z.object({
  buyer_name: z.string().min(1, 'Buyer name is required').max(200),
  project_name: z.string().max(200).optional(),
  property_address: z.string().max(500).optional(),
  purchase_date: z.string().optional(),
  close_date: z.string().optional(),
  close_date_est: z.string().optional(),
  purchase_price: z.coerce.number().positive().optional().or(z.literal('')),
  property_type: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function formatCurrency(val: number | null | undefined): string {
  if (!val) return '—';
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(val);
}

function formatDate(val: string | null | undefined): string {
  if (!val) return '—';
  try { return format(new Date(val), 'MMM d, yyyy'); } catch { return val; }
}

// ─── Add/Edit Dialog ───────────────────────────────────────────────────────────
function InventoryDialog({
  open,
  onClose,
  item,
  syncedTransactionId,
  journeyId,
}: {
  open: boolean;
  onClose: () => void;
  item?: ClientInventoryItem | null;
  syncedTransactionId?: string | null;
  journeyId?: string | null;
}) {
  const upsert = useUpsertClientInventory();
  const isEditing = !!item?.id && !item.id.startsWith('journey-') && !item.id.startsWith('synced-');

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      buyer_name: item?.buyerName || '',
      project_name: item?.projectName || '',
      property_address: item?.propertyAddress || '',
      purchase_date: item?.purchaseDate || '',
      close_date: item?.closeDate || '',
      close_date_est: item?.closeDateEst || '',
      purchase_price: item?.purchasePrice || '',
      property_type: item?.propertyType || '',
      notes: item?.notes || '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    await upsert.mutateAsync({
      data: {
        buyer_name: values.buyer_name,
        project_name: values.project_name || undefined,
        property_address: values.property_address || undefined,
        purchase_date: values.purchase_date || undefined,
        close_date: values.close_date || undefined,
        close_date_est: values.close_date_est || undefined,
        purchase_price: values.purchase_price ? Number(values.purchase_price) : undefined,
        property_type: values.property_type || undefined,
        notes: values.notes || undefined,
        synced_transaction_id: syncedTransactionId || item?.syncedTransactionId || undefined,
        journey_id: journeyId || item?.journeyId || undefined,
        is_manual: !syncedTransactionId && !item?.syncedTransactionId,
      },
      existingId: isEditing ? item!.id : undefined,
    });
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {isEditing ? 'Edit Property' : syncedTransactionId ? 'Set Property Type' : 'Add Property'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label>Buyer Name *</Label>
              <Input {...register('buyer_name')} placeholder="e.g. John Smith" />
              {errors.buyer_name && <p className="text-xs text-destructive">{errors.buyer_name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Property Type</Label>
              <Controller
                control={control}
                name="property_type"
                render={({ field }) => (
                  <Select value={field.value || ''} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type…" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map(pt => (
                        <SelectItem key={pt} value={pt}>{pt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Project Name</Label>
              <Input {...register('project_name')} placeholder="e.g. The Pacific" />
            </div>

            <div className="space-y-1.5">
              <Label>Property Address</Label>
              <Input {...register('property_address')} placeholder="123 Main St, Vancouver" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Purchase / Firm Date</Label>
                <Input type="date" {...register('purchase_date')} />
              </div>
              <div className="space-y-1.5">
                <Label>Close Date</Label>
                <Input type="date" {...register('close_date')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Est. Close Date</Label>
                <Input type="date" {...register('close_date_est')} />
              </div>
              <div className="space-y-1.5">
                <Label>Purchase Price</Label>
                <Input type="number" {...register('purchase_price')} placeholder="0" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea {...register('notes')} placeholder="Any notes…" rows={2} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" disabled={upsert.isPending}>
              {upsert.isPending ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Property'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Property Card ─────────────────────────────────────────────────────────────
function InventoryCard({ item, onEdit, onDelete }: {
  item: ClientInventoryItem;
  onEdit: () => void;
  onDelete?: () => void;
}) {
  const Icon = item.propertyType ? (propertyTypeIcon[item.propertyType as keyof typeof propertyTypeIcon] || Building2) : Building2;
  const typeColor = item.propertyType ? (propertyTypeColor[item.propertyType] || 'bg-muted text-muted-foreground border-border') : 'bg-muted text-muted-foreground border-border';
  const isClosed = item.dealStatus === 'closed';

  return (
    <div className="group relative bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all duration-200 hover:border-border/80">
      {/* Status indicator */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border", typeColor)}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{item.buyerName}</p>
            {item.projectName && (
              <p className="text-xs text-muted-foreground truncate">{item.projectName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {item.propertyType ? (
            <Badge variant="outline" className={cn("text-[10px] font-medium px-2 py-0.5 border", typeColor)}>
              {item.propertyType}
            </Badge>
          ) : (
            <button
              onClick={onEdit}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-dashed border-muted-foreground/30 text-muted-foreground/60 hover:text-primary hover:border-primary/40 transition-colors"
            >
              + type
            </button>
          )}
          {isClosed ? (
            <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 bg-success/8 text-success border-success/20">Closed</Badge>
          ) : item.dealStatus === 'active' ? (
            <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 bg-info/8 text-info border-info/20">Active</Badge>
          ) : item.isManual ? (
            <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 bg-muted text-muted-foreground border-border">Manual</Badge>
          ) : null}
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        {item.propertyAddress && (
          <div className="col-span-2 flex items-start gap-1.5 text-muted-foreground">
            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span className="truncate">{item.propertyAddress}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <DollarSign className="w-3 h-3 flex-shrink-0" />
          <span className="font-medium text-foreground/80">{formatCurrency(item.purchasePrice)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="w-3 h-3 flex-shrink-0" />
          <span>{item.closeDate ? formatDate(item.closeDate) : item.closeDateEst ? `Est. ${formatDate(item.closeDateEst)}` : item.purchaseDate ? formatDate(item.purchaseDate) : '—'}</span>
        </div>
      </div>

      {/* Actions (appear on hover) */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg bg-background/80 border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        {item.isManual && onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg bg-background/80 border border-border text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ClientInventoryPage() {
  const { allItems, isLoading } = useClientInventory();
  const deleteItem = useDeleteClientInventory();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<'none' | 'project' | 'type' | 'status'>('none');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClientInventoryItem | null>(null);

  const filtered = useMemo(() => {
    return allItems.filter(item => {
      const q = search.toLowerCase();
      const matchSearch = !q || [
        item.buyerName,
        item.projectName,
        item.propertyAddress,
      ].some(v => v?.toLowerCase().includes(q));

      const matchType = filterType === 'all' || item.propertyType === filterType;
      const matchStatus = filterStatus === 'all' ||
        (filterStatus === 'active' && item.dealStatus === 'active') ||
        (filterStatus === 'closed' && item.dealStatus === 'closed') ||
        (filterStatus === 'manual' && item.isManual);

      return matchSearch && matchType && matchStatus;
    });
  }, [allItems, search, filterType, filterStatus]);

  // Grouping logic
  const grouped = useMemo(() => {
    if (groupBy === 'none') return [{ label: null, items: filtered }];

    const map = new Map<string, ClientInventoryItem[]>();
    filtered.forEach(item => {
      let key = '';
      if (groupBy === 'project') key = item.projectName || 'No Project';
      if (groupBy === 'type') key = item.propertyType || 'No Type';
      if (groupBy === 'status') key = item.dealStatus === 'closed' ? 'Closed' : item.dealStatus === 'active' ? 'Active' : 'Manual';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, items]) => ({ label, items }));
  }, [filtered, groupBy]);

  const totalCount = allItems.length;
  const closedCount = allItems.filter(i => i.dealStatus === 'closed').length;
  const totalValue = allItems.reduce((sum, i) => sum + (i.purchasePrice || 0), 0);

  const openEdit = (item: ClientInventoryItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const openAdd = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Client Inventory</h1>
            <p className="text-sm text-muted-foreground mt-0.5">All properties you've helped clients buy</p>
          </div>
          <Button size="sm" onClick={openAdd} className="gap-1.5 flex-shrink-0">
            <Plus className="w-3.5 h-3.5" />
            Add Property
          </Button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Properties', value: totalCount },
            { label: 'Closed', value: closedCount },
            { label: 'Total Portfolio Value', value: formatCurrency(totalValue) },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl px-4 py-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{stat.label}</p>
              <p className="text-lg font-bold text-foreground mt-0.5">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search buyer, address, project…"
              className="pl-9 h-9 text-sm"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36 h-9 text-sm">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {PROPERTY_TYPES.map(pt => <SelectItem key={pt} value={pt}>{pt}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32 h-9 text-sm">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>

          <Select value={groupBy} onValueChange={v => setGroupBy(v as typeof groupBy)}>
            <SelectTrigger className="w-36 h-9 text-sm">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Grouping</SelectItem>
              <SelectItem value="project">By Project</SelectItem>
              <SelectItem value="type">By Type</SelectItem>
              <SelectItem value="status">By Status</SelectItem>
            </SelectContent>
          </Select>

          <span className="text-xs text-muted-foreground ml-1">
            {filtered.length} of {totalCount}
          </span>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl h-36 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Home className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No properties found</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              {search || filterType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Properties from your ReZen deals will appear here automatically'}
            </p>
            {!search && filterType === 'all' && filterStatus === 'all' && (
              <Button size="sm" onClick={openAdd} variant="outline" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add manually
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ label, items }) => (
              <div key={label ?? 'all'}>
                {label && (
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</h2>
                    <span className="text-xs text-muted-foreground/50">({items.length})</span>
                    <div className="flex-1 border-t border-border/40" />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {items.map(item => (
                    <InventoryCard
                      key={item.id}
                      item={item}
                      onEdit={() => openEdit(item)}
                      onDelete={item.isManual ? () => {
                        if (!item.id.startsWith('journey-') && !item.id.startsWith('synced-'))
                          deleteItem.mutate(item.id);
                      } : undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <InventoryDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingItem(null); }}
        item={editingItem}
      />
    </AppLayout>
  );
}
