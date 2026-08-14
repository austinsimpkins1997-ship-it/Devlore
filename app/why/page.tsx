import { Navbar } from '@/components/marketing/Navbar';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Why DevLore? — The real reason we built this',
  description:
    'DevLore exists because coding deserves to feel meaningful. Here is the honest story of why we built it, who it is for, and why showing up every day matters.',
};

const REASONS = [
  {
    id: 'developers',
    eyebrow: 'For Developers',
    title: 'You write code every day. Nobody knows.',
    body: [
      `You close bugs that took you three days to find. You refactor a system that was a tangle when you inherited it. You ship a feature at 11pm because you care. And then — nothing. The commit goes in, the PR closes, and it disappears into history.`,
      `GitHub gives you a green dot grid. Your employer gets the feature. The world gets a slightly better product. And you get a job title.`,
      `DevLore exists because your work deserves a witness. Not a performance review. Not a star count. An actual story — one that reads your real history and says: here is what you built, here is who you became, here is the hero class your code earned you.`,
    ],
    accent: '#c9a84c',
    icon: '💻',
    stat: { value: 'Every commit', label: 'is now a scene in your story' },
  },
  {
    id: 'portfolio',
    eyebrow: 'As a Portfolio',
    title: 'Your public Codex is the portfolio you never had time to write.',
    body: [
      `Most developers have two options: write a portfolio site (takes weeks, goes stale immediately) or share your GitHub profile (unintelligible to non-technical people, not inspiring to technical ones).`,
      `DevLore gives you devlore.app/u/yourname — automatically updated, visually rich, narrative-driven. Your hero class. Your origin story. Your lore card collection. Your chapter timeline. It tells someone who you are as a developer in 30 seconds, in a way a list of repositories never could.`,
      `Drop it in your GitHub README. Put it on your resume. Share it when someone asks "what do you actually work on?" Watch them understand you differently.`,
    ],
    accent: '#3b82f6',
    icon: '🌐',
    stat: { value: 'One URL', label: 'that updates itself forever' },
  },
  {
    id: 'motivation',
    eyebrow: 'Stay Motivated',
    title: 'The loop that keeps you coding when nothing else does.',
    body: [
      `Every developer goes through periods where coding feels like maintenance, not creation. Where you ship tickets but nothing feels like yours. Where the streak breaks and the guilt sets in.`,
      `DevLore runs a real game loop: you code → a chapter is generated → you earn XP and lore cards → your level climbs → the next chapter continues your story. It is not fake productivity. Every point of XP maps to real commits. Every card reflects a real milestone you hit.`,
      `The cron job runs every Monday. You wake up to a new chapter of your saga. That chapter exists because you showed up last week. It says: you were here. Your work mattered. The story continues.`,
    ],
    accent: '#22c55e',
    icon: '⚡',
    stat: { value: 'Monday 9 AM', label: 'your new chapter arrives automatically' },
  },
  {
    id: 'teams',
    eyebrow: 'For Teams',
    title: 'Shared sagas that make a team\'s work visible.',
    body: [
      `Engineering teams often lose the story of what they built. Features ship, bugs close, quarters end — and the narrative of a sprint dies in a JIRA board. New engineers join and have no sense of what the team fought through to get here.`,
      `DevLore Legend tier enables org-wide sagas: shared chronicles for a repository or team. The pull requests your team merged this week become one collective chapter. Your top contributors earn their own cards. The team has a story that outsiders can read and insiders can feel proud of.`,
    ],
    accent: '#a855f7',
    icon: '🤝',
    stat: { value: 'Org-wide', label: 'sagas on Legend tier' },
  },
];

const FAQ = [
  {
    q: 'Do you read my actual code?',
    a: 'No. We request read-only access to your contribution metadata — commit counts, PR counts, languages used, and streak data from the GitHub API. We never read the content of your commits or see your actual source code.',
  },
  {
    q: 'Is the narrative actually good?',
    a: 'The prompts are engineered to produce real fantasy prose — not generic filler. Your specific commit messages become plot beats. Your real streaks are cited as "consecutive sunrises of vigil." Your top language is translated into a school of magic. It reads like a chapter of a fantasy novel, not a GitHub stats report.',
  },
  {
    q: 'What if I barely code this week?',
    a: 'That is still a story. The narrator treats a quiet week as a period of reflection and preparation — a lull before the storm. Zero commits generates a different kind of chapter, not an error. The saga accommodates real life.',
  },
  {
    q: 'What happens to old chapters on the Free tier?',
    a: 'The 2 most recent chapters are always visible for free. Older chapters are preserved — they do not disappear. Upgrading to Pro unlocks your full history instantly.',
  },
  {
    q: 'How is this different from GitHub\'s contribution graph?',
    a: 'The contribution graph tells you when you worked. DevLore tells you what it means. It is the difference between a heart rate monitor and a biography.',
  },
];

export default function WhyPage() {
  return (
    <main style={{ width: '100%', background: 'var(--color-void)' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ paddingTop: '140px', paddingBottom: '6rem', paddingLeft: '2rem', paddingRight: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ color: 'var(--color-rune)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          The Honest Story
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--color-frost)', maxWidth: '800px', margin: '0 auto 1.5rem', lineHeight: '1.2' }}>
          Why DevLore Exists
        </h1>
        <p style={{ color: 'var(--color-mist)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: '1.8' }}>
          Because developers deserve more than a green dot grid. Because your commits are chapters in a story that nobody was reading. Until now.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/sign-in" style={{
            display: 'inline-block',
            padding: '0.875rem 2rem',
            background: 'linear-gradient(135deg, var(--color-rune-dim), var(--color-rune))',
            color: '#07070f',
            borderRadius: '100px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}>
            Begin Your Legend →
          </Link>
          <Link href="/#origin-story" style={{
            display: 'inline-block',
            padding: '0.875rem 2rem',
            background: 'transparent',
            border: '1px solid var(--color-dusk)',
            color: 'var(--color-mist)',
            borderRadius: '100px',
            textDecoration: 'none',
            fontSize: '0.9rem',
          }}>
            See the Features
          </Link>
        </div>
      </section>

      {/* Reasons */}
      {REASONS.map((reason, i) => (
        <section
          key={reason.id}
          id={reason.id}
          style={{
            padding: '7rem 2rem',
            background: i % 2 === 0 ? 'var(--color-abyss)' : 'var(--color-void)',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '2rem',
              marginBottom: '2rem',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                flexShrink: 0,
                background: `${reason.accent}15`,
                border: `1px solid ${reason.accent}30`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
              }}>
                {reason.icon}
              </div>
              <div>
                <div style={{ color: reason.accent, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  {reason.eyebrow}
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'var(--color-frost)', lineHeight: '1.25' }}>
                  {reason.title}
                </h2>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
              <div>
                {reason.body.map((para, pi) => (
                  <p key={pi} style={{
                    color: pi === 0 ? 'var(--color-frost)' : 'var(--color-mist)',
                    lineHeight: '1.85',
                    fontSize: '1.05rem',
                    marginBottom: pi < reason.body.length - 1 ? '1.5rem' : 0,
                  }}>
                    {para}
                  </p>
                ))}
              </div>
              <div style={{ position: 'sticky', top: '100px' }}>
                <div style={{
                  padding: '2.5rem',
                  background: `${reason.accent}08`,
                  border: `1px solid ${reason.accent}20`,
                  borderRadius: '16px',
                }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: reason.accent, marginBottom: '0.5rem' }}>
                    {reason.stat.value}
                  </div>
                  <div style={{ color: 'var(--color-mist)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                    {reason.stat.label}
                  </div>
                  <div style={{ height: '1px', background: `${reason.accent}20`, marginBottom: '2rem' }} />
                  <Link href="/sign-in" style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '0.75rem',
                    background: `${reason.accent}15`,
                    border: `1px solid ${reason.accent}30`,
                    borderRadius: '8px',
                    color: reason.accent,
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    transition: 'background 0.2s',
                  }}>
                    Begin Your Legend
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* FAQ */}
      <section style={{ padding: '7rem 2rem', background: 'var(--color-abyss)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ color: 'var(--color-rune)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Questions
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-frost)' }}>
              Frequently Asked
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {FAQ.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '8rem 2rem', background: 'var(--color-void)', textAlign: 'center' }}>
        <div style={{
          maxWidth: '640px',
          margin: '0 auto',
          padding: '4rem 2rem',
          background: 'linear-gradient(135deg, rgba(201,168,76,0.05), rgba(124,58,237,0.05))',
          border: '1px solid rgba(201,168,76,0.12)',
          borderRadius: '20px',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>⚔️</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-frost)', marginBottom: '1rem' }}>
            Your commits already have a story.
          </h2>
          <p style={{ color: 'var(--color-mist)', marginBottom: '2.5rem', lineHeight: '1.7' }}>
            DevLore just reads it out loud. Connect GitHub in under 30 seconds and see your origin story.
          </p>
          <Link href="/sign-in" style={{
            display: 'inline-block',
            padding: '1rem 2.5rem',
            background: 'linear-gradient(135deg, var(--color-rune-dim), var(--color-rune))',
            color: '#07070f',
            borderRadius: '100px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            boxShadow: '0 0 30px rgba(201,168,76,0.25)',
          }}>
            Begin Your Legend — Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--color-dusk)', padding: '2rem', textAlign: 'center', background: 'var(--color-void)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--color-mist)', textDecoration: 'none', fontSize: '0.875rem' }}>Home</Link>
          <Link href="/pricing" style={{ color: 'var(--color-mist)', textDecoration: 'none', fontSize: '0.875rem' }}>Pricing</Link>
          <Link href="/privacy" style={{ color: 'var(--color-mist)', textDecoration: 'none', fontSize: '0.875rem' }}>Privacy</Link>
          <Link href="/terms" style={{ color: 'var(--color-mist)', textDecoration: 'none', fontSize: '0.875rem' }}>Terms</Link>
        </div>
        <p style={{ color: 'var(--color-shadow)', fontSize: '0.8rem', marginTop: '1rem' }}>© 2026 DevLore. Your commits. Your legend.</p>
      </footer>
    </main>
  );
}

/* Server-compatible FAQ accordion */
function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details style={{
      background: 'var(--color-void)',
      border: '1px solid var(--color-dusk)',
      borderRadius: '8px',
      padding: '0',
      marginBottom: '2px',
      overflow: 'hidden',
    }}>
      <summary style={{
        padding: '1.25rem 1.5rem',
        cursor: 'pointer',
        fontWeight: 600,
        color: 'var(--color-frost)',
        fontSize: '0.95rem',
        listStyle: 'none',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        userSelect: 'none',
      }}>
        {q}
        <span style={{ color: 'var(--color-rune)', fontSize: '1.2rem', flexShrink: 0 }}>+</span>
      </summary>
      <div style={{ padding: '0 1.5rem 1.25rem', color: 'var(--color-mist)', fontSize: '0.9rem', lineHeight: '1.7' }}>
        {a}
      </div>
    </details>
  );
}
