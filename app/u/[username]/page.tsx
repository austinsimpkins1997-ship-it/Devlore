import { prisma } from '@/lib/prisma';
import { CodexHeader } from '@/components/saga/CodexHeader';
import { SagaTimeline } from '@/components/saga/SagaTimeline';
import { LoreCard } from '@/components/saga/LoreCard';
import { TrophyCase } from '@/components/saga/TrophyCase';
import { MilestonesPanel } from '@/components/saga/MilestonesPanel';
import { BadgeShelf } from '@/components/saga/BadgeShelf';
import { Armory } from '@/components/saga/Armory';
import { KudosButton } from '@/components/saga/KudosButton';
import { AddFriendButton } from '@/components/saga/AddFriendButton';
import { HeroAvatar } from '@/components/character/HeroAvatar';
import { buildMilestoneTracks } from '@/lib/milestones';
import { getEarnedBadges } from '@/lib/badges';
import { auth } from '@/auth';
import { getRelationship } from '@/lib/social';
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
      },
      trophies: { orderBy: { awardedAt: 'desc' } },
      equipment: { orderBy: [{ equipped: 'desc' }, { power: 'desc' }] },
      _count: { select: { kudosReceived: true, chapters: true } }
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

  const milestoneTracks = buildMilestoneTracks({
    totalCommits: user.totalCommits,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    chaptersCount: user._count.chapters,
  });

  const badges = getEarnedBadges({
    totalCommits: user.totalCommits,
    longestStreak: user.longestStreak,
    languageCount: user.languageCount,
    openSourceContribCount: user.openSourceContribCount,
    hasInfraRepos: user.hasInfraRepos,
    chaptersCount: user._count.chapters,
    trophyCount: user.trophies.length,
  });

  const session = await auth();
  const relationship = session?.user?.id
    ? await getRelationship(session.user.id, user.id)
    : null;

  const equippedSlots = user.equipment.filter((e) => e.equipped).map((e) => e.slot);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem 4rem 2rem' }}>
      <CodexHeader user={user as Parameters<typeof CodexHeader>[0]['user']} />

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <div
          style={{
            background: 'radial-gradient(circle at 50% 35%, rgba(124, 58, 237, 0.12), rgba(7, 7, 15, 0.9))',
            border: '1px solid var(--color-twilight)',
            borderRadius: '12px',
            padding: '0.75rem',
          }}
        >
          <HeroAvatar
            appearance={{
              charBody: user.charBody,
              charSkin: user.charSkin,
              charHair: user.charHair,
              charCloak: user.charCloak,
              charAura: user.charAura,
              charEyes: user.charEyes,
              charMarking: user.charMarking,
            }}
            size={200}
            equippedSlots={equippedSlots}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginTop: '1.5rem',
        }}
      >
        <KudosButton username={user.username ?? username} initialCount={user._count.kudosReceived} />
        <AddFriendButton username={user.username ?? username} initialRelationship={relationship} />
      </div>

      <section style={{ marginTop: '3rem' }}>
        <BadgeShelf badges={badges} />
      </section>

      <section style={{ marginTop: '2rem' }}>
        <Armory
          equipment={user.equipment.map((e) => ({
            id: e.id,
            slot: e.slot,
            rarity: e.rarity,
            name: e.name,
            flavorText: e.flavorText,
            power: e.power,
            levelAwarded: e.levelAwarded,
          }))}
        />
      </section>

      <section style={{ marginTop: '2rem' }}>
        <TrophyCase
          trophies={user.trophies.map((t) => ({
            id: t.id,
            kind: t.kind,
            weekKey: t.weekKey,
            title: t.title,
            description: t.description,
            awardedAt: t.awardedAt.toISOString(),
          }))}
          emptyText="No weekly trophies yet — the realm awards them every Monday for the finest deeds."
        />
      </section>

      <section style={{ marginTop: '2rem' }}>
        <MilestonesPanel tracks={milestoneTracks} />
      </section>

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
