import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/config/query-keys';
import { progressApi } from '@/features/progress/data/progress-api';

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: progressApi.dashboard,
    refetchInterval: 60_000,
    staleTime: 20_000,
  });
}
