'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface UserSettings {
  isPublic: boolean;
  emailChronicle: boolean;
  tier: string;
  username: string | null;
  webhookToken: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/sign-in');
  }, [status, router]);

  // Load settings from API
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/user/settings')
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(console.error);
  }, [status]);

  async function saveSettings() {
    if (!settings) return;
    setSaving(true);
    setSaveMsg('');
    const res = await fetch('/api/user/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isPublic: settings.isPublic,
        emailChronicle: settings.emailChronicle,
      }),
    });
    setSaving(false);
    setSaveMsg(res.ok ? '✓ Settings saved' : '✗ Save failed');
    setTimeout(() => setSaveMsg(''), 3000);
  }

  function copyToken() {
    if (!settings?.webhookToken) return;
    navigator.clipboard.writeText(settings.webhookToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (status === 'loading' || !settings) {
    return <div style={{ padding: '2rem', color: 'var(--color-mist)' }}>Loading your settings...</div>;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:7341';
  const publicUrl = settings.username ? `${appUrl}/u/${settings.username}` : null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: 'var(--color-frost)', marginBottom: '2rem' }}>
        Settings
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Profile */}
        <Card style={{ padding: '2rem', background: 'var(--color-abyss)', border: '1px solid var(--color-dusk)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-frost)', marginBottom: '1.5rem' }}>Profile</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <img src={session?.user?.image || ''} alt="Avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--color-dusk)' }} />
            <div>
              <div style={{ color: 'var(--color-frost)', fontWeight: 'bold' }}>{session?.user?.name}</div>
              <div style={{ color: 'var(--color-mist)', fontSize: '0.875rem' }}>{session?.user?.email}</div>
              {publicUrl && (
                <a href={publicUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-rune)', fontSize: '0.8rem', textDecoration: 'none' }}>
                  {publicUrl} ↗
                </a>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderTop: '1px solid var(--color-dusk)' }}>
            <div>
              <div style={{ color: 'var(--color-frost)' }}>Public Profile</div>
              <div style={{ color: 'var(--color-mist)', fontSize: '0.875rem' }}>Allow others to view your codex and saga at your public URL.</div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.isPublic}
                onChange={(e) => setSettings({ ...settings, isPublic: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-rune)', cursor: 'pointer' }}
              />
            </label>
          </div>
        </Card>

        {/* Chronicle Emails */}
        <Card style={{ padding: '2rem', background: 'var(--color-abyss)', border: '1px solid var(--color-dusk)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-frost)', marginBottom: '1.5rem' }}>Chronicle Emails</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: 'var(--color-frost)' }}>Weekly Chapter Delivery</div>
              <div style={{ color: 'var(--color-mist)', fontSize: '0.875rem' }}>
                {settings.tier === 'FREE'
                  ? 'Upgrade to Pro to receive your saga chapter every Monday.'
                  : 'Receive your new saga chapter every Monday morning.'}
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: settings.tier === 'FREE' ? 'not-allowed' : 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.emailChronicle}
                disabled={settings.tier === 'FREE'}
                onChange={(e) => setSettings({ ...settings, emailChronicle: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-rune)', cursor: settings.tier === 'FREE' ? 'not-allowed' : 'pointer' }}
              />
            </label>
          </div>
        </Card>

        {/* Subscription */}
        <Card style={{ padding: '2rem', background: 'var(--color-abyss)', border: '1px solid var(--color-dusk)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-frost)', marginBottom: '1.5rem' }}>Subscription</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: 'var(--color-mist)' }}>
                Current Tier: <strong style={{ color: 'var(--color-rune)', fontSize: '1.1rem' }}>{settings.tier}</strong>
              </div>
              {settings.tier === 'FREE' && (
                <div style={{ color: 'var(--color-mist)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  Unlock weekly chapters, lore history, and email chronicles on Pro.
                </div>
              )}
            </div>
            {settings.tier === 'FREE' ? (
              <Button onClick={() => router.push('/pricing')}>Upgrade to Pro</Button>
            ) : (
              <Button variant="outline" onClick={() => fetch('/api/stripe/portal', { method: 'POST' }).then((r) => r.json()).then((d) => d.url && (window.location.href = d.url))}>
                Manage Billing
              </Button>
            )}
          </div>
        </Card>

        {/* Webhook Token */}
        <Card style={{ padding: '2rem', background: 'var(--color-abyss)', border: '1px solid var(--color-dusk)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-frost)', marginBottom: '0.5rem' }}>Webhook Token</h2>
          <p style={{ color: 'var(--color-mist)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Add this token to your repo&apos;s GitHub Actions as <code style={{ color: 'var(--color-rune)' }}>DEVLORE_TOKEN</code> to stream push events into your saga.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              readOnly
              value={settings.webhookToken}
              style={{
                flex: 1,
                padding: '0.625rem',
                background: 'var(--color-void)',
                border: '1px solid var(--color-shadow)',
                color: 'var(--color-frost)',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
              }}
            />
            <Button variant="outline" onClick={copyToken}>
              {copied ? '✓ Copied' : 'Copy'}
            </Button>
          </div>
        </Card>

        {/* Save + Danger */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            {saveMsg && (
              <span style={{ color: saveMsg.startsWith('✓') ? 'var(--color-rune)' : '#ff6b6b', fontSize: '0.875rem' }}>
                {saveMsg}
              </span>
            )}
          </div>

          <Button
            variant="danger"
            style={{ background: 'rgba(255,71,87,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,71,87,0.3)' }}
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
