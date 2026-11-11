'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, GraduationCap, ArrowRight, BookOpen, Clock, MapPin, Sparkles } from 'lucide-react';
import { CollegeLogo } from '@/components/common/CollegeLogo';
import { useAuth } from '@/context/AuthContext';

export default function RootHomePage() {
  const { user, isAdmin, isStudent } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F8] via-[#FAF3F3] to-[#F5ECEE] flex flex-col justify-between text-charcoal-900">
      {/* Header bar */}
      <header className="border-b border-burgundy-100/70 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <CollegeLogo size="sm" variant="burgundy" />
          <div className="flex items-center gap-2">
            <Link
              href="/student"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-burgundy-900 bg-burgundy-50 hover:bg-burgundy-100 transition-colors"
            >
              Student Portal
            </Link>
            <Link
              href="/admin"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-white bg-burgundy-900 hover:bg-burgundy-950 transition-colors"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main hero and portal selection */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-4xl w-full flex flex-col items-center text-center">
          {/* Animated institutional badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-burgundy-100/80 text-burgundy-900 text-xs font-bold mb-4 border border-burgundy-200 shadow-sm animate-scale-in">
            <Sparkles size={14} className="text-burgundy-700" />
            <span>Digital Library Management System • Anna University Affiliated</span>
          </div>

          <CollegeLogo size="xl" orientation="vertical" animated />

          <h1 className="text-2xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight mt-4">
            Central Library Portal
          </h1>
          <p className="text-sm sm:text-base text-charcoal-600 max-w-xl mt-2 mb-8">
            Access thousands of academic textbooks, reference journals, project papers, and research databases.
          </p>

          {/* Active session notification if already logged in */}
          {user && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4 max-w-md w-full text-left shadow-sm">
              <div className="text-xs">
                <p className="font-bold text-emerald-900">Signed in as {user.name}</p>
                <p className="text-emerald-700 text-[11px]">Role: {isAdmin ? 'Administrator' : 'Student'}</p>
              </div>
              <Link
                href={isAdmin ? '/admin' : '/student'}
                className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition-colors shrink-0"
              >
                Go to Dashboard
              </Link>
            </div>
          )}

          {/* Dual Portal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl text-left">
            {/* Student Portal Card */}
            <Link
              href="/student"
              className="group relative bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-burgundy-100 hover:border-burgundy-300 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-burgundy-800 to-rose-600" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-burgundy-50 border border-burgundy-100 flex items-center justify-center text-burgundy-800 mb-4 group-hover:scale-105 transition-transform">
                  <GraduationCap size={26} />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-burgundy-100/70 text-burgundy-800 text-[11px] font-bold mb-2">
                  <span>Student Access</span>
                </div>
                <h3 className="text-xl font-bold text-charcoal-900 group-hover:text-burgundy-900 transition-colors">
                  Student Portal
                </h3>
                <p className="text-xs text-charcoal-500 mt-2 leading-relaxed">
                  Search library books, check current issue status, reserve titles, track dues, and manage borrowing history.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-burgundy-50 flex items-center justify-between text-xs font-bold text-burgundy-800 group-hover:text-burgundy-950">
                <span>Enter Student Portal</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Admin Portal Card */}
            <Link
              href="/admin"
              className="group relative bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-burgundy-100 hover:border-burgundy-300 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-burgundy-900 to-amber-600" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-burgundy-50 border border-burgundy-100 flex items-center justify-center text-burgundy-800 mb-4 group-hover:scale-105 transition-transform">
                  <ShieldCheck size={26} />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/80 text-amber-900 text-[11px] font-bold mb-2">
                  <span>Staff & Faculty</span>
                </div>
                <h3 className="text-xl font-bold text-charcoal-900 group-hover:text-burgundy-900 transition-colors">
                  Administrator Portal
                </h3>
                <p className="text-xs text-charcoal-500 mt-2 leading-relaxed">
                  Librarian control desk for book catalog management, issue/return circulation, student credentials, and analytics.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-burgundy-50 flex items-center justify-between text-xs font-bold text-burgundy-800 group-hover:text-burgundy-950">
                <span>Enter Admin Portal</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          {/* Quick info badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 text-xs text-charcoal-500">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-burgundy-700" />
              <span>Library Hours: 8:30 AM – 6:00 PM (Mon–Sat)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-burgundy-700" />
              <span>Campus Central Block, 2nd Floor</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-burgundy-100/70 bg-white/60 py-4 text-center text-xs text-charcoal-500">
        <p>© {new Date().getFullYear()} Sree Sakthi Engineering College • Central Library Management System</p>
      </footer>
    </div>
  );
}
