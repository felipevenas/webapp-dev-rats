import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

const apiTarget = process.env.VITE_PROXY_API_TARGET || 'http://localhost:8080';
const wsTarget = process.env.VITE_PROXY_WS_TARGET || 'ws://localhost:8080';
const proxyOrigin = process.env.VITE_PROXY_ORIGIN || 'http://localhost:5174';

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
        target: apiTarget,
        changeOrigin: true,
        configure: (proxy) => {
          //---- The API only accepts its configured frontend origin for refresh/logout.
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('origin', proxyOrigin);
          });
        },
      },
      '/ws': {
        target: wsTarget,
        ws: true,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReqWs', (proxyReq) => {
            proxyReq.setHeader('origin', proxyOrigin);
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
