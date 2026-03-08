import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useEffect, useState } from 'react';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BLgjK8GQ47wHuLm8vd8dan60E3qUEMj86uR_zQWDSG-8KsKeFN_wZ0HKdMKyEu37Xt_v5JRhLMriwpWQg3Lfg8w';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray.buffer as ArrayBuffer;
}

export type PushPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export function usePushNotifications() {
  const { user } = useAuth();
  const [permissionState, setPermissionState] = useState<PushPermissionState>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;

  useEffect(() => {
    if (!isSupported) {
      setPermissionState('unsupported');
      return;
    }
    setPermissionState(Notification.permission as PushPermissionState);
    checkSubscription();
  }, [user]);

  async function checkSubscription() {
    if (!isSupported || !user) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      setIsSubscribed(!!existing);
    } catch {
      setIsSubscribed(false);
    }
  }

  async function subscribe(): Promise<boolean> {
    if (!isSupported || !user || !VAPID_PUBLIC_KEY) return false;
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission as PushPermissionState);
      if (permission !== 'granted') return false;

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      const subJson = sub.toJSON();
      const { error } = await supabase.from('push_subscriptions' as any).upsert({
        user_id: user.id,
        endpoint: subJson.endpoint!,
        p256dh: (subJson.keys as any).p256dh,
        auth: (subJson.keys as any).auth,
        user_agent: navigator.userAgent.substring(0, 200),
      }, { onConflict: 'user_id,endpoint' });

      if (error) throw error;
      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error('Push subscribe error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribe(): Promise<void> {
    if (!isSupported || !user) return;
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await supabase.from('push_subscriptions' as any).delete()
          .eq('user_id', user.id).eq('endpoint', endpoint);
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error('Push unsubscribe error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return { isSupported, permissionState, isSubscribed, isLoading, subscribe, unsubscribe };
}
