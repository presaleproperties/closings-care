import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

const ONBOARDING_KEY = 'commissioniq_onboarding_complete';

export function useOnboarding() {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) {
      return;
    }

    if (!user) {
      setShowOnboarding(false);
      setIsChecking(false);
      return;
    }

    // Check if user has completed onboarding
    const key = `${ONBOARDING_KEY}_${user.id}`;
    const completed = localStorage.getItem(key);
    
    // Only show onboarding if explicitly NOT completed
    setShowOnboarding(completed !== 'true');
    setIsChecking(false);
  }, [user, loading]);

  const completeOnboarding = useCallback(() => {
    if (user) {
      const key = `${ONBOARDING_KEY}_${user.id}`;
      localStorage.setItem(key, 'true');
      setShowOnboarding(false);
    }
  }, [user]);

  const resetOnboarding = useCallback(() => {
    if (user) {
      const key = `${ONBOARDING_KEY}_${user.id}`;
      localStorage.removeItem(key);
      setShowOnboarding(true);
    }
  }, [user]);

  return {
    showOnboarding,
    isChecking,
    completeOnboarding,
    resetOnboarding,
  };
}