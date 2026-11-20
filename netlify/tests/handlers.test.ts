import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { handleAvailability } from '../functions/_lib/availability-handler.ts';
import { MAX_BOOKINGS_PER_EMAIL, emailLimiter, handleBook, limiter } from '../functions/_lib/book-handler.ts';
import { AVAILABILITY_TIMEOUT_MS, BOOKING_TIMEOUT_MS, SLOTS_TIMEOUT_MS } from '../functions/_lib/config.ts';
import { type Deps, type FnContext, MemoryRateLimiter, isAllowedOrigin } from '../functions/_lib/http.ts';

// Saturday 21 Nov 2026, 08:00 in Sofia. The first slot Cal.com offers is Monday 11:00 (09:00 UTC).
const NOW = Date.parse('2026-11-21T06:00:00Z');
const SLOT = '2026-11-23T09:00:00.000Z';
const ORIGIN = 'https://danielageorgieva.work';
const CONTEXT: FnContext = { ip: '203.0.113.7', site: { name: 'example-site', url: ORIGIN } };

const SLOTS_URL = 'https://api.cal.com/v2/slots';
const BOOKINGS_URL = 'https://api.cal.com/v2/bookings';
const slotsUrl = (start: string, end: string) =>
  `${SLOTS_URL}?username=daniela-georgieva-rajxiy&eventTypeSlug=30min&start=${start}&end=${end}&timeZone=Europe%2FSofia`;

interface Call {
  url: string;
  method: string;
  headers: Headers;
  body: string;
}

/** Ten half-hour slots from 11:00 to 15:30 Sofia time (UTC+2 in November), as Cal.com sends them. */
const calDay = (date: string) =>
  Array.from({ length: 10 }, (_, i) => ({
    start: `${date}T${String(11 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}:00.000+02:00`,
  }));

/** The live answer of GET /v2/slots for the week of NOW, copied in shape: weekdays only. */
const WEEK: Record<string, { start: string }[]> = {
  '2026-11-23': calDay('2026-11-23'),
  '2026-11-24': calDay('2026-11-24'),
  '2026-11-25': calDay('2026-11-25'),
  '2026-11-26': calDay('2026-11-26'),
  '2026-11-27': calDay('2026-11-27'),
};

/** A Cal.com error answer in the shape the live API uses. */
const calError = (status: number, code: string, message: string) =>
  Response.json(
    {
      status: 'error',
      timestamp: '2026-11-21T06:00:00.000Z',
      path: '/v2/bookings',
      error: { code, message, details: { message, error: code, statusCode: status } },
    },
    { status },
  );

/**
 * A stand-in for Cal.com. Records every request and answers the two endpoints the code uses.
 * Like Cal.com, it refuses a second booking of a start it has already booked, and stops
 * listing that start.
 */
function mockCal(
  options: {
    data?: Record<string, unknown>;
    slotsResponse?: () => Response;
    bookingResponse?: () => Response;
    /** Endpoints that hang until the caller's time limit aborts them. */
    hang?: ('slots' | 'booking')[];
  } = {},
) {
  const calls: Call[] = [];
  const booked = new Set<number>();
  const hang = (name: 'slots' | 'booking', signal?: AbortSignal | null) =>
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
    const body = String(init.body ?? '');
    calls.push({ url, method, headers: new Headers(init.headers), body });
    assert.ok(init.signal instanceof AbortSignal, `no time limit on ${url}`);
    if (url.startsWith(`${SLOTS_URL}?`) && method === 'GET') {
      const pending = hang('slots', init.signal);
      if (pending) return pending;
      if (options.slotsResponse) return options.slotsResponse();
      const query = new URL(url).searchParams;
      const from = query.get('start') ?? '';
      const to = query.get('end') ?? '';
      const data: Record<string, unknown> = {};
      for (const [date, slots] of Object.entries(options.data ?? WEEK)) {
        if (date < from || date > to) continue;
        const free = Array.isArray(slots)
          ? slots.filter((s) => !booked.has(Date.parse((s as { start: string }).start)))
          : slots;
        if (!Array.isArray(free) || free.length > 0) data[date] = free;
      }
      return Response.json({ data, status: 'success' });
    }
    if (url === BOOKINGS_URL && method === 'POST') {
      const pending = hang('booking', init.signal);
      if (pending) return pending;
      if (options.bookingResponse) return options.bookingResponse();
      const start = Date.parse(JSON.parse(body).start);
      if (booked.has(start)) {
        return calError(400, 'BadRequestException', 'User either already has booking at this time or is not available');
      }
      booked.add(start);
      return Response.json({ status: 'success', data: { id: 1, uid: 'booking-uid', status: 'accepted' } }, { status: 201 });
    }
    return new Response('not found', { status: 404 });
  }) as typeof fetch;
  const slotReads = () => calls.filter((c) => c.url.startsWith(`${SLOTS_URL}?`));
  const bookings = () => calls.filter((c) => c.url === BOOKINGS_URL);
  return { calls, fetchImpl, slotReads, bookings };
}

const deps = (fetchImpl: typeof fetch, env: Record<string, string | undefined> = {}, now = NOW): Deps => ({
  fetch: fetchImpl,
  now: () => now,
  env,
});

const BODY = {
  start: SLOT,
  name: 'Test Visitor',
  email: 'visitor@example.com',
  message: 'A booking system for a small studio.',
  hp_ref: '',
  lang: 'en',
  timeZone: 'Europe/London',
};

function post(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('https://danielageorgieva.work/api/book', {
    method: 'POST',
    headers: { origin: ORIGIN, 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const get = (url = 'https://danielageorgieva.work/api/availability') => new Request(url);

beforeEach(() => {
  limiter.reset();
  emailLimiter.reset();
});

// --- availability -------------------------------------------------------------------------

test('availability: asks Cal.com for today plus seven days in Sofia, with the version header and no key', async () => {
  const cal = mockCal();
  const res = await handleAvailability(get(), {}, deps(cal.fetchImpl));
  assert.equal(res.status, 200);
  assert.equal(cal.calls.length, 1);
  const [call] = cal.calls;
  assert.equal(call.url, slotsUrl('2026-11-21', '2026-11-28'));
  assert.equal(call.method, 'GET');
  assert.equal(call.headers.get('cal-api-version'), '2024-09-04');
  assert.equal(call.headers.get('authorization'), null);
  assert.equal(call.body, '');
});

test('availability: returns the first six free starts as ISO UTC strings and nothing else', async () => {
  const cal = mockCal();
  const res = await handleAvailability(get(), {}, deps(cal.fetchImpl));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('cache-control'), 'public, max-age=60');
  assert.equal(res.headers.get('netlify-cdn-cache-control'), 'public, max-age=60');
  assert.deepEqual(await res.json(), {
    slots: [
      '2026-11-23T09:00:00.000Z',
      '2026-11-23T09:30:00.000Z',
      '2026-11-23T10:00:00.000Z',
      '2026-11-23T10:30:00.000Z',
      '2026-11-23T11:00:00.000Z',
      '2026-11-23T11:30:00.000Z',
    ],
  });
});

test('availability: days and slots that arrive out of order are sorted, and started slots are dropped', async () => {
  const cal = mockCal({
    data: {
      '2026-11-24': [{ start: '2026-11-24T11:30:00.000+02:00' }, { start: '2026-11-24T11:00:00.000+02:00' }],
      '2026-11-23': [...calDay('2026-11-23')].reverse(),
    },
  });
  // Monday 15:10 in Sofia: only the 15:30 slot of that day is still ahead.
  const res = await handleAvailability(get(), {}, deps(cal.fetchImpl, {}, Date.parse('2026-11-23T13:10:00Z')));
  assert.deepEqual(await res.json(), {
    slots: ['2026-11-23T13:30:00.000Z', '2026-11-24T09:00:00.000Z', '2026-11-24T09:30:00.000Z'],
  });
});

test('availability: an empty calendar is an empty list, not a failure', async () => {
  const cal = mockCal({ data: {} });
  const res = await handleAvailability(get(), {}, deps(cal.fetchImpl));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { slots: [] });
});

test('availability: works with no environment variables at all, and never answers "not configured"', async () => {
  const cal = mockCal();
  const res = await handleAvailability(get(), {}, deps(cal.fetchImpl, {}));
  assert.equal(res.status, 200);
  assert.equal('configured' in ((await res.json()) as object), false);
});

test('availability: CAL_USERNAME and CAL_EVENT_SLUG replace the built-in account and event type', async () => {
  const cal = mockCal();
  await handleAvailability(get(), {}, deps(cal.fetchImpl, { CAL_USERNAME: 'someone-else', CAL_EVENT_SLUG: 'intro' }));
  const query = new URL(cal.calls[0].url).searchParams;
  assert.equal(query.get('username'), 'someone-else');
  assert.equal(query.get('eventTypeSlug'), 'intro');
});

test('availability: any query string is a 400 and Cal.com is not called', async () => {
  const cal = mockCal();
  for (const url of [
    'https://danielageorgieva.work/api/availability?x=1',
    'https://danielageorgieva.work/api/availability?',
    'https://danielageorgieva.work/api/availability?start=2026-01-01&username=other',
  ]) {
    const res = await handleAvailability(get(url), {}, deps(cal.fetchImpl));
    assert.equal(res.status, 400, url);
    assert.deepEqual(await res.json(), { ok: false });
  }
  assert.equal(cal.calls.length, 0);
});

test('availability: a Cal.com failure is a 502 with no detail, held briefly on the CDN only', async (t) => {
  const errors = t.mock.method(console, 'error', () => {});
  for (const slotsResponse of [
    () => calError(404, 'NotFoundException', 'Event Type not found'),
    () => calError(500, 'InternalServerErrorException', 'boom'),
    () => new Response('rate limited', { status: 429 }),
    () => new Response('<html>not json</html>', { status: 200 }),
    () => Response.json({ status: 'error', data: {} }),
    () => Response.json({ status: 'success', data: { '2026-11-23': 'none' } }),
  ]) {
    const cal = mockCal({ slotsResponse });
    const res = await handleAvailability(get(), {}, deps(cal.fetchImpl));
    assert.equal(res.status, 502);
    assert.deepEqual(await res.json(), { ok: false });
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.equal(res.headers.get('netlify-cdn-cache-control'), 'public, max-age=15');
  }
  // The log names the step and the status, and nothing from Cal.com's answer.
  const logged = errors.mock.calls.map((c) => c.arguments.join(' '));
  assert.equal(logged[0], 'availability: cal slots 404');
  assert.ok(logged.every((line) => /^availability: cal slots \d+$/.test(line)), logged.join('\n'));
});

test('availability: a Cal.com call that hangs is cut off and answered with a 502', async (t) => {
  t.mock.method(console, 'error', () => {});
  const cal = mockCal({ hang: ['slots'] });
  const began = Date.now();
  const res = await handleAvailability(get(), {}, {
    ...deps(cal.fetchImpl),
    timeouts: { availability: 40, slots: 40, booking: 40 },
  });
  assert.equal(res.status, 502);
  assert.ok(Date.now() - began < 1000);
  // The page gives up after five seconds, so the function must give up sooner.
  assert.ok(AVAILABILITY_TIMEOUT_MS < 5000);
});

test('every function answer carries the locked-down response headers', async () => {
  const cal = mockCal();
  const answers = [
    await handleAvailability(get(), {}, deps(cal.fetchImpl)),
    await handleAvailability(get('https://danielageorgieva.work/api/availability?x'), {}, deps(cal.fetchImpl)),
    await handleBook(post(BODY), CONTEXT, deps(cal.fetchImpl)),
    await handleBook(post(BODY, { origin: 'https://evil.example' }), CONTEXT, deps(cal.fetchImpl)),
  ];
  for (const res of answers) {
    assert.equal(res.headers.get('content-type'), 'application/json; charset=utf-8');
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('content-security-policy'), "default-src 'none'; frame-ancestors 'none'");
    assert.equal(res.headers.get('referrer-policy'), 'no-referrer');
  }
});

test('availability: only GET', async () => {
  const cal = mockCal();
  const res = await handleAvailability(
    new Request('https://danielageorgieva.work/api/availability', { method: 'POST' }),
    {},
    deps(cal.fetchImpl),
  );
  assert.equal(res.status, 405);
  assert.equal(cal.calls.length, 0);
});

// --- book ---------------------------------------------------------------------------------

test('book: happy path checks the day on Cal.com, then sends exactly one booking', async () => {
  const cal = mockCal();
  const res = await handleBook(post(BODY), CONTEXT, deps(cal.fetchImpl));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(res.headers.get('cache-control'), 'no-store');

  assert.equal(cal.calls.length, 2);
  const [check, booking] = cal.calls;

  // 1. The slots of that one day, read just before booking.
  assert.equal(check.method, 'GET');
  assert.equal(check.url, slotsUrl('2026-11-23', '2026-11-23'));
  assert.equal(check.headers.get('cal-api-version'), '2024-09-04');

  // 2. The booking itself.
  assert.equal(booking.method, 'POST');
  assert.equal(booking.url, 'https://api.cal.com/v2/bookings');
  assert.deepEqual(Object.fromEntries(booking.headers), {
    accept: 'application/json',
    'cal-api-version': '2026-02-25',
    'content-type': 'application/json',
  });
  assert.deepEqual(JSON.parse(booking.body), {
    start: '2026-11-23T09:00:00.000Z',
    attendee: {
      name: 'Test Visitor',
      email: 'visitor@example.com',
      timeZone: 'Europe/London',
      language: 'en',
    },
    username: 'daniela-georgieva-rajxiy',
    eventTypeSlug: '30min',
    bookingFieldsResponses: { building: 'A booking system for a small studio.' },
  });
});

test('book: Bulgarian visitors get Bulgarian emails, and a missing time zone becomes Europe/Sofia', async () => {
  const cal = mockCal();
  const { timeZone: _omit, ...withoutZone } = BODY;
  const res = await handleBook(
    post({ ...withoutZone, lang: 'bg', name: 'Мария Иванова', message: 'Сайт за малко студио.' }),
    CONTEXT,
    deps(cal.fetchImpl),
  );
  assert.equal(res.status, 200);
  const sent = JSON.parse(cal.bookings()[0].body);
  assert.deepEqual(sent.attendee, {
    name: 'Мария Иванова',
    email: 'visitor@example.com',
    timeZone: 'Europe/Sofia',
    language: 'bg',
  });
  assert.deepEqual(sent.bookingFieldsResponses, { building: 'Сайт за малко студио.' });
});

test('book: the message is sent cleaned, and a start without milliseconds is sent in full', async () => {
  const cal = mockCal();
  const res = await handleBook(
    post({ ...BODY, start: '2026-11-23T09:00:00Z', message: '  A shop.\r\n\r\n\r\n\r\nWith <b>search</b>\u0007 ' }),
    CONTEXT,
    deps(cal.fetchImpl),
  );
  assert.equal(res.status, 200);
  const sent = JSON.parse(cal.bookings()[0].body);
  assert.equal(sent.start, '2026-11-23T09:00:00.000Z');
  assert.equal(sent.bookingFieldsResponses.building, 'A shop.\n\nWith <b>search</b>');
});

test('book: a malformed time zone is invalid and Cal.com is not called', async () => {
  const cal = mockCal();
  for (const timeZone of ['Europe/Sofia&username=x', 7, '../etc', 'x'.repeat(65)]) {
    const res = await handleBook(post({ ...BODY, timeZone }), CONTEXT, deps(cal.fetchImpl));
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { ok: false, reason: 'invalid' });
    limiter.reset();
  }
  assert.equal(cal.calls.length, 0);
});

test('book: a slot Cal.com no longer lists is "taken" and no booking is sent', async () => {
  const withoutFirst = { ...WEEK, '2026-11-23': calDay('2026-11-23').slice(1) };
  const cal = mockCal({ data: withoutFirst });
  const res = await handleBook(post(BODY), CONTEXT, deps(cal.fetchImpl));
  assert.equal(res.status, 409);
  assert.deepEqual(await res.json(), { ok: false, reason: 'taken' });
  assert.equal(cal.slotReads().length, 1);
  assert.equal(cal.bookings().length, 0);
});

test('book: a time that is not one of the event type\'s slots is "taken"', async () => {
  const cal = mockCal();
  // 11:15 Sofia time is inside working hours but not on the half-hour grid; 18:00 is outside them.
  for (const start of ['2026-11-23T09:15:00.000Z', '2026-11-23T16:00:00.000Z', '2026-11-22T09:00:00.000Z']) {
    const res = await handleBook(post({ ...BODY, start }), CONTEXT, deps(cal.fetchImpl));
    assert.equal(res.status, 409, start);
    assert.deepEqual(await res.json(), { ok: false, reason: 'taken' });
    limiter.reset();
  }
  assert.equal(cal.bookings().length, 0);
});

test('book: a start in the past or beyond the seven-day window is refused without asking Cal.com', async () => {
  const cal = mockCal({ data: { ...WEEK, '2026-12-07': calDay('2026-12-07'), '2026-11-20': calDay('2026-11-20') } });
  for (const start of ['2026-11-20T09:00:00.000Z', '2026-11-21T06:00:00.000Z', '2026-12-07T09:00:00.000Z']) {
    const res = await handleBook(post({ ...BODY, start }), CONTEXT, deps(cal.fetchImpl));
    assert.equal(res.status, 409, start);
    assert.deepEqual(await res.json(), { ok: false, reason: 'taken' });
    limiter.reset();
  }
  assert.equal(cal.calls.length, 0);
});

test('book: two visitors booking one slot at the same instant: exactly one gets it', async () => {
  const cal = mockCal();
  const other = { ...BODY, email: 'second@example.com' };
  const [a, b] = await Promise.all([
    handleBook(post(BODY), CONTEXT, deps(cal.fetchImpl)),
    handleBook(post(other), { ...CONTEXT, ip: '203.0.113.8' }, deps(cal.fetchImpl)),
  ]);
  const statuses = [a.status, b.status].sort();
  assert.deepEqual(statuses, [200, 409]);
  const loser = a.status === 409 ? a : b;
  assert.deepEqual(await loser.json(), { ok: false, reason: 'taken' });
  assert.equal(cal.bookings().length, 2);
});

test('book: Cal.com\'s 400 answers about the time are "taken"', async () => {
  for (const message of [
    'User either already has booking at this time or is not available',
    'One of the hosts either already has booking at this time or is not available',
    `The event type can't be booked at the "start" time provided. This could be because it's too soon (violating the minimum booking notice) or too far in the future (outside the event's scheduling window). Try fetching available slots first using the GET /v2/slots endpoint and then make a booking with "start" time equal to one of the available slots.`,
    'Attempting to book a meeting in the past.',
  ]) {
    const cal = mockCal({ bookingResponse: () => calError(400, 'BadRequestException', message) });
    const res = await handleBook(post(BODY), CONTEXT, deps(cal.fetchImpl));
    assert.equal(res.status, 409, message);
    assert.deepEqual(await res.json(), { ok: false, reason: 'taken' });
    limiter.reset();
    emailLimiter.reset();
  }
  const conflict = mockCal({ bookingResponse: () => calError(409, 'ConflictException', 'Conflict') });
  const res = await handleBook(post(BODY), CONTEXT, deps(conflict.fetchImpl));
  assert.equal(res.status, 409);
});

test('book: any other 400 from Cal.com is "invalid", and its words never reach the visitor', async (t) => {
  const errors = t.mock.method(console, 'error', () => {});
  for (const bookingResponse of [
    () => calError(400, 'BadRequestException', 'responses - {building}error_required_field'),
    () => calError(400, 'BadRequestException', 'attendee.email must be an email'),
    () => calError(422, 'UnprocessableEntityException', 'Unprocessable'),
    () => new Response('<html>bad request</html>', { status: 400 }),
  ]) {
    const cal = mockCal({ bookingResponse });
    const res = await handleBook(post(BODY), CONTEXT, deps(cal.fetchImpl));
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { ok: false, reason: 'invalid' });
    limiter.reset();
    emailLimiter.reset();
  }
  const logged = errors.mock.calls.map((c) => c.arguments.join(' ')).join('\n');
  assert.ok(!/building|required|email must/.test(logged), logged);
});

test('book: a 429 from Cal.com is "rate_limited"', async () => {
  const cal = mockCal({ bookingResponse: () => new Response('Too Many Requests', { status: 429 }) });
  const res = await handleBook(post(BODY), CONTEXT, deps(cal.fetchImpl));
  assert.equal(res.status, 429);
  assert.deepEqual(await res.json(), { ok: false, reason: 'rate_limited' });
  assert.ok(res.headers.get('retry-after'));
});

test('book: anything else from Cal.com is "unavailable"', async (t) => {
  const errors = t.mock.method(console, 'error', () => {});
  for (const status of [401, 403, 404, 500, 502, 503]) {
    const cal = mockCal({ bookingResponse: () => calError(status, 'Exception', 'details that stay upstream') });
    const res = await handleBook(post(BODY), CONTEXT, deps(cal.fetchImpl));
    assert.equal(res.status, 503, String(status));
    assert.deepEqual(await res.json(), { ok: false, reason: 'unavailable' });
    limiter.reset();
    emailLimiter.reset();
  }
  assert.deepEqual(
    errors.mock.calls.map((c) => c.arguments.join(' ')),
    [401, 403, 404, 500, 502, 503].map((s) => `book: cal booking ${s}`),
  );
});

test('book: a failed or unreadable slots check is "unavailable" and nothing is booked', async (t) => {
  t.mock.method(console, 'error', () => {});
  for (const slotsResponse of [
    () => calError(500, 'InternalServerErrorException', 'boom'),
    () => new Response('rate limited', { status: 429 }),
    () => Response.json({ status: 'success', data: null }),
  ]) {
    const cal = mockCal({ slotsResponse });
    const res = await handleBook(post(BODY), CONTEXT, deps(cal.fetchImpl));
    assert.equal(res.status, 503);
    assert.deepEqual(await res.json(), { ok: false, reason: 'unavailable' });
    assert.equal(cal.bookings().length, 0);
    limiter.reset();
  }
});

test('book: a slots check that times out is "unavailable" and nothing is booked', async (t) => {
  const errors = t.mock.method(console, 'error', () => {});
  const cal = mockCal({ hang: ['slots'] });
  const res = await handleBook(post(BODY), CONTEXT, {
    ...deps(cal.fetchImpl),
    timeouts: { availability: 40, slots: 40, booking: 40 },
  });
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { ok: false, reason: 'unavailable' });
  assert.equal(cal.bookings().length, 0);
  assert.deepEqual(errors.mock.calls[0].arguments, ['book: cal', 'slots', 0]);
});

test('book: a booking call that times out is "unavailable"', async (t) => {
  const errors = t.mock.method(console, 'error', () => {});
  const cal = mockCal({ hang: ['booking'] });
  const began = Date.now();
  const res = await handleBook(post(BODY), CONTEXT, {
    ...deps(cal.fetchImpl),
    timeouts: { availability: 40, slots: 40, booking: 60 },
  });
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { ok: false, reason: 'unavailable' });
  assert.ok(Date.now() - began < 1000);
  assert.deepEqual(errors.mock.calls[0].arguments, ['book: cal', 'booking', 0]);
});

test('book: the two Cal.com calls together fit inside Netlify\'s ten seconds', () => {
  assert.equal(SLOTS_TIMEOUT_MS + BOOKING_TIMEOUT_MS, 9000);
  assert.ok(BOOKING_TIMEOUT_MS > SLOTS_TIMEOUT_MS);
});

test('book: links and invisible characters are refused as invalid, without asking Cal.com', async () => {
  const cal = mockCal();
  for (const patch of [
    { message: 'see https://spam.example' },
    { message: 'visit www.spam.example now' },
    { name: 'http://spam.example' },
    { message: 'ht​tp://spam.example' },
    { name: 'Ann‍Bee' },
    { name: '<b>Ann</b>' },
  ]) {
    const res = await handleBook(post({ ...BODY, ...patch }), CONTEXT, deps(cal.fetchImpl));
    assert.equal(res.status, 400, JSON.stringify(patch));
    assert.deepEqual(await res.json(), { ok: false, reason: 'invalid' });
    limiter.reset();
  }
  assert.equal(cal.calls.length, 0);
});

test('book: a filled honeypot gets ok:true and Cal.com is never called', async () => {
  const cal = mockCal();
  const res = await handleBook(post({ ...BODY, hp_ref: 'Acme Ltd' }), CONTEXT, deps(cal.fetchImpl));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(cal.calls.length, 0);
});

test('book: the old "company" field is not a honeypot, so autofill cannot discard a booking', async () => {
  const cal = mockCal();
  const res = await handleBook(post({ ...BODY, company: 'Acme Ltd' }), CONTEXT, deps(cal.fetchImpl));
  assert.equal(res.status, 200);
  assert.equal(cal.bookings().length, 1);
});

test('book: requests from another origin are refused', async () => {
  const cal = mockCal();
  for (const origin of ['https://evil.example', 'https://danielageorgieva.work.evil.example', 'null']) {
    const res = await handleBook(post(BODY, { origin }), CONTEXT, deps(cal.fetchImpl));
    assert.equal(res.status, 403, origin);
    assert.deepEqual(await res.json(), { ok: false, reason: 'invalid' });
  }
  const noOrigin = new Request('https://danielageorgieva.work/api/book', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(BODY),
  });
  assert.equal((await handleBook(noOrigin, CONTEXT, deps(cal.fetchImpl))).status, 403);
  assert.equal(cal.calls.length, 0);
});

test('origin check: production, netlify.app, deploy previews, and localhost only in dev', () => {
  const ctx: FnContext = { site: { name: 'example-site', url: 'https://example-site.netlify.app' } };
  assert.equal(isAllowedOrigin('https://danielageorgieva.work', ctx, {}), true);
  assert.equal(isAllowedOrigin('https://www.danielageorgieva.work', ctx, {}), true);
  assert.equal(isAllowedOrigin('https://example-site.netlify.app', ctx, {}), true);
  assert.equal(isAllowedOrigin('https://deploy-preview-12--example-site.netlify.app', ctx, {}), true);
  assert.equal(isAllowedOrigin('https://deploy-preview-12--other-site.netlify.app', ctx, {}), false);
  assert.equal(isAllowedOrigin('http://danielageorgieva.work', ctx, {}), false);
  assert.equal(isAllowedOrigin(null, ctx, {}), false);
  assert.equal(isAllowedOrigin('http://localhost:8888', ctx, {}), false);
  assert.equal(isAllowedOrigin('http://localhost:8888', ctx, { NETLIFY_DEV: 'true' }), true);
  assert.equal(isAllowedOrigin('http://localhost:8888', { deploy: { context: 'dev' } }, {}), true);
  assert.equal(isAllowedOrigin('http://localhost.evil.example', ctx, { NETLIFY_DEV: 'true' }), false);
});

test('book: wrong method, content type and oversized bodies are refused', async () => {
  const cal = mockCal();
  const getReq = new Request('https://danielageorgieva.work/api/book', { headers: { origin: ORIGIN } });
  const wrongMethod = await handleBook(getReq, CONTEXT, deps(cal.fetchImpl));
  assert.equal(wrongMethod.status, 405);
  assert.equal(wrongMethod.headers.get('allow'), 'POST');

  const form = await handleBook(
    post('name=x', { 'content-type': 'application/x-www-form-urlencoded' }),
    CONTEXT,
    deps(cal.fetchImpl),
  );
  assert.equal(form.status, 415);
  const text = await handleBook(post(JSON.stringify(BODY), { 'content-type': 'text/plain' }), CONTEXT, deps(cal.fetchImpl));
  assert.equal(text.status, 415);

  const declared = await handleBook(post(BODY, { 'content-length': '10001' }), CONTEXT, deps(cal.fetchImpl));
  assert.equal(declared.status, 413);

  // The limit is on real bytes: 4000 Cyrillic letters are 4000 characters and 8000 bytes,
  // so two such fields pass a character count and fail the byte count.
  const big = await handleBook(
    post({ ...BODY, message: 'я'.repeat(900), padding: 'я'.repeat(4600) }),
    CONTEXT,
    deps(cal.fetchImpl),
  );
  assert.equal(big.status, 413);

  const broken = await handleBook(post('{not json'), CONTEXT, deps(cal.fetchImpl));
  assert.equal(broken.status, 400);
  assert.equal(cal.calls.length, 0);
});

test('book: invalid fields are refused without asking Cal.com', async () => {
  const cal = mockCal();
  for (const patch of [
    { email: 'not-an-email' },
    { email: 'a@b.example, c@d.example' },
    { name: '' },
    { name: 'x'.repeat(81) },
    { message: '' },
    { message: 'x'.repeat(1001) },
    { start: '2026-11-23 09:00' },
    { start: '2026-11-23T11:00:00+02:00' },
    { hp_ref: 7 },
  ]) {
    const res = await handleBook(post({ ...BODY, ...patch }), CONTEXT, deps(cal.fetchImpl));
    assert.equal(res.status, 400, JSON.stringify(patch));
    assert.deepEqual(await res.json(), { ok: false, reason: 'invalid' });
    limiter.reset();
  }
  for (const body of ['[]', 'null', '"text"', '7']) {
    assert.equal((await handleBook(post(body), CONTEXT, deps(cal.fetchImpl))).status, 400);
    limiter.reset();
  }
  assert.equal(cal.calls.length, 0);
});

test('book: the sixth attempt from one IP inside ten minutes is rate limited, before any work', async () => {
  const cal = mockCal();
  for (let i = 0; i < 5; i++) {
    const res = await handleBook(post({ ...BODY, email: 'bad' }), CONTEXT, deps(cal.fetchImpl));
    assert.equal(res.status, 400);
  }
  const sixth = await handleBook(post(BODY), CONTEXT, deps(cal.fetchImpl));
  assert.equal(sixth.status, 429);
  assert.deepEqual(await sixth.json(), { ok: false, reason: 'rate_limited' });
  assert.equal(sixth.headers.get('retry-after'), '600');
  assert.equal(cal.calls.length, 0);

  // Another visitor is not affected, and the first one is let in again after the window.
  const other = await handleBook(post(BODY), { ...CONTEXT, ip: '203.0.113.99' }, deps(cal.fetchImpl));
  assert.equal(other.status, 200);
  const later = await handleBook(
    post({ ...BODY, start: '2026-11-23T09:30:00.000Z', email: 'again@example.com' }),
    CONTEXT,
    deps(cal.fetchImpl, {}, NOW + 10 * 60_000 + 1),
  );
  assert.equal(later.status, 200);
});

test('book: one email address gets at most two bookings an hour, whatever the IP or letter case', async () => {
  assert.equal(MAX_BOOKINGS_PER_EMAIL, 2);
  const cal = mockCal();
  const starts = ['2026-11-23T09:00:00.000Z', '2026-11-23T09:30:00.000Z', '2026-11-23T10:00:00.000Z'];
  const from = (i: number): FnContext => ({ ...CONTEXT, ip: `198.51.100.${i}` });

  const first = await handleBook(post({ ...BODY, start: starts[0] }), from(1), deps(cal.fetchImpl));
  const second = await handleBook(
    post({ ...BODY, start: starts[1], email: 'Visitor@Example.com' }),
    from(2),
    deps(cal.fetchImpl),
  );
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);

  const third = await handleBook(
    post({ ...BODY, start: starts[2], email: ' VISITOR@example.com ' }),
    from(3),
    deps(cal.fetchImpl),
  );
  assert.equal(third.status, 429);
  assert.deepEqual(await third.json(), { ok: false, reason: 'rate_limited' });
  assert.equal(third.headers.get('retry-after'), '3600');
  assert.equal(cal.bookings().length, 2);

  // Another address is not affected.
  const other = await handleBook(
    post({ ...BODY, start: starts[2], email: 'someone@example.com' }),
    from(4),
    deps(cal.fetchImpl),
  );
  assert.equal(other.status, 200);

  // After an hour the first address may book again.
  const later = await handleBook(
    post({ ...BODY, start: '2026-11-23T10:30:00.000Z' }),
    from(5),
    deps(cal.fetchImpl, {}, NOW + 60 * 60_000 + 1),
  );
  assert.equal(later.status, 200);
  assert.equal(cal.bookings().length, 4);
});

test('book: attempts that never reach Cal.com\'s booking call do not use up the per-email allowance', async () => {
  const cal = mockCal();
  // Three tries at times that are not offered: refused as taken, nothing counted.
  for (let i = 0; i < 3; i++) {
    const res = await handleBook(
      post({ ...BODY, start: '2026-11-23T09:15:00.000Z' }),
      { ...CONTEXT, ip: `198.51.100.${i}` },
      deps(cal.fetchImpl),
    );
    assert.equal(res.status, 409);
  }
  const real = await handleBook(post(BODY), CONTEXT, deps(cal.fetchImpl));
  assert.equal(real.status, 200);
});

test('rate limiter: the window slides', () => {
  const rl = new MemoryRateLimiter(2, 1000);
  assert.equal(rl.allow('a', 0), true);
  assert.equal(rl.allow('a', 500), true);
  assert.equal(rl.allow('a', 900), false);
  assert.equal(rl.allow('b', 900), true);
  assert.equal(rl.allow('a', 1001), true);
});

test('nothing personal is logged, on success or on failure', async (t) => {
  const lines: string[] = [];
  for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
    t.mock.method(console, method, (...args: unknown[]) => {
      lines.push(args.map(String).join(' '));
    });
  }
  const body = {
    ...BODY,
    name: 'Private Person',
    email: 'private.person@example.com',
    message: 'Secret project details.',
    timeZone: 'Pacific/Auckland',
  };
  const runs: Parameters<typeof mockCal>[0][] = [
    {},
    { bookingResponse: () => calError(500, 'InternalServerErrorException', 'upstream stack trace for private.person@example.com') },
    { bookingResponse: () => calError(400, 'BadRequestException', 'attendee Private Person rejected by the upstream validator') },
    { bookingResponse: () => calError(400, 'BadRequestException', 'User either already has booking at this time or is not available') },
    { bookingResponse: () => new Response('nope', { status: 429 }) },
    { slotsResponse: () => calError(500, 'InternalServerErrorException', 'upstream detail') },
    { hang: ['booking'] },
  ];
  for (const options of runs) {
    limiter.reset();
    emailLimiter.reset();
    const cal = mockCal(options);
    await handleBook(post(body), CONTEXT, { ...deps(cal.fetchImpl), timeouts: { availability: 40, slots: 40, booking: 40 } });
  }
  // The throttles and the honeypot too.
  await handleBook(post({ ...body, hp_ref: 'bot' }), CONTEXT, deps(mockCal().fetchImpl));
  await handleBook(post({ ...body, email: 'private.person@' }), CONTEXT, deps(mockCal().fetchImpl));

  const all = lines.join('\n');
  assert.ok(lines.length > 0);
  for (const secret of ['Private', 'private.person', 'example.com', 'Secret project', 'Auckland', 'upstream', 'validator', 'already has', CONTEXT.ip!]) {
    assert.ok(!all.includes(secret), `"${secret}" was logged:\n${all}`);
  }
});
