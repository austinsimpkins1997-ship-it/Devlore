import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { SagaTimeline } from '@/components/saga/SagaTimeline';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'All Chapters',
};

export default async function ChaptersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam ?? '1');
  const take = 12;
  const skip = (page - 1) * take;

  const [chapters, total] = await Promise.all([
    prisma.chapter.findMany({
      where: { userId: session.user.id },
      orderBy: { number: 'desc' },
      take,
      skip,
    }),
    prisma.chapter.count({ where: { userId: session.user.id } })
  ]);

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { tier: true } });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <Link href="/dashboard" style={{ color: 'var(--color-mist)', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block' }}>← Back to Dashboard</Link>
      
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: 'var(--color-frost)', marginBottom: '2rem' }}>The Chronicles</h1>

      {user?.tier === 'FREE' && total > 2 && (
        <div style={{ padding: '1rem', background: 'var(--color-abyss)', border: '1px solid var(--color-rune)', borderRadius: '8px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'var(--color-mist)', margin: 0 }}>Unlock all past chapters and deeper lore by upgrading your tier.</p>
          <Link href="/pricing" style={{ color: 'var(--color-rune)', fontWeight: 'bold', textDecoration: 'none' }}>Upgrade Now</Link>
        </div>
      )}

      {chapters.length > 0 ? (
        <SagaTimeline chapters={chapters as any} lockedAfter={user?.tier === 'FREE' ? 2 : undefined} />
      ) : (
        <p style={{ color: 'var(--color-mist)', textAlign: 'center', marginTop: '4rem' }}>No chapters have been written yet.</p>
      )}

      {/* Basic Pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
        {page > 1 && <Link href={`/dashboard/chapters?page=${page - 1}`} style={{ color: 'var(--color-rune)' }}>Previous</Link>}
        {skip + take < total && <Link href={`/dashboard/chapters?page=${page + 1}`} style={{ color: 'var(--color-rune)' }}>Next</Link>}
      </div>
    </div>
  );
}
