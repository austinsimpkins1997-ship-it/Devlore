'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';

type Relationship = 'self' | 'friends' | 'request_sent' | 'request_received' | 'none' | null;

interface AddFriendButtonProps {
  username: string;
  initialRelationship: Relationship;
}

export function AddFriendButton({ username, initialRelationship }: AddFriendButtonProps) {
  const [relationship, setRelationship] = useState<Relationship>(initialRelationship);
  const [sending, setSending] = useState(false);

  if (relationship === 'self') return null;

  const handleClick = async () => {
    if (sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (res.status === 401) {
        window.location.href = '/sign-in';
        return;
      }
      const data = await res.json();
      if (res.ok) setRelationship(data.status as Relationship);
    } catch {
      // Leave state unchanged; the user can retry.
    } finally {
      setSending(false);
    }
  };

  if (relationship === 'friends') {
    return (
      <Button variant="secondary" disabled icon="🤝">
        Companions
      </Button>
    );
  }
  if (relationship === 'request_sent') {
    return (
      <Button variant="secondary" disabled icon="⏳">
        Request sent
      </Button>
    );
  }
  if (relationship === 'request_received') {
    return (
      <Button variant="secondary" onClick={() => (window.location.href = '/dashboard')} icon="📨">
        Respond to request
      </Button>
    );
  }

  return (
    <Button variant="secondary" onClick={handleClick} loading={sending} icon="➕">
      Add Friend
    </Button>
  );
}
