import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  subscriptionTier: string;
  subscriptionStartedAt: string | null;
  subscriptionEndsAt: string | null;
  dealsCount: number;
  pendingDeals: number;
  closedDeals: number;
}

interface AdminSummary {
  totalUsers: number;
  proUsers: number;
  freeUsers: number;
  totalDeals: number;
  closedDeals: number;
  recentSignups: number;
  mrr: number;
  activeSubscriptions: number;
}

interface SignupsByMonth {
  month: string;
  count: number;
}

interface AdminAnalytics {
  summary: AdminSummary;
  signupsByMonth: SignupsByMonth[];
  users: AdminUser[];
}

export function useIsAdmin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return data?.is_admin ?? false;
    },
    enabled: !!user,
  });
}

export function useAdminAnalytics() {
  const { data: isAdmin } = useIsAdmin();

  return useQuery<AdminAnalytics>({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-analytics');

      if (error) {
        throw new Error(error.message);
      }

      return data as AdminAnalytics;
    },
    enabled: isAdmin === true,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}
