import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Expense, ExpenseFormData } from '@/lib/types';
import { toast } from 'sonner';
import { parseISO, format } from 'date-fns';

/**
 * Calculate total expenses for a specific month, including:
 * - Monthly recurring expenses
 * - Weekly recurring expenses (multiplied by 4.33)
 * - Yearly recurring expenses (only if the month matches)
 * - One-time expenses (only in the specific month they occurred)
 */
export function getExpensesForMonth(expenses: Expense[], monthStr: string): number {
  const targetMonth = monthStr.slice(5, 7); // Extract MM from YYYY-MM
  
  let total = 0;
  
  for (const expense of expenses) {
    const recurrence = expense.recurrence || 'monthly';
    const amount = Number(expense.amount);
    const expenseMonth = expense.month?.slice(5, 7); // MM from expense.month
    const expenseYearMonth = expense.month; // YYYY-MM
    
    switch (recurrence) {
      case 'monthly':
        // Monthly expenses apply to every month
        total += amount;
        break;
      case 'weekly':
        // Weekly expenses apply to every month (4.33 weeks per month)
        total += amount * 4.33;
        break;
      case 'yearly':
        // Yearly expenses only apply if the month matches
        if (expenseMonth === targetMonth) {
          total += amount;
        }
        break;
      case 'one-time':
        // One-time expenses only apply to their specific month
        if (expenseYearMonth === monthStr) {
          total += amount;
        }
        break;
    }
  }
  
  return total;
}

export function useExpenses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('month', { ascending: false });
      
      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!user,
  });
}

export function useExpensesByMonth(month: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['expenses', 'month', month],
    queryFn: async () => {
      if (!user || !month) return [];
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('month', month)
        .order('category', { ascending: true });
      
      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!user && !!month,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data: expense, error } = await supabase
        .from('expenses')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return expense as Expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense added');
    },
    onError: (error) => {
      toast.error(`Failed to add expense: ${error.message}`);
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ExpenseFormData> }) => {
      const { data: expense, error } = await supabase
        .from('expenses')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return expense as Expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense updated');
    },
    onError: (error) => {
      toast.error(`Failed to update expense: ${error.message}`);
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete expense: ${error.message}`);
    },
  });
}
