import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { LoreCard } from '@/components/saga/LoreCard';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Lore Collection',
};

export default async function CollectionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const cards = await prisma.loreCard.findMany({
    where: { userId: session.user.id },
    orderBy: { unlockedAt: 'desc' }
  });

  const legendaryCount = cards.filter(c => c.rarity === 'LEGENDARY').length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <Link href="/dashboard" style={{ color: 'var(--color-mist)', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block' }}>← Back to Dashboard</Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: 'var(--color-frost)', marginBottom: '0.5rem' }}>The Collection</h1>
          <p style={{ color: 'var(--color-mist)' }}>Your earned achievements and milestones</p>
        </div>
        <div style={{ display: 'flex', gap: '2rem', textAlign: 'right' }}>
          <div>
            <div style={{ color: 'var(--color-rune)', fontSize: '1.5rem', fontWeight: 'bold' }}>{cards.length}</div>
            <div style={{ color: 'var(--color-mist)', fontSize: '0.875rem' }}>Total Cards</div>
          </div>
          <div>
            <div style={{ color: 'var(--color-arcane)', fontSize: '1.5rem', fontWeight: 'bold' }}>{legendaryCount}</div>
            <div style={{ color: 'var(--color-mist)', fontSize: '0.875rem' }}>Legendary</div>
          </div>
        </div>
      </div>

      {cards.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem' }}>
          {cards.map(card => (
            <LoreCard key={card.id} card={card as Parameters<typeof LoreCard>[0]['card']} />
          ))}
        </div>
      ) : (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--color-abyss)', borderRadius: '12px', border: '1px dashed var(--color-dusk)' }}>
          <p style={{ color: 'var(--color-mist)', fontSize: '1.2rem' }}>Your collection is empty.</p>
          <p style={{ color: 'var(--color-shadow)', marginTop: '0.5rem' }}>Continue your journey to uncover legendary artifacts.</p>
        </div>
      )}
    </div>
  );
}
