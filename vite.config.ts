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
      'e17a-2804-29b8-50a6-eded-e5de-928-14b9-d854.ngrok-free.app'
    ],
    strictPort: true,
    hmr: {
      clientPort: 5002
    }
  }
});
