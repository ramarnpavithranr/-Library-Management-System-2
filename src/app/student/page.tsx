'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import StudentLoginPage from './login/page';
import StudentDashboardPage from './dashboard/page';

export default function StudentPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // If already authenticated as student, redirect directly to Student Dashboard
    if (!isLoading && user && user.role === 'student') {
      router.replace('/student/dashboard');
    }
  }, [user, isLoading, router]);

  // If authenticated as student, display Student Dashboard
  if (!isLoading && user && user.role === 'student') {
    return <StudentDashboardPage />;
  }

  // Directly renders the Student Login Page
  return <StudentLoginPage />;
}
