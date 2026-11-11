'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminLoginPage from './login/page';
import AdminDashboardPage from './dashboard/page';

export default function AdminIndexPage() {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F7]">
        <div className="w-8 h-8 border-4 border-burgundy-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not authenticated as admin, load the Admin Login page
  if (!user || !isAdmin) {
    return <AdminLoginPage />;
  }

  // If authenticated as admin, load the Admin Dashboard
  return <AdminDashboardPage />;
}
