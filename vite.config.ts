import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

//---- Authorization and refresh cookies travel through the dev proxy, so remote plaintext targets are refused.
function assertSafeProxyTarget(value: string, name: string) {
  const { protocol, hostname } = new URL(value);
  const secure = protocol === 'https:' || protocol === 'wss:';
  if (!secure && !LOOPBACK_HOSTS.has(hostname)) {
    throw new Error(`${name} must use https:// or wss:// unless it targets loopback: ${value}`);
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_PROXY_API_TARGET || 'http://localhost:8080';
  const wsTarget = env.VITE_PROXY_WS_TARGET || 'ws://localhost:8080';
  const proxyOrigin = env.VITE_PROXY_ORIGIN || 'http://localhost:5174';
  assertSafeProxyTarget(apiTarget, 'VITE_PROXY_API_TARGET');
  assertSafeProxyTarget(wsTarget, 'VITE_PROXY_WS_TARGET');

  return {
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
  };
});
