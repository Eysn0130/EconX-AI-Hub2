import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        stats: 'stats.html'
      }
    }
  },
  server: {
    host: true,
    port: 5173
  }
});
