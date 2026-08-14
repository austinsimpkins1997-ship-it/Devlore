import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard?error=MissingCode', req.url));
  }

  try {
    const response = await fetch(`https://api.github.com/app-manifests/${code}/conversions`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code');
    }

    const data = await response.json();
    
    // Log the credentials for now (in production, store in secrets manager)
    console.log('GitHub App Credentials:', {
      id: data.id,
      webhook_secret: data.webhook_secret,
      client_id: data.client_id,
      client_secret: data.client_secret,
      pem_snippet: data.pem ? `${data.pem.substring(0, 30)}...` : null,
    });

    return NextResponse.redirect(new URL('/dashboard?setup=complete', req.url));
  } catch (error) {
    console.error('GitHub setup error:', error);
    return NextResponse.redirect(new URL('/dashboard?error=SetupFailed', req.url));
  }
}
