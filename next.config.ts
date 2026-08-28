import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * `/` has no page of its own: the root layout lives under `app/[lang]`, so
   * every route is `/en` or `/bg`. English is the default the design opens in.
   *
   * A redirect rather than proxy/middleware on purpose — matching on
   * `Accept-Language` would give this site a request-time runtime it does not
   * otherwise have, and both routes are prerendered static files. 307, not
   * 308: which locale `/` lands on is a default, not a permanent fact about
   * the URL, and a cached-forever redirect in every visitor's browser would
   * make changing it impossible.
   */
  redirects() {
    return [{ source: '/', destination: '/en', permanent: false }];
  },
};

export default nextConfig;
