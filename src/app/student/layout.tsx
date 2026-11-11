'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { StudentNavigation } from '@/components/student/StudentNavigation';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated and attempting to view a protected student page, redirect to /student
    if (!isLoading && (!user || user.role !== 'student') && pathname !== '/student/login' && pathname !== '/student') {
      router.push('/student');
    }
  }, [user, isLoading, pathname, router]);

  // If on student/login, or if on /student while not authenticated, do not wrap in navigation shell
  if (pathname === '/student/login' || (pathname === '/student' && (!user || user.role !== 'student'))) {
    return <>{children}</>;
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
