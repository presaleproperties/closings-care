import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type PropertyType = 'personal' | 'rental';

export interface Property {
  id: string;
  user_id: string;
  name: string;
  address: string | null;
  property_type: PropertyType;
  monthly_rent: number | null;
  monthly_mortgage: number | null;
  monthly_strata: number | null;
  yearly_taxes: number | null;
  purchase_price: number | null;
  purchase_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyFormData {
  name: string;
  address?: string;
  property_type: PropertyType;
  monthly_rent?: number;
  monthly_mortgage?: number;
  monthly_strata?: number;
  yearly_taxes?: number;
  purchase_price?: number;
  purchase_date?: string;
  notes?: string;
}

export function useProperties() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Property[];
    },
    enabled: !!user,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: PropertyFormData) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data: property, error } = await supabase
        .from('properties')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return property as Property;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Property added');
    },
    onError: (error) => {
      toast.error(`Failed to add property: ${error.message}`);
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PropertyFormData> }) => {
      const { data: property, error } = await supabase
        .from('properties')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return property as Property;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Property updated');
    },
    onError: (error) => {
      toast.error(`Failed to update property: ${error.message}`);
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Property deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete property: ${error.message}`);
    },
  });
}

/**
 * Calculate property monthly expenses from built-in fields
 */
export function getPropertyMonthlyExpenses(property: Property): number {
  const mortgage = property.monthly_mortgage || 0;
  const strata = property.monthly_strata || 0;
  const taxesMonthly = (property.yearly_taxes || 0) / 12;
  return mortgage + strata + taxesMonthly;
}

/**
 * Calculate property cashflow for a specific month
 */
export function calculatePropertyCashflow(
  property: Property,
  additionalExpenses: number = 0
): { income: number; expenses: number; net: number; isCashFlowing: boolean } {
  const income = property.property_type === 'rental' ? (property.monthly_rent || 0) : 0;
  const builtInExpenses = getPropertyMonthlyExpenses(property);
  const expenses = builtInExpenses + additionalExpenses;
  const net = income - expenses;
  const isCashFlowing = net >= 0;
  
  return { income, expenses, net, isCashFlowing };
}
