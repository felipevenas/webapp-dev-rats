import { QueryClient } from '@tanstack/react-query';
import { toAppError } from '@/core/http/problem';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: true,
      retry: (failureCount, error) => {
        const status = toAppError(error).status;
        return status >= 500 && failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
