/**
 * Portal Separation & Routing Detection Utility
 * Determines whether the current deployment / browser environment is configured
 * as the Admin Portal or the Student Portal.
 */

export type PortalType = 'admin' | 'student' | 'unified';

export function getPortalType(): PortalType {
  // 1. Explicit Environment Variable (configured in Vercel/Netlify project settings)
  const envType = (process.env.NEXT_PUBLIC_PORTAL_TYPE || '').toLowerCase().trim();
  if (envType === 'admin') return 'admin';
  if (envType === 'student') return 'student';

  // 2. Strict Subdomain Detection (e.g. admin.sreesakthi.edu.in, student.sreesakthi.edu.in)
  if (typeof window !== 'undefined') {
    const host = (window.location.hostname || '').toLowerCase();
    if (host.startsWith('admin.')) {
      return 'admin';
    }
    if (host.startsWith('student.')) {
      return 'student';
    }
  }

  // 3. Default: Unified Dual-Portal Deployment with Landing Gateway
  return 'unified';
}

/**
 * Returns true only if the environment strictly locks this deployment to Admin
 */
export function isStrictAdminPortal(): boolean {
  return (process.env.NEXT_PUBLIC_PORTAL_TYPE || '').toLowerCase().trim() === 'admin';
}

/**
 * Returns true only if the environment strictly locks this deployment to Student
 */
export function isStrictStudentPortal(): boolean {
  return (process.env.NEXT_PUBLIC_PORTAL_TYPE || '').toLowerCase().trim() === 'student';
}
