'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminLoginPage from './login/page';
import AdminDashboardPage from './dashboard/page';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    // If already authenticated as admin, redirect directly to Admin Dashboard
    if (!isLoading && user && isAdmin) {
      router.replace('/admin/dashboard');
    }
  }, [user, isAdmin, isLoading, router]);

  // If authenticated as admin, display Admin Dashboard
  if (!isLoading && user && isAdmin) {
    return <AdminDashboardPage />;
  }

  // Directly renders the Admin Login Page
  return <AdminLoginPage />;
}
