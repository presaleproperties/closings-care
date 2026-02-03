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

      // Calculate user's portion for team deals (user gets 100% - team_member_portion)
      const teamMemberPortion = deal.team_member_portion || 0;
      const userPortion = teamMemberPortion > 0 ? (100 - teamMemberPortion) / 100 : 1;

      // Auto-sync: For RESALE deals, update Completion payout when closing date or commission changes
      if (deal.property_type === 'RESALE') {
        const updates: Record<string, any> = {};
        
        if (cleanedData.close_date_est !== undefined) {
          updates.due_date = cleanedData.close_date_est;
        }
        
        // Sync gross commission to Completion payout amount for resale (applying user's portion)
        if (cleanedData.gross_commission_est !== undefined || cleanedData.team_member_portion !== undefined) {
          const grossAmount = deal.gross_commission_est || 0;
          updates.amount = Math.round(grossAmount * userPortion * 100) / 100;
        }
        
        if (Object.keys(updates).length > 0) {
          await supabase
            .from('payouts')
            .update(updates)
            .eq('deal_id', id)
            .eq('payout_type', 'Completion');
        }
      }

      // Auto-sync: For PRESALE deals, update payout dates and amounts when deal values change
      if (deal.property_type === 'PRESALE') {
        // Sync advance_date and advance_commission with Advance payout (applying user's portion)
        const advanceUpdates: Record<string, any> = {};
        if (cleanedData.advance_date !== undefined) {
          advanceUpdates.due_date = cleanedData.advance_date;
        }
        if (cleanedData.advance_commission !== undefined || cleanedData.team_member_portion !== undefined) {
          const advanceAmount = deal.advance_commission || 0;
          advanceUpdates.amount = Math.round(advanceAmount * userPortion * 100) / 100;
        }
        if (Object.keys(advanceUpdates).length > 0) {
          await supabase
            .from('payouts')
            .update(advanceUpdates)
            .eq('deal_id', id)
            .eq('payout_type', 'Advance');
        }
        
        // Sync completion_date and completion_commission with Completion payout (applying user's portion)
        const completionUpdates: Record<string, any> = {};
        if (cleanedData.completion_date !== undefined) {
          completionUpdates.due_date = cleanedData.completion_date;
        }
        if (cleanedData.completion_commission !== undefined || cleanedData.team_member_portion !== undefined) {
          const completionAmount = deal.completion_commission || 0;
          completionUpdates.amount = Math.round(completionAmount * userPortion * 100) / 100;
        }
        if (Object.keys(completionUpdates).length > 0) {
          await supabase
            .from('payouts')
            .update(completionUpdates)
            .eq('deal_id', id)
            .eq('payout_type', 'Completion');
        }
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
