'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Download,
  Calendar,
  BookOpen,
  Users,
  RotateCcw,
  Receipt,
  CreditCard,
  Printer,
  Sparkles,
  History,
  AlertTriangle,
  BookmarkCheck,
  CheckCircle,
  FileText,
  Search,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { StatCard } from '@/components/common/StatCard';
import { Badge } from '@/components/common/Badge';
import { ENV } from '@/config/env';

export default function AdminReportsPage() {
  const {
    stats,
    books,
    categories,
    borrowRecords,
    fines,
    memberships,
    preBookings,
    refreshBookIssues,
    refreshMemberships,
    refreshPreBookings,
  } = useLibrary();

  useEffect(() => {
    refreshBookIssues();
    refreshMemberships();
    refreshPreBookings();
  }, []);

  const [reportType, setReportType] = useState<
    'overview' | 'issues' | 'returns' | 'prebookings' | 'memberships' | 'fines' | 'categories'
  >('overview');

  const [searchFilter, setSearchFilter] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. TODAY'S DUE BOOKS
  const todaysDueBooks = borrowRecords.filter((r) => {
    return r.status !== 'returned' && !r.returnDate && r.dueDate === todayStr;
  });

  // 2. OVERDUE STUDENTS & LOANS
  const overdueLoans = borrowRecords
    .filter((r) => !r.returnDate && r.status !== 'returned' && r.dueDate && r.dueDate < todayStr)
    .map((r) => {
      const dueTime = new Date(r.dueDate).getTime();
      const nowTime = new Date(todayStr).getTime();
      const diffDays = Math.max(1, Math.ceil((nowTime - dueTime) / (1000 * 60 * 60 * 24)));
      const fineAmount = diffDays * ENV.FINE_PER_DAY;
      return {
        ...r,
        daysOverdue: diffDays,
        accruedFine: fineAmount,
      };
    });

  // 3. RETURNED RECORDS
  const returnedRecords = borrowRecords.filter(
    (r) => r.status === 'returned' || !!r.returnDate
  );

  // 4. UNIFIED FINE RECORDS
  const unifiedFines = [
    ...fines.map((f) => ({
      id: f.id,
      studentName: f.studentName,
      rollNumber: f.rollNumber,
      bookName: f.bookTitle,
      issueDate: f.issuedDate || 'N/A',
      dueDate: f.dueDate || 'N/A',
      returnDate: f.status === 'paid' ? (f.paidDate || 'Paid & Cleared') : 'Pending',
      fineAmount: f.amount,
      status: f.status as 'paid' | 'unpaid',
      reason: f.reason,
    })),
    ...borrowRecords
      .filter((r) => (r.fineAmount && r.fineAmount > 0) || (r.returnDate && r.dueDate && r.returnDate > r.dueDate))
      .map((r) => {
        const isPaid = r.fineStatus === 'paid' || r.status === 'returned';
        return {
          id: `br-fine-${r.id}`,
          studentName: r.studentName,
          rollNumber: r.rollNumber,
          bookName: r.bookTitle,
          issueDate: r.issueDate,
          dueDate: r.dueDate,
          returnDate: r.returnDate || 'Pending Return',
          fineAmount: r.fineAmount || 0,
          status: (isPaid ? 'paid' : 'unpaid') as 'paid' | 'unpaid',
          reason: 'Overdue return penalty',
        };
      }),
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Report Analysis & Intelligence"
        subtitle="Consolidated Cross-Module Analytics, Circulation Histories & Compliance Audits"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Control Bar: Tab Switcher & Export */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-burgundy-100 shadow-soft overflow-x-auto">
            <button
              onClick={() => { setReportType('overview'); setSearchFilter(''); }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all ${
                reportType === 'overview'
                  ? 'bg-burgundy-800 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-burgundy-900'
              }`}
            >
              Overview Analysis
            </button>
            <button
              onClick={() => { setReportType('issues'); setSearchFilter(''); }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all ${
                reportType === 'issues'
                  ? 'bg-burgundy-800 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-burgundy-900'
              }`}
            >
              Issue History ({borrowRecords.length})
            </button>
            <button
              onClick={() => { setReportType('returns'); setSearchFilter(''); }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all ${
                reportType === 'returns'
                  ? 'bg-burgundy-800 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-burgundy-900'
              }`}
            >
              Return History ({returnedRecords.length})
            </button>
            <button
              onClick={() => { setReportType('prebookings'); setSearchFilter(''); }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all ${
                reportType === 'prebookings'
                  ? 'bg-burgundy-800 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-burgundy-900'
              }`}
            >
              Pre-Bookings ({preBookings.length})
            </button>
            <button
              onClick={() => { setReportType('memberships'); setSearchFilter(''); }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all ${
                reportType === 'memberships'
                  ? 'bg-burgundy-800 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-burgundy-900'
              }`}
            >
              Memberships ({memberships.length})
            </button>
            <button
              onClick={() => { setReportType('fines'); setSearchFilter(''); }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all ${
                reportType === 'fines'
                  ? 'bg-burgundy-800 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-burgundy-900'
              }`}
            >
              Fines & Overdue ({unifiedFines.length})
            </button>
            <button
              onClick={() => { setReportType('categories'); setSearchFilter(''); }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all ${
                reportType === 'categories'
                  ? 'bg-burgundy-800 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-burgundy-900'
              }`}
            >
              Inventory ({books.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-2.5 px-4 bg-white border border-burgundy-200 hover:bg-cream-100 text-charcoal-800 rounded-full text-xs font-bold shadow-soft flex items-center gap-2 active:scale-95 cursor-pointer shrink-0"
            >
              <Printer size={15} />
              <span>Print Official Report</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW COMPREHENSIVE EXECUTIVE SUMMARY                           */}
        {/* ========================================================================= */}
        {reportType === 'overview' && (
          <div className="space-y-6">
            {/* 6 Executive Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-3xl bg-white border border-burgundy-100 shadow-soft">
                <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block">Total Issued</span>
                <span className="text-2xl font-extrabold text-charcoal-900 mt-1 block">{borrowRecords.length}</span>
                <span className="text-[10px] text-charcoal-500">all-time issues</span>
              </div>
              <div className="p-4 rounded-3xl bg-white border border-burgundy-100 shadow-soft">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Total Returned</span>
                <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{returnedRecords.length}</span>
                <span className="text-[10px] text-emerald-700 font-medium">books check-in</span>
              </div>
              <div className="p-4 rounded-3xl bg-white border border-burgundy-100 shadow-soft">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Pre-Bookings</span>
                <span className="text-2xl font-extrabold text-amber-600 mt-1 block">{preBookings.length}</span>
                <span className="text-[10px] text-charcoal-500">reservations</span>
              </div>
              <div className="p-4 rounded-3xl bg-white border border-burgundy-100 shadow-soft">
                <span className="text-[10px] font-bold text-burgundy-900 uppercase tracking-wider block">Memberships</span>
                <span className="text-2xl font-extrabold text-burgundy-950 mt-1 block">{memberships.length}</span>
                <span className="text-[10px] text-charcoal-500">registered cards</span>
              </div>
              <div className="p-4 rounded-3xl bg-white border border-burgundy-100 shadow-soft">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Today&apos;s Due</span>
                <span className="text-2xl font-extrabold text-amber-700 mt-1 block">{todaysDueBooks.length}</span>
                <span className="text-[10px] text-charcoal-500">due {todayStr}</span>
              </div>
              <div className="p-4 rounded-3xl bg-gradient-to-br from-burgundy-950 to-burgundy-800 text-white shadow-2xl border border-burgundy-700/50">
                <span className="text-[10px] font-bold text-rose-200 uppercase tracking-wider block">Overdue Loans</span>
                <span className="text-2xl font-extrabold text-white mt-1 block">{overdueLoans.length}</span>
                <span className="text-[10px] text-rose-200">action required</span>
              </div>
            </div>

            {/* Visual Circulation Ratio Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-burgundy-100 shadow-soft">
              <h3 className="text-sm font-extrabold text-charcoal-900 mb-1">
                Circulation Status Breakdown
              </h3>
              <p className="text-xs text-charcoal-500 mb-6">
                Real-time tracking of available catalogue copies, active student borrowings, overdue loans, and returns.
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-charcoal-700 mb-1">
                    <span>Available in Stacks ({stats.availableBooks})</span>
                    <span>{Math.round((stats.availableBooks / (stats.totalBooks || 1)) * 100)}%</span>
                  </div>
                  <div className="h-3 w-full bg-burgundy-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(stats.availableBooks / (stats.totalBooks || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-charcoal-700 mb-1">
                    <span>Active Issued Books ({stats.borrowedBooks})</span>
                    <span>{Math.round((stats.borrowedBooks / (stats.totalBooks || 1)) * 100)}%</span>
                  </div>
                  <div className="h-3 w-full bg-burgundy-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-burgundy-700 rounded-full"
                      style={{ width: `${(stats.borrowedBooks / (stats.totalBooks || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-charcoal-700 mb-1">
                    <span>Overdue Returns ({overdueLoans.length})</span>
                    <span>{Math.round((overdueLoans.length / (stats.totalBooks || 1)) * 100)}%</span>
                  </div>
                  <div className="h-3 w-full bg-burgundy-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${(overdueLoans.length / (stats.totalBooks || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Two Side-by-Side Sections: Today's Due Books & Overdue Students */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SECTION: TODAY'S DUE BOOKS */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-burgundy-50">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      <Calendar size={14} />
                    </span>
                    <h4 className="text-sm font-extrabold text-charcoal-900">
                      Today&apos;s Due Books ({todaysDueBooks.length})
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-charcoal-500">{todayStr}</span>
                </div>

                {todaysDueBooks.length === 0 ? (
                  <p className="text-xs text-charcoal-400 py-6 text-center">
                    No books scheduled for return today.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {todaysDueBooks.map((b) => (
                      <div key={b.id} className="p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-50 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-charcoal-900 truncate max-w-[200px]">{b.bookTitle}</p>
                          <p className="text-[11px] text-charcoal-600">{b.studentName} ({b.rollNumber})</p>
                        </div>
                        <Badge variant="warning" size="sm" dot>Due Today</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION: OVERDUE STUDENTS */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-rose-200 shadow-soft space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-rose-50">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      <AlertTriangle size={14} />
                    </span>
                    <h4 className="text-sm font-extrabold text-charcoal-900">
                      Overdue Students ({overdueLoans.length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-rose-700 font-bold">$5/day penalty</span>
                </div>

                {overdueLoans.length === 0 ? (
                  <p className="text-xs text-emerald-700 py-6 text-center font-medium">
                    Zero overdue students. All borrowers compliant!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {overdueLoans.map((b) => (
                      <div key={b.id} className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-charcoal-900 truncate max-w-[180px]">{b.studentName}</p>
                          <p className="text-[11px] text-charcoal-600 truncate max-w-[180px]">{b.bookTitle}</p>
                          <p className="text-[10px] text-rose-700 font-bold">Due: {b.dueDate} ({b.daysOverdue} days late)</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-rose-700 text-xs">${b.accruedFine}.00</span>
                          <Badge variant="danger" size="sm" dot>Overdue</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: BOOK ISSUE HISTORY REPORT                                          */}
        {/* ========================================================================= */}
        {reportType === 'issues' && (
          <div className="bg-white rounded-3xl p-6 border border-burgundy-100 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-burgundy-50">
              <div>
                <h4 className="text-sm font-extrabold text-charcoal-900">Book Issue History Report</h4>
                <p className="text-xs text-charcoal-500">Live data extracted from Supabase book_issues table</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-2.5 text-charcoal-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter issues..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-burgundy-100">
              <table className="w-full text-left text-xs text-charcoal-700">
                <thead className="bg-[#FAF7F7] text-charcoal-600 font-extrabold text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Book Name</th>
                    <th className="p-3">Book ID</th>
                    <th className="p-3">Issue Date</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-burgundy-50">
                  {borrowRecords
                    .filter((r) => {
                      const q = searchFilter.toLowerCase();
                      return !q || r.studentName.toLowerCase().includes(q) || r.bookTitle.toLowerCase().includes(q);
                    })
                    .map((r) => (
                      <tr key={r.id} className="hover:bg-burgundy-50/40">
                        <td className="p-3 font-bold text-charcoal-900">{r.studentName}</td>
                        <td className="p-3 font-mono">{r.rollNumber || r.studentId}</td>
                        <td className="p-3 font-semibold">{r.bookTitle}</td>
                        <td className="p-3 font-mono font-bold text-burgundy-900">#{r.bookId}</td>
                        <td className="p-3">{r.issueDate}</td>
                        <td className="p-3">{r.dueDate}</td>
                        <td className="p-3 text-center">
                          <Badge variant={r.status === 'returned' ? 'success' : r.status === 'overdue' ? 'danger' : 'warning'} size="sm" dot>
                            {r.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-charcoal-500 truncate max-w-[150px]">{r.remarks || 'Standard Loan'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: BOOK RETURN HISTORY REPORT                                         */}
        {/* ========================================================================= */}
        {reportType === 'returns' && (
          <div className="bg-white rounded-3xl p-6 border border-burgundy-100 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-burgundy-50">
              <div>
                <h4 className="text-sm font-extrabold text-charcoal-900">Book Return History Report</h4>
                <p className="text-xs text-charcoal-500">Inventory check-in logs and restored available copies</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-2.5 text-charcoal-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter returns..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-burgundy-100">
              <table className="w-full text-left text-xs text-charcoal-700">
                <thead className="bg-[#FAF7F7] text-charcoal-600 font-extrabold text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Book Name</th>
                    <th className="p-3">Issue Date</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3">Actual Return Date</th>
                    <th className="p-3 text-center">Return Status</th>
                    <th className="p-3">Fine / Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-burgundy-50">
                  {returnedRecords
                    .filter((r) => {
                      const q = searchFilter.toLowerCase();
                      return !q || r.studentName.toLowerCase().includes(q) || r.bookTitle.toLowerCase().includes(q);
                    })
                    .map((r) => (
                      <tr key={r.id} className="hover:bg-burgundy-50/40">
                        <td className="p-3 font-bold text-charcoal-900">{r.studentName} ({r.rollNumber})</td>
                        <td className="p-3 font-semibold">{r.bookTitle}</td>
                        <td className="p-3">{r.issueDate}</td>
                        <td className="p-3">{r.dueDate}</td>
                        <td className="p-3 font-bold text-emerald-800">{r.returnDate || 'Returned'}</td>
                        <td className="p-3 text-center">
                          <Badge variant="success" size="sm" dot>Returned</Badge>
                        </td>
                        <td className="p-3 text-charcoal-500">
                          {r.fineAmount && r.fineAmount > 0 ? (
                            <span className="text-rose-700 font-bold">${r.fineAmount} Assessed</span>
                          ) : (
                            <span className="text-emerald-700">On Time</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PRE-BOOKING HISTORY REPORT                                         */}
        {/* ========================================================================= */}
        {reportType === 'prebookings' && (
          <div className="bg-white rounded-3xl p-6 border border-burgundy-100 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-burgundy-50">
              <div>
                <h4 className="text-sm font-extrabold text-charcoal-900">Pre-Booking Reservations Report</h4>
                <p className="text-xs text-charcoal-500">All student book reservations, hold deadlines, and fulfillment outcomes</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-burgundy-100">
              <table className="w-full text-left text-xs text-charcoal-700">
                <thead className="bg-[#FAF7F7] text-charcoal-600 font-extrabold text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Book Name</th>
                    <th className="p-3">Book ID</th>
                    <th className="p-3">Pre-Booking Date</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Hold / Approval Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-burgundy-50">
                  {preBookings.map((p) => (
                    <tr key={p.id} className="hover:bg-burgundy-50/40">
                      <td className="p-3 font-bold text-charcoal-900">{p.studentName}</td>
                      <td className="p-3 font-mono">{p.rollNumber || p.studentId}</td>
                      <td className="p-3 font-semibold">{p.bookTitle}</td>
                      <td className="p-3 font-mono font-bold text-burgundy-900">#{p.bookId}</td>
                      <td className="p-3">{p.requestDate}</td>
                      <td className="p-3 text-center">
                        <Badge
                          variant={
                            p.status === 'approved' ? 'success' : p.status === 'rejected' ? 'danger' : 'warning'
                          }
                          size="sm"
                          dot
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="p-3">{p.pickupDeadline || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: MEMBERSHIP REGISTRY REPORT                                         */}
        {/* ========================================================================= */}
        {reportType === 'memberships' && (
          <div className="bg-white rounded-3xl p-6 border border-burgundy-100 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-burgundy-50">
              <div>
                <h4 className="text-sm font-extrabold text-charcoal-900">Student Membership Registry Report</h4>
                <p className="text-xs text-charcoal-500">Live records from Supabase membership table</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-burgundy-100">
              <table className="w-full text-left text-xs text-charcoal-700">
                <thead className="bg-[#FAF7F7] text-charcoal-600 font-extrabold text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Membership ID</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Start Date</th>
                    <th className="p-3">End Date</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-burgundy-50">
                  {memberships.map((m) => (
                    <tr key={m.id} className="hover:bg-burgundy-50/40">
                      <td className="p-3 font-bold text-charcoal-900">{m.studentName}</td>
                      <td className="p-3 font-mono">{m.rollNumber || m.studentId}</td>
                      <td className="p-3 font-mono font-bold text-burgundy-900">{m.membershipId}</td>
                      <td className="p-3">{m.year || 'Student Member'}</td>
                      <td className="p-3">{m.issuedDate || m.appliedDate || 'N/A'}</td>
                      <td className="p-3">{m.expiryDate || 'Active Term'}</td>
                      <td className="p-3 text-center">
                        <Badge variant={m.status === 'approved' ? 'success' : 'warning'} size="sm" dot>
                          {m.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: FINES & OVERDUE REPORT                                             */}
        {/* ========================================================================= */}
        {reportType === 'fines' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard
                title="Total Outstanding Fines"
                value={`$${unifiedFines.filter((f) => f.status === 'unpaid').reduce((s, f) => s + f.fineAmount, 0)}`}
                subtitle="awaiting student settlement"
                variant="burgundy"
                icon={Receipt}
              />
              <StatCard
                title="Total Settled Revenue"
                value={`$${unifiedFines.filter((f) => f.status === 'paid').reduce((s, f) => s + f.fineAmount, 0)}`}
                subtitle="credited to library fund"
                variant="cream"
                icon={RotateCcw}
              />
            </div>

            <div className="bg-white rounded-3xl p-6 border border-burgundy-100 shadow-soft space-y-4">
              <h4 className="text-sm font-extrabold text-charcoal-900 pb-2 border-b border-burgundy-50">
                Consolidated Fine Management Ledger
              </h4>

              <div className="overflow-x-auto rounded-2xl border border-burgundy-100">
                <table className="w-full text-left text-xs text-charcoal-700">
                  <thead className="bg-[#FAF7F7] text-charcoal-600 font-extrabold text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Book Name</th>
                      <th className="p-3">Issue Date</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3">Return Date</th>
                      <th className="p-3">Fine Amount</th>
                      <th className="p-3 text-center">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-burgundy-50">
                    {unifiedFines.map((f) => (
                      <tr key={f.id} className="hover:bg-burgundy-50/40">
                        <td className="p-3 font-bold text-charcoal-900">{f.studentName} ({f.rollNumber})</td>
                        <td className="p-3 font-semibold">{f.bookName}</td>
                        <td className="p-3">{f.issueDate}</td>
                        <td className="p-3">{f.dueDate}</td>
                        <td className="p-3">{f.returnDate}</td>
                        <td className="p-3 font-mono font-bold text-rose-700">${f.fineAmount}.00</td>
                        <td className="p-3 text-center">
                          <Badge variant={f.status === 'paid' ? 'success' : 'danger'} size="sm" dot>
                            {f.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: CATEGORY INVENTORY REPORT                                          */}
        {/* ========================================================================= */}
        {reportType === 'categories' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-3xl p-5 border border-burgundy-100 shadow-soft flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-extrabold text-charcoal-900">{cat.name}</h4>
                    <p className="text-xs text-charcoal-500 mt-0.5">{cat.description}</p>
                    <span className="text-[11px] font-mono text-burgundy-800 font-semibold mt-2 inline-block">
                      Stock: {cat.bookCount} registered copies
                    </span>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-burgundy-50 text-burgundy-800 flex items-center justify-center font-extrabold text-base border border-burgundy-100 shrink-0">
                    {cat.bookCount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

