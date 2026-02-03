import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface DealImport {
  client_name: string;
  deal_type: 'BUY' | 'SELL';
  property_type?: 'PRESALE' | 'RESALE';
  address?: string;
  project_name?: string;
  city?: string;
  pending_date?: string;
  close_date_est?: string;
  sale_price?: number;
  gross_commission_est?: number;
  net_commission_est?: number;
  gross_commission_actual?: number;
  net_commission_actual?: number;
  lead_source?: string;
  notes?: string;
  status: 'PENDING' | 'CLOSED';
  // Presale-specific fields
  buyer_type?: string;
  advance_commission?: number;
  completion_commission?: number;
  advance_date?: string;
  completion_date?: string;
}

interface PayoutImport {
  deal_id: string;
  payout_type: 'Advance' | '2nd Payment' | '3rd Deposit' | '4th Deposit' | 'Completion' | 'Custom';
  amount: number;
  due_date?: string;
  status: 'PROJECTED' | 'INVOICED' | 'PAID';
  paid_date?: string;
  notes?: string;
}

interface ExpenseImport {
  category: string;
  month: string;
  amount: number;
  notes?: string;
}

export function useBulkImportDeals() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (deals: DealImport[]) => {
      if (!user) throw new Error('Not authenticated');
      
      const dealsWithUser = deals.map(deal => ({
        ...deal,
        user_id: user.id,
      }));
      
      const { data, error } = await supabase
        .from('deals')
        .insert(dealsWithUser)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success(`Imported ${data.length} deals successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to import deals: ${error.message}`);
    },
  });
}

// Smart import that creates deals AND their payouts automatically
export function useBulkImportDealsWithPayouts() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (deals: DealImport[]) => {
      if (!user) throw new Error('Not authenticated');
      
      const dealsWithUser = deals.map(deal => ({
        ...deal,
        user_id: user.id,
      }));
      
      // Insert all deals
      const { data: createdDeals, error: dealsError } = await supabase
        .from('deals')
        .insert(dealsWithUser)
        .select();
      
      if (dealsError) throw dealsError;
      if (!createdDeals) throw new Error('No deals created');

      // Create payouts for each deal based on property type
      const payoutsToCreate: PayoutImport[] = [];
      
      createdDeals.forEach((deal, index) => {
        const originalDeal = deals[index];
        
        if (deal.property_type === 'PRESALE') {
          // Presale: Create Advance and Completion payouts
          if (originalDeal.advance_commission || originalDeal.advance_date) {
            payoutsToCreate.push({
              deal_id: deal.id,
              payout_type: 'Advance',
              amount: originalDeal.advance_commission || 0,
              due_date: originalDeal.advance_date || undefined,
              status: 'PROJECTED',
            });
          }
          if (originalDeal.completion_commission || originalDeal.completion_date) {
            payoutsToCreate.push({
              deal_id: deal.id,
              payout_type: 'Completion',
              amount: originalDeal.completion_commission || 0,
              due_date: originalDeal.completion_date || undefined,
              status: 'PROJECTED',
            });
          }
        } else if (deal.property_type === 'RESALE') {
          // Resale: Create single Completion payout
          payoutsToCreate.push({
            deal_id: deal.id,
            payout_type: 'Completion',
            amount: originalDeal.gross_commission_est || 0,
            due_date: originalDeal.close_date_est || undefined,
            status: 'PROJECTED',
          });
        }
      });

      // Insert all payouts
      if (payoutsToCreate.length > 0) {
        const payoutsWithUser = payoutsToCreate.map(p => ({
          ...p,
          user_id: user.id,
        }));
        
        const { error: payoutsError } = await supabase
          .from('payouts')
          .insert(payoutsWithUser);
        
        if (payoutsError) throw payoutsError;
      }

      return { deals: createdDeals, payoutsCreated: payoutsToCreate.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      toast.success(`Imported ${data.deals.length} deals with ${data.payoutsCreated} payouts`);
    },
    onError: (error) => {
      toast.error(`Failed to import: ${error.message}`);
    },
  });
}

export function useBulkImportPayouts() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payouts: PayoutImport[]) => {
      if (!user) throw new Error('Not authenticated');
      
      const payoutsWithUser = payouts.map(payout => ({
        ...payout,
        user_id: user.id,
      }));
      
      const { data, error } = await supabase
        .from('payouts')
        .insert(payoutsWithUser)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      toast.success(`Imported ${data.length} payouts successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to import payouts: ${error.message}`);
    },
  });
}

export function useBulkImportExpenses() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (expenses: ExpenseImport[]) => {
      if (!user) throw new Error('Not authenticated');
      
      const expensesWithUser = expenses.map(expense => ({
        ...expense,
        user_id: user.id,
      }));
      
      const { data, error } = await supabase
        .from('expenses')
        .insert(expensesWithUser)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success(`Imported ${data.length} expenses successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to import expenses: ${error.message}`);
    },
  });
}
