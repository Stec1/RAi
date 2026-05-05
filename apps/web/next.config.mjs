// Next.js config.
//
// Same-origin API proxy:
// In production the web app (Vercel, e.g. rai-web-one.vercel.app) and the
// API (Railway, e.g. raiapi-production.up.railway.app) sit on different
// registrable domains. Cross-site cookies are flaky in modern browsers
// (Safari ITP, third-party-cookie blocking, etc.), so we proxy every
// `/api/*` browser request through Next.js to the upstream API. The
// browser only ever sees same-origin responses; the session cookie is
// scoped to the web origin and rides along on subsequent fetches.
//
// `API_PROXY_ORIGIN` defaults to `http://localhost:3001` so local dev keeps
// working without extra env setup. Set
// `API_PROXY_ORIGIN=https://raiapi-production.up.railway.app` on Vercel.
const API_PROXY_ORIGIN = process.env.API_PROXY_ORIGIN || 'http://localhost:3001';
// Strip trailing slash(es) so `${origin}/api/...` never produces `host//api/...`.
const upstream = API_PROXY_ORIGIN.replace(/\/+$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${upstream}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
