import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface NetworkAgent {
  id: string;
  user_id: string;
  platform: string;
  agent_yenta_id: string;
  agent_name: string;
  email: string | null;
  phone: string | null;
  tier: number;
  status: string | null;
  sponsor_name: string | null;
  join_date: string | null;
  departure_date: string | null;
  days_with_brokerage: number | null;
  raw_data: any;
  synced_at: string;
  created_at: string;
}

export interface NetworkSummary {
  id: string;
  user_id: string;
  platform: string;
  total_network_agents: number | null;
  co_sponsored_agents: number | null;
  total_revshare_income: number | null;
  network_size_by_tier: Record<string, number> | null;
  revshare_by_tier: Record<string, number> | null;
  revshare_performance: any;
  agent_cap_info: any;
  synced_at: string;
}

export function useNetworkAgents() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['network_agents', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from('network_agents')
        .select('*')
        .eq('user_id', user.id)
        .order('tier', { ascending: true });
      if (error) throw error;
      return (data || []) as NetworkAgent[];
    },
    enabled: !!user,
  });
}

export function useNetworkSummary() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['network_summary', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await (supabase as any)
        .from('network_summary')
        .select('*')
        .eq('user_id', user.id)
        .order('synced_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as NetworkSummary | null;
    },
    enabled: !!user,
  });
}
