// Cal.com API v2 over plain fetch: read the free slots, create a booking. No API key: both
// calls are the public ones Cal.com's own booking page makes for a public event type.
// Nothing here logs. Callers log a step name and a status code at most, never a request or
// response body.

import {
  CAL_API,
  CAL_BOOKINGS_VERSION,
  CAL_QUESTION_FIELD,
  CAL_SLOTS_VERSION,
  type CalConfig,
  type Fetch,
} from './config.ts';
import { type DateRange, TIME_ZONE, parseSlots } from './slots.ts';
import type { Booking } from './validate.ts';

export class CalError extends Error {
  readonly step: string;
  /** Cal.com's HTTP status, or 0 when there was no answer (network failure or time limit). */
  readonly status: number;
  constructor(step: string, status: number) {
    super(`cal ${step} failed with ${status}`);
    this.name = 'CalError';
    this.step = step;
    this.status = status;
  }
}

export function slotsUrl(cfg: CalConfig, range: DateRange): string {
  // The parameter is eventTypeSlug. Cal.com ignores an unknown name such as eventSlug.
  const query = new URLSearchParams({
    username: cfg.username,
    eventTypeSlug: cfg.eventSlug,
    start: range.start,
    end: range.end,
    timeZone: TIME_ZONE,
  });
  return `${CAL_API}/slots?${query}`;
}

/** Free slot starts between two dates (both included), epoch milliseconds, ascending. */
export async function fetchSlots(
  cfg: CalConfig,
  range: DateRange,
  fetchImpl: Fetch,
  timeoutMs: number,
): Promise<number[]> {
  let res: Response;
  try {
    res = await fetchImpl(slotsUrl(cfg, range), {
      headers: { accept: 'application/json', 'cal-api-version': CAL_SLOTS_VERSION },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new CalError('slots', 0);
  }
  if (!res.ok) {
    await res.body?.cancel().catch(() => {});
    throw new CalError('slots', res.status);
  }
  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    throw new CalError('slots', 502);
  }
  const slots = parseSlots(payload);
  // An answer in a shape this code does not know is a failure, not an empty calendar.
  if (slots === null) throw new CalError('slots', 502);
  return slots;
}

/** The JSON sent to POST /v2/bookings. */
export function bookingBody(cfg: CalConfig, booking: Booking) {
  return {
    start: new Date(booking.start).toISOString(),
    attendee: {
      name: booking.name,
      email: booking.email,
      timeZone: booking.timeZone,
      // Cal.com writes its emails to the attendee in this language. Both values are in its list.
      language: booking.lang,
    },
    username: cfg.username,
    eventTypeSlug: cfg.eventSlug,
    bookingFieldsResponses: { [CAL_QUESTION_FIELD]: booking.message },
  };
}

export type BookingOutcome = 'ok' | 'taken' | 'invalid' | 'rate_limited';

// Cal.com answers 400 both for a field it does not accept and for a time that cannot be
// booked, and its API reference lists neither. These are the messages its open source API
// (ErrorsBookingsService_2024_08_13) sends when the time is the problem: someone else has it,
// it is too soon or too far ahead, or it is in the past.
const TIME_GONE = /already has booking at this time|is not available|can't be booked at the "start" time|meeting in the past/i;

/** The human-readable part of a Cal.com error answer: { status: "error", error: { message, details } }. */
function errorMessage(text: string): string {
  try {
    const body = JSON.parse(text) as { message?: unknown; error?: { message?: unknown; details?: { message?: unknown } } };
    return [body.error?.message, body.error?.details?.message, body.message]
      .filter((m): m is string => typeof m === 'string')
      .join(' ');
  } catch {
    return '';
  }
}

/**
 * Creates the booking. Cal.com then emails the confirmation and the invite to the attendee
 * and to the owner. Throws CalError for anything that is not one of the four outcomes.
 */
export async function createBooking(
  cfg: CalConfig,
  booking: Booking,
  fetchImpl: Fetch,
  timeoutMs: number,
): Promise<BookingOutcome> {
  let res: Response;
  try {
    res = await fetchImpl(`${CAL_API}/bookings`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'cal-api-version': CAL_BOOKINGS_VERSION,
      },
      body: JSON.stringify(bookingBody(cfg, booking)),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new CalError('booking', 0);
  }
  if (res.ok) {
    // 201 with the booking in the body. Nothing in it is needed.
    await res.body?.cancel().catch(() => {});
    return 'ok';
  }
  if (res.status === 429) {
    await res.body?.cancel().catch(() => {});
    return 'rate_limited';
  }
  if (res.status === 409) {
    await res.body?.cancel().catch(() => {});
    return 'taken';
  }
  if (res.status === 400 || res.status === 422) {
    let text = '';
    try {
      text = (await res.text()).slice(0, 4000);
    } catch {
      // No readable body: treated as a refused field.
    }
    return TIME_GONE.test(errorMessage(text)) ? 'taken' : 'invalid';
  }
  await res.body?.cancel().catch(() => {});
  throw new CalError('booking', res.status);
}
