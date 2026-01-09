import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Settings } from '@/lib/types';
import { toast } from 'sonner';

const DEFAULT_SETTINGS: Partial<Settings> = {
  currency: 'CAD',
  tax_set_aside_percent: 0,
  brokerage_split_percent: 0,
  apply_tax_to_forecasts: false,
  monthly_income_goal: 15000,
  presale_template: ['Advance', '2nd Payment', '3rd Deposit', '4th Deposit', 'Completion'],
  resale_template: ['Completion'],
};

export function useSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['settings', user?.id],
    queryFn: async () => {
      if (!user) return DEFAULT_SETTINGS as Settings;
      
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        return DEFAULT_SETTINGS as Settings;
      }
      
      return {
        ...data,
        presale_template: Array.isArray(data.presale_template) 
          ? data.presale_template 
          : DEFAULT_SETTINGS.presale_template,
        resale_template: Array.isArray(data.resale_template) 
          ? data.resale_template 
          : DEFAULT_SETTINGS.resale_template,
      } as Settings;
    },
    enabled: !!user,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<Settings>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data: settings, error } = await supabase
        .from('settings')
        .update(data)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return settings as Settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved');
    },
    onError: (error) => {
      toast.error(`Failed to save settings: ${error.message}`);
    },
  });
}
