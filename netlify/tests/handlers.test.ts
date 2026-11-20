import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { handleAvailability } from '../functions/_lib/availability-handler.ts';
import {
  MAX_BOOKINGS_PER_DAY,
  MAX_UPCOMING_BOOKINGS,
  MAX_UPCOMING_PER_EMAIL,
  emailHash,
  handleBook,
  limiter,
} from '../functions/_lib/book-handler.ts';
import { INSERT_TIMEOUT_MS, READ_TIMEOUT_MS, clearTokenCache } from '../functions/_lib/google.ts';
import { slotEventId } from '../functions/_lib/slots.ts';
import { type Deps, type FnContext, MemoryRateLimiter, isAllowedOrigin } from '../functions/_lib/http.ts';

// Saturday 21 Nov 2026, 08:00 in Sofia. The first candidate slot is Monday 11:00 (09:00 UTC).
const NOW = Date.parse('2026-11-21T06:00:00Z');
const SLOT = '2026-11-23T09:00:00.000Z';
const ORIGIN = 'https://danielageorgieva.work';
const CALENDAR = 'calendar@example.com';

const ENV = {
  GOOGLE_CLIENT_ID: 'client-id',
  GOOGLE_CLIENT_SECRET: 'client-secret',
  GOOGLE_REFRESH_TOKEN: 'refresh-token',
  GOOGLE_CALENDAR_ID: CALENDAR,
};
const CONTEXT: FnContext = { ip: '203.0.113.7', site: { name: 'example-site', url: ORIGIN } };

interface Call {
  url: string;
  method: string;
  headers: Headers;
  body: string;
}

/** An event as events.list returns it. The mock applies the `fields` filter like Google does not: tests assert on the request instead. */
interface ListedEvent {
  id: string;
  status?: string;
  created?: string;
  start?: { dateTime: string };
  extendedProperties?: { private: { who?: string } };
}

const EVENTS_URL = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR)}/events`;

/**
 * A stand-in for Google. Records every request and answers the four endpoints the code uses.
 * Like Google, it refuses a second insert with an id it has already seen with 409.
 */
function mockGoogle(
  options: {
    busy?: { start: string; end: string }[];
    insertStatus?: number;
    events?: ListedEvent[];
    /** Answers for successive events.list pages, to exercise paging. */
    pages?: { items?: ListedEvent[]; nextPageToken?: string }[];
    /** Endpoints that hang until the caller's time limit aborts them. */
    hang?: ('token' | 'freebusy' | 'list' | 'insert')[];
  } = {},
) {
  const calls: Call[] = [];
  const ids = new Set<string>();
  let page = 0;
  const hang = (name: 'token' | 'freebusy' | 'list' | 'insert', signal?: AbortSignal | null) =>
    options.hang?.includes(name)
      ? new Promise<Response>((_, reject) => {
          // AbortSignal.timeout does not keep the process alive on its own; this timer does.
          const keepAlive = setInterval(() => {}, 1000);
          signal?.addEventListener('abort', () => {
            clearInterval(keepAlive);
            reject(signal.reason);
          });
        })
      : null;
  const fetchImpl = (async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = String(input);
    const method = init.method ?? 'GET';
    const body = init.body instanceof URLSearchParams ? init.body.toString() : String(init.body ?? '');
    calls.push({ url, method, headers: new Headers(init.headers), body });
    assert.ok(init.signal instanceof AbortSignal, `no time limit on ${url}`);
    if (url === 'https://oauth2.googleapis.com/token') {
      return hang('token', init.signal) ?? Response.json({ access_token: 'access-token', expires_in: 3599 });
    }
    if (url === 'https://www.googleapis.com/calendar/v3/freeBusy') {
      return hang('freebusy', init.signal) ?? Response.json({ calendars: { [CALENDAR]: { busy: options.busy ?? [] } } });
    }
    if (url.startsWith(`${EVENTS_URL}?`) && method === 'GET') {
      const pending = hang('list', init.signal);
      if (pending) return pending;
      if (options.pages) return Response.json(options.pages[page++] ?? { items: [] });
      return Response.json({ items: options.events ?? [] });
    }
    if (url.startsWith(`${EVENTS_URL}?`) && method === 'POST') {
      const pending = hang('insert', init.signal);
      if (pending) return pending;
      if (options.insertStatus && options.insertStatus !== 200) {
        return Response.json({ error: {} }, { status: options.insertStatus });
      }
      const id = JSON.parse(body).id as string;
      if (ids.has(id)) return Response.json({ error: { code: 409 } }, { status: 409 });
      ids.add(id);
      return Response.json({ id });
    }
    return new Response('not found', { status: 404 });
  }) as typeof fetch;
  const inserts = () => calls.filter((c) => c.method === 'POST' && c.url.startsWith(`${EVENTS_URL}?`));
  const lists = () => calls.filter((c) => c.method === 'GET' && c.url.startsWith(`${EVENTS_URL}?`));
  return { calls, fetchImpl, inserts, lists };
}

const deps = (fetchImpl: typeof fetch, env: Record<string, string | undefined> = ENV): Deps => ({
  fetch: fetchImpl,
  now: () => NOW,
  env,
  uuid: () => 'request-id-1',
});

const BODY = {
  start: SLOT,
  name: 'Test Visitor',
  email: 'visitor@example.com',
  message: 'A booking system for a small studio.',
  hp_ref: '',
  lang: 'en',
};

function post(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('https://danielageorgieva.work/api/book', {
    method: 'POST',
    headers: { origin: ORIGIN, 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  limiter.reset();
  clearTokenCache();
});

// --- availability ---

test('availability: 503 configured:false when the env vars are missing, and Google is not called', async () => {
  const google = mockGoogle();
  for (const env of [{}, { ...ENV, GOOGLE_REFRESH_TOKEN: undefined }, { ...ENV, GOOGLE_CALENDAR_ID: ' ' }]) {
    const res = await handleAvailability(new Request('https://x.test/api/availability'), {}, deps(google.fetchImpl, env));
    assert.equal(res.status, 503);
    assert.deepEqual(await res.json(), { configured: false });
    assert.equal(res.headers.get('cache-control'), 'no-store');
  }
  assert.equal(google.calls.length, 0);
});

test('availability: returns the first six free starts as ISO UTC strings and nothing else', async () => {
  const google = mockGoogle({
    busy: [{ start: '2026-11-23T09:00:00Z', end: '2026-11-23T10:00:00Z' }],
  });
  const res = await handleAvailability(new Request('https://x.test/api/availability'), {}, deps(google.fetchImpl));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('cache-control'), 'public, max-age=60');
  assert.deepEqual(await res.json(), {
    slots: [
      '2026-11-23T10:00:00.000Z',
      '2026-11-23T10:30:00.000Z',
      '2026-11-23T11:00:00.000Z',
      '2026-11-23T11:30:00.000Z',
      '2026-11-23T12:00:00.000Z',
      '2026-11-23T12:30:00.000Z',
    ],
  });

  // The token first, then free/busy and the event list.
  assert.equal(google.calls.length, 3);
  const token = google.calls[0];
  const freeBusy = google.calls.find((c) => c.url.endsWith('/freeBusy'))!;
  assert.equal(token.url, 'https://oauth2.googleapis.com/token');
  assert.equal(new URLSearchParams(token.body).get('grant_type'), 'refresh_token');
  assert.equal(freeBusy.headers.get('authorization'), 'Bearer access-token');
  assert.deepEqual(JSON.parse(freeBusy.body).items, [{ id: CALENDAR }]);
});

test('availability: the event list asks only for ids and statuses of the site\'s own events, deleted ones included', async () => {
  const google = mockGoogle();
  await handleAvailability(new Request('https://x.test/api/availability'), {}, deps(google.fetchImpl));
  const [list] = google.lists();
  const url = new URL(list.url);
  assert.equal(url.pathname, `/calendar/v3/calendars/${encodeURIComponent(CALENDAR)}/events`);
  assert.equal(list.headers.get('authorization'), 'Bearer access-token');
  assert.equal(url.searchParams.get('privateExtendedProperty'), 'src=site');
  assert.equal(url.searchParams.get('showDeleted'), 'true');
  assert.equal(url.searchParams.get('singleEvents'), 'true');
  assert.equal(url.searchParams.get('fields'), 'nextPageToken,items(id,status)');
  assert.equal(url.searchParams.get('timeMin'), '2026-11-21T06:00:00.000Z');
  assert.equal(url.searchParams.get('timeMax'), '2026-11-29T06:00:00.000Z');
});

test('availability: a slot whose booking was cancelled is not offered again, and six are still returned', async () => {
  // Free/busy says the whole week is free. The 09:00 event was deleted, the 10:00 one is
  // live but marked as free time: Google holds both ids, so neither slot can be booked.
  const google = mockGoogle({
    events: [
      { id: slotEventId(Date.parse('2026-11-23T09:00:00Z')), status: 'cancelled' },
      { id: slotEventId(Date.parse('2026-11-23T10:00:00Z')), status: 'confirmed' },
      { id: 'someotherid', status: 'cancelled' },
    ],
  });
  const res = await handleAvailability(new Request('https://x.test/api/availability'), {}, deps(google.fetchImpl));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), {
    slots: [
      '2026-11-23T09:30:00.000Z',
      '2026-11-23T10:30:00.000Z',
      '2026-11-23T11:00:00.000Z',
      '2026-11-23T11:30:00.000Z',
      '2026-11-23T12:00:00.000Z',
      '2026-11-23T12:30:00.000Z',
    ],
  });
});

test('availability: the event list follows pages, and gives up when they do not end', async () => {
  const cancelled = { id: slotEventId(Date.parse('2026-11-23T09:00:00Z')), status: 'cancelled' };
  const google = mockGoogle({ pages: [{ items: [], nextPageToken: 'p2' }, { items: [cancelled] }] });
  const res = await handleAvailability(new Request('https://x.test/api/availability'), {}, deps(google.fetchImpl));
  assert.equal(((await res.json()) as { slots: string[] }).slots[0], '2026-11-23T09:30:00.000Z');
  assert.equal(google.lists().length, 2);
  assert.equal(new URL(google.lists()[1].url).searchParams.get('pageToken'), 'p2');

  clearTokenCache();
  const endless = mockGoogle({ pages: Array.from({ length: 20 }, () => ({ items: [], nextPageToken: 'more' })) });
  const failed = await handleAvailability(new Request('https://x.test/api/availability'), {}, deps(endless.fetchImpl));
  assert.equal(failed.status, 502);
  assert.equal(endless.lists().length, 5);
});

test('availability: any query string is a 400 and Google is not called', async () => {
  const google = mockGoogle();
  for (const query of ['?x=1', '?', '?cachebust=0.123', '?a&b']) {
    const res = await handleAvailability(new Request(`https://x.test/api/availability${query}`), {}, deps(google.fetchImpl));
    assert.equal(res.status, 400, query);
    assert.deepEqual(await res.json(), { ok: false });
    assert.equal(res.headers.get('cache-control'), 'no-store');
  }
  assert.equal(google.calls.length, 0);
});

test('availability: a failed event list or a timeout is a 502, never a list of slots', async () => {
  const listFails = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/token')) return Response.json({ access_token: 't', expires_in: 3599 });
    if (url.endsWith('/freeBusy')) return Response.json({ calendars: { [CALENDAR]: { busy: [] } } });
    return new Response('{}', { status: 403 });
  }) as typeof fetch;
  assert.equal((await handleAvailability(new Request('https://x.test/api/availability'), {}, deps(listFails))).status, 502);

  for (const step of ['token', 'freebusy', 'list'] as const) {
    clearTokenCache();
    const google = mockGoogle({ hang: [step] });
    const res = await handleAvailability(
      new Request('https://x.test/api/availability'),
      {},
      { ...deps(google.fetchImpl), timeouts: { read: 20, insert: 20 } },
    );
    assert.equal(res.status, 502, step);
  }
});

test('availability: a Google failure is a 502 with no detail', async () => {
  const failing = (async () => new Response('{"error":"invalid_grant"}', { status: 400 })) as typeof fetch;
  const res = await handleAvailability(new Request('https://x.test/api/availability'), {}, deps(failing));
  assert.equal(res.status, 502);
  assert.deepEqual(await res.json(), { ok: false });
  // Held briefly on the CDN so an outage is not hammered, never in the browser.
  assert.equal(res.headers.get('netlify-cdn-cache-control'), 'public, max-age=15');
  assert.equal(res.headers.get('cache-control'), 'no-store');
});

test('every function answer carries the locked-down response headers', async () => {
  const google = mockGoogle();
  const responses = [
    await handleAvailability(new Request('https://x.test/api/availability'), {}, deps(google.fetchImpl)),
    await handleAvailability(new Request('https://x.test/api/availability'), {}, deps(google.fetchImpl, {})),
    await handleBook(post(BODY), CONTEXT, deps(google.fetchImpl)),
    await handleBook(post({ ...BODY, email: 'bad' }), CONTEXT, deps(google.fetchImpl)),
    await handleBook(post(BODY, { origin: 'https://evil.example' }), CONTEXT, deps(google.fetchImpl)),
  ];
  assert.deepEqual(responses.map((r) => r.status), [200, 503, 200, 400, 403]);
  for (const res of responses) {
    assert.equal(res.headers.get('content-security-policy'), "default-src 'none'; frame-ancestors 'none'");
    assert.equal(res.headers.get('referrer-policy'), 'no-referrer');
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  }
});

test('availability: a calendar error inside a 200 response is a failure, not an empty calendar', async () => {
  const wrongId = (async (input: RequestInfo | URL) =>
    String(input).includes('/token')
      ? Response.json({ access_token: 't', expires_in: 3599 })
      : Response.json({ calendars: { [CALENDAR]: { errors: [{ reason: 'notFound' }], busy: [] } } })) as typeof fetch;
  const res = await handleAvailability(new Request('https://x.test/api/availability'), {}, deps(wrongId));
  assert.equal(res.status, 502);
});

test('availability: only GET', async () => {
  const res = await handleAvailability(new Request('https://x.test/api/availability', { method: 'POST' }), {}, deps(mockGoogle().fetchImpl));
  assert.equal(res.status, 405);
});

// --- book ---

test('book: happy path creates a tentative request with a Meet link and emails nobody', async () => {
  const google = mockGoogle();
  const res = await handleBook(post(BODY), CONTEXT, deps(google.fetchImpl));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });

  assert.equal(google.calls.length, 4);
  // The token comes first and the insert last, after both reads.
  assert.equal(google.calls[0].url, 'https://oauth2.googleapis.com/token');
  const freeBusy = google.calls.find((c) => c.url.endsWith('/freeBusy'))!;
  const insert = google.calls[3];
  assert.equal(google.inserts()[0], insert);

  // The site's own events are read too, with only what the limits need.
  const list = new URL(google.lists()[0].url);
  assert.equal(list.searchParams.get('privateExtendedProperty'), 'src=site');
  assert.equal(list.searchParams.get('showDeleted'), 'true');
  assert.equal(list.searchParams.get('singleEvents'), 'true');
  assert.equal(
    list.searchParams.get('fields'),
    'nextPageToken,items(id,status,created,start/dateTime,extendedProperties/private/who)',
  );

  // The exact half hour is checked right before the insert.
  assert.deepEqual(JSON.parse(freeBusy.body), {
    timeMin: '2026-11-23T09:00:00.000Z',
    timeMax: '2026-11-23T09:30:00.000Z',
    items: [{ id: CALENDAR }],
  });

  const url = new URL(insert.url);
  assert.equal(url.pathname, `/calendar/v3/calendars/${encodeURIComponent(CALENDAR)}/events`);
  assert.equal(url.searchParams.get('conferenceDataVersion'), '1');
  assert.equal(url.searchParams.get('sendUpdates'), 'none');
  assert.equal(insert.method, 'POST');
  assert.equal(insert.headers.get('authorization'), 'Bearer access-token');
  assert.deepEqual(JSON.parse(insert.body), {
    // "dgcall" and the slot's minute since the epoch (29923740) in base 32.
    id: 'dgcallsh6cs',
    status: 'tentative',
    summary: 'Call request: Test Visitor',
    description:
      'Name: Test Visitor\nEmail: visitor@example.com\nMessage:\nA booking system for a small studio.\n\n' +
      '30-minute intro call, requested on danielageorgieva.work.',
    start: { dateTime: '2026-11-23T09:00:00.000Z', timeZone: 'Europe/Sofia' },
    end: { dateTime: '2026-11-23T09:30:00.000Z', timeZone: 'Europe/Sofia' },
    conferenceData: {
      createRequest: { requestId: 'request-id-1', conferenceSolutionKey: { type: 'hangoutsMeet' } },
    },
    guestsCanInviteOthers: false,
    guestsCanModify: false,
    reminders: { useDefault: true },
    extendedProperties: { private: { src: 'site', who: emailHash('visitor@example.com') } },
  });
});

test('zero relay: the visitor is never an attendee, with or without a notification address', async () => {
  const visitor = 'visitor@example.com';
  for (const [env, attendees, sendUpdates] of [
    [ENV, undefined, 'none'],
    [{ ...ENV, GOOGLE_NOTIFY_EMAIL: ' owner@example.org ' }, [{ email: 'owner@example.org' }], 'all'],
    // A value that is not an address is ignored, not passed to Google.
    [{ ...ENV, GOOGLE_NOTIFY_EMAIL: 'not an address' }, undefined, 'none'],
    [{ ...ENV, GOOGLE_NOTIFY_EMAIL: '' }, undefined, 'none'],
  ] as const) {
    limiter.reset();
    const google = mockGoogle();
    const res = await handleBook(post(BODY), CONTEXT, deps(google.fetchImpl, env));
    assert.equal(res.status, 200);
    const [insert] = google.inserts();
    assert.equal(new URL(insert.url).searchParams.get('sendUpdates'), sendUpdates);
    assert.equal(new URL(insert.url).searchParams.get('conferenceDataVersion'), '1');

    const sent = JSON.parse(insert.body);
    assert.deepEqual(sent.attendees, attendees);
    assert.equal(sent.status, 'tentative');
    assert.ok(sent.conferenceData.createRequest.requestId);
    assert.ok(sent.description.includes(`Email: ${visitor}`));
    // The address appears in the description and nowhere else in what Google receives.
    const { description, ...rest } = sent;
    assert.ok(description.includes(visitor));
    assert.ok(!JSON.stringify(rest).includes(visitor));
    assert.ok(!insert.url.includes(visitor) && !insert.url.includes(encodeURIComponent(visitor)));
    for (const call of google.calls.filter((c) => c !== insert)) {
      assert.ok(!call.url.includes(visitor) && !call.body.includes(visitor));
    }
  }
});

test('book: the event id is fixed per slot and inside Google\'s id alphabet', () => {
  const start = Date.parse(SLOT);
  assert.equal(slotEventId(start), slotEventId(start));
  assert.notEqual(slotEventId(start), slotEventId(start + 30 * 60_000));
  // base32hex: a to v and 0 to 9, 5 to 1024 characters.
  for (const ms of [start, 0, Date.parse('2100-01-01T09:30:00Z')]) {
    assert.match(slotEventId(ms), /^[a-v0-9]{5,1024}$/);
  }
});

test('book: the email is stored as a short hash, the same for any letter case', () => {
  const who = emailHash('Visitor@Example.com');
  assert.match(who, /^[0-9a-f]{16}$/);
  assert.equal(who, emailHash('visitor@example.com'));
  assert.notEqual(who, emailHash('other@example.com'));
});

test('book: two visitors booking one slot at the same instant: exactly one gets it', async () => {
  // Both requests see a free calendar. The mock, like Google, takes the first insert of an
  // id and answers 409 to the second.
  const google = mockGoogle();
  const results = await Promise.all([
    handleBook(post(BODY), { ...CONTEXT, ip: '198.51.100.1' }, deps(google.fetchImpl)),
    handleBook(post({ ...BODY, name: 'Other Visitor', email: 'other@example.com' }), { ...CONTEXT, ip: '198.51.100.2' }, deps(google.fetchImpl)),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
  const loser = results.find((r) => r.status === 409)!;
  assert.deepEqual(await loser.json(), { ok: false, reason: 'taken' });
  const inserts = google.inserts();
  assert.equal(inserts.length, 2);
  assert.equal(JSON.parse(inserts[0].body).id, JSON.parse(inserts[1].body).id);
});

test('book: a 409 from the insert is "taken"', async () => {
  const google = mockGoogle({ insertStatus: 409 });
  const res = await handleBook(post(BODY), CONTEXT, deps(google.fetchImpl));
  assert.equal(res.status, 409);
  assert.deepEqual(await res.json(), { ok: false, reason: 'taken' });
});

test('book: a slot whose earlier booking was cancelled is taken, and no insert is tried', async () => {
  const google = mockGoogle({ events: [{ id: slotEventId(Date.parse(SLOT)), status: 'cancelled' }] });
  const res = await handleBook(post(BODY), CONTEXT, deps(google.fetchImpl));
  assert.equal(res.status, 409);
  assert.deepEqual(await res.json(), { ok: false, reason: 'taken' });
  assert.equal(google.inserts().length, 0);
});

// Existing site bookings for the limit tests: live, upcoming, on other slots.
const booked = (n: number, patch: Partial<ListedEvent> = {}): ListedEvent => {
  const start = Date.parse('2026-11-24T09:00:00Z') + n * 30 * 60_000;
  return {
    id: slotEventId(start),
    status: 'confirmed',
    created: '2026-11-18T10:00:00.000Z', // three days before NOW
    start: { dateTime: new Date(start).toISOString() },
    extendedProperties: { private: { who: `someone${n}` } },
    ...patch,
  };
};
const many = (count: number, patch: Partial<ListedEvent> = {}) => Array.from({ length: count }, (_, n) => booked(n, patch));

async function bookWith(events: ListedEvent[], body: object = BODY) {
  const google = mockGoogle({ events });
  const res = await handleBook(post(body), CONTEXT, deps(google.fetchImpl));
  return { status: res.status, body: await res.json(), inserts: google.inserts().length };
}
const REFUSED = { status: 503, body: { ok: false, reason: 'unavailable' }, inserts: 0 };
const BOOKED = { status: 200, body: { ok: true }, inserts: 1 };

test('book: the limits are 8 upcoming, 4 a day and 1 per email', () => {
  assert.deepEqual([MAX_UPCOMING_BOOKINGS, MAX_BOOKINGS_PER_DAY, MAX_UPCOMING_PER_EMAIL], [8, 4, 1]);
});

test('book: at most eight upcoming site bookings in total', async () => {
  assert.deepEqual(await bookWith(many(7)), BOOKED);
  limiter.reset();
  assert.deepEqual(await bookWith(many(8)), REFUSED);
  limiter.reset();
  // Deleted bookings and ones that have already started do not count.
  const past = { start: { dateTime: '2026-11-20T09:00:00.000Z' } };
  assert.deepEqual(await bookWith([...many(7), booked(20, { status: 'cancelled' }), booked(21, past)]), BOOKED);
});

test('book: at most four site bookings created in the last 24 hours', async () => {
  const recent = { created: '2026-11-20T12:00:00.000Z' }; // 18 hours before NOW
  assert.deepEqual(await bookWith(many(3, recent)), BOOKED);
  limiter.reset();
  assert.deepEqual(await bookWith(many(4, recent)), REFUSED);
  limiter.reset();
  // Just over 24 hours old no longer counts.
  assert.deepEqual(await bookWith(many(4, { created: '2026-11-20T05:59:00.000Z' })), BOOKED);
});

test('book: one upcoming booking per email address, whatever the letter case', async () => {
  const mine = booked(0, { extendedProperties: { private: { who: emailHash('visitor@example.com') } } });
  assert.deepEqual(await bookWith([mine]), REFUSED);
  limiter.reset();
  assert.deepEqual(await bookWith([mine], { ...BODY, email: 'VISITOR@example.com' }), REFUSED);
  limiter.reset();
  // Another person can still book, and so can the same person once the call is over or cancelled.
  assert.deepEqual(await bookWith([mine], { ...BODY, email: 'other@example.com' }), BOOKED);
  limiter.reset();
  assert.deepEqual(await bookWith([{ ...mine, status: 'cancelled' }]), BOOKED);
});

test('book: an event the limits cannot read counts against them', async () => {
  // No start and no creation time: treated as upcoming and as made today.
  const bare = (n: number): ListedEvent => ({ id: `bare${n}`, status: 'confirmed' });
  assert.deepEqual(await bookWith([bare(1), bare(2), bare(3), bare(4)]), REFUSED);
});

test('book: a Google call that times out before the insert is "unavailable" and nothing is created', async () => {
  for (const step of ['token', 'freebusy', 'list'] as const) {
    limiter.reset();
    clearTokenCache();
    const google = mockGoogle({ hang: [step] });
    const started = Date.now();
    const res = await handleBook(post(BODY), CONTEXT, { ...deps(google.fetchImpl), timeouts: { read: 20, insert: 20 } });
    assert.equal(res.status, 503, step);
    assert.deepEqual(await res.json(), { ok: false, reason: 'unavailable' });
    assert.equal(google.inserts().length, 0, step);
    assert.ok(Date.now() - started < 1000, `${step} was not cut short`);
  }
});

test('book: an insert that times out is "unavailable"', async () => {
  const google = mockGoogle({ hang: ['insert'] });
  const res = await handleBook(post(BODY), CONTEXT, { ...deps(google.fetchImpl), timeouts: { read: 20, insert: 20 } });
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { ok: false, reason: 'unavailable' });
});

test('book: free/busy and the event list run side by side, and the worst case fits in ten seconds', async () => {
  // Each read answers after 60 ms. One after the other would take 120 ms or more.
  const slow = mockGoogle();
  const delayed = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith('/freeBusy') || (init?.method === 'GET' && url.includes('/events?'))) {
      await new Promise((r) => setTimeout(r, 60));
    }
    return slow.fetchImpl(input, init);
  }) as typeof fetch;
  const started = Date.now();
  const res = await handleBook(post(BODY), CONTEXT, deps(delayed));
  assert.equal(res.status, 200);
  assert.ok(Date.now() - started < 110, 'the two reads ran one after the other');

  // Token, then the two reads together, then the insert.
  assert.equal(READ_TIMEOUT_MS, 2500);
  assert.ok(READ_TIMEOUT_MS + READ_TIMEOUT_MS + INSERT_TIMEOUT_MS < 10_000);
});

test('book: markup in the message never reaches Google as HTML, and markup in the name is refused', async () => {
  const google = mockGoogle();
  const res = await handleBook(
    post({ ...BODY, name: "Ann O'Hara\u0000", message: '<script>alert(1)</script>\u0007 & <a href="x">link</a>' }),
    CONTEXT,
    deps(google.fetchImpl),
  );
  assert.equal(res.status, 200);
  const sent = JSON.parse(google.inserts()[0].body);
  assert.equal(sent.summary, "Call request: Ann O'Hara");
  assert.equal(sent.attendees, undefined);
  assert.ok(sent.description.startsWith('Name: Ann O&#39;Hara\nEmail: visitor@example.com\nMessage:\n'));
  assert.ok(sent.description.includes('&lt;script&gt;alert(1)&lt;/script&gt; &amp; &lt;a href=&quot;x&quot;&gt;link&lt;/a&gt;'));
  assert.ok(!/[<>\u0000-\u0009\u000B-\u001F]/.test(sent.description));

  const refused = await handleBook(post({ ...BODY, name: '<b>Ann</b>' }), CONTEXT, deps(google.fetchImpl));
  assert.equal(refused.status, 400);
  assert.deepEqual(await refused.json(), { ok: false, reason: 'invalid' });
  assert.equal(google.inserts().length, 1);
});

test('book: links and invisible characters are refused as invalid, without asking Google', async () => {
  const google = mockGoogle();
  for (const patch of [
    { message: 'See https://evil.example for details' },
    { message: 'Visit www.evil.example today' },
    { name: 'www.evil.example' },
    { message: 'ht\u200Btps://evil.example' },
    { name: 'Ann\u200F Bee' },
  ]) {
    const res = await handleBook(post({ ...BODY, ...patch }), { ...CONTEXT, ip: JSON.stringify(patch) }, deps(google.fetchImpl));
    assert.equal(res.status, 400, JSON.stringify(patch));
    assert.deepEqual(await res.json(), { ok: false, reason: 'invalid' });
  }
  assert.equal(google.calls.length, 0);
});

test('book: a slot that became busy is reported as taken and nothing is created', async () => {
  const google = mockGoogle({ busy: [{ start: '2026-11-23T09:10:00Z', end: '2026-11-23T09:40:00Z' }] });
  const res = await handleBook(post(BODY), CONTEXT, deps(google.fetchImpl));
  assert.equal(res.status, 409);
  assert.deepEqual(await res.json(), { ok: false, reason: 'taken' });
  assert.equal(google.calls.length, 3);
  assert.equal(google.inserts().length, 0);
});

test('book: a start outside the offered grid is refused without asking Google', async () => {
  const google = mockGoogle();
  for (const start of [
    '2026-11-23T09:15:00.000Z', // not on the half hour grid
    '2026-11-23T14:00:00.000Z', // 16:00 in Sofia, after the last slot
    '2026-11-22T09:00:00.000Z', // Sunday
    '2026-11-21T07:00:00.000Z', // inside the lead time
    '2026-12-07T09:00:00.000Z', // beyond seven days
    '2025-11-24T09:00:00.000Z', // in the past
  ]) {
    const res = await handleBook(post({ ...BODY, start }), { ...CONTEXT, ip: start }, deps(google.fetchImpl));
    assert.equal(res.status, 409, start);
    assert.deepEqual(await res.json(), { ok: false, reason: 'taken' });
  }
  assert.equal(google.calls.length, 0);
});

test('book: a filled honeypot gets ok:true and nothing is created', async () => {
  const google = mockGoogle();
  const res = await handleBook(post({ ...BODY, hp_ref: 'Acme Ltd' }), CONTEXT, deps(google.fetchImpl));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(google.calls.length, 0);
});

test('book: the old "company" field is no longer a honeypot, so autofill cannot discard a booking', async () => {
  const google = mockGoogle();
  const res = await handleBook(post({ ...BODY, company: 'Acme Ltd' }), CONTEXT, deps(google.fetchImpl));
  assert.equal(res.status, 200);
  assert.equal(google.inserts().length, 1);
});

test('book: requests from another origin are refused', async () => {
  const google = mockGoogle();
  for (const origin of ['https://evil.example', 'https://danielageorgieva.work.evil.example', 'null', '']) {
    const res = await handleBook(post(BODY, { origin }), CONTEXT, deps(google.fetchImpl));
    assert.equal(res.status, 403, origin);
    assert.deepEqual(await res.json(), { ok: false, reason: 'invalid' });
  }
  const noOrigin = new Request('https://danielageorgieva.work/api/book', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(BODY),
  });
  assert.equal((await handleBook(noOrigin, CONTEXT, deps(google.fetchImpl))).status, 403);
  assert.equal(google.calls.length, 0);
});

test('origin check: production, netlify.app, deploy previews, and localhost only in dev', () => {
  const ctx: FnContext = { site: { name: 'example-site', url: 'https://danielageorgieva.work' } };
  const allowed = (origin: string, context = ctx, env = {}) => isAllowedOrigin(origin, context, env);
  assert.equal(allowed('https://danielageorgieva.work'), true);
  assert.equal(allowed('https://www.danielageorgieva.work'), true);
  assert.equal(allowed('https://example-site.netlify.app'), true);
  assert.equal(allowed('https://deploy-preview-12--example-site.netlify.app'), true);
  assert.equal(allowed('https://6740f0c1a2b3c4d5e6f7a8b9--example-site.netlify.app'), true);
  assert.equal(allowed('https://deploy-preview-12--other-site.netlify.app'), false);
  assert.equal(allowed('https://example-site.netlify.app.evil.example'), false);
  assert.equal(allowed('http://danielageorgieva.work'), false);
  assert.equal(allowed('http://localhost:8888'), false);
  assert.equal(allowed('http://localhost:8888', ctx, { NETLIFY_DEV: 'true' }), true);
  assert.equal(allowed('http://127.0.0.1:4321', { deploy: { context: 'dev' } }), true);
});

test('book: wrong method, content type and oversized bodies are refused', async () => {
  const google = mockGoogle();
  const d = deps(google.fetchImpl);

  const get = new Request('https://danielageorgieva.work/api/book', { headers: { origin: ORIGIN } });
  assert.equal((await handleBook(get, CONTEXT, d)).status, 405);

  const form = post('name=x', { 'content-type': 'application/x-www-form-urlencoded' });
  assert.equal((await handleBook(form, CONTEXT, d)).status, 415);
  const text = post(JSON.stringify(BODY), { 'content-type': 'text/plain' });
  assert.equal((await handleBook(text, CONTEXT, d)).status, 415);

  // Declared too large.
  const declared = post(BODY, { 'content-length': '20000' });
  assert.equal((await handleBook(declared, CONTEXT, d)).status, 413);
  // Actually too large, whatever the header says.
  const big = post(JSON.stringify({ ...BODY, padding: 'x'.repeat(12_000) }));
  assert.equal((await handleBook(big, CONTEXT, d)).status, 413);

  const broken = post('{"start":');
  const res = await handleBook(broken, CONTEXT, d);
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { ok: false, reason: 'invalid' });

  assert.equal(google.calls.length, 0);
});

test('book: invalid fields are refused without asking Google', async () => {
  const google = mockGoogle();
  for (const patch of [{ email: 'not-an-email' }, { name: '' }, { message: 'x'.repeat(1001) }, { start: 'monday' }]) {
    const res = await handleBook(post({ ...BODY, ...patch }), { ...CONTEXT, ip: JSON.stringify(patch) }, deps(google.fetchImpl));
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { ok: false, reason: 'invalid' });
  }
  assert.equal(google.calls.length, 0);
});

test('book: unavailable when not configured or when Google refuses the insert', async () => {
  const google = mockGoogle();
  const unconfigured = await handleBook(post(BODY), CONTEXT, deps(google.fetchImpl, {}));
  assert.equal(unconfigured.status, 503);
  assert.deepEqual(await unconfigured.json(), { ok: false, reason: 'unavailable' });
  assert.equal(google.calls.length, 0);

  const failing = mockGoogle({ insertStatus: 403 });
  const res = await handleBook(post(BODY), CONTEXT, deps(failing.fetchImpl));
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { ok: false, reason: 'unavailable' });
});

test('book: the sixth attempt from one IP inside ten minutes is rate limited', async () => {
  const google = mockGoogle();
  for (let i = 0; i < 5; i++) {
    const res = await handleBook(post({ ...BODY, email: 'bad' }), CONTEXT, deps(google.fetchImpl));
    assert.equal(res.status, 400);
  }
  const limited = await handleBook(post(BODY), CONTEXT, deps(google.fetchImpl));
  assert.equal(limited.status, 429);
  assert.deepEqual(await limited.json(), { ok: false, reason: 'rate_limited' });

  // Another visitor is not affected.
  const other = await handleBook(post(BODY), { ...CONTEXT, ip: '198.51.100.9' }, deps(google.fetchImpl));
  assert.equal(other.status, 200);
});

test('rate limiter: the window slides', () => {
  const rl = new MemoryRateLimiter(2, 1000);
  assert.equal(rl.allow('a', 0), true);
  assert.equal(rl.allow('a', 100), true);
  assert.equal(rl.allow('a', 200), false);
  assert.equal(rl.allow('b', 200), true);
  assert.equal(rl.allow('a', 1001), true);
});

test('nothing personal is logged, on success or on failure', async (t) => {
  const logged: string[] = [];
  for (const method of ['log', 'info', 'warn', 'error'] as const) {
    t.mock.method(console, method, (...args: unknown[]) => void logged.push(args.map(String).join(' ')));
  }
  await handleBook(post(BODY), CONTEXT, deps(mockGoogle().fetchImpl));
  await handleBook(post(BODY), CONTEXT, deps(mockGoogle({ insertStatus: 500 }).fetchImpl));
  const output = logged.join('\n');
  assert.ok(logged.length > 0);
  for (const secret of ['visitor@example.com', 'Test Visitor', 'small studio', 'access-token', 'refresh-token', 'client-secret', '203.0.113.7']) {
    assert.ok(!output.includes(secret), `log contains ${secret}`);
  }
});
