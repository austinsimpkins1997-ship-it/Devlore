'use client';

import { useEffect, useRef } from 'react';

/**
 * AutoAnalyze: Silently fires /api/github/analyze on first mount
 * when the user has no heroClass yet. Reloads the page on success.
 * Idempotent: uses a sessionStorage flag so it only fires once per session.
 */
export function AutoAnalyze() {
  const fired = useRef(false);

  useEffect(() => {
    // Already fired in this session?
    if (sessionStorage.getItem('devlore_analyzed') === '1') return;
    if (fired.current) return;
    fired.current = true;

    (async () => {
      try {
        const res = await fetch('/api/github/analyze', { method: 'POST' });
        if (res.ok) {
          sessionStorage.setItem('devlore_analyzed', '1');
          // Small delay so any DB writes settle before reload
          setTimeout(() => window.location.reload(), 500);
        }
        // On failure: silently fail — user still sees the manual button as fallback
      } catch {
        // Network error: silently ignore — manual button is fallback
      }
    })();
  }, []);

  return null; // renders nothing visible
}
