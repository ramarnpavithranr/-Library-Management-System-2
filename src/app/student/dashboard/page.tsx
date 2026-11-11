'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  CreditCard,
  BookmarkCheck,
  AlertTriangle,
  Receipt,
  Search,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle2,
  BookMarked,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { StudentTopBar } from '@/components/student/StudentTopBar';
import { StatCard } from '@/components/common/StatCard';
import { Badge } from '@/components/common/Badge';
import { SearchInput } from '@/components/common/SearchInput';
import { DigitalMembershipCard } from '@/components/student/DigitalMembershipCard';
import { ENV } from '@/config/env';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { books, categories, borrowRecords, preBookings, memberships, fines } = useLibrary();

  const currentStudentId = user?.studentId || '';
  const currentStudentName = user?.name || 'Student';

  // Student specific data
  const myBorrows = borrowRecords.filter((r) => r.studentId === currentStudentId && r.status === 'borrowed');
  const myOverdue = borrowRecords.filter((r) => r.studentId === currentStudentId && r.status === 'overdue');
  const myPreBooks = preBookings.filter((p) => p.studentId === currentStudentId);
  const myMembership = memberships.find((m) => m.studentId === currentStudentId);
  const myFines = fines.filter((f) => f.studentId === currentStudentId && f.status === 'unpaid');
  const totalMyFine = myFines.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="flex-1 flex flex-col">
      <StudentTopBar
        title="Student Portal"
        subtitle="Central Academic Library"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
        {/* Top Greeting Header (Reference Phone 2) */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-burgundy-800 uppercase tracking-wider block mb-0.5">
              Welcome back
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight leading-tight">
              {currentStudentName.split(' ')[0]} 👋
            </h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Roll No: <span className="font-mono font-semibold text-charcoal-700">{user?.rollNumber || '22CS045'}</span> • {user?.department?.split('&')[0] || 'Computer Science'}
            </p>
          </div>

          {/* Quick Membership Pill */}
          <div
            onClick={() => router.push('/student/membership')}
            className="cursor-pointer bg-white px-3.5 py-2 rounded-2xl border border-burgundy-100 shadow-soft hover:shadow-soft-lg transition-all flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-xl bg-burgundy-800 text-white flex items-center justify-center">
              <CreditCard size={16} />
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-[10px] text-charcoal-400 font-bold uppercase block">
                Digital Pass
              </span>
              <span className="text-xs font-bold text-charcoal-900">
                {myMembership?.status === 'approved'
                  ? 'Active Pass'
                  : myMembership?.status === 'pending'
                  ? 'Pass Pending'
                  : 'Apply Pass'}
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar with filter toggle (Reference Phone 2) */}
        <div>
          <SearchInput
            value=""
            onChange={() => router.push('/student/books')}
            placeholder="Search 1,200+ titles, authors, textbooks..."
            showFilterBtn={true}
            onFilterClick={() => router.push('/student/books')}
          />
        </div>

        {/* Hero Stats Grid (Reference Phone 2) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="BOOKS"
            value={myBorrows.length}
            subtitle="active books"
            icon={BookMarked}
            variant="burgundy"
            trend={{ value: `${Math.max(0, ENV.MAX_BOOKS_PER_STUDENT - myBorrows.length)} quota left`, isPositive: true }}
            onClick={() => router.push('/student/my-books')}
          />
          <StatCard
            title="Library Score"
            value="98%"
            subtitle="Very Strong"
            icon={ShieldCheck}
            variant="cream"
            trend={{ value: 'Gold Tier', isPositive: true }}
            onClick={() => router.push('/student/profile')}
          />
          <StatCard
            title="Overdue"
            value={myOverdue.length}
            subtitle="past return date"
            icon={AlertTriangle}
            variant={myOverdue.length > 0 ? 'accent' : 'white'}
            trend={{ value: myOverdue.length > 0 ? `$${totalMyFine} due` : 'Clear', isPositive: myOverdue.length === 0 }}
            onClick={() => router.push('/student/fines')}
          />
          <StatCard
            title="PRE BOOK"
            value={myPreBooks.filter((p) => p.status === 'pending' || p.status === 'approved').length}
            subtitle="held or queued"
            icon={BookmarkCheck}
            variant="white"
            onClick={() => router.push('/student/pre-bookings')}
          />
        </div>

        {/* Quick Access Horizontal Categories (Reference Phone 2) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-charcoal-500">
              Quick Categories
            </h3>
            <button
              onClick={() => router.push('/student/categories')}
              className="text-xs font-bold text-burgundy-800 hover:text-burgundy-950 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat.id}
                onClick={() => router.push(`/student/books?category=${encodeURIComponent(cat.name)}`)}
                className="px-3.5 py-2 rounded-2xl bg-white border border-burgundy-100/90 shadow-soft hover:shadow-soft-lg hover:border-burgundy-300 text-charcoal-800 text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 active:scale-95"
              >
                <div className="w-2 h-2 rounded-full bg-burgundy-700" />
                <span>{cat.name}</span>
                <span className="text-[10px] text-charcoal-400 font-mono">({cat.bookCount})</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Section: Active Borrowed Books & Digital Pass Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Borrowed Books List (2 Cols) */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookMarked size={18} className="text-burgundy-800" />
                  <h4 className="text-sm font-extrabold text-charcoal-900">
                    Currently Checked Out ({myBorrows.length})
                  </h4>
                </div>
                <button
                  onClick={() => router.push('/student/my-books')}
                  className="text-xs font-bold text-burgundy-800 hover:text-burgundy-950 flex items-center gap-1"
                >
                  <span>Details</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {myBorrows.length === 0 ? (
                <div className="py-8 text-center text-xs text-charcoal-400 bg-burgundy-50/40 rounded-2xl">
                  You have no active book loans. Browse catalogue to borrow.
                </div>
              ) : (
                <div className="space-y-3">
                  {myBorrows.map((r) => (
                    <div
                      key={r.id}
                      className="p-3.5 rounded-2xl bg-[#FAF7F7] border border-burgundy-50 flex items-center justify-between gap-3 hover:bg-burgundy-50/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-14 rounded-lg overflow-hidden bg-burgundy-950 shrink-0 border border-burgundy-100">
                          {r.bookCover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.bookCover} alt={r.bookTitle} className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-charcoal-900 truncate">
                            {r.bookTitle}
                          </h5>
                          <p className="text-[11px] text-charcoal-500 mt-0.5">
                            Issued: {r.issueDate}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-burgundy-900 font-semibold">
                            <Clock size={11} className="text-burgundy-700" />
                            <span>Return due by {r.dueDate}</span>
                          </div>
                        </div>
                      </div>

                      <Badge variant="burgundy" size="sm">Active Loan</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pre-Booking Reservations Status */}
            {myPreBooks.length > 0 && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookmarkCheck size={18} className="text-burgundy-800" />
                    <h4 className="text-sm font-extrabold text-charcoal-900">
                      My Pre-Book Requests
                    </h4>
                  </div>
                  <button
                    onClick={() => router.push('/student/pre-bookings')}
                    className="text-xs font-bold text-burgundy-800 hover:text-burgundy-950"
                  >
                    View Status
                  </button>
                </div>

                <div className="space-y-2.5">
                  {myPreBooks.slice(0, 2).map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-50 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-charcoal-900 truncate">{p.bookTitle}</p>
                        <p className="text-[11px] text-charcoal-500">Requested on {p.requestDate}</p>
                      </div>
                      <Badge
                        variant={p.status === 'approved' ? 'success' : p.status === 'pending' ? 'warning' : 'neutral'}
                        size="sm"
                        dot
                      >
                        {p.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Digital Membership Pass Preview */}
          <div className="space-y-5">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-charcoal-900">
                  Digital Library Pass
                </h4>
                <button
                  onClick={() => router.push('/student/membership')}
                  className="text-xs font-bold text-burgundy-800 hover:text-burgundy-950"
                >
                  Manage
                </button>
              </div>

              <DigitalMembershipCard card={myMembership} />
            </div>

            {/* Overdue alert if any */}
            {myOverdue.length > 0 && (
              <div className="p-4 rounded-3xl bg-rose-50 border border-rose-200 shadow-soft">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-1">
                  <AlertTriangle size={16} />
                  <span>{myOverdue.length} Overdue Book Notice</span>
                </div>
                <p className="text-[11px] text-rose-700 mb-3">
                  You have books past due date. Total fine accrued: ${totalMyFine}. Please return at circulation desk counter 1.
                </p>
                <button
                  onClick={() => router.push('/student/fines')}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  View Fine Statement
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

