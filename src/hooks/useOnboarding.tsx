import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useSettings, useUpdateSettings } from './useSettings';

export function useOnboarding() {
  const { user, loading: authLoading } = useAuth();
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Determine if onboarding should show based on settings
  useEffect(() => {
    // Wait for auth and settings to load
    if (authLoading || settingsLoading) {
      return;
    }

    if (!user) {
      setShowOnboarding(false);
      return;
    }

    // Check if onboarding_completed flag exists in settings
    // If settings exist and onboarding_completed is true, don't show
    // If settings don't exist or onboarding_completed is false/undefined, show onboarding
    const hasCompletedOnboarding = settings?.onboarding_completed === true;
    setShowOnboarding(!hasCompletedOnboarding);
  }, [user, authLoading, settings, settingsLoading]);

  const completeOnboarding = useCallback(async () => {
    if (user) {
      try {
        await updateSettings.mutateAsync({
          onboarding_completed: true,
        } as any);
        setShowOnboarding(false);
      } catch (error) {
        console.error('Failed to save onboarding status:', error);
        // Still hide the wizard even if save fails
        setShowOnboarding(false);
      }
    }
  }, [user, updateSettings]);

  const resetOnboarding = useCallback(async () => {
    if (user) {
      try {
        await updateSettings.mutateAsync({
          onboarding_completed: false,
        } as any);
        setShowOnboarding(true);
      } catch (error) {
        console.error('Failed to reset onboarding:', error);
      }
    }
  }, [user, updateSettings]);

  const isChecking = authLoading || settingsLoading;

  return {
    showOnboarding,
    isChecking,
    completeOnboarding,
    resetOnboarding,
  };
}