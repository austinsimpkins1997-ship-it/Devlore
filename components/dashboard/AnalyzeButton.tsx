'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface AnalyzeButtonProps {
  label?: string;
}

export function AnalyzeButton({ label }: AnalyzeButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleClick() {
    setStatus('loading');
    setMessage('Fetching your GitHub history...');
    try {
      const res = await fetch('/api/github/analyze', { method: 'POST' });
      const body = await res.json();
      if (!res.ok) {
        setMessage(body.error ?? 'Analysis failed. Check the dev server logs.');
        setStatus('error');
        return;
      }
      setMessage(`${body.heroClass} — Level ${body.level} — ${body.xp} XP earned! Reloading...`);
      setStatus('done');
      setTimeout(() => window.location.reload(), 2000);
    } catch {
      setMessage('Network error — make sure the dev server is running.');
      setStatus('error');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <Button
        onClick={handleClick}
        disabled={status === 'loading' || status === 'done'}
      >
        {status === 'loading'
          ? '⏳ Analyzing... (30–60s)'
          : status === 'done'
            ? '✓ Analysis complete!'
            : label ?? '✦ Analyze My Legend'}
      </Button>
      {message && (
        <p style={{
          color: status === 'error' ? '#ff6b6b' : 'var(--color-rune)',
          fontSize: '0.875rem',
          margin: 0,
          textAlign: 'center',
          maxWidth: '400px',
        }}>
          {message}
        </p>
      )}
    </div>
  );
}
