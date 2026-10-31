import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/core/auth/auth-provider';
import { profileApi, type UpdateMePayload } from './profile-api';

export type { UpdateMePayload } from './profile-api';

export function useUpdateProfile() {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: (payload: UpdateMePayload) => profileApi.update(payload),
    onSuccess: (user) => setUser(user),
  });
}

export function useUploadAvatar() {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: (user) => setUser(user),
  });
}

export function useDeleteAvatar() {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: profileApi.deleteAvatar,
    onSuccess: (user) => setUser(user),
  });
}

export function useExportData() {
  return useMutation({ mutationFn: profileApi.exportData });
}

export function useDeleteAccount() {
  return useMutation({ mutationFn: (password: string) => profileApi.deleteAccount(password) });
}
