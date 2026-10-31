import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/core/http/api-client';
import { profileApi } from './profile-api';

vi.mock('@/core/http/api-client', () => ({
  api: {
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('profileApi avatar', () => {
  beforeEach(() => {
    vi.mocked(api.put).mockReset();
    vi.mocked(api.put).mockResolvedValue({ data: {} });
  });

  it('sends the avatar as multipart FormData', async () => {
    const file = new File(['image'], 'avatar.png', { type: 'image/png' });

    await profileApi.uploadAvatar(file);

    expect(api.put).toHaveBeenCalledTimes(1);
    const [url, body] = vi.mocked(api.put).mock.calls[0];
    expect(url).toBe('/me/avatar');
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('file')).toBe(file);
  });
});
