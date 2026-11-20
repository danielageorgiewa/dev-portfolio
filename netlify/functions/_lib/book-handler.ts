// POST /api/book: books the slot the visitor picked on Cal.com. Cal.com then emails the
// confirmation and the calendar invite to the visitor and to the owner.

import { createHash } from 'node:crypto';
import { CalError, createBooking, fetchSlots } from './cal.ts';
import { DEFAULT_TIMEOUTS, readCalConfig } from './config.ts';
import {
  type Deps,
  type FnContext,
  MemoryRateLimiter,
  defaultDeps,
  isAllowedOrigin,
  json,
} from './http.ts';
import { dayOf, inWindow } from './slots.ts';
import { MAX_BODY_BYTES, validateBooking } from './validate.ts';

export type Reason = 'taken' | 'invalid' | 'rate_limited' | 'unavailable';

const fail = (reason: Reason, status: number, headers?: Record<string, string>) =>
  json({ ok: false, reason }, status, headers);

// Second line of defence behind `config.rateLimit` in book.ts: five attempts per IP in ten
// minutes. See MemoryRateLimiter for what it can and cannot do.
export const limiter = new MemoryRateLimiter(5, 10 * 60_000);

/** Most bookings one email address may make in an hour. */
export const MAX_BOOKINGS_PER_EMAIL = 2;

// Cal.com emails a confirmation to whatever address the visitor typed, so the form could be
// used to send unwanted mail to a stranger. This caps how often one address can be the
// target: two bookings an hour.
// Honest limits: the count lives in the memory of one function instance. Netlify can run
// several instances at once and discards idle ones, so the real ceiling is higher than two
// and resets on a cold start. It slows down repeated mail to one address and nothing more.
// The limits that hold everywhere are the per-IP rule in book.ts and Cal.com's own.
export const emailLimiter = new MemoryRateLimiter(MAX_BOOKINGS_PER_EMAIL, 60 * 60_000);

/** The key the throttle counts under, so the address itself is not kept in memory. */
export function emailKey(email: string): string {
  return createHash('sha256').update(email.trim().toLowerCase(), 'utf8').digest('hex').slice(0, 16);
}

export async function handleBook(
  req: Request,
  context: FnContext = {},
  deps: Deps = defaultDeps(),
): Promise<Response> {
  if (req.method !== 'POST') return fail('invalid', 405, { allow: 'POST' });
  if (!isAllowedOrigin(req.headers.get('origin'), context, deps.env)) return fail('invalid', 403);

  const type = (req.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
  if (type !== 'application/json') return fail('invalid', 415);

  const declared = Number(req.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) return fail('invalid', 413);

  const now = deps.now();
  if (!limiter.allow(context.ip ?? 'unknown', now)) {
    return fail('rate_limited', 429, { 'retry-after': '600' });
  }

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return fail('invalid', 400);
  }
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return fail('invalid', 413);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fail('invalid', 400);
  }

  const result = validateBooking(parsed);
  if (!result.ok) return fail('invalid', 400);
  // A filled honeypot gets the answer a real booking gets, and nothing is created.
  if (result.honeypot) return json({ ok: true });
  const { booking } = result;

  // Only a time the availability function could list: in the future and inside the
  // seven-day window. Anything else is refused without asking Cal.com.
  if (!inWindow(booking.start, now)) return fail('taken', 409);

  const cfg = readCalConfig(deps.env);
  const timeouts = deps.timeouts ?? DEFAULT_TIMEOUTS;
  try {
    // Ask Cal.com for that day's free slots immediately before booking. The time must be
    // one of them: still free, and a real slot of the event type. If this read fails or
    // times out, nothing is booked.
    const free = await fetchSlots(cfg, dayOf(booking.start), deps.fetch, timeouts.slots);
    if (!free.includes(booking.start)) return fail('taken', 409);

    // Counted here, just before the one call that makes Cal.com send email.
    if (!emailLimiter.allow(emailKey(booking.email), now)) {
      return fail('rate_limited', 429, { 'retry-after': '3600' });
    }

    // When two visitors submit the same slot in the same instant, both pass the check
    // above. Cal.com accepts one booking and refuses the other.
    const outcome = await createBooking(cfg, booking, deps.fetch, timeouts.booking);
    if (outcome === 'ok') return json({ ok: true });
    if (outcome === 'taken') return fail('taken', 409);
    if (outcome === 'rate_limited') return fail('rate_limited', 429, { 'retry-after': '60' });
    // Cal.com refused a field this function had accepted. Status only in the log.
    console.error('book: cal booking refused');
    return fail('invalid', 400);
  } catch (err) {
    // Step and status only. Never the request body, the visitor's details or Cal.com's answer.
    if (err instanceof CalError) console.error('book: cal', err.step, err.status);
    else console.error('book: request failed');
    return fail('unavailable', 503);
  }
}
