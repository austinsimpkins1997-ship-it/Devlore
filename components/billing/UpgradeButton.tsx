'use client';

import React, { useState } from 'react';

interface UpgradeButtonProps {
  plan: 'PRO' | 'LEGEND';
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Rendered when the viewer is already on this plan. */
  disabled?: boolean;
}

/**
 * Starts a Stripe Checkout session and redirects. Signed-out visitors are sent
 * to sign-in first, carrying the chosen plan so the flow can resume.
 */
export function UpgradeButton({
  plan,
  label,
  className,
  style,
  disabled = false,
}: UpgradeButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (busy || disabled) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      if (res.status === 401) {
        window.location.href = `/sign-in?callbackUrl=${encodeURIComponent(
          `/dashboard/settings?plan=${plan}`,
        )}`;
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data?.error === 'string' ? data.error : 'Could not start checkout');
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start checkout');
      setBusy(false);
    }
  };

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy || disabled}
        className={className}
        style={{
          padding: '0.7rem 1.5rem',
          borderRadius: '8px',
          border: 'none',
          background:
            plan === 'LEGEND'
              ? 'linear-gradient(to right, #7c3aed, #a855f7)'
              : 'linear-gradient(to right, var(--color-rune-dim), var(--color-rune))',
          color: plan === 'LEGEND' ? '#fff' : 'var(--color-void)',
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: '0.95rem',
          cursor: busy || disabled ? 'not-allowed' : 'pointer',
          opacity: busy || disabled ? 0.6 : 1,
          ...style,
        }}
      >
        {busy ? 'Opening checkout…' : (label ?? `Upgrade to ${plan === 'PRO' ? 'Hero' : 'Legend'}`)}
      </button>
      {error && (
        <span style={{ color: 'var(--color-danger)', fontSize: '0.78rem', maxWidth: '260px' }}>
          {error}
        </span>
      )}
    </span>
  );
}
