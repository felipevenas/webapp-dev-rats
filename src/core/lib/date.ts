export const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] as const;
export const WEEKDAY_LABELS_LONG = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
] as const;

/** Every new challenge and account uses Brasília time, regardless of the browser zone. */
export const DEFAULT_TIME_ZONE = 'America/Sao_Paulo';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Parses an ISO date (`2026-10-28`) as a civil date, never shifting the day. */
export function parseIsoDate(value: string): Date {
  if (DATE_ONLY.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 12));
  }
  return new Date(value);
}

export function toIsoDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function localDateInZone(instant: Date | string, timeZone: string): string {
  const date = typeof instant === 'string' ? new Date(instant) : instant;
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '01';
    return `${get('year')}-${get('month')}-${get('day')}`;
  } catch {
    return toIsoDate(date);
  }
}

export function todayInZone(timeZone: string): string {
  return localDateInZone(new Date(), timeZone);
}

export function addDays(isoDate: string, days: number): string {
  const date = parseIsoDate(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

export function diffInDays(fromIso: string, toIso: string): number {
  const from = parseIsoDate(fromIso).getTime();
  const to = parseIsoDate(toIso).getTime();
  return Math.round((to - from) / 86_400_000);
}

export function eachDay(fromIso: string, toIso: string): string[] {
  const days: string[] = [];
  let cursor = fromIso;
  let guard = 0;
  while (cursor <= toIso && guard < 800) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
    guard += 1;
  }
  return days;
}

export interface CalendarCell {
  date: string;
  day: number;
  inMonth: boolean;
}

/** Builds a 6x7 month grid starting on Sunday, for a `YYYY-MM` month key. */
export function monthGrid(monthKey: string): CalendarCell[] {
  const [year, month] = monthKey.split('-').map(Number);
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1, 12));
  const startOffset = firstOfMonth.getUTCDay();
  const start = new Date(firstOfMonth);
  start.setUTCDate(start.getUTCDate() - startOffset);

  const cells: CalendarCell[] = [];
  for (let index = 0; index < 42; index += 1) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    cells.push({
      date: toIsoDate(date),
      day: date.getUTCDate(),
      inMonth: date.getUTCMonth() === month - 1,
    });
  }
  return cells;
}

export function currentMonthKey(timeZone = 'UTC'): string {
  return todayInZone(timeZone).slice(0, 7);
}

export function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1, 12));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function firstDayOfMonth(monthKey: string): string {
  return `${monthKey}-01`;
}

export function lastDayOfMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month, 0, 12));
  return toIsoDate(date);
}

export function formatMonthLabel(monthKey: string): string {
  const date = parseIsoDate(firstDayOfMonth(monthKey));
  return capitalize(
    new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date),
  );
}

export function formatFullDate(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatShortDate(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' })
    .format(date)
    .replace('.', '');
}

export function formatDayAndMonth(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(date);
}

export function formatDateTime(instant: string, timeZone?: string): string {
  const date = new Date(instant);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  })
    .format(date)
    .replace('.', '');
}

export function formatTime(instant: string, timeZone?: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  }).format(new Date(instant));
}

export function formatWeekdayLong(isoDate: string): string {
  return WEEKDAY_LABELS_LONG[parseIsoDate(isoDate).getUTCDay()];
}

export function formatRelativeTime(instant: string): string {
  const diffSeconds = Math.round((new Date(instant).getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  const abs = Math.abs(diffSeconds);
  if (abs < 60) return formatter.format(Math.round(diffSeconds), 'second');
  if (abs < 3600) return formatter.format(Math.round(diffSeconds / 60), 'minute');
  if (abs < 86_400) return formatter.format(Math.round(diffSeconds / 3600), 'hour');
  if (abs < 2_592_000) return formatter.format(Math.round(diffSeconds / 86_400), 'day');
  return formatter.format(Math.round(diffSeconds / 2_592_000), 'month');
}

/** Human countdown such as `3d 04h`, `2h 10min`, `agora`. */
export function formatCountdown(targetIso: string, now = Date.now()): string {
  const diff = new Date(targetIso).getTime() - now;
  if (diff <= 60_000) return 'agora';
  const minutes = Math.floor(diff / 60_000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days}d ${String(hours).padStart(2, '0')}h`;
  if (hours > 0) return `${hours}h ${String(mins).padStart(2, '0')}min`;
  return `${mins}min`;
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function listTimeZones(): string[] {
  const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
  const supported = intl.supportedValuesOf?.('timeZone');
  if (supported?.length) return supported;
  return [
    'America/Sao_Paulo',
    'America/Bahia',
    'America/Manaus',
    'America/Belem',
    'America/Fortaleza',
    'America/Recife',
    'America/Cuiaba',
    'America/Porto_Velho',
    'America/Rio_Branco',
    'America/Noronha',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/Lisbon',
    'Europe/London',
    'Europe/Madrid',
    'Europe/Berlin',
    'UTC',
  ];
}

export function userTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';
  } catch {
    return 'America/Sao_Paulo';
  }
}

export function timeZoneLabel(timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('pt-BR', {
      timeZone,
      timeZoneName: 'shortOffset',
    }).formatToParts(new Date());
    const offset = parts.find((part) => part.type === 'timeZoneName')?.value;
    return offset ? `${timeZone.replace('_', ' ')} · ${offset}` : timeZone;
  } catch {
    return timeZone;
  }
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Converts a `datetime-local` value (interpreted in the browser zone) to ISO UTC. */
export function localInputToInstant(value: string): string {
  return new Date(value).toISOString();
}

/** Converts an ISO instant to the `datetime-local` value in the browser zone. */
export function instantToLocalInput(instant: string): string {
  const date = new Date(instant);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
