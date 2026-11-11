'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { CollegeLogo } from '../common/CollegeLogo';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';

interface StudentTopBarProps {
  title?: string;
  subtitle?: string;
}

export const StudentTopBar: React.FC<StudentTopBarProps> = ({ title, subtitle }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { notifications } = useLibrary();

  const currentStudentId = user?.studentId || 'STU-2024-001';
  const unreadCount = notifications.filter(
    (n) => n.recipientType === 'student' && n.studentId === currentStudentId && !n.read
  ).length;

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-burgundy-100/70 px-4 sm:px-6 py-3 flex items-center justify-between">
      {/* Left: Brand / College Logo + Portal Title (No hamburger button) */}
      <div className="flex items-center gap-2.5">
        <CollegeLogo size="sm" variant="burgundy" showText={false} />
        <div>
          <h1 className="text-base sm:text-lg font-black text-charcoal-900 leading-tight">
            {title || 'Student Portal'}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-charcoal-500 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Search, Notifications & Avatar */}
      <div className="flex items-center gap-2">
        {/* Quick Search */}
        <button
          onClick={() => router.push('/student/books')}
          className="p-2.5 rounded-full text-charcoal-600 hover:text-burgundy-900 hover:bg-burgundy-50 border border-burgundy-100/60 transition-colors"
          title="Search Books"
        >
          <Search size={17} />
        </button>

        {/* Notifications */}
        <button
          onClick={() => router.push('/student/notifications')}
          className="relative p-2.5 rounded-full text-charcoal-600 hover:text-burgundy-900 hover:bg-burgundy-50 border border-burgundy-100/60 transition-colors"
          title="Notifications"
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Student Avatar (Click to go to Profile) */}
        <button
          onClick={() => router.push('/student/profile')}
          className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-full hover:bg-burgundy-50 border border-transparent hover:border-burgundy-100 transition-all ml-1"
          title="View Student Profile"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-burgundy-700 shrink-0 bg-burgundy-950 shadow-sm">
            {user?.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-burgundy-800 text-white flex items-center justify-center text-xs font-bold">
                {user?.name?.[0] || 'S'}
              </div>
            )}
          </div>
        </button>
      </div>
    </header>
  );
};
