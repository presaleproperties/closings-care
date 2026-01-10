import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export function useRefreshData() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const refresh = useCallback(async () => {
    if (!user) return;
    
    // Invalidate all main data queries
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['deals', user.id] }),
      queryClient.invalidateQueries({ queryKey: ['payouts', user.id] }),
      queryClient.invalidateQueries({ queryKey: ['expenses'] }),
      queryClient.invalidateQueries({ queryKey: ['other_income'] }),
      queryClient.invalidateQueries({ queryKey: ['properties'] }),
      queryClient.invalidateQueries({ queryKey: ['settings'] }),
    ]);
    
    // Small delay to ensure UI feels responsive
    await new Promise(resolve => setTimeout(resolve, 300));
  }, [queryClient, user]);

  return refresh;
}
