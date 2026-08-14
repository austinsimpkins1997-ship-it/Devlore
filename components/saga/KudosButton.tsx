'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface KudosButtonProps {
  username: string;
  initialCount: number;
}

export function KudosButton({ username, initialCount }: KudosButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'signin'>('idle');

  const handleClick = async () => {
    if (state === 'sending' || state === 'done') return;
    setState('sending');
    try {
      const res = await fetch('/api/kudos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (res.ok) {
        setCount(data.count);
        setState('done');
      } else if (res.status === 401) {
        setState('signin');
      } else if (res.status === 409) {
        if (typeof data.count === 'number') setCount(data.count);
        setState('done');
      } else {
        setState('idle');
      }
    } catch {
      setState('idle');
    }
  };

  if (state === 'signin') {
    return (
      <Button variant="secondary" onClick={() => (window.location.href = '/sign-in')} icon="🎉">
        Sign in to cheer ({count})
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      onClick={handleClick}
      loading={state === 'sending'}
      icon="🎉"
    >
      {state === 'done' ? `Cheered! (${count})` : `Cheer this hero (${count})`}
    </Button>
  );
}
