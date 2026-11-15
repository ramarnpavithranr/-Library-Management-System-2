import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = (req.headers.get('host') || '').toLowerCase();

  // 1. Pass through static files, Next.js internal bundles, and API routes unaffected
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Static files (.ico, .png, .jpg, .svg, .css, .js)
  ) {
    return NextResponse.next();
  }

  // 2. Strict Subdomain Routing ONLY on root '/'
  // If a dedicated subdomain is configured (e.g., admin.domain.com or student.domain.com),
  // browsing to root '/' rewrites to the respective portal.
  if (pathname === '/') {
    if (host.startsWith('admin.')) {
      return NextResponse.rewrite(new URL('/admin', req.url));
    }
    if (host.startsWith('student.')) {
      return NextResponse.rewrite(new URL('/student', req.url));
    }
    // Default: Display the institutional Dual-Portal Gateway (src/app/page.tsx)
    return NextResponse.next();
  }

  // 3. Independent Concurrent Access:
  // Both /admin and /student routes are ALWAYS accessible directly.
  // NEVER block or redirect /student to /admin, and NEVER block or redirect /admin to /student.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};


