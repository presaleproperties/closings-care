import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePipelineProspects, useAddProspect, useUpdateProspect, useDeleteProspect, PipelineProspect } from '@/hooks/usePipelineProspects';
import { formatCurrency } from '@/lib/format';
import { Plus, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const HOME_TYPES = ['Detached', 'Semi-Detached', 'Townhouse', 'Condo', 'Pre-Sale', 'Commercial', 'Land', 'Other'];
const STATUS_OPTIONS = ['active', 'won', 'lost', 'on-hold'];

interface EditingCell {
  id: string;
  field: keyof PipelineProspect;
}

function InlineCell({ 
  value, 
  isEditing, 
  onStartEdit, 
  onSave, 
  type = 'text',
  options,
  className,
}: {
  value: string | number | null;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (val: string) => void;
  type?: 'text' | 'number' | 'select';
  options?: string[];
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);
  const [draft, setDraft] = useState(String(value ?? ''));

  useEffect(() => {
    if (isEditing) {
      setDraft(String(value ?? ''));
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isEditing, value]);

  const commit = () => onSave(draft);

  if (isEditing) {
    if (type === 'select' && options) {
      return (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={draft}
          onChange={(e) => { setDraft(e.target.value); onSave(e.target.value); }}
          onBlur={commit}
          className="w-full h-full bg-background border-0 outline-none ring-2 ring-primary/40 rounded px-2 py-1 text-sm"
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') onSave(String(value ?? '')); }}
        className="w-full h-full bg-background border-0 outline-none ring-2 ring-primary/40 rounded px-2 py-1 text-sm"
      />
    );
  }

  return (
    <div
      onClick={onStartEdit}
      className={cn("px-3 py-2.5 text-sm cursor-text truncate min-h-[40px] flex items-center hover:bg-muted/40 transition-colors", className)}
    >
      {value ?? <span className="text-muted-foreground/40 italic">—</span>}
    </div>
  );
}

function StatusBadge({ status, isEditing, onStartEdit, onSave }: {
  status: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (val: string) => void;
}) {
  const colors: Record<string, string> = {
    active: 'bg-primary/15 text-primary border-primary/30',
    won: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
    lost: 'bg-destructive/15 text-destructive border-destructive/30',
    'on-hold': 'bg-warning/15 text-warning border-warning/30',
  };

  if (isEditing) {
    return (
      <InlineCell
        value={status}
        isEditing
        onStartEdit={onStartEdit}
        onSave={onSave}
        type="select"
        options={STATUS_OPTIONS}
      />
    );
  }

  return (
    <div onClick={onStartEdit} className="px-3 py-2 cursor-pointer hover:bg-muted/40 transition-colors">
      <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium border capitalize", colors[status] || 'bg-muted text-muted-foreground border-border')}>
        {status}
      </span>
    </div>
  );
}

export default function PipelinePage() {
  const { data: prospects = [], isLoading } = usePipelineProspects();
  const addProspect = useAddProspect();
  const updateProspect = useUpdateProspect();
  const deleteProspect = useDeleteProspect();
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);

  const totalPotential = prospects.filter(p => p.status === 'active').reduce((sum, p) => sum + Number(p.potential_commission), 0);
  const activeCount = prospects.filter(p => p.status === 'active').length;

  const handleSave = (id: string, field: keyof PipelineProspect, value: string) => {
    setEditingCell(null);
    const prospect = prospects.find(p => p.id === id);
    if (!prospect) return;

    let parsed: any = value;
    if (field === 'potential_commission') parsed = parseFloat(value) || 0;
    if (String(prospect[field]) === String(parsed)) return;

    updateProspect.mutate({ id, [field]: parsed });
  };

  const handleAddRow = () => {
    addProspect.mutate({
      client_name: 'New Client',
      home_type: 'Detached',
      potential_commission: 0,
    });
  };

  const isEditing = (id: string, field: keyof PipelineProspect) =>
    editingCell?.id === id && editingCell?.field === field;

  const columns = [
    { key: 'client_name' as const, label: 'Client Name', width: 'flex-[2] min-w-[180px]' },
    { key: 'home_type' as const, label: 'Home Type', width: 'flex-1 min-w-[130px]' },
    { key: 'potential_commission' as const, label: 'Potential Commission', width: 'flex-1 min-w-[160px]' },
    { key: 'status' as const, label: 'Status', width: 'flex-1 min-w-[120px]' },
    { key: 'notes' as const, label: 'Notes', width: 'flex-[2] min-w-[180px]' },
  ];

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Pipeline</h1>
              <p className="text-sm text-muted-foreground">
                {activeCount} active prospect{activeCount !== 1 ? 's' : ''} · {formatCurrency(totalPotential)} potential
              </p>
            </div>
          </div>
          <Button size="sm" className="gap-1.5" onClick={handleAddRow} disabled={addProspect.isPending}>
            <Plus className="h-4 w-4" />
            Add Prospect
          </Button>
        </div>

        {/* Spreadsheet Table */}
        <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            {/* Header Row */}
            <div className="flex border-b border-border/60 bg-muted/30 sticky top-0 z-10">
              <div className="w-10 shrink-0 px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center">#</div>
              {columns.map(col => (
                <div key={col.key} className={cn("px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-l border-border/30", col.width)}>
                  {col.label}
                </div>
              ))}
              <div className="w-12 shrink-0 border-l border-border/30" />
            </div>

            {/* Data Rows */}
            {isLoading ? (
              <div className="px-6 py-12 text-center text-muted-foreground text-sm">Loading prospects...</div>
            ) : prospects.length === 0 ? (
              <div className="px-6 py-12 text-center text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No prospects yet</p>
                <p className="text-xs mt-1">Click "Add Prospect" to get started</p>
              </div>
            ) : (
              prospects.map((prospect, idx) => (
                <div
                  key={prospect.id}
                  className={cn(
                    "flex border-b border-border/20 hover:bg-muted/20 transition-colors group",
                    idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'
                  )}
                >
                  {/* Row number */}
                  <div className="w-10 shrink-0 px-3 py-2.5 text-xs text-muted-foreground/60 flex items-center font-mono">
                    {idx + 1}
                  </div>

                  {/* Client Name */}
                  <div className={cn("border-l border-border/20", columns[0].width)}>
                    <InlineCell
                      value={prospect.client_name}
                      isEditing={isEditing(prospect.id, 'client_name')}
                      onStartEdit={() => setEditingCell({ id: prospect.id, field: 'client_name' })}
                      onSave={(val) => handleSave(prospect.id, 'client_name', val)}
                      className="font-medium"
                    />
                  </div>

                  {/* Home Type */}
                  <div className={cn("border-l border-border/20", columns[1].width)}>
                    <InlineCell
                      value={prospect.home_type}
                      isEditing={isEditing(prospect.id, 'home_type')}
                      onStartEdit={() => setEditingCell({ id: prospect.id, field: 'home_type' })}
                      onSave={(val) => handleSave(prospect.id, 'home_type', val)}
                      type="select"
                      options={HOME_TYPES}
                    />
                  </div>

                  {/* Commission */}
                  <div className={cn("border-l border-border/20", columns[2].width)}>
                    {isEditing(prospect.id, 'potential_commission') ? (
                      <InlineCell
                        value={prospect.potential_commission}
                        isEditing
                        onStartEdit={() => {}}
                        onSave={(val) => handleSave(prospect.id, 'potential_commission', val)}
                        type="number"
                      />
                    ) : (
                      <div
                        onClick={() => setEditingCell({ id: prospect.id, field: 'potential_commission' })}
                        className="px-3 py-2.5 text-sm cursor-text font-semibold text-primary hover:bg-muted/40 transition-colors min-h-[40px] flex items-center"
                      >
                        {formatCurrency(prospect.potential_commission)}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className={cn("border-l border-border/20", columns[3].width)}>
                    <StatusBadge
                      status={prospect.status}
                      isEditing={isEditing(prospect.id, 'status')}
                      onStartEdit={() => setEditingCell({ id: prospect.id, field: 'status' })}
                      onSave={(val) => handleSave(prospect.id, 'status', val)}
                    />
                  </div>

                  {/* Notes */}
                  <div className={cn("border-l border-border/20", columns[4].width)}>
                    <InlineCell
                      value={prospect.notes}
                      isEditing={isEditing(prospect.id, 'notes')}
                      onStartEdit={() => setEditingCell({ id: prospect.id, field: 'notes' })}
                      onSave={(val) => handleSave(prospect.id, 'notes', val)}
                    />
                  </div>

                  {/* Delete */}
                  <div className="w-12 shrink-0 border-l border-border/20 flex items-center justify-center">
                    <button
                      onClick={() => deleteProspect.mutate(prospect.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Add row button at bottom */}
            <div
              onClick={handleAddRow}
              className="flex items-center gap-2 px-3 py-2.5 text-xs text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/20 cursor-pointer transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New row</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}