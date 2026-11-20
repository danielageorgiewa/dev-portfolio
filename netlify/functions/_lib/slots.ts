// Slot handling for the booking widget. Pure functions, no I/O.
//
// Cal.com owns the working hours, the slot length, the minimum notice and the busy times.
// What is left here: which dates to ask about, reading Cal.com's answer, and picking the
// first few upcoming slots.

export const TIME_ZONE = 'Europe/Sofia';
/** How many days ahead of today are offered. */
export const WINDOW_DAYS = 7;
export const MAX_SLOTS = 6;

const dateFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

const pad = (n: number) => String(n).padStart(2, '0');

/** The calendar date in Europe/Sofia at a given instant, as YYYY-MM-DD. */
export function sofiaDate(ms: number): string {
  const out: Record<string, number> = {};
  for (const part of dateFormat.formatToParts(new Date(ms))) {
    if (part.type !== 'literal') out[part.type] = Number(part.value);
  }
  return `${out.year}-${pad(out.month)}-${pad(out.day)}`;
}

/** A YYYY-MM-DD date moved by a number of days. Plain calendar arithmetic, no time zone. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export interface DateRange {
  /** First day, YYYY-MM-DD. */
  start: string;
  /** Last day, YYYY-MM-DD, included. */
  end: string;
}

/** The dates the site offers: today in Sofia and the seven days after it. */
export function slotWindow(now: number): DateRange {
  const start = sofiaDate(now);
  return { start, end: addDays(start, WINDOW_DAYS) };
}

/** The one-day range that holds a slot, for the check made just before booking. */
export function dayOf(start: number): DateRange {
  const date = sofiaDate(start);
  return { start: date, end: date };
}

/** True when a start time is in the future and on one of the dates in the window. */
export function inWindow(start: number, now: number): boolean {
  // ISO dates compare correctly as text.
  return start > now && sofiaDate(start) <= slotWindow(now).end;
}

/**
 * Reads Cal.com's answer to GET /v2/slots:
 *   { "status": "success", "data": { "2026-11-23": [{ "start": "2026-11-23T11:00:00.000+02:00" }, ...] } }
 * Returns every slot start as epoch milliseconds, in ascending order without duplicates, or
 * null when the answer does not have that shape. An entry that cannot be read is skipped.
 */
export function parseSlots(payload: unknown): number[] | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const { status, data } = payload as { status?: unknown; data?: unknown };
  if (status !== 'success' || typeof data !== 'object' || data === null || Array.isArray(data)) return null;

  const starts = new Set<number>();
  for (const day of Object.values(data as Record<string, unknown>)) {
    if (!Array.isArray(day)) return null;
    for (const entry of day) {
      // The reference describes a slot as a string and shows an object with "start".
      // The live API sends the object; both are read.
      const value =
        typeof entry === 'string' ? entry : typeof entry === 'object' && entry !== null ? (entry as { start?: unknown }).start : null;
      if (typeof value !== 'string' || value.length > 40) continue;
      const ms = Date.parse(value);
      if (Number.isFinite(ms)) starts.add(ms);
    }
  }
  return [...starts].sort((a, b) => a - b);
}

/** The first `limit` slots that have not started yet. Expects ascending order. */
export function upcoming(slots: readonly number[], now: number, limit = MAX_SLOTS): number[] {
  return slots.filter((start) => start > now).slice(0, limit);
}

export const toIso = (ms: number): string => new Date(ms).toISOString();
