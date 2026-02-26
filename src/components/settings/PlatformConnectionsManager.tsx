import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, Check, AlertTriangle, Clock, 
  Trash2, Plus, Eye, EyeOff, Wifi, WifiOff,
  TrendingUp, Users, DollarSign, Zap, Building2, Network, ChevronDown, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { formatDistanceToNow, format } from 'date-fns';
import { formatCurrency } from '@/lib/format';
import {
  usePlatformConnections, useSyncedTransactions, useRevenueShare,
  useSyncLogs, useUpsertConnection, useDeleteConnection,
  useSyncPlatform, useAddRevenueShare, useDeleteRevenueShare,
  PLATFORMS, type PlatformConnection,
} from '@/hooks/usePlatformConnections';

// ─── Sync Preferences ────────────────────────────────────────────────────────

export interface SyncPreferences {
  transactions: boolean;
  listings: boolean;
  revshare: boolean;
  network: boolean;
}

const PREF_KEY = 'sync_preferences';

function loadPreferences(): SyncPreferences {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (raw) return { transactions: true, listings: true, revshare: true, network: true, ...JSON.parse(raw) };
  } catch {}
  return { transactions: true, listings: true, revshare: true, network: true };
}

function savePreferences(prefs: SyncPreferences) {
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

// Export so sync function can read it
export { loadPreferences };

// ─── Data Type Definitions ────────────────────────────────────────────────────

const DATA_TYPES = [
  {
    key: 'transactions' as const,
    label: 'Transactions',
    description: 'Active & closed deals, sale prices, commissions',
    icon: Building2,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    key: 'listings' as const,
    label: 'Listings',
    description: 'Properties where you are the listing agent',
    icon: TrendingUp,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    key: 'revshare' as const,
    label: 'Revenue Share',
    description: 'Monthly rev-share payments by tier',
    icon: DollarSign,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    key: 'network' as const,
    label: 'Network / Downline',
    description: 'Agent roster, tier breakdown, sponsor tree',
    icon: Network,
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function PlatformConnectionsManager() {
  const { data: connections = [], isLoading } = usePlatformConnections();
  const { data: syncedTxns = [] } = useSyncedTransactions();
  const { data: revenueShares = [] } = useRevenueShare();
  const { data: syncLogs = [] } = useSyncLogs();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRevenueDialog, setShowRevenueDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [prefs, setPrefs] = useState<SyncPreferences>(loadPreferences);

  const handleToggle = (key: keyof SyncPreferences, val: boolean) => {
    const next = { ...prefs, [key]: val };
    setPrefs(next);
    savePreferences(next);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const lastLog = syncLogs[0];
  const activeConnections = connections.filter(c => c.is_active);

  return (
    <div className="space-y-5">

      {/* ── Connected Platforms ── */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Connections</span>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs px-2.5">
                <Plus className="w-3 h-3" /> Add
              </Button>
            </DialogTrigger>
            <AddConnectionDialog 
              existingPlatforms={connections.map(c => c.platform)} 
              onClose={() => setShowAddDialog(false)} 
            />
          </Dialog>
        </div>

        {connections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-6 text-center">
            <Wifi className="w-7 h-7 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No platforms connected</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Add your API key to start syncing</p>
          </div>
        ) : (
          <div className="space-y-2">
            {connections.map(conn => (
              <ConnectionCard key={conn.id} connection={conn} prefs={prefs} />
            ))}
          </div>
        )}
      </section>

      {/* ── Data Type Toggles ── */}
      {activeConnections.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">What to Sync</span>
            <span className="text-[10px] text-muted-foreground/50 italic">Applied on next sync</span>
          </div>

          <div className="rounded-xl border border-border/50 bg-card/60 divide-y divide-border/40">
            {DATA_TYPES.map((dt, i) => (
              <motion.div
                key={dt.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${dt.bg}`}>
                  <dt.icon className={`w-3.5 h-3.5 ${dt.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{dt.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{dt.description}</p>
                </div>
                <Switch
                  checked={prefs[dt.key]}
                  onCheckedChange={val => handleToggle(dt.key, val)}
                />
              </motion.div>
            ))}
          </div>

          {/* Counts row */}
          <div className="flex gap-2 flex-wrap">
            {prefs.transactions && (
              <Badge variant="outline" className="text-[10px] gap-1 text-blue-600 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                <Building2 className="w-2.5 h-2.5" /> {syncedTxns.length} transactions
              </Badge>
            )}
            {prefs.revshare && (
              <Badge variant="outline" className="text-[10px] gap-1 text-emerald-600 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                <DollarSign className="w-2.5 h-2.5" /> {revenueShares.length} rev-share entries
              </Badge>
            )}
          </div>
        </section>
      )}

      {/* ── Revenue Share Manual Entries ── */}
      {prefs.revshare && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Manual Rev-Share Entries
            </span>
            <Dialog open={showRevenueDialog} onOpenChange={setShowRevenueDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs px-2.5">
                  <Plus className="w-3 h-3" /> Add
                </Button>
              </DialogTrigger>
              <AddRevenueShareDialog onClose={() => setShowRevenueDialog(false)} />
            </Dialog>
          </div>

          {revenueShares.length === 0 ? (
            <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2.5">
              Rev-share entries from ReZen are synced automatically. Add manual entries here if needed.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto rounded-xl border border-border/40">
              {revenueShares.slice(0, 8).map(rs => (
                <RevenueShareRow key={rs.id} entry={rs} />
              ))}
              {revenueShares.length > 8 && (
                <p className="text-[11px] text-center text-muted-foreground py-2">
                  +{revenueShares.length - 8} more
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* ── Sync History ── */}
      {syncLogs.length > 0 && (
        <section>
          <button
            onClick={() => setShowHistory(v => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            {showHistory ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Sync History
            {lastLog && (
              <span className="ml-auto font-normal normal-case tracking-normal text-[10px]">
                {lastLog.status === 'success' ? (
                  <span className="text-emerald-500">Last sync OK · {formatDistanceToNow(new Date(lastLog.started_at), { addSuffix: true })}</span>
                ) : lastLog.status === 'error' ? (
                  <span className="text-destructive">Last sync failed</span>
                ) : (
                  <span>{formatDistanceToNow(new Date(lastLog.started_at), { addSuffix: true })}</span>
                )}
              </span>
            )}
          </button>

          {showHistory && (
            <div className="mt-2 space-y-1">
              {syncLogs.slice(0, 8).map(log => (
                <div key={log.id} className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                  {log.status === 'success' ? (
                    <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                  ) : log.status === 'error' ? (
                    <AlertTriangle className="w-3 h-3 text-destructive shrink-0" />
                  ) : (
                    <Clock className="w-3 h-3 shrink-0" />
                  )}
                  <span className="capitalize">{log.platform.replace('_', ' ')}</span>
                  <span className="text-border">·</span>
                  <span>{log.records_synced ?? 0} records</span>
                  <span className="ml-auto text-[10px]">{formatDistanceToNow(new Date(log.started_at), { addSuffix: true })}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

// ─── Connection Card ──────────────────────────────────────────────────────────

function ConnectionCard({ connection, prefs }: { connection: PlatformConnection; prefs: SyncPreferences }) {
  const [showKey, setShowKey] = useState(false);
  const syncPlatform = useSyncPlatform();
  const deleteConnection = useDeleteConnection();
  const platformInfo = PLATFORMS.find(p => p.id === connection.platform);

  const isSyncing = connection.sync_status === 'syncing' || syncPlatform.isPending;

  const statusConfig: Record<string, { color: string; label: string }> = {
    success: { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', label: 'Synced' },
    error: { color: 'text-destructive bg-destructive/10 border-destructive/20', label: 'Error' },
    syncing: { color: 'text-primary bg-primary/10 border-primary/20', label: 'Syncing…' },
    idle: { color: 'text-muted-foreground bg-muted/50 border-border/40', label: 'Idle' },
  };

  const sc = statusConfig[connection.sync_status || 'idle'] || statusConfig.idle;

  const enabledTypes = Object.entries(prefs)
    .filter(([, v]) => v)
    .map(([k]) => k);

  return (
    <motion.div
      className="rounded-xl border border-border/50 bg-card/80 overflow-hidden"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Status dot */}
        <div className={`w-2 h-2 rounded-full shrink-0 ${connection.is_active ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{platformInfo?.name || connection.platform}</span>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${sc.color}`}>
              {sc.label}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[11px] font-mono text-muted-foreground">
              {showKey ? connection.api_key : '••••  ••••  ••••  ' + (connection.api_key?.slice(-4) || '????')}
            </span>
            <button onClick={() => setShowKey(!showKey)} className="text-muted-foreground/50 hover:text-muted-foreground">
              {showKey ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
            </button>
          </div>

          {connection.last_synced_at && (
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              Last synced {formatDistanceToNow(new Date(connection.last_synced_at), { addSuffix: true })}
            </p>
          )}

          {connection.sync_error && (
            <p className="text-[10px] text-destructive mt-0.5 line-clamp-2">{connection.sync_error}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {platformInfo?.hasApi && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 text-xs px-2.5"
              onClick={() => syncPlatform.mutate({ platform: connection.platform, connectionId: connection.id })}
              disabled={isSyncing}
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing…' : 'Sync'}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => deleteConnection.mutate(connection.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Enabled types pill row */}
      {enabledTypes.length > 0 && (
        <div className="px-4 pb-3 flex gap-1.5 flex-wrap">
          {enabledTypes.map(type => {
            const dt = DATA_TYPES.find(d => d.key === type);
            if (!dt) return null;
            return (
              <span key={type} className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${dt.bg} ${dt.color} font-medium`}>
                <dt.icon className="w-2.5 h-2.5" />
                {dt.label}
              </span>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ─── Add Connection Dialog ────────────────────────────────────────────────────

function AddConnectionDialog({ existingPlatforms, onClose }: { existingPlatforms: string[]; onClose: () => void }) {
  const [platform, setPlatform] = useState('');
  const [apiKey, setApiKey] = useState('');
  const upsertConnection = useUpsertConnection();

  const availablePlatforms = PLATFORMS.filter(p => !existingPlatforms.includes(p.id));

  const handleSubmit = async () => {
    if (!platform || !apiKey.trim()) return;
    await upsertConnection.mutateAsync({ platform, api_key: apiKey.trim() });
    onClose();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Connect Platform</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Platform</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
            <SelectContent>
              {availablePlatforms.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} — {p.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>API Key</Label>
          <Input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Paste your API key"
          />
          {platform === 'real_broker' && (
            <p className="text-xs text-muted-foreground">
              Find your ReZen API key in Settings → Integrations → API Keys.
            </p>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!platform || !apiKey.trim() || upsertConnection.isPending}>
          {upsertConnection.isPending ? 'Saving…' : 'Connect'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ─── Add Revenue Share Dialog ─────────────────────────────────────────────────

function AddRevenueShareDialog({ onClose }: { onClose: () => void }) {
  const [agentName, setAgentName] = useState('');
  const [tier, setTier] = useState('1');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState(format(new Date(), 'yyyy-MM'));
  const addRevShare = useAddRevenueShare();

  const handleSubmit = async () => {
    if (!agentName.trim() || !amount) return;
    await addRevShare.mutateAsync({
      agent_name: agentName.trim(),
      tier: parseInt(tier),
      amount: parseFloat(amount),
      period,
    });
    onClose();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Revenue Share Entry</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Agent Name</Label>
          <Input value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="Agent name" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Tier (1–5)</Label>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5].map(t => (
                  <SelectItem key={t} value={String(t)}>Tier {t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Amount ($)</Label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Period</Label>
          <Input type="month" value={period} onChange={e => setPeriod(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!agentName.trim() || !amount || addRevShare.isPending}>
          {addRevShare.isPending ? 'Adding…' : 'Add Entry'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ─── Revenue Share Row ────────────────────────────────────────────────────────

function RevenueShareRow({ entry }: { entry: any }) {
  const deleteRevShare = useDeleteRevenueShare();
  return (
    <div className="flex items-center justify-between px-3 py-2 text-sm">
      <div className="min-w-0">
        <p className="font-medium truncate text-xs">{entry.agent_name}</p>
        <p className="text-[10px] text-muted-foreground">Tier {entry.tier} · {entry.period}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-semibold text-emerald-500">{formatCurrency(entry.amount)}</span>
        <Button
          size="sm"
          variant="ghost"
          className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
          onClick={() => deleteRevShare.mutate(entry.id)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
