import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface PlatformConnection {
  id: string;
  user_id: string;
  platform: string;
  api_key: string | null;
  api_secret: string | null;
  base_url: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  sync_status: string;
  sync_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface SyncedTransaction {
  id: string;
  user_id: string;
  platform: string;
  external_id: string | null;
  transaction_type: string | null;
  client_name: string | null;
  property_address: string | null;
  city: string | null;
  sale_price: number | null;
  commission_amount: number | null;
  close_date: string | null;
  listing_date: string | null;
  status: string | null;
  agent_name: string | null;
  synced_at: string;
  created_at: string;
}

export interface RevenueShare {
  id: string;
  user_id: string;
  platform: string;
  agent_name: string;
  tier: number;
  amount: number;
  period: string;
  cap_contribution: number | null;
  status: string | null;
  notes: string | null;
  created_at: string;
}

export interface SyncLog {
  id: string;
  user_id: string;
  platform: string;
  sync_type: string;
  status: string;
  records_synced: number | null;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

const PLATFORMS = [
  { id: 'lofty', name: 'Lofty (Chime)', description: 'CRM - transactions, listings', hasApi: true },
  { id: 'real_broker', name: 'Real Broker', description: 'Revenue share, cap tracking', hasApi: false },
  { id: 'follow_up_boss', name: 'Follow Up Boss', description: 'CRM - contacts, deals', hasApi: true },
  { id: 'skyslope', name: 'SkySlope', description: 'Transaction management', hasApi: true },
];

export { PLATFORMS };

export function usePlatformConnections() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['platform_connections', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from('platform_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as PlatformConnection[];
    },
    enabled: !!user,
  });
}

export function useSyncedTransactions(platform?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['synced_transactions', user?.id, platform],
    queryFn: async () => {
      if (!user) return [];
      let query = (supabase as any)
        .from('synced_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('synced_at', { ascending: false });
      if (platform) query = query.eq('platform', platform);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as SyncedTransaction[];
    },
    enabled: !!user,
  });
}

export function useRevenueShare() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['revenue_share', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from('revenue_share')
        .select('*')
        .eq('user_id', user.id)
        .order('period', { ascending: false });
      if (error) throw error;
      return (data || []) as RevenueShare[];
    },
    enabled: !!user,
  });
}

export function useSyncLogs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['sync_logs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from('sync_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as SyncLog[];
    },
    enabled: !!user,
  });
}

export function useUpsertConnection() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { platform: string; api_key: string; api_secret?: string; base_url?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data: result, error } = await (supabase as any)
        .from('platform_connections')
        .upsert({
          user_id: user.id,
          platform: data.platform,
          api_key: data.api_key,
          api_secret: data.api_secret || null,
          base_url: data.base_url || null,
          is_active: true,
        }, { onConflict: 'user_id,platform' })
        .select()
        .single();
      if (error) throw error;
      return result as PlatformConnection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform_connections'] });
      toast.success('Connection saved');
    },
    onError: (error) => {
      toast.error(`Failed to save connection: ${error.message}`);
    },
  });
}

export function useDeleteConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await (supabase as any)
        .from('platform_connections')
        .delete()
        .eq('id', connectionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform_connections'] });
      toast.success('Connection removed');
    },
    onError: (error) => {
      toast.error(`Failed to remove: ${error.message}`);
    },
  });
}

export function useSyncPlatform() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ platform, connectionId }: { platform: string; connectionId: string }) => {
      const { data, error } = await supabase.functions.invoke('sync-platform', {
        body: { platform, connection_id: connectionId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['synced_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['sync_logs'] });
      queryClient.invalidateQueries({ queryKey: ['platform_connections'] });
      toast.success(`Synced ${data.records_synced || 0} records`);
    },
    onError: (error) => {
      toast.error(`Sync failed: ${error.message}`);
    },
  });
}

export function useAddRevenueShare() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { agent_name: string; tier: number; amount: number; period: string; cap_contribution?: number; notes?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data: result, error } = await (supabase as any)
        .from('revenue_share')
        .insert({ ...data, user_id: user.id, platform: 'real_broker' })
        .select()
        .single();
      if (error) throw error;
      return result as RevenueShare;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenue_share'] });
      toast.success('Revenue share entry added');
    },
    onError: (error) => {
      toast.error(`Failed to add: ${error.message}`);
    },
  });
}

export function useDeleteRevenueShare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('revenue_share')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenue_share'] });
      toast.success('Entry removed');
    },
    onError: (error) => {
      toast.error(`Failed to remove: ${error.message}`);
    },
  });
}
