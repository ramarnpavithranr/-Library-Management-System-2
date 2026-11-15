'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Layers,
  CheckCircle2,
  Lock,
  Compass,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { getPortalType } from '@/lib/portal';
import { CollegeLogo } from '@/components/common/CollegeLogo';
import { ENV } from '@/config/env';
import AdminPage from './admin/page';
import StudentPage from './student/page';

export default function RootHomePage() {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  const { settings } = useLibrary();
  const portalType = getPortalType();

  // If environment or subdomain strictly dictates one portal, route immediately
  useEffect(() => {
    if (isLoading) return;
    if (portalType === 'admin') {
      router.replace(isAdmin ? '/admin/dashboard' : '/admin');
    } else if (portalType === 'student') {
      router.replace(user?.role === 'student' ? '/student/dashboard' : '/student');
    }
  }, [portalType, user, isAdmin, isLoading, router]);

  // Direct render if strict domain isolation is active
  if (portalType === 'admin') {
    return <AdminPage />;
  }
  if (portalType === 'student') {
    return <StudentPage />;
  }

  // Unified Portal Landing Page with distinct access buttons and unique URLs
  const collegeName = settings?.collegeName || ENV.COLLEGE_NAME || 'Sree Sakthi Engineering College';
  const location = settings?.location !== undefined ? settings.location : (ENV.COLLEGE_LOCATION || 'Coimbatore');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF4F5] via-[#F8EEEE] to-[#F1E5E7] flex flex-col justify-between selection:bg-burgundy-900 selection:text-white">
      {/* Top Banner Navigation */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 flex items-center justify-between border-b border-burgundy-100/60">
        <div className="flex items-center gap-3">
          <CollegeLogo size="md" variant="burgundy" />
        </div>

        {/* Quick Session Status if user is already logged in */}
        {!isLoading && user && (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs text-charcoal-500">
              Active Session: <strong className="text-burgundy-950 font-bold">{user.name}</strong> ({isAdmin ? 'Admin' : 'Student'})
            </span>
            <button
              onClick={() => router.push(isAdmin ? '/admin/dashboard' : '/student/dashboard')}
              className="px-3.5 py-1.5 bg-burgundy-900 hover:bg-burgundy-800 text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
            >
              <span>Go to Dashboard</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </header>

      {/* Main Hero & Portal Selection */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col items-center flex-1 justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-burgundy-100/80 border border-burgundy-200/80 rounded-full text-xs font-bold text-burgundy-950 shadow-sm animate-fade-in">
            <Sparkles size={14} className="text-burgundy-700" />
            <span>Central Smart Library Portal Gateway</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-charcoal-900 tracking-tight leading-tight">
            Welcome to <span className="text-burgundy-900">{collegeName}</span>
          </h1>

          <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-xl mx-auto">
            Choose your designated portal below to proceed with authorized institutional access. Both portals are live and accessible via distinct secure entry points.
          </p>
        </div>

        {/* Distinct Portal Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {/* CARD 1: ADMIN CONTROL PORTAL */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-burgundy-100 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            {/* Top accent stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-burgundy-900 via-rose-600 to-burgundy-800" />

            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-burgundy-50 border border-burgundy-100 flex items-center justify-center text-burgundy-900 shadow-inner group-hover:scale-105 transition-transform">
                  <ShieldCheck size={26} />
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 bg-burgundy-50 text-burgundy-900 rounded-full border border-burgundy-100">
                  /admin
                </span>
              </div>

              <div className="mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-burgundy-700">
                  Authorized Personnel
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-charcoal-900 tracking-tight">
                  Administrator Portal
                </h2>
              </div>

              <p className="text-xs text-charcoal-500 mb-5 leading-relaxed">
                Dedicated management control for librarians and campus administration.
              </p>

              {/* Feature Checklist */}
              <ul className="space-y-2 text-xs text-charcoal-600 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-burgundy-700 shrink-0 mt-0.5" />
                  <span>Catalogue acquisition, book records & copies</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-burgundy-700 shrink-0 mt-0.5" />
                  <span>Issue and return circulation desks with barcode scanning</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-burgundy-700 shrink-0 mt-0.5" />
                  <span>Student membership pass verification & approvals</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-burgundy-700 shrink-0 mt-0.5" />
                  <span>Pre-book holds management & pickup scheduling</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-burgundy-700 shrink-0 mt-0.5" />
                  <span>Institution settings, logo uploads & fine policies</span>
                </li>
              </ul>
            </div>

            {/* Direct Access Button */}
            <div className="pt-4 border-t border-burgundy-50">
              <button
                onClick={() => router.push('/admin')}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-800 hover:from-burgundy-900 hover:to-burgundy-950 text-white rounded-2xl text-xs font-bold transition-all shadow-burgundy-glow flex items-center justify-center gap-2 group-hover:gap-3 active:scale-95"
              >
                <Lock size={15} />
                <span>Enter Admin Portal</span>
                <ArrowRight size={15} />
              </button>
              <div className="text-center mt-2">
                <span className="text-[10px] text-charcoal-400">
                  Direct URL: <code className="text-burgundy-900 font-mono font-bold">/admin/login</code>
                </span>
              </div>
            </div>
          </div>

          {/* CARD 2: STUDENT DIGITAL PORTAL */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-burgundy-100 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            {/* Top accent stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-burgundy-800" />

            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-cream-100/80 border border-amber-200/80 flex items-center justify-center text-burgundy-900 shadow-inner group-hover:scale-105 transition-transform">
                  <GraduationCap size={26} />
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 bg-amber-50 text-amber-900 rounded-full border border-amber-200">
                  /student
                </span>
              </div>

              <div className="mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Enrolled Students
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-charcoal-900 tracking-tight">
                  Student Library Portal
                </h2>
              </div>

              <p className="text-xs text-charcoal-500 mb-5 leading-relaxed">
                Campus library hub for students, digital passes, catalogue browsing and textbook reservations.
              </p>

              {/* Feature Checklist */}
              <ul className="space-y-2 text-xs text-charcoal-600 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Search thousands of academic and engineering textbooks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Official Digital Membership Pass with 3D flip & barcode</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Pre-book high-demand titles before shelf stock runs out</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Track borrowed books, due dates & overdue notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Touch-optimized responsive experience on Android & mobile</span>
                </li>
              </ul>
            </div>

            {/* Direct Access Button */}
            <div className="pt-4 border-t border-burgundy-50">
              <button
                onClick={() => router.push('/student')}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-burgundy-800 via-rose-700 to-burgundy-900 hover:from-burgundy-900 hover:to-burgundy-800 text-white rounded-2xl text-xs font-bold transition-all shadow-burgundy-glow flex items-center justify-center gap-2 group-hover:gap-3 active:scale-95"
              >
                <BookOpen size={15} />
                <span>Enter Student Portal</span>
                <ArrowRight size={15} />
              </button>
              <div className="text-center mt-2">
                <span className="text-[10px] text-charcoal-400">
                  Direct URL: <code className="text-burgundy-900 font-mono font-bold">/student/login</code>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-t border-burgundy-100/60 text-center text-xs text-charcoal-500">
        <p className="font-semibold text-charcoal-700">
          {collegeName} • {location ? `${location} • ` : ''}{ENV.LIBRARY_NAME || 'Central Smart Library'}
        </p>
        <p className="text-[11px] text-charcoal-400 mt-1">
          {ENV.APP_VERSION || 'v2.4 Smart Release'} • High Availability Dual-Portal Deployment
        </p>
      </footer>
    </div>
  );
}
