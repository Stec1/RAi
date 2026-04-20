// Better Auth configuration.
//
// Cross-origin setup:
//   API  = Railway (e.g. api.rai.app)
//   Web  = Vercel  (e.g. rai.app)
// These are different origins, so `sameSite: "strict"` would block the
// session cookie on cross-site XHR. Phase 1 uses `sameSite: "lax"`.
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
      secure: isProd,
      sameSite: 'lax',
    },
  },
});

export type Auth = typeof auth;
export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
