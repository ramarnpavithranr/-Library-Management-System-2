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

  // 2. Detect configured portal mode from environment variable or incoming hostname
  const envPortal = (process.env.NEXT_PUBLIC_PORTAL_TYPE || process.env.PORTAL_TYPE || '').toLowerCase().trim();
  let portal: 'admin' | 'student' | null = null;

  if (envPortal === 'admin') {
    portal = 'admin';
  } else if (envPortal === 'student') {
    portal = 'student';
  } else if (host.startsWith('admin.') || host.includes('admin-') || host.includes('-admin')) {
    portal = 'admin';
  } else if (host.startsWith('student.') || host.includes('student-') || host.includes('-student')) {
    portal = 'student';
  }

  // 3. ADMIN PORTAL DEPLOYMENT ROUTING RULES
  if (portal === 'admin') {
    // Direct entry: Root '/' opens Admin Portal directly (no selection screen)
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/admin', req.url));
    }
    // Cross-portal prevention: Students/Visitors cannot access student routes on Admin portal
    if (pathname.startsWith('/student')) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  // 4. STUDENT PORTAL DEPLOYMENT ROUTING RULES
  if (portal === 'student') {
    // Direct entry: Root '/' opens Student Portal directly (no selection screen)
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/student', req.url));
    }
    // Cross-portal prevention: Visitors cannot access admin routes on Student portal
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/student', req.url));
    }
    return NextResponse.next();
  }

  // 5. UNLOCKED / LOCAL ENVIRONMENT DEFAULT
  // If not constrained by env or subdomain, root '/' defaults cleanly to student portal
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/student', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

