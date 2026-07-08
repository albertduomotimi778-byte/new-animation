import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.animato.newanimation',
  appName: 'New Animation',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://albertduomotimi778-byte.github.io/new-animation/',
    allowNavigation: [
      'albertduomotimi778-byte.github.io',
      '*.github.io',
      '*.run.app'
    ]
  }
};

export default config;
