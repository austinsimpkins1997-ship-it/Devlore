import { ImageResponse } from '@vercel/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export const alt = 'DevLore Saga';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      displayName: true,
      username: true,
      avatarUrl: true,
      level: true,
      heroClass: true,
      heroTitle: true,
      totalCommits: true,
      longestStreak: true,
      loreCards: { select: { id: true } }
    }
  });

  if (!user) {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#07070f' }}>
          <h1 style={{ color: '#e0e0e0' }}>DevLore</h1>
        </div>
      ), { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#07070f',
          color: '#e0e0e0',
          position: 'relative',
          padding: '40px',
          fontFamily: 'sans-serif',
          backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.1) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.1) 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '12px', background: 'linear-gradient(to bottom, #c9a84c, #7d5a2d)' }} />
        
        <div style={{ position: 'absolute', top: '40px', right: '40px', fontSize: '24px', letterSpacing: '4px', fontWeight: 'bold', color: '#c9a84c' }}>
          DEVLORE
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', height: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '60px' }}>
            <img 
              src={user.avatarUrl || `https://github.com/${user.username}.png`} 
              alt={user.displayName}
              width="200" 
              height="200" 
              style={{ borderRadius: '100px', border: '4px solid #c9a84c', marginBottom: '20px' }} 
            />
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{user.displayName}</div>
            <div style={{ fontSize: '24px', color: '#888' }}>@{user.username}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
            <div style={{ fontSize: '64px', fontWeight: 'bold', color: '#c9a84c', marginBottom: '10px' }}>
              Level {user.level} {user.heroClass || 'Adventurer'}
            </div>
            <div style={{ fontSize: '36px', fontStyle: 'italic', color: '#aaa', marginBottom: '60px' }}>
              &ldquo;{user.heroTitle || 'A new legend begins...'}&rdquo;
            </div>
            
            <div style={{ display: 'flex', gap: '30px', marginTop: 'auto', borderTop: '2px solid rgba(201, 168, 76, 0.3)', paddingTop: '30px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '24px', color: '#888' }}>Total Commits</span>
                <span style={{ fontSize: '40px', fontWeight: 'bold' }}>{user.totalCommits}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '24px', color: '#888' }}>Longest Streak</span>
                <span style={{ fontSize: '40px', fontWeight: 'bold' }}>{user.longestStreak} days</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '24px', color: '#888' }}>Lore Cards</span>
                <span style={{ fontSize: '40px', fontWeight: 'bold' }}>{user.loreCards.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
