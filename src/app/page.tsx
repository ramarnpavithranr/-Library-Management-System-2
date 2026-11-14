'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getPortalType } from '@/lib/portal';
import AdminPage from './admin/page';
import StudentPage from './student/page';

export default function RootHomePage() {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  const portalType = getPortalType();

  useEffect(() => {
    if (isLoading) return;
    if (portalType === 'admin') {
      router.replace(isAdmin ? '/admin/dashboard' : '/admin');
    } else {
      router.replace(user?.role === 'student' ? '/student/dashboard' : '/student');
    }
  }, [portalType, user, isAdmin, isLoading, router]);

  // Direct render without portal-selection screen
  if (portalType === 'admin') {
    return <AdminPage />;
  }

  return <StudentPage />;
}
