import { describe, expect, it } from 'vitest';
import { createChallengeSchema, endOfDayLocal, type CreateChallengeValues } from './create-challenge-schema';

const base: CreateChallengeValues = {
  name: 'Rats Dev Challenge',
  description: 'Constância',
  maxMembers: 10,
  verificationMode: 'OWN_REPOSITORIES',
  targetValidDays: 30,
  startMode: 'now',
  startAtLocal: '',
  endsAtDate: '',
  admissionEndsAtDate: '',
  repositoryIds: [],
};

describe('create challenge schema', () => {
  it('accepts a minimal own-repositories draft', () => {
    expect(createChallengeSchema.safeParse(base).success).toBe(true);
  });

  it('requires at least one repository in selected mode', () => {
    const result = createChallengeSchema.safeParse({
      ...base,
      verificationMode: 'SELECTED_REPOSITORIES',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('repositoryIds'))).toBe(true);
    }
  });

  it('accepts up to three repositories in selected mode', () => {
    const result = createChallengeSchema.safeParse({
      ...base,
      verificationMode: 'SELECTED_REPOSITORIES',
      repositoryIds: ['a', 'b', 'c'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects more than three repositories', () => {
    const result = createChallengeSchema.safeParse({
      ...base,
      verificationMode: 'SELECTED_REPOSITORIES',
      repositoryIds: ['a', 'b', 'c', 'd'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a scheduled start in the past', () => {
    const result = createChallengeSchema.safeParse({
      ...base,
      startMode: 'schedule',
      startAtLocal: '2020-01-01T10:00',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an end date before the start', () => {
    const tomorrow = new Date(Date.now() + 86_400_000);
    const pad = (value: number) => String(value).padStart(2, '0');
    const start = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T10:00`;
    const yesterday = new Date(Date.now() - 86_400_000);
    const end = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;
    const result = createChallengeSchema.safeParse({
      ...base,
      startMode: 'schedule',
      startAtLocal: start,
      endsAtDate: end,
    });
    expect(result.success).toBe(false);
  });

  it('does not require a timezone anymore', () => {
    const result = createChallengeSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).not.toHaveProperty('timezone');
  });

  it('rejects an out-of-range target', () => {
    expect(createChallengeSchema.safeParse({ ...base, targetValidDays: 0 }).success).toBe(false);
    expect(createChallengeSchema.safeParse({ ...base, targetValidDays: 366 }).success).toBe(false);
  });

  it('converts a date input to the end of the day in Brasília', () => {
    expect(endOfDayLocal('2026-10-28')).toBe('2026-10-29T02:59:59.000Z');
  });
});
