'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './FellowshipPanel.module.css';

interface Friend {
  id: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  heroClass: string | null;
  level: number;
  unreadCount: number;
}

interface PendingRequest {
  friendshipId: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  heroClass: string | null;
  level: number;
}

interface ChatMessage {
  id: string;
  body: string;
  createdAt: string;
  fromMe: boolean;
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  return url ? (
    <Image src={url} alt={name} width={34} height={34} className={styles.avatar} />
  ) : (
    <span className={styles.avatarFallback}>{name.charAt(0)}</span>
  );
}

export default function FellowshipPanel() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUsername, setActiveUsername] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);

  const loadFellowship = useCallback(async () => {
    try {
      const res = await fetch('/api/friends');
      if (!res.ok) throw new Error('Failed to load fellowship');
      const data = await res.json();
      setFriends(data.friends ?? []);
      setIncoming(data.incoming ?? []);
    } catch {
      setError('Could not load your fellowship.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFellowship();
  }, [loadFellowship]);

  const openThread = useCallback(
    async (username: string) => {
      setActiveUsername(username);
      setThreadLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/messages?username=${encodeURIComponent(username)}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(typeof data?.error === 'string' ? data.error : 'Could not open thread');
        }
        setMessages(data.messages ?? []);
        await loadFellowship();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not open thread');
        setMessages([]);
      } finally {
        setThreadLoading(false);
      }
    },
    [loadFellowship],
  );

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  const respond = async (friendshipId: string, action: 'accept' | 'decline') => {
    try {
      const res = await fetch('/api/friends', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId, action }),
      });
      if (!res.ok) throw new Error('Could not answer request');
      await loadFellowship();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not answer request');
    }
  };

  const send = async () => {
    const body = draft.trim();
    if (!body || !activeUsername || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: activeUsername, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data?.error === 'string' ? data.error : 'Could not send message');
      }
      setMessages((prev) => [...prev, data.message]);
      setDraft('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className={styles.stateMsg}>Gathering your fellowship...</div>;

  const activeFriend = friends.find((f) => f.username === activeUsername);

  return (
    <div className={styles.wrapper}>
      <div className={styles.column}>
        <h2 className={styles.title}>🤝 Fellowship</h2>

        {incoming.length > 0 && (
          <>
            <h3 className={styles.subTitle}>Pending Requests</h3>
            {incoming.map((req) => (
              <div key={req.friendshipId} className={styles.requestRow}>
                <Avatar url={req.avatarUrl} name={req.displayName} />
                <span className={styles.friendInfo}>
                  <span className={styles.friendName}>{req.displayName}</span>
                  <span className={styles.friendMeta}>
                    {req.heroClass ?? 'Adventurer'} · Lv {req.level}
                  </span>
                </span>
                <span className={styles.reqBtns}>
                  <button className={styles.accept} onClick={() => respond(req.friendshipId, 'accept')}>
                    Accept
                  </button>
                  <button className={styles.decline} onClick={() => respond(req.friendshipId, 'decline')}>
                    Decline
                  </button>
                </span>
              </div>
            ))}
          </>
        )}

        <h3 className={styles.subTitle}>Friends ({friends.length})</h3>
        {friends.length === 0 ? (
          <p className={styles.empty}>
            No companions yet. Find heroes in the directory and send a request.
            <br />
            <Link href="/heroes" className={styles.browseLink}>
              Browse the Hall of Heroes →
            </Link>
          </p>
        ) : (
          friends.map((friend) => (
            <button
              key={friend.id}
              type="button"
              className={`${styles.friendRow} ${
                friend.username === activeUsername ? styles.friendRowActive : ''
              }`}
              onClick={() => friend.username && openThread(friend.username)}
            >
              <Avatar url={friend.avatarUrl} name={friend.displayName} />
              <span className={styles.friendInfo}>
                <span className={styles.friendName}>{friend.displayName}</span>
                <span className={styles.friendMeta}>
                  {friend.heroClass ?? 'Adventurer'} · Lv {friend.level}
                </span>
              </span>
              {friend.unreadCount > 0 && (
                <span className={styles.unreadDot}>{friend.unreadCount}</span>
              )}
            </button>
          ))
        )}
      </div>

      <div className={styles.column}>
        {!activeFriend ? (
          <div className={styles.placeholder}>
            Select a companion to open your correspondence.
          </div>
        ) : (
          <div className={styles.thread}>
            <div className={styles.threadHeader}>
              <Avatar url={activeFriend.avatarUrl} name={activeFriend.displayName} />
              <span className={styles.friendInfo}>
                <span className={styles.friendName}>{activeFriend.displayName}</span>
                <span className={styles.friendMeta}>
                  {activeFriend.heroClass ?? 'Adventurer'} · Lv {activeFriend.level}
                </span>
              </span>
              {activeFriend.username && (
                <Link href={`/u/${activeFriend.username}`} className={styles.browseLink}>
                  View Codex →
                </Link>
              )}
            </div>

            <div className={styles.messages}>
              {threadLoading ? (
                <p className={styles.empty}>Opening the correspondence...</p>
              ) : messages.length === 0 ? (
                <p className={styles.empty}>No messages yet — send the first word.</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${styles.bubble} ${msg.fromMe ? styles.bubbleMine : styles.bubbleTheirs}`}
                  >
                    {msg.body}
                    <span className={styles.stamp}>
                      {new Date(msg.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )}
              <div ref={messagesEnd} />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.composer}>
              <textarea
                className={styles.input}
                value={draft}
                maxLength={1000}
                placeholder="Send word to your companion..."
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <button
                type="button"
                className={styles.sendBtn}
                onClick={send}
                disabled={sending || draft.trim().length === 0}
              >
                {sending ? '...' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
