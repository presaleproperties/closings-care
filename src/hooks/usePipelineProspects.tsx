import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface PipelineProspect {
  id: string;
  user_id: string;
  client_name: string;
  home_type: string;
  potential_commission: number;
  status: string;
  temperature: string;
  deal_type: string;
  notes: string | null;
  source: string | null;
  budget: number | null;
  created_at: string;
  updated_at: string;
}

export function usePipelineProspects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pipeline_prospects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipeline_prospects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as PipelineProspect[];
    },
    enabled: !!user,
  });
}

export function useAddProspect() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (prospect: { client_name: string; home_type: string; potential_commission: number; temperature?: string; status?: string; deal_type?: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pipeline_prospects')
        .insert({
          user_id: user.id,
          client_name: prospect.client_name,
          home_type: prospect.home_type,
          potential_commission: prospect.potential_commission,
          temperature: prospect.temperature || 'warm',
          status: prospect.status || 'active',
          deal_type: prospect.deal_type || 'buyer',
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline_prospects'] });
      toast.success('Prospect added to pipeline');
    },
    onError: (error) => {
      toast.error('Failed to add prospect: ' + error.message);
    },
  });
}

export function useUpdateProspect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PipelineProspect> & { id: string }) => {
      const { error } = await supabase
        .from('pipeline_prospects')
        .update(updates as any)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline_prospects'] });
    },
    onError: (error) => {
      toast.error('Failed to update prospect: ' + error.message);
    },
  });
}

export function useDeleteProspect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pipeline_prospects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline_prospects'] });
      toast.success('Prospect removed');
    },
    onError: (error) => {
      toast.error('Failed to remove prospect: ' + error.message);
    },
  });
}
