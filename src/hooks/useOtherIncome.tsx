import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface OtherIncome {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  recurrence: 'monthly' | 'weekly' | 'one-time';
  start_month: string;
  end_month: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OtherIncomeFormData {
  name: string;
  amount: number;
  recurrence: 'monthly' | 'weekly' | 'one-time';
  start_month: string;
  end_month?: string;
  notes?: string;
}

export function useOtherIncome() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['other-income', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('other_income')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OtherIncome[];
    },
    enabled: !!user?.id,
  });
}

export function useCreateOtherIncome() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (formData: OtherIncomeFormData) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('other_income')
        .insert({
          user_id: user.id,
          name: formData.name,
          amount: formData.amount,
          recurrence: formData.recurrence,
          start_month: formData.start_month,
          end_month: formData.end_month || null,
          notes: formData.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['other-income'] });
      toast.success('Other income added');
    },
    onError: (error) => {
      toast.error('Failed to add income: ' + error.message);
    },
  });
}

export function useUpdateOtherIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OtherIncomeFormData> }) => {
      const { error } = await supabase
        .from('other_income')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['other-income'] });
      toast.success('Income updated');
    },
    onError: (error) => {
      toast.error('Failed to update: ' + error.message);
    },
  });
}

export function useDeleteOtherIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('other_income')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['other-income'] });
      toast.success('Income deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete: ' + error.message);
    },
  });
}

// Helper to calculate monthly income for a specific month
export function getOtherIncomeForMonth(
  otherIncome: OtherIncome[],
  monthStr: string
): number {
  return otherIncome.reduce((total, income) => {
    // Check if this month is within the income's date range
    const startMonth = income.start_month;
    const endMonth = income.end_month;

    // For one-time income, only count if it matches the start month
    if (income.recurrence === 'one-time') {
      if (startMonth === monthStr) {
        return total + Number(income.amount);
      }
      return total;
    }

    // For recurring income, check if month is in range
    if (monthStr < startMonth) return total;
    if (endMonth && monthStr > endMonth) return total;

    // Calculate amount based on recurrence
    if (income.recurrence === 'weekly') {
      return total + Number(income.amount) * 4.33;
    }

    return total + Number(income.amount);
  }, 0);
}
