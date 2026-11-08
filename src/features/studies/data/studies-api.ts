import { api } from '@/core/http/api-client';
import type { FeatureFlags, PageResponse, StudyPhoto } from '@/core/types/api';

export interface StudyPhotoListParams {
  userId?: string;
  date?: string;
  page?: number;
  size?: number;
}

export interface PublishStudyPhotoPayload {
  file: File;
  title?: string;
  description?: string;
  githubRepositoryId?: string;
  commitUrl?: string;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export const studiesApi = {
  async features(): Promise<FeatureFlags> {
    const response = await api.get<FeatureFlags>('/features');
    return response.data;
  },

  async list(challengeId: string, params: StudyPhotoListParams = {}): Promise<PageResponse<StudyPhoto>> {
    const response = await api.get<PageResponse<StudyPhoto>>(`/challenges/${challengeId}/photos`, {
      params: {
        userId: params.userId,
        date: params.date,
        page: params.page ?? 0,
        size: params.size ?? 12,
      },
    });
    return response.data;
  },

  async publish(challengeId: string, payload: PublishStudyPhotoPayload): Promise<StudyPhoto> {
    const formData = new FormData();
    formData.append('file', payload.file);
    if (payload.title) formData.append('title', payload.title);
    if (payload.description) formData.append('description', payload.description);
    if (payload.githubRepositoryId) formData.append('githubRepositoryId', payload.githubRepositoryId);
    if (payload.commitUrl) formData.append('commitUrl', payload.commitUrl);

    const response = await api.post<StudyPhoto>(`/challenges/${challengeId}/photos`, formData, {
      timeout: 120_000,
      signal: payload.signal,
      onUploadProgress: (event) => {
        if (event.total) {
          payload.onProgress?.(Math.round((event.loaded / event.total) * 100));
        }
      },
    });
    return response.data;
  },

  async refreshUrl(challengeId: string, photoId: string): Promise<StudyPhoto> {
    const response = await api.get<StudyPhoto>(`/challenges/${challengeId}/photos/${photoId}/url`);
    return response.data;
  },

  async remove(challengeId: string, photoId: string): Promise<void> {
    await api.delete(`/challenges/${challengeId}/photos/${photoId}`);
  },
};
