'use client';

import { Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

/**
 * Inner component that uses useSearchParams — must be wrapped in Suspense
 * per Next.js 15 requirements to support static page generation.
 */
function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  return (
    <Card style={{
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
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1 }}>⚔️</div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', letterSpacing: '2px', color: 'var(--color-frost)', marginBottom: '0.5rem' }}>
        DEVLORE
      </h1>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--color-rune)', marginBottom: '0.75rem', fontWeight: 400 }}>
        Begin Your Legend
      </h2>
      <p style={{ color: 'var(--color-mist)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '2.5rem', lineHeight: 1.6 }}>
        Connect your GitHub account and let AI transform your commit history into an epic fantasy saga.
      </p>

      <Button
        size="lg"
        style={{ width: '100%', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
        onClick={() => signIn('github', { callbackUrl })}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
        </svg>
        Sign in with GitHub
      </Button>

      <p style={{ fontSize: '0.75rem', color: 'var(--color-mist)', textAlign: 'center', lineHeight: 1.5 }}>
        By signing in, you agree to our Terms of Service and Privacy Policy.
        <br />
        We only request read access to your public repositories.
      </p>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--color-void)',
    }}>
      {/* Background rune grid */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        opacity: 0.05,
        backgroundImage: 'radial-gradient(circle at center, var(--color-rune) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* useSearchParams must be inside Suspense */}
      <Suspense fallback={
        <div style={{ color: 'var(--color-mist)', fontFamily: 'var(--font-heading)', fontSize: '1.25rem' }}>
          Loading...
        </div>
      }>
        <SignInContent />
      </Suspense>
    </div>
  );
}
