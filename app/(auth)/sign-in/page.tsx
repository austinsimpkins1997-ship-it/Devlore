import { signIn } from '@/auth';
import { Card } from '@/components/ui/Card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - DEVLORE',
  description: 'Connect your GitHub account and begin your legend.',
};

interface Props {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl
    ? decodeURIComponent(params.callbackUrl)
    : '/dashboard';
  const hasError = !!params.error;

  async function handleGitHubSignIn() {
    'use server';
    await signIn('github', { redirectTo: callbackUrl });
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--color-void)',
      }}
    >
      {/* Background rune grid */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          backgroundImage:
            'radial-gradient(circle at center, var(--color-rune) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <Card
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '3rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'var(--color-abyss)',
          border: '1px solid var(--color-dusk)',
          position: 'relative',
          zIndex: 10,
          boxShadow: '0 0 40px rgba(0,0,0,0.8)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1 }}>
          ⚔️
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2.5rem',
            letterSpacing: '2px',
            color: 'var(--color-frost)',
            marginBottom: '0.5rem',
          }}
        >
          DEVLORE
        </h1>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.1rem',
            color: 'var(--color-rune)',
            marginBottom: '0.75rem',
            fontWeight: 400,
          }}
        >
          Begin Your Legend
        </h2>
        <p
          style={{
            color: 'var(--color-mist)',
            fontSize: '0.875rem',
            textAlign: 'center',
            marginBottom: hasError ? '1rem' : '2.5rem',
            lineHeight: 1.6,
          }}
        >
          Connect your GitHub account and let AI transform your commit history
          into an epic fantasy saga.
        </p>

        {hasError && (
          <p
            style={{
              color: '#f87171',
              fontSize: '0.8rem',
              textAlign: 'center',
              marginBottom: '1.5rem',
              padding: '0.5rem 1rem',
              background: 'rgba(248,113,113,0.1)',
              borderRadius: '6px',
              border: '1px solid rgba(248,113,113,0.3)',
            }}
          >
            Sign-in failed. Please try again.
          </p>
        )}

        {/* Server Action form — no client-side JS required */}
        <form action={handleGitHubSignIn} style={{ width: '100%', marginBottom: '1.5rem' }}>
          <button
            type="submit"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '0.875rem 1.5rem',
              background: 'var(--color-rune)',
              color: 'var(--color-void)',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              fontWeight: 600,
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            Sign in with GitHub
          </button>
        </form>

        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-mist)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          By signing in, you agree to our Terms of Service and Privacy Policy.
          <br />
          We only request read access to your public repositories.
        </p>
      </Card>
    </div>
  );
}
