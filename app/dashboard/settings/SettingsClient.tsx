'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UpgradeButton } from '@/components/billing/UpgradeButton';
import { regenerateWebhookToken, signOutAction, updatePreferences } from './actions';
import styles from './settings.module.css';

export interface SettingsUser {
  email: string | null;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  heroClass: string | null;
  heroTitle: string | null;
  level: number;
  xp: number;
  tier: string;
  isPublic: boolean;
  emailChronicle: boolean;
  webhookToken: string;
  createdAt: string;
  lastAnalyzedAt: string | null;
  trialEndsAt: string | null;
  subCurrentPeriodEnd: string | null;
  hasBillingAccount: boolean;
  githubConnected: boolean;
  githubScope: string | null;
  githubAccountId: string | null;
  totalCommits: number;
  currentStreak: number;
  longestStreak: number;
  languageCount: number;
  charCreated: boolean;
  chapterCount: number;
  loreCardCount: number;
  equipmentCount: number;
  trophyCount: number;
}

interface SettingsClientProps {
  user: SettingsUser;
  appUrl: string;
  checkoutStatus: string | null;
  requestedPlan: string | null;
}

const PLAN_COPY = {
  PRO: {
    name: 'Hero',
    price: '$5',
    features: [
      'Automatic weekly AI chronicles',
      'Unlimited chapter history',
      'Weekly quest XP claims',
      'Chronicle emails & on-demand sync',
    ],
  },
  LEGEND: {
    name: 'Legend',
    price: '$15',
    features: [
      'Everything in Hero',
      '1.5× XP on every quest claim',
      'Unlimited lore card collection',
      'Legend flair on the leaderboard',
    ],
  },
} as const;

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(iso: string | null): string {
  if (!iso) return 'never';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function SettingsClient({
  user,
  appUrl,
  checkoutStatus,
  requestedPlan,
}: SettingsClientProps) {
  const [isPublic, setIsPublic] = useState(user.isPublic);
  const [emailChronicle, setEmailChronicle] = useState(user.emailChronicle);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [tokenBusy, setTokenBusy] = useState(false);

  const isPaid = user.tier === 'PRO' || user.tier === 'LEGEND';
  const publicUrl = user.username ? `${appUrl}/u/${user.username}` : null;

  const tierClass =
    user.tier === 'LEGEND' ? styles.tierLegend : user.tier === 'PRO' ? styles.tierPro : styles.tierFree;

  async function handleSave(formData: FormData) {
    setSaving(true);
    setSaveMsg(null);
    try {
      await updatePreferences(formData);
      setSaveMsg({ ok: true, text: '✓ Preferences saved' });
    } catch {
      setSaveMsg({ ok: false, text: '✗ Could not save. Please try again.' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 4000);
    }
  }

  async function handleSync() {
    if (syncing) return;
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch('/api/account/sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data?.error === 'string' ? data.error : 'Sync failed');
      }
      setSyncMsg({
        ok: true,
        text: `✓ Synced — ${data.stats.totalCommits.toLocaleString()} commits, ${data.stats.currentStreak}d streak, ${data.stats.languageCount} languages.`,
      });
      setTimeout(() => window.location.reload(), 1600);
    } catch (err) {
      setSyncMsg({ ok: false, text: err instanceof Error ? err.message : 'Sync failed' });
    } finally {
      setSyncing(false);
    }
  }

  function copyToken() {
    navigator.clipboard?.writeText(user.webhookToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <Link href="/dashboard" className={styles.backLink}>
          ← Back to your saga
        </Link>
      </header>

      {checkoutStatus === 'success' && (
        <p className={`${styles.banner} ${styles.bannerSuccess}`}>
          ✓ Payment received. Your membership activates as soon as Stripe confirms the
          subscription — usually within a few seconds. Refresh if the tier below still
          shows the old plan.
        </p>
      )}
      {checkoutStatus === 'cancelled' && (
        <p className={`${styles.banner} ${styles.bannerInfo}`}>
          Checkout cancelled — nothing was charged. You can upgrade any time below.
        </p>
      )}
      {requestedPlan && !isPaid && !checkoutStatus && (
        <p className={`${styles.banner} ${styles.bannerInfo}`}>
          You&apos;re signed in. Continue your {requestedPlan} upgrade below.
        </p>
      )}
      {!user.charCreated && (
        <p className={`${styles.banner} ${styles.bannerWarn}`}>
          You haven&apos;t forged your hero&apos;s appearance yet.{' '}
          <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'underline' }}>
            Create your character →
          </Link>
        </p>
      )}

      <div className={styles.sections}>
        {/* ── Account ─────────────────────────────────────────────── */}
        <section className={`${styles.card} ${styles.cardAccent}`}>
          <h2 className={styles.cardTitle}>Account</h2>
          <p className={styles.cardHint}>
            Signed in with GitHub. DevLore never stores your GitHub password — only an
            OAuth token scoped to reading your public activity.
          </p>

          <div className={styles.profileRow}>
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.displayName}
                width={64}
                height={64}
                className={styles.avatar}
              />
            ) : (
              <span className={styles.avatarFallback}>{user.displayName.charAt(0)}</span>
            )}
            <div>
              <div className={styles.profileName}>{user.displayName}</div>
              <div className={styles.profileMeta}>
                {user.email ?? 'No email on file'}
                {user.username ? ` · @${user.username}` : ''}
              </div>
              <div className={styles.profileMeta}>
                {user.heroClass ?? 'Unclassed'} · Level {user.level} · {user.xp.toLocaleString()} XP
              </div>
              {publicUrl && (
                <a href={publicUrl} target="_blank" rel="noreferrer" className={styles.profileLink}>
                  {publicUrl} ↗
                </a>
              )}
            </div>
          </div>

          <div className={styles.statStrip}>
            {[
              ['Member since', formatDate(user.createdAt)],
              ['GitHub', user.githubConnected ? 'Connected' : 'Not connected'],
              ['Chapters', user.chapterCount],
              ['Lore cards', user.loreCardCount],
              ['Equipment', user.equipmentCount],
              ['Trophies', user.trophyCount],
            ].map(([label, value]) => (
              <div key={label as string} className={styles.stat}>
                <div className={styles.statValue}>{value}</div>
                <div className={styles.statLabel}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Membership ──────────────────────────────────────────── */}
        <section className={`${styles.card} ${styles.cardAccent}`}>
          <h2 className={styles.cardTitle}>Membership</h2>
          <p className={styles.cardHint}>
            Paid plans start with a 14-day free trial. Cancel any time — you keep every
            chapter, card, and item you have already earned.
          </p>

          <div className={styles.tierRow}>
            <div>
              <span className={`${styles.tierBadge} ${tierClass}`}>{user.tier}</span>
              <div className={styles.profileMeta} style={{ marginTop: '0.5rem' }}>
                {user.trialEndsAt && new Date(user.trialEndsAt) > new Date()
                  ? `Trial ends ${formatDate(user.trialEndsAt)}`
                  : user.subCurrentPeriodEnd
                    ? `Renews ${formatDate(user.subCurrentPeriodEnd)}`
                    : 'No active subscription'}
              </div>
            </div>
            {user.hasBillingAccount && (
              <a href="/api/stripe/portal" className={styles.outlineBtn}>
                Manage billing & invoices ↗
              </a>
            )}
          </div>

          <div className={styles.planGrid}>
            {(['PRO', 'LEGEND'] as const).map((plan) => {
              const copy = PLAN_COPY[plan];
              const isCurrent = user.tier === plan;
              return (
                <div
                  key={plan}
                  className={`${styles.plan} ${isCurrent ? styles.planCurrent : ''}`}
                >
                  <h3 className={styles.planName}>{copy.name}</h3>
                  <div className={styles.planPrice}>
                    {copy.price}
                    <span>/mo</span>
                  </div>
                  <ul className={styles.planList}>
                    {copy.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <span className={styles.currentTag}>✓ Your current plan</span>
                  ) : (
                    <UpgradeButton
                      plan={plan}
                      label={
                        user.tier === 'LEGEND' && plan === 'PRO'
                          ? 'Switch to Hero'
                          : `Upgrade to ${copy.name}`
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Preferences ─────────────────────────────────────────── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Preferences</h2>
          <p className={styles.cardHint}>
            Controls how your saga is shared and delivered.
          </p>

          <form action={handleSave}>
            <div className={styles.toggleRow}>
              <div>
                <div className={styles.toggleLabel}>Public codex</div>
                <div className={styles.toggleHint}>
                  Lets anyone view your saga, badges, armory, and trophies at your public
                  URL. Turning this off also removes you from the leaderboard, the Hall of
                  Heroes, and the Arena.
                </div>
              </div>
              <input
                type="checkbox"
                name="isPublic"
                className={styles.checkbox}
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
            </div>

            <div className={styles.toggleRow}>
              <div>
                <div className={styles.toggleLabel}>Weekly chronicle emails</div>
                <div className={styles.toggleHint}>
                  {isPaid
                    ? 'Receive your new saga chapter every Monday morning.'
                    : 'Available on Hero and Legend. Upgrade above to enable weekly delivery.'}
                </div>
              </div>
              <input
                type="checkbox"
                name="emailChronicle"
                className={styles.checkbox}
                checked={emailChronicle}
                disabled={!isPaid}
                onChange={(e) => setEmailChronicle(e.target.checked)}
              />
            </div>

            <div className={styles.saveRow}>
              <button type="submit" className={styles.primaryBtn} disabled={saving}>
                {saving ? 'Saving…' : 'Save preferences'}
              </button>
              {saveMsg && (
                <span className={saveMsg.ok ? styles.msgOk : styles.msgErr}>{saveMsg.text}</span>
              )}
            </div>
          </form>
        </section>

        {/* ── Sync ────────────────────────────────────────────────── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>GitHub sync</h2>
          <p className={styles.cardHint}>
            Re-reads your public GitHub activity and refreshes the numbers behind your
            level, streaks, badges, and milestones.
            {!isPaid && ' Free accounts can sync once per hour.'}
          </p>

          <div className={styles.statStrip} style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
            {[
              ['Commits', user.totalCommits.toLocaleString()],
              ['Current streak', `${user.currentStreak}d`],
              ['Best streak', `${user.longestStreak}d`],
              ['Languages', user.languageCount],
            ].map(([label, value]) => (
              <div key={label as string} className={styles.stat}>
                <div className={styles.statValue}>{value}</div>
                <div className={styles.statLabel}>{label}</div>
              </div>
            ))}
          </div>

          <div className={styles.saveRow}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleSync}
              disabled={syncing || !user.githubConnected}
            >
              {syncing ? 'Syncing…' : '↻ Sync GitHub data now'}
            </button>
            <span className={styles.profileMeta}>
              Last synced {formatDateTime(user.lastAnalyzedAt)}
            </span>
          </div>
          {syncMsg && (
            <p className={syncMsg.ok ? styles.msgOk : styles.msgErr} style={{ marginTop: '0.75rem' }}>
              {syncMsg.text}
            </p>
          )}
        </section>

        {/* ── Webhook token ───────────────────────────────────────── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Webhook token</h2>
          <p className={styles.cardHint}>
            Add this to your repository&apos;s GitHub Actions secrets as{' '}
            <code style={{ color: 'var(--color-rune)' }}>DEVLORE_TOKEN</code> to stream push
            events into your saga. Treat it like a password.
          </p>
          <div className={styles.tokenRow}>
            <input type="text" readOnly value={user.webhookToken} className={styles.tokenInput} />
            <button type="button" className={styles.outlineBtn} onClick={copyToken}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
            <form
              action={async () => {
                setTokenBusy(true);
                await regenerateWebhookToken();
                setTokenBusy(false);
              }}
            >
              <button type="submit" className={styles.outlineBtn} disabled={tokenBusy}>
                {tokenBusy ? 'Rotating…' : 'Rotate'}
              </button>
            </form>
          </div>
        </section>

        {/* ── Session ─────────────────────────────────────────────── */}
        <section className={`${styles.card} ${styles.dangerCard}`}>
          <h2 className={styles.cardTitle}>Session</h2>
          <p className={styles.cardHint}>
            Signing out clears this browser&apos;s session. Your saga, gear, and progress are
            kept — sign back in with GitHub any time to pick up exactly where you left off.
          </p>

          <div className={styles.dangerRow}>
            <div>
              <div className={styles.toggleLabel}>Sign out</div>
              <div className={styles.toggleHint}>
                Also the fix if GitHub sync reports a stale token — signing back in issues a
                fresh one.
              </div>
            </div>
            <form action={signOutAction}>
              <button type="submit" className={styles.dangerBtn}>
                Sign out
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
