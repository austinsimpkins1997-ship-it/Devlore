'use client';

import React, { useState } from 'react';
import { HeroAvatar } from './HeroAvatar';
import styles from './CharacterCreator.module.css';
import {
  APPEARANCE_COMBINATIONS,
  AURAS,
  BODIES,
  CLOAKS,
  DEFAULT_APPEARANCE,
  EYES,
  HAIRS,
  MARKINGS,
  PRESETS,
  SKINS,
  randomAppearance,
  type AppearanceOption,
  type CharacterAppearance,
} from '@/lib/character';

interface CharacterCreatorProps {
  initial?: CharacterAppearance;
  onSaved: () => void | Promise<void>;
  onCancel?: () => void;
  /** First-run copy differs from the "edit appearance" flow. */
  firstRun?: boolean;
}

const GROUPS: Array<{
  key: keyof CharacterAppearance;
  label: string;
  options: readonly AppearanceOption[];
  showSwatch: boolean;
}> = [
  { key: 'charBody', label: 'Build', options: BODIES, showSwatch: false },
  { key: 'charSkin', label: 'Skin', options: SKINS, showSwatch: true },
  { key: 'charHair', label: 'Hair', options: HAIRS, showSwatch: true },
  { key: 'charEyes', label: 'Eyes', options: EYES, showSwatch: true },
  { key: 'charMarking', label: 'Markings', options: MARKINGS, showSwatch: true },
  { key: 'charCloak', label: 'Cloak', options: CLOAKS, showSwatch: true },
  { key: 'charAura', label: 'Aura', options: AURAS, showSwatch: true },
];

export function CharacterCreator({
  initial,
  onSaved,
  onCancel,
  firstRun = false,
}: CharacterCreatorProps) {
  const [appearance, setAppearance] = useState<CharacterAppearance>(
    initial ?? DEFAULT_APPEARANCE,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const choose = (key: keyof CharacterAppearance, id: string) =>
    setAppearance((prev) => ({ ...prev, [key]: id }));

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/character', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appearance),
      });
      if (!res.ok) throw new Error('Could not save your character');
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your character');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.preview}>
        <div className={styles.dollFrame}>
          <HeroAvatar
            appearance={appearance}
            size={230}
            equippedSlots={['WEAPON', 'ARMOR', 'HELM', 'RELIC']}
          />
        </div>
        <button
          type="button"
          className={styles.randomBtn}
          onClick={() => setAppearance(randomAppearance())}
        >
          🎲 Randomize
        </button>
        <p className={styles.comboCount}>
          {APPEARANCE_COMBINATIONS.toLocaleString()} possible heroes
        </p>
      </div>

      <div>
        <h2 className={styles.title}>
          {firstRun ? 'Forge Your Hero' : 'Customize Your Hero'}
        </h2>
        <p className={styles.subtitle}>
          {firstRun
            ? 'Every legend needs a face. Choose your look — you can change it any time from the Character tab. Gear you earn will appear on this figure.'
            : 'Adjust your appearance. Equipped gear is shown on the preview.'}
        </p>

        <div className={styles.group}>
          <span className={styles.groupLabel}>Archetypes</span>
          <div className={styles.options}>
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={styles.presetBtn}
                title={preset.blurb}
                onClick={() => setAppearance(preset.appearance)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {GROUPS.map((group) => (
          <div key={group.key} className={styles.group}>
            <span className={styles.groupLabel}>{group.label}</span>
            <div className={styles.options}>
              {group.options.map((option) => {
                const active = appearance[group.key] === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`${styles.option} ${active ? styles.optionActive : ''}`}
                    onClick={() => choose(group.key, option.id)}
                    aria-pressed={active}
                  >
                    {group.showSwatch && (
                      <span
                        className={styles.swatch}
                        style={{
                          background:
                            option.color === 'transparent' ? 'rgba(255,255,255,0.08)' : option.color,
                        }}
                      />
                    )}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : firstRun ? 'Begin My Saga' : 'Save Appearance'}
          </button>
          {onCancel && (
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
