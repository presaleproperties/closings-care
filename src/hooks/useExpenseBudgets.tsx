import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ExpenseBudget {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  created_at: string;
  updated_at: string;
}

export interface ExpenseBudgetFormData {
  category: string;
  monthly_limit: number;
}

export function useExpenseBudgets() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['expense_budgets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('expense_budgets')
        .select('*')
        .order('category');
      
      if (error) throw error;
      return data as ExpenseBudget[];
    },
    enabled: !!user,
  });
}

export function useExpenseBudgetByCategory(category: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['expense_budgets', user?.id, category],
    queryFn: async () => {
      if (!user || !category) return null;
      const { data, error } = await supabase
        .from('expense_budgets')
        .select('*')
        .eq('category', category)
        .maybeSingle();
      
      if (error) throw error;
      return data as ExpenseBudget | null;
    },
    enabled: !!user && !!category,
  });
}

export function useUpsertExpenseBudget() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: ExpenseBudgetFormData) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data: result, error } = await supabase
        .from('expense_budgets')
        .upsert(
          { 
            user_id: user.id,
            category: data.category,
            monthly_limit: data.monthly_limit,
          },
          { onConflict: 'user_id,category' }
        )
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense_budgets'] });
      toast.success('Budget goal saved');
    },
    onError: (error) => {
      toast.error('Failed to save budget: ' + error.message);
    },
  });
}

export function useDeleteExpenseBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expense_budgets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense_budgets'] });
      toast.success('Budget goal removed');
    },
    onError: (error) => {
      toast.error('Failed to delete budget: ' + error.message);
    },
  });
}
