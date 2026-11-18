'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user && isAdmin) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/admin/login');
      }
    }
  }, [user, isAdmin, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#F8F5F5] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-burgundy-800 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
