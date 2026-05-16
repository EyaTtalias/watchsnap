import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.watchsnap.app',
  appName: 'WatchSnap',
  webDir: 'out',
  server: {
    // Load local files over https:// scheme so localStorage, cookies,
    // and camera permissions all behave like a real HTTPS origin.
    androidScheme: 'https',
  },
};

export default config;
