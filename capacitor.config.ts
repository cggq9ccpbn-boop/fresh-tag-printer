import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.italpanini',
  appName: 'Ital Panini',
  webDir: 'dist',
  ios: {
    minVersion: '16.0',
  },
};

export default config;
