import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.italpanini',
  appName: 'Ital Panini',
  webDir: 'dist',
  server: {
    url: 'https://58bcbc37-4047-4e54-9d90-57d780d12335.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
};

export default config;
