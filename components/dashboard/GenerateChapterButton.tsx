'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function GenerateChapterButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleClick() {
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/github/generate-chapter', { method: 'POST' });
      const body = await res.json();
      if (!res.ok) {
        setMessage(body.error ?? 'Chapter generation failed.');
        setStatus('error');
        return;
      }
      setMessage(`Chapter ${body.chapterNumber} written! +${body.xpEarned} XP`);
      setStatus('done');
      setTimeout(() => window.location.reload(), 2500);
    } catch {
      setMessage('Network error — check the dev server.');
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
          ? '⏳ Writing your chapter...'
          : status === 'done'
            ? '✓ Chapter written!'
            : '✦ Generate This Week\'s Chapter'}
      </Button>
      {message && (
        <p style={{
          color: status === 'error' ? '#ff6b6b' : 'var(--color-rune)',
          fontSize: '0.875rem',
          margin: 0,
          textAlign: 'center',
        }}>
          {message}
        </p>
      )}
    </div>
  );
}
