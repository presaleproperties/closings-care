import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Deal, DealFormData } from '@/lib/types';
import { toast } from 'sonner';

export function useDeals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['deals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Deal[];
    },
    enabled: !!user,
  });
}

export function useDeal(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['deal', id],
    queryFn: async () => {
      if (!user || !id) return null;
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Deal | null;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: DealFormData) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data: deal, error } = await supabase
        .from('deals')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return deal as Deal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deal created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create deal: ${error.message}`);
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DealFormData> }) => {
      // Clean up empty strings to null for date and optional fields
      const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value === '' || value === undefined) {
          acc[key] = null;
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      const { data: deal, error } = await supabase
        .from('deals')
        .update(cleanedData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      // Auto-sync: For RESALE deals, update Completion payout due_date when closing date changes
      if (deal.property_type === 'RESALE' && cleanedData.close_date_est !== undefined) {
        const closingDate = cleanedData.close_date_est;
        await supabase
          .from('payouts')
          .update({ due_date: closingDate })
          .eq('deal_id', id)
          .eq('payout_type', 'Completion');
      }

      return deal as Deal;
    },
    onSuccess: (deal) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal', deal.id] });
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['payouts', 'deal', deal.id] });
      toast.success('Deal updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update deal: ${error.message}`);
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deal deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete deal: ${error.message}`);
    },
  });
}
