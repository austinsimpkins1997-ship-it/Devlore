import React from 'react';
import {
  AURAS,
  BODIES,
  CLOAKS,
  HAIRS,
  SKINS,
  colorOf,
  type CharacterAppearance,
} from '@/lib/character';

interface HeroAvatarProps {
  appearance: CharacterAppearance;
  size?: number;
  /** Slots with an item equipped — adds metal trim to the drawing. */
  equippedSlots?: string[];
}

/**
 * Pure SVG paper doll. No external assets, no client JS — renders identically
 * on the server and in client trees.
 */
export function HeroAvatar({ appearance, size = 220, equippedSlots = [] }: HeroAvatarProps) {
  const skin = colorOf(SKINS, appearance.charSkin);
  const hair = colorOf(HAIRS, appearance.charHair);
  const cloak = colorOf(CLOAKS, appearance.charCloak);
  const aura = colorOf(AURAS, appearance.charAura);
  const hasAura = appearance.charAura !== 'none';

  const body = BODIES.find((b) => b.id === appearance.charBody)?.id ?? 'neutral';
  const shoulder = body === 'broad' ? 34 : body === 'lithe' ? 24 : 29;
  const torsoWidth = body === 'broad' ? 46 : body === 'lithe' ? 34 : 40;

  const has = (slot: string) => equippedSlots.includes(slot);
  const trim = '#c9a84c';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 160"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Hero character"
    >
      {hasAura && (
        <>
          <defs>
            <radialGradient id="auraGrad">
              <stop offset="0%" stopColor={aura} stopOpacity="0.55" />
              <stop offset="100%" stopColor={aura} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="60" cy="80" r="58" fill="url(#auraGrad)" />
        </>
      )}

      {/* Cloak */}
      <path
        d={`M${60 - shoulder} 56 L${60 + shoulder} 56 L${60 + shoulder + 6} 128 L${60 - shoulder - 6} 128 Z`}
        fill={cloak}
        opacity="0.95"
      />

      {/* Legs */}
      <rect x="50" y="110" width="8" height="30" rx="3" fill={skin} />
      <rect x="62" y="110" width="8" height="30" rx="3" fill={skin} />
      <rect x="47" y="138" width="14" height="6" rx="2" fill="#2b2b38" />
      <rect x="59" y="138" width="14" height="6" rx="2" fill="#2b2b38" />

      {/* Torso / armor */}
      <rect
        x={60 - torsoWidth / 2}
        y="56"
        width={torsoWidth}
        height="56"
        rx="8"
        fill={has('ARMOR') ? '#5b6478' : skin}
        stroke={has('ARMOR') ? trim : 'none'}
        strokeWidth={has('ARMOR') ? 2 : 0}
      />
      {has('ARMOR') && (
        <path d={`M60 58 L60 110`} stroke={trim} strokeWidth="1.5" opacity="0.7" />
      )}

      {/* Arms */}
      <rect x={60 - torsoWidth / 2 - 9} y="60" width="9" height="40" rx="4" fill={skin} />
      <rect x={60 + torsoWidth / 2} y="60" width="9" height="40" rx="4" fill={skin} />

      {/* Head */}
      <circle cx="60" cy="38" r="16" fill={skin} />
      {/* Hair */}
      <path d="M44 34 A16 16 0 0 1 76 34 L76 30 A16 16 0 0 0 44 30 Z" fill={hair} />
      {/* Helm */}
      {has('HELM') && (
        <>
          <path d="M43 34 A17 17 0 0 1 77 34 L77 29 A17 17 0 0 0 43 29 Z" fill="#6b7488" stroke={trim} strokeWidth="1.5" />
          <rect x="57" y="24" width="6" height="14" rx="2" fill={trim} opacity="0.8" />
        </>
      )}
      {/* Eyes */}
      <circle cx="54" cy="40" r="1.8" fill="#1c1c22" />
      <circle cx="66" cy="40" r="1.8" fill="#1c1c22" />

      {/* Weapon */}
      {has('WEAPON') && (
        <g>
          <rect x="94" y="46" width="4" height="52" rx="1.5" fill="#d8dce4" />
          <rect x="90" y="96" width="12" height="4" rx="1.5" fill={trim} />
          <rect x="94" y="100" width="4" height="12" rx="1.5" fill="#6b5836" />
        </g>
      )}

      {/* Relic */}
      {has('RELIC') && (
        <>
          <circle cx="22" cy="74" r="7" fill={aura !== 'transparent' ? aura : '#7c3aed'} opacity="0.85" />
          <circle cx="22" cy="74" r="10" fill="none" stroke={trim} strokeWidth="1.2" opacity="0.7" />
        </>
      )}
    </svg>
  );
}
