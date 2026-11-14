'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { isStrictStudentPortal } from '@/lib/portal';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // 1. Cross-portal prevention: If this deployment is strictly the Student Portal, redirect away
    if (isStrictStudentPortal()) {
      router.replace('/student');
      return;
    }

    // 2. If not authenticated and attempting to view a protected admin page, redirect to /admin
    if (!isLoading && (!user || !isAdmin) && pathname !== '/admin/login' && pathname !== '/admin') {
      router.push('/admin');
    }
  }, [user, isAdmin, isLoading, pathname, router]);

  // If on admin or admin/login, do not wrap in the admin navigation shell
  if (pathname === '/admin' || pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F8F5F5] flex flex-col lg:flex-row">
      {/* Sidebar / Navigation */}
      <AdminNavigation />

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        {children}
      </div>
    </div>
  );
}
