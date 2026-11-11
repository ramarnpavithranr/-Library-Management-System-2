'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminLoginPage from './login/page';
import AdminDashboardPage from './dashboard/page';

export default function AdminIndexPage() {
  const { user, isAdmin, isLoading } = useAuth();

  // If authenticated as admin, load the Admin Dashboard
  if (!isLoading && user && isAdmin) {
    return <AdminDashboardPage />;
  }

  // By default, or when not authenticated as admin, load the Admin Login page
  return <AdminLoginPage />;
}
