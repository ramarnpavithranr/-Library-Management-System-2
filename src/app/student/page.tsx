'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import StudentLoginPage from './login/page';
import StudentDashboardPage from './dashboard/page';

export default function StudentIndexPage() {
  const { user, isLoading } = useAuth();

  // If authenticated as student, load the Student Dashboard
  if (!isLoading && user && user.role === 'student') {
    return <StudentDashboardPage />;
  }

  // By default, or when not authenticated as student, load the Student Login page
  return <StudentLoginPage />;
}
