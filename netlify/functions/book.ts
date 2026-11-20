// POST /api/book   JSON { start, name, email, message, hp_ref, lang, timeZone? }
// 200 { "ok": true }                the call is booked on Cal.com, which emails the invite
// 4xx/5xx { "ok": false, "reason": "taken" | "invalid" | "rate_limited" | "unavailable" }
// hp_ref is the honeypot and must be empty. timeZone is the visitor's IANA zone and
// defaults to Europe/Sofia.
import { handleBook } from './_lib/book-handler.ts';
import type { FnContext } from './_lib/http.ts';

export default (req: Request, context: FnContext) => handleBook(req, context);

export const config = {
  path: '/api/book',
  // Netlify's own rate limiting, counted per visitor IP across every function instance:
  // five booking attempts a minute. Requests over the limit get a 429 from the platform
  // before this code runs (the page treats any 429 as "try the email link"). Netlify notes
  // that enforcement can lag by up to ten seconds, and the free plan allows two such rules
  // per site: this one and the one in availability.ts.
  rateLimit: {
    windowLimit: 5,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};
