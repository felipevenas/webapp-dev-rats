import { describe, expect, it } from 'vitest';
import {
  DEFAULT_TIME_ZONE,
  addDays,
  diffInDays,
  eachDay,
  formatCountdown,
  formatMonthLabel,
  endOfDayInZone,
  localDateInZone,
  monthGrid,
  shiftMonth,
  startOfDayInZone,
  toIsoDate,
  toZonedDateTimeInput,
  zonedDateTimeToInstant,
} from './date';

describe('date helpers', () => {
  it('fixes the default timezone to Brasília', () => {
    expect(DEFAULT_TIME_ZONE).toBe('America/Sao_Paulo');
    expect(localDateInZone('2026-10-29T02:00:00Z', DEFAULT_TIME_ZONE)).toBe('2026-10-28');
  });

  it('converts datetime-local values in the challenge timezone', () => {
    expect(zonedDateTimeToInstant('2026-11-01T23:30', 'America/Sao_Paulo')).toBe('2026-11-02T02:30:00.000Z');
    expect(zonedDateTimeToInstant('2026-11-01T00:00', 'America/Sao_Paulo')).toBe('2026-11-01T03:00:00.000Z');
    expect(endOfDayInZone('2026-11-01', 'America/Sao_Paulo')).toBe('2026-11-02T02:59:59.000Z');
    expect(startOfDayInZone('2026-11-01', 'America/Sao_Paulo')).toBe('2026-11-01T03:00:00.000Z');
  });

  it('formats an instant back into the challenge timezone input', () => {
    expect(toZonedDateTimeInput('2026-11-02T02:30:00.000Z', 'America/Sao_Paulo')).toBe('2026-11-01T23:30');
  });

  it('builds a six-week Sunday-first grid for a month', () => {
    const cells = monthGrid('2026-10');
    expect(cells).toHaveLength(42);
    expect(cells[0]).toMatchObject({ date: '2026-09-27', inMonth: false });
    expect(cells[4]).toMatchObject({ date: '2026-10-01', inMonth: true });
    expect(cells[41]?.date).toBe('2026-11-07');
  });

  it('adds days across month boundaries', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });

  it('counts whole days between civil dates', () => {
    expect(diffInDays('2026-10-01', '2026-10-28')).toBe(27);
    expect(diffInDays('2026-10-28', '2026-10-28')).toBe(0);
  });

  it('resolves the local day in the challenge timezone', () => {
    expect(localDateInZone('2026-10-29T02:00:00Z', 'America/Sao_Paulo')).toBe('2026-10-28');
    expect(localDateInZone('2026-10-29T02:00:00Z', 'UTC')).toBe('2026-10-29');
    expect(localDateInZone('2026-10-29T02:00:00Z', 'Asia/Tokyo')).toBe('2026-10-29');
  });

  it('keeps civil dates stable when converting back', () => {
    expect(toIsoDate(new Date(Date.UTC(2026, 9, 28, 12)))).toBe('2026-10-28');
  });

  it('shifts month keys correctly', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(formatMonthLabel('2026-10')).toBe('Outubro de 2026');
  });

  it('creates an inclusive day range', () => {
    expect(eachDay('2026-10-27', '2026-10-30')).toEqual([
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
    ]);
  });

  it('formats countdowns with stable thresholds', () => {
    const now = new Date('2026-10-28T12:00:00Z').getTime();
    expect(formatCountdown('2026-10-28T12:00:30Z', now)).toBe('agora');
    expect(formatCountdown('2026-10-28T13:30:00Z', now)).toBe('1h 30min');
    expect(formatCountdown('2026-11-01T16:00:00Z', now)).toBe('4d 04h');
  });
});
