'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Users,
  FolderTree,
  BookCheck,
  RotateCcw,
  AlertTriangle,
  Receipt,
  CreditCard,
  BookmarkCheck,
  BookPlus,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  Search,
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { StatCard } from '@/components/common/StatCard';
import { Badge } from '@/components/common/Badge';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { stats, borrowRecords, books, categories, preBookings, memberships } = useLibrary();

  const overdueBorrows = borrowRecords.filter(r => r.status === 'overdue');
  const activeBorrows = borrowRecords.filter(r => r.status === 'borrowed');
  const pendingPreBooks = preBookings.filter(p => p.status === 'pending');
  const pendingMembers = memberships.filter(m => m.status === 'pending');

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Admin Control Center"
        subtitle="Live Library Operations & Analytics"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Welcome Banner Card (Proton Vault Dark Card style) */}
        <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-800 text-white shadow-2xl border border-burgundy-700/50 overflow-hidden">
          {/* Background ambient glow circles */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-rose-200 mb-3">
                <ShieldCheck size={14} />
                <span>Central Library System v2.4</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Good morning, Librarian Vance 👋
              </h2>
              <p className="text-xs sm:text-sm text-burgundy-100/90 mt-1.5 leading-relaxed">
                Library operations are stable. You have <strong className="text-white underline">{pendingMembers.length} membership applications</strong> and <strong className="text-white underline">{pendingPreBooks.length} pre-book requests</strong> waiting for action.
              </p>
            </div>

            {/* Quick Action Pills inside banner */}
            <div className="flex flex-wrap sm:flex-nowrap gap-2.5 shrink-0">
              <button
                onClick={() => router.push('/admin/issue')}
                className="px-4 py-3 bg-white text-burgundy-950 hover:bg-cream-100 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <BookPlus size={16} className="text-burgundy-800" />
                <span>Issue New Book</span>
              </button>
              <button
                onClick={() => router.push('/admin/return')}
                className="px-4 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/25 rounded-2xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2"
              >
                <RotateCcw size={16} className="text-rose-200" />
                <span>Return Book</span>
              </button>
            </div>
          </div>
        </div>

        {/* Primary Statistics Grid */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-extrabold tracking-wider uppercase text-charcoal-500">
              Live Library Metrics
            </h3>
            <span className="text-xs text-charcoal-400">Real-time sync</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              title="Total Books"
              value={stats.totalBooks}
              subtitle="catalogued volumes"
              icon={BookOpen}
              variant="burgundy"
              trend={{ value: '+12% MTD', isPositive: true }}
              onClick={() => router.push('/admin/books')}
            />
            <StatCard
              title="Available"
              value={stats.availableBooks}
              subtitle="ready to borrow"
              icon={BookCheck}
              variant="cream"
              trend={{ value: `${Math.round((stats.availableBooks / (stats.totalBooks || 1)) * 100)}%`, isPositive: true }}
              onClick={() => router.push('/admin/books')}
            />
            <StatCard
              title="Issued Books"
              value={stats.borrowedBooks}
              subtitle="active with students"
              icon={TrendingUp}
              variant="white"
              onClick={() => router.push('/admin/issue')}
            />
            <StatCard
              title="Overdue"
              value={stats.overdueBooks}
              subtitle="past return date"
              icon={AlertTriangle}
              variant="accent"
              trend={{ value: `${stats.overdueBooks} items`, isPositive: false }}
              onClick={() => router.push('/admin/return')}
            />
          </div>
        </div>

        {/* Secondary Detailed Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-burgundy-100 shadow-soft">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block mb-1">
              Registered Students
            </span>
            <span className="text-xl font-extrabold text-charcoal-900">{stats.totalStudents}</span>
            <p className="text-[10px] text-charcoal-500 mt-1">Active college accounts</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-burgundy-100 shadow-soft">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block mb-1">
              Categories
            </span>
            <span className="text-xl font-extrabold text-charcoal-900">{stats.totalCategories}</span>
            <p className="text-[10px] text-charcoal-500 mt-1">Academic departments</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-burgundy-100 shadow-soft">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block mb-1">
              Authors
            </span>
            <span className="text-xl font-extrabold text-charcoal-900">{stats.totalAuthors}</span>
            <p className="text-[10px] text-charcoal-500 mt-1">Unique scholars</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-burgundy-100 shadow-soft">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block mb-1">
              Returned Books
            </span>
            <span className="text-xl font-extrabold text-emerald-600">{stats.returnedBooks}</span>
            <p className="text-[10px] text-charcoal-500 mt-1">Successfully cleared</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-burgundy-100 shadow-soft">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block mb-1">
              Not Returned
            </span>
            <span className="text-xl font-extrabold text-rose-600">{stats.notReturnedBooks}</span>
            <p className="text-[10px] text-charcoal-500 mt-1">Extended missing</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-burgundy-100 shadow-soft">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block mb-1">
              Outstanding Fines
            </span>
            <span className="text-xl font-extrabold text-burgundy-900">${stats.totalFines}</span>
            <p className="text-[10px] text-charcoal-500 mt-1">Pending collection</p>
          </div>
        </div>

        {/* 2-Column Section: Pending Queues & Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Action Queue: Pre-Book & Membership Applications */}
          <div className="lg:col-span-2 space-y-5">
            {/* Pending Pre-Book Requests */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookmarkCheck size={20} className="text-burgundy-800" />
                  <h4 className="text-sm font-extrabold text-charcoal-900">
                    Pending Pre-Book Requests
                  </h4>
                </div>
                <button
                  onClick={() => router.push('/admin/pre-bookings')}
                  className="text-xs font-bold text-burgundy-800 hover:text-burgundy-950 flex items-center gap-1"
                >
                  <span>View All ({preBookings.length})</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {pendingPreBooks.length === 0 ? (
                <div className="py-6 text-center text-xs text-charcoal-400 bg-burgundy-50/40 rounded-2xl">
                  No pending reservations in queue.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingPreBooks.slice(0, 3).map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-2xl bg-[#FAF7F7] border border-burgundy-100/70 flex items-center justify-between gap-3 hover:bg-burgundy-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-13 rounded-lg overflow-hidden bg-burgundy-100 shrink-0 border border-burgundy-200">
                          {req.bookCover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={req.bookCover} alt={req.bookTitle} className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-charcoal-900 truncate">
                            {req.bookTitle}
                          </p>
                          <p className="text-[11px] text-charcoal-600 truncate">
                            Student: <span className="font-semibold">{req.studentName}</span> ({req.rollNumber})
                          </p>
                          <span className="text-[10px] text-charcoal-400">
                            Requested: {req.requestDate}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => router.push('/admin/pre-bookings')}
                        className="px-3 py-1.5 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-xl text-xs font-bold shadow-sm shrink-0"
                      >
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Currently Borrowed Books Table */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} className="text-burgundy-800" />
                  <h4 className="text-sm font-extrabold text-charcoal-900">
                    Currently Issued Books
                  </h4>
                </div>
                <button
                  onClick={() => router.push('/admin/issue')}
                  className="text-xs font-bold text-burgundy-800 hover:text-burgundy-950 flex items-center gap-1"
                >
                  <span>Issue More</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="space-y-2.5">
                {activeBorrows.map((record) => (
                  <div
                    key={record.id}
                    className="p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-50 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-charcoal-900 truncate">{record.bookTitle}</p>
                      <p className="text-[11px] text-charcoal-500">
                        {record.studentName} • Roll {record.rollNumber}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="burgundy" size="sm">Due {record.dueDate}</Badge>
                      <p className="text-[10px] text-charcoal-400 mt-0.5">Issued: {record.issueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Category Distribution & Membership Queue */}
          <div className="space-y-5">
            {/* Membership Applications Quick Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-burgundy-800" />
                  <h4 className="text-xs font-extrabold text-charcoal-900 uppercase tracking-wider">
                    Digital Pass Requests
                  </h4>
                </div>
                {pendingMembers.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {pendingMembers.length}
                  </span>
                )}
              </div>

              {pendingMembers.length === 0 ? (
                <p className="text-xs text-charcoal-400 py-3 text-center">
                  All membership cards processed!
                </p>
              ) : (
                <div className="space-y-2.5">
                  {pendingMembers.slice(0, 2).map((m) => (
                    <div key={m.id} className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/60">
                      <p className="text-xs font-bold text-charcoal-900">{m.studentName}</p>
                      <p className="text-[11px] text-charcoal-600">{m.department} • {m.rollNumber}</p>
                      <button
                        onClick={() => router.push('/admin/membership')}
                        className="mt-2 w-full py-1.5 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-xl text-xs font-bold shadow-sm"
                      >
                        Review & Issue Digital Card
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category Statistics */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FolderTree size={18} className="text-burgundy-800" />
                  <h4 className="text-xs font-extrabold text-charcoal-900 uppercase tracking-wider">
                    Category Distribution
                  </h4>
                </div>
                <button
                  onClick={() => router.push('/admin/categories')}
                  className="text-xs font-bold text-burgundy-800 hover:text-burgundy-950"
                >
                  Manage
                </button>
              </div>

              <div className="space-y-3">
                {categories.slice(0, 5).map((cat) => {
                  const percentage = Math.min(100, Math.round((cat.bookCount / (stats.totalBooks || 1)) * 100));
                  return (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-charcoal-800">{cat.name}</span>
                        <span className="font-mono text-charcoal-500">{cat.bookCount} books</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-burgundy-50 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-burgundy-700 to-rose-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Overdue / Fine Alert Card */}
            {overdueBorrows.length > 0 && (
              <div className="p-4 rounded-3xl bg-rose-50 border border-rose-200 shadow-soft">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-1">
                  <AlertTriangle size={16} />
                  <span>{overdueBorrows.length} Overdue Items Requiring Follow-Up</span>
                </div>
                <p className="text-[11px] text-rose-700 mb-3">
                  Automatic overdue fines are accumulating at $5/day. Check fine manager to issue receipts.
                </p>
                <button
                  onClick={() => router.push('/admin/fines')}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Open Fine Management
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

