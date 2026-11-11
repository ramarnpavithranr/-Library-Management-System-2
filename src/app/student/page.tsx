'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import StudentLoginPage from './login/page';
import StudentDashboardPage from './dashboard/page';

export default function StudentIndexPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F7]">
        <div className="w-8 h-8 border-4 border-burgundy-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not authenticated as student, load the Student Login page
  if (!user || user.role !== 'student') {
    return <StudentLoginPage />;
  }

  // If authenticated as student, load the Student Dashboard
  return <StudentDashboardPage />;
}
