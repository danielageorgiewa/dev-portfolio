// GET /api/availability: the next free call slots, as ISO 8601 UTC start times and nothing else.

import { CalError, fetchSlots } from './cal.ts';
import { DEFAULT_TIMEOUTS, readCalConfig } from './config.ts';
import { type Deps, type FnContext, defaultDeps, json } from './http.ts';
import { slotWindow, toIso, upcoming } from './slots.ts';

// One minute in the browser and on Netlify's CDN, so repeat visits and reloads do not each
// cost a Cal.com API call. A slot booked inside that minute can still be listed; `book`
// asks Cal.com again before it creates anything.
const CACHE = {
  'cache-control': 'public, max-age=60',
  'netlify-cdn-cache-control': 'public, max-age=60',
};

// A failure is held on the CDN for a few seconds (never in the browser), so a Cal.com outage
// is not answered by calling Cal.com again for every visitor.
const FAILURE_CACHE = { 'netlify-cdn-cache-control': 'public, max-age=15' };

export async function handleAvailability(
  req: Request,
  _context: FnContext = {},
  deps: Deps = defaultDeps(),
): Promise<Response> {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return json({ ok: false }, 405, { allow: 'GET, HEAD' });
  }
  // The function takes no parameters. A query string would only be a way to get a fresh,
  // uncached answer (and a Cal.com call) on every request, so it is refused before any work.
  if (req.url.includes('?')) return json({ ok: false }, 400);

  const now = deps.now();
  const timeouts = deps.timeouts ?? DEFAULT_TIMEOUTS;
  try {
    const all = await fetchSlots(readCalConfig(deps.env), slotWindow(now), deps.fetch, timeouts.availability);
    return json({ slots: upcoming(all, now).map(toIso) }, 200, CACHE);
  } catch (err) {
    if (err instanceof CalError) console.error('availability: cal', err.step, err.status);
    else console.error('availability: request failed');
    return json({ ok: false }, 502, FAILURE_CACHE);
  }
}
