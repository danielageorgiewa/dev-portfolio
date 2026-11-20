// POST /api/book: puts a tentative call request on the calendar for a slot the visitor picked.
// The visitor is never a guest on the event, so Google never emails them from here.

import { createHash } from 'node:crypto';
import {
  DEFAULT_TIMEOUTS,
  GoogleError,
  type SiteEvent,
  freeBusy,
  getAccessToken,
  insertEvent,
  listSiteEvents,
  readConfig,
} from './google.ts';
import {
  type Deps,
  type FnContext,
  MemoryRateLimiter,
  defaultDeps,
  isAllowedOrigin,
  json,
} from './http.ts';
import { TIME_ZONE, candidateSlots, overlaps, queryWindow, slotEnd, slotEventId } from './slots.ts';
import { type Booking, MAX_BODY_BYTES, escapeHtml, stripAngles, validateBooking } from './validate.ts';

/** Most bookings made through the site that may be waiting in the calendar at one time. */
export const MAX_UPCOMING_BOOKINGS = 8;
/** Most bookings the site may create in any 24 hours, whoever asks. */
export const MAX_BOOKINGS_PER_DAY = 4;
/** Most upcoming bookings one email address may hold. */
export const MAX_UPCOMING_PER_EMAIL = 1;

const DAY_MS = 24 * 60 * 60_000;

export type Reason = 'taken' | 'invalid' | 'rate_limited' | 'unavailable';

const fail = (reason: Reason, status: number, headers?: Record<string, string>) =>
  json({ ok: false, reason }, status, headers);

// Second line of defence behind `config.rateLimit` in book.ts. See MemoryRateLimiter for
// what it can and cannot do.
export const limiter = new MemoryRateLimiter(5, 10 * 60_000);

/**
 * The words on the calendar event. Only the owner sees it at first: the visitor is not a
 * guest, so their name, email and message go in the notes as labelled lines. If she later
 * adds the visitor as a guest, they see the same text.
 * TODO(copy): English only for now. Bulgarian wording is Daniela's to supply.
 */
export function eventText(booking: Booking): { summary: string; description: string } {
  return {
    // The title is plain text everywhere Google shows it, so angle brackets are dropped.
    summary: `Call request: ${stripAngles(booking.name)}`,
    // Descriptions render HTML, so everything the visitor typed is escaped.
    description:
      `Name: ${escapeHtml(booking.name)}\n` +
      `Email: ${escapeHtml(booking.email)}\n` +
      `Message:\n${escapeHtml(booking.message)}\n\n` +
      '30-minute intro call, requested on danielageorgieva.work.',
  };
}

/** What goes on the event in place of the address: enough to count bookings per person. */
export function emailHash(email: string): string {
  return createHash('sha256').update(email.trim().toLowerCase(), 'utf8').digest('hex').slice(0, 16);
}

/**
 * True when one more booking would go over a limit. Counts the site's own events that are
 * not deleted and have not started yet. An event whose start cannot be read counts as
 * upcoming, so a surprise in Google's answer blocks bookings instead of waving them through.
 */
export function overLimit(events: readonly SiteEvent[], who: string, now: number): boolean {
  const upcoming = events.filter((e) => !e.cancelled && (e.start === null || e.start > now));
  if (upcoming.length >= MAX_UPCOMING_BOOKINGS) return true;
  const today = upcoming.filter((e) => e.created === null || e.created > now - DAY_MS);
  if (today.length >= MAX_BOOKINGS_PER_DAY) return true;
  return upcoming.filter((e) => e.who === who).length >= MAX_UPCOMING_PER_EMAIL;
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

  const cfg = readConfig(deps.env);
  if (!cfg) return fail('unavailable', 503);

  // Only a slot the availability function could offer right now: on the working-hours grid,
  // far enough ahead, inside the seven-day window.
  if (!candidateSlots(now).includes(booking.start)) return fail('taken', 409);

  const end = slotEnd(booking.start);
  const id = slotEventId(booking.start);
  const who = emailHash(booking.email);
  const timeouts = deps.timeouts ?? DEFAULT_TIMEOUTS;
  try {
    const token = await getAccessToken(cfg, deps.fetch, now, timeouts.read);
    // Two independent reads, side by side, immediately before writing: is this exact half
    // hour still free, and which events has the site already created in the booking window
    // (deleted ones included). If either fails or times out, nothing is written.
    const [busy, siteEvents] = await Promise.all([
      freeBusy(cfg, token, { start: booking.start, end }, deps.fetch, timeouts.read),
      listSiteEvents(cfg, token, queryWindow(now), deps.fetch, { detail: true, timeoutMs: timeouts.read }),
    ]);
    // Google never gives an event id out twice, not even after the event is deleted, so a
    // slot that was booked and then cancelled cannot be booked again through the site.
    if (siteEvents.some((e) => e.id === id)) return fail('taken', 409);
    if (overlaps(booking.start, busy)) return fail('taken', 409);
    // The page shows its "use the email link" message for this answer.
    if (overLimit(siteEvents, who, now)) return fail('unavailable', 503);

    // The id is fixed per slot. When two visitors submit the same slot in the same instant,
    // both pass the checks above, Google accepts one insert and answers 409 to the other.
    const outcome = await insertEvent(
      cfg,
      token,
      {
        id,
        who,
        ...eventText(booking),
        start: booking.start,
        end,
        timeZone: TIME_ZONE,
        notifyEmail: cfg.notifyEmail,
        requestId: deps.uuid(),
      },
      deps.fetch,
      timeouts.insert,
    );
    if (outcome === 'conflict') return fail('taken', 409);
    return json({ ok: true });
  } catch (err) {
    // Step and status only. Never the request body, the visitor's details or a token.
    if (err instanceof GoogleError) console.error('book: google', err.step, err.status);
    else console.error('book: request failed');
    return fail('unavailable', 503);
  }
}
