'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  CheckCircle,
  AlertTriangle,
  Search,
  DollarSign,
  User,
  BookOpen,
  Calendar,
  Sparkles,
  Clock,
  History,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { SearchInput } from '@/components/common/SearchInput';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { FineRecord } from '@/types';
import confetti from 'canvas-confetti';
import { ENV } from '@/config/env';

export default function AdminFinesPage() {
  const { fines, payFine, addFine, students, stats, borrowRecords, refreshBookIssues } = useLibrary();

  useEffect(() => {
    refreshBookIssues();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: students[0]?.studentId || '',
    studentName: students[0]?.name || '',
    rollNumber: students[0]?.rollNumber || '',
    bookTitle: '',
    amount: 50,
    reason: 'Damaged Spine / Late return',
    dueDate: todayStr,
    issuedDate: todayStr,
    status: 'unpaid' as 'unpaid' | 'paid',
  });

  // 1. TODAY'S DUE BOOKS
  const todaysDueBooks = borrowRecords.filter((r) => {
    return r.status !== 'returned' && !r.returnDate && r.dueDate === todayStr;
  });

  // 2. OVERDUE BOOKS
  const overdueBooks = borrowRecords
    .filter((r) => {
      if (r.status === 'returned' || !!r.returnDate) return false;
      return r.dueDate && r.dueDate < todayStr;
    })
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

  // 3. COMBINED FINE RECORDS (fines table + overdue/late return borrow records)
  const fineHistoryItems = [
    ...fines.map((f) => ({
      id: f.id,
      studentName: f.studentName,
      rollNumber: f.rollNumber,
      bookName: f.bookTitle,
      issueDate: f.issuedDate || 'N/A',
      dueDate: f.dueDate || 'N/A',
      returnDate: f.status === 'paid' ? (f.paidDate || 'Paid & Cleared') : 'Pending Payment',
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
          reason: 'Overdue circulation return fine',
        };
      }),
  ];

  // 4. SUMMARY TOTALS
  const totalFinesRecorded = fineHistoryItems.length;
  const paidFinesCount = fineHistoryItems.filter((f) => f.status === 'paid').length;
  const unpaidFinesCount = fineHistoryItems.filter((f) => f.status === 'unpaid').length;
  const totalPendingFineAmount = fineHistoryItems
    .filter((f) => f.status === 'unpaid')
    .reduce((sum, f) => sum + f.fineAmount, 0);

  const filteredHistoryItems = fineHistoryItems.filter((f) => {
    const q = historySearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      f.studentName.toLowerCase().includes(q) ||
      f.bookName.toLowerCase().includes(q) ||
      f.rollNumber.toLowerCase().includes(q) ||
      f.reason.toLowerCase().includes(q);
    const matchesStatus = historyFilter === 'all' || f.status === historyFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredFines = fines.filter((f) => {
    const matchesSearch =
      f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePay = (fineId: string) => {
    payFine(fineId);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10B981', '#6E1129'],
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bookTitle || formData.amount <= 0) {
      alert('Please enter valid book title and amount.');
      return;
    }
    const student = students.find((s) => s.studentId === formData.studentId);
    addFine({
      ...formData,
      studentName: student?.name || formData.studentName,
      rollNumber: student?.rollNumber || formData.rollNumber,
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar
        title="Fine & Penalty Management"
        subtitle="Late Return Penalties, Due Date Tracking & Comprehensive Fine History"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* ========================================================================= */}
        {/* 1. FOUR KPI SUMMARY CARDS                                                 */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Fines Recorded */}
          <div className="p-5 rounded-3xl bg-white border border-burgundy-100 shadow-soft">
            <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block mb-1">
              Total Fines Recorded
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-charcoal-900">{totalFinesRecorded}</span>
              <span className="text-xs text-charcoal-500">incidents</span>
            </div>
          </div>

          {/* Card 2: Paid Fines */}
          <div className="p-5 rounded-3xl bg-white border border-burgundy-100 shadow-soft">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              Paid Fines
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600">{paidFinesCount}</span>
              <span className="text-xs text-emerald-700 font-medium">cleared</span>
            </div>
          </div>

          {/* Card 3: Unpaid Fines */}
          <div className="p-5 rounded-3xl bg-white border border-burgundy-100 shadow-soft">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block mb-1">
              Unpaid Fines
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-600">{unpaidFinesCount}</span>
              <span className="text-xs text-rose-600 font-medium">pending</span>
            </div>
          </div>

          {/* Card 4: Total Pending Fine Amount */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-burgundy-950 via-burgundy-900 to-burgundy-800 text-white shadow-2xl border border-burgundy-700/50">
            <span className="text-[11px] font-bold text-rose-200 uppercase tracking-wider block mb-1">
              Total Pending Fine Amount
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">${totalPendingFineAmount}</span>
              <span className="text-xs text-rose-200">outstanding dues</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TODAY'S DUE BOOKS SECTION                                              */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-burgundy-50">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <Calendar size={16} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-charcoal-900">
                    Today&apos;s Due Books
                  </h3>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {todaysDueBooks.length} Books Due Today ({todayStr})
                  </span>
                </div>
                <p className="text-xs text-charcoal-500">
                  Books scheduled to be returned to the library by end of day today
                </p>
              </div>
            </div>
          </div>

          {todaysDueBooks.length === 0 ? (
            <div className="py-8 text-center text-xs text-charcoal-400 bg-[#FAF7F7] rounded-2xl border border-dashed border-burgundy-100">
              No student borrowed books are scheduled for return today ({todayStr}).
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-burgundy-100">
              <table className="w-full text-left text-xs text-charcoal-700">
                <thead className="bg-[#FAF7F7] border-b border-burgundy-100 text-[11px] font-extrabold uppercase tracking-wider text-charcoal-600">
                  <tr>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-3">Student ID</th>
                    <th className="py-3 px-4">Book Name</th>
                    <th className="py-3 px-3">Issue Date</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-burgundy-50">
                  {todaysDueBooks.map((r) => (
                    <tr key={r.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-charcoal-900">{r.studentName}</td>
                      <td className="py-3 px-3 font-mono font-medium">{r.rollNumber || r.studentId}</td>
                      <td className="py-3 px-4 font-semibold text-charcoal-900">{r.bookTitle}</td>
                      <td className="py-3 px-3 text-charcoal-600">{r.issueDate}</td>
                      <td className="py-3 px-3 font-bold text-amber-800">{r.dueDate}</td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant="warning" size="sm" dot>Due Today</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 3. OVERDUE BOOKS SECTION (WITH FINE AMOUNT & DAYS OVERDUE)                */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-rose-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-burgundy-50">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <AlertTriangle size={16} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-charcoal-900">
                    Overdue Books
                  </h3>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                    {overdueBooks.length} Overdue Loans Outstanding
                  </span>
                </div>
                <p className="text-xs text-charcoal-500">
                  Active borrowed books exceeding the 14-day standard academic loan period
                </p>
              </div>
            </div>
          </div>

          {overdueBooks.length === 0 ? (
            <div className="py-8 text-center text-xs text-charcoal-400 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-emerald-800 font-medium">
              Zero overdue books! All currently active loans are within their permitted lending schedule.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-burgundy-100">
              <table className="w-full text-left text-xs text-charcoal-700">
                <thead className="bg-[#FAF7F7] border-b border-burgundy-100 text-[11px] font-extrabold uppercase tracking-wider text-charcoal-600">
                  <tr>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Book Name</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-3">Days Overdue</th>
                    <th className="py-3 px-3">Fine Amount</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-burgundy-50">
                  {overdueBooks.map((r) => (
                    <tr key={r.id} className="hover:bg-rose-50/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-charcoal-900">{r.studentName}</div>
                        <div className="text-[10px] font-mono text-charcoal-400">{r.rollNumber || r.studentId}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-charcoal-900">{r.bookTitle}</td>
                      <td className="py-3 px-3 font-mono text-rose-700 font-bold">{r.dueDate}</td>
                      <td className="py-3 px-3 font-bold text-rose-800">
                        {r.daysOverdue} {r.daysOverdue === 1 ? 'day' : 'days'} late
                      </td>
                      <td className="py-3 px-3 font-mono font-extrabold text-rose-700">
                        ${r.accruedFine}.00
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant="danger" size="sm" dot>Overdue & Accruing</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 4. FINE MANAGEMENT HISTORY UNDERNEATH (FULL SUPABASE/MEMORY FINE LOG)      */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-burgundy-100 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-burgundy-50">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-burgundy-800 text-white flex items-center justify-center shadow-sm shrink-0">
                <History size={16} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-charcoal-900">
                    Fine Management History
                  </h3>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-burgundy-50 text-burgundy-900 border border-burgundy-100">
                    Total Records: {fineHistoryItems.length}
                  </span>
                </div>
                <p className="text-xs text-charcoal-500">
                  Comprehensive audit trail of late return penalties and manual fine assessments
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="py-2.5 px-4 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-2xl text-xs font-bold shadow-burgundy-glow flex items-center gap-1.5 active:scale-95 self-start sm:self-auto cursor-pointer"
            >
              <Plus size={15} />
              <span>Assess Manual Fine</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-3 text-charcoal-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search history by student, book, roll no..."
                className="w-full text-xs pl-9 pr-4 py-2 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20 text-charcoal-900"
              />
            </div>

            <div className="flex items-center gap-1 bg-[#FAF7F7] p-1 rounded-2xl border border-burgundy-100">
              <button
                type="button"
                onClick={() => setHistoryFilter('all')}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                  historyFilter === 'all'
                    ? 'bg-burgundy-800 text-white shadow-sm'
                    : 'text-charcoal-600 hover:text-burgundy-950'
                }`}
              >
                All ({fineHistoryItems.length})
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('unpaid')}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                  historyFilter === 'unpaid'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-charcoal-600 hover:text-rose-800'
                }`}
              >
                Unpaid ({unpaidFinesCount})
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('paid')}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                  historyFilter === 'paid'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-charcoal-600 hover:text-emerald-800'
                }`}
              >
                Paid ({paidFinesCount})
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-burgundy-100">
            <table className="w-full text-left text-xs text-charcoal-700">
              <thead className="bg-[#FAF7F7] border-b border-burgundy-100 text-[11px] font-extrabold uppercase tracking-wider text-charcoal-600">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Book Name</th>
                  <th className="py-3 px-3">Issue Date</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3">Return Date</th>
                  <th className="py-3 px-3">Fine Amount</th>
                  <th className="py-3 px-3 text-center">Payment Status</th>
                  <th className="py-3 px-4">Action / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-burgundy-50">
                {filteredHistoryItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-charcoal-400">
                      No fine records match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredHistoryItems.map((f) => {
                    const isUnpaid = f.status === 'unpaid';

                    return (
                      <tr key={f.id} className="hover:bg-burgundy-50/40 transition-colors">
                        {/* Student Name */}
                        <td className="py-3 px-4 font-bold text-charcoal-900">
                          <div>{f.studentName}</div>
                          {f.rollNumber && (
                            <div className="text-[10px] font-mono text-charcoal-400">{f.rollNumber}</div>
                          )}
                        </td>

                        {/* Book Name */}
                        <td className="py-3 px-4 font-semibold text-charcoal-900 max-w-[200px] truncate" title={f.bookName}>
                          {f.bookName}
                        </td>

                        {/* Issue Date */}
                        <td className="py-3 px-3 whitespace-nowrap text-charcoal-600">
                          {f.issueDate}
                        </td>

                        {/* Due Date */}
                        <td className="py-3 px-3 whitespace-nowrap text-charcoal-600 font-medium">
                          {f.dueDate}
                        </td>

                        {/* Return Date */}
                        <td className="py-3 px-3 whitespace-nowrap text-charcoal-700">
                          {f.returnDate}
                        </td>

                        {/* Fine Amount */}
                        <td className="py-3 px-3 font-mono font-bold text-rose-700">
                          ${f.fineAmount}.00
                        </td>

                        {/* Payment Status */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {isUnpaid ? (
                            <Badge variant="danger" size="sm" dot>Unpaid</Badge>
                          ) : (
                            <Badge variant="success" size="sm" dot>Paid</Badge>
                          )}
                        </td>

                        {/* Action / Reason */}
                        <td className="py-3 px-4">
                          {isUnpaid && f.id.startsWith('fn-') ? (
                            <button
                              onClick={() => handlePay(f.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold shadow-sm transition-all"
                            >
                              Record Payment
                            </button>
                          ) : (
                            <span className="text-[11px] text-charcoal-500 truncate max-w-[150px] block" title={f.reason}>
                              {f.reason}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ASSESS MANUAL FINE MODAL */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Assess Manual Penalty"
          subtitle="Record fine for damaged, missing, or special loan violations"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Select Student *
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => {
                  const student = students.find((s) => s.studentId === e.target.value);
                  setFormData({
                    ...formData,
                    studentId: e.target.value,
                    studentName: student?.name || '',
                    rollNumber: student?.rollNumber || '',
                  });
                }}
                className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.studentId}>
                    {s.name} ({s.rollNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Book Title *
              </label>
              <input
                type="text"
                required
                value={formData.bookTitle}
                onChange={(e) => setFormData({ ...formData, bookTitle: e.target.value })}
                placeholder="e.g. Clean Architecture"
                className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Penalty Amount ($) *
              </label>
              <input
                type="number"
                min="5"
                step="5"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Reason for Fine *
              </label>
              <input
                type="text"
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g. Water damage to pages 40-55"
                className="w-full text-xs font-medium p-3 rounded-2xl bg-[#FAF7F7] border border-burgundy-100 focus:outline-none focus:ring-2 focus:ring-burgundy-700/20"
              />
            </div>

            <div className="pt-3 border-t border-burgundy-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-charcoal-600 hover:bg-charcoal-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-2xl text-xs font-bold shadow-burgundy-glow"
              >
                Submit Fine Assessment
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}

