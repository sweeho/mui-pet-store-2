import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { getDomain } from "@/lib/customer-accounts/server";
import { SIGNED_ON_MAX_AGE_MS } from "@/lib/customer-accounts/session-rules";
import { authSecret } from "@/lib/customer-accounts/token";

/**
 * Customer sign-on (system design D7): Auth.js v5 with the Credentials provider and an encrypted
 * token cookie, so the server keeps no session state. The token carries the user name, the session
 * version of the sign-on record, when the customer signed on and the last request. Every request
 * checks them on the server (src/proxy.ts, src/lib/customer-accounts/server.ts).
 */
export const { handlers, signIn, signOut } = NextAuth(() => ({
  secret: authSecret(),
  trustHost: true,
  session: { strategy: "jwt", maxAge: SIGNED_ON_MAX_AGE_MS / 1000 },
  pages: { signIn: "/signin" },
  providers: [
    Credentials({
      credentials: { userName: {}, password: {} },
      async authorize(credentials) {
        const { userName, password } = credentials as Record<string, unknown>;
        if (typeof userName !== "string" || typeof password !== "string") return null;
        const domain = await getDomain();
        if (!(await domain.auth.authenticate(userName, password))) return null;
        return { id: userName, name: userName };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        const now = Date.now();
        const domain = await getDomain();
        return {
          userName: user.id,
          sessionVersion: (await domain.auth.sessionVersion(user.id)) ?? 0,
          signedAt: now,
          lastActive: now,
        };
      }
      return token;
    },
  },
}));
