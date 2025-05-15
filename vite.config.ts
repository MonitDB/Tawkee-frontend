import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '781b-2804-29b8-50a6-1487-690d-4342-21e2-bce9.ngrok-free.app'
    ]
  }
});
