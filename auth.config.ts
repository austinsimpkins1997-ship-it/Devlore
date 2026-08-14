import type { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';

/**
 * Edge-compatible auth config (no Prisma adapter).
 * Used in middleware to protect routes without touching the DB.
 * The full config (with PrismaAdapter) lives in auth.ts.
 */
export const authConfig = {
  providers: [GitHub],
  session: { strategy: 'jwt' as const },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = nextUrl.pathname.startsWith('/dashboard');
      const isAuthOnly = nextUrl.pathname.startsWith('/sign-in');

      if (isProtected && !isLoggedIn) {
        const signInUrl = new URL('/sign-in', nextUrl);
        signInUrl.searchParams.set(
          'callbackUrl',
          encodeURIComponent(nextUrl.pathname),
        );
        return Response.redirect(signInUrl);
      }

      if (isAuthOnly && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
