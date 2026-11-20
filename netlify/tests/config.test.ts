// Checks on the configuration around the functions: rate limits, site headers, the CSP
// builder and the sign-in script. The last three read the files as text, so they only show
// that a setting is written down, not that Netlify applies it.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { config as availabilityConfig } from '../functions/availability.ts';
import { config as bookConfig } from '../functions/book.ts';
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

test('google-auth.mjs sets .env to owner-only after writing it', () => {
  const source = read('scripts/google-auth.mjs');
  const write = source.indexOf('writeFileSync(ENV_FILE');
  const chmod = source.indexOf('chmodSync(ENV_FILE, 0o600)');
  assert.ok(write !== -1 && chmod > write);
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
