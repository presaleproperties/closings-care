import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Crown, 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  UserPlus,
  Calendar,
  Shield,
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsAdmin, useAdminAnalytics, useAdminUpdateSubscription } from '@/hooks/useAdmin';
import { formatCurrency, formatDate } from '@/lib/format';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip,
  CartesianGrid
} from 'recharts';
import { cn } from '@/lib/utils';

export default function AdminPage() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: isCheckingAdmin } = useIsAdmin();
  const { data: analytics, isLoading, error } = useAdminAnalytics();
  const updateSubscription = useAdminUpdateSubscription();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

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
  const users = analytics?.users || [];

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

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              All Users ({users.length})
            </CardTitle>
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
                    <th className="text-center p-3 text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
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
                        <td className="p-3 text-center">
                          <Button
                            size="sm"
                            variant={isPro ? "outline" : "default"}
                            className={cn(
                              "text-xs h-7 px-2",
                              !isPro && "bg-amber-500 hover:bg-amber-600 text-white"
                            )}
                            onClick={handleSubscriptionChange}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : isPro ? (
                              <>
                                <ArrowDownCircle className="w-3 h-3 mr-1" />
                                Downgrade
                              </>
                            ) : (
                              <>
                                <ArrowUpCircle className="w-3 h-3 mr-1" />
                                Upgrade
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
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
