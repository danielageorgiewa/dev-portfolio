// Shared request plumbing for the two booking functions.

import type { Env, Fetch, Timeouts } from './config.ts';

/** The parts of Netlify's function Context these handlers read. */
export interface FnContext {
  ip?: string;
  site?: { name?: string; url?: string };
  deploy?: { context?: string };
}

/** Everything a handler touches outside its arguments, so tests can replace it. */
export interface Deps {
  fetch: Fetch;
  now: () => number;
  env: Env;
  /** Per-call Cal.com time limits. Left out in production, where config.ts supplies them. */
  timeouts?: Timeouts;
}

export const defaultDeps = (): Deps => ({
  fetch: globalThis.fetch,
  now: Date.now,
  env: process.env,
});

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      // The answers are JSON for fetch(). Opened as a page they may load and frame nothing.
      'content-security-policy': "default-src 'none'; frame-ancestors 'none'",
      'referrer-policy': 'no-referrer',
      ...headers,
    },
  });
}

const SITE_ORIGINS = ['https://danielageorgieva.work', 'https://www.danielageorgieva.work'];
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * True when the Origin header is this site: the production domain, the site's own
 * netlify.app address, one of its deploy previews or branch deploys
 * (https://<anything>--<site-name>.netlify.app), or localhost under `netlify dev`.
 * A missing Origin is refused: browsers always send it on a cross-origin or POST fetch.
 */
export function isAllowedOrigin(origin: string | null, context: FnContext, env: Env): boolean {
  if (!origin) return false;
  if (SITE_ORIGINS.includes(origin)) return true;

  const siteUrl = context.site?.url ?? env.URL;
  if (siteUrl) {
    try {
      if (new URL(siteUrl).origin === origin) return true;
    } catch {
      // An unparsable site URL allows nothing.
    }
  }

  const siteName = context.site?.name ?? env.SITE_NAME;
  if (siteName && /^[a-z0-9-]+$/i.test(siteName)) {
    if (origin === `https://${siteName}.netlify.app`) return true;
    if (new RegExp(`^https://[a-z0-9-]+--${siteName}\\.netlify\\.app$`, 'i').test(origin)) return true;
  }

  const local = env.NETLIFY_DEV === 'true' || context.deploy?.context === 'dev';
  return local && LOCAL_ORIGIN.test(origin);
}

/**
 * A small sliding-window limiter held in memory.
 *
 * Honest limits: the map lives in one function instance. Netlify can run several instances at
 * once and throws them away when idle, so this slows down a single noisy client that keeps
 * hitting a warm instance and does nothing more. The limit that holds across instances is the
 * platform rule in each function's `config.rateLimit`.
 */
export class MemoryRateLimiter {
  private readonly hits = new Map<string, number[]>();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  /** Records a hit and reports whether it is within the limit. */
  allow(key: string, now: number): boolean {
    const since = now - this.windowMs;
    const recent = (this.hits.get(key) ?? []).filter((t) => t > since);
    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    if (this.hits.size > 500) this.prune(since);
    return true;
  }

  reset(): void {
    this.hits.clear();
  }

  private prune(since: number): void {
    for (const [key, times] of this.hits) {
      if (times.every((t) => t <= since)) this.hits.delete(key);
    }
  }
}
