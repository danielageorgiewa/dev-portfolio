// GET /api/availability: the next free call slots, as ISO 8601 UTC start times and nothing else.

import {
  DEFAULT_TIMEOUTS,
  GoogleError,
  freeBusy,
  getAccessToken,
  listSiteEvents,
  readConfig,
} from './google.ts';
import { type Deps, type FnContext, defaultDeps, json } from './http.ts';
import { candidateSlots, freeSlots, queryWindow, toIso } from './slots.ts';

// One minute in the browser and on Netlify's CDN, so repeat visits and reloads do not each
// cost a Google API call. A slot booked inside that minute can still be listed; `book`
// checks the calendar again before it creates anything.
const CACHE = {
  'cache-control': 'public, max-age=60',
  'netlify-cdn-cache-control': 'public, max-age=60',
};

// A failure is held on the CDN for a few seconds (never in the browser), so a Google outage
// is not answered by calling Google again for every visitor.
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
  // uncached answer (and a Google call) on every request, so it is refused before any work.
  if (req.url.includes('?')) return json({ ok: false }, 400);

  const cfg = readConfig(deps.env);
  // Not set up yet is an expected state (the site launches before the Google setup), so it
  // is answered quietly and not logged.
  if (!cfg) return json({ configured: false }, 503);

  const now = deps.now();
  const timeouts = deps.timeouts ?? DEFAULT_TIMEOUTS;
  try {
    const token = await getAccessToken(cfg, deps.fetch, now, timeouts.read);
    const window = queryWindow(now);
    // Independent reads, so they run side by side: busy times, and the ids of events this
    // site created. The second list includes deleted events, because Google keeps a deleted
    // event's id reserved: that slot looks free but can never be booked again.
    const [busy, siteEvents] = await Promise.all([
      freeBusy(cfg, token, window, deps.fetch, timeouts.read),
      listSiteEvents(cfg, token, window, deps.fetch, { timeoutMs: timeouts.read }),
    ]);
    const reserved = new Set(siteEvents.map((e) => e.id));
    const slots = freeSlots(candidateSlots(now), busy, undefined, reserved).map(toIso);
    return json({ slots }, 200, CACHE);
  } catch (err) {
    if (err instanceof GoogleError) console.error('availability: google', err.step, err.status);
    else console.error('availability: request failed');
    return json({ ok: false }, 502, FAILURE_CACHE);
  }
}
