import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4a1d5535c7194b9087894be05903a331',
  appName: 'closings-care',
  webDir: 'dist',
  server: {
    url: 'https://4a1d5535-c719-4b90-8789-4be05903a331.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scrollEnabled: true
  }
};

export default config;
