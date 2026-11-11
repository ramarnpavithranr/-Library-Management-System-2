'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { StudentNavigation } from '@/components/student/StudentNavigation';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If on student/login, do not wrap in the student navigation shell
  if (pathname === '/student/login') {
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

