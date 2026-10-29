import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      //---- Dev proxies to Spring Boot so the HttpOnly refresh cookie stays same-origin.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: false,
        configure: (proxy) => {
          //---- The API only accepts its configured frontend origin (5173) for refresh/logout.
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('origin', 'http://localhost:5173');
          });
        },
      },
    },
  },
  test: {
    environment: 'node',
    pool: 'threads',
    maxWorkers: 1,
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
