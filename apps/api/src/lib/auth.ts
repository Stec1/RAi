// Better Auth configuration.
//
// Cross-origin setup:
//   API  = Railway  (e.g. raiapi-production.up.railway.app)
//   Web  = Vercel   (e.g. rai-web-one.vercel.app)
// These hosts have different registrable domains, so the session cookie is
// truly cross-site. Browsers only send `SameSite=Lax` cookies on top-level
// navigations — not on `fetch()` from the web app to the API. That caused
// `/api/me` to return 401 immediately after a successful sign-in.
//
// Production therefore needs `SameSite=None; Secure` for the session cookie
// to be sent on cross-site XHR. Local dev keeps `SameSite=Lax` because
// `localhost:3000` ↔ `localhost:3001` are considered same-site by browsers,
// and Lax avoids requiring HTTPS in dev (`Secure` cookies are dropped on
// plain http://).
// See docs/decision-log.md (DL-24).

import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { deriveDisplayNameFromEmail } from '@rai/shared';
import { prisma } from './prisma.js';

const isProd = process.env.NODE_ENV === 'production';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.WEB_URL || 'http://localhost:3000'],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  // Populate User.name from email on signup when the client did not supply
  // an explicit name. Does not overwrite a provided name.
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const current = typeof user.name === 'string' ? user.name.trim() : '';
          if (current.length > 0) {
            return;
          }
          return {
            data: {
              ...user,
              name: deriveDisplayNameFromEmail(user.email),
            },
          };
        },
      },
    },
  },
  advanced: {
    cookiePrefix: 'rai',
    defaultCookieAttributes: {
      httpOnly: true,
      // `Secure` is required whenever `SameSite=None`. In dev we leave it
      // off so the cookie works over plain http://localhost.
      secure: isProd,
      // `None` is required for cross-site fetch credentials in production.
      // `Lax` is correct in dev where the web/api are same-site (localhost).
      sameSite: isProd ? 'none' : 'lax',
    },
  },
});

export type Auth = typeof auth;
export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
