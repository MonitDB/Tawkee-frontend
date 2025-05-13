import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'd36a-2804-29b8-50a6-1487-a987-19aa-77fe-c31d.ngrok-free.app'
    ]
  }
});
