import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = (req.headers.get('host') || '').toLowerCase();

  // 1. Pass through static files, Next.js internal bundles, and API routes unaffected
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Static assets (.ico, .png, .jpg, .svg, .css, .js)
  ) {
    return NextResponse.next();
  }

  // 2. Subdomain Routing on root '/'
  if (pathname === '/') {
    if (host.startsWith('admin.')) {
      return NextResponse.rewrite(new URL('/admin/dashboard', req.url));
    }
    if (host.startsWith('student.')) {
      return NextResponse.rewrite(new URL('/student/dashboard', req.url));
    }
    // Default: Institutional Dual-Portal Gateway (src/app/page.tsx)
    return NextResponse.next();
  }

  // 3. Role-Based Routing & Route Protection via ssec_user_role Cookie
  const roleCookie = req.cookies.get('ssec_user_role')?.value;

  // --- ADMIN ROUTING ---
  if (pathname.startsWith('/admin')) {
    // /admin root entry point dispatcher
    if (pathname === '/admin') {
      if (roleCookie === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // Admin login page
    if (pathname === '/admin/login') {
      // If already authenticated as administrator, redirect to Admin Dashboard
      if (roleCookie === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      return NextResponse.next();
    }

    // Protected Admin Pages (/admin/dashboard, /admin/books, /admin/issue, etc.)
    // Rule: Students must not access Admin pages
    if (roleCookie === 'student') {
      return NextResponse.redirect(new URL('/student/dashboard', req.url));
    }
    // Rule: Unauthenticated users must be redirected to Admin Login
    if (!roleCookie) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // --- STUDENT ROUTING ---
  if (pathname.startsWith('/student')) {
    // /student root entry point dispatcher
    if (pathname === '/student') {
      if (roleCookie === 'student') {
        return NextResponse.redirect(new URL('/student/dashboard', req.url));
      }
      return NextResponse.redirect(new URL('/student/login', req.url));
    }

    // Student login page
    if (pathname === '/student/login') {
      // If already authenticated as student, redirect to Student Dashboard
      if (roleCookie === 'student') {
        return NextResponse.redirect(new URL('/student/dashboard', req.url));
      }
      return NextResponse.next();
    }

    // Protected Student Pages (/student/dashboard, /student/books, /student/profile, etc.)
    // Rule: Administrators must not access Student pages
    if (roleCookie === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    // Rule: Unauthenticated users must be redirected to Student Login
    if (!roleCookie) {
      return NextResponse.redirect(new URL('/student/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};


