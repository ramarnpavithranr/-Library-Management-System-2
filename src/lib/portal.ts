/**
 * Portal Separation & Routing Detection Utility
 * Determines whether the current deployment / browser environment is configured
 * as the Admin Portal or the Student Portal.
 */

export type PortalType = 'admin' | 'student';

export function getPortalType(): PortalType {
  // 1. Explicit Environment Variable (configured in Vercel project settings)
  const envType = (process.env.NEXT_PUBLIC_PORTAL_TYPE || '').toLowerCase().trim();
  if (envType === 'admin') return 'admin';
  if (envType === 'student') return 'student';

  // 2. Client-side Hostname / Subdomain Detection (e.g. admin.domain.com, library-admin.vercel.app)
  if (typeof window !== 'undefined') {
    const host = (window.location.hostname || '').toLowerCase();
    if (host.startsWith('admin.') || host.includes('admin-') || host.includes('-admin')) {
      return 'admin';
    }
    if (host.startsWith('student.') || host.includes('student-') || host.includes('-student')) {
      return 'student';
    }
  }

  // 3. Default fallback
  return 'student';
}

/**
 * Returns true only if the environment or hostname strictly locks this deployment to Admin
 */
export function isStrictAdminPortal(): boolean {
  const envType = (process.env.NEXT_PUBLIC_PORTAL_TYPE || '').toLowerCase().trim();
  if (envType === 'admin') return true;

  if (typeof window !== 'undefined') {
    const host = (window.location.hostname || '').toLowerCase();
    return host.startsWith('admin.') || host.includes('admin-') || host.includes('-admin');
  }

  return false;
}

/**
 * Returns true only if the environment or hostname strictly locks this deployment to Student
 */
export function isStrictStudentPortal(): boolean {
  const envType = (process.env.NEXT_PUBLIC_PORTAL_TYPE || '').toLowerCase().trim();
  if (envType === 'student') return true;

  if (typeof window !== 'undefined') {
    const host = (window.location.hostname || '').toLowerCase();
    return host.startsWith('student.') || host.includes('student-') || host.includes('-student');
  }

  return false;
}
