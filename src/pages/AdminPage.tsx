import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Crown, TrendingUp, DollarSign, Briefcase, UserPlus,
  Calendar, Shield, ArrowUpCircle, ArrowDownCircle, Loader2,
  Search, X, Bell, Trash2, KeyRound, Pencil, ClipboardList,
  Eye, Pencil as PencilIcon, Trash, RotateCcw, ChevronDown, ChevronRight,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useIsAdmin, useAdminAnalytics, useAdminUpdateSubscription, useAdminManageUser, useAdminAuditLogs, type AuditLog } from '@/hooks/useAdmin';
import { formatCurrency, formatDate } from '@/lib/format';
import { DataFlowMap } from '@/components/admin/DataFlowMap';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid
} from 'recharts';
import { cn } from '@/lib/utils';

export default function AdminPage() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: isCheckingAdmin } = useIsAdmin();
  const { data: analytics, isLoading, error } = useAdminAnalytics();
  const updateSubscription = useAdminUpdateSubscription();
  const manageUser = useAdminManageUser();
  const { data: auditLogs = [], isLoading: isLoadingAudit } = useAdminAuditLogs();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [editTarget, setEditTarget] = useState<{ id: string; name: string; email: string } | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [showAuditLog, setShowAuditLog] = useState(false);

  const users = analytics?.users || [];
  
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  useEffect(() => {
    if (!isCheckingAdmin && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, isCheckingAdmin, navigate]);

  if (isCheckingAdmin || isLoading) {
    return (
      <AppLayout>
        <Header title="Admin Dashboard" showAddDeal={false} />
        <div className="p-4 lg:p-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  if (error) {
    return (
      <AppLayout>
        <Header title="Admin Dashboard" showAddDeal={false} />
        <div className="p-6 text-center">
          <p className="text-destructive">Error loading analytics: {error.message}</p>
        </div>
      </AppLayout>
    );
  }

  const summary = analytics?.summary;
  const signupsByMonth = analytics?.signupsByMonth || [];

  return (
    <AppLayout>
      <Header 
        title="Admin Dashboard" 
        showAddDeal={false}
        action={
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        }
      />

      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Users"
            value={summary?.totalUsers || 0}
            icon={Users}
            iconColor="text-blue-500"
            iconBg="bg-blue-500/10"
          />
          <SummaryCard
            title="Pro Subscribers"
            value={summary?.proUsers || 0}
            icon={Crown}
            iconColor="text-amber-500"
            iconBg="bg-amber-500/10"
            subtitle={`${summary?.freeUsers || 0} free users`}
          />
          <SummaryCard
            title="MRR"
            value={formatCurrency(summary?.mrr || 0)}
            icon={DollarSign}
            iconColor="text-success"
            iconBg="bg-success/10"
            isFormatted
          />
          <SummaryCard
            title="Recent Signups"
            value={summary?.recentSignups || 0}
            icon={UserPlus}
            iconColor="text-purple-500"
            iconBg="bg-purple-500/10"
            subtitle="Last 7 days"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <SummaryCard
            title="Total Deals"
            value={summary?.totalDeals || 0}
            icon={Briefcase}
            iconColor="text-indigo-500"
            iconBg="bg-indigo-500/10"
            subtitle={`${summary?.closedDeals || 0} closed`}
          />
          <SummaryCard
            title="Active Subscriptions"
            value={summary?.activeSubscriptions || 0}
            icon={TrendingUp}
            iconColor="text-success"
            iconBg="bg-success/10"
          />
          <SummaryCard
            title="Conversion Rate"
            value={summary?.totalUsers ? 
              `${((summary.proUsers / summary.totalUsers) * 100).toFixed(1)}%` : 
              '0%'
            }
            icon={TrendingUp}
            iconColor="text-cyan-500"
            iconBg="bg-cyan-500/10"
            isFormatted
          />
        </div>

        {/* Signups Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              User Signups (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={signupsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    name="Signups"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Signups Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted-foreground" />
              Recent Signups
              {(() => {
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                const newToday = users.filter(u => new Date(u.createdAt) >= oneDayAgo).length;
                return newToday > 0 ? (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {newToday}
                  </span>
                ) : null;
              })()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No signups yet</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {users.slice(0, 20).map((user) => {
                  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                  const isNew = new Date(user.createdAt) >= oneDayAgo;
                  return (
                    <div key={user.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-primary">
                            {(user.name !== 'Unknown' ? user.name : user.email)?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{user.name !== 'Unknown' ? user.name : user.email}</p>
                          {user.name !== 'Unknown' && (
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        {isNew && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">NEW</span>
                        )}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                        </span>
                        <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5", user.subscriptionTier === 'pro' ? "bg-amber-500/10 text-amber-500 border-amber-500/30" : "")}>
                          {user.subscriptionTier === 'pro' ? <><Crown className="w-2.5 h-2.5 mr-0.5" />Pro</> : 'Free'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                All Users ({users.length})
              </CardTitle>
              {searchQuery && (
                <span className="text-xs text-muted-foreground">
                  Showing {filteredUsers.length} of {users.length}
                </span>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                     <th className="text-left p-3 text-xs font-medium text-muted-foreground">User</th>
                     <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Joined</th>
                     <th className="text-center p-3 text-xs font-medium text-muted-foreground">Plan</th>
                     <th className="text-center p-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Deals</th>
                     <th className="text-center p-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">GCI Goal</th>
                     <th className="text-center p-3 text-xs font-medium text-muted-foreground">Plan</th>
                     <th className="text-center p-3 text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No users found matching "{searchQuery}"
                      </td>
                    </tr>
                  ) : null}
                  {filteredUsers.map((user) => {
                    const isUpdating = updatingUserId === user.id;
                    const isPro = user.subscriptionTier === 'pro';

                    const handleSubscriptionChange = async () => {
                      setUpdatingUserId(user.id);
                      try {
                        await updateSubscription.mutateAsync({
                          targetUserId: user.id,
                          tier: isPro ? 'free' : 'pro',
                        });
                      } finally {
                        setUpdatingUserId(null);
                      }
                    };

                    return (
                      <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-sm truncate max-w-[200px]">
                              {user.name || 'Unnamed'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {user.email}
                            </p>
                          </div>
                        </td>
                        <td className="p-3 hidden sm:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(user.createdAt)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <Badge 
                            variant="outline"
                            className={cn(
                              "text-xs",
                              isPro
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {isPro ? (
                              <>
                                <Crown className="w-3 h-3 mr-1" />
                                Pro
                              </>
                            ) : (
                              'Free'
                            )}
                          </Badge>
                        </td>
                        <td className="p-3 text-center hidden md:table-cell">
                          <div className="flex items-center justify-center gap-2 text-sm">
                            <span className="font-medium">{user.dealsCount}</span>
                            <span className="text-muted-foreground text-xs">
                              ({user.closedDeals} closed)
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center hidden lg:table-cell">
                          <div className="text-sm">
                            {user.yearlyGciGoal > 0 ? (
                              <span className="font-medium">{formatCurrency(user.yearlyGciGoal)}</span>
                            ) : (
                              <span className="text-muted-foreground/50 text-xs">Not set</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            <Button
                              size="sm"
                              variant={isPro ? "outline" : "default"}
                              className={cn("text-xs h-7 px-2", !isPro && "bg-amber-500 hover:bg-amber-600 text-white")}
                              onClick={handleSubscriptionChange}
                              disabled={isUpdating}
                            >
                              {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : isPro ? <><ArrowDownCircle className="w-3 h-3 mr-1" />Downgrade</> : <><ArrowUpCircle className="w-3 h-3 mr-1" />Upgrade</>}
                            </Button>
                            <Button
                              size="sm" variant="outline"
                              className="text-xs h-7 px-2"
                              title="Edit user"
                              onClick={() => { setEditTarget({ id: user.id, name: user.name, email: user.email }); setEditName(user.name === 'Unknown' ? '' : user.name); setEditEmail(user.email === 'Unknown' ? '' : user.email); }}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm" variant="outline"
                              className="text-xs h-7 px-2"
                              title="Send password reset"
                              onClick={async () => { await manageUser.mutateAsync({ action: 'reset_password', targetUserId: user.id }); }}
                              disabled={manageUser.isPending}
                            >
                              <KeyRound className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm" variant="outline"
                              className="text-xs h-7 px-2 text-destructive hover:text-destructive"
                              title="Delete user"
                              onClick={() => setDeleteTarget({ id: user.id, name: user.name })}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Data Flow Map */}
        <DataFlowMap />

        {/* Admin Audit Log */}
        <Card>
          <CardHeader>
            <button
              onClick={() => setShowAuditLog(v => !v)}
              className="flex items-center gap-2 w-full text-left"
            >
              <ClipboardList className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-base flex-1">Admin Audit Log</CardTitle>
              <span className="text-xs text-muted-foreground font-normal">{auditLogs.length} entries</span>
              {showAuditLog ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            </button>
          </CardHeader>
          {showAuditLog && (
            <CardContent className="p-0">
              {isLoadingAudit ? (
                <div className="p-6 text-center text-sm text-muted-foreground">Loading audit logs...</div>
              ) : auditLogs.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">No audit log entries yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">When</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Action</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Target User</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Details</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.slice(0, 50).map((log) => (
                        <AuditLogRow key={log.id} log={log} users={users} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user and all their data (deals, expenses, settings, etc.). This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleteTarget) return;
                await manageUser.mutateAsync({ action: 'delete', targetUserId: deleteTarget.id });
                setDeleteTarget(null);
              }}
            >
              {manageUser.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email address" type="email" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!editTarget) return;
                await manageUser.mutateAsync({ action: 'edit', targetUserId: editTarget.id, name: editName, email: editEmail });
                setEditTarget(null);
              }}
              disabled={manageUser.isPending}
            >
              {manageUser.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

const ACTION_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  view_users:     { label: 'Viewed users',       icon: Eye,       color: 'text-blue-500' },
  delete:         { label: 'Deleted user',        icon: Trash,     color: 'text-destructive' },
  reset_password: { label: 'Reset password',      icon: RotateCcw, color: 'text-amber-500' },
  edit:           { label: 'Edited user',         icon: PencilIcon,color: 'text-primary' },
};

function AuditLogRow({ log, users }: { log: AuditLog; users: { id: string; name: string; email: string }[] }) {
  const cfg = ACTION_CONFIG[log.action] ?? { label: log.action, icon: ClipboardList, color: 'text-muted-foreground' };
  const Icon = cfg.icon;
  const target = users.find(u => u.id === log.target_user_id);
  const targetLabel = target ? (target.name !== 'Unknown' ? target.name : target.email) : log.target_user_id ? log.target_user_id.slice(0, 8) + '…' : '—';
  const details = log.details ? Object.entries(log.details).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ') : '—';

  return (
    <tr className="border-b border-border/40 hover:bg-muted/20 transition-colors">
      <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
        {format(new Date(log.created_at), 'MMM d, HH:mm')}
      </td>
      <td className="p-3">
        <span className={`flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
          <Icon className="w-3 h-3 shrink-0" />
          {cfg.label}
        </span>
      </td>
      <td className="p-3 hidden sm:table-cell">
        <span className="text-xs text-muted-foreground font-mono truncate max-w-[140px] block">{targetLabel}</span>
      </td>
      <td className="p-3 hidden md:table-cell">
        <span className="text-xs text-muted-foreground truncate max-w-[200px] block">{details}</span>
      </td>
      <td className="p-3 hidden lg:table-cell">
        <span className="text-xs text-muted-foreground font-mono">{log.ip_address || '—'}</span>
      </td>
    </tr>
  );
}

function SummaryCard({
  title, 
  value, 
  icon: Icon, 
  iconColor, 
  iconBg, 
  subtitle,
  isFormatted = false
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  subtitle?: string;
  isFormatted?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
        </div>
        <div className="mt-3">
          <p className={cn("font-bold", isFormatted ? "text-xl" : "text-2xl")}>
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
