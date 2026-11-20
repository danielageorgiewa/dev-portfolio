// Google Calendar over plain fetch: token refresh, free/busy, event list, event insert.
// Nothing here logs. Callers log a short code at most, never tokens or personal data.

import type { Interval } from './slots.ts';
import { isEmail } from './validate.ts';

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  calendarId: string;
  /**
   * Optional. The one fixed address Google emails about each new request. Never a visitor's
   * address: the site does not make Google write to anyone a visitor names.
   */
  notifyEmail: string | null;
}

export type Env = Record<string, string | undefined>;
export type Fetch = typeof fetch;

export class GoogleError extends Error {
  readonly step: string;
  readonly status: number;
  constructor(step: string, status: number) {
    super(`google ${step} failed with ${status}`);
    this.name = 'GoogleError';
    this.step = step;
    this.status = status;
  }
}

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const CALENDAR_URL = 'https://www.googleapis.com/calendar/v3';

// Netlify stops a function after 10 seconds. A booking makes up to four Google calls in three
// steps (token, then free/busy and the event list together, then the insert), so the worst
// case is 2500 + 2500 + 4000 = 9000 ms. The insert gets the longest share on purpose: it
// creates the Meet link and sends the invite, and giving up on it too early would report a
// failure for an event Google then goes on to create.
export const READ_TIMEOUT_MS = 2500;
export const INSERT_TIMEOUT_MS = 4000;

/** Per-call limits in milliseconds. Tests shorten them. */
export interface Timeouts {
  read: number;
  insert: number;
}
export const DEFAULT_TIMEOUTS: Timeouts = { read: READ_TIMEOUT_MS, insert: INSERT_TIMEOUT_MS };

/**
 * The four required variables must be set. Returns null otherwise, which callers treat as
 * "not configured". GOOGLE_NOTIFY_EMAIL is optional; a value that is not an email address is
 * ignored.
 */
export function readConfig(env: Env): GoogleConfig | null {
  const clientId = env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = env.GOOGLE_CLIENT_SECRET?.trim();
  const refreshToken = env.GOOGLE_REFRESH_TOKEN?.trim();
  const calendarId = env.GOOGLE_CALENDAR_ID?.trim();
  if (!clientId || !clientSecret || !refreshToken || !calendarId) return null;
  const notify = env.GOOGLE_NOTIFY_EMAIL?.trim() ?? '';
  return { clientId, clientSecret, refreshToken, calendarId, notifyEmail: isEmail(notify) ? notify : null };
}

// Access tokens last about an hour. A warm function instance reuses one until shortly before
// it expires; a cold start asks for a new one.
let cached: { key: string; token: string; expires: number } | null = null;

export function clearTokenCache(): void {
  cached = null;
}

export async function getAccessToken(
  cfg: GoogleConfig,
  fetchImpl: Fetch,
  now: number = Date.now(),
  timeoutMs: number = READ_TIMEOUT_MS,
): Promise<string> {
  const key = `${cfg.clientId}:${cfg.refreshToken}`;
  if (cached && cached.key === key && cached.expires > now) return cached.token;

  const res = await fetchImpl(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      refresh_token: cfg.refreshToken,
      grant_type: 'refresh_token',
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new GoogleError('token', res.status);
  const data = (await res.json()) as { access_token?: unknown; expires_in?: unknown };
  if (typeof data.access_token !== 'string') throw new GoogleError('token', 502);
  const lifetime = typeof data.expires_in === 'number' ? data.expires_in : 3600;
  cached = { key, token: data.access_token, expires: now + (lifetime - 60) * 1000 };
  return data.access_token;
}

/** Busy intervals on the calendar between two instants. */
export async function freeBusy(
  cfg: GoogleConfig,
  token: string,
  window: Interval,
  fetchImpl: Fetch,
  timeoutMs: number = READ_TIMEOUT_MS,
): Promise<Interval[]> {
  const res = await fetchImpl(`${CALENDAR_URL}/freeBusy`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      timeMin: new Date(window.start).toISOString(),
      timeMax: new Date(window.end).toISOString(),
      items: [{ id: cfg.calendarId }],
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new GoogleError('freebusy', res.status);
  const data = (await res.json()) as {
    calendars?: Record<string, { busy?: { start: string; end: string }[]; errors?: unknown[] }>;
  };
  const calendar = data.calendars?.[cfg.calendarId];
  // A wrong calendar id comes back as 200 with an errors array. Treat it as a failure:
  // reading it as "nothing busy" would offer slots that are not free.
  if (!calendar || (calendar.errors && calendar.errors.length > 0)) {
    throw new GoogleError('freebusy', 404);
  }
  const busy: Interval[] = [];
  for (const b of calendar.busy ?? []) {
    const start = Date.parse(b.start);
    const end = Date.parse(b.end);
    if (Number.isFinite(start) && Number.isFinite(end)) busy.push({ start, end });
  }
  return busy;
}

/** The marker on every event this site creates: extendedProperties.private.src. */
export const SITE_SOURCE = 'site';

/** One event the site created, as far as the caller asked to see it. */
export interface SiteEvent {
  id: string;
  cancelled: boolean;
  /** The three below are only filled when `detail` was asked for. */
  start: number | null;
  created: number | null;
  who: string | null;
}

const LIST_FIELDS = 'nextPageToken,items(id,status)';
const LIST_FIELDS_DETAIL =
  'nextPageToken,items(id,status,created,start/dateTime,extendedProperties/private/who)';
const LIST_MAX_PAGES = 5;

/**
 * Events on the calendar that this site created (tagged src=site) inside a window, deleted
 * ones included. Google keeps the id of a deleted event reserved, so a cancelled booking
 * still blocks its slot and has to be known about.
 *
 * `fields` keeps the answer to ids and statuses. With `detail` it adds the creation time,
 * the start and the hashed email, which the booking limits need. Titles, descriptions and
 * attendees are never requested. Works with the calendar.events scope.
 */
export async function listSiteEvents(
  cfg: GoogleConfig,
  token: string,
  window: Interval,
  fetchImpl: Fetch,
  options: { detail?: boolean; timeoutMs?: number } = {},
): Promise<SiteEvent[]> {
  // One time limit for the whole listing, however many pages it takes.
  const signal = AbortSignal.timeout(options.timeoutMs ?? READ_TIMEOUT_MS);
  const events: SiteEvent[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < LIST_MAX_PAGES; page++) {
    const params = new URLSearchParams({
      privateExtendedProperty: `src=${SITE_SOURCE}`,
      showDeleted: 'true',
      singleEvents: 'true',
      timeMin: new Date(window.start).toISOString(),
      timeMax: new Date(window.end).toISOString(),
      maxResults: '250',
      fields: options.detail ? LIST_FIELDS_DETAIL : LIST_FIELDS,
    });
    if (pageToken) params.set('pageToken', pageToken);
    const res = await fetchImpl(
      `${CALENDAR_URL}/calendars/${encodeURIComponent(cfg.calendarId)}/events?${params}`,
      { method: 'GET', headers: { authorization: `Bearer ${token}` }, signal },
    );
    if (!res.ok) throw new GoogleError('list', res.status);
    const data = (await res.json()) as {
      nextPageToken?: unknown;
      items?: {
        id?: unknown;
        status?: unknown;
        created?: unknown;
        start?: { dateTime?: unknown };
        extendedProperties?: { private?: { who?: unknown } };
      }[];
    };
    for (const item of data.items ?? []) {
      if (typeof item.id !== 'string') continue;
      const start = typeof item.start?.dateTime === 'string' ? Date.parse(item.start.dateTime) : NaN;
      const created = typeof item.created === 'string' ? Date.parse(item.created) : NaN;
      const who = item.extendedProperties?.private?.who;
      events.push({
        id: item.id,
        cancelled: item.status === 'cancelled',
        start: Number.isFinite(start) ? start : null,
        created: Number.isFinite(created) ? created : null,
        who: typeof who === 'string' ? who : null,
      });
    }
    // Google may return a short or empty page with a token even when little matches.
    if (typeof data.nextPageToken !== 'string' || data.nextPageToken === '') return events;
    pageToken = data.nextPageToken;
  }
  // More pages than a seven-day window of half-hour slots can explain. Fail closed.
  throw new GoogleError('list', 502);
}

export interface EventInput {
  /** Deterministic per slot (see slotEventId), so Google refuses a second event for it. */
  id: string;
  /** First 16 hex characters of the SHA-256 of the lowercased email. */
  who: string;
  summary: string;
  description: string;
  start: number;
  end: number;
  timeZone: string;
  /** The owner's own notification address from the configuration, or null. Nobody else. */
  notifyEmail: string | null;
  requestId: string;
}

/**
 * The exact JSON sent to events.insert. Exported so tests can assert on it.
 *
 * Zero relay: the visitor is never an attendee, so Google never emails an address a visitor
 * typed. Their details are in the description, and the event is tentative until the owner
 * opens it and adds the guest herself. The Meet link is created now so it is there when she does.
 */
export function eventBody(input: EventInput) {
  return {
    id: input.id,
    status: 'tentative',
    summary: input.summary,
    description: input.description,
    start: { dateTime: new Date(input.start).toISOString(), timeZone: input.timeZone },
    end: { dateTime: new Date(input.end).toISOString(), timeZone: input.timeZone },
    ...(input.notifyEmail ? { attendees: [{ email: input.notifyEmail }] } : {}),
    conferenceData: {
      createRequest: {
        requestId: input.requestId,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    guestsCanInviteOthers: false,
    guestsCanModify: false,
    reminders: { useDefault: true },
    extendedProperties: { private: { src: SITE_SOURCE, who: input.who } },
  };
}

export async function insertEvent(
  cfg: GoogleConfig,
  token: string,
  input: EventInput,
  fetchImpl: Fetch,
  timeoutMs: number = INSERT_TIMEOUT_MS,
): Promise<'created' | 'conflict'> {
  const url =
    `${CALENDAR_URL}/calendars/${encodeURIComponent(cfg.calendarId)}/events` +
    // An email goes out only when there is a notification address, and then only to it.
    `?conferenceDataVersion=1&sendUpdates=${input.notifyEmail ? 'all' : 'none'}`;
  const res = await fetchImpl(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(eventBody(input)),
    signal: AbortSignal.timeout(timeoutMs),
  });
  // 409: an event with this id exists already, live or deleted. The slot is gone.
  if (res.status === 409) return 'conflict';
  if (!res.ok) throw new GoogleError('insert', res.status);
  return 'created';
}
