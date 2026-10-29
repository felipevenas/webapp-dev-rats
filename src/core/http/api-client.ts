import axios, { type AxiosRequestConfig } from 'axios';
import { apiBaseUrl } from '@/core/config/env';
import type { AuthResponse } from '@/core/types/api';

let accessToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token;
  },
  clear: () => {
    accessToken = null;
  },
};

export function onUnauthorized(handler: () => void) {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null;
  };
}

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const isAuthRoute = config.url?.startsWith('/auth/');
  if (accessToken && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/** Rotates the refresh cookie and returns the new access token (single-flight). */
export function refreshSession(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = axios
    .post<AuthResponse>(`${apiBaseUrl}/auth/refresh`, null, {
      withCredentials: true,
      timeout: 15_000,
      headers: { 'Content-Type': 'application/json' },
    })
    .then((response) => {
      tokenStore.set(response.data.accessToken);
      return response.data.accessToken;
    })
    .catch(() => {
      tokenStore.clear();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

interface RetriableConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const isAuthRoute = config?.url?.startsWith('/auth/');
    const isRefreshRoute = config?.url === '/auth/refresh';

    if (status === 401 && config && !config._retry && !isAuthRoute && !isRefreshRoute) {
      config._retry = true;
      const token = await refreshSession();
      if (token) {
        config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
        return api.request(config);
      }
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  },
);
