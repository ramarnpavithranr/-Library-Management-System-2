'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { StudentNavigation } from '@/components/student/StudentNavigation';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, isStudent, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const normalizedPath = (pathname || '').replace(/\/+$/, '') || '/';
  const isAuthPage = normalizedPath === '/student' || normalizedPath === '/student/login';

  useEffect(() => {
    // If not authenticated as Student and attempting to view a protected student page, redirect to /student/login
    if (!isLoading && (!user || !isStudent) && !isAuthPage) {
      router.push('/student/login');
    }
  }, [user, isStudent, isLoading, isAuthPage, router]);

  // If on student or student/login, do not wrap in navigation shell
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Loading state: prevents flashing protected content during session hydration
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5F5] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-charcoal-600">Verifying student authorization...</p>
        </div>
      </div>
    );
  }

  // Guard: if not authenticated as student, return null while redirecting
  if (!user || !isStudent) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8F5F5] flex flex-col lg:flex-row">
      {/* Sidebar / Navigation */}
      <StudentNavigation />

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        {children}
      </div>
    </div>
  );
}
