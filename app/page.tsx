import { Navbar } from '@/components/marketing/Navbar';
import { LandingHero } from '@/components/marketing/LandingHero';
import { DemoSaga } from '@/components/marketing/DemoSaga';
import { PricingTable } from '@/components/marketing/PricingTable';
import { ToolCards } from '@/components/marketing/ToolCards';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DEVLORE — Your commits. Your legend.',
  description:
    'DevLore transforms your GitHub history into an epic fantasy saga. Every commit writes a new chapter. Every milestone earns a lore card. Your legend, automated.',
};

const FEATURE_SECTIONS = [
  {
    id: 'origin-story',
    eyebrow: 'Chapter One',
    title: 'Your Origin Story, Written by AI',
    body: `The moment you connect GitHub, DevLore reads your entire commit history — every language, every streak, every midnight push. Our AI narrates it as myth. Who you are as a developer, distilled into an epic 500-word origin that reads like the opening of a fantasy novel.`,
    icon: '✦',
    gradient: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(124,58,237,0.04))',
    accent: '#c9a84c',
    stat: '500 words',
    statLabel: 'of pure narrative',
    align: 'right' as const,
  },
  {
    id: 'weekly-chapters',
    eyebrow: 'Automated, Every Week',
    title: 'A New Chapter Every Monday. Without Lifting a Finger.',
    body: `Every Monday morning, DevLore fetches your past week's commits, pull requests, bugs closed, and repos started. The AI translates them into fantasy prose: your refactors become "purifying ancient corruptions," your new repos are "claiming new realms." It emails you the chapter. You wake up to your legend, already written.`,
    icon: '📖',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(124,58,237,0.04))',
    accent: '#3b82f6',
    stat: 'Monday 9 AM',
    statLabel: 'delivered automatically',
    align: 'left' as const,
  },
  {
    id: 'lore-cards',
    eyebrow: 'Collectible Achievement System',
    title: 'Lore Cards. Your Milestones Made Legendary.',
    body: `Hit 100 commits? You unlock "The Relentless Inscriber." Maintain a 7-day streak? "Week of Fire" appears in your collection. Each card has rarity — Common, Uncommon, Rare, Epic, Legendary — and carries flavor text written in the voice of the DevLore narrator. They're yours forever.`,
    icon: '🃏',
    gradient: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(124,58,237,0.04))',
    accent: '#a855f7',
    stat: '50+ cards',
    statLabel: 'to unlock',
    align: 'right' as const,
  },
  {
    id: 'hero-classes',
    eyebrow: '12 Archetypes',
    title: 'Your Hero Class Reflects Who You Actually Are.',
    body: `TypeScript all day? You're an Arcane Architect. Commit after midnight? Night Wraith. 30 open-source contributions? Open Sage. The assignment isn't random — it reads your language ratios, commit timing, and repository patterns to find your archetype among 12 hero classes, each with unique lore and visual identity.`,
    icon: '⚔️',
    gradient: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(59,130,246,0.04))',
    accent: '#22c55e',
    stat: '12 classes',
    statLabel: 'one is yours',
    align: 'left' as const,
  },
  {
    id: 'public-codex',
    eyebrow: 'Your Developer Identity',
    title: 'A Public Codex That Speaks for Your Work.',
    body: `devlore.app/u/yourusername — a page that tells your story to anyone who visits. Your hero card, origin story, lore collection, chapter timeline. It's the portfolio you never had to write. Share it in your GitHub README, your resume, your Twitter bio. It updates itself.`,
    icon: '🌐',
    gradient: 'linear-gradient(135deg, rgba(244,63,94,0.08), rgba(201,168,76,0.04))',
    accent: '#f43f5e',
    stat: 'Auto-updated',
    statLabel: 'always current',
    align: 'right' as const,
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Sign in with GitHub',
    body: 'One click. We request read access to your public commit history. No write permissions, no webhooks required to start.',
    icon: '🔐',
  },
  {
    step: '02',
    title: 'Analysis runs automatically',
    body: 'In the background: we read your commit history, assign your hero class, generate your origin story, backfill XP, and unlock starter lore cards.',
    icon: '⚙️',
  },
  {
    step: '03',
    title: 'Your saga begins',
    body: 'Your hero card is live. Generate your first chapter from last week\'s commits. Every Monday after that, a new chapter arrives automatically.',
    icon: '✦',
  },
  {
    step: '04',
    title: 'Share your legend',
    body: 'Your public Codex is live at devlore.app/u/username. Drop it in your GitHub profile README and let your code speak its own language.',
    icon: '🌐',
  },
];

export default function HomePage() {
  return (
    <main style={{ width: '100%', background: 'var(--color-void)' }}>
      <Navbar />

      {/* ── Hero ── */}
      <LandingHero />

      {/* ── Interactive Tools Strip: No Sign-Up Required ── */}
      <section style={{ padding: '5rem 2rem', background: 'linear-gradient(180deg, var(--color-void) 0%, var(--color-abyss) 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Ambient orbs — static divs, no events, safe in server component */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-block', padding: '0.35rem 1rem', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '999px', color: 'var(--color-rune)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              No Sign-Up Required
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--color-frost)', margin: '0 0 1rem', lineHeight: 1.2 }}>
              Play Now
            </h2>
            <p style={{ color: 'var(--color-mist)', maxWidth: '520px', margin: '0 auto', lineHeight: '1.7' }}>
              DevLore is for everyone — coders, designers, learners, makers. Discover your hero class or challenge a friend right now, no account needed.
            </p>
          </div>

          {/* Client component handles all hover interactions */}
          <ToolCards />
        </div>
      </section>

      {/* ── Automation Banner ── */}
      <section style={{ padding: '3rem 2rem', background: 'linear-gradient(180deg, var(--color-abyss) 0%, var(--color-void) 100%)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '1px', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', overflow: 'hidden' }}>
          {[
            { icon: '⚙️', label: 'Analysis', note: 'Runs on sign-in' },
            { icon: '📖', label: 'Chapters', note: 'Every Monday, automated' },
            { icon: '🃏', label: 'Lore Cards', note: 'Awarded on milestone' },
            { icon: '📧', label: 'Chronicle Email', note: 'Delivered to your inbox' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                flex: '1 1 200px',
                padding: '1.5rem',
                background: 'rgba(13,13,26,0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
              <div>
                <div style={{ color: 'var(--color-frost)', fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</div>
                <div style={{ color: 'var(--color-rune)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{item.note}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: '6rem 2rem', background: 'var(--color-void)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ color: 'var(--color-rune)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              How It Works
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: 'var(--color-frost)', marginBottom: '1rem' }}>
              From First Commit to Living Legend
            </h2>
            <p style={{ color: 'var(--color-mist)', maxWidth: '520px', margin: '0 auto' }}>
              Four steps. Most of them happen automatically.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} style={{ position: 'relative', padding: '2rem', background: 'var(--color-abyss)', border: '1px solid var(--color-dusk)', borderRadius: '12px' }}>
                <div style={{ position: 'absolute', top: '-1px', left: '0', right: '0', height: '2px', background: i < 2 ? 'linear-gradient(90deg, var(--color-rune-dim), var(--color-rune))' : 'linear-gradient(90deg, var(--color-arcane-dim), var(--color-arcane))', borderRadius: '2px 2px 0 0' }} />
                <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--color-shadow)', marginBottom: '0.75rem' }}>STEP {step.step}</div>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{step.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--color-frost)', marginBottom: '0.75rem' }}>{step.title}</h3>
                <p style={{ color: 'var(--color-mist)', fontSize: '0.875rem', lineHeight: '1.6' }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Deep-Dives ── */}
      {FEATURE_SECTIONS.map((feat) => (
        <section
          key={feat.id}
          id={feat.id}
          style={{ padding: '7rem 2rem', background: feat.align === 'right' ? 'var(--color-abyss)' : 'var(--color-void)' }}
        >
          <div style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '5rem',
            alignItems: 'center',
          }}>
            <div style={{ order: feat.align === 'right' ? 1 : 0 }}>
              <div style={{ color: feat.accent, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                {feat.eyebrow}
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-frost)', marginBottom: '1.5rem', lineHeight: '1.25' }}>
                {feat.title}
              </h2>
              <p style={{ color: 'var(--color-mist)', lineHeight: '1.8', marginBottom: '2rem', fontSize: '1.05rem' }}>
                {feat.body}
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.5rem', padding: '0.75rem 1.25rem', background: 'rgba(0,0,0,0.3)', border: `1px solid ${feat.accent}30`, borderRadius: '8px' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: feat.accent }}>{feat.stat}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-mist)' }}>{feat.statLabel}</span>
              </div>
            </div>
            <div style={{
              order: feat.align === 'right' ? 0 : 1,
              background: feat.gradient,
              border: `1px solid ${feat.accent}20`,
              borderRadius: '16px',
              padding: '3rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '280px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ fontSize: '5rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 20px currentColor)' }}>{feat.icon}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: feat.accent, textAlign: 'center', letterSpacing: '0.05em' }}>
                {feat.eyebrow}
              </div>
              {/* Animated corner accent */}
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '80px', height: '80px', background: `radial-gradient(circle at 100% 100%, ${feat.accent}15, transparent)` }} />
            </div>
          </div>
        </section>
      ))}

      {/* ── Demo Saga ── */}
      <section style={{ background: 'var(--color-abyss)' }}>
        <DemoSaga />
      </section>

      {/* ── Why DevLore CTA strip ── */}
      <section style={{ padding: '6rem 2rem', background: 'var(--color-void)' }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
          padding: '4rem 3rem',
          background: 'linear-gradient(135deg, rgba(201,168,76,0.06), rgba(124,58,237,0.06))',
          border: '1px solid rgba(201,168,76,0.15)',
          borderRadius: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '200px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--color-rune), transparent)' }} />
          <div style={{ color: 'var(--color-rune)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            Still wondering?
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-frost)', marginBottom: '1rem' }}>
            Read: Why DevLore Exists
          </h2>
          <p style={{ color: 'var(--color-mist)', maxWidth: '480px', margin: '0 auto 2.5rem', lineHeight: '1.7' }}>
            The honest story of why we built this, who it&apos;s for, and why it might change how you feel about coding every day.
          </p>
          <Link
            href="/why"
            style={{
              display: 'inline-block',
              padding: '0.875rem 2rem',
              background: 'transparent',
              border: '1px solid var(--color-rune)',
              color: 'var(--color-rune)',
              borderRadius: '100px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              letterSpacing: '0.05em',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            Why DevLore? →
          </Link>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: '6rem 2rem', background: 'var(--color-abyss)' }}>
        <PricingTable />
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--color-dusk)', padding: '4rem 2rem', background: 'var(--color-void)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', letterSpacing: '0.2em', color: 'var(--color-frost)', marginBottom: '0.75rem' }}>DEVLORE</div>
            <p style={{ color: 'var(--color-mist)', fontSize: '0.875rem', lineHeight: '1.7', maxWidth: '280px' }}>
              Your commits. Your legend. An automated developer saga powered by your real GitHub history.
            </p>
          </div>
          <div>
            <div style={{ color: 'var(--color-shadow)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>Product</div>
            {[['Features', '/#origin-story'], ['Why DevLore?', '/why'], ['Pricing', '/pricing'], ['Changelog', '/changelog']].map(([label, href]) => (
              <div key={label} style={{ marginBottom: '0.5rem' }}>
                <Link href={href} style={{ color: 'var(--color-mist)', textDecoration: 'none', fontSize: '0.875rem' }}>{label}</Link>
              </div>
            ))}
          </div>
          <div>
            <div style={{ color: 'var(--color-shadow)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>Hero Classes</div>
            {['Arcane Architect', 'Night Wraith', 'Data Druid', 'Iron Forger', 'Cloud Wanderer'].map((name) => (
              <div key={name} style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-mist)', fontSize: '0.8rem' }}>{name}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ color: 'var(--color-shadow)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>Legal</div>
            {[['Privacy', '/privacy'], ['Terms', '/terms']].map(([label, href]) => (
              <div key={label} style={{ marginBottom: '0.5rem' }}>
                <Link href={href} style={{ color: 'var(--color-mist)', textDecoration: 'none', fontSize: '0.875rem' }}>{label}</Link>
              </div>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: '1100px', margin: '3rem auto 0', paddingTop: '2rem', borderTop: '1px solid var(--color-dusk)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ color: 'var(--color-shadow)', fontSize: '0.8rem' }}>© 2026 DevLore. Your commits. Your legend.</span>
          <Link href="/sign-in" style={{ color: 'var(--color-rune)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600 }}>Begin Your Legend →</Link>
        </div>
      </footer>
    </main>
  );
}
