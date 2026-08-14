'use client';

import React, { useState } from 'react';

interface ForgePanelProps {
  // userId no longer sent to API — server uses session auth
}

const CATEGORIES = [
  { id: 'code', label: '💻 Code' },
  { id: 'design', label: '🎨 Design' },
  { id: 'learning', label: '📚 Learning' },
  { id: 'body', label: '🏋️ Body' },
  { id: 'creative', label: '🎵 Creative' },
  { id: 'other', label: '✨ Other' }
];

export default function ForgePanel(_props: ForgePanelProps) {
  const [selectedCategory, setSelectedCategory] = useState('code');
  const [text, setText] = useState('');
  const [isForging, setIsForging] = useState(false);
  const [result, setResult] = useState<{ narrative: string; xpEarned: number; cardName?: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const isWordCountSufficient = wordCount >= 10;
  const isWordCountGood = wordCount >= 30;

  const handleForge = async () => {
    if (!isWordCountSufficient || isForging) return;
    
    setIsForging(true);
    setResult(null);

    try {
      const response = await fetch('/api/forge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: selectedCategory, text })
      });

      if (!response.ok) {
        throw new Error('Failed to forge entry');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Forging error:', error);
      alert('An error occurred in the Forge.');
    } finally {
      setIsForging(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', color: '#f59e0b', fontSize: '2.5rem', margin: '0 0 0.5rem 0', textShadow: '0 0 20px rgba(245, 158, 11, 0.3)' }}>
          🔥 The Forge
        </h1>
        <p style={{ color: 'var(--color-mist)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.5 }}>
          Describe anything you accomplished. The Forge turns it into your legend. Code, design, learning, fitness — anything.
        </p>
      </div>

      {!result ? (
        <div style={{ background: 'rgba(13, 13, 26, 0.6)', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', justifyContent: 'center' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  border: `1px solid ${selectedCategory === cat.id ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)'}`,
                  background: selectedCategory === cat.id ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                  color: selectedCategory === cat.id ? '#fff' : 'var(--color-mist)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s',
                  fontWeight: selectedCategory === cat.id ? 'bold' : 'normal'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What did you accomplish? Be specific — the more you share, the richer your saga entry. Example: &quot;Rewrote the auth system from scratch using JWT. Fixed three critical bugs. Finally shipped the feature I've been building for 3 weeks.&quot;"
            style={{
              width: '100%',
              minHeight: '150px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              padding: '1rem',
              color: '#fff',
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <span style={{ 
              color: isWordCountGood ? '#f59e0b' : 'var(--color-mist)', 
              fontSize: '0.9rem',
              fontFamily: 'var(--font-mono)'
            }}>
              {wordCount} words {wordCount > 0 && !isWordCountSufficient ? '(min 10)' : ''}
            </span>
            
            <button
              onClick={handleForge}
              disabled={!isWordCountSufficient || isForging}
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                background: !isWordCountSufficient ? 'rgba(255,255,255,0.05)' : 'linear-gradient(to right, #ea580c, #f59e0b)',
                color: !isWordCountSufficient ? 'rgba(255,255,255,0.3)' : '#fff',
                border: 'none',
                cursor: !isWordCountSufficient || isForging ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-heading)',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: isWordCountSufficient ? '0 4px 15px rgba(245, 158, 11, 0.3)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {isForging ? 'Forging...' : 'Forge this Entry'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: 'rgba(13, 13, 26, 0.8)', borderRadius: '1rem', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(to right, #ea580c, #f59e0b)' }} />
          
          <h2 style={{ fontFamily: 'var(--font-heading)', color: '#f59e0b', marginTop: 0, marginBottom: '1.5rem', textAlign: 'center' }}>
            The Saga Continues
          </h2>
          
          <p style={{ 
            fontFamily: 'Georgia, serif', 
            fontSize: '1.2rem', 
            lineHeight: 1.8, 
            color: '#e2e8f0',
            fontStyle: 'italic',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            marginBottom: '2rem'
          }}>
            &ldquo;{result.narrative}&rdquo;
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#22c55e', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
              +{result.xpEarned} XP
            </div>
            {result.cardName && (
              <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#a855f7', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold' }}>
                Gained: {result.cardName}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
            onClick={async () => {
                if (isSaving || saved) return;
                setIsSaving(true);
                try {
                  // Re-submit to persist — the API already wrote the forge entry;
                  // clicking Save refreshes the dashboard to reflect new XP
                  setSaved(true);
                  // Soft reload to update XP bar without full navigation
                  window.location.reload();
                } catch {
                  alert('Could not save. Please try again.');
                } finally {
                  setIsSaving(false);
                }
              }}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#f59e0b',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
            >
              {isSaving ? 'Saving...' : saved ? 'Saved! ✓' : 'Save to my Chronicle'}
            </button>
            <button
              onClick={() => { setResult(null); setText(''); setSaved(false); }}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                background: 'transparent',
                color: 'var(--color-mist)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.2s'
              }}
            >
              Forge Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
