import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useRefreshData } from '@/hooks/useRefreshData';
import { usePipelineProspects, useAddProspect, useUpdateProspect, useDeleteProspect, PipelineProspect } from '@/hooks/usePipelineProspects';
import { formatCurrency } from '@/lib/format';
import { Plus, Trash2, Users, Flame, Thermometer, Snowflake, TrendingUp, List, LayoutGrid, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';

const HOME_TYPES = ['Detached', 'Townhome', 'Condo', 'Pre-Sale', 'Semi-Detached', 'Commercial', 'Land', 'Other'];
const STATUS_OPTIONS = ['active', 'in-contract', 'closed', 'lost'] as const;
const TEMP_OPTIONS = ['hot', 'warm', 'cold'];
const DEAL_TYPE_OPTIONS = ['buyer', 'listing'];
const DEAL_TYPE_LABELS: Record<string, string> = { buyer: 'Buyer', listing: 'Listing' };
const DEAL_TYPE_COLORS: Record<string, string> = {
  buyer: 'bg-sky-500/15 text-sky-600 border-sky-500/30',
  listing: 'bg-violet-500/15 text-violet-600 border-violet-500/30',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  'in-contract': 'In Contract',
  closed: 'Closed',
  lost: 'Lost',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-primary/15 text-primary border-primary/30',
  'in-contract': 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  closed: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  lost: 'bg-destructive/15 text-destructive border-destructive/30',
};

const STATUS_HEADER_COLORS: Record<string, string> = {
  active: 'border-primary/40 bg-primary/5',
  'in-contract': 'border-amber-500/40 bg-amber-500/5',
  closed: 'border-emerald-500/40 bg-emerald-500/5',
  lost: 'border-destructive/40 bg-destructive/5',
};

const STATUS_DOT_COLORS: Record<string, string> = {
  active: 'bg-primary',
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
          onChange={(e) => { setDraft(e.target.value); onSave(e.target.value); }}
          onBlur={commit}
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
function QuickAddRow({ onAdd }: { onAdd: (data: { client_name: string; home_type: string; potential_commission: number; temperature: string; deal_type: string }) => void }) {
  const [name, setName] = useState('');
  const [homeType, setHomeType] = useState('Detached');
  const [commission, setCommission] = useState('');
  const [temp, setTemp] = useState('warm');
  const [dealType, setDealType] = useState('buyer');
  const nameRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      client_name: name.trim(),
      home_type: homeType,
      potential_commission: parseFloat(commission) || 0,
      temperature: temp,
      deal_type: dealType,
    });
    setName('');
    setCommission('');
    setHomeType('Detached');
    setTemp('warm');
    setDealType('buyer');
    setTimeout(() => nameRef.current?.focus(), 50);
  };

  return (
    <div className="flex items-center border-t-2 border-dashed border-primary/20 bg-primary/[0.02]">
      <div className="w-10 shrink-0 px-3 py-2.5 flex items-center justify-center">
        <Plus className="h-3.5 w-3.5 text-primary/40" />
      </div>
      <div className="flex-[2] min-w-[180px] border-l border-border/20 px-1 py-1">
        <input
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          placeholder="Type client name to add..."
          className="w-full bg-transparent border-0 outline-none px-2 py-1.5 text-sm font-medium placeholder:text-muted-foreground/30"
        />
      </div>
      <div className="w-[90px] shrink-0 border-l border-border/20 px-1 py-1">
        <select value={dealType} onChange={(e) => setDealType(e.target.value)} className="w-full bg-transparent border-0 outline-none px-2 py-1.5 text-sm text-muted-foreground">
          {DEAL_TYPE_OPTIONS.map(t => <option key={t} value={t}>{DEAL_TYPE_LABELS[t]}</option>)}
        </select>
      </div>
      <div className="flex-1 min-w-[130px] border-l border-border/20 px-1 py-1">
        <select value={homeType} onChange={(e) => setHomeType(e.target.value)} className="w-full bg-transparent border-0 outline-none px-2 py-1.5 text-sm text-muted-foreground">
          {HOME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="flex-1 min-w-[140px] border-l border-border/20 px-1 py-1">
        <input type="number" value={commission} onChange={(e) => setCommission(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }} placeholder="$0" className="w-full bg-transparent border-0 outline-none px-2 py-1.5 text-sm placeholder:text-muted-foreground/30" />
      </div>
      <div className="flex-1 min-w-[100px] border-l border-border/20 px-1 py-1">
        <select value={temp} onChange={(e) => setTemp(e.target.value)} className="w-full bg-transparent border-0 outline-none px-2 py-1.5 text-sm text-muted-foreground">
          {TEMP_OPTIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>
      <div className="flex-1 min-w-[100px] border-l border-border/20 px-3 py-2.5 text-xs text-muted-foreground/40">Active</div>
      <div className="flex-[2] min-w-[140px] border-l border-border/20" />
      <div className="w-14 shrink-0 border-l border-border/20 flex items-center justify-center">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary font-semibold" onClick={handleSubmit} disabled={!name.trim()}>Add</Button>
      </div>
    </div>
  );
}

// ── Board Card ──────────────────────────────────────────────────────────
function BoardCard({ prospect, onMoveStatus, onDelete }: {
  prospect: PipelineProspect;
  onMoveStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const nextStatuses = STATUS_OPTIONS.filter(s => s !== prospect.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-border/40 bg-card p-3.5 group hover:border-border/60 transition-all hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate">{prospect.client_name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={cn("inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold border", DEAL_TYPE_COLORS[prospect.deal_type || 'buyer'])}>
              {DEAL_TYPE_LABELS[prospect.deal_type || 'buyer']}
            </span>
            <span className="text-xs text-muted-foreground">{prospect.home_type}</span>
          </div>
        </div>
        <TempBadge temp={prospect.temperature || 'warm'} compact />
      </div>

      {prospect.potential_commission > 0 && (
        <p className="text-sm font-bold text-primary mb-2.5">{formatCurrency(prospect.potential_commission)}</p>
      )}

      {prospect.notes && (
        <p className="text-xs text-muted-foreground/70 mb-2.5 line-clamp-2">{prospect.notes}</p>
      )}

      {/* Move actions */}
      <div className="relative">
        <button
          onClick={() => { triggerHaptic('light'); setShowMoveMenu(!showMoveMenu); }}
          className="w-full flex items-center justify-between gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg px-2 py-1.5 hover:bg-muted/50"
        >
          <span>Move to...</span>
          <ChevronRight className={cn("h-3 w-3 transition-transform", showMoveMenu && "rotate-90")} />
        </button>

        <AnimatePresence>
          {showMoveMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-1 pt-1.5">
                {nextStatuses.map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      triggerHaptic('light');
                      onMoveStatus(prospect.id, s);
                      setShowMoveMenu(false);
                    }}
                    className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg hover:bg-muted/60 transition-colors text-left"
                  >
                    <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                    <span className={cn("inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold border", STATUS_COLORS[s])}>
                      {STATUS_LABELS[s]}
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => { triggerHaptic('light'); onDelete(prospect.id); }}
                  className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-destructive/70 hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Board View ──────────────────────────────────────────────────────────
function BoardView({ prospects, onMoveStatus, onDelete }: {
  prospects: PipelineProspect[];
  onMoveStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  const columns = useMemo(() => {
    return STATUS_OPTIONS.map(status => ({
      status,
      label: STATUS_LABELS[status],
      items: prospects.filter(p => p.status === status),
      total: prospects.filter(p => p.status === status).reduce((s, p) => s + Number(p.potential_commission), 0),
    }));
  }, [prospects]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map(col => (
        <div key={col.status} className="flex flex-col min-h-[200px]">
          {/* Column Header */}
          <div className={cn("rounded-xl border p-3 mb-3", STATUS_HEADER_COLORS[col.status])}>
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("w-2 h-2 rounded-full", STATUS_DOT_COLORS[col.status])} />
              <span className="text-sm font-bold">{col.label}</span>
              <span className="text-xs text-muted-foreground ml-auto">{col.items.length}</span>
            </div>
            {col.total > 0 && (
              <p className="text-xs text-muted-foreground font-medium">{formatCurrency(col.total)}</p>
            )}
          </div>

          {/* Cards */}
          <div className="space-y-2.5 flex-1">
            <AnimatePresence mode="popLayout">
              {col.items.map(p => (
                <BoardCard key={p.id} prospect={p} onMoveStatus={onMoveStatus} onDelete={onDelete} />
              ))}
            </AnimatePresence>

            {col.items.length === 0 && (
              <div className="rounded-xl border border-dashed border-border/30 p-6 text-center">
                <p className="text-xs text-muted-foreground/40">No prospects</p>
              </div>
            )}
          </div>
        </div>
      ))}
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

  const activeProspects = prospects.filter(p => p.status === 'active' || p.status === 'in-contract');
  const totalPotential = activeProspects.reduce((sum, p) => sum + Number(p.potential_commission), 0);
  const hotCount = prospects.filter(p => p.temperature === 'hot' && p.status === 'active').length;

  const handleSave = useCallback((id: string, field: string, value: string) => {
    setEditingCell(null);
    const prospect = prospects.find(p => p.id === id);
    if (!prospect) return;

    let parsed: any = value;
    if (field === 'potential_commission') parsed = parseFloat(value) || 0;
    if (String((prospect as any)[field]) === String(parsed)) return;

    updateProspect.mutate({ id, [field]: parsed } as any);
  }, [prospects, updateProspect]);

  const handleMoveStatus = useCallback((id: string, status: string) => {
    updateProspect.mutate({ id, status } as any);
  }, [updateProspect]);

  const handleAdd = (data: { client_name: string; home_type: string; potential_commission: number; temperature: string }) => {
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
      <div className="p-5 lg:p-6 space-y-6">
        {/* ── Hero Header ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-primary/[0.04] border border-border/40 p-6"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Track your prospects from first contact to close
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-6">
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalPotential)}</p>
                <p className="text-xs text-muted-foreground">Potential Revenue</p>
              </div>
              <div className="h-10 w-px bg-border/40" />
              <div className="text-right">
                <p className="text-2xl font-bold">{activeProspects.length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              {hotCount > 0 && (
                <>
                  <div className="h-10 w-px bg-border/40" />
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <Flame className="h-4 w-4 text-rose-500" />
                      <p className="text-2xl font-bold text-rose-500">{hotCount}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Hot Leads</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Status Summary Pills ────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(status => {
            const items = prospects.filter(p => p.status === status);
            const total = items.reduce((s, p) => s + Number(p.potential_commission), 0);
            return (
              <div key={status} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium", STATUS_COLORS[status])}>
                <div className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT_COLORS[status])} />
                <span>{STATUS_LABELS[status]}</span>
                <span className="font-bold">{items.length}</span>
                <span className="opacity-60">·</span>
                <span className="font-bold">{formatCurrency(total)}</span>
              </div>
            );
          })}
        </div>

        {/* ── View Toggle ────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-medium">
            {prospects.length} prospect{prospects.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/40 border border-border/40">
            <button
              onClick={() => toggleView('list')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                viewMode === 'list' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => toggleView('board')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                viewMode === 'board' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
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
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-border/50 bg-card/90 backdrop-blur-sm overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              {/* Header */}
              <div className="flex bg-muted/40 border-b border-border/50 sticky top-0 z-10">
                <div className="w-10 shrink-0 px-3 py-3 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">#</div>
                {[
                  { label: 'Client', width: 'flex-[2] min-w-[180px]' },
                  { label: 'Type', width: 'w-[90px] shrink-0' },
                  { label: 'Property Type', width: 'flex-1 min-w-[130px]' },
                  { label: 'Est. Commission', width: 'flex-1 min-w-[140px]' },
                  { label: 'Temperature', width: 'flex-1 min-w-[100px]' },
                  { label: 'Status', width: 'flex-1 min-w-[100px]' },
                  { label: 'Notes', width: 'flex-[2] min-w-[140px]' },
                ].map(col => (
                  <div key={col.label} className={cn("px-3 py-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest border-l border-border/20", col.width)}>
                    {col.label}
                  </div>
                ))}
                <div className="w-14 shrink-0 border-l border-border/20" />
              </div>

              {/* Rows */}
              {isLoading ? (
                <div className="px-6 py-16 text-center text-muted-foreground text-sm">Loading pipeline...</div>
              ) : prospects.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <TrendingUp className="h-10 w-10 mx-auto mb-3 text-muted-foreground/20" />
                  <p className="text-sm font-medium text-muted-foreground">Your pipeline is empty</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Start typing below to add your first prospect</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {prospects.map((p, idx) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex border-b border-border/15 group transition-colors",
                        idx % 2 === 0 ? 'bg-card' : 'bg-muted/30',
                        'hover:bg-primary/[0.06]'
                      )}
                    >
                      <div className="w-10 shrink-0 px-3 py-2.5 text-xs text-muted-foreground/40 font-mono flex items-center">{idx + 1}</div>

                      <div className="flex-[2] min-w-[180px] border-l border-border/15">
                        <InlineCell value={p.client_name} isEditing={isEditing(p.id, 'client_name')} onStartEdit={() => setEditingCell({ id: p.id, field: 'client_name' })} onSave={(v) => handleSave(p.id, 'client_name', v)} className="font-semibold" placeholder="Client name" />
                      </div>

                      <div className="w-[90px] shrink-0 border-l border-border/15">
                        {isEditing(p.id, 'deal_type') ? (
                          <InlineCell value={p.deal_type || 'buyer'} isEditing onStartEdit={() => {}} onSave={(v) => handleSave(p.id, 'deal_type', v)} type="select" options={DEAL_TYPE_OPTIONS} optionLabels={DEAL_TYPE_LABELS} />
                        ) : (
                          <div onClick={() => setEditingCell({ id: p.id, field: 'deal_type' })} className="px-3 py-2 cursor-pointer">
                            <span className={cn("inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-semibold border", DEAL_TYPE_COLORS[p.deal_type || 'buyer'])}>
                              {DEAL_TYPE_LABELS[p.deal_type || 'buyer']}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-[130px] border-l border-border/15">
                        {isEditing(p.id, 'home_type') ? (
                          <InlineCell value={p.home_type} isEditing onStartEdit={() => {}} onSave={(v) => handleSave(p.id, 'home_type', v)} type="select" options={HOME_TYPES} />
                        ) : (
                          <div onClick={() => setEditingCell({ id: p.id, field: 'home_type' })} className="px-3 py-2.5 text-sm cursor-pointer text-muted-foreground min-h-[42px] flex items-center">{p.home_type}</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-[140px] border-l border-border/15">
                        {isEditing(p.id, 'potential_commission') ? (
                          <InlineCell value={p.potential_commission} isEditing onStartEdit={() => {}} onSave={(v) => handleSave(p.id, 'potential_commission', v)} type="number" />
                        ) : (
                          <div onClick={() => setEditingCell({ id: p.id, field: 'potential_commission' })} className="px-3 py-2.5 text-sm cursor-text font-bold text-primary min-h-[42px] flex items-center">{formatCurrency(p.potential_commission)}</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-[100px] border-l border-border/15">
                        {isEditing(p.id, 'temperature') ? (
                          <InlineCell value={p.temperature || 'warm'} isEditing onStartEdit={() => {}} onSave={(v) => handleSave(p.id, 'temperature', v)} type="select" options={TEMP_OPTIONS} />
                        ) : (
                          <TempBadge temp={p.temperature || 'warm'} onClick={() => setEditingCell({ id: p.id, field: 'temperature' })} />
                        )}
                      </div>

                      <div className="flex-1 min-w-[100px] border-l border-border/15">
                        {isEditing(p.id, 'status') ? (
                          <InlineCell value={p.status} isEditing onStartEdit={() => {}} onSave={(v) => handleSave(p.id, 'status', v)} type="select" options={[...STATUS_OPTIONS]} optionLabels={STATUS_LABELS} />
                        ) : (
                          <StatusCell status={p.status} onClick={() => setEditingCell({ id: p.id, field: 'status' })} />
                        )}
                      </div>

                      <div className="flex-[2] min-w-[140px] border-l border-border/15">
                        <InlineCell value={p.notes} isEditing={isEditing(p.id, 'notes')} onStartEdit={() => setEditingCell({ id: p.id, field: 'notes' })} onSave={(v) => handleSave(p.id, 'notes', v)} placeholder="Add notes..." />
                      </div>

                      <div className="w-14 shrink-0 border-l border-border/15 flex items-center justify-center">
                        <button onClick={() => deleteProspect.mutate(p.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              <QuickAddRow onAdd={handleAdd} />
            </div>
          </motion.div>
        )}
      </div>
      </PullToRefresh>
    </AppLayout>
  );
}
