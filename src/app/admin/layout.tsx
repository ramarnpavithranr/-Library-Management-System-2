'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { AdminNavigation } from '@/components/admin/AdminNavigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const normalizedPath = (pathname || '').replace(/\/+$/, '') || '/';
  const isAuthPage = normalizedPath === '/admin' || normalizedPath === '/admin/login';

  useEffect(() => {
    // If not authenticated as Admin and attempting to view a protected admin page, redirect to /admin/login
    if (!isLoading && (!user || !isAdmin) && !isAuthPage) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, isLoading, isAuthPage, router]);

  // If on admin or admin/login, do not wrap in the admin navigation shell
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Loading state: prevents flashing protected content during session hydration
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5F5] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-burgundy-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-charcoal-600">Verifying administrator authorization...</p>
        </div>
      </div>
    );
  }

  // Guard: if not authenticated as admin, return null while redirecting
  if (!user || !isAdmin) {
    return null;
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
