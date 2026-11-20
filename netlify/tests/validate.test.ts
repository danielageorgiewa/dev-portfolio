import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  cleanLine,
  cleanText,
  escapeHtml,
  hasLink,
  isEmail,
  parseStart,
  stripAngles,
  validateBooking,
} from '../functions/_lib/validate.ts';

const good = {
  start: '2026-11-25T09:00:00.000Z',
  name: 'Test Visitor',
  email: 'visitor@example.com',
  message: 'A booking system for a small studio.',
  hp_ref: '',
  lang: 'en',
};

test('a well-formed booking passes and comes back cleaned', () => {
  const result = validateBooking({ ...good, name: '  Test   Visitor ', email: ' visitor@example.com ' });
  assert.ok(result.ok && !result.honeypot);
  assert.deepEqual(result.booking, {
    start: Date.parse(good.start),
    name: 'Test Visitor',
    email: 'visitor@example.com',
    message: good.message,
    lang: 'en',
  });
});

test('Bulgarian text and the bg language are kept', () => {
  const result = validateBooking({ ...good, name: 'Иван Петров', message: 'Онлайн магазин.', lang: 'bg' });
  assert.ok(result.ok && !result.honeypot);
  assert.equal(result.booking.name, 'Иван Петров');
  assert.equal(result.booking.lang, 'bg');
});

test('an unknown language falls back to English', () => {
  const result = validateBooking({ ...good, lang: 'de' });
  assert.ok(result.ok && !result.honeypot);
  assert.equal(result.booking.lang, 'en');
});

test('a filled honeypot is flagged, even when the rest is rubbish', () => {
  assert.deepEqual(validateBooking({ hp_ref: 'Acme' }), { ok: true, honeypot: true });
  assert.deepEqual(validateBooking({ ...good, hp_ref: 'Acme' }), { ok: true, honeypot: true });
});

test('the honeypot is hp_ref: a "company" value from autofill is ignored', () => {
  const result = validateBooking({ ...good, company: 'Acme Ltd' });
  assert.ok(result.ok && !result.honeypot);
  assert.equal(result.booking.name, 'Test Visitor');
  // Empty, missing and null all mean "not filled".
  for (const hp_ref of ['', '   ', null, undefined]) {
    const r = validateBooking({ ...good, hp_ref });
    assert.ok(r.ok && !r.honeypot);
  }
});

test('names in any script pass, with spaces, dots, apostrophes and hyphens', () => {
  for (const name of [
    'Мария Иванова',
    'Мария-Луиза Петрова',
    "Siobhán O'Brien",
    'Renée D’Angelo',
    'Jean-Luc Picard',
    'Dr. Ann Lee Jr.',
    'José Ángel Núñez',
    'Jose\u0301 Nu\u0303ez', // combining accents, as some keyboards send them
    '王小明',
    'محمد علي',
    'Þórdís Ólafsdóttir',
    'Åsa',
  ]) {
    const result = validateBooking({ ...good, name });
    assert.ok(result.ok && !result.honeypot, name);
  }
});

test('names with anything else are rejected', () => {
  for (const name of [
    '<b>Ann</b>',
    'Ann & Bee',
    'Ann (Acme)',
    'Ann, Acme Ltd',
    'Ann 2',
    'Ann@Acme',
    'Ann: click here',
    'Ann/Bee',
    '-Ann',
    "'Ann",
    '.Ann',
    'Ann_Bee',
    'Ann "Bee" Cee',
    'Ann = Bee',
    'Ann 😀',
  ]) {
    assert.deepEqual(validateBooking({ ...good, name }), { ok: false }, name);
  }
});

test('an ordinary message with punctuation and numbers passes unchanged', () => {
  const message =
    'Hi Daniela! We run a 12-person studio in Sofia (est. 2019) and need a booking system by Q2.\n' +
    'Budget is around 5,000 EUR; is that realistic? We use Stripe & Google Calendar today, ' +
    "it's about 40% manual. I'm free after 3:30 p.m. on weekdays, e.g. Tuesday or Wednesday.\n\n" +
    'Thanks, Maria. P.S. my colleague said "ask about the 2-week option" and/or a fixed price.';
  const result = validateBooking({ ...good, message });
  assert.ok(result.ok && !result.honeypot);
  assert.equal(result.booking.message, message);

  const bg = 'Здравейте! Търся онлайн магазин за 3 марки, т.е. около 200 продукта. Бюджет: 4 000 лв. Кога може да говорим?';
  const bgResult = validateBooking({ ...good, name: 'Мария Иванова', message: bg, lang: 'bg' });
  assert.ok(bgResult.ok && !bgResult.honeypot);
  assert.equal(bgResult.booking.message, bg);
});

test('anything link-like in the name or the message is rejected', () => {
  for (const text of [
    'See https://evil.example',
    'See http://evil.example/x',
    'HTTPS://EVIL.EXAMPLE',
    'www.evil.example',
    'Go to WWW.evil.example now',
    'ftp://evil.example',
    'javascript://x',
    'http\u0000s://evil.example', // split by a control character
    'https\u0007://evil.example',
    'www\u0001.evil.example',
  ]) {
    assert.equal(hasLink(text.replace(/[\u0000-\u001F]/g, '')), true, text);
    assert.deepEqual(validateBooking({ ...good, message: text }), { ok: false }, `message: ${text}`);
  }
  for (const name of ['www.evil.example', 'Ann www.evil.example']) {
    assert.deepEqual(validateBooking({ ...good, name }), { ok: false }, `name: ${name}`);
  }
  // A project described with slashes and dots is ordinary text, not a link.
  for (const text of ['A shop on Next.js/React with a Node.js/Postgres backend', 'file.pdf/notes', 'сайт.бг/страница']) {
    assert.ok(validateBooking({ ...good, message: text }).ok, text);
  }
  // Sentences that end one line and start the next are not a link.
  const twoLines = validateBooking({ ...good, message: 'That is the end.\nYes/no is fine as an answer.' });
  assert.ok(twoLines.ok);
});

test('zero-width and directional characters are rejected in the name and the message', () => {
  for (const code of [0x200b, 0x200c, 0x200d, 0x200e, 0x200f, 0x2060, 0x2061, 0x2062, 0x2063, 0x2064]) {
    const ch = String.fromCharCode(code);
    const label = `U+${code.toString(16).toUpperCase()}`;
    assert.deepEqual(validateBooking({ ...good, name: `Ann${ch}Bee` }), { ok: false }, `name ${label}`);
    assert.deepEqual(validateBooking({ ...good, message: `ht${ch}tps://evil.example` }), { ok: false }, `link ${label}`);
    assert.deepEqual(validateBooking({ ...good, message: `plain${ch} words` }), { ok: false }, `message ${label}`);
  }
});

test('missing, empty and wrongly typed fields are rejected', () => {
  for (const patch of [
    { name: undefined },
    { name: '' },
    { name: '   ' },
    { name: 42 },
    { email: undefined },
    { email: '' },
    { message: '' },
    { message: '\n\n' },
    { message: ['x'] },
    { start: undefined },
    { start: 1764061200000 },
    { hp_ref: 7 },
  ]) {
    assert.deepEqual(validateBooking({ ...good, ...patch }), { ok: false }, JSON.stringify(patch));
  }
  for (const body of [null, undefined, 'text', 7, [], [good]]) {
    assert.deepEqual(validateBooking(body), { ok: false });
  }
});

test('length limits: 80, 120 and 1000 characters', () => {
  assert.equal(validateBooking({ ...good, name: 'a'.repeat(80) }).ok, true);
  assert.equal(validateBooking({ ...good, name: 'a'.repeat(81) }).ok, false);
  assert.equal(validateBooking({ ...good, message: 'a'.repeat(1000) }).ok, true);
  assert.equal(validateBooking({ ...good, message: 'a'.repeat(1001) }).ok, false);
  const local = 'a'.repeat(60);
  const longDomain = `${'b'.repeat(55)}.com`; // 60 + 1 + 59 = 120
  assert.equal(validateBooking({ ...good, email: `${local}@${longDomain}` }).ok, true);
  assert.equal(validateBooking({ ...good, email: `${local}@b${longDomain}` }).ok, false);
});

test('email syntax', () => {
  for (const ok of ['a@b.co', 'first.last+tag@sub.example.com', 'x_y@example-site.bg']) {
    assert.equal(isEmail(ok), true, ok);
  }
  for (const bad of [
    'plain',
    '@example.com',
    'a@',
    'a@b',
    'a b@example.com',
    'a@example..com',
    'a@-example.com',
    '.a@example.com',
    'a..b@example.com',
    'a@example.com, c@example.com',
    'a@example.com\nbcc: c@example.com',
    '<a@example.com>',
    '"a"@example.com',
    'a@exa mple.com',
  ]) {
    assert.equal(isEmail(bad), false, bad);
  }
});

test('start must be an ISO 8601 UTC timestamp', () => {
  assert.equal(parseStart('2026-11-25T09:00:00.000Z'), Date.parse('2026-11-25T09:00:00.000Z'));
  assert.equal(parseStart('2026-11-25T09:00:00Z'), Date.parse('2026-11-25T09:00:00.000Z'));
  for (const bad of [
    '2026-11-25T11:00:00+02:00',
    '2026-11-25 09:00',
    'Wed Nov 25 2026',
    '2026-13-45T09:00:00Z',
    '',
    'x'.repeat(41),
    null,
    1764061200000,
  ]) {
    assert.equal(parseStart(bad), null, String(bad));
  }
});

test('control characters are removed from names and messages', () => {
  assert.equal(cleanLine('Ann\u0000\u0007 ‮Bee\r\nCee\t'), 'Ann Bee Cee');
  assert.equal(cleanText('line one\r\n\r\n\r\n\r\nline\u0000 two\u001B[31m'), 'line one\n\nline two [31m');
  const result = validateBooking({ ...good, name: 'Ann\u0000Bee', message: 'one\u0008two\nthree' });
  assert.ok(result.ok && !result.honeypot);
  assert.equal(result.booking.name, 'Ann Bee');
  assert.equal(result.booking.message, 'one two\nthree');
});

test('markup is escaped or stripped, never passed through', () => {
  assert.equal(
    escapeHtml(`<img src=x onerror="alert('x')"> & more`),
    '&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt; &amp; more',
  );
  assert.equal(stripAngles('<b>Ann</b> <script>'), 'bAnn/b script');
});
