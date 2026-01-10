import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

const ONBOARDING_KEY = 'commission_tracker_onboarding_complete';

export function useOnboarding() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsChecking(false);
      return;
    }

    // Check if user has completed onboarding
    const key = `${ONBOARDING_KEY}_${user.id}`;
    const completed = localStorage.getItem(key);
    
    if (!completed) {
      setShowOnboarding(true);
    }
    
    setIsChecking(false);
  }, [user]);

  const completeOnboarding = () => {
    if (user) {
      const key = `${ONBOARDING_KEY}_${user.id}`;
      localStorage.setItem(key, 'true');
      setShowOnboarding(false);
    }
  };

  const resetOnboarding = () => {
    if (user) {
      const key = `${ONBOARDING_KEY}_${user.id}`;
      localStorage.removeItem(key);
      setShowOnboarding(true);
    }
  };

  return {
    showOnboarding,
    isChecking,
    completeOnboarding,
    resetOnboarding,
  };
}