import { auth } from '@/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll().map((c) => ({
    name: c.name,
    valueLength: c.value?.length ?? 0,
  }));

  return NextResponse.json({
    session: session
      ? {
          user: session.user?.email,
          expires: session.expires,
        }
      : null,
    cookies: allCookies,
  });
}
