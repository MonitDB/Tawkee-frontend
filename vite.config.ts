import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5002,
    allowedHosts: [
      'monitdb-dev.ddns.net',
      '91de-2804-29b8-50a6-eded-5d51-f453-7caa-8450.ngrok-free.app'
    ],
    strictPort: true,
    hmr: {
      clientPort: 5002
    }
  }
});
