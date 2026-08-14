import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      authorization: {
        params: {
          // Public repo read + user profile; private repo requires App install
          scope: 'read:user user:email public_repo read:org',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token;
        token.githubId = String(account.providerAccountId);
        // profile.login is the GitHub username
        token.username = (profile as { login?: string }).login ?? token.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub as string;   // ← database user ID
      session.accessToken = token.accessToken as string;
      session.githubId = token.githubId as string;
      session.username = token.username as string;
      return session;
    },
  },
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  events: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'github' || !user.id || !account.access_token)
        return;

      // Sync GitHub profile info (non-blocking)
      try {
        const p = profile as {
          login?: string;
          name?: string;
          avatar_url?: string;
          bio?: string;
        };

        await prisma.user.update({
          where: { id: user.id },
          data: {
            githubId: String(account.providerAccountId),
            username: p.login ?? user.email ?? user.id,
            displayName: p.name ?? p.login ?? 'Unknown Hero',
            avatarUrl: p.avatar_url ?? null,
            bio: p.bio ?? null,
          },
        });

        // Trigger background analysis if this is the first login
        const existing = await prisma.user.findUnique({
          where: { id: user.id },
          select: { heroClass: true, lastAnalyzedAt: true },
        });

        if (!existing?.heroClass) {
          const { inngest } = await import('@/lib/inngest/client');
          await inngest.send({
            name: 'devlore/user.analyze',
            data: {
              userId: user.id,
              accessToken: account.access_token,
              triggeredBy: 'first_login',
            },
          });
        }
      } catch (err) {
        // Non-blocking — don't block sign-in on analysis errors
        console.error('[auth] signIn event error:', err);
      }
    },
  },
});
