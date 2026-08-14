'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/marketing/Navbar';

export default function ArenaPage() {
  const [fighterA, setFighterA] = useState('');
  const [fighterB, setFighterB] = useState('');
  const [battling, setBattling] = useState(false);
  const [result, setResult] = useState(false);

  const handleBattle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fighterA || !fighterB) return;
    
    setBattling(true);
    setResult(false);
    
    setTimeout(() => {
      setBattling(false);
      setResult(true);
    }, 1500);
  };

  return (
    <>
      <Navbar />
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-void)',
        paddingTop: '100px',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: 'white',
        fontFamily: 'var(--font-body)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: '4rem', 
            margin: '0 0 1rem 0',
            background: 'linear-gradient(to right, var(--color-rune), var(--color-arcane))',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}>
            The Arena
          </h1>
          <p style={{ color: 'var(--color-mist)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
            Two legends. One saga. Who forged the greater legacy?
          </p>
        </div>

        <form onSubmit={handleBattle} style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '4rem',
          maxWidth: '800px',
          width: '100%'
        }}>
          <input
            type="text"
            placeholder="GitHub Username"
            value={fighterA}
            onChange={(e) => setFighterA(e.target.value)}
            style={{
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid var(--color-rune)',
              backgroundColor: 'var(--color-abyss)',
              color: 'white',
              fontSize: '1.25rem',
              fontFamily: 'var(--font-mono)',
              width: '100%',
              flex: '1 1 250px',
              outline: 'none',
              boxShadow: '0 0 10px var(--color-rune-glow)'
            }}
          />
          <div style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: '2rem',
            color: 'var(--color-mist)',
            fontWeight: 'bold'
          }}>
            VS
          </div>
          <input
            type="text"
            placeholder="GitHub Username"
            value={fighterB}
            onChange={(e) => setFighterB(e.target.value)}
            style={{
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid var(--color-arcane)',
              backgroundColor: 'var(--color-abyss)',
              color: 'white',
              fontSize: '1.25rem',
              fontFamily: 'var(--font-mono)',
              width: '100%',
              flex: '1 1 250px',
              outline: 'none',
              boxShadow: '0 0 10px var(--color-arcane-glow)'
            }}
          />
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <button
              type="submit"
              disabled={battling || !fighterA || !fighterB}
              style={{
                padding: '1rem 3rem',
                fontSize: '1.25rem',
                fontFamily: 'var(--font-heading)',
                fontWeight: 'bold',
                backgroundColor: 'var(--color-rune)',
                color: 'var(--color-void)',
                border: 'none',
                borderRadius: '8px',
                cursor: (battling || !fighterA || !fighterB) ? 'not-allowed' : 'pointer',
                opacity: (battling || !fighterA || !fighterB) ? 0.7 : 1,
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px var(--color-rune-glow)'
              }}
            >
              {battling ? 'Summoning Heroes...' : 'Begin the Battle'}
            </button>
          </div>
        </form>

        {result && (
          <div style={{
            width: '100%',
            maxWidth: '1000px',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <div style={{
              textAlign: 'center',
              backgroundColor: 'rgba(245,158,11,0.1)',
              border: '1px solid var(--color-rune)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '3rem'
            }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--color-rune)' }}>
                Victory declared: {fighterA}
              </h2>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--color-mist)', fontSize: '0.875rem' }}>
                Connect GitHub for real results
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '2rem',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {/* Fighter A Card */}
              <div style={{
                flex: '1 1 300px',
                backgroundColor: 'var(--color-abyss)',
                border: '1px solid var(--color-rune)',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 0 20px var(--color-rune-glow)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', margin: '0 0 1rem 0' }}>
                  @{fighterA}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ color: 'var(--color-mist)', fontSize: '0.875rem' }}>COMMITS</div>
                    <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>9,342</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--color-mist)', fontSize: '0.875rem' }}>TOP LANGUAGE</div>
                    <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>TypeScript</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--color-mist)', fontSize: '0.875rem' }}>STARS EARNED</div>
                    <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>142</div>
                  </div>
                </div>
              </div>

              {/* VS Divider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-heading)',
                fontSize: '3rem',
                color: 'var(--color-shadow)',
                textShadow: '0 0 10px white'
              }}>
                ⚡
              </div>

              {/* Fighter B Card */}
              <div style={{
                flex: '1 1 300px',
                backgroundColor: 'var(--color-abyss)',
                border: '1px solid var(--color-arcane)',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 0 20px var(--color-arcane-glow)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', margin: '0 0 1rem 0' }}>
                  @{fighterB}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ color: 'var(--color-mist)', fontSize: '0.875rem' }}>COMMITS</div>
                    <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>4,812</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--color-mist)', fontSize: '0.875rem' }}>TOP LANGUAGE</div>
                    <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>Rust</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--color-mist)', fontSize: '0.875rem' }}>STARS EARNED</div>
                    <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>89</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
