import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/config/query-keys';
import {
  studiesApi,
  type PublishStudyPhotoPayload,
  type StudyPhotoListParams,
} from './studies-api';

export function useFeatures() {
  return useQuery({
    queryKey: queryKeys.features,
    queryFn: studiesApi.features,
    staleTime: 60_000,
  });
}

export function useStudyPhotos(
  challengeId: string | undefined,
  params: StudyPhotoListParams = {},
  enabled = true,
) {
  const key = `${params.userId ?? 'all'}:${params.date ?? 'all'}:${params.page ?? 0}:${params.size ?? 12}`;
  return useQuery({
    queryKey: queryKeys.studyPhotos(challengeId ?? '', key),
    queryFn: () => studiesApi.list(challengeId as string, params),
    enabled: Boolean(challengeId) && enabled,
    refetchInterval: 60_000,
  });
}

function useInvalidateStudyPhotos(challengeId: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['challenges', challengeId] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    void queryClient.invalidateQueries({ queryKey: queryKeys.groups });
  };
}

export function usePublishStudyPhoto(challengeId: string) {
  const invalidate = useInvalidateStudyPhotos(challengeId);
  return useMutation({
    mutationFn: (payload: PublishStudyPhotoPayload) => studiesApi.publish(challengeId, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteStudyPhoto(challengeId: string) {
  const invalidate = useInvalidateStudyPhotos(challengeId);
  return useMutation({
    mutationFn: (photoId: string) => studiesApi.remove(challengeId, photoId),
    onSuccess: invalidate,
  });
}

export function useRefreshStudyPhotoUrl(challengeId: string) {
  return useMutation({
    mutationFn: (photoId: string) => studiesApi.refreshUrl(challengeId, photoId),
  });
}
