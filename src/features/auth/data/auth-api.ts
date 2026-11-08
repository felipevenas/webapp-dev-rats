import { api } from '@/core/http/api-client';

export interface PasswordResetResponse {
  message: string;
  resetToken?: string | null;
}

export const authApi = {
  async requestPasswordReset(email: string, turnstileToken?: string) {
    const response = await api.post<PasswordResetResponse>(
      '/auth/password-reset/request',
      { email },
      { headers: turnstileToken ? { 'X-Turnstile-Token': turnstileToken } : undefined },
    );
    return response.data;
  },
  async confirmPasswordReset(token: string, newPassword: string) {
    await api.post('/auth/password-reset/confirm', { token, newPassword });
  },
};
