import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePipelineProspects, useAddProspect, useUpdateProspect, useDeleteProspect, PipelineProspect } from '@/hooks/usePipelineProspects';
import { formatCurrency } from '@/lib/format';
import { Plus, Trash2, Users, Flame, Thermometer, Snowflake, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const HOME_TYPES = ['Detached', 'Townhome', 'Condo', 'Pre-Sale', 'Semi-Detached', 'Commercial', 'Land', 'Other'];
const STATUS_OPTIONS = ['active', 'won', 'lost', 'on-hold'];
const TEMP_OPTIONS = ['hot', 'warm', 'cold'];

// ── Inline editable cell ──────────────────────────────────────────────
function InlineCell({
  value, isEditing, onStartEdit, onSave, type = 'text', options, className, placeholder,
}: {
  value: string | number | null;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (val: string) => void;
  type?: 'text' | 'number' | 'select';
  options?: string[];
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
          {options.map(o => <option key={o} value={o}>{o}</option>)}
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
function TempBadge({ temp, onClick }: { temp: string; onClick: () => void }) {
  const config: Record<string, { icon: any; color: string; label: string }> = {
    hot: { icon: Flame, color: 'bg-rose-500/15 text-rose-500 border-rose-500/30', label: 'Hot' },
    warm: { icon: Thermometer, color: 'bg-amber-500/15 text-amber-600 border-amber-500/30', label: 'Warm' },
    cold: { icon: Snowflake, color: 'bg-sky-500/15 text-sky-500 border-sky-500/30', label: 'Cold' },
  };
  const c = config[temp] || config.warm;
  const Icon = c.icon;

  return (
    <div onClick={onClick} className="px-3 py-2 cursor-pointer">
      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border", c.color)}>
        <Icon className="h-3 w-3" />
        {c.label}
      </span>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────
function StatusCell({ status, onClick }: { status: string; onClick: () => void }) {
  const colors: Record<string, string> = {
    active: 'bg-primary/15 text-primary border-primary/30',
    won: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
    lost: 'bg-destructive/15 text-destructive border-destructive/30',
    'on-hold': 'bg-muted text-muted-foreground border-border',
  };

  return (
    <div onClick={onClick} className="px-3 py-2 cursor-pointer">
      <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border capitalize", colors[status] || colors.active)}>
        {status}
      </span>
    </div>
  );
}

// ── Quick-add row ──────────────────────────────────────────────────────
function QuickAddRow({ onAdd }: { onAdd: (data: { client_name: string; home_type: string; potential_commission: number; temperature: string }) => void }) {
  const [name, setName] = useState('');
  const [homeType, setHomeType] = useState('Detached');
  const [commission, setCommission] = useState('');
  const [temp, setTemp] = useState('warm');
  const nameRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      client_name: name.trim(),
      home_type: homeType,
      potential_commission: parseFloat(commission) || 0,
      temperature: temp,
    });
    setName('');
    setCommission('');
    setHomeType('Detached');
    setTemp('warm');
    setTimeout(() => nameRef.current?.focus(), 50);
  };

  return (
    <div className="flex items-center border-t-2 border-dashed border-primary/20 bg-primary/[0.02]">
      <div className="w-10 shrink-0 px-3 py-2.5 flex items-center justify-center">
        <Plus className="h-3.5 w-3.5 text-primary/40" />
      </div>

      {/* Client Name */}
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

      {/* Home Type */}
      <div className="flex-1 min-w-[130px] border-l border-border/20 px-1 py-1">
        <select
          value={homeType}
          onChange={(e) => setHomeType(e.target.value)}
          className="w-full bg-transparent border-0 outline-none px-2 py-1.5 text-sm text-muted-foreground"
        >
          {HOME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Commission */}
      <div className="flex-1 min-w-[140px] border-l border-border/20 px-1 py-1">
        <input
          type="number"
          value={commission}
          onChange={(e) => setCommission(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          placeholder="$0"
          className="w-full bg-transparent border-0 outline-none px-2 py-1.5 text-sm placeholder:text-muted-foreground/30"
        />
      </div>

      {/* Temperature */}
      <div className="flex-1 min-w-[100px] border-l border-border/20 px-1 py-1">
        <select
          value={temp}
          onChange={(e) => setTemp(e.target.value)}
          className="w-full bg-transparent border-0 outline-none px-2 py-1.5 text-sm text-muted-foreground"
        >
          {TEMP_OPTIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>

      {/* Status */}
      <div className="flex-1 min-w-[100px] border-l border-border/20 px-3 py-2.5 text-xs text-muted-foreground/40">
        Active
      </div>

      {/* Notes */}
      <div className="flex-[2] min-w-[140px] border-l border-border/20" />

      {/* Action */}
      <div className="w-14 shrink-0 border-l border-border/20 flex items-center justify-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-primary font-semibold"
          onClick={handleSubmit}
          disabled={!name.trim()}
        >
          Add
        </Button>
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
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);

  const activeProspects = prospects.filter(p => p.status === 'active');
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

  const handleAdd = (data: { client_name: string; home_type: string; potential_commission: number; temperature: string }) => {
    addProspect.mutate(data as any);
  };

  const isEditing = (id: string, field: string) => editingCell?.id === id && editingCell?.field === field;

  return (
    <AppLayout>
      <div className="space-y-6">
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

            {/* Quick Stats */}
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

        {/* ── Spreadsheet ────────────────────────────────── */}
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
                    {/* Row # */}
                    <div className="w-10 shrink-0 px-3 py-2.5 text-xs text-muted-foreground/40 font-mono flex items-center">{idx + 1}</div>

                    {/* Client */}
                    <div className="flex-[2] min-w-[180px] border-l border-border/15">
                      <InlineCell
                        value={p.client_name}
                        isEditing={isEditing(p.id, 'client_name')}
                        onStartEdit={() => setEditingCell({ id: p.id, field: 'client_name' })}
                        onSave={(v) => handleSave(p.id, 'client_name', v)}
                        className="font-semibold"
                        placeholder="Client name"
                      />
                    </div>

                    {/* Home Type */}
                    <div className="flex-1 min-w-[130px] border-l border-border/15">
                      {isEditing(p.id, 'home_type') ? (
                        <InlineCell
                          value={p.home_type} isEditing onStartEdit={() => {}}
                          onSave={(v) => handleSave(p.id, 'home_type', v)}
                          type="select" options={HOME_TYPES}
                        />
                      ) : (
                        <div onClick={() => setEditingCell({ id: p.id, field: 'home_type' })} className="px-3 py-2.5 text-sm cursor-pointer text-muted-foreground min-h-[42px] flex items-center">
                          {p.home_type}
                        </div>
                      )}
                    </div>

                    {/* Commission */}
                    <div className="flex-1 min-w-[140px] border-l border-border/15">
                      {isEditing(p.id, 'potential_commission') ? (
                        <InlineCell
                          value={p.potential_commission} isEditing onStartEdit={() => {}}
                          onSave={(v) => handleSave(p.id, 'potential_commission', v)}
                          type="number"
                        />
                      ) : (
                        <div
                          onClick={() => setEditingCell({ id: p.id, field: 'potential_commission' })}
                          className="px-3 py-2.5 text-sm cursor-text font-bold text-primary min-h-[42px] flex items-center"
                        >
                          {formatCurrency(p.potential_commission)}
                        </div>
                      )}
                    </div>

                    {/* Temperature */}
                    <div className="flex-1 min-w-[100px] border-l border-border/15">
                      {isEditing(p.id, 'temperature') ? (
                        <InlineCell
                          value={p.temperature || 'warm'} isEditing onStartEdit={() => {}}
                          onSave={(v) => handleSave(p.id, 'temperature', v)}
                          type="select" options={TEMP_OPTIONS}
                        />
                      ) : (
                        <TempBadge
                          temp={p.temperature || 'warm'}
                          onClick={() => setEditingCell({ id: p.id, field: 'temperature' })}
                        />
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex-1 min-w-[100px] border-l border-border/15">
                      {isEditing(p.id, 'status') ? (
                        <InlineCell
                          value={p.status} isEditing onStartEdit={() => {}}
                          onSave={(v) => handleSave(p.id, 'status', v)}
                          type="select" options={STATUS_OPTIONS}
                        />
                      ) : (
                        <StatusCell status={p.status} onClick={() => setEditingCell({ id: p.id, field: 'status' })} />
                      )}
                    </div>

                    {/* Notes */}
                    <div className="flex-[2] min-w-[140px] border-l border-border/15">
                      <InlineCell
                        value={p.notes}
                        isEditing={isEditing(p.id, 'notes')}
                        onStartEdit={() => setEditingCell({ id: p.id, field: 'notes' })}
                        onSave={(v) => handleSave(p.id, 'notes', v)}
                        placeholder="Add notes..."
                      />
                    </div>

                    {/* Delete */}
                    <div className="w-14 shrink-0 border-l border-border/15 flex items-center justify-center">
                      <button
                        onClick={() => deleteProspect.mutate(p.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {/* Quick-add row always visible at bottom */}
            <QuickAddRow onAdd={handleAdd} />
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}