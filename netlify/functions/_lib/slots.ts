// Slot generation for the booking widget. Pure functions, no I/O.
//
// Working hours are wall-clock times in Europe/Sofia, so the UTC start of "11:00" moves by an
// hour when Bulgaria changes between EET (UTC+2) and EEST (UTC+3). The conversion uses Intl
// only: no date library.

export const TIME_ZONE = 'Europe/Sofia';
export const SLOT_MINUTES = 30;
export const DAY_START_MINUTES = 11 * 60; // first slot starts 11:00
export const DAY_END_MINUTES = 16 * 60; // last slot starts 15:30 and ends 16:00
export const WINDOW_DAYS = 7;
/** A slot must start at least this far in the future to be offered. */
export const LEAD_MINUTES = 120;
export const MAX_SLOTS = 6;

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

export interface Interval {
  /** Epoch milliseconds, inclusive. */
  start: number;
  /** Epoch milliseconds, exclusive. */
  end: number;
}

const partsFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
});

interface WallClock {
  year: number;
  month: number; // 1 to 12
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/** The wall-clock reading in Europe/Sofia at a given instant. */
export function sofiaWallClock(ms: number): WallClock {
  const out: Record<string, number> = {};
  for (const part of partsFormat.formatToParts(new Date(ms))) {
    if (part.type !== 'literal') out[part.type] = Number(part.value);
  }
  return {
    year: out.year,
    month: out.month,
    day: out.day,
    hour: out.hour,
    minute: out.minute,
    second: out.second,
  };
}

/** Offset of Europe/Sofia from UTC at a given instant, in milliseconds (positive = ahead). */
function offsetAt(ms: number): number {
  const w = sofiaWallClock(ms);
  const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);
  return asUtc - Math.floor(ms / 1000) * 1000;
}

/**
 * The instant at which Europe/Sofia clocks show the given date and time.
 * Working hours never fall in the 03:00 to 04:00 changeover, so the result is unambiguous;
 * two passes settle the offset on days when the clocks change.
 */
export function sofiaTimeToUtc(year: number, month: number, day: number, minutes: number): number {
  const wall = Date.UTC(year, month - 1, day, 0, minutes);
  let utc = wall - offsetAt(wall);
  utc = wall - offsetAt(utc);
  return utc;
}

/**
 * Every bookable slot start, ignoring the calendar: Monday to Friday, 11:00 to 15:30
 * Europe/Sofia, from `now + lead` up to seven days from `now`, in ascending order.
 */
export function candidateSlots(now: number): number[] {
  const earliest = now + LEAD_MINUTES * MINUTE;
  const latest = now + WINDOW_DAYS * DAY;
  const today = sofiaWallClock(now);
  const slots: number[] = [];
  // Seven days from now can spill into an eighth calendar day, hence <=.
  for (let i = 0; i <= WINDOW_DAYS; i++) {
    // Calendar arithmetic in UTC: Date.UTC normalises day overflow, and the weekday of a
    // calendar date does not depend on the time zone.
    const date = new Date(Date.UTC(today.year, today.month - 1, today.day + i));
    const weekday = date.getUTCDay();
    if (weekday === 0 || weekday === 6) continue;
    for (let m = DAY_START_MINUTES; m + SLOT_MINUTES <= DAY_END_MINUTES; m += SLOT_MINUTES) {
      const start = sofiaTimeToUtc(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        m,
      );
      if (start >= earliest && start < latest) slots.push(start);
    }
  }
  return slots;
}

export const slotEnd = (start: number): number => start + SLOT_MINUTES * MINUTE;

export function overlaps(start: number, busy: readonly Interval[]): boolean {
  const end = slotEnd(start);
  return busy.some((b) => b.start < end && b.end > start);
}

/**
 * The Google Calendar event id for a slot. One slot, one id: Google refuses a second event
 * with the same id, which is what makes a booking atomic. Event ids may use the base32hex
 * alphabet (a to v, 0 to 9), 5 to 1024 characters; the prefix and toString(32) stay inside it.
 */
export const slotEventId = (start: number): string => `dgcall${Math.floor(start / MINUTE).toString(32)}`;

/**
 * The first `limit` candidates that do not touch a busy interval and whose event id is not
 * in `reserved` (ids Google already holds for a slot, including deleted events).
 */
export function freeSlots(
  candidates: readonly number[],
  busy: readonly Interval[],
  limit = MAX_SLOTS,
  reserved: ReadonlySet<string> = new Set(),
): number[] {
  const free: number[] = [];
  for (const start of candidates) {
    if (free.length >= limit) break;
    if (!overlaps(start, busy) && !reserved.has(slotEventId(start))) free.push(start);
  }
  return free;
}

/** The free/busy and event-list query window that covers every candidate slot. */
export function queryWindow(now: number): Interval {
  return { start: now, end: now + (WINDOW_DAYS + 1) * DAY };
}

export const toIso = (ms: number): string => new Date(ms).toISOString();
