import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Payout, PayoutFormData, PayoutType } from '@/lib/types';
import { toast } from 'sonner';

export function usePayouts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['payouts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('payouts')
        .select(`
          *,
          deal:deals(*)
        `)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data as Payout[];
    },
    enabled: !!user,
  });
}

export function useDealPayouts(dealId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['payouts', 'deal', dealId],
    queryFn: async () => {
      if (!user || !dealId) return [];
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .eq('deal_id', dealId)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data as Payout[];
    },
    enabled: !!user && !!dealId,
  });
}

export function useCreatePayout() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: PayoutFormData) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data: payout, error } = await supabase
        .from('payouts')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return payout as Payout;
    },
    onSuccess: (payout) => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['payouts', 'deal', payout.deal_id] });
      toast.success('Payout added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add payout: ${error.message}`);
    },
  });
}

interface PayoutTemplateData {
  dealId: string;
  template: string[];
  advanceCommission?: number;
  completionCommission?: number;
  grossCommission?: number;
  advanceDate?: string;
  completionDate?: string;
  closingDate?: string;
}

export function useCreatePayoutsFromTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      dealId, 
      template, 
      advanceCommission = 0, 
      completionCommission = 0, 
      grossCommission = 0,
      advanceDate,
      completionDate,
      closingDate
    }: PayoutTemplateData) => {
      if (!user) throw new Error('Not authenticated');
      
      const payouts = template.map((type) => {
        let amount = 0;
        let dueDate: string | null = null;

        // Set amount based on payout type
        if (type === 'Advance') {
          amount = advanceCommission;
          dueDate = advanceDate || null;
        } else if (type === 'Completion') {
          // For resale, completion gets full gross; for presale, use completion commission
          amount = template.length === 1 ? grossCommission : completionCommission;
          dueDate = closingDate || completionDate || null;
        }
        // Other types (2nd Payment, 3rd Deposit, 4th Deposit) remain 0 until user sets them

        return {
          deal_id: dealId,
          user_id: user.id,
          payout_type: type as PayoutType,
          amount,
          due_date: dueDate,
          status: 'PROJECTED' as const,
        };
      });
      
      const { data, error } = await supabase
        .from('payouts')
        .insert(payouts)
        .select();
      
      if (error) throw error;
      return data as Payout[];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['payouts', 'deal', variables.dealId] });
    },
    onError: (error) => {
      toast.error(`Failed to create payouts: ${error.message}`);
    },
  });
}

export function useUpdatePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PayoutFormData> }) => {
      // Clean up empty strings to null for date fields
      const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value === '' || value === undefined) {
          acc[key] = null;
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      const { data: payout, error } = await supabase
        .from('payouts')
        .update(cleanedData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return payout as Payout;
    },
    onSuccess: (payout) => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['payouts', 'deal', payout.deal_id] });
      toast.success('Payout updated');
    },
    onError: (error) => {
      toast.error(`Failed to update payout: ${error.message}`);
    },
  });
}

export function useMarkPayoutPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const today = new Date().toISOString().split('T')[0];
      const { data: payout, error } = await supabase
        .from('payouts')
        .update({ status: 'PAID', paid_date: today })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return payout as Payout;
    },
    onSuccess: (payout) => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['payouts', 'deal', payout.deal_id] });
      toast.success('Marked as paid');
    },
    onError: (error) => {
      toast.error(`Failed to mark as paid: ${error.message}`);
    },
  });
}

export function useDeletePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dealId }: { id: string; dealId: string }) => {
      const { error } = await supabase
        .from('payouts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return dealId;
    },
    onSuccess: (dealId) => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['payouts', 'deal', dealId] });
      toast.success('Payout deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete payout: ${error.message}`);
    },
  });
}
