// GET /api/availability
// 200 { "slots": ["2026-11-25T09:00:00.000Z", ...] }   up to six free slot starts, ISO 8601 UTC
// 400 { "ok": false }                                  the URL has a query string
// 502 { "ok": false }                                  Cal.com could not be reached (held 15s on the CDN)
// The slots come from Cal.com, which owns the working hours and the busy times. No secrets.
import { handleAvailability } from './_lib/availability-handler.ts';
import type { FnContext } from './_lib/http.ts';

export default (req: Request, context: FnContext) => handleAvailability(req, context);

export const config = {
  path: '/api/availability',
  // Netlify's own rate limiting, counted per visitor IP across every function instance.
  // Requests over the limit get a 429 from the platform before this code runs. The page
  // asks once per visit and the answer is cached for a minute, so ten a minute is generous.
  rateLimit: {
    windowLimit: 10,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};
