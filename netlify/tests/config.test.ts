// Checks on the configuration around the functions: rate limits, the Cal.com settings, site
// headers, the CSP builder and the page script. The ones that read files as text only show
// that a setting is written down, not that Netlify applies it.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { config as availabilityConfig } from '../functions/availability.ts';
import { config as bookConfig } from '../functions/book.ts';
import {
  BOOKING_TIMEOUT_MS,
  CAL_BOOKINGS_VERSION,
  CAL_SLOTS_VERSION,
  SLOTS_TIMEOUT_MS,
  readCalConfig,
} from '../functions/_lib/config.ts';
import { buildPolicy } from '../../scripts/csp-headers.mjs';

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

test('availability is limited to ten requests a minute per visitor', () => {
  assert.deepEqual(availabilityConfig, {
    path: '/api/availability',
    rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] },
  });
  assert.equal(bookConfig.rateLimit.windowLimit, 5);
});

test('the site policy upgrades insecure requests and keeps the rest', () => {
  const policy = buildPolicy(["'sha256-abc'"]);
  const directives = policy.split('; ');
  assert.ok(directives.includes('upgrade-insecure-requests'));
  assert.ok(directives.includes("default-src 'self'"));
  assert.ok(directives.includes("script-src 'self' 'sha256-abc'"));
  assert.ok(directives.includes("frame-ancestors 'none'"));
  assert.ok(directives.includes("object-src 'none'"));
});

test('netlify.toml: HSTS covers subdomains without preload, and the cross-origin headers are set', () => {
  const toml = read('netlify.toml');
  assert.ok(toml.includes('Strict-Transport-Security = "max-age=31536000; includeSubDomains"\n'));
  assert.ok(!/preload/i.test(toml));
  assert.ok(toml.includes('Cross-Origin-Opener-Policy = "same-origin"'));
  assert.ok(toml.includes('Cross-Origin-Resource-Policy = "same-origin"'));
  assert.ok(toml.includes('X-Flag = "dg{l3ts_t4lk}"'));
});

test('Cal.com: the account and event type are public constants that two optional variables can replace', () => {
  assert.deepEqual(readCalConfig({}), { username: 'daniela-georgieva-rajxiy', eventSlug: '30min' });
  assert.deepEqual(readCalConfig({ CAL_USERNAME: ' someone-else ', CAL_EVENT_SLUG: 'intro.call_15' }), {
    username: 'someone-else',
    eventSlug: 'intro.call_15',
  });
  // Empty or malformed overrides fall back to the constants.
  assert.deepEqual(readCalConfig({ CAL_USERNAME: '', CAL_EVENT_SLUG: '30min&username=x' }), {
    username: 'daniela-georgieva-rajxiy',
    eventSlug: '30min',
  });
  assert.deepEqual(readCalConfig({ CAL_USERNAME: 'a/b', CAL_EVENT_SLUG: 'x'.repeat(101) }), {
    username: 'daniela-georgieva-rajxiy',
    eventSlug: '30min',
  });
});

test('Cal.com: the version headers are the documented ones and a booking fits in ten seconds', () => {
  assert.equal(CAL_SLOTS_VERSION, '2024-09-04');
  assert.equal(CAL_BOOKINGS_VERSION, '2026-02-25');
  assert.ok(SLOTS_TIMEOUT_MS + BOOKING_TIMEOUT_MS < 10_000);
});

test('nothing asks for a Google secret any more', () => {
  const example = read('.env.example');
  assert.ok(!/GOOGLE_/.test(example));
  assert.match(example, /^CAL_USERNAME=$/m);
  assert.match(example, /^CAL_EVENT_SLUG=$/m);
});

test('the page talks only to its own functions, so connect-src stays self', () => {
  const script = read('src/scripts/booking.ts');
  assert.ok(!/cal\.com/i.test(script.replace(/\/\/.*$/gm, '')));
  assert.ok(script.includes("const AVAILABILITY_URL = '/api/availability';"));
  assert.ok(script.includes("const BOOK_URL = '/api/book';"));
  assert.ok(script.includes('timeZone: visitorTimeZone(),'));
  const directives = buildPolicy([]).split('; ');
  assert.ok(directives.includes("connect-src 'self'"));
});

test('the honeypot field in the page and in the script is hp_ref, not company', () => {
  const page = read('src/components/home/Contact.astro');
  assert.match(page, /<input type="text" name="hp_ref" tabindex="-1" autocomplete="off" \/>/);
  assert.ok(page.includes('<span>Leave this field empty</span>'));
  assert.ok(!/name="company"/.test(page));
  const script = read('src/scripts/booking.ts');
  assert.ok(script.includes("hp_ref: field('hp_ref')"));
  assert.ok(!script.includes('company'));
});
