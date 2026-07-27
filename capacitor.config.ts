import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ragga.stream',
  appName: 'RAGGA Stream',
  webDir: 'dist',
  server: {
    // Allows loading resources over http for local development with Spring Boot backend
    cleartext: true,
    androidScheme: 'https',
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
