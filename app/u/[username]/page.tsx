import { prisma } from '@/lib/prisma';
import { CodexHeader } from '@/components/saga/CodexHeader';
import { SagaTimeline } from '@/components/saga/SagaTimeline';
import { LoreCard } from '@/components/saga/LoreCard';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.isPublic) return { title: 'Not Found' };
  
  return {
    title: `The Legend of ${user.displayName} — DEVLORE`,
    description: user.bio ? (user.bio.length > 160 ? user.bio.substring(0, 157) + '...' : user.bio) : 'An epic coding saga.',
  };
}

export default async function PublicCodexPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      chapters: { orderBy: { createdAt: 'desc' } },
      loreCards: { 
        where: { rarity: { in: ['LEGENDARY', 'EPIC'] } },
        orderBy: { unlockedAt: 'desc' } 
      }
    }
  });

  if (!user || !user.isPublic) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-void)' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', color: 'var(--color-shadow)' }}>This legend is private</h1>
        <p style={{ color: 'var(--color-mist)', marginTop: '1rem' }}>Or does not exist in our archives.</p>
        <Link href="/" style={{ marginTop: '2rem' }}><Button variant="outline">Return Home</Button></Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem 4rem 2rem' }}>
      <CodexHeader user={user as Parameters<typeof CodexHeader>[0]['user']} />

      <section style={{ marginTop: '4rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--color-frost)', borderBottom: '1px solid var(--color-dusk)', paddingBottom: '1rem', marginBottom: '2rem' }}>
          The Chronicles
        </h2>
        {user.chapters.length > 0 ? (
          <SagaTimeline chapters={user.chapters as Parameters<typeof SagaTimeline>[0]['chapters']} isPublicView={true} />
        ) : (
          <p style={{ color: 'var(--color-mist)', fontStyle: 'italic' }}>The saga has just begun...</p>
        )}
      </section>

      <section style={{ marginTop: '6rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--color-frost)', borderBottom: '1px solid var(--color-dusk)', paddingBottom: '1rem', marginBottom: '2rem' }}>
          The Collection
        </h2>
        {user.loreCards.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
            {user.loreCards.map(card => (
              <LoreCard key={card.id} card={card as Parameters<typeof LoreCard>[0]['card']} />
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-mist)', fontStyle: 'italic' }}>Rare artifacts have yet to be uncovered.</p>
        )}
      </section>

      <footer style={{ marginTop: '6rem', paddingTop: '4rem', borderTop: '1px solid var(--color-dusk)', textAlign: 'center' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-rune)', marginBottom: '1.5rem' }}>Write your own legend — join DevLore</h3>
        <Link href="/">
          <Button size="lg">Start Your Saga</Button>
        </Link>
      </footer>
    </div>
  );
}
