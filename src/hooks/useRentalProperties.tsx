import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface RentalProperty {
  id: string;
  user_id: string;
  name: string;
  address: string | null;
  purchase_price: number | null;
  purchase_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RentalPropertyFormData {
  name: string;
  address?: string;
  purchase_price?: number;
  purchase_date?: string;
  notes?: string;
}

export function useRentalProperties() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['rental_properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('rental_properties')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as RentalProperty[];
    },
    enabled: !!user,
  });
}

export function useCreateRentalProperty() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: RentalPropertyFormData) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data: property, error } = await supabase
        .from('rental_properties')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return property as RentalProperty;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rental_properties'] });
      toast.success('Property added');
    },
    onError: (error) => {
      toast.error(`Failed to add property: ${error.message}`);
    },
  });
}

export function useUpdateRentalProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RentalPropertyFormData> }) => {
      const { data: property, error } = await supabase
        .from('rental_properties')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return property as RentalProperty;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rental_properties'] });
      toast.success('Property updated');
    },
    onError: (error) => {
      toast.error(`Failed to update property: ${error.message}`);
    },
  });
}

export function useDeleteRentalProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rental_properties')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rental_properties'] });
      toast.success('Property deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete property: ${error.message}`);
    },
  });
}
