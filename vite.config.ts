import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5002,
    allowedHosts: [
      'http://monitdb-dev.ddns.net:5002'
    ],
    strictPort: true,
    hmr: {
      clientPort: 5002
    }
  }
});
