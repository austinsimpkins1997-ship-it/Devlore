import React from 'react';
import {
  AURAS,
  BODIES,
  CLOAKS,
  EYES,
  HAIRS,
  MARKINGS,
  SKINS,
  colorOf,
  type CharacterAppearance,
} from '@/lib/character';

interface HeroAvatarProps {
  appearance: CharacterAppearance;
  size?: number;
  /** Slots with an item equipped - adds metal trim to the drawing. */
  equippedSlots?: string[];
}

/** Per-build proportions. Keeps the silhouette readable at small sizes. */
const BUILD_SHAPE: Record<string, { shoulder: number; torso: number; scale: number; legGap: number }> = {
  neutral: { shoulder: 29, torso: 40, scale: 1, legGap: 4 },
  broad: { shoulder: 35, torso: 48, scale: 1.04, legGap: 6 },
  lithe: { shoulder: 24, torso: 33, scale: 0.97, legGap: 3 },
  towering: { shoulder: 30, torso: 40, scale: 1.1, legGap: 5 },
  compact: { shoulder: 31, torso: 43, scale: 0.9, legGap: 4 },
};

/**
 * Pure SVG paper doll. No external assets and no client JS, so it renders
 * identically in server components and client trees.
 */
export function HeroAvatar({ appearance, size = 220, equippedSlots = [] }: HeroAvatarProps) {
  const skin = colorOf(SKINS, appearance.charSkin);
  const hair = colorOf(HAIRS, appearance.charHair);
  const cloak = colorOf(CLOAKS, appearance.charCloak);
  const aura = colorOf(AURAS, appearance.charAura);
  const eyes = colorOf(EYES, appearance.charEyes);
  const marking = colorOf(MARKINGS, appearance.charMarking);

  const hasAura = appearance.charAura !== 'none';
  const hasHair = appearance.charHair !== 'shorn';
  const hasMarking = appearance.charMarking !== 'none';

  const buildId = BODIES.some((b) => b.id === appearance.charBody) ? appearance.charBody : 'neutral';
  const { shoulder, torso, scale, legGap } = BUILD_SHAPE[buildId] ?? BUILD_SHAPE.neutral;

  const has = (slot: string) => equippedSlots.includes(slot);
  const trim = '#c9a84c';

  // Unique-enough id so multiple avatars on one page do not share gradients.
  const uid = `${appearance.charAura}-${appearance.charSkin}-${buildId}`;

  const torsoLeft = 60 - torso / 2;
  const legLeft = 60 - legGap / 2 - 8;
  const legRight = 60 + legGap / 2;

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
            <radialGradient id={`aura-${uid}`}>
              <stop offset="0%" stopColor={aura} stopOpacity="0.55" />
              <stop offset="70%" stopColor={aura} stopOpacity="0.12" />
              <stop offset="100%" stopColor={aura} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="60" cy="80" r="58" fill={`url(#aura-${uid})`} />
        </>
      )}

      <g transform={`translate(60 84) scale(${scale}) translate(-60 -84)`}>
        {/* Cloak */}
        <path
          d={`M${60 - shoulder} 56 L${60 + shoulder} 56 L${60 + shoulder + 6} 128 L${60 - shoulder - 6} 128 Z`}
          fill={cloak}
          opacity="0.95"
        />
        <path
          d={`M${60 - shoulder} 56 L60 68 L${60 + shoulder} 56 Z`}
          fill={cloak}
          opacity="0.6"
        />

        {/* Legs */}
        <rect x={legLeft} y="110" width="8" height="30" rx="3" fill={skin} />
        <rect x={legRight} y="110" width="8" height="30" rx="3" fill={skin} />
        <rect x={legLeft - 3} y="138" width="14" height="6" rx="2" fill="#2b2b38" />
        <rect x={legRight - 1} y="138" width="14" height="6" rx="2" fill="#2b2b38" />

        {/* Torso / armor */}
        <rect
          x={torsoLeft}
          y="56"
          width={torso}
          height="56"
          rx="8"
          fill={has('ARMOR') ? '#5b6478' : skin}
          stroke={has('ARMOR') ? trim : 'none'}
          strokeWidth={has('ARMOR') ? 2 : 0}
        />
        {has('ARMOR') && (
          <>
            <path d="M60 58 L60 110" stroke={trim} strokeWidth="1.5" opacity="0.7" />
            <path d={`M${torsoLeft + 4} 72 L${torsoLeft + torso - 4} 72`} stroke={trim} strokeWidth="1" opacity="0.5" />
          </>
        )}

        {/* Arms */}
        <rect x={torsoLeft - 9} y="60" width="9" height="40" rx="4" fill={skin} />
        <rect x={torsoLeft + torso} y="60" width="9" height="40" rx="4" fill={skin} />

        {/* Head */}
        <circle cx="60" cy="38" r="16" fill={skin} />

        {/* Hair */}
        {hasHair && (
          <path d="M44 34 A16 16 0 0 1 76 34 L76 29 A16 16 0 0 0 44 29 Z" fill={hair} />
        )}

        {/* Helm */}
        {has('HELM') && (
          <>
            <path d="M43 34 A17 17 0 0 1 77 34 L77 29 A17 17 0 0 0 43 29 Z" fill="#6b7488" stroke={trim} strokeWidth="1.5" />
            <rect x="57" y="23" width="6" height="15" rx="2" fill={trim} opacity="0.85" />
          </>
        )}

        {/* Facial markings - drawn under the eyes so they never obscure them */}
        {hasMarking && appearance.charMarking === 'warpaint' && (
          <path d="M48 42 L72 42 L69 47 L51 47 Z" fill={marking} opacity="0.7" />
        )}
        {hasMarking && appearance.charMarking === 'runes' && (
          <>
            <path d="M48 34 L48 38 M46 36 L50 36" stroke={marking} strokeWidth="1.2" opacity="0.9" />
            <path d="M72 34 L72 38 M70 36 L74 36" stroke={marking} strokeWidth="1.2" opacity="0.9" />
          </>
        )}
        {hasMarking && appearance.charMarking === 'scar' && (
          <path d="M67 32 L63 48" stroke={marking} strokeWidth="1.4" opacity="0.85" />
        )}
        {hasMarking && appearance.charMarking === 'tearline' && (
          <>
            <path d="M54 43 L54 50" stroke={marking} strokeWidth="1.6" opacity="0.85" />
            <path d="M66 43 L66 50" stroke={marking} strokeWidth="1.6" opacity="0.85" />
          </>
        )}
        {hasMarking && appearance.charMarking === 'circuit' && (
          <>
            <path d="M46 40 L51 40 L51 45" stroke={marking} strokeWidth="1" fill="none" opacity="0.9" />
            <path d="M74 40 L69 40 L69 45" stroke={marking} strokeWidth="1" fill="none" opacity="0.9" />
            <circle cx="46" cy="40" r="1.2" fill={marking} />
            <circle cx="74" cy="40" r="1.2" fill={marking} />
          </>
        )}

        {/* Eyes */}
        <circle cx="54" cy="40" r="2.1" fill={eyes} />
        <circle cx="66" cy="40" r="2.1" fill={eyes} />
        <circle cx="54.6" cy="39.4" r="0.7" fill="#ffffff" opacity="0.75" />
        <circle cx="66.6" cy="39.4" r="0.7" fill="#ffffff" opacity="0.75" />

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
            <circle cx="22" cy="74" r="7" fill={hasAura ? aura : '#7c3aed'} opacity="0.85" />
            <circle cx="22" cy="74" r="10" fill="none" stroke={trim} strokeWidth="1.2" opacity="0.7" />
          </>
        )}
      </g>
    </svg>
  );
}
