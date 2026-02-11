import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plug, Key, RefreshCw, Check, AlertTriangle, Clock, 
  Trash2, Plus, Eye, EyeOff, Wifi, WifiOff, ExternalLink,
  TrendingUp, Users, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export function PlatformConnectionsManager() {
  const { data: connections = [], isLoading } = usePlatformConnections();
  const { data: syncedTxns = [] } = useSyncedTransactions();
  const { data: revenueShares = [] } = useRevenueShare();
  const { data: syncLogs = [] } = useSyncLogs();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRevenueDialog, setShowRevenueDialog] = useState(false);

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">
      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Connected Platforms */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Connected Platforms</h3>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add Platform
              </Button>
            </DialogTrigger>
            <AddConnectionDialog 
              existingPlatforms={connections.map(c => c.platform)} 
              onClose={() => setShowAddDialog(false)} 
            />
          </Dialog>
        </div>

        {connections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Plug className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No platforms connected yet</p>
            <p className="text-xs mt-1">Add your first platform API key to start syncing data</p>
          </div>
        ) : (
          <div className="space-y-2">
            {connections.map(conn => (
              <ConnectionCard key={conn.id} connection={conn} />
            ))}
          </div>
        )}
      </div>

      {/* Synced Transactions Summary */}
      {syncedTxns.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Synced Transactions ({syncedTxns.length})
          </h3>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {syncedTxns.slice(0, 10).map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 text-sm">
                <div className="min-w-0">
                  <p className="font-medium truncate">{tx.client_name || tx.property_address || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{tx.platform} · {tx.transaction_type}</p>
                </div>
                {tx.commission_amount && (
                  <span className="text-xs font-semibold text-success shrink-0">
                    {formatCurrency(tx.commission_amount)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue Share Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            Revenue Share
          </h3>
          <Dialog open={showRevenueDialog} onOpenChange={setShowRevenueDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add Entry
              </Button>
            </DialogTrigger>
            <AddRevenueShareDialog onClose={() => setShowRevenueDialog(false)} />
          </Dialog>
        </div>

        {revenueShares.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Real Broker doesn't have a public API yet. Add revenue share entries manually here.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {revenueShares.map(rs => (
              <RevenueShareRow key={rs.id} entry={rs} />
            ))}
          </div>
        )}
      </div>

      {/* Sync History */}
      {syncLogs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Recent Sync Activity</h3>
          <div className="space-y-1">
            {syncLogs.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                {log.status === 'success' ? (
                  <Check className="w-3 h-3 text-success" />
                ) : log.status === 'error' ? (
                  <AlertTriangle className="w-3 h-3 text-destructive" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                <span>{log.platform}</span>
                <span>·</span>
                <span>{log.records_synced ?? 0} records</span>
                <span>·</span>
                <span>{formatDistanceToNow(new Date(log.started_at), { addSuffix: true })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ConnectionCard({ connection }: { connection: PlatformConnection }) {
  const [showKey, setShowKey] = useState(false);
  const syncPlatform = useSyncPlatform();
  const deleteConnection = useDeleteConnection();
  const platformInfo = PLATFORMS.find(p => p.id === connection.platform);

  const statusColors: Record<string, string> = {
    success: 'bg-success/20 text-success',
    error: 'bg-destructive/20 text-destructive',
    syncing: 'bg-primary/20 text-primary',
    idle: 'bg-muted text-muted-foreground',
  };

  return (
    <motion.div 
      className="p-3 rounded-xl border border-border/50 bg-card/80"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {connection.is_active ? (
              <Wifi className="w-3.5 h-3.5 text-success shrink-0" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            <span className="font-medium text-sm">{platformInfo?.name || connection.platform}</span>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusColors[connection.sync_status] || ''}`}>
              {connection.sync_status}
            </Badge>
          </div>
          
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Key className="w-3 h-3" />
            <span className="font-mono">
              {showKey ? connection.api_key : '••••••••••••'}
            </span>
            <button onClick={() => setShowKey(!showKey)} className="hover:text-foreground">
              {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          </div>

          {connection.last_synced_at && (
            <p className="text-[10px] text-muted-foreground mt-1">
              Last synced {formatDistanceToNow(new Date(connection.last_synced_at), { addSuffix: true })}
            </p>
          )}

          {connection.sync_error && (
            <p className="text-[10px] text-destructive mt-1 truncate">{connection.sync_error}</p>
          )}
        </div>

        <div className="flex gap-1 shrink-0">
          {platformInfo?.hasApi && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => syncPlatform.mutate({ platform: connection.platform, connectionId: connection.id })}
              disabled={syncPlatform.isPending}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncPlatform.isPending ? 'animate-spin' : ''}`} />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={() => deleteConnection.mutate(connection.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

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
          {platform === 'lofty' && (
            <p className="text-xs text-muted-foreground">
              Find your API key in Lofty: Settings → Integrations → API
            </p>
          )}
          {platform === 'real_broker' && (
            <p className="text-xs text-muted-foreground">
              Real Broker doesn't have a public API yet. Save your credentials here for future use.
            </p>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!platform || !apiKey.trim() || upsertConnection.isPending}>
          {upsertConnection.isPending ? 'Saving...' : 'Connect'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

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
            <Label>Tier (1-5)</Label>
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
          {addRevShare.isPending ? 'Adding...' : 'Add Entry'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function RevenueShareRow({ entry }: { entry: any }) {
  const deleteRevShare = useDeleteRevenueShare();
  
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 text-sm">
      <div className="min-w-0">
        <p className="font-medium">{entry.agent_name}</p>
        <p className="text-xs text-muted-foreground">
          Tier {entry.tier} · {entry.period}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-success">{formatCurrency(entry.amount)}</span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
          onClick={() => deleteRevShare.mutate(entry.id)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
