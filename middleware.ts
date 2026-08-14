import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth protection is handled at the layout level (Node.js runtime)
// where Prisma/Auth.js can run properly.
// Middleware only skips static/internal Next.js routes.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
