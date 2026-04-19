import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    allowedHosts: ['.trycloudflare.com', 'localhost', '127.0.0.1'],
    proxy: {
      '/_/backend': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: false,
        secure: false,
        rewrite: (path) => path.replace(/^\/_\/backend/, '')
      }
    }
  }
});
