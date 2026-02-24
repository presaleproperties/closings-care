import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useRefreshData } from '@/hooks/useRefreshData';
import { usePipelineProspects, useAddProspect, useUpdateProspect, useDeleteProspect, PipelineProspect } from '@/hooks/usePipelineProspects';
import { formatCurrency } from '@/lib/format';
import { Plus, Trash2, Users, Flame, Thermometer, Snowflake, TrendingUp, List, LayoutGrid, ChevronRight, ArrowRight, GripVertical, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';

const HOME_TYPES = ['Presale', 'Condo', 'Townhome', 'Detached', 'Listings'];
const STATUS_OPTIONS = ['active', 'listings', 'in-contract', 'closed', 'lost'] as const;
const TEMP_OPTIONS = ['hot', 'warm', 'cold'];
const DEAL_TYPE_OPTIONS = ['buyer', 'seller'];
const DEAL_TYPE_LABELS: Record<string, string> = { buyer: 'Buyer', seller: 'Seller' };
const DEAL_TYPE_COLORS: Record<string, string> = {
  buyer: 'bg-sky-500/15 text-sky-600 border-sky-500/30',
  seller: 'bg-violet-500/15 text-violet-600 border-violet-500/30',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  listings: 'Listings',
  'in-contract': 'In Contract',
  closed: 'Closed',
  lost: 'Lost',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-primary/15 text-primary border-primary/30',
  listings: 'bg-violet-500/15 text-violet-600 border-violet-500/30',
  'in-contract': 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  closed: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  lost: 'bg-destructive/15 text-destructive border-destructive/30',
};

const STATUS_HEADER_COLORS: Record<string, string> = {
  active: 'border-primary/40 bg-primary/5',
  listings: 'border-violet-500/40 bg-violet-500/5',
  'in-contract': 'border-amber-500/40 bg-amber-500/5',
  closed: 'border-emerald-500/40 bg-emerald-500/5',
  lost: 'border-destructive/40 bg-destructive/5',
};

const STATUS_DOT_COLORS: Record<string, string> = {
  active: 'bg-primary',
  listings: 'bg-violet-500',
  'in-contract': 'bg-amber-500',
  closed: 'bg-emerald-500',
  lost: 'bg-destructive',
};

type ViewMode = 'list' | 'board';

// ── Inline editable cell ──────────────────────────────────────────────
function InlineCell({
  value, isEditing, onStartEdit, onSave, type = 'text', options, optionLabels, className, placeholder,
}: {
  value: string | number | null;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (val: string) => void;
  type?: 'text' | 'number' | 'select';
  options?: string[];
  optionLabels?: Record<string, string>;
  className?: string;
  placeholder?: string;
}) {
  const ref = useRef<HTMLInputElement | HTMLSelectElement>(null);
  const [draft, setDraft] = useState(String(value ?? ''));

  useEffect(() => {
    if (isEditing) {
      setDraft(String(value ?? ''));
      setTimeout(() => ref.current?.focus(), 0);
    }
  }, [isEditing, value]);

  const commit = () => onSave(draft);

  if (isEditing) {
    if (type === 'select' && options) {
      return (
        <select
          ref={ref as React.RefObject<HTMLSelectElement>}
          value={draft}
          onChange={(e) => { const v = e.target.value; setDraft(v); requestAnimationFrame(() => onSave(v)); }}
          className="w-full h-full bg-card border-0 outline-none ring-2 ring-primary/50 rounded-lg px-3 py-2 text-sm font-medium"
        >
          {options.map(o => <option key={o} value={o}>{optionLabels?.[o] || o}</option>)}
        </select>
      );
    }
    return (
      <input
        ref={ref as React.RefObject<HTMLInputElement>}
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') onSave(String(value ?? '')); }}
        placeholder={placeholder}
        className="w-full h-full bg-card border-0 outline-none ring-2 ring-primary/50 rounded-lg px-3 py-2 text-sm"
      />
    );
  }

  return (
    <div
      onClick={onStartEdit}
      className={cn("px-3 py-2.5 text-sm cursor-text truncate min-h-[42px] flex items-center", className)}
    >
      {value != null && value !== '' ? value : <span className="text-muted-foreground/30 italic">{placeholder || '—'}</span>}
    </div>
  );
}

// ── Temperature badge ──────────────────────────────────────────────────
function TempBadge({ temp, onClick, compact }: { temp: string; onClick?: () => void; compact?: boolean }) {
  const config: Record<string, { icon: any; color: string; label: string }> = {
    hot: { icon: Flame, color: 'bg-rose-500/15 text-rose-500 border-rose-500/30', label: 'Hot' },
    warm: { icon: Thermometer, color: 'bg-amber-500/15 text-amber-600 border-amber-500/30', label: 'Warm' },
    cold: { icon: Snowflake, color: 'bg-sky-500/15 text-sky-500 border-sky-500/30', label: 'Cold' },
  };
  const c = config[temp] || config.warm;
  const Icon = c.icon;

  return (
    <div onClick={onClick} className={cn(onClick && "cursor-pointer", compact ? "" : "px-3 py-2")}>
      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border", c.color)}>
        <Icon className="h-3 w-3" />
        {!compact && c.label}
      </span>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────
function StatusCell({ status, onClick }: { status: string; onClick: () => void }) {
  return (
    <div onClick={onClick} className="px-3 py-2 cursor-pointer">
      <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border capitalize", STATUS_COLORS[status] || STATUS_COLORS.active)}>
        {STATUS_LABELS[status] || status}
      </span>
    </div>
  );
}

// ── Quick-add row ──────────────────────────────────────────────────────
function QuickAddRow({ onAdd, defaultDealType, defaultHomeType }: { onAdd: (data: { client_name: string; home_type: string; potential_commission: number; temperature: string; deal_type: string }) => void; defaultDealType?: string; defaultHomeType?: string }) {
  const [name, setName] = useState('');
  const [commission, setCommission] = useState('');
  const [temp, setTemp] = useState('warm');
  const nameRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      client_name: name.trim(),
      home_type: defaultHomeType || 'Detached',
      potential_commission: parseFloat(commission) || 0,
      temperature: temp,
      deal_type: defaultDealType || 'buyer',
    });
    setName('');
    setCommission('');
    setTemp('warm');
    setTimeout(() => nameRef.current?.focus(), 50);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-t border-dashed border-border/40 bg-muted/10">
      <Plus className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
      <input
        ref={nameRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        placeholder="Client name..."
        className="flex-1 bg-transparent border-0 outline-none text-sm font-medium placeholder:text-muted-foreground/30 min-w-0"
      />
      <input
        type="number"
        value={commission}
        onChange={(e) => setCommission(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        placeholder="$0"
        className="w-24 bg-transparent border-0 outline-none text-sm text-right placeholder:text-muted-foreground/30"
      />
      <select value={temp} onChange={(e) => setTemp(e.target.value)} className="bg-transparent border-0 outline-none text-xs text-muted-foreground">
        {TEMP_OPTIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
      </select>
      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary font-semibold shrink-0" onClick={handleSubmit} disabled={!name.trim()}>Add</Button>
    </div>
  );
}
// ── Temperature sub-group (list view) ─────────────────────────────────
function TempSubGroup({
  temp, label, icon: Icon, headerClass, items, isEditing, setEditingCell, handleSave, deleteProspect, onDropTemp,
}: {
  temp: string;
  label: string;
  icon: any;
  headerClass: string;
  items: PipelineProspect[];
  isEditing: (id: string, field: string) => boolean;
  setEditingCell: (cell: { id: string; field: string } | null) => void;
  handleSave: (id: string, field: string, value: string) => void;
  deleteProspect: { mutate: (id: string) => void };
  onDropTemp: (prospectId: string) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn("transition-colors", isDragOver && "bg-primary/[0.04]")}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const id = e.dataTransfer.getData('prospect-id');
        if (id) { onDropTemp(id); triggerHaptic('light'); }
      }}
    >
      {/* Temp sub-header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className={cn(
          "w-full flex items-center gap-2 px-4 py-1.5 border-b border-t text-[11px] font-bold transition-colors",
          headerClass,
          isDragOver && "brightness-95"
        )}
      >
        <Icon className="h-3 w-3" />
        {label}
        <span className="font-normal opacity-60">{items.length}</span>
        <ChevronDown className={cn("h-3 w-3 ml-auto opacity-50 transition-transform", collapsed && "-rotate-90")} />
      </button>

      {!collapsed && (
        <>
          {items.length === 0 ? (
            <div className={cn(
              "px-4 py-3 text-[11px] text-muted-foreground/30 italic border-b border-dashed border-border/20 transition-all",
              isDragOver && "bg-primary/5 text-primary/50 border-primary/20"
            )}>
              {isDragOver ? `Drop here to mark as ${label.toLowerCase()}` : `No ${label.toLowerCase()} leads`}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {items.map((p, idx) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.12 }}
                  draggable
                  onDragStart={(e: any) => {
                    e.dataTransfer?.setData('prospect-id', p.id);
                    e.currentTarget.style.opacity = '0.4';
                  }}
                  onDragEnd={(e: any) => { e.currentTarget.style.opacity = '1'; }}
                  className={cn(
                    "flex border-b border-border/30 group transition-colors cursor-grab active:cursor-grabbing",
                    idx % 2 === 0 ? 'bg-card' : 'bg-muted/10',
                    'hover:bg-primary/[0.03]'
                  )}
                >
                  <div className="w-8 shrink-0 px-2 flex items-center justify-center text-muted-foreground/20 group-hover:text-muted-foreground/40">
                    <GripVertical className="h-3 w-3" />
                  </div>
                  <div className="flex-[3] min-w-[160px] border-l border-border/10">
                    <InlineCell value={p.client_name} isEditing={isEditing(p.id, 'client_name')} onStartEdit={() => setEditingCell({ id: p.id, field: 'client_name' })} onSave={(v) => handleSave(p.id, 'client_name', v)} className="font-semibold" placeholder="Client name" />
                  </div>
                  <div className="flex-1 min-w-[100px] border-l border-border/10">
                    {isEditing(p.id, 'home_type') ? (
                      <InlineCell value={p.home_type} isEditing onStartEdit={() => {}} onSave={(v) => handleSave(p.id, 'home_type', v)} type="select" options={HOME_TYPES} />
                    ) : (
                      <div onClick={() => setEditingCell({ id: p.id, field: 'home_type' })} className="px-3 py-2 text-xs cursor-pointer text-muted-foreground min-h-[36px] flex items-center">{p.home_type}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-[120px] border-l border-border/10">
                    {isEditing(p.id, 'potential_commission') ? (
                      <InlineCell value={p.potential_commission} isEditing onStartEdit={() => {}} onSave={(v) => handleSave(p.id, 'potential_commission', v)} type="number" />
                    ) : (
                      <div onClick={() => setEditingCell({ id: p.id, field: 'potential_commission' })} className="px-3 py-2 text-sm cursor-text font-bold text-primary min-h-[36px] flex items-center">{formatCurrency(p.potential_commission)}</div>
                    )}
                  </div>
                  <div className="w-[90px] shrink-0 border-l border-border/10">
                    {isEditing(p.id, 'status') ? (
                      <InlineCell value={p.status} isEditing onStartEdit={() => {}} onSave={(v) => handleSave(p.id, 'status', v)} type="select" options={[...STATUS_OPTIONS]} optionLabels={STATUS_LABELS} />
                    ) : (
                      <StatusCell status={p.status} onClick={() => setEditingCell({ id: p.id, field: 'status' })} />
                    )}
                  </div>
                  <div className="flex-[2] min-w-[120px] border-l border-border/10">
                    <InlineCell value={p.notes} isEditing={isEditing(p.id, 'notes')} onStartEdit={() => setEditingCell({ id: p.id, field: 'notes' })} onSave={(v) => handleSave(p.id, 'notes', v)} placeholder="Add notes..." />
                  </div>
                  <div className="w-10 shrink-0 border-l border-border/10 flex items-center justify-center">
                    <button onClick={() => deleteProspect.mutate(p.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-destructive/10 text-muted-foreground/30 hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </>
      )}
    </div>
  );
}

// ── Board Card ──────────────────────────────────────────────────────────
function BoardCard({ prospect, onMoveStatus, onDelete, onUpdate }: {
  prospect: PipelineProspect;
  onMoveStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, field: string, value: string) => void;
}) {
  // Cards are moved via drag-and-drop between columns

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      draggable
      onDragStart={(e: any) => {
        e.dataTransfer?.setData('text/plain', prospect.id);
        e.currentTarget.style.opacity = '0.5';
      }}
      onDragEnd={(e: any) => { e.currentTarget.style.opacity = '1'; }}
      className="rounded-lg border border-border bg-card px-2.5 py-2 group hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing"
    >
      {/* Row 1: Name + temp */}
      <div className="flex items-center justify-between gap-1.5">
        <p className="text-[11px] font-semibold text-foreground truncate flex-1">{prospect.client_name}</p>
        <button
          onClick={(e) => { e.stopPropagation(); const next = TEMP_OPTIONS[(TEMP_OPTIONS.indexOf(prospect.temperature || 'warm') + 1) % TEMP_OPTIONS.length]; onUpdate(prospect.id, 'temperature', next); triggerHaptic('light'); }}
          className="cursor-pointer hover:opacity-80 transition-opacity shrink-0"
        >
          <TempBadge temp={prospect.temperature || 'warm'} compact />
        </button>
      </div>

      {/* Row 2: Tags + commission */}
      <div className="flex items-center justify-between gap-1.5 mt-1">
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); const next = DEAL_TYPE_OPTIONS[(DEAL_TYPE_OPTIONS.indexOf(prospect.deal_type || 'buyer') + 1) % DEAL_TYPE_OPTIONS.length]; onUpdate(prospect.id, 'deal_type', next); triggerHaptic('light'); }}
            className={cn("inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold border cursor-pointer hover:opacity-80 transition-opacity", DEAL_TYPE_COLORS[prospect.deal_type || 'buyer'])}
          >
            {DEAL_TYPE_LABELS[prospect.deal_type || 'buyer']}
          </button>
          <span className="text-[10px] text-muted-foreground">{prospect.home_type}</span>
        </div>
        {prospect.potential_commission > 0 && (
          <span className="text-[11px] font-bold text-primary">{formatCurrency(prospect.potential_commission)}</span>
        )}
      </div>
    </motion.div>
  );
}

// ── Board View ──────────────────────────────────────────────────────────
function BoardQuickAdd({ status, onAdd }: { status: string; onAdd: (data: { client_name: string; home_type: string; potential_commission: number; temperature: string; status: string }) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [commission, setCommission] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({ client_name: name.trim(), home_type: 'Detached', potential_commission: parseFloat(commission) || 0, temperature: 'warm', status });
    setName('');
    setCommission('');
    setOpen(false);
    triggerHaptic('light');
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed border-border/40 hover:border-primary/40 hover:bg-primary/5 p-2.5 text-xs text-muted-foreground/60 hover:text-primary transition-all duration-200 flex items-center justify-center gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Add</span>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-primary/30 bg-card p-3 space-y-2"
    >
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Client name"
        className="w-full bg-transparent border-0 border-b border-border/30 outline-none text-sm py-1 placeholder:text-muted-foreground/40 focus:border-primary/50"
      />
      <input
        value={commission}
        onChange={(e) => setCommission(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Commission $"
        type="number"
        className="w-full bg-transparent border-0 border-b border-border/30 outline-none text-sm py-1 placeholder:text-muted-foreground/40 focus:border-primary/50"
      />
      <div className="flex items-center gap-1.5 pt-1">
        <button onClick={handleSubmit} disabled={!name.trim()} className="flex-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium py-1.5 disabled:opacity-40 transition-opacity">
          Add
        </button>
        <button onClick={() => { setOpen(false); setName(''); setCommission(''); }} className="flex-1 rounded-lg bg-muted text-muted-foreground text-xs font-medium py-1.5">
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

function BoardView({ prospects, onMoveStatus, onDelete, onAdd, onUpdate }: {
  prospects: PipelineProspect[];
  onMoveStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onAdd: (data: { client_name: string; home_type: string; potential_commission: number; temperature: string; status: string }) => void;
  onUpdate: (id: string, field: string, value: string) => void;
}) {
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [dragColSource, setDragColSource] = useState<string | null>(null);
  const [dragOverColTarget, setDragOverColTarget] = useState<string | null>(null);
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('pipeline-col-order');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const allStatuses = [...STATUS_OPTIONS];
        const valid = parsed.filter((s: string) => (allStatuses as readonly string[]).includes(s));
        const missing = allStatuses.filter(s => !valid.includes(s));
        return [...valid, ...missing];
      } catch { /* fall through */ }
    }
    return [...STATUS_OPTIONS];
  });

  const columns = useMemo(() => {
    return columnOrder.map(status => ({
      status,
      label: STATUS_LABELS[status],
      items: prospects.filter(p => p.status === status),
      total: prospects.filter(p => p.status === status).reduce((s, p) => s + Number(p.potential_commission), 0),
    }));
  }, [prospects, columnOrder]);

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(status);
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOverCol(null);
    const dragType = e.dataTransfer.getData('drag-type');
    if (dragType === 'column') return;
    const prospectId = e.dataTransfer.getData('text/plain');
    if (prospectId) {
      triggerHaptic('light');
      onMoveStatus(prospectId, status);
    }
  };

  const handleColDragStart = (e: React.DragEvent, status: string) => {
    e.dataTransfer.setData('drag-type', 'column');
    e.dataTransfer.setData('col-status', status);
    e.dataTransfer.effectAllowed = 'move';
    setDragColSource(status);
  };

  const handleColDragOver = (e: React.DragEvent, status: string) => {
    if (!dragColSource) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColTarget(status);
  };

  const handleColDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceStatus = e.dataTransfer.getData('col-status');
    if (sourceStatus && sourceStatus !== targetStatus) {
      setColumnOrder(prev => {
        const newOrder = [...prev];
        const fromIdx = newOrder.indexOf(sourceStatus);
        const toIdx = newOrder.indexOf(targetStatus);
        newOrder.splice(fromIdx, 1);
        newOrder.splice(toIdx, 0, sourceStatus);
        localStorage.setItem('pipeline-col-order', JSON.stringify(newOrder));
        return newOrder;
      });
      triggerHaptic('medium');
    }
    setDragColSource(null);
    setDragOverColTarget(null);
  };

  return (
    <div className="relative">
      {/* Scroll hint */}
      <div className="flex items-center justify-end gap-1.5 mb-2 text-[10px] text-muted-foreground/60">
        <span>Scroll for more</span>
        <ChevronRight className="h-3 w-3" />
      </div>
      {/* Columns - scrollbar on top via flex-col-reverse */}
      <div className="flex flex-col-reverse">
        <div className="flex gap-3 overflow-x-auto pb-1 snap-x scroll-smooth" style={{ direction: 'ltr' }}>
        {columns.map(col => (
        <div
          key={col.status}
          className={cn(
            "flex flex-col min-h-[200px] rounded-xl border border-border bg-card/50 transition-all duration-200 p-2 shrink-0 w-[280px] sm:w-[calc(50%-6px)] lg:w-[calc(25%-9px)] snap-start",
            dragOverCol === col.status && !dragColSource && "bg-primary/5 border-primary/30",
            dragOverColTarget === col.status && dragColSource && "border-primary/30 bg-primary/5"
          )}
          onDragOver={(e) => {
            if (dragColSource) { handleColDragOver(e, col.status); } else { handleDragOver(e, col.status); }
          }}
          onDragLeave={() => { setDragOverCol(null); setDragOverColTarget(null); }}
          onDrop={(e) => {
            if (dragColSource) { handleColDrop(e, col.status); } else { handleDrop(e, col.status); }
          }}
        >
          {/* Column Header */}
          <div
            draggable
            onDragStart={(e) => handleColDragStart(e, col.status)}
            onDragEnd={() => { setDragColSource(null); setDragOverColTarget(null); }}
            className={cn(
              "flex items-center justify-between px-2 py-2 mb-2 cursor-grab active:cursor-grabbing select-none border-b border-border/50",
              dragColSource === col.status && "opacity-50"
            )}
          >
            <div className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-full", STATUS_DOT_COLORS[col.status])} />
              <span className="text-xs font-bold">{col.label}</span>
              <span className="text-[10px] text-muted-foreground font-medium bg-muted/60 px-1.5 py-0.5 rounded-md">{col.items.length}</span>
            </div>
            {col.total > 0 && (
              <p className="text-[10px] text-muted-foreground font-semibold">{formatCurrency(col.total)}</p>
            )}
          </div>

          {/* Cards grouped by temperature */}
          <div className="flex-1 space-y-1">
            {col.items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/40 p-4 text-center">
                <p className="text-[10px] text-muted-foreground/40">Drop here</p>
              </div>
            ) : (
              [
                { temp: 'hot', label: 'Hot', icon: Flame, pillClass: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
                { temp: 'warm', label: 'Warm', icon: Thermometer, pillClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
                { temp: 'cold', label: 'Cold', icon: Snowflake, pillClass: 'bg-sky-500/10 text-sky-500 border-sky-500/20' },
              ].map(({ temp, label, icon: TIcon, pillClass }) => {
                const tempItems = col.items.filter(p => (p.temperature || 'warm') === temp);
                if (tempItems.length === 0) return null;
                return (
                  <div key={temp}>
                    {/* Temp divider */}
                    <div className={cn("flex items-center gap-1.5 px-1 py-1 mb-1 rounded-md border text-[10px] font-semibold", pillClass)}>
                      <TIcon className="h-2.5 w-2.5" />
                      {label}
                      <span className="font-normal opacity-60 ml-auto">{tempItems.length}</span>
                    </div>
                    <AnimatePresence mode="popLayout">
                      {tempItems.map(p => (
                        <div key={p.id} className="mb-1.5">
                          <BoardCard prospect={p} onMoveStatus={onMoveStatus} onDelete={onDelete} onUpdate={(id, field, value) => { onUpdate(id, field, value); }} />
                        </div>
                      ))}
                    </AnimatePresence>
                  </div>
                );
              })
            )}

            <BoardQuickAdd status={col.status} onAdd={onAdd} />
          </div>
        </div>
      ))}
    </div>
    </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────
export default function PipelinePage() {
  const { data: prospects = [], isLoading } = usePipelineProspects();
  const addProspect = useAddProspect();
  const updateProspect = useUpdateProspect();
  const deleteProspect = useDeleteProspect();
  const refreshData = useRefreshData();
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('pipeline-view') as ViewMode) || 'list';
  });

  const activeProspects = prospects.filter(p => p.status === 'active' || p.status === 'in-contract' || p.status === 'listings');
  const totalPotential = activeProspects.reduce((sum, p) => sum + Number(p.potential_commission), 0);
  const hotCount = prospects.filter(p => p.temperature === 'hot' && (p.status === 'active' || p.status === 'listings')).length;

  const handleSave = useCallback((id: string, field: string, value: string) => {
    setEditingCell(null);
    const prospect = prospects.find(p => p.id === id);
    if (!prospect) return;

    let parsed: any = value;
    if (field === 'potential_commission') parsed = parseFloat(value) || 0;
    if (String((prospect as any)[field]) === String(parsed)) return;

    // Defer mutation to next frame so AnimatePresence can cleanly unmount elements
    requestAnimationFrame(() => {
      // Auto-set deal_type to 'seller' when status changed to 'listings'
      if (field === 'status' && value === 'listings') {
        updateProspect.mutate({ id, status: value, deal_type: 'seller' } as any);
      } else {
        updateProspect.mutate({ id, [field]: parsed } as any);
      }
    });
  }, [prospects, updateProspect]);

  const handleMoveStatus = useCallback((id: string, status: string) => {
    const updates: any = { id, status };
    if (status === 'listings') updates.deal_type = 'seller';
    updateProspect.mutate(updates);
  }, [updateProspect]);

  const handleAdd = (data: { client_name: string; home_type: string; potential_commission: number; temperature: string; deal_type?: string; status?: string }) => {
    addProspect.mutate(data as any);
  };

  const toggleView = (mode: ViewMode) => {
    triggerHaptic('light');
    setViewMode(mode);
    localStorage.setItem('pipeline-view', mode);
  };

  const isEditing = (id: string, field: string) => editingCell?.id === id && editingCell?.field === field;

  return (
    <AppLayout>
      <Header title="Pipeline" subtitle={`${activeProspects.length} active prospects`} showAddDeal={false} />
      <PullToRefresh onRefresh={refreshData} className="min-h-[calc(100vh-56px)]">
      <div className="p-5 lg:p-6 space-y-5">
        {/* ── Hero Stats Bar ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Pipeline</h1>
                <p className="text-xs text-muted-foreground">First contact → Close</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-5">
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{formatCurrency(totalPotential)}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Potential</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-right">
                <p className="text-lg font-bold">{activeProspects.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Active</p>
              </div>
              {hotCount > 0 && (
                <>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Flame className="h-3.5 w-3.5 text-rose-500" />
                      <p className="text-lg font-bold text-rose-500">{hotCount}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Hot</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Status Pills + View Toggle ────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map(status => {
              const items = prospects.filter(p => p.status === status);
              return (
                <div key={status} className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium", STATUS_COLORS[status])}>
                  <div className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT_COLORS[status])} />
                  <span>{STATUS_LABELS[status]}</span>
                  <span className="font-bold">{items.length}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/50 border border-border shrink-0">
            <button
              onClick={() => toggleView('list')}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                viewMode === 'list' ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground border border-transparent"
              )}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => toggleView('board')}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                viewMode === 'board' ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground border border-transparent"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Board</span>
            </button>
          </div>
        </div>

        {/* ── Content ────────────────────────────────── */}
        {viewMode === 'board' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {isLoading ? (
              <div className="py-16 text-center text-muted-foreground text-sm">Loading pipeline...</div>
            ) : (
              <BoardView
                prospects={prospects}
                onMoveStatus={handleMoveStatus}
                onDelete={(id) => deleteProspect.mutate(id)}
                onAdd={handleAdd}
                onUpdate={(id, field, value) => updateProspect.mutate({ id, [field]: value } as any)}
              />
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {isLoading ? (
              <div className="px-6 py-16 text-center text-muted-foreground text-sm">Loading pipeline...</div>
            ) : (
              <>
                {([
                  { key: 'presale', label: 'Presale Deals', defaultDealType: 'buyer', defaultHomeType: 'Presale', headerBg: 'bg-amber-500/8', headerBorder: 'border-amber-500/30', dotColor: 'bg-amber-500', filter: (p: PipelineProspect) => p.status !== 'closed' && p.status !== 'lost' && p.home_type === 'Presale' },
                  { key: 'buyer', label: 'Buyers', defaultDealType: 'buyer', defaultHomeType: 'Detached', headerBg: 'bg-sky-500/8', headerBorder: 'border-sky-500/30', dotColor: 'bg-sky-500', filter: (p: PipelineProspect) => p.status !== 'closed' && p.status !== 'lost' && p.home_type !== 'Presale' && (p.deal_type || 'buyer') === 'buyer' },
                  { key: 'seller', label: 'Sellers / Listings', defaultDealType: 'seller', defaultHomeType: 'Detached', headerBg: 'bg-violet-500/8', headerBorder: 'border-violet-500/30', dotColor: 'bg-violet-500', filter: (p: PipelineProspect) => p.status !== 'closed' && p.status !== 'lost' && p.home_type !== 'Presale' && (p.deal_type || 'buyer') === 'seller' },
                ]).map(group => {
                  const groupItems = [...prospects].reverse().filter(group.filter);
                  const groupGCI = groupItems.reduce((s, p) => s + Number(p.potential_commission), 0);

                  const tempGroups: { temp: string; label: string; icon: any; headerClass: string; items: PipelineProspect[] }[] = [
                    { temp: 'hot', label: 'Hot', icon: Flame, headerClass: 'bg-rose-500/8 border-rose-500/20 text-rose-600', items: groupItems.filter(p => (p.temperature || 'warm') === 'hot') },
                    { temp: 'warm', label: 'Warm', icon: Thermometer, headerClass: 'bg-amber-500/8 border-amber-500/20 text-amber-600', items: groupItems.filter(p => (p.temperature || 'warm') === 'warm') },
                    { temp: 'cold', label: 'Cold', icon: Snowflake, headerClass: 'bg-sky-500/8 border-sky-500/20 text-sky-500', items: groupItems.filter(p => (p.temperature || 'warm') === 'cold') },
                  ].filter(tg => tg.items.length > 0 || tg.temp === 'warm'); // always show warm as drop target

                  return (
                    <motion.div
                      key={group.key}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      className="rounded-xl border border-border bg-card overflow-hidden"
                    >
                      {/* Section Header */}
                      <div className={cn("flex items-center gap-3 px-4 py-3 border-b", group.headerBorder, group.headerBg)}>
                        <div className={cn("w-2 h-2 rounded-full shrink-0", group.dotColor)} />
                        <span className="text-sm font-bold tracking-tight">{group.label}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{groupItems.length} leads</span>
                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total GCI</span>
                          <span className="text-sm font-bold text-primary">{formatCurrency(groupGCI)}</span>
                        </div>
                      </div>

                      {/* Column headers */}
                      <div className="flex bg-muted/20 border-b border-border/50 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                        <div className="w-8 shrink-0 px-2 py-2" />
                        <div className="flex-[3] min-w-[160px] px-3 py-2 border-l border-border/15">Client</div>
                        <div className="flex-1 min-w-[100px] px-3 py-2 border-l border-border/15">Property</div>
                        <div className="flex-1 min-w-[120px] px-3 py-2 border-l border-border/15">Est. GCI</div>
                        <div className="w-[90px] shrink-0 px-3 py-2 border-l border-border/15">Status</div>
                        <div className="flex-[2] min-w-[120px] px-3 py-2 border-l border-border/15">Notes</div>
                        <div className="w-10 shrink-0" />
                      </div>

                      {/* Temperature sub-groups */}
                      {tempGroups.map((tg) => (
                        <TempSubGroup
                          key={tg.temp}
                          temp={tg.temp}
                          label={tg.label}
                          icon={tg.icon}
                          headerClass={tg.headerClass}
                          items={tg.items}
                          isEditing={isEditing}
                          setEditingCell={setEditingCell}
                          handleSave={handleSave}
                          deleteProspect={deleteProspect}
                          onDropTemp={(prospectId) => handleSave(prospectId, 'temperature', tg.temp)}
                        />
                      ))}

                      {/* Quick add for this section */}
                      <QuickAddRow onAdd={handleAdd} defaultDealType={group.defaultDealType} defaultHomeType={group.defaultHomeType} />
                    </motion.div>
                  );
                })}

                {/* ── Closed Deals Section ── */}
                {(() => {
                  const closedItems = [...prospects].reverse().filter(p => p.status === 'closed');
                  if (closedItems.length === 0) return null;
                  const closedGCI = closedItems.reduce((s, p) => s + Number(p.potential_commission), 0);
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="rounded-xl border border-border bg-card/50 overflow-hidden opacity-80"
                    >
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-emerald-500/30 bg-emerald-500/5">
                        <div className="w-2 h-2 rounded-full shrink-0 bg-emerald-500" />
                        <span className="text-sm font-bold tracking-tight">Closed Deals</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{closedItems.length} deals</span>
                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total GCI</span>
                          <span className="text-sm font-bold text-emerald-600">{formatCurrency(closedGCI)}</span>
                        </div>
                      </div>
                      <div className="flex bg-muted/20 border-b border-border/50 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                        <div className="w-8 shrink-0 px-2 py-2">#</div>
                        <div className="flex-[3] min-w-[160px] px-3 py-2 border-l border-border/15">Client</div>
                        <div className="flex-1 min-w-[100px] px-3 py-2 border-l border-border/15">Property</div>
                        <div className="flex-1 min-w-[120px] px-3 py-2 border-l border-border/15">GCI</div>
                        <div className="w-[80px] shrink-0 px-3 py-2 border-l border-border/15">Type</div>
                        <div className="flex-[2] min-w-[120px] px-3 py-2 border-l border-border/15">Notes</div>
                        <div className="w-10 shrink-0" />
                      </div>
                      <div>
                        {closedItems.map((p, idx) => (
                          <div
                            key={p.id}
                            className={cn(
                              "flex border-b border-border/20 group transition-colors",
                              idx % 2 === 0 ? 'bg-card/30' : 'bg-muted/5',
                              'hover:bg-primary/[0.02]'
                            )}
                          >
                            <div className="w-8 shrink-0 px-2 py-2 text-[10px] text-muted-foreground/30 font-mono flex items-center">{idx + 1}</div>
                            <div className="flex-[3] min-w-[160px] border-l border-border/10 px-3 py-2 text-sm font-medium text-muted-foreground line-through decoration-muted-foreground/30">{p.client_name}</div>
                            <div className="flex-1 min-w-[100px] border-l border-border/10">
                              {isEditing(p.id, 'home_type') ? (
                                <InlineCell value={p.home_type} isEditing onStartEdit={() => {}} onSave={(v) => handleSave(p.id, 'home_type', v)} type="select" options={HOME_TYPES} />
                              ) : (
                                <div onClick={() => setEditingCell({ id: p.id, field: 'home_type' })} className="px-3 py-2 text-xs cursor-pointer text-muted-foreground min-h-[36px] flex items-center">{p.home_type}</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-[120px] border-l border-border/10 px-3 py-2 text-sm font-bold text-emerald-600">{formatCurrency(p.potential_commission)}</div>
                            <div className="w-[80px] shrink-0 border-l border-border/10">
                              {isEditing(p.id, 'deal_type') ? (
                                <InlineCell value={p.deal_type || 'buyer'} isEditing onStartEdit={() => {}} onSave={(v) => handleSave(p.id, 'deal_type', v)} type="select" options={DEAL_TYPE_OPTIONS} optionLabels={DEAL_TYPE_LABELS} />
                              ) : (
                                <div onClick={() => setEditingCell({ id: p.id, field: 'deal_type' })} className="px-3 py-2 cursor-pointer">
                                  <span className={cn("inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-semibold border", DEAL_TYPE_COLORS[p.deal_type || 'buyer'])}>
                                    {DEAL_TYPE_LABELS[p.deal_type || 'buyer']}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-[2] min-w-[120px] border-l border-border/10 px-3 py-2 text-xs text-muted-foreground/60 truncate">{p.notes || '—'}</div>
                            <div className="w-10 shrink-0 border-l border-border/10 flex items-center justify-center">
                              <button onClick={() => deleteProspect.mutate(p.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-destructive/10 text-muted-foreground/30 hover:text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })()}

                {/* ── Lost Deals Section ── */}
                {(() => {
                  const lostItems = [...prospects].reverse().filter(p => p.status === 'lost');
                  if (lostItems.length === 0) return null;
                  const lostGCI = lostItems.reduce((s, p) => s + Number(p.potential_commission), 0);
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="rounded-xl border border-border bg-card/50 overflow-hidden opacity-60"
                    >
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-destructive/30 bg-destructive/5">
                        <div className="w-2 h-2 rounded-full shrink-0 bg-destructive" />
                        <span className="text-sm font-bold tracking-tight">Lost Deals</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{lostItems.length} deals</span>
                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total GCI</span>
                          <span className="text-sm font-bold text-destructive">{formatCurrency(lostGCI)}</span>
                        </div>
                      </div>
                      <div className="flex bg-muted/20 border-b border-border/50 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                        <div className="w-8 shrink-0 px-2 py-2">#</div>
                        <div className="flex-[3] min-w-[160px] px-3 py-2 border-l border-border/15">Client</div>
                        <div className="flex-1 min-w-[100px] px-3 py-2 border-l border-border/15">Property</div>
                        <div className="flex-1 min-w-[120px] px-3 py-2 border-l border-border/15">GCI</div>
                        <div className="w-[80px] shrink-0 px-3 py-2 border-l border-border/15">Type</div>
                        <div className="flex-[2] min-w-[120px] px-3 py-2 border-l border-border/15">Notes</div>
                        <div className="w-10 shrink-0" />
                      </div>
                      <AnimatePresence mode="popLayout">
                        {lostItems.map((p, idx) => (
                          <motion.div
                            key={p.id}
                            layout
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.15 }}
                            className={cn(
                              "flex border-b border-border/20 group transition-colors",
                              idx % 2 === 0 ? 'bg-card/30' : 'bg-muted/5',
                              'hover:bg-primary/[0.02]'
                            )}
                          >
                            <div className="w-8 shrink-0 px-2 py-2 text-[10px] text-muted-foreground/30 font-mono flex items-center">{idx + 1}</div>
                            <div className="flex-[3] min-w-[160px] border-l border-border/10 px-3 py-2 text-sm font-medium text-muted-foreground/50 line-through decoration-destructive/30">{p.client_name}</div>
                            <div className="flex-1 min-w-[100px] border-l border-border/10 px-3 py-2 text-xs text-muted-foreground/50">{p.home_type}</div>
                            <div className="flex-1 min-w-[120px] border-l border-border/10 px-3 py-2 text-sm font-bold text-muted-foreground/40">{formatCurrency(p.potential_commission)}</div>
                            <div className="w-[80px] shrink-0 border-l border-border/10 px-3 py-2">
                              <span className={cn("inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-semibold border opacity-50", DEAL_TYPE_COLORS[p.deal_type || 'buyer'])}>
                                {DEAL_TYPE_LABELS[p.deal_type || 'buyer']}
                              </span>
                            </div>
                            <div className="flex-[2] min-w-[120px] border-l border-border/10 px-3 py-2 text-xs text-muted-foreground/40 truncate">{p.notes || '—'}</div>
                            <div className="w-10 shrink-0 border-l border-border/10 flex items-center justify-center">
                              <button onClick={() => deleteProspect.mutate(p.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-destructive/10 text-muted-foreground/30 hover:text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </div>
      </PullToRefresh>
    </AppLayout>
  );
}
