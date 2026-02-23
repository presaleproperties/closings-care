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
      queryClient.invalidateQueries({ queryKey: ['revenue-share'] }),
      queryClient.invalidateQueries({ queryKey: ['properties'] }),
      queryClient.invalidateQueries({ queryKey: ['settings'] }),
      queryClient.invalidateQueries({ queryKey: ['synced_transactions'] }),
      queryClient.invalidateQueries({ queryKey: ['platform_connections'] }),
      queryClient.invalidateQueries({ queryKey: ['sync_logs'] }),
      queryClient.invalidateQueries({ queryKey: ['pipeline_prospects'] }),
    ]);
    
    // Small delay to ensure UI feels responsive
    await new Promise(resolve => setTimeout(resolve, 300));
  }, [queryClient, user]);

  return refresh;
}
